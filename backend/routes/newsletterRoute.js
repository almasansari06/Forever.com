import express from 'express';
import { sendUpdates, subscribe } from '../controllers/newsletterController.js';

const newsletterRouter = express.Router();

newsletterRouter.post('/subscribe', subscribe);
newsletterRouter.get('/send-updates', sendUpdates);

export default newsletterRouter;
