import express from 'express'
import {
    getWishlist,
    addToWishlist,
    removeFromWishlist,
    isProductInWishlist,
    clearWishlist,
} from '../controllers/wishlistControllers.js'

const router = express.Router()

// Obtener la lista de deseos del usuario
router.get('/get/:userId', getWishlist)

// Agregar producto a la lista de deseos
router.post('/add', addToWishlist)

// Eliminar producto de la lista de deseos
router.delete('/remove/:userId', removeFromWishlist)

// Verificar si un producto está en la lista de deseos
router.get('/check', isProductInWishlist)

// Limpiar la lista de deseos
router.delete('/clear/:userId', clearWishlist)

export default router
