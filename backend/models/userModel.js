import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phone: { type: String, default: "" },
    address: { type: Object, default: {} },
    gender: { type: String, default: "" },
    dob: { type: String, default: "" },
    cartData: { type: Object, default: {} },
    status: { type: String, default: "active" } // Status: 'active' ya 'disabled'
}, { minimize: false });

const userModel = mongoose.models.user || mongoose.model('user', userSchema);

export default userModel;
