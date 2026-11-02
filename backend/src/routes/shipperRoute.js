
const express = require("express");
const router = express.Router();

const shipperController = require("../controllers/shipperController");

const uploadShipper = require("../middlewares/uploadShipper");
const authMiddleware = require("../middlewares/auth");

// Người dùng đăng ký hồ sơ shipper và tải lên 3 ảnh
router.post("/register",authMiddleware,uploadShipper,shipperController.register);

// Admin lấy danh sách hồ sơ đang chờ duyệt
router.get("/pending",shipperController.getPending);

// Admin duyệt hoặc từ chối hồ sơ
router.patch("/:shipperId/review", authMiddleware , shipperController.review);

module.exports = router;
