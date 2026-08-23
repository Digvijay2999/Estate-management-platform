import { Router } from 'express';
import authRoutes from './auth.routes.js';
import propertyRoutes from './property.routes.js';
import searchRoutes from './search.routes.js';
import customerRoutes from './customer.routes.js';
import agentRoutes from './agent.routes.js';
import sellerRoutes from './seller.routes.js';
import adminRoutes from './admin.routes.js';
import { listCategories, listAmenities } from '../controllers/property.controller.js';

const router = Router();

router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Estate management platform API is running',
    timestamp: new Date().toISOString(),
  });
});

router.use('/auth', authRoutes);
router.use('/properties', propertyRoutes);
router.use('/search', searchRoutes);
router.use('/customer', customerRoutes);
router.use('/agent', agentRoutes);
router.use('/seller', sellerRoutes);
router.use('/admin', adminRoutes);
router.get('/property-categories', listCategories);
router.get('/amenities', listAmenities);

export default router;
