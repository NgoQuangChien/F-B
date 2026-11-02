const express = require("express");
const router = express.Router();
const uploadDish = require("../middlewares/uploadDish");

const dishController = require("../controllers/dishController");

router.post("/createDish", uploadDish, dishController.createDish);

router.get("/allDish", dishController.getAllDishes);

router.get("/business/:businessId", dishController.getDishesByBusinessId);

router.put("/updateDish/:businessId/:dishId",uploadDish,dishController.updateDish);

module.exports = router;