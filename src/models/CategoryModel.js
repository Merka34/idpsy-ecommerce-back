import mongoose from 'mongoose'

const CategorySchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            minLength: 3,
            maxLength: 50,
        },
        description: {
            type: String,
            default: '',
            trim: true,
            maxLength: 500,
        },
        image: {
            type: String,
            default: null,
        },
        color: {
            type: String,
            default: '#3b82f6',
        },
        slug: {
            type: String,
            unique: true,
            lowercase: true,
            trim: true,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
    },
    { timestamps: true }
)

// Generar slug antes de guardar
CategorySchema.pre('save', function (next) {
    if (this.isModified('name')) {
        this.slug = this.name
            .toLowerCase()
            .trim()
            .replace(/\s+/g, '-')
            .replace(/[^\w-]/g, '')
    }
    next()
})

export default mongoose.model('Category', CategorySchema)
