
const { pool } = require("../configs/database");

const bookingModel = {
    // =====================================================
    // 1. LẤY DANH SÁCH DỊCH VỤ CỦA QUÁN
    // =====================================================
    getServicesByBusinessId: async (businessId) => {
        const [rows] = await pool.execute(
            `SELECT
                serviceId,
                businessId,
                serviceName,
                description,
                billingType,
                requiresResource,
                supportsPeople,
                supportsDuration,
                status
            FROM bookingService
            WHERE businessId = ?
                AND status = 'active'
            ORDER BY serviceId DESC`,
            [businessId]
        );

        return rows;
    },

    // =====================================================
    // 2. KHÁCH HÀNG TẠO YÊU CẦU ĐẶT CHỖ
    // =====================================================
    createBooking: async (data) => {
        const connection = await pool.getConnection();

        try {
            await connection.beginTransaction();

            // Kiểm tra dịch vụ có thuộc quán và đang hoạt động không
            const [services] = await connection.execute(
                `SELECT
                    serviceId,
                    businessId,
                    requiresResource,
                    billingType,
                    supportsDuration,
                    supportsPeople
                FROM bookingService
                WHERE serviceId = ?
                    AND businessId = ?
                    AND status = 'active'
                LIMIT 1`,
                [data.serviceId, data.businessId]
            );

            if (services.length === 0) {
                throw new Error(
                    "Dịch vụ không tồn tại hoặc đã ngừng hoạt động"
                );
            }

            const service = services[0];

            // =============================================
            // KIỂM TRA NGÀY ĐẶT CHỖ
            // Không sử dụng new Date() để tránh lệch múi giờ
            // =============================================
            const bookingDate = String(data.bookingDate || "");

            if (!/^\d{4}-\d{2}-\d{2}$/.test(bookingDate)) {
                throw new Error("Ngày đặt chỗ không hợp lệ");
            }

            const [year, month, day] = bookingDate
                .split("-")
                .map(Number);

            const checkDate = new Date(
                Date.UTC(year, month - 1, day)
            );

            // Kiểm tra ngày thực sự tồn tại
            if (
                checkDate.getUTCFullYear() !== year ||
                checkDate.getUTCMonth() !== month - 1 ||
                checkDate.getUTCDate() !== day
            ) {
                throw new Error("Ngày đặt chỗ không hợp lệ");
            }

            // Lấy ngày hiện tại theo múi giờ Việt Nam
            const today = new Intl.DateTimeFormat("en-CA", {
                timeZone: "Asia/Ho_Chi_Minh",
                year: "numeric",
                month: "2-digit",
                day: "2-digit"
            }).format(new Date());

            if (bookingDate < today) {
                throw new Error(
                    "Không thể đặt chỗ trong quá khứ"
                );
            }

            // =============================================
            // KIỂM TRA THỜI GIAN
            // =============================================
            if (service.billingType === "hourly") {
                if (!data.startTime || !data.endTime) {
                    throw new Error(
                        "Vui lòng chọn thời gian bắt đầu và kết thúc"
                    );
                }

                if (data.startTime >= data.endTime) {
                    throw new Error(
                        "Thời gian kết thúc phải sau thời gian bắt đầu"
                    );
                }
            }

            // =============================================
            // KIỂM TRA SỐ NGƯỜI
            // =============================================
            const numberOfPeople = Number(
                data.numberOfPeople || 1
            );

            if (
                !Number.isInteger(numberOfPeople) ||
                numberOfPeople < 1
            ) {
                throw new Error("Số lượng người không hợp lệ");
            }

            const people = service.supportsPeople
                ? numberOfPeople
                : 1;

            // =============================================
            // KIỂM TRA THỜI LƯỢNG
            // =============================================
            const duration =
                service.supportsDuration && data.duration
                    ? Number(data.duration)
                    : null;

            if (
                duration !== null &&
                (!Number.isInteger(duration) || duration <= 0)
            ) {
                throw new Error("Thời lượng sử dụng không hợp lệ");
            }

            // =============================================
            // TẠO YÊU CẦU ĐẶT CHỖ
            // =============================================
            const [result] = await connection.execute(
                `INSERT INTO booking (
                    userId,
                    businessId,
                    serviceId,
                    resourceId,
                    customerName,
                    customerPhone,
                    bookingDate,
                    startTime,
                    endTime,
                    duration,
                    numberOfPeople,
                    serviceOption,
                    areaPreference,
                    customerNote,
                    status
                ) VALUES (?, ?, ?, NULL, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
                [
                    data.userId,
                    data.businessId,
                    data.serviceId,
                    data.customerName,
                    data.customerPhone,
                    bookingDate,
                    data.startTime || null,
                    data.endTime || null,
                    duration,
                    people,
                    data.serviceOption || null,
                    data.areaPreference || null,
                    data.customerNote || null
                ]
            );

            // Lưu lịch sử tạo yêu cầu
            await connection.execute(
                `INSERT INTO bookingHistory (
                    bookingId,
                    actorId,
                    action,
                    oldStatus,
                    newStatus,
                    note
                ) VALUES (?, ?, 'created', NULL, 'pending', ?)`,
                [
                    result.insertId,
                    data.userId,
                    "Khách hàng tạo yêu cầu đặt chỗ"
                ]
            );

            await connection.commit();

            return {
                bookingId: result.insertId
            };
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    },

    // =====================================================
    // 3. KHÁCH HÀNG XEM DANH SÁCH ĐẶT CHỖ CỦA MÌNH
    // =====================================================
    getBookingsByUserId: async (userId) => {
        const [rows] = await pool.execute(
            `SELECT
                b.*,
                DATE_FORMAT(b.bookingDate, '%Y-%m-%d') AS bookingDateFormatted,
                bs.serviceName,
                bs.billingType,
                sr.resourceName
            FROM booking b
            LEFT JOIN bookingService bs
                ON b.serviceId = bs.serviceId
            LEFT JOIN serviceResource sr
                ON b.resourceId = sr.resourceId
            WHERE b.userId = ?
            ORDER BY b.createdAt DESC`,
            [userId]
        );

        return rows.map((item) => ({
            ...item,
            bookingDate: item.bookingDateFormatted
        }));
    },

    // =====================================================
    // 4. KHÁCH HÀNG XEM CHI TIẾT ĐẶT CHỖ CỦA MÌNH
    // =====================================================
    getBookingByUser: async (bookingId, userId) => {
        const [rows] = await pool.execute(
            `SELECT
                b.*,
                DATE_FORMAT(b.bookingDate, '%Y-%m-%d') AS bookingDateFormatted,
                bs.serviceName,
                bs.description AS serviceDescription,
                bs.billingType,
                sr.resourceName,
                sr.resourceType,
                sr.areaName
            FROM booking b
            LEFT JOIN bookingService bs
                ON b.serviceId = bs.serviceId
            LEFT JOIN serviceResource sr
                ON b.resourceId = sr.resourceId
            WHERE b.bookingId = ?
                AND b.userId = ?
            LIMIT 1`,
            [bookingId, userId]
        );

        if (!rows[0]) return null;

        return {
            ...rows[0],
            bookingDate: rows[0].bookingDateFormatted
        };
    },

    // =====================================================
    // 5. QUÁN XEM DANH SÁCH ĐẶT CHỖ
    // =====================================================
    getBookingsByBusinessId: async (businessId, status = null) => {
        let sql = `
            SELECT
                b.*,
                DATE_FORMAT(b.bookingDate, '%Y-%m-%d') AS bookingDateFormatted,
                bs.serviceName,
                bs.billingType,
                bs.requiresResource,
                sr.resourceName
            FROM booking b
            LEFT JOIN bookingService bs
                ON b.serviceId = bs.serviceId
            LEFT JOIN serviceResource sr
                ON b.resourceId = sr.resourceId
            WHERE b.businessId = ?
        `;

        const params = [businessId];

        if (status) {
            sql += ` AND b.status = ?`;
            params.push(status);
        }

        sql += ` ORDER BY b.createdAt DESC`;

        const [rows] = await pool.execute(sql, params);

        return rows.map((item) => ({
            ...item,
            bookingDate: item.bookingDateFormatted
        }));
    },

    // =====================================================
    // 6. QUÁN XEM CHI TIẾT MỘT YÊU CẦU ĐẶT CHỖ
    // =====================================================
    getBookingByBusiness: async (bookingId, businessId) => {
        const [rows] = await pool.execute(
            `SELECT
                b.*,
                DATE_FORMAT(b.bookingDate, '%Y-%m-%d') AS bookingDateFormatted,
                bs.serviceName,
                bs.description AS serviceDescription,
                bs.billingType,
                bs.requiresResource,
                sr.resourceName,
                sr.resourceType,
                sr.areaName
            FROM booking b
            LEFT JOIN bookingService bs
                ON b.serviceId = bs.serviceId
            LEFT JOIN serviceResource sr
                ON b.resourceId = sr.resourceId
            WHERE b.bookingId = ?
                AND b.businessId = ?
            LIMIT 1`,
            [bookingId, businessId]
        );

        if (!rows[0]) return null;

        return {
            ...rows[0],
            bookingDate: rows[0].bookingDateFormatted
        };
    },

    // =====================================================
    // 7. QUÁN XÁC NHẬN ĐẶT CHỖ VÀ PHÂN TÀI NGUYÊN
    // =====================================================
    confirmBooking: async (data) => {
        const connection = await pool.getConnection();

        try {
            await connection.beginTransaction();

            // Khóa yêu cầu đặt chỗ
            const [bookings] = await connection.execute(
                `SELECT
                    b.*,
                    bs.requiresResource,
                    bs.billingType
                FROM booking b
                INNER JOIN bookingService bs
                    ON b.serviceId = bs.serviceId
                WHERE b.bookingId = ?
                    AND b.businessId = ?
                LIMIT 1
                FOR UPDATE`,
                [data.bookingId, data.businessId]
            );

            if (bookings.length === 0) {
                throw new Error("Không tìm thấy yêu cầu đặt chỗ");
            }

            const booking = bookings[0];

            if (booking.status !== "pending") {
                throw new Error(
                    "Yêu cầu đặt chỗ không còn ở trạng thái chờ xác nhận"
                );
            }

            let resourceId = null;

            // Nếu dịch vụ cần tài nguyên
            if (Number(booking.requiresResource) === 1) {
                if (!data.resourceId) {
                    throw new Error(
                        "Vui lòng chọn bàn, phòng hoặc tài nguyên cần phân"
                    );
                }

                // Khóa tài nguyên được chọn
                const [resources] = await connection.execute(
                    `SELECT *
                    FROM serviceResource
                    WHERE resourceId = ?
                        AND serviceId = ?
                        AND status = 'active'
                    LIMIT 1
                    FOR UPDATE`,
                    [data.resourceId, booking.serviceId]
                );

                if (resources.length === 0) {
                    throw new Error(
                        "Tài nguyên không tồn tại hoặc không khả dụng"
                    );
                }

                const resource = resources[0];

                // Kiểm tra sức chứa
                if (
                    resource.capacity !== null &&
                    booking.numberOfPeople > resource.capacity
                ) {
                    throw new Error(
                        "Sức chứa của bàn/phòng/sân không đủ"
                    );
                }

                // Kiểm tra trùng lịch
                if (booking.startTime) {
                    let expectedEndTime = booking.endTime;

                    // Không có giờ kết thúc thì mặc định cộng 2 giờ
                    if (!expectedEndTime) {
                        const [hour, minute] = String(booking.startTime)
                            .slice(0, 8)
                            .split(":")
                            .map(Number);

                        const totalMinutes = hour * 60 + minute + 120;

                        const endHour = Math.floor(totalMinutes / 60) % 24;
                        const endMinute = totalMinutes % 60;

                        expectedEndTime =
                            `${String(endHour).padStart(2, "0")}:` +
                            `${String(endMinute).padStart(2, "0")}:00`;
                    }

                    const [conflicts] = await connection.execute(
                        `SELECT bookingId
                        FROM booking
                        WHERE resourceId = ?
                            AND bookingId <> ?
                            AND bookingDate = ?
                            AND status IN ('pending_deposit', 'confirmed')
                            AND startTime IS NOT NULL
                            AND endTime IS NOT NULL
                            AND startTime < ?
                            AND endTime > ?
                        LIMIT 1
                        FOR UPDATE`,
                        [
                            data.resourceId,
                            data.bookingId,
                            booking.bookingDate,
                            expectedEndTime,
                            booking.startTime
                        ]
                    );

                    if (conflicts.length > 0) {
                        throw new Error(
                            "Tài nguyên đã có đơn trong khoảng thời gian này"
                        );
                    }
                }

                resourceId = data.resourceId;
            }

            // Cập nhật trạng thái và tài nguyên
            await connection.execute(
                `UPDATE booking
                SET status = 'confirmed',
                    resourceId = ?,
                    handledBy = ?,
                    confirmedAt = NOW(),
                    updatedAt = NOW()
                WHERE bookingId = ?`,
                [
                    resourceId,
                    data.handledBy,
                    data.bookingId
                ]
            );

            // Lưu lịch sử xác nhận
            await connection.execute(
                `INSERT INTO bookingHistory (
                    bookingId,
                    actorId,
                    action,
                    oldStatus,
                    newStatus,
                    oldResourceId,
                    newResourceId,
                    note
                ) VALUES (?, ?, 'confirmed', 'pending', 'confirmed', NULL, ?, ?)`,
                [
                    data.bookingId,
                    data.handledBy,
                    resourceId,
                    "Quán đã xác nhận yêu cầu đặt chỗ"
                ]
            );

            await connection.commit();

            return {
                bookingId: data.bookingId,
                resourceId
            };
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    },

    // =====================================================
    // 8. QUÁN TỪ CHỐI YÊU CẦU ĐẶT CHỖ
    // =====================================================
    rejectBooking: async (data) => {
        const connection = await pool.getConnection();

        try {
            await connection.beginTransaction();

            const [bookings] = await connection.execute(
                `SELECT bookingId, status
                FROM booking
                WHERE bookingId = ?
                    AND businessId = ?
                LIMIT 1
                FOR UPDATE`,
                [data.bookingId, data.businessId]
            );

            if (bookings.length === 0) {
                throw new Error("Không tìm thấy yêu cầu đặt chỗ");
            }

            if (bookings[0].status !== "pending") {
                throw new Error(
                    "Chỉ có thể từ chối yêu cầu đang chờ xác nhận"
                );
            }

            await connection.execute(
                `UPDATE booking
                SET status = 'rejected',
                    rejectionReason = ?,
                    handledBy = ?,
                    rejectedAt = NOW(),
                    updatedAt = NOW()
                WHERE bookingId = ?`,
                [
                    data.rejectionReason || null,
                    data.handledBy,
                    data.bookingId
                ]
            );

            await connection.execute(
                `INSERT INTO bookingHistory (
                    bookingId,
                    actorId,
                    action,
                    oldStatus,
                    newStatus,
                    note
                ) VALUES (?, ?, 'rejected', 'pending', 'rejected', ?)`,
                [
                    data.bookingId,
                    data.handledBy,
                    data.rejectionReason ||
                        "Quán từ chối yêu cầu đặt chỗ"
                ]
            );

            await connection.commit();

            return true;
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    },

    // =====================================================
    // 9. KHÁCH HÀNG HỦY ĐẶT CHỖ
    // =====================================================
    cancelBooking: async (bookingId, userId) => {
        const connection = await pool.getConnection();

        try {
            await connection.beginTransaction();

            const [bookings] = await connection.execute(
                `SELECT bookingId, status, resourceId
                FROM booking
                WHERE bookingId = ?
                    AND userId = ?
                LIMIT 1
                FOR UPDATE`,
                [bookingId, userId]
            );

            if (bookings.length === 0) {
                throw new Error("Không tìm thấy yêu cầu đặt chỗ");
            }

            const booking = bookings[0];

            if (
                !["pending", "confirmed"].includes(booking.status)
            ) {
                throw new Error(
                    "Không thể hủy yêu cầu đặt chỗ ở trạng thái hiện tại"
                );
            }

            await connection.execute(
                `UPDATE booking
                SET status = 'cancelled',
                    updatedAt = NOW()
                WHERE bookingId = ?`,
                [bookingId]
            );

            await connection.execute(
                `INSERT INTO bookingHistory (
                    bookingId,
                    actorId,
                    action,
                    oldStatus,
                    newStatus,
                    oldResourceId,
                    newResourceId,
                    note
                ) VALUES (?, ?, 'cancelled', ?, 'cancelled', ?, NULL, ?)`,
                [
                    bookingId,
                    userId,
                    booking.status,
                    booking.resourceId,
                    "Khách hàng đã hủy yêu cầu đặt chỗ"
                ]
            );

            await connection.commit();

            return true;
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    },

    getResourcesByBooking: async (businessId, bookingId) => {

    // =============================================
    // 1. LẤY THÔNG TIN ĐƠN ĐẶT CHỖ
    // =============================================
    const [bookings] = await pool.execute(
        `SELECT
            b.bookingId,
            b.businessId,
            b.serviceId,
            b.bookingDate,
            b.startTime,
            b.endTime,
            b.numberOfPeople,
            b.status,
            bs.billingType,
            bs.requiresResource
        FROM booking b
        INNER JOIN bookingService bs
            ON b.serviceId = bs.serviceId
            AND b.businessId = bs.businessId
        WHERE b.bookingId = ?
            AND b.businessId = ?
        LIMIT 1`,
        [bookingId, businessId]
    );

    if (bookings.length === 0) {
        throw new Error("Không tìm thấy lượt đặt chỗ");
    }

    const booking = bookings[0];

    // Chỉ lấy tài nguyên nếu dịch vụ yêu cầu phân tài nguyên
    if (Number(booking.requiresResource) !== 1) {
        return [];
    }

    // =============================================
    // 2. TÍNH GIỜ KẾT THÚC DỰ KIẾN
    // Nếu không có giờ kết thúc thì cộng 2 giờ
    // =============================================
    let endTime = booking.endTime;

    if (booking.startTime && !endTime) {
        const [hour, minute] = String(booking.startTime)
            .slice(0, 8)
            .split(":")
            .map(Number);

        const totalMinutes = hour * 60 + minute + 120;

        const endHour = Math.floor(totalMinutes / 60) % 24;
        const endMinute = totalMinutes % 60;

        endTime =
            `${String(endHour).padStart(2, "0")}:` +
            `${String(endMinute).padStart(2, "0")}:00`;
    }

    // =============================================
    // 3. LẤY TOÀN BỘ TÀI NGUYÊN
    // VÀ KIỂM TRA TRẠNG THÁI KHẢ DỤNG
    // =============================================
    const [resources] = await pool.execute(
        `SELECT
            sr.resourceId,
            sr.serviceId,
            sr.resourceName,
            sr.resourceType,
            sr.capacity,
            sr.areaName,
            sr.description,
            sr.status AS resourceStatus,

            CASE
                WHEN sr.status <> 'active'
                    THEN 'inactive'

                WHEN sr.capacity IS NOT NULL
                    AND sr.capacity < ?
                    THEN 'insufficient_capacity'

                WHEN EXISTS (
                    SELECT 1
                    FROM booking b
                    WHERE b.resourceId = sr.resourceId
                        AND b.bookingId <> ?
                        AND b.bookingDate = ?
                        AND b.status IN ('pending_deposit', 'confirmed')
                        AND (
                            b.startTime IS NULL
                            OR b.endTime IS NULL
                            OR ? IS NULL
                            OR ? IS NULL
                            OR (
                                b.startTime < ?
                                AND b.endTime > ?
                            )
                        )
                )
                    THEN 'booked'

                ELSE 'available'
            END AS availabilityStatus

        FROM serviceResource sr
        WHERE sr.serviceId = ?
        ORDER BY sr.resourceName ASC`,

        [
            booking.numberOfPeople || 1,
            booking.bookingId,
            booking.bookingDate,
            booking.startTime,
            endTime,
            endTime,
            booking.startTime,
            booking.serviceId
        ]
    );

    // QUAN TRỌNG: Trả danh sách về controller
    return resources;
    }
};

module.exports = bookingModel;
