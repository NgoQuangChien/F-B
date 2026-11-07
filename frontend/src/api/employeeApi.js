import axiosApi from "./axios";

const employeeApi = {
    // Tạo tài khoản nhân viên quản lý
    createEmployee: (businessId, data) => axiosApi.post(`/employeeRoute/businesses/${businessId}/employees`, data),

    // Lấy danh sách nhân viên của quán
    getEmployees: (businessId) => axiosApi.get(`/employeeRoute/businesses/${businessId}/employees`),

    // Xem chi tiết nhân viên
    getEmployeeDetail: (businessId, employeeId) => axiosApi.get(`/employeeRoute/businesses/${businessId}/employees/${employeeId}`),

    getMyBusiness: () => axiosApi.get("/employeeRoute/my-business"),

    updateEmployeeStatus: (businessId, employeeId, status) => axiosApi.patch(`/employeeRoute/businesses/${businessId}/employees/${employeeId}/status`,{ status }),
};

export default employeeApi;