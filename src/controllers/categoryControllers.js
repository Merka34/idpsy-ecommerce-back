import CategoryModel from '../models/CategoryModel.js'

// Obtener todas las categorías
export const getAllCategories = async (req, res) => {
    try {
        const categories = await CategoryModel.find().sort({ createdAt: -1 })
        res.status(200).json({
            message: 'Categorías obtenidas con éxito',
            categories,
        })
    } catch (error) {
        console.error('Error al obtener categorías:', error)
        res.status(500).json({ message: 'Error al obtener categorías' })
    }
}

// Obtener categorías activas
export const getActiveCategories = async (req, res) => {
    try {
        const categories = await CategoryModel.find({ isActive: true }).sort({
            name: 1,
        })
        res.status(200).json({
            message: 'Categorías activas obtenidas',
            categories,
        })
    } catch (error) {
        console.error('Error al obtener categorías activas:', error)
        res.status(500).json({ message: 'Error al obtener categorías activas' })
    }
}

// Obtener una categoría por ID
export const getCategoryById = async (req, res) => {
    try {
        const { id } = req.params
        const category = await CategoryModel.findById(id)

        if (!category) {
            return res.status(404).json({ message: 'Categoría no encontrada' })
        }

        res.status(200).json({
            message: 'Categoría obtenida',
            category,
        })
    } catch (error) {
        console.error('Error al obtener categoría:', error)
        res.status(500).json({ message: 'Error al obtener categoría' })
    }
}

// Obtener categoría por slug
export const getCategoryBySlug = async (req, res) => {
    try {
        const { slug } = req.params
        const category = await CategoryModel.findOne({ slug })

        if (!category) {
            return res.status(404).json({ message: 'Categoría no encontrada' })
        }

        res.status(200).json({
            message: 'Categoría obtenida',
            category,
        })
    } catch (error) {
        console.error('Error al obtener categoría por slug:', error)
        res.status(500).json({ message: 'Error al obtener categoría' })
    }
}

// Crear nueva categoría
export const createCategory = async (req, res) => {
    try {
        const { name, description, color, image } = req.body

        if (!name || name.trim().length < 3) {
            return res.status(400).json({
                message: 'El nombre de la categoría debe tener al menos 3 caracteres',
            })
        }

        // Verificar si ya existe
        const existingCategory = await CategoryModel.findOne({
            name: { $regex: `^${name}$`, $options: 'i' },
        })

        if (existingCategory) {
            return res.status(400).json({
                message: 'La categoría ya existe',
            })
        }

        const newCategory = new CategoryModel({
            name: name.trim(),
            description: description?.trim() || '',
            color: color || '#3b82f6',
            image: image || null,
        })

        await newCategory.save()

        res.status(201).json({
            message: 'Categoría creada con éxito',
            category: newCategory,
        })
    } catch (error) {
        console.error('Error al crear categoría:', error)
        res.status(500).json({ message: 'Error al crear categoría' })
    }
}

// Actualizar categoría
export const updateCategory = async (req, res) => {
    try {
        const { id } = req.params
        const { name, description, color, image, isActive } = req.body

        if (!id) {
            return res.status(400).json({ message: 'El ID es requerido' })
        }

        const category = await CategoryModel.findById(id)

        if (!category) {
            return res.status(404).json({ message: 'Categoría no encontrada' })
        }

        // Verificar si el nuevo nombre ya existe (solo si cambió)
        if (name && name !== category.name) {
            const existingCategory = await CategoryModel.findOne({
                _id: { $ne: id },
                name: { $regex: `^${name}$`, $options: 'i' },
            })

            if (existingCategory) {
                return res.status(400).json({
                    message: 'Ya existe una categoría con ese nombre',
                })
            }
        }

        // Actualizar campos
        if (name) category.name = name.trim()
        if (description !== undefined)
            category.description = description?.trim() || ''
        if (color) category.color = color
        if (image !== undefined) category.image = image
        if (isActive !== undefined) category.isActive = isActive

        await category.save()

        res.status(200).json({
            message: 'Categoría actualizada con éxito',
            category,
        })
    } catch (error) {
        console.error('Error al actualizar categoría:', error)
        res.status(500).json({ message: 'Error al actualizar categoría' })
    }
}

// Eliminar categoría
export const deleteCategory = async (req, res) => {
    try {
        const { id } = req.params

        if (!id) {
            return res.status(400).json({ message: 'El ID es requerido' })
        }

        const category = await CategoryModel.findByIdAndDelete(id)

        if (!category) {
            return res.status(404).json({ message: 'Categoría no encontrada' })
        }

        res.status(200).json({
            message: 'Categoría eliminada con éxito',
            category,
        })
    } catch (error) {
        console.error('Error al eliminar categoría:', error)
        res.status(500).json({ message: 'Error al eliminar categoría' })
    }
}

// Buscar categorías por nombre
export const searchCategories = async (req, res) => {
    try {
        const { query } = req.query

        if (!query || query.trim().length === 0) {
            return res.status(400).json({
                message: 'El parámetro de búsqueda es requerido',
            })
        }

        const categories = await CategoryModel.find({
            $or: [
                { name: { $regex: query, $options: 'i' } },
                { description: { $regex: query, $options: 'i' } },
            ],
            isActive: true,
        }).limit(20)

        res.status(200).json({
            message: 'Búsqueda completada',
            categories,
        })
    } catch (error) {
        console.error('Error al buscar categorías:', error)
        res.status(500).json({ message: 'Error al buscar categorías' })
    }
}
