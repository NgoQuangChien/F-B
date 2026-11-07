
const employeeModel = require("../models/employeeModel");
const bcrypt = require("bcrypt");

const employeeController = {
    // Tạo tài khoản nhân viên quản lý
    createEmployee: async (req, res) => {
        try {
            const ownerId = req.user.userId;
            const businessId = Number(req.params.businessId);

            const { fullName, email, password, phone } = req.body;

            if (!businessId || !fullName || !email || !password) {
                return res.status(400).json({
                    success: false,
                    message: "Vui lòng nhập đầy đủ thông tin nhân viên"
                });
            }

            if (!Number.isInteger(businessId) || businessId <= 0) {
                return res.status(400).json({
                    success: false,
                    message: "Mã quán không hợp lệ"
                });
            }

            if (password.length < 8) {
                return res.status(400).json({
                    success: false,
                    message: "Mật khẩu phải có ít nhất 8 ký tự"
                });
            }

            const isOwner = await employeeModel.checkBusinessOwner(
                businessId,
                ownerId
            );

            if (!isOwner) {
                return res.status(403).json({
                    success: false,
                    message: "Bạn không có quyền quản lý quán này"
                });
            }

            const hashedPassword = await bcrypt.hash(password, 10);

            const result = await employeeModel.createEmployee({
                businessId,
                fullName: fullName.trim(),
                email: email.trim().toLowerCase(),
                password: hashedPassword,
                phone: phone?.trim()
            });

            return res.status(201).json({
                success: true,
                message: "Tạo tài khoản nhân viên thành công",
                data: result
            });

        } catch (error) {
            console.error("Create employee error:", error);

            if (error.message === "EMAIL_EXISTS") {
                return res.status(409).json({
                    success: false,
                    message: "Email đã được sử dụng"
                });
            }

            if (error.message === "MANAGER_ROLE_NOT_FOUND") {
                return res.status(500).json({
                    success: false,
                    message: "Chưa cấu hình vai trò nhân viên quản lý"
                });
            }

            return res.status(500).json({
                success: false,
                message: "Không thể tạo tài khoản nhân viên"
            });
        }
    },

    // Xem danh sách nhân viên của quán
    getEmployees: async (req, res) => {
        try {
            const ownerId = req.user.userId;
            const businessId = Number(req.params.businessId);

            if (!Number.isInteger(businessId) || businessId <= 0) {
                return res.status(400).json({
                    success: false,
                    message: "Mã quán không hợp lệ"
                });
            }

            const isOwner = await employeeModel.checkBusinessOwner(
                businessId,
                ownerId
            );

            if (!isOwner) {
                return res.status(403).json({
                    success: false,
                    message: "Bạn không có quyền xem nhân viên của quán này"
                });
            }

            const employees = await employeeModel.getEmployeesByBusiness(
                businessId
            );

            return res.status(200).json({
                success: true,
                message: "Lấy danh sách nhân viên thành công",
                data: employees
            });

        } catch (error) {
            console.error("Get employees error:", error);

            return res.status(500).json({
                success: false,
                message: "Không thể lấy danh sách nhân viên"
            });
        }
    },

    // Xem chi tiết nhân viên
    getEmployeeDetail: async (req, res) => {
        try {
            const ownerId = req.user.userId;
            const businessId = Number(req.params.businessId);
            const employeeId = Number(req.params.employeeId);

            if (
                !Number.isInteger(businessId) ||
                businessId <= 0 ||
                !Number.isInteger(employeeId) ||
                employeeId <= 0
            ) {
                return res.status(400).json({
                    success: false,
                    message: "Thông tin mã quán hoặc mã nhân viên không hợp lệ"
                });
            }

            const isOwner = await employeeModel.checkBusinessOwner(
                businessId,
                ownerId
            );

            if (!isOwner) {
                return res.status(403).json({
                    success: false,
                    message: "Bạn không có quyền xem thông tin nhân viên"
                });
            }

            const employee = await employeeModel.getEmployeeById(
                employeeId,
                businessId
            );

            if (!employee) {
                return res.status(404).json({
                    success: false,
                    message: "Không tìm thấy nhân viên"
                });
            }

            return res.status(200).json({
                success: true,
                message: "Lấy thông tin nhân viên thành công",
                data: employee
            });

        } catch (error) {
            console.error("Get employee detail error:", error);

            return res.status(500).json({
                success: false,
                message: "Không thể lấy thông tin nhân viên"
            });
        }
    },

    // Lấy thông tin quán được phân công của nhân viên đang đăng nhập
    getMyBusiness: async (req, res) => {
        try {
            const userId = req.user.userId;

            const employee = await employeeModel.getEmployeeBusinessByUserId(
                userId
            );

            if (!employee) {
                return res.status(404).json({
                    success: false,
                    message: "Tài khoản chưa được phân công quán hoặc đã ngừng hoạt động"
                });
            }

            return res.status(200).json({
                success: true,
                message: "Lấy thông tin quán được phân công thành công",
                data: employee
            });

        } catch (error) {
            console.error("Get my business error:", error);

            return res.status(500).json({
                success: false,
                message: "Không thể lấy thông tin quán được phân công"
            });
        }
    },

    // Cập nhật trạng thái nhân viên
    updateEmployeeStatus: async (req, res) => {
        try {
            const { businessId, employeeId } = req.params;
            const { status } = req.body;
            const userId = req.user.userId;

            // Chỉ chấp nhận 2 trạng thái
            if (!["active", "inactive"].includes(status)) {
                return res.status(400).json({
                    success: false,
                    message: "Trạng thái không hợp lệ!"
                });
            }

            // Kiểm tra người thực hiện có phải chủ quán không
            const isOwner = await employeeModel.checkBusinessOwner(
                businessId,
                userId
            );

            if (!isOwner) {
                return res.status(403).json({
                    success: false,
                    message: "Bạn không có quyền thực hiện thao tác này!"
                });
            }

            const updated = await employeeModel.updateEmployeeStatus(
                employeeId,
                businessId,
                status
            );

            if (!updated) {
                return res.status(404).json({
                    success: false,
                    message: "Không tìm thấy nhân viên!"
                });
            }

            return res.status(200).json({
                success: true,
                message: status === "inactive"
                    ? "Đã cho nhân viên nghỉ việc!"
                    : "Đã kích hoạt lại tài khoản nhân viên!"
            });

        } catch (error) {
            console.error("Lỗi cập nhật trạng thái nhân viên:", error);

            return res.status(500).json({
                success: false,
                message: "Lỗi server!"
            });
        }
    },
};

module.exports = employeeController;
