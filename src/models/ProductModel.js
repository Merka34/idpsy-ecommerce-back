import mongoose from 'mongoose'
import mongoosePaginate from 'mongoose-paginate-v2'

/*
const ProductSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        description: {
            type: String,
            required: true,
            trim: true,
        },
        price: {
            type: Number,
            required: true,
            min: 0,
        },
        stock: {
            type: Number,
            required: true,
            min: 0,
        },
        imageUrl: {
            type: String,
            required: true,
        },
    },
    { timestamps: true }
)*/

const ProductSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        description: {
            type: String,
            required: true,
            trim: true,
        },
        price: {
            type: Number,
            required: true,
            min: 0,
        },
        originalPrice: { // Para mostrar precio anterior en descuentos
            type: Number,
            min: 0,
        },
        stock: {
            type: Number,
            required: true,
            min: 0,
        },
        images: [{ // Cambiado de imageUrl a images array
            type: String,
            required: true,
        }],
        mainImage: { // Imagen principal (opcional, puede ser la primera del array)
            type: String,
        },
        category: {
            type: String,
            trim: true,
        },
        subcategory: {
            type: String,
            trim: true,
        },
        rating: {
            type: Number,
            min: 0,
            max: 5,
            default: 0,
        },
        reviewCount: {
            type: Number,
            default: 0,
            min: 0,
        },
        features: [{ // Características del producto
            type: String,
            trim: true,
        }],
        isNewP: {
            type: Boolean,
            default: false,
        },
        discount: { // Porcentaje de descuento
            type: Number,
            min: 0,
            max: 100,
        },
        tags: [{ // Etiquetas para búsqueda
            type: String,
            trim: true,
        }],
        sku: { // Código único del producto
            type: String,
            unique: true,
            trim: true,
        },
        weight: { // Peso en gramos
            type: Number,
            min: 0,
        },
        dimensions: { // Dimensiones del producto
            height: { type: Number, min: 0 },
            width: { type: Number, min: 0 },
            depth: { type: Number, min: 0 },
        }
    },
    { 
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true }
    }
);

// Índices para búsqueda más eficiente
ProductSchema.index({ name: 'text', description: 'text', tags: 'text' });
ProductSchema.index({ category: 1, subcategory: 1 });
ProductSchema.index({ price: 1 });
ProductSchema.index({ rating: -1 });
ProductSchema.index({ isNewP: 1 });

// Virtual para obtener la URL de la imagen principal
ProductSchema.virtual('imageUrl').get(function() {
    return this.mainImage || (this.images && this.images[0]) || null;
});

// Middleware para asegurar que haya al menos una imagen
ProductSchema.pre('save', function(next) {
    //if (this.images && this.images.length > 0) {
        // Si no hay mainImage, establecer la primera como principal
        //if (!this.mainImage) {
            //this.mainImage = this.images[0];
        //}
        next();
    //} else {
        //next(new Error('Al menos una imagen es requerida'));
    //}
});

ProductSchema.plugin(mongoosePaginate);

export default mongoose.model('Product', ProductSchema)

