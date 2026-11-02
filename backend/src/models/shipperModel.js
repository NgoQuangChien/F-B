const {pool} = require("../configs/database");

const shipperModel = {
    createProfile: async(data) => {
        const sql = `
            INSERT INTO shippers (
                shipperName,
                userId,
                phone,
                citizenId,
                imageCitizenIdBefore,
                imageCitizenIdAfter,
                imageDrivingLicense,
                licensePlate,
                vehicleType,
                status
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')
        `;

        const values = [
            data.shipperName,
            data.userId,
            data.phone,
            data.citizenId,
            data.imageCitizenIdBefore,
            data.imageCitizenIdAfter,
            data.imageDrivingLicense,
            data.licensePlate,
            data.vehicleType
        ];

        const [result] = await pool.execute(sql, values);

        return result.insertId;
    },


    getByUserId: async(userId) => {
        const [rows] = await pool.execute(
            `SELECT *
            FROM shippers
            WHERE userId = ?
            LIMIT 1
            `,
            [userId]
        );

        if(rows.length > 0) {
            return rows[0];
        } else {
            return null;
        }
    },

    getPending: async () => {
        const [rows] = await pool.execute(
            `SELECT 
                s.*,
                u.email
            FROM shippers s
            JOIN users u ON u.userId = s.userId
            WHERE s.status = 'pending'
            ORDER BY s.createdAt ASC
            `
        );

        return rows;
    },

    getByIdForReview: async (shipperId) => {
        const [rows] = await pool.execute(
            `SELECT
                s.*,
                u.email
            FROM shippers s
            JOIN users u ON u.userId = s.userId
            WHERE s.shipperId = ?
            LIMIT 1
            `,
            [shipperId]
        );

        if (rows.length > 0){
            return rows[0];
        } else {
            return null;
        }
    },

    review: async ({
        shipperId,
        adminId,
        status,
        rejectionReason
    }) => {
        const connection = await pool.getConnection();

        try{
            await connection.beginTransaction();

            const [adminRows] = await connection.execute(
                `SELECT u.userId
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
                const error = new Error(
                    "Tài khoản không có quyền admin"
                );
                error.code = "FORBIDDEN";
                throw error;
            }

            // 2. Lấy hồ sơ và khóa dòng để tránh xét duyệt đồng thời
            const [profiles] = await connection.execute(
                `SELECT userId, status
                FROM shippers
                WHERE shipperId = ?
                FOR UPDATE`,
                [shipperId]
            );

            if (profiles.length === 0) {
                const error = new Error("Không tìm thấy hồ sơ shipper");
                error.code = "SHIPPER_NOT_FOUND";
                throw error;
            }

            if (profiles[0].status !== "pending") {
                const error = new Error(
                    "Hồ sơ đã được xét duyệt trước đó"
                );
                error.code = "SHIPPER_ALREADY_REVIEWED";
                throw error;
            }

            // 3. Cập nhật kết quả xét duyệt và thông tin admin
            await connection.execute(
                `UPDATE shippers
                SET status = ?,
                    rejectionReason = ?,
                    reviewedBy = ?,
                    approvedAt = CASE
                        WHEN ? = 'approved' THEN NOW()
                        ELSE NULL
                    END
                WHERE shipperId = ?`,
                [
                    status,
                    status === "rejected" ? rejectionReason : null,
                    adminId,
                    status,
                    shipperId
                ]
            );

            // 4. Chỉ cấp role shipper nếu hồ sơ được duyệt
            if (status === "approved") {
                const [roleRows] = await connection.execute(
                    `SELECT roleId
                    FROM roles
                    WHERE roleName = 'shipper'
                    LIMIT 1`
                );

                if (roleRows.length === 0) {
                    throw new Error(
                        "Chưa tạo role shipper trong bảng roles"
                    );
                }

                const userId = profiles[0].userId;
                const roleId = roleRows[0].roleId;

                // Thêm role shipper nếu tài khoản chưa có role này
                await connection.execute(
                    `INSERT INTO userroles (userId, roleId)
                    SELECT ?, ?
                    WHERE NOT EXISTS (
                        SELECT 1
                        FROM userroles
                        WHERE userId = ?
                        AND roleId = ?
                    )`,
                    [userId, roleId, userId, roleId]
                );
            }

            await connection.commit();

            return true;
        } catch (error){
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    },
}

module.exports = shipperModel