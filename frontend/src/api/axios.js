import axios from "axios";

const axiosApi = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
});

axiosApi.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("accessToken");

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },
    (error) => Promise.reject(error)
);

export default axiosApi;