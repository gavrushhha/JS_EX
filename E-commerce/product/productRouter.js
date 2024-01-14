const router = require("express").Router();
const controller = require('./productController')
const {check} = require("express-validator")
const Role = require('../models/Role')
const roleMiddleware = require('../access/roleAccess')

router.post('/product-add',[
    check('title', "Название не может быть пустым").notEmpty(),
    check('price', "Цена не может быть равна 0 и меньше его").notEmpty()
], roleMiddleware(["ADMIN"]), controller.addProducts)

router.get('/products', controller.getProducts)


module.exports = router