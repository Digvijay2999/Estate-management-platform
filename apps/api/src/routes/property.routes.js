import { Router } from 'express';
import {
  listProperties,
  getPropertyById,
  createProperty,
  updateProperty,
  uploadPropertyFiles,
  deleteProperty,
  listCategories,
  listAmenities,
  uploadFiles,
} from '../controllers/property.controller.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = Router();

router.get('/categories', listCategories);
router.get('/amenities', listAmenities);
router.get('/', listProperties);
router.get('/:id', getPropertyById);
router.post('/', authenticate, authorize('AGENT', 'SELLER', 'ADMIN', 'SUPER_ADMIN'), createProperty);
router.post('/:id/files', authenticate, authorize('AGENT', 'SELLER', 'ADMIN', 'SUPER_ADMIN'), uploadFiles, uploadPropertyFiles);
router.patch('/:id', authenticate, authorize('AGENT', 'SELLER', 'ADMIN', 'SUPER_ADMIN'), updateProperty);
router.delete('/:id', authenticate, authorize('AGENT', 'SELLER', 'ADMIN', 'SUPER_ADMIN'), deleteProperty);

export default router;
