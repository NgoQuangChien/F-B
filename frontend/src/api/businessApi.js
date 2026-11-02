import axiosApi from './axios'

const businessApi = {
    getAllBusiness: () => axiosApi.get('businessesRoute/getAllBusiness'),
    getPendingBusinesses: () => axiosApi.get('businessesRoute/pending'),
    
    createBusiness: (businessData) => axiosApi.post('businessesRoute/register', businessData),

    getBusinessByUserId: (userId) => axiosApi.get(`businessesRoute/by-user/${userId}`),
    getBusinessById: (businessId) => axiosApi.get(`businessesRoute/${businessId}/review`),

    getBusinessDetail: (businessId) =>
        axiosApi.get(`businessesRoute/detail/${businessId}`),

    // Duyệt hoặc từ chối hồ sơ quán
    reviewBusiness: (businessId, data) =>
        axiosApi.patch(`businessesRoute/${businessId}/review`, data)
}

export default businessApi