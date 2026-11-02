const express = require("express");
const router = express.Router();

const businessController = require("../controllers/businessesController");
const authMiddleware = require("../middlewares/auth");
const uploadBusinesses = require("../middlewares/uploadBusinesses");

// Chủ quán đăng ký hồ sơ
router.post("/register", authMiddleware, uploadBusinesses, businessController.register);

// Admin lấy danh sách hồ sơ chờ duyệt
router.get("/pending", authMiddleware, businessController.getPending);

router.get("/getAllBusiness",businessController.getAllBusiness);

router.get("/detail/:businessId", businessController.getBusinessDetail);

router.get("/by-user/:userId", authMiddleware, businessController.getBusinessByUserId);

// Admin duyệt hoặc từ chối hồ sơ
router.patch("/:businessId/review", authMiddleware, businessController.review);

module.exports = router;