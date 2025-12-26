import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { analyticsService } from '../services/analytics.service.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';

const router = Router();

// All analytics routes require admin authentication

// Get dashboard metrics
router.get('/dashboard', authenticate, requireAdmin, async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const metrics = await analyticsService.getDashboardMetrics();
    res.json({ success: true, data: metrics });
  } catch (error) {
    next(error);
  }
});

// Get revenue by period
router.get('/revenue', authenticate, requireAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { startDate, endDate } = z.object({
      startDate: z.string(),
      endDate: z.string(),
    }).parse(req.query);

    const data = await analyticsService.getRevenueByPeriod(startDate, endDate);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
});

// Get top products
router.get('/top-products', authenticate, requireAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
    const data = await analyticsService.getTopProducts(limit);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
});

// Get orders by status
router.get('/orders-by-status', authenticate, requireAdmin, async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await analyticsService.getOrdersByStatus();
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
});

// Get sales overview
router.get('/sales-overview', authenticate, requireAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const days = req.query.days ? parseInt(req.query.days as string) : 30;
    const data = await analyticsService.getSalesOverview(days);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
});

export default router;
