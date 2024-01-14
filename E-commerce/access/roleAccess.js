const jwt = require('jsonwebtoken');
const { secret } = require('../auth/config');
const redisClient = require('../redisClient'); // Импортируйте redisClient

module.exports = function (roles) {
    return async function (req, res, next) {
        if (req.method === "OPTIONS") {
            next();
        }

        try {
            const token = req.headers.authorization.split(' ')[1];
            if (!token) {
                return res.status(403).json({ status: false, error: 'Forbidden', message: "Пользователь не авторизован" });
            }

            // Попытка получения данных о ролях пользователя из кэша
            const cachedUserRoles = await getUserRolesFromCache(token);

            if (cachedUserRoles) {
                // Проверка доступа пользователя по ролям
                checkUserRoles(cachedUserRoles, roles, res, next);
            } else {
                const { roles: userRoles } = jwt.verify(token, secret);

                // Сохранение данных о ролях пользователя в кэше на определенное время (например, 10 минут)
                await setUserRolesCache(token, userRoles, 600);

                // Проверка доступа пользователя по ролям
                checkUserRoles(userRoles, roles, res, next);
            }
        } catch (e) {
            console.log(e);
            return res.status(403).json({ status: false, error: 'Forbidden', message: "Пользователь не авторизован" });
        }
    };
};

function checkUserRoles(userRoles, requiredRoles, res, next) {
    let hasRole = false;
    userRoles.forEach(role => {
        if (requiredRoles.includes(role)) {
            hasRole = true;
        }
    });

    if (!hasRole) {
        return res.status(403).json({ status: false, error: 'Forbidden', message: "У вас нет доступа" });
    }

    next();
}

async function getUserRolesFromCache(token) {
    return new Promise((resolve, reject) => {
        redisClient.get(token, (err, cachedUserRoles) => {
            if (err) {
                reject(err);
            } else {
                resolve(cachedUserRoles ? JSON.parse(cachedUserRoles) : null);
            }
        });
    });
}

async function setUserRolesCache(token, userRoles, expireTimeInSeconds) {
    return new Promise((resolve, reject) => {
        redisClient.setex(token, expireTimeInSeconds, JSON.stringify({ roles: userRoles }), (err) => {
            if (err) {
                reject(err);
            } else {
                resolve();
            }
        });
    });
}
