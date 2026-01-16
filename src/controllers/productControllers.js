import ProductModel from '../models/ProductModel.js';
import { productCreateSchema, productUpdateSchema } from '../schemas/productSchema.js';
import { ZodError } from 'zod';

// Helper para generar SKU único
const generateSKU = async (name) => {
    const prefix = name.substring(0, 3).toUpperCase();
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const sku = `${prefix}-${randomNum}`;
    
    // Verificar que no exista
    const existingProduct = await ProductModel.findOne({ sku });
    if (existingProduct) {
        return generateSKU(name); // Recursivo si hay colisión
    }
    
    return sku;
};

export const createProduct = async (req, res) => {
    try {
        // Validar datos de entrada
        const validatedData = productCreateSchema.parse(req.body);
        
        // Generar SKU si no se proporciona
        if (!validatedData.sku) {
            validatedData.sku = await generateSKU(validatedData.name);
        }
        
        // Crear producto
        const product = await ProductModel.create(validatedData);
        
        return res.status(201).json({
            success: true,
            message: 'Producto creado exitosamente',
            data: product
        });
        
    } catch (error) {
        if (error instanceof ZodError) {
            console.log(error)
            return res.status(400).json({
                success: false,
                errors: error.errors.map(err => ({
                    field: err.path.join('.'),
                    message: err.message
                }))
            });
        }
        
        // Manejar errores de duplicación de SKU
        if (error.code === 11000 && error.keyPattern?.sku) {
            return res.status(400).json({
                success: false,
                message: 'El SKU ya está en uso'
            });
        }
        
        console.error('Error creating product:', error);
        return res.status(500).json({
            success: false,
            message: 'Error al crear el producto'
        });
    }
};

export const uploadProductImage = async (req, res) => {
    try {
        const { base64Image } = req.body;
        
        if (!base64Image) {
            return res.status(400).json({
                success: false,
                message: 'No se proporcionó imagen'
            });
        }
        
        const processedImage = processBase64Image(base64Image);
        
        return res.status(200).json({
            success: true,
            data: processedImage
        });
        
    } catch (error) {
        return res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

export const updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        // Validar datos de entrada
        const validatedData = productUpdateSchema.partial().parse(req.body);
        
        // Si se actualizan imágenes pero no mainImage, establecer la primera como principal
        if (validatedData.images && validatedData.images.length > 0 && !validatedData.mainImage) {
            validatedData.mainImage = validatedData.images[0];
        }
        
        // Buscar y actualizar el producto
        const updatedProduct = await ProductModel.findByIdAndUpdate(
            id,
            validatedData,
            { 
                new: true, 
                runValidators: true 
            }
        );
        
        if (!updatedProduct) {
            return res.status(404).json({
                success: false,
                message: 'Producto no encontrado'
            });
        }
        
        return res.status(200).json({
            success: true,
            data: updatedProduct
        });
        
    } catch (error) {
        if (error instanceof ZodError) {
            console.log(error)
            return res.status(400).json({
                success: false,
                errors: error.errors.map(err => ({
                    field: err.path.join('.'),
                    message: err.message
                }))
            });
        }
        
        console.error('Error updating product:', error);
        return res.status(500).json({
            success: false,
            message: 'Error al actualizar el producto'
        });
    }
};

export const getProductById = async (req, res) => {
    try {
        const { id } = req.params;
        
        const product = await ProductModel.findById(id);
        
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Producto no encontrado'
            });
        }
        
        return res.status(200).json({
            success: true,
            data: product
        });
        
    } catch (error) {
        console.error('Error fetching product:', error);
        
        if (error.name === 'CastError') {
            return res.status(400).json({
                success: false,
                message: 'ID de producto inválido'
            });
        }
        
        return res.status(500).json({
            success: false,
            message: 'Error al obtener el producto'
        });
    }
};

