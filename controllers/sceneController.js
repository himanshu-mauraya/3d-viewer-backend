import Scene from '../models/Scene.js';
import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// @desc    Upload a 3D model
// @route   POST /api/scene/upload
// @access  Private
export const uploadModel = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(req.file.path, {
      resource_type: 'auto',
      folder: '3d-viewer/models',
    });

    // Create new scene
    const scene = await Scene.create({
      user: req.user._id,
      modelUrl: result.secure_url,
      publicId: result.public_id,
      name: req.file.originalname,
    });

    res.status(201).json({
      _id: scene._id,
      modelUrl: scene.modelUrl,
      name: scene.name,
      createdAt: scene.createdAt,
    });
  } catch (error) {
    console.error('Error uploading model:', error);
    res.status(500).json({ message: 'Error uploading model', error: error.message });
  }
};

// @desc    Get all scenes for a user
// @route   GET /api/scene
// @access  Private
export const getUserScenes = async (req, res) => {
  try {
    const scenes = await Scene.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(scenes);
  } catch (error) {
    console.error('Error fetching scenes:', error);
    res.status(500).json({ message: 'Error fetching scenes' });
  }
};

// @desc    Get a single scene
// @route   GET /api/scene/:id
// @access  Private
export const getSceneById = async (req, res) => {
  try {
    const scene = await Scene.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (scene) {
      res.json(scene);
    } else {
      res.status(404).json({ message: 'Scene not found' });
    }
  } catch (error) {
    console.error('Error fetching scene:', error);
    res.status(500).json({ message: 'Error fetching scene' });
  }
};

// @desc    Delete a scene
// @route   DELETE /api/scene/:id
// @access  Private
export const deleteScene = async (req, res) => {
  try {
    const scene = await Scene.findById(req.params.id);

    if (!scene) {
      return res.status(404).json({ message: 'Scene not found' });
    }

    // Check if user is the owner
    if (scene.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized to delete this scene' });
    }

    // Delete from Cloudinary
    await cloudinary.uploader.destroy(scene.publicId, {
      resource_type: 'video', // or 'auto' if not sure
    });

    // Delete from database
    await Scene.deleteOne({ _id: req.params.id });

    res.json({ message: 'Scene removed' });
  } catch (error) {
    console.error('Error deleting scene:', error);
    res.status(500).json({ message: 'Error deleting scene', error: error.message });
  }
};

// @desc    Update camera state for a scene
// @route   PUT /api/scene/:id/save-state
// @access  Private
export const updateCameraState = async (req, res) => {
  try {
    const { cameraPosition, cameraRotation } = req.body;
    
    if (!cameraPosition || !cameraRotation) {
      return res.status(400).json({ message: 'Camera position and rotation are required' });
    }

    const scene = await Scene.findById(req.params.id);

    if (!scene) {
      return res.status(404).json({ message: 'Scene not found' });
    }

    // Check if user is the owner
    if (scene.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized to update this scene' });
    }

    // Update camera state
    scene.cameraPosition = cameraPosition;
    scene.cameraRotation = cameraRotation;
    
    const updatedScene = await scene.save();

    res.json({
      _id: updatedScene._id,
      cameraPosition: updatedScene.cameraPosition,
      cameraRotation: updatedScene.cameraRotation,
    });
  } catch (error) {
    console.error('Error updating camera state:', error);
    res.status(500).json({ message: 'Error updating camera state', error: error.message });
  }
};
