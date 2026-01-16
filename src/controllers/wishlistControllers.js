import WishlistModel from '../models/WishlistModel.js'
import ProductModel from '../models/ProductModel.js'

// Obtener la lista de deseos del usuario
export const getWishlist = async (req, res) => {
    try {
        const { userId } = req.params

        if (!userId) {
            return res.status(400).json({ message: 'El userId es requerido' })
        }

        const wishlist = await WishlistModel.findOne({ userId }).populate(
            'products.productId'
        )

        if (!wishlist) {
            // Si no existe, crear una vacía
            const newWishlist = new WishlistModel({
                userId,
                products: [],
            })
            await newWishlist.save()
            return res.status(200).json({
                message: 'Lista de deseos creada',
                wishlist: newWishlist,
            })
        }

        res.status(200).json({
            message: 'Lista de deseos obtenida con éxito',
            wishlist,
        })
    } catch (error) {
        console.error('Error al obtener lista de deseos:', error)
        res.status(500).json({ message: 'Error al obtener lista de deseos' })
    }
}

// Agregar producto a la lista de deseos
export const addToWishlist = async (req, res) => {
    try {
        const { userId, productId } = req.body

        if (!userId) {
            return res.status(400).json({ message: 'El userId es requerido' })
        }

        if (!productId) {
            return res.status(400).json({ message: 'El productId es requerido' })
        }

        // Validar que el producto exista
        const product = await ProductModel.findById(productId)
        if (!product) {
            return res.status(400).json({ message: 'Producto no encontrado' })
        }

        // Buscar o crear la lista de deseos del usuario
        let wishlist = await WishlistModel.findOne({ userId })

        if (!wishlist) {
            wishlist = new WishlistModel({
                userId,
                products: [{ productId }],
            })
        } else {
            // Verificar si el producto ya está en la lista
            const productExists = wishlist.products.some(
                (p) => p.productId.toString() === productId
            )

            if (productExists) {
                return res.status(400).json({
                    message: 'El producto ya está en la lista de deseos',
                })
            }

            wishlist.products.push({ productId })
        }

        await wishlist.save()
        await wishlist.populate('products.productId')

        res.status(200).json({
            message: 'Producto agregado a la lista de deseos',
            wishlist,
        })
    } catch (error) {
        console.error('Error al agregar a lista de deseos:', error)
        res.status(500).json({ message: 'Error al agregar a lista de deseos' })
    }
}

// Eliminar producto de la lista de deseos
export const removeFromWishlist = async (req, res) => {
    try {
        const { userId } = req.params
        const { productId } = req.body

        if (!userId) {
            return res.status(400).json({ message: 'El userId es requerido' })
        }

        if (!productId) {
            return res.status(400).json({ message: 'El productId es requerido' })
        }

        const wishlist = await WishlistModel.findOne({ userId })

        if (!wishlist) {
            return res.status(404).json({ message: 'Lista de deseos no encontrada' })
        }

        // Eliminar el producto de la lista
        wishlist.products = wishlist.products.filter(
            (p) => p.productId.toString() !== productId
        )

        await wishlist.save()
        await wishlist.populate('products.productId')

        res.status(200).json({
            message: 'Producto eliminado de la lista de deseos',
            wishlist,
        })
    } catch (error) {
        console.error('Error al eliminar de lista de deseos:', error)
        res.status(500).json({ message: 'Error al eliminar de lista de deseos' })
    }
}

// Verificar si un producto está en la lista de deseos
export const isProductInWishlist = async (req, res) => {
    try {
        const { userId, productId } = req.query

        if (!userId || !productId) {
            return res.status(400).json({
                message: 'El userId y productId son requeridos',
            })
        }

        const wishlist = await WishlistModel.findOne({ userId })

        if (!wishlist) {
            return res.status(200).json({ isInWishlist: false })
        }

        const isInWishlist = wishlist.products.some(
            (p) => p.productId.toString() === productId
        )

        res.status(200).json({ isInWishlist })
    } catch (error) {
        console.error('Error al verificar wishlist:', error)
        res.status(500).json({ message: 'Error al verificar wishlist' })
    }
}

// Limpiar la lista de deseos
export const clearWishlist = async (req, res) => {
    try {
        const { userId } = req.params

        if (!userId) {
            return res.status(400).json({ message: 'El userId es requerido' })
        }

        const wishlist = await WishlistModel.findOne({ userId })

        if (!wishlist) {
            return res.status(404).json({ message: 'Lista de deseos no encontrada' })
        }

        wishlist.products = []
        await wishlist.save()

        res.status(200).json({
            message: 'Lista de deseos vaciada',
            wishlist,
        })
    } catch (error) {
        console.error('Error al limpiar lista de deseos:', error)
        res.status(500).json({ message: 'Error al limpiar lista de deseos' })
    }
}
