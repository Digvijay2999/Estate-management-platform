import { Router } from 'express';
import {
  getAdminDashboardSummary,
  listAdminUsers,
  updateUserApproval,
} from '../controllers/role-dashboard.controller.js';
import { listPendingProperties, updatePropertyApproval } from '../controllers/property.controller.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = Router();

router.use(authenticate);
router.use(authorize('ADMIN', 'SUPER_ADMIN'));

router.get('/summary', getAdminDashboardSummary);
router.get('/users', listAdminUsers);
router.get('/properties/pending', listPendingProperties);
router.patch('/users/:userId/approval', updateUserApproval);
router.patch('/properties/:propertyId/approval', updatePropertyApproval);

export default router;
