import { Router } from 'express';
import { searchProperties, savedSearches } from '../controllers/search.controller.js';

const router = Router();

router.get('/', searchProperties);
router.get('/saved', savedSearches);

export default router;
