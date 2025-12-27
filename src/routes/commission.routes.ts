import { Router, Response } from 'express';
import { commissionService } from '../services/commission.service.js';
import { authenticate, requireSuperAdmin } from '../middleware/auth.js';
import type { AuthRequest } from '../types/index.js';

const router = Router();

/**
 * GET /api/commissions/summary
 * Obtiene el resumen de comisiones (solo super_admin)
 */
router.get(
  '/summary',
  authenticate,
  requireSuperAdmin,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { start_date, end_date } = req.query;
      const summary = await commissionService.getSummary(
        start_date as string,
        end_date as string
      );

      res.json({
        success: true,
        data: summary,
      });
    } catch (error) {
      console.error('Error getting commission summary:', error);
      res.status(500).json({
        success: false,
        error: 'Error al obtener resumen de comisiones',
      });
    }
  }
);

/**
 * GET /api/commissions/daily
 * Obtiene comisiones diarias (solo super_admin)
 */
router.get(
  '/daily',
  authenticate,
  requireSuperAdmin,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const days = parseInt(req.query.days as string) || 30;
      const dailyCommissions = await commissionService.getDailyCommissions(days);

      res.json({
        success: true,
        data: dailyCommissions,
      });
    } catch (error) {
      console.error('Error getting daily commissions:', error);
      res.status(500).json({
        success: false,
        error: 'Error al obtener comisiones diarias',
      });
    }
  }
);

/**
 * GET /api/commissions/monthly
 * Obtiene comisiones mensuales (solo super_admin)
 */
router.get(
  '/monthly',
  authenticate,
  requireSuperAdmin,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const months = parseInt(req.query.months as string) || 12;
      const monthlyCommissions = await commissionService.getMonthlyCommissions(months);

      res.json({
        success: true,
        data: monthlyCommissions,
      });
    } catch (error) {
      console.error('Error getting monthly commissions:', error);
      res.status(500).json({
        success: false,
        error: 'Error al obtener comisiones mensuales',
      });
    }
  }
);

/**
 * GET /api/commissions/orders
 * Obtiene detalle de comisiones por orden (solo super_admin)
 */
router.get(
  '/orders',
  authenticate,
  requireSuperAdmin,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const limit = parseInt(req.query.limit as string) || 50;
      const offset = parseInt(req.query.offset as string) || 0;
      const orderCommissions = await commissionService.getOrderCommissions(limit, offset);

      res.json({
        success: true,
        data: orderCommissions,
      });
    } catch (error) {
      console.error('Error getting order commissions:', error);
      res.status(500).json({
        success: false,
        error: 'Error al obtener comisiones por orden',
      });
    }
  }
);

/**
 * GET /api/commissions/pending
 * Obtiene comisiones pendientes (solo super_admin)
 */
router.get(
  '/pending',
  authenticate,
  requireSuperAdmin,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const pending = await commissionService.getPendingCommissions();

      res.json({
        success: true,
        data: pending,
      });
    } catch (error) {
      console.error('Error getting pending commissions:', error);
      res.status(500).json({
        success: false,
        error: 'Error al obtener comisiones pendientes',
      });
    }
  }
);

export default router;
