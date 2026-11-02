
const { Readable } = require("stream");
const cloudinary = require("../configs/cloudinary");
const dishModel = require("../models/dishModel");

// ========================================
// HÀM UPLOAD ẢNH LÊN CLOUDINARY
// ========================================
const uploadImage = async (file) => {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                folder: "da26a1/dish",
                resource_type: "image"
            },
            (error, result) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(result);
                }
            }
        );

        Readable.from(file.buffer).pipe(uploadStream);
    });
};

// ========================================
// LẤY PUBLIC ID TỪ URL CLOUDINARY
// ========================================
const getPublicId = (imageUrl) => {
    if (!imageUrl) return null;

    try {
        const url = new URL(imageUrl);
        const pathname = decodeURIComponent(url.pathname);

        const uploadIndex = pathname.indexOf("/upload/");

        if (uploadIndex === -1) return null;

        let publicId = pathname.substring(uploadIndex + 8);

        // Bỏ version, ví dụ v123456789/
        publicId = publicId.replace(/^v\d+\//, "");

        // Bỏ phần mở rộng ảnh
        publicId = publicId.replace(/\.[^/.]+$/, "");

        return publicId;
    } catch (error) {
        console.error("Lỗi lấy public_id:", error);
        return null;
    }
};

// ========================================
// DISH CONTROLLER
// ========================================
const dishController = {

    // ====================================
    // THÊM MÓN ĂN
    // ====================================
    createDish: async (req, res) => {
        let uploadedImagePublicId = null;

        try {
            const {
                businessId,
                categoryId,
                dishName,
                description,
                price,
                dishType
            } = req.body;

            // Kiểm tra dữ liệu bắt buộc
            if (
                !businessId ||
                !categoryId ||
                !dishName?.trim() ||
                price == null ||
                price === ""
            ) {
                return res.status(400).json({
                    success: false,
                    message: "Vui lòng nhập đầy đủ thông tin món ăn!"
                });
            }

            // Kiểm tra dữ liệu hợp lệ
            if (
                !Number.isInteger(Number(businessId)) ||
                Number(businessId) <= 0 ||
                !Number.isInteger(Number(categoryId)) ||
                Number(categoryId) <= 0 ||
                !Number.isFinite(Number(price)) ||
                Number(price) < 0
            ) {
                return res.status(400).json({
                    success: false,
                    message: "Thông tin món ăn không hợp lệ!"
                });
            }

            const validDishTypes = ["food", "drink", "other"];

            if (dishType && !validDishTypes.includes(dishType)) {
                return res.status(400).json({
                    success: false,
                    message: "Loại món ăn không hợp lệ!"
                });
            }

            // Kiểm tra ảnh
            if (!req.file) {
                return res.status(400).json({
                    success: false,
                    message: "Vui lòng chọn ảnh món ăn!"
                });
            }

            // Upload ảnh
            const uploadResult = await uploadImage(req.file);

            const image = uploadResult.secure_url;
            uploadedImagePublicId = uploadResult.public_id;

            // Lưu vào database
            const result = await dishModel.createDish({
                businessId: Number(businessId),
                categoryId: Number(categoryId),
                dishName: dishName.trim(),
                description: description || "",
                image,
                price: Number(price),
                dishType: dishType || "food"
            });

            // Lưu DB thành công
            uploadedImagePublicId = null;

            return res.status(201).json({
                success: true,
                message: "Thêm món ăn thành công!",
                data: {
                    dishId: result.insertId,
                    businessId: Number(businessId),
                    categoryId: Number(categoryId),
                    dishName: dishName.trim(),
                    description: description || "",
                    image,
                    price: Number(price),
                    dishType: dishType || "food"
                }
            });

        } catch (error) {
            console.error("Lỗi thêm món ăn:", error);

            // Xóa ảnh nếu upload thành công nhưng lưu DB thất bại
            if (uploadedImagePublicId) {
                try {
                    await cloudinary.uploader.destroy(uploadedImagePublicId);
                } catch (deleteError) {
                    console.error("Lỗi xóa ảnh:", deleteError);
                }
            }

            return res.status(500).json({
                success: false,
                message: "Lỗi server khi thêm món ăn!",
                error: error.message
            });
        }
    },

    // ====================================
    // LẤY MÓN ĂN THEO BUSINESS ID
    // ====================================
    getDishesByBusinessId: async (req, res) => {
        try {
            const { businessId } = req.params;

            if (
                !Number.isInteger(Number(businessId)) ||
                Number(businessId) <= 0
            ) {
                return res.status(400).json({
                    success: false,
                    message: "businessId không hợp lệ!"
                });
            }

            const dishes = await dishModel.getDishesByBusinessId(businessId);

            return res.status(200).json({
                success: true,
                message: "Lấy danh sách món ăn thành công!",
                data: dishes
            });

        } catch (error) {
            console.error("Lỗi lấy món ăn:", error);

            return res.status(500).json({
                success: false,
                message: "Lỗi server khi lấy danh sách món ăn!",
                error: error.message
            });
        }
    },

    // ====================================
    // LẤY TẤT CẢ MÓN ĂN
    // ====================================
    getAllDishes: async (req, res) => {
        try {
            const dishes = await dishModel.getAllDishes();

            return res.status(200).json({
                success: true,
                message: "Lấy tất cả món ăn thành công!",
                data: dishes
            });

        } catch (error) {
            console.error("Lỗi lấy tất cả món ăn:", error);

            return res.status(500).json({
                success: false,
                message: "Lỗi server khi lấy danh sách món ăn!",
                error: error.message
            });
        }
    },

    // ====================================
    // CẬP NHẬT MÓN ĂN
    // ====================================
    updateDish: async (req, res) => {
        let newImagePublicId = null;

        try {
            const { dishId, businessId } = req.params;

            const {
                categoryId,
                dishName,
                description,
                price,
                dishType
            } = req.body;

            // 1. Kiểm tra ID
            if (
                !Number.isInteger(Number(dishId)) ||
                Number(dishId) <= 0 ||
                !Number.isInteger(Number(businessId)) ||
                Number(businessId) <= 0
            ) {
                return res.status(400).json({
                    success: false,
                    message: "ID món ăn hoặc ID quán không hợp lệ!"
                });
            }

            // 2. Kiểm tra dữ liệu bắt buộc
            if (
                !categoryId ||
                !dishName?.trim() ||
                price == null ||
                price === ""
            ) {
                return res.status(400).json({
                    success: false,
                    message: "Vui lòng nhập đầy đủ thông tin món ăn!"
                });
            }

            // 3. Kiểm tra dữ liệu hợp lệ
            if (
                !Number.isInteger(Number(categoryId)) ||
                Number(categoryId) <= 0 ||
                !Number.isFinite(Number(price)) ||
                Number(price) < 0
            ) {
                return res.status(400).json({
                    success: false,
                    message: "Thông tin món ăn không hợp lệ!"
                });
            }

            const validDishTypes = ["food", "drink", "other"];

            if (dishType && !validDishTypes.includes(dishType)) {
                return res.status(400).json({
                    success: false,
                    message: "Loại món ăn không hợp lệ!"
                });
            }

            // 4. Kiểm tra món ăn có tồn tại trong quán
            const oldDish = await dishModel.getDishById(
                dishId,
                businessId
            );

            if (!oldDish) {
                return res.status(404).json({
                    success: false,
                    message: "Không tìm thấy món ăn trong quán!"
                });
            }

            // 5. Mặc định giữ ảnh cũ
            let image = oldDish.image;

            // 6. Nếu có ảnh mới thì upload
            if (req.file) {
                const uploadResult = await uploadImage(req.file);

                image = uploadResult.secure_url;
                newImagePublicId = uploadResult.public_id;
            }

            // 7. Chuẩn bị dữ liệu cập nhật
            const updatedDish = {
                categoryId: Number(categoryId),
                dishName: dishName.trim(),
                description: description || "",
                image,
                price: Number(price),
                dishType: dishType || "food"
            };

            // 8. Cập nhật database
            await dishModel.updateDish(
                dishId,
                businessId,
                updatedDish
            );

            // DB đã cập nhật thành công, không xóa ảnh mới trong catch nữa
            newImagePublicId = null;

            // 9. Nếu có ảnh mới thì xóa ảnh cũ
            if (req.file && oldDish.image) {
                const oldPublicId = getPublicId(oldDish.image);

                if (oldPublicId) {
                    try {
                        await cloudinary.uploader.destroy(oldPublicId);
                    } catch (deleteError) {
                        console.error("Không thể xóa ảnh cũ:", deleteError);
                    }
                }
            }

            // 10. Trả kết quả
            return res.status(200).json({
                success: true,
                message: "Cập nhật món ăn thành công!",
                data: {
                    ...oldDish,
                    dishId: Number(dishId),
                    businessId: Number(businessId),
                    ...updatedDish
                }
            });

        } catch (error) {
            console.error("Lỗi cập nhật món ăn:", error);

            // Xóa ảnh mới nếu upload thành công nhưng cập nhật DB thất bại
            if (newImagePublicId) {
                try {
                    await cloudinary.uploader.destroy(newImagePublicId);
                } catch (deleteError) {
                    console.error("Lỗi xóa ảnh mới:", deleteError);
                }
            }

            return res.status(500).json({
                success: false,
                message: "Lỗi server khi cập nhật món ăn!",
                error: error.message
            });
        }
    }
};

module.exports = dishController;
