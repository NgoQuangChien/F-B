
import axiosApi from './axios'

const authApi = {
    register: (authData) => axiosApi.post('authRoute/register', authData),
    login: (authData) => axiosApi.post('authRoute/login', authData),
}

export default authApi