import mongoose from 'mongoose';

const productTypeSchema = new mongoose.Schema({
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

const productTypeModel = mongoose.models.productType || mongoose.model('ProductType', productTypeSchema);

export default productTypeModel;
