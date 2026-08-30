import { v2 as cloudinary } from "cloudinary";
import productModel from "../models/productModel.js";
import productTypeModel from "../models/productTypeModel.js";

const clothingSizes = ['S', 'M', 'L', 'XL', 'XXL'];
const footwearSizes = ['6', '7', '8', '9', '10'];

const normalizeImages = (images = []) => (Array.isArray(images) ? images : []).filter(Boolean);

const normalizeSizes = (sizes = []) => {
    const raw = Array.isArray(sizes) ? sizes : [];
    const unique = [...new Set(raw.map((size) => String(size).trim()).filter(Boolean))];

    const clothing = clothingSizes.filter((size) => unique.includes(size));
    const footwear = footwearSizes.filter((size) => unique.includes(size));

    return [...clothing, ...footwear];
};

// Function for add product
const addProduct = async (req, res) => {
    try {
        const { name, description, price, category, subCategory, sizes, bestseller, latestCollection, outOfStock } = req.body;

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

        // ⚡ Parallel upload with concurrency limit (max 3 at a time)
        const chunkSize = 3;
        let imagesUrl = [];
        for (let i = 0; i < images.length; i += chunkSize) {
            const chunk = images.slice(i, i + chunkSize);
            const results = await Promise.all(
                chunk.map(async (item) => {
                    try {
                        let result = await cloudinary.uploader.upload(item.path, { 
                            resource_type: 'image',
                            quality: 'auto',
                            fetch_format: 'auto'
                        });
                        return result.secure_url;
                    } catch (error) {
                        console.error('Image upload error:', error);
                        return null;
                    }
                })
            );
            imagesUrl = imagesUrl.concat(results.filter(Boolean));
        }

        const productData = {
            name,
            description,
            category,
            price: Number(price),
            subCategory: normalizedSubCategory,
            bestseller: bestseller === "true" ? true : false,
            latestCollection: latestCollection === "true",
            logoWatermarked: true,
            outOfStock: outOfStock === "true" ? true : false,
            sizes: normalizeSizes(JSON.parse(sizes || '[]')),
            image: imagesUrl,
            displayOrder: Date.now(),
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

// Function for list all products (for frontend - uses displayOrder from shuffle)
const listProduct = async (req, res) => {
    try {
        const products = (await productModel.find({}).sort({ displayOrder: -1, date: -1 })).map((product) => ({
            ...product.toObject(),
            image: normalizeImages(product.image),
        }));
        res.json({ success: true, products });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// Function for list all products (for admin - always sorted by date, ignores shuffle)
const listProductAdmin = async (req, res) => {
    try {
        const products = (await productModel.find({}).sort({ date: -1 })).map((product) => ({
            ...product.toObject(),
            image: normalizeImages(product.image),
        }));
        res.json({ success: true, products });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

const shuffleProducts = async (req, res) => {
    try {
        const products = await productModel.find({}).sort({ date: -1 });

        if (products.length === 0) {
            return res.json({ success: true, message: 'No products found to shuffle.' });
        }

        const shuffledProducts = [...products].sort(() => Math.random() - 0.5);

        await Promise.all(
            shuffledProducts.map((product, index) =>
                productModel.findByIdAndUpdate(product._id, { $set: { displayOrder: index + 1 } })
            )
        );

        res.json({ success: true, message: 'Products shuffled successfully.' });
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
        const productDocument = await productModel.findById(productId);
        const product = productDocument
            ? { ...productDocument.toObject(), image: normalizeImages(productDocument.image) }
            : null;
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

        const productCategoriesFromProducts = await productModel.distinct('category');
        const defaultCategories = ['Men', 'Women', 'Kids'];
        const uniqueCategories = [...new Set([...defaultCategories, ...productCategoriesFromProducts])].sort((a, b) => a.localeCompare(b));

        res.json({ success: true, productTypes: uniqueTypes, productCategories: uniqueCategories });
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

const updateProductType = async (req, res) => {
    try {
        const { name, newName } = req.body;
        const trimmedName = String(name || '').trim();
        const trimmedNewName = String(newName || '').trim();

        if (!trimmedName || !trimmedNewName) {
            return res.json({ success: false, message: 'Old and new type names are required.' });
        }

        const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const oldNameRegex = new RegExp(`^${escapeRegex(trimmedName)}$`, 'i');
        const existingType = await productTypeModel.findOne({ name: new RegExp(`^${escapeRegex(trimmedNewName)}$`, 'i') });

        if (existingType && existingType.name.toLowerCase() !== trimmedName.toLowerCase()) {
            return res.json({ success: false, message: 'A product type with this name already exists.' });
        }

        await productTypeModel.updateOne({ name: oldNameRegex }, { $set: { name: trimmedNewName } });
        await productModel.updateMany({ subCategory: oldNameRegex }, { $set: { subCategory: trimmedNewName } });

        const allTypes = await getAllProductTypes();
        res.json({ success: true, message: 'Type updated successfully.', productTypes: allTypes });
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

const getAllProductCategories = async () => {
    const defaultCategories = ['Men', 'Women', 'Kids'];
    const productCategoriesFromProducts = await productModel.distinct('category');
    return [...new Set([...defaultCategories, ...productCategoriesFromProducts])].sort((a, b) => a.localeCompare(b));
};

const updateProductCategory = async (req, res) => {
    try {
        const { name, newName } = req.body;
        const trimmedName = String(name || '').trim();
        const trimmedNewName = String(newName || '').trim();

        if (!trimmedName || !trimmedNewName) {
            return res.json({ success: false, message: 'Old and new category names are required.' });
        }

        const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const oldNameRegex = new RegExp(`^${escapeRegex(trimmedName)}$`, 'i');
        const existingCategory = await productModel.findOne({ category: new RegExp(`^${escapeRegex(trimmedNewName)}$`, 'i') });

        if (existingCategory && existingCategory.category.toLowerCase() !== trimmedName.toLowerCase()) {
            return res.json({ success: false, message: 'A product category with this name already exists.' });
        }

        await productModel.updateMany({ category: oldNameRegex }, { $set: { category: trimmedNewName } });
        const allCategories = await getAllProductCategories();
        res.json({ success: true, message: 'Category updated successfully.', productCategories: allCategories });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

const deleteProductCategory = async (req, res) => {
    try {
        const { name } = req.body;
        const trimmedName = String(name || '').trim();

        if (!trimmedName) {
            return res.json({ success: false, message: 'Category name is required.' });
        }

        const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const oldNameRegex = new RegExp(`^${escapeRegex(trimmedName)}$`, 'i');

        await productModel.updateMany({ category: oldNameRegex }, { $set: { category: 'Other' } });
        const allCategories = await getAllProductCategories();
        res.json({ success: true, message: 'Category removed and related products moved to Other.', productCategories: allCategories });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

const updateProduct = async (req, res) => {
    try {
        const { id, price, sizes, outOfStock } = req.body;

        if (!id) {
            return res.json({ success: false, message: 'Product ID is required.' });
        }

        const product = await productModel.findById(id);
        if (!product) {
            return res.json({ success: false, message: 'Product not found.' });
        }

        const parsedSizes = Array.isArray(sizes)
            ? sizes.map((size) => String(size).trim()).filter(Boolean)
            : typeof sizes === 'string'
                ? sizes.split(',').map((size) => size.trim()).filter(Boolean)
                : product.sizes || [];

        product.price = Number(price ?? product.price);
        product.sizes = normalizeSizes(parsedSizes);
        product.outOfStock = Boolean(outOfStock);
        await product.save();

        res.json({ success: true, message: 'Product updated successfully.' });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

export {
    listProduct,
    listProductAdmin,
    shuffleProducts,
    addProduct,
    removeProduct,
    singleProduct,
    getProductTypes,
    addProductType,
    deleteProductType,
    updateProductType,
    updateProductCategory,
    deleteProductCategory,
    updateProduct,
};