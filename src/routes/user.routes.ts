import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { userService } from '../services/user.service.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';
import type { AuthRequest } from '../types/index.js';

const router = Router();

// Get current user profile
router.get('/profile', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const profile = await userService.getProfile(req.user!.id);
    res.json({ success: true, data: profile });
  } catch (error) {
    next(error);
  }
});

// Update current user profile
router.put('/profile', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const data = z.object({
      full_name: z.string().min(2).optional(),
      phone: z.string().optional(),
      avatar_url: z.string().url().optional(),
    }).parse(req.body);

    const profile = await userService.updateProfile(req.user!.id, data);
    res.json({ success: true, data: profile });
  } catch (error) {
    next(error);
  }
});

// ==================== ADDRESSES ====================

const addressSchema = z.object({
  label: z.string().min(1),
  street: z.string().min(1),
  city: z.string().min(1),
  state: z.string().min(1),
  postal_code: z.string().min(1),
  country: z.string().default('US'),
  is_default: z.boolean().default(false),
});

// Add address
router.post('/addresses', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const data = addressSchema.parse(req.body);
    const address = await userService.addAddress(req.user!.id, data);
    res.status(201).json({ success: true, data: address });
  } catch (error) {
    next(error);
  }
});

// Update address
router.put('/addresses/:id', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const data = addressSchema.partial().parse(req.body);
    const address = await userService.updateAddress(req.params.id, req.user!.id, data);
    res.json({ success: true, data: address });
  } catch (error) {
    next(error);
  }
});

// Delete address
router.delete('/addresses/:id', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    await userService.deleteAddress(req.params.id, req.user!.id);
    res.json({ success: true, message: 'Address deleted' });
  } catch (error) {
    next(error);
  }
});

// ==================== ADMIN ROUTES ====================

// Get all users (Admin)
router.get('/', authenticate, requireAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const filters = {
      role: req.query.role as string,
      search: req.query.search as string,
      limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
      offset: req.query.offset ? parseInt(req.query.offset as string) : undefined,
    };
    const result = await userService.getAll(filters);
    res.json({ success: true, data: result.data, count: result.count });
  } catch (error) {
    next(error);
  }
});

// Get user by ID (Admin)
router.get('/:id', authenticate, requireAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const profile = await userService.getProfile(req.params.id);
    res.json({ success: true, data: profile });
  } catch (error) {
    next(error);
  }
});

export default router;
