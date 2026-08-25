import reviewModel from '../models/reviewModel.js';
import userModel from '../models/userModel.js';

const addReview = async (req, res) => {
  try {
    const { productId, rating, comment, images } = req.body;

    if (!productId || !comment || !rating) {
      return res.json({ success: false, message: 'Product, comment and rating are required.' });
    }

    const normalizedRating = Number(rating);
    if (normalizedRating < 1 || normalizedRating > 5) {
      return res.json({ success: false, message: 'Rating must be between 1 and 5.' });
    }

    const user = await userModel.findById(req.userId).select('name');

    const review = await reviewModel.create({
      productId,
      userName: user?.name || 'Customer',
      rating: normalizedRating,
      comment: String(comment).trim(),
      images: Array.isArray(images) ? images : []
    });

    res.json({ success: true, message: 'Review submitted successfully.', review });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

const getReviewsByProduct = async (req, res) => {
  try {
    const { productId } = req.body;

    if (!productId) {
      return res.json({ success: false, message: 'Product ID is required.' });
    }

    const reviews = await reviewModel.find({ productId }).sort({ createdAt: -1 });
    res.json({ success: true, reviews });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

export { addReview, getReviewsByProduct };
