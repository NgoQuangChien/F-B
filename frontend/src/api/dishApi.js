import axiosApi from './axios'

const dishApi = {
    // Thêm món ăn
    createDish: (dishData) => axiosApi.post('dishRoute/createDish', dishData),

    // Lấy tất cả món ăn
    getAllDishes: () => axiosApi.get('dishRoute/allDish'),

    // Lấy danh sách món ăn theo quán
    getDishesByBusinessId: (businessId) =>
        axiosApi.get(`dishRoute/business/${businessId}`),

    updateDish: (businessId, dishId, dishData) =>
        axiosApi.put(
            `dishRoute/updateDish/${businessId}/${dishId}`,
            dishData
    ),
}

export default dishApi