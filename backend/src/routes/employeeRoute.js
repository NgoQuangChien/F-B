const express = require("express");
const router = express.Router();

const employeeController = require("../controllers/employeeController");
const authMiddleware = require("../middlewares/auth");


router.get("/my-business", authMiddleware, employeeController.getMyBusiness);
// Tạo tài khoản nhân viên
router.post(
    "/businesses/:businessId/employees",
    authMiddleware,
    employeeController.createEmployee
);

// Lấy danh sách nhân viên của quán
router.get(
    "/businesses/:businessId/employees",
    authMiddleware,
    employeeController.getEmployees
);

// Xem chi tiết nhân viên
router.get(
    "/businesses/:businessId/employees/:employeeId",
    authMiddleware,
    employeeController.getEmployeeDetail
);

router.patch(
    "/businesses/:businessId/employees/:employeeId/status",
    authMiddleware,
    employeeController.updateEmployeeStatus
);



module.exports = router;