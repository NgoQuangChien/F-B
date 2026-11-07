const favoriteModel = require("../models/favoriteModel");

const favoriteController = {
    // Thêm yêu thích
    addFavorite: async (req, res) => {
        try {
            const userId = req.user.userId;
            const { businessId } = req.params;

            await favoriteModel.addFavorite(userId, businessId);

            res.status(200).json({
                success: true,
                message: "Đã thêm vào danh sách yêu thích"
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    },

    // Xóa yêu thích
    removeFavorite: async (req, res) => {
        try {
            const userId = req.user.userId;
            const { businessId } = req.params;

            await favoriteModel.removeFavorite(userId, businessId);

            res.status(200).json({
                success: true,
                message: "Đã xóa khỏi danh sách yêu thích"
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    },

    // Lấy danh sách yêu thích
    getFavorites: async (req, res) => {
        try {
            const userId = req.user.userId;

            const favorites = await favoriteModel.getFavorites(userId);

            res.status(200).json({
                success: true,
                data: favorites
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }
};

module.exports = favoriteController;