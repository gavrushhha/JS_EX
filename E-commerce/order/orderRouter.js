const router = require("express").Router();
const controller = require('./orderController')
const roleMiddleware = require('../access/roleAccess')



router.post("/", controller.newOrder)
router.put("/:id", controller.updatedOrder, roleMiddleware(["ADMIN"]))
router.delete("/id", controller.deleteOrder, roleMiddleware(["ADMIN"]))

router.get("/find/:userId", controller.getUserOrders)
router.get("/", controller.getAllOrders, roleMiddleware(["ADMIN"]))
router.get("/income", controller.getMonthlyIncome, roleMiddleware(["ADMIN"]))

module.exports = router