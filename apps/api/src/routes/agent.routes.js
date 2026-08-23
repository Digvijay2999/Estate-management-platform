import { Router } from 'express';
import { getAgentDashboardSummary } from '../controllers/role-dashboard.controller.js';
import { listMyProperties } from '../controllers/property.controller.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = Router();

router.use(authenticate);
router.use(authorize('AGENT'));

router.get('/summary', getAgentDashboardSummary);
router.get('/properties', listMyProperties);

export default router;
