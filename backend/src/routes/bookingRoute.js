
const express = require("express");
const router = express.Router();

const bookingController = require("../controllers/bookingController");
const authMiddleware = require("../middlewares/auth");

// =====================================================
// 1. DỊCH VỤ CỦA QUÁN
// =====================================================
router.get(
    "/services/:businessId",
    bookingController.getServicesByBusiness
);

// =====================================================
// 2. KHÁCH HÀNG
// =====================================================

// Tạo yêu cầu đặt chỗ
router.post(
    "/createBooking",
    authMiddleware,
    bookingController.createBooking
);

// Xem danh sách đặt chỗ của mình
router.get(
    "/myBookings",
    authMiddleware,
    bookingController.getMyBookings
);

// Xem chi tiết đặt chỗ của mình
router.get(
    "/myBookings/:bookingId",
    authMiddleware,
    bookingController.getMyBookingDetail
);

// Hủy đặt chỗ
router.put(
    "/cancelBooking/:bookingId",
    authMiddleware,
    bookingController.cancelBooking
);


// QUẢN LÝ ĐẶT CHỖ CỦA QUÁN
// Xem danh sách đặt chỗ
router.get(
    "/business/:businessId",
    authMiddleware,
    bookingController.getBookingsByBusiness
);

// Xem chi tiết đặt chỗ
router.get(
    "/business/:businessId/:bookingId",
    authMiddleware,
    bookingController.getBusinessBookingDetail
);

// Lấy danh sách tài nguyên và trạng thái theo khung giờ
router.get(
    "/business/:businessId/booking/:bookingId/resources",
    authMiddleware,
    bookingController.getResourcesByBooking
);

// Xác nhận đặt chỗ và phân tài nguyên
router.put(
    "/business/:businessId/confirm/:bookingId",
    authMiddleware,
    bookingController.confirmBooking
);

// Từ chối đặt chỗ
router.put(
    "/business/:businessId/reject/:bookingId",
    authMiddleware,
    bookingController.rejectBooking
);

module.exports = router;
