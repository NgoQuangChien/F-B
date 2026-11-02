const {pool} = require("../configs/database");

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
};

module.exports = categoryModel;