import express from 'express';
import adminAuth from '../middleware/adminAuth.js';
import { addProductType, deleteProductType, getProductTypes, updateProductType } from '../controllers/productController.js';

const productTypeRouter = express.Router();

productTypeRouter.get('/list', getProductTypes);
productTypeRouter.post('/add', adminAuth, addProductType);
productTypeRouter.post('/edit', adminAuth, updateProductType);
productTypeRouter.post('/delete', adminAuth, deleteProductType);

export default productTypeRouter;
