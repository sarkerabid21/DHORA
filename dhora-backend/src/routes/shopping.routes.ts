import { Router } from 'express';
import {
  getProducts,
  getProductById,
} from '../controllers/shopping.controller';

const router = Router();

// Publicly browsable fashion shopping catalog
router.get('/', getProducts);
router.get('/:id', getProductById);

export default router;
