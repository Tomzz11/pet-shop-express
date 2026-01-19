import express from 'express';
import {
  getCartByUserId,
  createCart,
  updateCart,
  clearCart
} from '../controllers/cartController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Cart routes
router.get('/', protect, getCartByUserId);
router.post('/', protect, createCart);
router.put('/', protect, updateCart);
router.delete('/', protect, clearCart);

export default router;