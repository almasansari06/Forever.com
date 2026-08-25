import mongoose from 'mongoose';

const newsletterSubscriberSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    subscribedAt: { type: Date, default: Date.now },
    lastUpdateAt: { type: Date, default: null },
    active: { type: Boolean, default: true },
});

const newsletterSubscriberModel = mongoose.models.newsletterSubscriber ||
    mongoose.model('newsletterSubscriber', newsletterSubscriberSchema);

export default newsletterSubscriberModel;
