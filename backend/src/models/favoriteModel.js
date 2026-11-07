const { pool } = require("../configs/database");

const favoriteModel = {
    // Thêm quán yêu thích
    addFavorite: async (userId, businessId) => {
        const sql = `
            INSERT IGNORE INTO Favorites (userId, businessId)
            VALUES (?, ?)
        `;

        const [result] = await pool.query(sql, [userId, businessId]);
        return result;
    },

    // Xóa quán yêu thích
    removeFavorite: async (userId, businessId) => {
        const sql = `
            DELETE FROM Favorites
            WHERE userId = ? AND businessId = ?
        `;

        const [result] = await pool.query(sql, [userId, businessId]);
        return result;
    },

    // Kiểm tra quán đã được yêu thích chưa
    checkFavorite: async (userId, businessId) => {
        const sql = `
            SELECT favoriteId
            FROM Favorites
            WHERE userId = ? AND businessId = ?
        `;

        const [rows] = await pool.query(sql, [userId, businessId]);
        return rows.length > 0;
    },

    // Lấy danh sách quán yêu thích
    getFavorites: async (userId) => {
        const sql = `
            SELECT 
                b.*,
                f.favoriteId,
                f.createdAt AS favoritedAt
            FROM Favorites f
            JOIN Businesses b 
                ON f.businessId = b.businessId
            WHERE f.userId = ?
            ORDER BY f.createdAt DESC
        `;

        const [rows] = await pool.query(sql, [userId]);
        return rows;
    }
};

module.exports = favoriteModel;