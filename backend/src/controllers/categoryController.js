const categoryModel = require("../models/categoryModel");

const categoryController = {
    // Lấy tất cả danh mục
    getAllCategories: async (req, res) => {
        try {
            const categories = await categoryModel.getAllCategories();

            return res.status(200).json({
                success: true,
                message: "Lấy danh sách danh mục thành công",
                data: categories,
            });

        } catch (error) {
            console.error("Lỗi lấy danh sách danh mục:", error);

            return res.status(500).json({
                success: false,
                message: "Lỗi server khi lấy danh sách danh mục",
            });
        }
    },

    // Lấy danh mục theo ID
    getCategoryById: async (req, res) => {
        try {
            const { categoryId } = req.params;

            const category = await categoryModel.getCategoryById(categoryId);

            if (!category) {
                return res.status(404).json({
                    success: false,
                    message: "Không tìm thấy danh mục",
                });
            }

            return res.status(200).json({
                success: true,
                message: "Lấy thông tin danh mục thành công",
                data: category,
            });

        } catch (error) {
            console.error("Lỗi lấy danh mục:", error);

            return res.status(500).json({
                success: false,
                message: "Lỗi server khi lấy danh mục",
            });
        }
    },
};

module.exports = categoryController;