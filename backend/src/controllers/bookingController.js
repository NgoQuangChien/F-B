
const bookingModel = require("../models/bookingModel");

const bookingController = {

    // =====================================================
    // 1. LẤY DANH SÁCH DỊCH VỤ CỦA QUÁN
    // =====================================================
    getServicesByBusiness: async (req, res) => {
        try {
            const businessId = Number(req.params.businessId);

            if (!Number.isInteger(businessId) || businessId <= 0) {
                return res.status(400).json({
                    success: false,
                    message: "Mã quán không hợp lệ"
                });
            }

            const data = await bookingModel.getServicesByBusinessId(
                businessId
            );

            return res.status(200).json({
                success: true,
                message: "Lấy danh sách dịch vụ thành công",
                data
            });
        } catch (error) {
            console.error("getServicesByBusiness:", error);

            return res.status(500).json({
                success: false,
                message: "Không thể lấy danh sách dịch vụ"
            });
        }
    },

    // =====================================================
    // 2. KHÁCH HÀNG TẠO YÊU CẦU ĐẶT CHỖ
    // =====================================================
    createBooking: async (req, res) => {
        try {
            const userId = req.user?.userId;

            if (!userId) {
                return res.status(401).json({
                    success: false,
                    message: "Vui lòng đăng nhập"
                });
            }

            const {
                businessId,
                serviceId,
                customerName,
                customerPhone,
                bookingDate,
                startTime,
                endTime,
                duration,
                numberOfPeople,
                serviceOption,
                areaPreference,
                customerNote
            } = req.body;

            if (
                !businessId ||
                !serviceId ||
                !customerName ||
                !customerPhone ||
                !bookingDate
            ) {
                return res.status(400).json({
                    success: false,
                    message: "Vui lòng nhập đầy đủ thông tin đặt chỗ"
                });
            }

            const parsedBusinessId = Number(businessId);
            const parsedServiceId = Number(serviceId);

            if (
                !Number.isInteger(parsedBusinessId) ||
                parsedBusinessId <= 0 ||
                !Number.isInteger(parsedServiceId) ||
                parsedServiceId <= 0
            ) {
                return res.status(400).json({
                    success: false,
                    message: "Mã quán hoặc mã dịch vụ không hợp lệ"
                });
            }

            const data = await bookingModel.createBooking({
                userId,
                businessId: parsedBusinessId,
                serviceId: parsedServiceId,
                customerName,
                customerPhone,
                bookingDate,
                startTime,
                endTime,
                duration,
                numberOfPeople,
                serviceOption,
                areaPreference,
                customerNote
            });

            return res.status(201).json({
                success: true,
                message: "Gửi yêu cầu đặt chỗ thành công",
                data
            });
        } catch (error) {
            console.error("createBooking:", error);

            return res.status(400).json({
                success: false,
                message: error.message || "Không thể tạo yêu cầu đặt chỗ"
            });
        }
    },

    // =====================================================
    // 3. KHÁCH HÀNG XEM DANH SÁCH ĐẶT CHỖ CỦA MÌNH
    // =====================================================
    getMyBookings: async (req, res) => {
        try {
            const userId = req.user?.userId;

            if (!userId) {
                return res.status(401).json({
                    success: false,
                    message: "Vui lòng đăng nhập"
                });
            }

            const data = await bookingModel.getBookingsByUserId(userId);

            return res.status(200).json({
                success: true,
                message: "Lấy danh sách đặt chỗ thành công",
                data
            });
        } catch (error) {
            console.error("getMyBookings:", error);

            return res.status(500).json({
                success: false,
                message: "Không thể lấy danh sách đặt chỗ"
            });
        }
    },

    // =====================================================
    // 4. KHÁCH HÀNG XEM CHI TIẾT ĐẶT CHỖ CỦA MÌNH
    // =====================================================
    getMyBookingDetail: async (req, res) => {
        try {
            const userId = req.user?.userId;
            const bookingId = Number(req.params.bookingId);

            if (!userId) {
                return res.status(401).json({
                    success: false,
                    message: "Vui lòng đăng nhập"
                });
            }

            if (!Number.isInteger(bookingId) || bookingId <= 0) {
                return res.status(400).json({
                    success: false,
                    message: "Mã đặt chỗ không hợp lệ"
                });
            }

            const data = await bookingModel.getBookingByUser(
                bookingId,
                userId
            );

            if (!data) {
                return res.status(404).json({
                    success: false,
                    message: "Không tìm thấy yêu cầu đặt chỗ"
                });
            }

            return res.status(200).json({
                success: true,
                message: "Lấy thông tin đặt chỗ thành công",
                data
            });
        } catch (error) {
            console.error("getMyBookingDetail:", error);

            return res.status(500).json({
                success: false,
                message: "Không thể lấy thông tin đặt chỗ"
            });
        }
    },

    // =====================================================
    // 5. QUÁN XEM DANH SÁCH ĐẶT CHỖ
    // =====================================================
    getBookingsByBusiness: async (req, res) => {
        try {
            const businessId = Number(req.params.businessId);
            const { status } = req.query;

            if (!Number.isInteger(businessId) || businessId <= 0) {
                return res.status(400).json({
                    success: false,
                    message: "Mã quán không hợp lệ"
                });
            }

            const validStatuses = [
                "pending",
                "confirmed",
                "rejected",
                "cancelled",
                "completed"
            ];

            if (status && !validStatuses.includes(status)) {
                return res.status(400).json({
                    success: false,
                    message: "Trạng thái đặt chỗ không hợp lệ"
                });
            }

            // TODO: Kiểm tra người dùng có quyền quản lý quán này.

            const data = await bookingModel.getBookingsByBusinessId(
                businessId,
                status || null
            );

            return res.status(200).json({
                success: true,
                message: "Lấy danh sách đặt chỗ của quán thành công",
                data
            });
        } catch (error) {
            console.error("getBookingsByBusiness:", error);

            return res.status(500).json({
                success: false,
                message: "Không thể lấy danh sách đặt chỗ của quán"
            });
        }
    },

    // =====================================================
    // 6. QUÁN XEM CHI TIẾT MỘT YÊU CẦU ĐẶT CHỖ
    // =====================================================
    getBusinessBookingDetail: async (req, res) => {
        try {
            const businessId = Number(req.params.businessId);
            const bookingId = Number(req.params.bookingId);

            if (
                !Number.isInteger(businessId) ||
                businessId <= 0 ||
                !Number.isInteger(bookingId) ||
                bookingId <= 0
            ) {
                return res.status(400).json({
                    success: false,
                    message: "Mã quán hoặc mã đặt chỗ không hợp lệ"
                });
            }

            // TODO: Kiểm tra quyền quản lý quán.

            const data = await bookingModel.getBookingByBusiness(
                bookingId,
                businessId
            );

            if (!data) {
                return res.status(404).json({
                    success: false,
                    message: "Không tìm thấy yêu cầu đặt chỗ"
                });
            }

            return res.status(200).json({
                success: true,
                message: "Lấy chi tiết đặt chỗ thành công",
                data
            });
        } catch (error) {
            console.error("getBusinessBookingDetail:", error);

            return res.status(500).json({
                success: false,
                message: "Không thể lấy chi tiết đặt chỗ"
            });
        }
    },

    // =====================================================
    // 7. QUÁN XÁC NHẬN ĐẶT CHỖ VÀ PHÂN TÀI NGUYÊN
    // =====================================================
    confirmBooking: async (req, res) => {
        try {
            const handledBy = req.user?.userId;
            const businessId = Number(req.params.businessId);
            const bookingId = Number(req.params.bookingId);
            const { resourceId } = req.body;

            if (!handledBy) {
                return res.status(401).json({
                    success: false,
                    message: "Vui lòng đăng nhập"
                });
            }

            if (
                !Number.isInteger(businessId) ||
                businessId <= 0 ||
                !Number.isInteger(bookingId) ||
                bookingId <= 0
            ) {
                return res.status(400).json({
                    success: false,
                    message: "Mã quán hoặc mã đặt chỗ không hợp lệ"
                });
            }

            let parsedResourceId = null;

            if (resourceId !== undefined && resourceId !== null) {
                parsedResourceId = Number(resourceId);

                if (
                    !Number.isInteger(parsedResourceId) ||
                    parsedResourceId <= 0
                ) {
                    return res.status(400).json({
                        success: false,
                        message: "Mã tài nguyên không hợp lệ"
                    });
                }
            }

            // TODO: Kiểm tra handledBy có quyền quản lý businessId.

            const data = await bookingModel.confirmBooking({
                bookingId,
                businessId,
                resourceId: parsedResourceId,
                handledBy
            });

            return res.status(200).json({
                success: true,
                message: "Xác nhận đặt chỗ thành công",
                data
            });
        } catch (error) {
            console.error("confirmBooking:", error);

            return res.status(400).json({
                success: false,
                message: error.message || "Không thể xác nhận đặt chỗ"
            });
        }
    },

    // =====================================================
    // 8. QUÁN TỪ CHỐI YÊU CẦU ĐẶT CHỖ
    // =====================================================
    rejectBooking: async (req, res) => {
        try {
            const handledBy = req.user?.userId;
            const businessId = Number(req.params.businessId);
            const bookingId = Number(req.params.bookingId);
            const { rejectionReason } = req.body;

            if (!handledBy) {
                return res.status(401).json({
                    success: false,
                    message: "Vui lòng đăng nhập"
                });
            }

            if (
                !Number.isInteger(businessId) ||
                businessId <= 0 ||
                !Number.isInteger(bookingId) ||
                bookingId <= 0
            ) {
                return res.status(400).json({
                    success: false,
                    message: "Mã quán hoặc mã đặt chỗ không hợp lệ"
                });
            }

            await bookingModel.rejectBooking({
                bookingId,
                businessId,
                handledBy,
                rejectionReason
            });

            return res.status(200).json({
                success: true,
                message: "Từ chối yêu cầu đặt chỗ thành công"
            });
        } catch (error) {
            console.error("rejectBooking:", error);

            return res.status(400).json({
                success: false,
                message: error.message || "Không thể từ chối đặt chỗ"
            });
        }
    },

    // =====================================================
    // 9. KHÁCH HÀNG HỦY ĐẶT CHỖ
    // =====================================================
    cancelBooking: async (req, res) => {
        try {
            const userId = req.user?.userId;
            const bookingId = Number(req.params.bookingId);

            if (!userId) {
                return res.status(401).json({
                    success: false,
                    message: "Vui lòng đăng nhập"
                });
            }

            if (!Number.isInteger(bookingId) || bookingId <= 0) {
                return res.status(400).json({
                    success: false,
                    message: "Mã đặt chỗ không hợp lệ"
                });
            }

            await bookingModel.cancelBooking(bookingId, userId);

            return res.status(200).json({
                success: true,
                message: "Hủy đặt chỗ thành công"
            });
        } catch (error) {
            console.error("cancelBooking:", error);

            return res.status(400).json({
                success: false,
                message: error.message || "Không thể hủy đặt chỗ"
            });
        }
    },

    // =====================================================
    // 10. LẤY TÀI NGUYÊN VÀ TRẠNG THÁI THEO KHUNG GIỜ ĐƠN
    // =====================================================
    getResourcesByBooking: async (req, res) => {
        try {
            const { businessId, bookingId } = req.params;

            const resources = await bookingModel.getResourcesByBooking(
                businessId,
                bookingId
            );

            return res.status(200).json({
                success: true,
                message: "Lấy danh sách tài nguyên thành công",
                data: resources
            });
        } catch (error) {
            console.error("Lỗi lấy danh sách tài nguyên:", error);

            return res.status(500).json({
                success: false,
                message: "Không thể lấy danh sách tài nguyên",
                error: error.message
            });
        }
    }
};

module.exports = bookingController;
