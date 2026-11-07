const { pool } = require("../configs/database");

const employeeModel = {
    // Kiểm tra quán có thuộc chủ quán đang đăng nhập không
    checkBusinessOwner: async (businessId, ownerId) => {
        const sql = `
            SELECT businessId
            FROM Businesses
            WHERE businessId = ?
              AND userId = ?
            LIMIT 1
        `;

        const [rows] = await pool.execute(sql, [businessId, ownerId]);

        return rows.length > 0;
    },

    // Tạo tài khoản nhân viên và hồ sơ nhân viên
    createEmployee: async (data) => {
        const connection = await pool.getConnection();

        try {
            await connection.beginTransaction();

            const {
                businessId,
                fullName,
                email,
                password,
                phone
            } = data;

            // Kiểm tra email đã tồn tại chưa
            const [existingUsers] = await connection.execute(
                `SELECT userId FROM Users WHERE email = ? LIMIT 1`,
                [email]
            );

            if (existingUsers.length > 0) {
                throw new Error("EMAIL_EXISTS");
            }

            // Lấy role nhân viên quản lý
            const [roles] = await connection.execute(
                `SELECT roleId FROM Roles WHERE roleName = ? LIMIT 1`,
                ["manage"]
            );

            if (roles.length === 0) {
                throw new Error("MANAGER_ROLE_NOT_FOUND");
            }

            // 1. Tạo tài khoản đăng nhập
            const [userResult] = await connection.execute(
                `
                    INSERT INTO Users (fullName, email, password)
                    VALUES (?, ?, ?)
                `,
                [fullName, email, password]
            );

            const userId = userResult.insertId;
            const roleId = roles[0].roleId;

            // 2. Gán vai trò nhân viên quản lý
            await connection.execute(
                `
                    INSERT INTO UserRoles (userId, roleId)
                    VALUES (?, ?)
                `,
                [userId, roleId]
            );

            // 3. Tạo hồ sơ nhân viên và gắn với quán
            const [employeeResult] = await connection.execute(
                `
                    INSERT INTO Employees (
                        userId,
                        businessId,
                        phone
                    )
                    VALUES (?, ?, ?)
                `,
                [userId, businessId, phone || null]
            );

            await connection.commit();

            return {
                employeeId: employeeResult.insertId,
                userId
            };

        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    },

    // Lấy danh sách nhân viên của một quán
    getEmployeesByBusiness: async (businessId) => {
        const sql = `
            SELECT
                e.employeeId,
                e.userId,
                e.businessId,
                u.fullName,
                u.email,
                e.phone,
                e.status,
                e.createdAt,
                e.updatedAt
            FROM Employees e
            JOIN Users u ON e.userId = u.userId
            WHERE e.businessId = ?
            ORDER BY e.createdAt DESC
        `;

        const [rows] = await pool.execute(sql, [businessId]);

        return rows;
    },

    // Lấy chi tiết một nhân viên thuộc một quán
    getEmployeeById: async (employeeId, businessId) => {
        const sql = `
            SELECT
                e.employeeId,
                e.userId,
                e.businessId,
                u.fullName,
                u.email,
                e.phone,
                e.status,
                e.createdAt,
                e.updatedAt
            FROM Employees e
            JOIN Users u ON e.userId = u.userId
            WHERE e.employeeId = ?
              AND e.businessId = ?
            LIMIT 1
        `;

        const [rows] = await pool.execute(sql, [
            employeeId,
            businessId
        ]);

        return rows[0] || null;
    },

    getEmployeeBusinessByUserId: async (userId) => {
        const [rows] = await pool.query(`
            SELECT
                e.employeeId,
                e.userId,
                e.businessId,
                e.phone,
                e.status
            FROM Employees e
            WHERE e.userId = ?
            AND e.status = 'active'
            LIMIT 1
        `, [userId]);

        return rows[0] || null;
    },

    // Cập nhật trạng thái nhân viên
    updateEmployeeStatus: async (employeeId, businessId, status) => {
        const sql = `
            UPDATE Employees
            SET status = ?
            WHERE employeeId = ?
            AND businessId = ?
        `;

        const [result] = await pool.execute(sql, [
            status,
            employeeId,
            businessId
        ]);

        return result.affectedRows > 0;
    },
};

module.exports = employeeModel;