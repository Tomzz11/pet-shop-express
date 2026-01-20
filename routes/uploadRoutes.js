import express from 'express';
import { protect, admin } from '../middleware/authMiddleware.js'
import {uploadProductImage, uploadUserAvatar,deleteImage} from '../controllers/uploadController.js';
import upload from "../middleware/uploadMiddleware.js";


const router = express.Router();


router.post("/product",protect,admin,upload.single('image'), uploadProductImage )

// Upload user avatar (Authenticated users)
router.post('/avatar', protect, upload.single('avatar'), uploadUserAvatar);

// Delete image (Authenticated users)
router.delete('/:publicId', protect, deleteImage);

export default router;
