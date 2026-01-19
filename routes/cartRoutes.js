import express from 'express';
import {
  getCartByUserId,
  createCart
} from '../controllers/cartController.js';
import { protect, admin } from '../middleware/authMiddleware.js';


const router = express.Router();

// Public routes
router.get('/', protect, getCartByUserId);
router.post('/', protect, createCart);


export default router;
