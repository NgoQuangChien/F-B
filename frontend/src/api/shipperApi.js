import axiosApi from './axios'

const shipperApi = {
    createShipper: (shipperData) => axiosApi.post('shipperRoute/register', shipperData),

    // Lấy danh sách hồ sơ shipper đang chờ duyệt
    getPendingShippers: () =>
        axiosApi.get("shipperRoute/pending"),

    // Duyệt hoặc từ chối hồ sơ
    reviewShipper: (shipperId, data) =>
        axiosApi.patch(`shipperRoute/${shipperId}/review`, data),
}

export default shipperApi