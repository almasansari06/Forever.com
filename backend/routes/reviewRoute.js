import express from 'express';
import { addReview, getReviewsByProduct } from '../controllers/reviewController.js';

const reviewRouter = express.Router();

reviewRouter.post('/add', addReview);
reviewRouter.post('/list', getReviewsByProduct);

export default reviewRouter;
