import axiosApi from "./axios";

const bookingApi = {
    // LẤY DANH SÁCH DỊCH VỤ CỦA QUÁN
    getServicesByBusinessId: (businessId) => {
        return axiosApi.get(`bookingRoute/services/${businessId}`);
    },

    // KHÁCH HÀNG TẠO YÊU CẦU ĐẶT CHỖ
    createBooking: (data) => {
        return axiosApi.post("bookingRoute/createBooking", data);
    },

    // KHÁCH HÀNG XEM DANH SÁCH ĐẶT CHỖ
    getMyBookings: () => {
        return axiosApi.get("bookingRoute/myBookings");
    },

    // KHÁCH HÀNG XEM CHI TIẾT ĐẶT CHỖ
    getMyBookingDetail: (bookingId) => {
        return axiosApi.get(`bookingRoute/myBookings/${bookingId}`);
    },

    // KHÁCH HÀNG HỦY ĐẶT CHỖ
    cancelBooking: (bookingId) => {
        return axiosApi.put(`bookingRoute/cancelBooking/${bookingId}`);
    },

    // QUÁN XEM DANH SÁCH ĐẶT CHỖ
    getBookingsByBusiness: (businessId, status = "") => {
        return axiosApi.get(`bookingRoute/business/${businessId}`, {
            params: status ? { status } : {}
        });
    },

    // QUÁN XEM CHI TIẾT ĐẶT CHỖ
    getBusinessBookingDetail: (businessId, bookingId) => {
        return axiosApi.get(
            `bookingRoute/business/${businessId}/${bookingId}`
        );
    },

    // LẤY DANH SÁCH TÀI NGUYÊN VÀ TRẠNG THÁI
    getResourcesByBooking: (businessId, bookingId) => {
        return axiosApi.get(
            `bookingRoute/business/${businessId}/booking/${bookingId}/resources`
        );
    },

    // QUÁN XÁC NHẬN ĐẶT CHỖ VÀ PHÂN BÀN/PHÒNG/SÂN
    confirmBooking: (businessId, bookingId, resourceId = null) => {
        return axiosApi.put(
            `bookingRoute/business/${businessId}/confirm/${bookingId}`,
            { resourceId }
        );
    },

    // QUÁN TỪ CHỐI ĐẶT CHỖ
    rejectBooking: (businessId, bookingId, rejectionReason) => {
        return axiosApi.put(
            `bookingRoute/business/${businessId}/reject/${bookingId}`,
            { rejectionReason }
        );
    }
};

export default bookingApi;