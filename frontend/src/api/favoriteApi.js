

import axiosApi from "./axios";

const favoriteApi = {
    // Thêm yêu thích
    addFavorite: (businessId) => axiosApi.post(`/favoriteRoute/${businessId}`),

    // Xóa yêu thích
    removeFavorite: (businessId) => axiosApi.delete(`/favoriteRoute/${businessId}`),

    // Lấy danh sách yêu thích
    getFavorites: () => axiosApi.get("/favoriteRoute/favorites")
};

export default favoriteApi;