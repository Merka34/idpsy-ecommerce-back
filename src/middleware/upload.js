import multer from 'multer';
import path from 'path';
import fs from 'fs';

const baseUploads = path.join(process.cwd(), 'src', 'uploads');
const productsDir = path.join(baseUploads, 'products');
const bannersDir = path.join(baseUploads, 'banners');

[productsDir, bannersDir].forEach(dir => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const productId = (req.query.productId || req.body.productId || '').toString();
    if (productId === 'banners') {
      cb(null, bannersDir);
    } else {
      cb(null, productsDir);
    }
  },
  filename: (req, file, cb) => {
    const rawProductId = (req.query.productId || req.body.productId || '').toString();
    const safeProductId = rawProductId.replace(/[^a-zA-Z0-9_-]/g, '') || `p${Date.now()}`;
    const timestamp = Date.now();
    const safeOriginal = file.originalname
      .replace(/\s+/g, '_')
      .replace(/[^a-zA-Z0-9._-]/g, '');
    const filename = `${safeProductId}-${timestamp}-${safeOriginal}`;
    cb(null, filename);
  },
});

const upload = multer({ storage });

export default upload;


/*import multer from 'multer';
import path from 'path';
import fs from 'fs';

const uploadDir = path.join(process.cwd(), 'src', 'uploads', 'products');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Preferencia: productId en query o body. Fallback to timestamp.
    const rawProductId = (req.query.productId || req.body.productId || '').toString();
    const safeProductId = rawProductId.replace(/[^a-zA-Z0-9_-]/g, '') || `p${Date.now()}`;
    const timestamp = Date.now();
    const safeOriginal = file.originalname.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9._-]/g, '');
    const filename = `${safeProductId}-${timestamp}-${safeOriginal}`;
    cb(null, filename);
  },
});

const upload = multer({ storage });

export default upload;*/