const { pool } = require("../configs/database");

const categoryModel = {
    // Lấy tất cả danh mục
    getAllCategories: async () => {
        const [rows] = await pool.execute(
            `SELECT categoryId, categoryName
             FROM category
             ORDER BY categoryId ASC`
        );

        return rows;
    },

    // Lấy danh mục theo ID
    getCategoryById: async (categoryId) => {
        const [rows] = await pool.execute(
            `SELECT categoryId, categoryName
             FROM category
             WHERE categoryId = ?`,
            [categoryId]
        );

        return rows[0];
    },

    // Tạo danh mục mới
    createCategory: async (categoryName) => {
        const connection = await pool.getConnection();

        try {
            const name = categoryName.trim();

            if (!name) {
                throw new Error("Tên danh mục không được để trống.");
            }

            // Kiểm tra danh mục đã tồn tại
            const [existing] = await connection.execute(
                `SELECT categoryId, categoryName
                 FROM category
                 WHERE LOWER(TRIM(categoryName)) = LOWER(?)
                 LIMIT 1`,
                [name]
            );

            if (existing.length > 0) {
                return {
                    ...existing[0],
                    isNew: false
                };
            }

            // Thêm danh mục
            const [result] = await connection.execute(
                `INSERT INTO category (categoryName)
                 VALUES (?)`,
                [name]
            );

            return {
                categoryId: result.insertId,
                categoryName: name,
                isNew: true
            };

        } finally {
            connection.release();
        }
    }
};

module.exports = categoryModel;