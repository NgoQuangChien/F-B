import axiosApi from "./axios";

const businessImagesApi = {
    // Lấy ảnh của quán
    getImages: (businessId) =>
        axiosApi.get(`businessImagesRoute/${businessId}`),

    // Upload ảnh CardBusiness
    uploadCardImage: (businessId, file) => {
        const formData = new FormData();
        formData.append("image", file);

        return axiosApi.post(
            `businessImagesRoute/${businessId}/card`,
            formData
        );
    },

    // Upload ảnh thư viện
    uploadGalleryImages: (businessId, files) => {
        const formData = new FormData();

        files.forEach(file => {
            formData.append("images", file);
        });

        return axiosApi.post(
            `businessImagesRoute/${businessId}/gallery`,
            formData
        );
    },

    // Xóa ảnh thư viện
    deleteGalleryImage: (businessId, imageId) =>
        axiosApi.delete(
            `businessImagesRoute/${businessId}/gallery/${imageId}`
        )
};

export default businessImagesApi;