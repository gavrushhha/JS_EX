const router = require("express").Router();
const controller = require('./authController')
const {check} = require("express-validator")
const authMiddleware = require('../access/authAccess')
const roleMiddleware = require('../access/roleAccess')

router.post('/registration', [
    check('username', "Имя пользователя не может быть пустым").notEmpty(),
    check('password', "Пароль должен быть больше 4 и меньше 16 символов").isLength({min:4, max:16})
], controller.registration)

router.post('/login', controller.login)
router.get('/users', roleMiddleware(["ADMIN"]), controller.getUsers)


module.exports = router