import jwt from 'jsonwebtoken';

export const verifyToken = (req, res, next) => {
  try {
    const token = req.cookies.accessToken
    const secret = process.env.JWT_SECRET;
    if (!secret) return res.status(500).json({ success: false, message: 'Server misconfigured' });

    const payload = jwt.verify(token, secret);
    req.user = payload;
    // exigir admin; cambiar según tu esquema de roles si hace falta
    if (payload.userId !== '695af4e4e555d5556d68dfc1') {
      return res.status(403).json({ success: false, message: 'Se requieren privilegios de administrador' });
    }
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Token inválido' });
  }
};


/*import jwt from 'jsonwebtoken';

export const verifyToken = (req, res, next) => {
  try { //accessToken
    const token = req.cookies.accessToken
    const secret = process.env.JWT_SECRET;
    if (!secret) return res.status(500).json({ success: false, message: 'Server misconfigured' });

    const payload = jwt.verify(token, secret)
    req.user = payload;
    // exigir admin; cambiar según tu esquema de roles
    console.log(payload)
    if (payload.userId !== '695af4e4e555d5556d68dfc1') {
      return res.status(403).json({ success: false, message: 'Se requieren privilegios de administrador' });
    }
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Token inválido' });
  }
};*/