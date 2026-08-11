import { v2 as cloudinary } from "cloudinary";
import productModel from "../models/productModel.js";
import productTypeModel from "../models/productTypeModel.js";

// Function for add product
const addProduct = async (req, res) => {
    try {
        const { name, description, price, category, subCategory, sizes, bestseller, newArrival } = req.body;

        const normalizedSubCategory = String(subCategory || '').trim();
        if (!normalizedSubCategory) {
            return res.json({ success: false, message: 'Product type is required.' });
        }

        const existingType = await productTypeModel.findOne({ name: { $regex: new RegExp(`^${normalizedSubCategory.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') } });
        if (!existingType) {
            await productTypeModel.create({ name: normalizedSubCategory });
        }

        const uploadedFiles = Object.values(req.files || {}).flat();
        const images = uploadedFiles.filter((item) => item && item.path);

        let imagesUrl = await Promise.all(
            images.map(async (item) => {
                let result = await cloudinary.uploader.upload(item.path, { resource_type: 'image' });
                return result.secure_url;
            })
        );

        const productData = {
            name,
            description,
            category,
            price: Number(price),
            subCategory: normalizedSubCategory,
            bestseller: bestseller === "true" ? true : false,
            newArrival: newArrival === "true" ? true : false,
            sizes: JSON.parse(sizes),
            image: imagesUrl,
            date: Date.now()
        };

        const product = new productModel(productData);
        await product.save();

        res.json({ success: true, message: "Product Added" });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// Function for list all products
const listProduct = async (req, res) => {
    try {
        const products = await productModel.find({});
        res.json({ success: true, products });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// Function for removing product
const removeProduct = async (req, res) => {
    try {
        const deletedProduct = await productModel.findByIdAndDelete(req.body.id);
        if (!deletedProduct) {
            return res.json({ success: false, message: 'Product not found.' });
        }

        const remaining = await productModel.find({ subCategory: deletedProduct.subCategory });
        if (remaining.length === 0) {
            await productTypeModel.deleteOne({ name: deletedProduct.subCategory });
        }

        res.json({ success: true, message: "Product Removed" });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// Function for single product info
const singleProduct = async (req, res) => {
    try {
        const { productId } = req.body;
        const product = await productModel.findById(productId);
        res.json({ success: true, product });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

const getProductTypes = async (req, res) => {
    try {
        const typeDocs = await productTypeModel.find({}).sort({ name: 1 });
        const typeNames = typeDocs.map(item => item.name);

        const productTypesFromProducts = await productModel.distinct('subCategory');
        const uniqueTypes = [...new Set([...typeNames, ...productTypesFromProducts])].sort((a, b) => a.localeCompare(b));

        res.json({ success: true, productTypes: uniqueTypes });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

const addProductType = async (req, res) => {
    try {
        const { name } = req.body;
        const trimmedName = String(name || '').trim();

        if (!trimmedName) {
            return res.json({ success: false, message: 'Type name is required.' });
        }

        const existing = await productTypeModel.findOne({
            name: { $regex: new RegExp(`^${trimmedName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') },
        });

        if (existing) {
            const allTypes = await getAllProductTypes();
            return res.json({ success: true, message: 'Type already exists.', productTypes: allTypes });
        }

        await productTypeModel.create({ name: trimmedName });
        const allTypes = await getAllProductTypes();
        res.json({ success: true, message: 'Type added', productTypes: allTypes });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

const deleteProductType = async (req, res) => {
    try {
        const { name } = req.body;
        const trimmedName = String(name || '').trim();

        if (!trimmedName) {
            return res.json({ success: false, message: 'Type name is required.' });
        }

        const deletedType = await productTypeModel.findOneAndDelete({
            name: { $regex: new RegExp(`^${trimmedName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') },
        });

        if (!deletedType) {
            const allTypes = await getAllProductTypes();
            return res.json({ success: false, message: 'Type not found.', productTypes: allTypes });
        }

        await productModel.deleteMany({
            subCategory: { $regex: new RegExp(`^${deletedType.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') },
        });

        const allTypes = await getAllProductTypes();
        res.json({ success: true, message: 'Type deleted and related products removed', productTypes: allTypes });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

const getAllProductTypes = async () => {
    const typeDocs = await productTypeModel.find({}).sort({ name: 1 });
    const typeNames = typeDocs.map(item => item.name);
    const productTypesFromProducts = await productModel.distinct('subCategory');
    return [...new Set([...typeNames, ...productTypesFromProducts])].sort((a, b) => a.localeCompare(b));
};

export { listProduct, addProduct, removeProduct, singleProduct, getProductTypes, addProductType, deleteProductType };