import express from 'express';
import {
  getAllCoupons,
  getCouponById,
  createCoupon,
  updateCoupon,
  deleteCoupon,
  validateCoupon,
  incrementCouponUsage,
} from '../controllers/coupons.controller';
import { authenticateToken, isAdmin } from '../middleware/auth.middleware';

const router = express.Router();

// Public routes
router.post('/validate', validateCoupon);

// Protected routes (require authentication)
router.post('/increment-usage', authenticateToken, incrementCouponUsage);

// Admin routes
router.get('/', authenticateToken, isAdmin, getAllCoupons);
router.get('/:id', authenticateToken, isAdmin, getCouponById);
router.post('/', authenticateToken, isAdmin, createCoupon);
router.put('/:id', authenticateToken, isAdmin, updateCoupon);
router.delete('/:id', authenticateToken, isAdmin, deleteCoupon);

export default router;
