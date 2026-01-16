/*
import express from 'express'
import {
    createProduct,
    deleteProduct,
    getAllProducts,
    getProductById,
    updateProduct,
} from '../controllers/productsControllers.js'

const router = express.Router()

// Rutas publicas
router.get('/', getAllProducts)

router.get('/:id', getProductById)

// Rutas protegidas donde solo administradores pueden modificar productos
router.post('/', createProduct) // crear producto
router.put('/:id', updateProduct) // actualzar producto
router.delete('/:id', deleteProduct) // eliminar un producto

export default router
*/

// routes/productRoutes.js
import express from 'express';
import upload from '../middleware/upload.js';
import {
    createProduct,
    updateProduct,
    getProductById,
    getAllProducts,
    deleteProduct,
    addProductImages,
    removeProductImage,
    setMainImage,
    getProductSearch
} from '../controllers/productControllers.js';

const router = express.Router();

// Ruta para subir imágenes
router.post('/upload-image', upload.array('images', 10), addProductImages);

// Servir imágenes estáticas
router.use('/uploads', express.static('uploads'));

// Rutas principales
router.post('/', createProduct);
router.get('/', getAllProducts);
router.get('/:id', getProductById);
router.put('/:id', updateProduct);
router.delete('/:id', deleteProduct);

// Rutas específicas para imágenes
router.post('/:id/images', addProductImages);
router.delete('/:id/images', removeProductImage);
router.put('/:id/images/main', setMainImage);

export default router;