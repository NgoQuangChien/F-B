
const { pool } = require("../configs/database");

const dishModel = {

    // Thêm món ăn
    createDish: async (data) => {
        const connection = await pool.getConnection();

        try {
            await connection.beginTransaction();

            const {
                businessId,
                categoryId,
                dishName,
                description,
                image,
                price,
                dishType,
                sizes = []
            } = data;

            // Kiểm tra danh sách size
            if (!Array.isArray(sizes)) {
                throw new Error("Danh sách size không hợp lệ");
            }

            // Kiểm tra size và giá
            dishModel.validateSizes(sizes);

            // Nếu không truyền giá món thì lấy giá thấp nhất trong các size
            const dishPrice = price ?? (
                sizes.length > 0
                    ? Math.min(...sizes.map(item => Number(item.price)))
                    : null
            );

            if (dishPrice === null || Number(dishPrice) < 0) {
                throw new Error("Giá món không hợp lệ");
            }

            // Thêm thông tin món
            const [result] = await connection.execute(
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
                    dishPrice,
                    dishType || "food"
                ]
            );

            const dishId = result.insertId;

            // Thêm danh sách size
            if (sizes.length > 0) {
                for (const size of sizes) {
                    await connection.execute(
                        `INSERT INTO dishsizes (
                            dishId,
                            sizeName,
                            price
                        ) VALUES (?, ?, ?)`,
                        [
                            dishId,
                            size.sizeName.trim(),
                            Number(size.price)
                        ]
                    );
                }
            }

            await connection.commit();

            return {
                ...result,
                dishId
            };

        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    },


    // Hàm kiểm tra danh sách size
    validateSizes: (sizes) => {
        const sizeNames = new Set();

        for (const size of sizes) {
            if (
                !size.sizeName ||
                !String(size.sizeName).trim() ||
                size.price === undefined ||
                size.price === null ||
                Number.isNaN(Number(size.price)) ||
                Number(size.price) < 0
            ) {
                throw new Error("Thông tin size hoặc giá không hợp lệ");
            }

            const name = String(size.sizeName).trim().toLowerCase();

            if (sizeNames.has(name)) {
                throw new Error(`Size ${size.sizeName} đã tồn tại`);
            }

            sizeNames.add(name);
        }
    },


    // Lấy size của nhiều món
    getSizesByDishIds: async (dishIds, connection = pool) => {
        if (!dishIds.length) return {};

        const placeholders = dishIds.map(() => "?").join(",");

        const [rows] = await connection.execute(
            `SELECT
                dishSizeId,
                dishId,
                sizeName,
                price,
                isAvailable
             FROM dishsizes
             WHERE dishId IN (${placeholders})
             ORDER BY dishSizeId ASC`,
            dishIds
        );

        const sizeMap = {};

        rows.forEach(size => {
            if (!sizeMap[size.dishId]) {
                sizeMap[size.dishId] = [];
            }

            sizeMap[size.dishId].push(size);
        });

        return sizeMap;
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

        const sizeMap = await dishModel.getSizesByDishIds(
            rows.map(dish => dish.dishId)
        );

        return rows.map(dish => ({
            ...dish,
            sizes: sizeMap[dish.dishId] || []
        }));
    },


    // Hiển thị tất cả món
    getAllDishes: async () => {
        const [rows] = await pool.execute(
            `SELECT d.*, c.categoryName
             FROM dish d
             LEFT JOIN category c ON d.categoryId = c.categoryId
             ORDER BY d.createdAt DESC`
        );

        const sizeMap = await dishModel.getSizesByDishIds(
            rows.map(dish => dish.dishId)
        );

        return rows.map(dish => ({
            ...dish,
            sizes: sizeMap[dish.dishId] || []
        }));
    },


    // Hiển thị chi tiết một món
    getDishById: async (dishId, businessId) => {
        const [rows] = await pool.execute(
            `SELECT *
             FROM dish
             WHERE dishId = ? AND businessId = ?`,
            [dishId, businessId]
        );

        if (!rows.length) return null;

        const sizeMap = await dishModel.getSizesByDishIds([dishId]);

        return {
            ...rows[0],
            sizes: sizeMap[dishId] || []
        };
    },


    // Cập nhật món ăn
    updateDish: async (dishId, businessId, dishData) => {
        const connection = await pool.getConnection();

        try {
            await connection.beginTransaction();

            const {
                categoryId,
                dishName,
                description,
                image,
                price,
                dishType,
                sizes
            } = dishData;

            // Kiểm tra món có thuộc quán không
            const [dishRows] = await connection.execute(
                `SELECT dishId, price
                 FROM dish
                 WHERE dishId = ? AND businessId = ?`,
                [dishId, businessId]
            );

            if (!dishRows.length) {
                throw new Error("Không tìm thấy món ăn");
            }

            // Nếu có gửi sizes thì kiểm tra
            if (sizes !== undefined) {
                if (!Array.isArray(sizes)) {
                    throw new Error("Danh sách size không hợp lệ");
                }

                dishModel.validateSizes(sizes);
            }

            const dishPrice = price ?? (
                sizes?.length > 0
                    ? Math.min(...sizes.map(item => Number(item.price)))
                    : dishRows[0].price
            );

            // Cập nhật thông tin món
            const [result] = await connection.execute(
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
                    description || null,
                    image || null,
                    dishPrice,
                    dishType || "food",
                    dishId,
                    businessId
                ]
            );

            // Chỉ cập nhật size khi request có gửi sizes
            if (sizes !== undefined) {

                // Xóa danh sách size cũ
                await connection.execute(
                    `DELETE FROM dishsizes
                     WHERE dishId = ?`,
                    [dishId]
                );

                // Thêm lại danh sách size mới
                for (const size of sizes) {
                    await connection.execute(
                        `INSERT INTO dishsizes (
                            dishId,
                            sizeName,
                            price
                        ) VALUES (?, ?, ?)`,
                        [
                            dishId,
                            size.sizeName.trim(),
                            Number(size.price)
                        ]
                    );
                }
            }

            await connection.commit();

            return result;

        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }

};

module.exports = dishModel;
