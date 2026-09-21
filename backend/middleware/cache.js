const NodeCache = require('node-cache');

// สร้าง instance ของ cache 
// stdTTL = อายุของแคช (วินาที)
// checkperiod = ความถี่ในการตรวจสอบและลบแคชที่หมดอายุ (วินาที)
const cache = new NodeCache({ stdTTL: 300, checkperiod: 320 });

/**
 * Middleware สำหรับ Caching API response
 * @param {number} duration - อายุของแคชในหน่วยวินาที
 */
const cacheMiddleware = (duration) => {
    return (req, res, next) => {
        // หากเป็น GET request เราถึงจะทำแคช
        if (req.method !== 'GET') {
            console.error('Cannot cache non-GET methods!');
            return next();
        }

        // ใช้ URL ของ Request เป็น Key ของแคช
        const key = req.originalUrl;
        const cachedResponse = cache.get(key);

        if (cachedResponse) {
            // ส่งข้อมูลที่ถูกแคชกลับไปทันที
            // res.send จะสามารถส่ง JSON ได้ด้วยถ้าข้อมูลเดิมเป็น JSON
            return res.send(cachedResponse);
        } else {
            // ดักจับการเรียก res.send เพื่อเอาข้อมูลมาเก็บในแคชก่อนที่จะส่งให้ Client
            const originalSend = res.send;
            res.send = (body) => {
                // เก็บข้อมูลลงในแคช
                cache.set(key, body, duration);
                // คืนค่าฟังก์ชัน send กลับเป็นปกติแล้วส่งข้อมูลจริง
                originalSend.call(res, body);
            };
            next();
        }
    };
};

module.exports = { cache, cacheMiddleware };
