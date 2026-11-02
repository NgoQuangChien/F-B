const {pool} = require ("../configs/database");

const authModel = {

    // Thêm người dùng mới
    createUser: async (userData) => {
        const {fullname, email, password, avatar} = userData;

        const sql = `
            INSERT INTO users (
                fullname, email, password, avatar
            ) 
            VALUES (?, ?, ?, ?)
        `;

        const [result] = await pool.execute(sql, [fullname, email, password, avatar]);

        return result.insertId;
    },

    // Lấy thông tin người dùng qua email
    getUserByEmail: async (email) => {
        const sql = `
            SELECT userId, fullname, email, password, avatar
            FROM users
            WHERE email = ?
            LIMIT 1
        `;

        const [rows] = await pool.execute(sql, [email]);

        if (rows.length > 0){
            return rows[0];
        } else {
            return null;
        }
    },

    // Lấy role của người dùng
    getUserRoles: async (userId) => {
        const sql = `
            SELECT
                r.roleId,
                r.roleName
            FROM userroles ur
            JOIN roles r
                ON ur.roleId = r.roleId
            WHERE ur.userId = ?
        `;

        const [rows] = await pool.execute(sql, [userId]);

        return rows;
    },

    // Gán role cho người dùng
    addUserRole: async (userId, roleName) => {
        const sql = `
            INSERT INTO userroles (userId, roleId)
            SELECT ?, r.roleId
            FROM roles r
            WHERE r.roleName = ?
        `;

        const [result] = await pool.execute(sql, [
            userId,
            roleName
        ]);

        if (result.affectedRows > 0) {
            return true;
        } else {
            return false;
        }
    },
}

module.exports = authModel