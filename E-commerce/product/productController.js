const Product = require('../models/Product');
const redisClient = require('../redisClient'); // Импортируйте redisClient

class ProductController {
    async addProducts(req, res) {
        try {
            const { title, description, price } = req.body;
            const candidate = await Product.findOne({ title });

            if (candidate) {
                return res.status(409).json({ status: false, error: 'Conflict', message: "Товар с таким названием уже существует" });
            }

            const product = new Product({ title, description, price });
            await product.save();

            // Очистка кэша товаров после добавления нового товара
            await clearProductsCache();

            return res.status(201).json({ status: true, message: "Товар успешно добавлен" });
        } catch (e) {
            console.log(e);
            res.status(500).json({ status: false, error: 'Internal Server Error', message: 'Add error' });
        }
    }

    async getProducts(req, res) {
        try {
            const cachedProducts = await getProductsFromCache();

            if (cachedProducts) {
                return res.status(200).json({ status: true, message: 'Вот список актуальных товаров', data: cachedProducts });
            }

            const products = await Product.find({}, { _id: 0 });

            // Сохранение списка товаров в кэше на определенное время (например, 5 минут)
            await setProductsCache(products, 300);

            res.status(200).json({ status: true, message: 'Вот список актуальных товаров', data: products });
        } catch (e) {
            res.status(500).json({
                status: false,
                error: 'Internal Server Error',
                message: 'Failed to retrieve products'
            });
        }
    }
}

async function getProductsFromCache() {
    return new Promise((resolve, reject) => {
        // Check if the Redis client is connected before trying to get data
        if (!redisClient.connected) {
            console.log("Redis client is not connected");
            resolve(null); // Resolve with null or an empty array, depending on your use case
            return;
        }

        redisClient.get("products", (err, cachedProducts) => {
            if (err) {
                console.error("Error getting products from cache:", err);
                reject(err);
            } else {
                try {
                    resolve(cachedProducts ? JSON.parse(cachedProducts) : null);
                } catch (parseError) {
                    console.error("Error parsing cached products:", parseError);
                    reject(parseError);
                }
            }
        });
    });
}

async function setProductsCache(products, expireTimeInSeconds) {
    return new Promise((resolve, reject) => {
        redisClient.setex("products", expireTimeInSeconds, JSON.stringify(products), (err) => {
            if (err) {
                reject(err);
            } else {
                resolve();
            }
        });
    });
}

async function clearProductsCache() {
    return new Promise((resolve, reject) => {
        if (redisClient.connected) {
            redisClient.del("products", (err) => {
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            });
        } else {
            // If Redis client is already closed, resolve the promise immediately
            console.log("Redis client is already closed");
            resolve();
        }
    });
}

process.on("SIGINT", () => {
    redisClient.quit(() => {
        console.log("Closing Redis client");
        process.exit();
    });
});

redisClient.on('connect', () => {
    console.log('Connected to Redis server');
    console.log("Redis client state:", redisClient.connected);
});
module.exports = new ProductController();
