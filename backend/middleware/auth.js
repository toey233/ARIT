const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'arit-training-secret-key-2026';

function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'กรุณาเข้าสู่ระบบ' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ message: 'Token ไม่ถูกต้องหรือหมดอายุ' });
        }
        req.user = user;
        next();
    });
}

function authorizeRoles(...roles) {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ message: 'คุณไม่มีสิทธิ์เข้าถึง' });
        }
        next();
    };
}

module.exports = { authenticateToken, authorizeRoles, JWT_SECRET };
