import axiosApi from './axios'

const categoryApi = {
    createCategory: (data) =>
        axiosApi.post("/categoryRoute/createCategory", data),

    getAllCategories: () =>
        axiosApi.get('categoryRoute/allCategory'),

    getCategoryById: (categoryId) =>
        axiosApi.get(`/categoryRoute/${categoryId}`),
}

export default categoryApi;