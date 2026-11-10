const express = require("express");
const router = express.Router();

const categoryController = require("../controllers/categoryController");

// Tạo danh mục
router.post("/createCategory", categoryController.createCategory);

// Lấy tất cả danh mục
router.get("/allCategory", categoryController.getAllCategories);

// Lấy danh mục theo ID
router.get("/:categoryId", categoryController.getCategoryById);


module.exports = router;