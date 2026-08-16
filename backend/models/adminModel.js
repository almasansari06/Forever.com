import mongoose from 'mongoose';

const adminSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, default: 'foreverglobal.new@gmail.com' },
  password: { type: String, required: true, default: 'forever9211' },
  resetOtp: { type: String, default: '' },
  resetOtpExpiry: { type: Number, default: 0 },
  passwordVersion: { type: Number, default: 1 },
  lastPasswordUpdatedAt: { type: Date, default: null },
}, { timestamps: true });

const adminModel = mongoose.models.admin || mongoose.model('admin', adminSchema);

export default adminModel;
