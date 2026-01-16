// src/controllers/uploadControllers.js
import fs from 'fs';
import path from 'path';
import express from 'express';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadsRoot = path.join(__dirname, '..', 'uploads');
const productsPath = path.join(uploadsRoot, 'products');
const bannersPath = path.join(uploadsRoot, 'banners');

export const uploadImages = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, message: 'No se subieron archivos' });
    }

    const isBanners = (req.query.productId || '') === 'banners';

    const uploadedImages = req.files.map(file => {
      const sub = isBanners ? 'banners' : 'products';
      return {
        url: `/uploads/${sub}/${file.filename}`,
        filename: file.filename,
        originalName: file.originalname,
        size: file.size,
        mimetype: file.mimetype
      };
    });

    res.status(200).json({
      success: true,
      message: 'Imágenes subidas exitosamente',
      data: uploadedImages
    });
  } catch (error) {
    console.error('Error uploading images:', error);
    res.status(500).json({ success: false, message: 'Error al subir imágenes' });
  }
};

export const listBannerImages = async (req, res) => {
  try {
    if (!fs.existsSync(bannersPath)) {
      return res.json({ success: true, data: [] });
    }
    const files = fs.readdirSync(bannersPath).filter(f => !f.startsWith('.'));
    const data = files.map(filename => ({
      url: `/uploads/banners/${filename}`,
      filename,
    }));
    res.json({ success: true, data });
  } catch (error) {
    console.error('Error listing banner images', error);
    res.status(500).json({ success: false, message: 'Error al listar imágenes' });
  }
};

export const deleteImage = async (req, res) => {
  try {
    const { filename } = req.params;
    const productId = (req.query.productId || '').toString().replace(/[^a-zA-Z0-9_-]/g, '');

    if (!filename || !/^[a-zA-Z0-9._-]+$/.test(filename)) {
      return res.status(400).json({ success: false, message: 'Filename inválido' });
    }

    // Determinar carpeta: si productId === 'banners' -> banners, else products
    const folder = productId === 'banners' ? 'banners' : 'products';
    if (productId && folder === 'banners' && !filename.startsWith(`${productId}-`)) {
      // este chequeo es opcional; depende del esquema que uses al subir
      // aquí permitimos borrar si filename existe en la carpeta
    }

    const filePath = path.join(__dirname, '..', 'uploads', folder, filename);

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      return res.status(200).json({ success: true, message: 'Imagen eliminada' });
    } else {
      return res.status(404).json({ success: false, message: 'Imagen no encontrada' });
    }
  } catch (error) {
    console.error('Error deleting image:', error);
    res.status(500).json({ success: false, message: 'Error al eliminar imagen' });
  }
};

// Para servir imágenes estáticas en Express
export const setupStaticFiles = (app) => {
  app.use('/uploads', (req, res, next) => {
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    next();
  }, express.static(path.join(__dirname, '..', 'uploads')));
};


/*import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const uploadImages = async (req, res) => {
    try {
        console.log(req.body);
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No se subieron archivos'
            });
        }

        // Construir URLs de las imágenes
        const uploadedImages = req.files.map(file => ({
            url: `/uploads/products/${file.filename}`,
            filename: file.filename,
            originalName: file.originalname,
            size: file.size,
            mimetype: file.mimetype
        }));

        res.status(200).json({
            success: true,
            message: 'Imágenes subidas exitosamente',
            data: uploadedImages
        });

    } catch (error) {
        console.error('Error uploading images:', error);
        res.status(500).json({
            success: false,
            message: 'Error al subir imágenes'
        });
    }
};

export const deleteImage = async (req, res) => {
  try {
    const { filename } = req.params;
    const productId = (req.query.productId || '').toString().replace(/[^a-zA-Z0-9_-]/g, '');

    // Validación básica del nombre (solo caracteres seguros y algunos símbolos)
    if (!filename || !/^[a-zA-Z0-9._-]+$/.test(filename)) {
      return res.status(400).json({ success: false, message: 'Filename inválido' });
    }

    // Si nos dan productId, exigir que el filename empiece por ese prefijo
    if (productId) {
      if (!filename.startsWith(`${productId}-`)) {
        return res.status(403).json({ success: false, message: 'El archivo no pertenece a ese producto' });
      }
    }

    const filePath = path.join(__dirname, '..', 'uploads', 'products', filename);

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      return res.status(200).json({ success: true, message: 'Imagen eliminada' });
    } else {
      return res.status(404).json({ success: false, message: 'Imagen no encontrada' });
    }
  } catch (error) {
    console.error('Error deleting image:', error);
    return res.status(500).json({ success: false, message: 'Error al eliminar imagen' });
  }
};

// Para servir imágenes estáticas en Express
export const setupStaticFiles = (app) => {
    app.use('/uploads', (req, res, next) => {
        // Configurar CORS si es necesario
        res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
        next();
    }, express.static(path.join(__dirname, '..', 'uploads')));
};*/