export const getProductSearch = async (req, res) => {
    try {
        const { name } = req.query;

        // Validamos que se haya enviado el parámetro
        if (!name) {
            return res.status(400).json({
                success: false,
                message: 'Por favor, proporciona un nombre para la búsqueda.'
            });
        }

        // Creamos una expresión regular para búsqueda insensible a mayúsculas/minúsculas y parcial
        const regex = new RegExp(name, 'i');

        // Buscamos los productos que coincidan
        const products = await ProductModel.find({ name: regex });

        // Si no hay productos, devolvemos un mensaje
        if (products.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'No se encontraron productos con ese nombre.'
            });
        }

        // Si todo va bien, devolvemos los productos
        res.status(200).json({
            success: true,
            count: products.length,
            data: products
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Error del servidor al buscar productos.'
        });
    }
};

export const getAllProducts = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 20,
            category,
            minPrice,
            maxPrice,
            sort = 'createdAt',
            order = 'desc',
            search,
            inStock = true
        } = req.query;
        
        // Construir filtros
        const filters = {};
        
        if (category) {
            filters.category = category;
        }
        
        if (minPrice || maxPrice) {
            filters.price = {};
            if (minPrice) filters.price.$gte = Number(minPrice);
            if (maxPrice) filters.price.$lte = Number(maxPrice);
        }
        
        if (inStock === 'true') {
            filters.stock = { $gt: 0 };
        }
        
        if (search) {
            filters.$text = { $search: search };
        }
        
        // Opciones de paginación
        const options = {
            page: parseInt(page),
            limit: parseInt(limit),
            sort: { [sort]: order === 'desc' ? -1 : 1 }
        };
        
        // Ejecutar consulta con paginación
        const result = await ProductModel.paginate(filters, options);
        
        return res.status(200).json({
            success: true,
            data: {
                products: result.docs,
                pagination: {
                    total: result.totalDocs,
                    page: result.page,
                    pages: result.totalPages,
                    limit: result.limit,
                    hasNext: result.hasNextPage,
                    hasPrev: result.hasPrevPage
                }
            }
        });
        
    } catch (error) {
        console.error('Error fetching products:', error);
        return res.status(500).json({
            success: false,
            message: 'Error al obtener los productos'
        });
    }
};

export const deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;
        
        const product = await ProductModel.findByIdAndDelete(id);
        
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Producto no encontrado'
            });
        }
        
        return res.status(200).json({
            success: true,
            message: 'Producto eliminado exitosamente',
            data: product
        });
        
    } catch (error) {
        console.error('Error deleting product:', error);
        return res.status(500).json({
            success: false,
            message: 'Error al eliminar el producto'
        });
    }
};

// Controlador para manejar imágenes específicas
export const addProductImages = async (req, res) => {
    try {
        const { id } = req.params;
        const { images } = req.body;
        
        if (!images || !Array.isArray(images) || images.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Debe proporcionar al menos una imagen'
            });
        }
        
        // Validar que sean URLs
        const urlRegex = /^(https?:\/\/[^\s$.?#].[^\s]*)$/i;
        const invalidImages = images.filter(img => !urlRegex.test(img));
        
        if (invalidImages.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Algunas imágenes no son URLs válidas'
            });
        }
        
        const product = await ProductModel.findById(id);
        
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Producto no encontrado'
            });
        }
        
        // Agregar nuevas imágenes
        product.images.push(...images);
        
        // Si no hay imagen principal, establecer la primera nueva
        if (!product.mainImage && images.length > 0) {
            product.mainImage = images[0];
        }
        
        await product.save();
        
        return res.status(200).json({
            success: true,
            message: 'Imágenes agregadas exitosamente',
            data: {
                images: product.images,
                mainImage: product.mainImage
            }
        });
        
    } catch (error) {
        console.error('Error adding images:', error);
        return res.status(500).json({
            success: false,
            message: 'Error al agregar las imágenes'
        });
    }
};

