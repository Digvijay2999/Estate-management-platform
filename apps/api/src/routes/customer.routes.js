import { Router } from 'express';
import {
  getCustomerSummary,
  listFavorites,
  toggleFavorite,
  listInquiries,
  createInquiry,
  listAppointments,
  createAppointment,
} from '../controllers/customer.controller.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = Router();

router.use(authenticate);
router.use(authorize('CUSTOMER'));

router.get('/summary', getCustomerSummary);
router.get('/favorites', listFavorites);
router.post('/favorites/:propertyId', toggleFavorite);
router.get('/inquiries', listInquiries);
router.post('/inquiries', createInquiry);
router.get('/appointments', listAppointments);
router.post('/appointments', createAppointment);

export default router;
