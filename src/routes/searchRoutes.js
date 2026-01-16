import express from 'express';
import {
    getProductSearch
} from '../controllers/productControllers.js';

const router = express.Router();

router.get('/products', getProductSearch)

export default router;