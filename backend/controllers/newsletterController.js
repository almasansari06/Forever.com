import newsletterSubscriberModel from '../models/newsletterSubscriberModel.js';
import productModel from '../models/productModel.js';
import { sendNewsletterUpdateEmail, sendNewsletterWelcomeEmail } from '../utils/emailService.js';

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const subscribe = async (req, res) => {
    try {
        const email = String(req.body.email || '').trim().toLowerCase();
        if (!emailPattern.test(email)) {
            return res.status(400).json({ success: false, message: 'Please enter a valid email address.' });
        }

        const subscriber = await newsletterSubscriberModel.findOneAndUpdate(
            { email },
            { $set: { active: true }, $setOnInsert: { email, subscribedAt: new Date() } },
            { new: true, upsert: true, setDefaultsOnInsert: true }
        );

        const mailResult = await sendNewsletterWelcomeEmail({ to: subscriber.email });
        if (mailResult.error) {
            return res.status(502).json({ success: false, message: 'Subscription saved, but the welcome email could not be sent.' });
        }

        return res.json({ success: true, message: 'You are subscribed. Welcome to Forever!' });
    } catch (error) {
        console.error('Newsletter subscription failed:', error.message);
        return res.status(500).json({ success: false, message: 'Unable to subscribe right now. Please try again.' });
    }
};

const sendUpdates = async (req, res) => {
    const cronSecret = process.env.CRON_SECRET;
    const suppliedSecret = req.headers['x-cron-secret'] || req.headers.authorization?.replace(/^Bearer\s+/i, '');
    if (!cronSecret || suppliedSecret !== cronSecret) {
        return res.status(401).json({ success: false, message: 'Unauthorized.' });
    }

    try {
        const products = await productModel.find({}).sort({ date: -1 }).limit(100);
        const subscribers = await newsletterSubscriberModel.find({ active: true });
        if (products.length === 0 || subscribers.length === 0) {
            return res.json({ success: true, sent: 0, message: 'No products or subscribers to update.' });
        }

        let sent = 0;
        for (const subscriber of subscribers) {
            const newProducts = products.filter((product) => (
                !subscriber.lastUpdateAt || new Date(product.date) > subscriber.lastUpdateAt
            ));
            if (newProducts.length === 0) continue;

            const selectedProducts = newProducts
                .sort(() => Math.random() - 0.5)
                .slice(0, 4)
                .map((product) => ({
                    id: product._id.toString(),
                    name: product.name,
                    price: product.price,
                    image: Array.isArray(product.image) ? product.image[0] : '',
                }));
            const result = await sendNewsletterUpdateEmail({ to: subscriber.email, products: selectedProducts });
            if (result.success) {
                subscriber.lastUpdateAt = new Date();
                await subscriber.save();
                sent += 1;
            }
        }

        return res.json({ success: true, sent, subscribers: subscribers.length });
    } catch (error) {
        console.error('Newsletter update failed:', error.message);
        return res.status(500).json({ success: false, message: 'Newsletter update failed.' });
    }
};

export { subscribe, sendUpdates };
