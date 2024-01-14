const User = require('../models/User')
const Role = require('../models/Role')
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator')
const {secret} = require("./config")

const generateAccessToken = (id, roles) => {
    const payload = {
        id,
        roles
    }
    return jwt.sign(payload, secret, {expiresIn: "24h"} )
}

class authController {
    async registration(req, res) {
        try {
            const errors = validationResult(req)
            if (!errors.isEmpty()) {
                return res.status(400).json({status: false, error: 'Bad Request', message: "Ошибка при регистрации", details: errors.array()})
            }
            const {username, password} = req.body;
            const candidate = await User.findOne({username})
            if (candidate) {
                return res.status(409).json({status: false, error: 'Conflict', message: "Пользователь с таким именем уже существует"})
            }
            const hashPassword = bcrypt.hashSync(password, 7);
            const userRole = await Role.findOne({value: "USER"})
            const user = new User({username, password: hashPassword, roles: [userRole.value]})
            await user.save()
            return res.status(201).json({status: true, message: "Пользователь успешно зарегистрирован" });

        } catch (e) {
            console.log(e)
            res.status(500).json({status: false, error: 'Internal Server Error', message: 'Registration error'})
        }
    }

    async login(req, res) {
        try {
            const {username, password} = req.body
            const user = await User.findOne({username})
            if (!user) {
                return res.status(404).json({status: false, error: 'Not Found', message: `Пользователь ${username} не найден`})
            }
            const validPassword = bcrypt.compareSync(password, user.password)
            if (!validPassword) {
                return res.status(401).json({status: false, error: 'Unauthorized', message: `Введен неверный пароль`})
            }
            const token = generateAccessToken(user._id, user.roles)
            return res.status(200).json({token})
        } catch (e) {
            console.log(e)
            res.status(500).json({status: false, error: 'Internal Server Error', message: 'Login error'})
        }
    }

    async getUsers(req, res) {
        try {
            const cachedUsers = await getUsersFromCache();

            if (cachedUsers) {
                return res.status(200).json({ status: true, message: 'Вот список пользователей', data: cachedUsers });
            }

            const users = await User.find({}, { _id: 0 });

            // Сохранение списка пользователей в кэше на определенное время (например, 5 минут)
            await setUsersCache(users, 300);

            res.status(200).json({ status: true, message: 'Вот список пользователей', data: users });
        } catch (e) {
            res.status(500).json({
                status: false,
                error: 'Internal Server Error',
                message: 'Failed to retrieve users'
            });
        }
    }
}

async function getUsersFromCache() {
    return new Promise((resolve, reject) => {
        redisClient.get("users", (err, cachedUsers) => {
            if (err) {
                reject(err);
            } else {
                resolve(cachedUsers ? JSON.parse(cachedUsers) : null);
            }
        });
    });
}

async function setUsersCache(users, expireTimeInSeconds) {
    return new Promise((resolve, reject) => {
        redisClient.setex("users", expireTimeInSeconds, JSON.stringify(users), (err) => {
            if (err) {
                reject(err);
            } else {
                resolve();
            }
        });
    });
}

module.exports = new authController()