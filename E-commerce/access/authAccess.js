const jwt = require('jsonwebtoken');
const { secret } = require('../auth/config');
const redisClient = require('../redisClient'); // Импортируйте redisClient

module.exports = async function (req, res, next) {
    if (req.method === "OPTIONS") {
        next();
    }

    try {
        const token = req.headers.authorization.split(' ')[1];
        if (!token) {
            return res.status(403).json({
                status: false,
                error: "Forbidden",
                message: "Пользователь не авторизован"
            });
        }

        // Попытка получения данных о пользователе из кэша
        const cachedUserData = await getUserDataFromCache(token);

        if (cachedUserData) {
            req.user = cachedUserData;
            return next();
        }

        const decodedData = jwt.verify(token, secret);

        // Сохранение данных о пользователе в кэше на определенное время (например, 10 минут)
        await setUserCache(token, decodedData, 600);

        req.user = decodedData;
        next();
    } catch (e) {
        console.log(e);
        return res.status(403).json({
            status: false,
            error: "Forbidden",
            message: "Пользователь не авторизован",
            details: "Ошибка при проверке токена"
        });
    }
};

async function getUserDataFromCache(token) {
    return new Promise((resolve, reject) => {
        redisClient.get(token, (err, cachedUserData) => {
            if (err) {
                reject(err);
            } else {
                resolve(cachedUserData ? JSON.parse(cachedUserData) : null);
            }
        });
    });
}

async function setUserCache(token, userData, expireTimeInSeconds) {
    return new Promise((resolve, reject) => {
        redisClient.setex(token, expireTimeInSeconds, JSON.stringify(userData), (err) => {
            if (err) {
                reject(err);
            } else {
                resolve();
            }
        });
    });
}
