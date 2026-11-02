const { pool } = require("../configs/database");

const dishModel = {

    // Thêm món ăn
    createDish: async (data) => {
        const {
            businessId,
            categoryId,
            dishName,
            description,
            image,
            price,
            dishType
        } = data;

        const [result] = await pool.execute(
            `INSERT INTO dish (
                businessId,
                categoryId,
                dishName,
                description,
                image,
                price,
                dishType
            ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
                businessId,
                categoryId,
                dishName,
                description || null,
                image || null,
                price,
                dishType || "food"
            ]
        );

        return result;
    },

    // Hiển thị món theo businessId
    getDishesByBusinessId: async (businessId) => {
        const [rows] = await pool.execute(
            `SELECT d.*, c.categoryName
             FROM dish d
             LEFT JOIN category c ON d.categoryId = c.categoryId
             WHERE d.businessId = ?
             ORDER BY d.createdAt DESC`,
            [businessId]
        );

        return rows;
    },

    // Hiển thị tất cả món
    getAllDishes: async () => {
        const [rows] = await pool.execute(
            `SELECT d.*, c.categoryName
             FROM dish d
             LEFT JOIN category c ON d.categoryId = c.categoryId
             ORDER BY d.createdAt DESC`
        );

        return rows;
    },

    getDishById: async (dishId, businessId) => {
        const [rows] = await pool.execute(
            `SELECT *
             FROM dish
             WHERE dishId = ? AND businessId = ?`,
            [dishId, businessId]
        );

        return rows[0] || null;
    },

    // Cập nhật món ăn
    updateDish: async (dishId, businessId, dishData) => {
        const {
            categoryId,
            dishName,
            description,
            image,
            price,
            dishType
        } = dishData;

        const [result] = await pool.execute(
            `UPDATE dish
             SET
                categoryId = ?,
                dishName = ?,
                description = ?,
                image = ?,
                price = ?,
                dishType = ?
             WHERE dishId = ? AND businessId = ?`,
            [
                categoryId,
                dishName,
                description,
                image,
                price,
                dishType,
                dishId,
                businessId
            ]
        );
        return result;
    }

};

module.exports = dishModel;