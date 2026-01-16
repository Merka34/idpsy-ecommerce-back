import express from 'express'
import {
    getAllCategories,
    getActiveCategories,
    getCategoryById,
    getCategoryBySlug,
    createCategory,
    updateCategory,
    deleteCategory,
    searchCategories,
} from '../controllers/categoryControllers.js'

const router = express.Router()

// Obtener todas las categorías
router.get('/all', getAllCategories)

// Obtener categorías activas
router.get('/active', getActiveCategories)

// Buscar categorías
router.get('/search', searchCategories)

// Obtener categoría por slug
router.get('/slug/:slug', getCategoryBySlug)

// Obtener categoría por ID
router.get('/:id', getCategoryById)

// Crear nueva categoría
router.post('/create', createCategory)

// Actualizar categoría
router.put('/update/:id', updateCategory)

// Eliminar categoría
router.delete('/delete/:id', deleteCategory)

export default router
