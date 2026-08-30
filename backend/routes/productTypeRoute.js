import express from 'express';
import adminAuth from '../middleware/adminAuth.js';
import {
    addProductCategory,
    addProductType,
    deleteProductCategory,
    deleteProductType,
    getProductTypes,
    updateProductCategory,
    updateProductType,
} from '../controllers/productController.js';

const productTypeRouter = express.Router();

productTypeRouter.get('/list', getProductTypes);
productTypeRouter.post('/add', adminAuth, addProductType);
productTypeRouter.post('/edit', adminAuth, updateProductType);
productTypeRouter.post('/delete', adminAuth, deleteProductType);
productTypeRouter.post('/category/add', adminAuth, addProductCategory);
productTypeRouter.post('/category/edit', adminAuth, updateProductCategory);
productTypeRouter.post('/category/delete', adminAuth, deleteProductCategory);

export default productTypeRouter;
