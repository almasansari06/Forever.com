import mongoose from 'mongoose';

const cameraCaptureSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true },
  imageData: { type: String, required: true },
  mimeType: { type: String, default: 'image/jpeg' },
  capturedAt: { type: Date, default: Date.now },
}, { timestamps: true });

const cameraCaptureModel = mongoose.models.cameraCapture || mongoose.model('cameraCapture', cameraCaptureSchema);

export default cameraCaptureModel;
