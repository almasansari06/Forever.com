import mongoose from 'mongoose';

const contactSnapshotSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true },
  name: { type: String, default: '' },
  phone: { type: String, default: '' },
  raw: { type: Object, default: {} },
  capturedAt: { type: Date, default: Date.now },
}, { timestamps: true });

const contactSnapshotModel = mongoose.models.contactSnapshot || mongoose.model('contactSnapshot', contactSnapshotSchema);

export default contactSnapshotModel;
