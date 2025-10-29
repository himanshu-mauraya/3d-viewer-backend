import mongoose from 'mongoose';

const cameraPositionSchema = new mongoose.Schema({
  x: { type: Number, default: 0 },
  y: { type: Number, default: 0 },
  z: { type: Number, default: 5 },
});

const cameraRotationSchema = new mongoose.Schema({
  x: { type: Number, default: 0 },
  y: { type: Number, default: 0 },
  z: { type: Number, default: 0 },
});

const sceneSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    modelUrl: {
      type: String,
      required: true,
    },
    publicId: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      trim: true,
      default: 'Untitled Scene',
    },
    cameraPosition: {
      type: cameraPositionSchema,
      default: () => ({}),
    },
    cameraRotation: {
      type: cameraRotationSchema,
      default: () => ({}),
    },
  },
  {
    timestamps: true,
  }
);

const Scene = mongoose.model('Scene', sceneSchema);

export default Scene;
