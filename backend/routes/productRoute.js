import express from 'express';
import { addProduct, listProduct, listProductAdmin, removeProduct, shuffleProducts, singleProduct, updateProduct } from '../controllers/productController.js';
import upload from '../middleware/multer.js';
import adminAuth from '../middleware/adminAuth.js';

const productRouter = express.Router();

productRouter.post('/add', adminAuth, upload.fields([
    { name: 'image1', maxCount: 1 },
    { name: 'image2', maxCount: 1 },
    { name: 'image3', maxCount: 1 },
    { name: 'image4', maxCount: 1 },
    { name: 'image5', maxCount: 1 },
    { name: 'image6', maxCount: 1 },
    { name: 'image7', maxCount: 1 },
    { name: 'image8', maxCount: 1 },
    { name: 'image9', maxCount: 1 },
    { name: 'image10', maxCount: 1 }
]), addProduct);

productRouter.post('/remove', adminAuth, removeProduct);
productRouter.post('/single', singleProduct);
productRouter.post('/update', adminAuth, updateProduct);
productRouter.post('/shuffle', adminAuth, shuffleProducts);
productRouter.get('/list', listProduct);
productRouter.get('/admin-list', adminAuth, listProductAdmin);

export default productRouter;