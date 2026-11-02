
const { pool } = require("../configs/database");

const businessModel = {

    // 1. Tạo hồ sơ quán
    createProfile: async (data) => {
        const sql = `
            INSERT INTO businesses (
                userId,
                businessName,
                imageBusiness,
                address,
                addressLink,
                phone,
                email,
                citizenId,
                imageCitizenBefore,
                imageCitizenAfter,
                introduce,
                latitude,
                longitude,
                openStatus,
                status
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')
        `;

        const values = [
            data.userId,
            data.businessName,
            data.imageBusiness,
            data.address,
            data.addressLink,
            data.phone,
            data.email,
            data.citizenId,
            data.imageCitizenBefore,
            data.imageCitizenAfter,
            data.introduce,
            data.latitude,
            data.longitude,
            data.openStatus
        ];

        const [result] = await pool.execute(sql, values);

        return result.insertId;
    },


    // 2. Tìm hồ sơ theo tài khoản chủ quán
    getByUserId: async (userId) => {
        const sql = `
            SELECT *
            FROM businesses
            WHERE userId = ?
        `;

        const [rows] = await pool.execute(sql, [userId]);

        return rows;
    },

    // Tìm hồ sơ theo CCCD
    getByCitizenId: async (citizenId) => {
        const [rows] = await pool.query(
            "SELECT * FROM businesses WHERE citizenId = ? LIMIT 1",
            [citizenId]
        );

        return rows[0] || null;
    },

    checkBusinessExists: async (businessName, address) => {
        const [rows] = await pool.query(
            `SELECT businessId, businessName, address, userId, status
            FROM businesses
            WHERE LOWER(TRIM(businessName)) = LOWER(TRIM(?))
            AND LOWER(TRIM(address)) = LOWER(TRIM(?))
            LIMIT 1`,
            [businessName, address]
        );

        return rows[0] || null;
    },


    // 3. Lấy danh sách hồ sơ chờ duyệt
    getPending: async () => {
        const sql = `
            SELECT b.*, u.fullname
            FROM businesses b
            JOIN users u ON u.userId = b.userId
            WHERE b.status = 'pending'
            ORDER BY b.createdAt ASC
        `;

        const [rows] = await pool.execute(sql);

        return rows;
    },

    // Lấy danh sách quán đã được duyệt
    getAllBusiness: async () => {
        const sql = `
            SELECT *
            FROM businesses
            WHERE status = 'approved'
            ORDER BY businessId DESC
        `;

        const [rows] = await pool.execute(sql);

        return rows;
    },


    // 4. Lấy một hồ sơ để xét duyệt
    getByIdForReview: async (businessId) => {
        const sql = `
            SELECT b.*, u.fullname
            FROM businesses b
            JOIN users u ON u.userId = b.userId
            WHERE b.businessId = ?
            LIMIT 1
        `;

        const [rows] = await pool.execute(sql, [businessId]);

        return rows.length > 0 ? rows[0] : null;
    },


    // 5. Admin duyệt hoặc từ chối hồ sơ
    review: async ({
        businessId,
        adminId,
        status
    }) => {
        const connection = await pool.getConnection();

        try {
            await connection.beginTransaction();

            // Kiểm tra trạng thái hợp lệ
            if (!["approved", "rejected"].includes(status)) {
                const error = new Error("Trạng thái xét duyệt không hợp lệ");
                error.code = "INVALID_STATUS";
                throw error;
            }

            // Kiểm tra tài khoản có role admin không
            const [adminRows] = await connection.execute(
                `
                SELECT u.userId
                FROM users u
                JOIN userroles ur ON ur.userId = u.userId
                JOIN roles r ON r.roleId = ur.roleId
                WHERE u.userId = ?
                  AND r.roleName = 'admin'
                LIMIT 1
                `,
                [adminId]
            );

            if (adminRows.length === 0) {
                const error = new Error("Tài khoản không có quyền admin");
                error.code = "FORBIDDEN";
                throw error;
            }

            // Lấy hồ sơ và khóa dòng trong lúc xét duyệt
            const [profiles] = await connection.execute(
                `
                SELECT userId, status
                FROM businesses
                WHERE businessId = ?
                FOR UPDATE
                `,
                [businessId]
            );

            if (profiles.length === 0) {
                const error = new Error("Không tìm thấy hồ sơ quán");
                error.code = "BUSINESS_NOT_FOUND";
                throw error;
            }

            if (profiles[0].status !== "pending") {
                const error = new Error("Hồ sơ đã được xét duyệt");
                error.code = "BUSINESS_ALREADY_REVIEWED";
                throw error;
            }

            // Cập nhật trạng thái hồ sơ
            await connection.execute(
                `
                UPDATE businesses
                SET status = ?,
                    approvedAt = CASE
                        WHEN ? = 'approved' THEN NOW()
                        ELSE NULL
                    END,
                    updatedAt = NOW()
                WHERE businessId = ?
                `,
                [status, status, businessId]
            );

            // Nếu được duyệt, thêm role owner cho tài khoản
            if (status === "approved") {

                const [roleRows] = await connection.execute(
                    `
                    SELECT roleId
                    FROM roles
                    WHERE roleName = 'owner'
                    LIMIT 1
                    `
                );

                if (roleRows.length === 0) {
                    const error = new Error("Không tìm thấy role owner");
                    error.code = "OWNER_ROLE_NOT_FOUND";
                    throw error;
                }

                const userId = profiles[0].userId;
                const roleId = roleRows[0].roleId;

                // Chỉ thêm role nếu tài khoản chưa có
                await connection.execute(
                    `
                    INSERT INTO userroles (userId, roleId)
                    SELECT ?, ?
                    WHERE NOT EXISTS (
                        SELECT 1
                        FROM userroles
                        WHERE userId = ?
                          AND roleId = ?
                    )
                    `,
                    [userId, roleId, userId, roleId]
                );
            }

            await connection.commit();

            return true;

        } catch (error) {
            await connection.rollback();
            throw error;

        } finally {
            connection.release();
        }
    },

     // Lấy thông tin chi tiết quán
    getBusinessDetail: async (businessId) => {
        const [rows] = await pool.execute(
            `
            SELECT
                businessId,
                userId,
                businessName,
                imageBusiness,
                address,
                addressLink,
                phone,
                email,
                introduce,
                latitude,
                longitude,
                openStatus,
                status,
                createdAt
            FROM businesses
            WHERE businessId = ?
            AND status = 'approved'
            LIMIT 1
            `,
            [businessId]
        );

        return rows[0] || null;
    },
};

module.exports = businessModel;
