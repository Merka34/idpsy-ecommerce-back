import Banner from '../models/Banner.js';
import fs from 'fs';
import path from 'path';

export const getBanners = async (req, res) => {
    try {
        // En el Home solo queremos los activos y ordenados
        const banners = await Banner.find().sort({ order: 1 });
        res.json({ success: true, data: banners });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const createBanner = async (req, res) => {
    try {
        const newBanner = new Banner(req.body);
        await newBanner.save();
        res.status(201).json({ success: true, message: 'Banner creado correctamente' });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

export const updateBanner = async (req, res) => {
    try {
        const { id } = req.params;
        const updateBanner = new Banner(req.body);
        const banner = await Banner.findByIdAndUpdate(id, updateBanner,
            { 
                new: true, 
                runValidators: true 
            });
        
        if (!banner) {
            return res.status(404).json({ success: false, message: 'Banner no encontrado' });
        }

        // Cambiamos al valor opuesto
        return res.status(200).json({
            success: true,
            data: updatedProduct
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const changePosition = async (req, res) => {
    try {
        const { id } = req.params;
        
        const oldBanner = await Banner.findOne({ order: req.body.order });
        const banner = await Banner.findById(id);
        if (!banner) {
            return res.status(404).json({ success: false, message: 'Banner no encontrado' });
        }
        if(oldBanner){
            oldBanner.order = banner.order
            await oldBanner.save()
        }
        banner.order = req.body.order
        await banner.save();
        
        res.json({ 
            success: true, 
            message: `Banner cambiado de posicion a ${banner.order}`,
            data: banner 
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const toggleBannerStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const banner = await Banner.findById(id);
        
        if (!banner) {
            return res.status(404).json({ success: false, message: 'Banner no encontrado' });
        }

        // Cambiamos al valor opuesto
        banner.isActive = !banner.isActive;
        await banner.save();

        res.json({ 
            success: true, 
            message: `Banner ${banner.isActive ? 'activado' : 'desactivado'}`,
            data: banner 
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const deleteBanner = async (req, res) => {
  try {
    const { id } = req.params;
    const banner = await Banner.findById(id);
    if (!banner) return res.status(404).json({ success: false, message: 'Banner no encontrado' });

    // Extraer filename de imageUrl: asumimos /uploads/banners/<filename>
    const parts = banner.imageUrl?.split('/') || [];
    const filename = parts[parts.length - 1];
    if (filename) {
      const filePath = path.join(__dirname, '..', 'uploads', 'banners', filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    await Banner.findByIdAndDelete(id);
    res.json({ success: true, message: 'Banner eliminado' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};