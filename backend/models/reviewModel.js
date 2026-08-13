import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  productId: { type: String, required: true, index: true },
  userName: { type: String, default: 'Customer' },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, required: true, trim: true },
  images: { type: Array, default: [] },
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

const reviewModel = mongoose.models.review || mongoose.model('review', reviewSchema);

export default reviewModel;
