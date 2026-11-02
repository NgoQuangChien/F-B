import axiosApi from './axios'

const categoryApi = {
    getAllCategories: () =>
        axiosApi.get('categoryRoute/allCategory'),
}

export default categoryApi;