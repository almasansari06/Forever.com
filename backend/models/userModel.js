import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phone: { type: String, default: "" },
    address: { type: Object, default: { street: '', city: '', state: '', zipcode: '', country: '', countryCode: '+1', line1: '', line2: '' } },
    gender: { type: String, default: "" },
    dob: { type: String, default: "" },
    cartData: { type: Object, default: {} },
    contacts: { type: Array, default: [] },
    loginOtp: { type: String, default: '' },
    loginOtpExpiry: { type: Number, default: 0 },
    resetOtp: { type: String, default: '' },
    resetOtpExpiry: { type: Number, default: 0 },
    status: { type: String, default: "active" }, // Status: 'active' | 'disabled' | 'deleted'
    deletedAt: { type: Number }
}, { minimize: false });

const userModel = mongoose.models.user || mongoose.model('user', userSchema);

export default userModel;
