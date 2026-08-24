import express from 'express';
import { addReview, getReviewsByProduct } from '../controllers/reviewController.js';
import authUser from '../middleware/auth.js';

const reviewRouter = express.Router();

reviewRouter.post('/add', authUser, addReview);
reviewRouter.post('/list', getReviewsByProduct);

export default reviewRouter;
