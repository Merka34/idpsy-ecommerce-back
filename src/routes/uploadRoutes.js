/*import express from 'express';
import upload from '../middleware/upload.js';
import { uploadImages, deleteImage } from '../controllers/uploadControllers.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

// Subir múltiples imágenes (se puede proteger si lo requieres)
router.post('/upload', upload.array('images', 10), uploadImages);

// Eliminar una imagen (protegido)
router.delete('/:filename', verifyToken, deleteImage);

export default router;*/

// src/routes/uploadRoutes.js
import express from 'express';
import upload from '../middleware/upload.js';
import { uploadImages, deleteImage, listBannerImages } from '../controllers/uploadControllers.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

// Subir múltiples imágenes (si se pasa ?productId=banners guardará en uploads/banners)
router.post('/upload', upload.array('images', 10), uploadImages);

// Listar todas las imágenes de banners (para el carousel)
router.get('/banners', listBannerImages);

// Eliminar una imagen (protegido)
router.delete('/:filename', verifyToken, deleteImage);

export default router;