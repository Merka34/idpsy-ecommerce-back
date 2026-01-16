import express from 'express'
import { getBanners, createBanner, toggleBannerStatus, updateBanner, deleteBanner, changePosition } from '../controllers/bannerController.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router()


router.get('/', getBanners);
router.post('/', verifyToken, createBanner);
router.patch('/:id', verifyToken, updateBanner);
router.patch('/:id/pos', verifyToken, changePosition);
router.patch('/:id/toggle', verifyToken, toggleBannerStatus);
router.delete('/:id', verifyToken, deleteBanner); // Usamos PATCH porque es una actualización parcial

export default router