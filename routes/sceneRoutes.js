import express from 'express';
import { protect } from '../middleware/auth.js';
import { 
  uploadModel, 
  getUserScenes, 
  getSceneById, 
  deleteScene, 
  updateCameraState 
} from '../controllers/sceneController.js';
import multer from 'multer';

const router = express.Router();

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ 
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'model/gltf+json' || 
        file.mimetype === 'model/gltf-binary' ||
        file.mimetype === 'application/octet-stream' ||
        file.originalname.endsWith('.glb') ||
        file.originalname.endsWith('.gltf') ||
        file.originalname.endsWith('.obj')) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only GLB, GLTF, and OBJ files are allowed.'), false);
    }
  },
});

// Create uploads directory if it doesn't exist
import fs from 'fs';
import path from 'path';

const uploadDir = 'uploads';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Routes
router.post('/upload', protect, upload.single('model'), uploadModel);
router.get('/', protect, getUserScenes);
router.get('/:id', protect, getSceneById);
router.delete('/:id', protect, deleteScene);
router.put('/:id/save-state', protect, updateCameraState);

export default router;
