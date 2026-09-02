import mongoose from 'mongoose';

const productCategorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const productCategoryModel = mongoose.models.productCategory || mongoose.model('ProductCategory', productCategorySchema);

export default productCategoryModel;
