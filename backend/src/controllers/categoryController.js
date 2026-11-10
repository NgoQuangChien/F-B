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

    // Tạo danh mục mới
    createCategory: async (req, res) => {
        try {
            const { categoryName } = req.body;

            // Kiểm tra dữ liệu
            if (!categoryName || !categoryName.trim()) {
                return res.status(400).json({
                    success: false,
                    message: "Vui lòng nhập tên danh mục",
                });
            }

            const category = await categoryModel.createCategory(categoryName);

            return res.status(201).json({
                success: true,
                message: category.isNew
                    ? "Thêm danh mục thành công"
                    : "Danh mục đã tồn tại",
                data: category,
            });

        } catch (error) {
            console.error("Lỗi tạo danh mục:", error);

            return res.status(500).json({
                success: false,
                message: "Lỗi server khi tạo danh mục",
            });
        }
    },
};

module.exports = categoryController;