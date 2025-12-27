import { Router } from 'express';
import authRoutes from './auth.routes.js';
import productRoutes from './product.routes.js';
import categoryRoutes from './category.routes.js';
import orderRoutes from './order.routes.js';
import userRoutes from './user.routes.js';
import chatRoutes from './chat.routes.js';
import analyticsRoutes from './analytics.routes.js';
import uploadRoutes from './upload.routes.js';
import commissionRoutes from './commission.routes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/products', productRoutes);
router.use('/categories', categoryRoutes);
router.use('/orders', orderRoutes);
router.use('/users', userRoutes);
router.use('/chat', chatRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/upload', uploadRoutes);
router.use('/commissions', commissionRoutes);

export default router;