export const removeProductImage = async (req, res) => {
    try {
        const { id } = req.params;
        const { imageUrl } = req.body;
        
        if (!imageUrl) {
            return res.status(400).json({
                success: false,
                message: 'Debe proporcionar la URL de la imagen a eliminar'
            });
        }
        
        const product = await ProductModel.findById(id);
        
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Producto no encontrado'
            });
        }
        
        // Verificar si la imagen existe
        const imageIndex = product.images.indexOf(imageUrl);
        if (imageIndex === -1) {
            return res.status(404).json({
                success: false,
                message: 'Imagen no encontrada en el producto'
            });
        }
        
        // Verificar que no sea la única imagen
        if (product.images.length <= 1) {
            return res.status(400).json({
                success: false,
                message: 'No se puede eliminar la única imagen del producto'
            });
        }
        
        // Remover la imagen
        product.images.splice(imageIndex, 1);
        
        // Si la imagen eliminada era la principal, establecer la primera como principal
        if (product.mainImage === imageUrl) {
            product.mainImage = product.images[0];
        }
        
        await product.save();
        
        return res.status(200).json({
            success: true,
            message: 'Imagen eliminada exitosamente',
            data: {
                images: product.images,
                mainImage: product.mainImage
            }
        });
        
    } catch (error) {
        console.error('Error removing image:', error);
        return res.status(500).json({
            success: false,
            message: 'Error al eliminar la imagen'
        });
    }
};

export const setMainImage = async (req, res) => {
    try {
        const { id } = req.params;
        const { imageUrl } = req.body;
        
        if (!imageUrl) {
            return res.status(400).json({
                success: false,
                message: 'Debe proporcionar la URL de la imagen principal'
            });
        }
        
        const product = await ProductModel.findById(id);
        
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Producto no encontrado'
            });
        }
        
        // Verificar si la imagen existe en el array
        if (!product.images.includes(imageUrl)) {
            return res.status(400).json({
                success: false,
                message: 'La imagen no pertenece a este producto'
            });
        }
        
        // Establecer como imagen principal
        product.mainImage = imageUrl;
        await product.save();
        
        return res.status(200).json({
            success: true,
            message: 'Imagen principal actualizada',
            data: {
                mainImage: product.mainImage
            }
        });
        
    } catch (error) {
        console.error('Error setting main image:', error);
        return res.status(500).json({
            success: false,
            message: 'Error al establecer la imagen principal'
        });
    }
};

/*
import { productSchema } from '../schemas/productSchema.js'
import ProductModel from '../models/ProductModel.js'
import { ZodError } from 'zod'


export const createProduct = async (req, res) => {
    try {
        const { name, description, price, stock, imageUrl } =
            productSchema.parse(req.body)

        const product = await ProductModel.create({
            name,
            description,
            price,
            stock,
            imageUrl,
        })

        return res
            .status(201)
            .json({ message: 'Producto creado exitosamente', product })
    } catch (error) {
        if (error instanceof ZodError) {
            return res
                .status(400)
                .json(error.issues.map((issue) => ({ message: issue.message })))
        }

        res.status(500).json({ message: 'Error al crear el producto' })
    }
}

export const updateProduct = async (req, res) => {
    try {
        // 1. validar los datos de entrada con Zod
        const validateData = productSchema.partial().parse(req.body)

        // 2. buscar y actualizar el producto
        const updatedProduct = await ProductModel.findByIdAndUpdate(
            req.params.id,
            validateData,
            { new: true, runValidators: true }
        )

        // 3. Manejar el caso de que el producto no exista
        if (!updatedProduct) {
            return res.status(404).json({ message: 'Producto no encontrado' })
        }

        // 4. Devolver producto actualizado
        return res.status(200).json(updatedProduct)
    } catch (error) {
        res.json({ message: 'Error al actualizar producto' })
    }
}

export const getProductById = async (req, res) => {
    try {
        const product = await ProductModel.findById(req.params.id)
        return res.status(200).json(product)
    } catch (error) {
        return res.status(500).json({ message: 'Error al obtener el producto' })
    }
}

export const getAllProducts = async (req, res) => {
    try {
        const products = await ProductModel.find()
        return res.status(200).json(products)
    } catch (error) {
        return res
            .status(500)
            .json({ message: 'Error al obtener los productos' })
    }
}

export const deleteProduct = async (req, res) => {
    try {
        const product = await ProductModel.findByIdAndDelete(req.params.id)
        return res.status(200).json(product)
    } catch (error) {
        return res
            .status(500)
            .json({ message: ' Error al eliminar el producto' })
    }
}
*/