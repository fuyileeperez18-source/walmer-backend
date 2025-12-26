import { Router } from 'express';
import authRoutes from './auth.routes.js';
import productRoutes from './product.routes.js';
import categoryRoutes from './category.routes.js';
import orderRoutes from './order.routes.js';
import userRoutes from './user.routes.js';
import chatRoutes from './chat.routes.js';
import analyticsRoutes from './analytics.routes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/products', productRoutes);
router.use('/categories', categoryRoutes);
router.use('/orders', orderRoutes);
router.use('/users', userRoutes);
router.use('/chat', chatRoutes);
router.use('/analytics', analyticsRoutes);

export default router;
