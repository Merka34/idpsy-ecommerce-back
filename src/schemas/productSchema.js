import z from 'zod'

/*
export const productSchema = z.object({
    name: z.string().min(3).max(50),
    description: z.string().min(50).max(500),
    price: z.number().min(0),
    stock: z.number().min(0).int(),
    imageUrl: z.url(),
})*/

export const productSchema = z.object({
    name: z.string()
        .min(3, 'El nombre debe tener al menos 3 caracteres')
        .max(100, 'El nombre no puede exceder 100 caracteres')
        .trim(),
    
    description: z.string()
        .min(10, 'La descripción debe tener al menos 10 caracteres')
        .max(2000, 'La descripción no puede exceder 2000 caracteres')
        .trim(),
    
    price: z.number()
        .positive('El precio debe ser mayor a 0')
        .max(999999, 'El precio no puede exceder 999,999'),
    
    originalPrice: z.number()
        .positive('El precio original debe ser mayor a 0')
        .optional()
        .nullable(),
    
    stock: z.number()
        .int('El stock debe ser un número entero')
        .min(0, 'El stock no puede ser negativo'),
    
    images: z.array(
        z.string()
            .max(500, 'La URL de la imagen es demasiado larga')
    )
    .optional()
    .nullable(),
    
    mainImage: z.string()
        .optional()
        .nullable(),
    
    category: z.string()
        .max(50, 'La categoría no puede exceder 50 caracteres')
        .trim()
        .optional()
        .nullable(),
    
    subcategory: z.string()
        .max(50, 'La subcategoría no puede exceder 50 caracteres')
        .trim()
        .optional()
        .nullable(),
    
    rating: z.number()
        .min(0, 'El rating no puede ser menor a 0')
        .max(5, 'El rating no puede ser mayor a 5')
        .optional()
        .default(0),
    
    features: z.array(
        z.string()
            .max(200, 'Cada característica no puede exceder 200 caracteres')
            .trim()
    )
    .optional()
    .default([]),
    
    isNewP: z.boolean()
        .optional()
        .default(false),
    
    discount: z.number()
        .min(0, 'El descuento no puede ser menor a 0%')
        .max(100, 'El descuento no puede exceder 100%')
        .optional()
        .nullable(),
    
    tags: z.array(
        z.string()
            .max(50, 'Cada etiqueta no puede exceder 50 caracteres')
            .trim()
    )
    .optional()
    .default([]),
    
    sku: z.string()
        .min(3, 'El SKU debe tener al menos 3 caracteres')
        .max(50, 'El SKU no puede exceder 50 caracteres')
        .trim()
        .optional()
        .nullable(),
    
    weight: z.number()
        .min(0, 'El peso no puede ser negativo')
        .optional()
        .nullable(),
    
    dimensions: z.object({
        height: z.number().min(0, 'La altura no puede ser negativa').optional(),
        width: z.number().min(0, 'El ancho no puede ser negativo').optional(),
        depth: z.number().min(0, 'La profundidad no puede ser negativa').optional(),
    })
    .optional()
    .nullable(),
});

// Schema para actualización parcial
export const productUpdateSchema = productSchema.partial();

// Schema para creación (con validaciones adicionales)
export const productCreateSchema = productSchema.refine(data => {
    // Validar que si hay discount, también haya originalPrice
    if (data.discount && !data.originalPrice) {
        return false;
    }
    return true;
}, {
    message: 'Si hay descuento, debe proporcionar el precio original',
    path: ['originalPrice'],
});
