import { Router } from 'express';
import { getSellerDashboardSummary } from '../controllers/role-dashboard.controller.js';
import { listMyProperties } from '../controllers/property.controller.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = Router();

router.use(authenticate);
router.use(authorize('SELLER'));

router.get('/summary', getSellerDashboardSummary);
router.get('/properties', listMyProperties);

export default router;
