
const { Readable } = require("stream");
const cloudinary = require("../configs/cloudinary");
const dishModel = require("../models/dishModel");

// Upload ảnh lên Cloudinary
const uploadImage = (file) => {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                folder: "da26a1/dish",
                resource_type: "image"
            },
            (error, result) => {
                if (error) {
                    return reject(error);
                }

                resolve(result);
            }
        );

        Readable.from(file.buffer).pipe(uploadStream);
    });
};


// Lấy publicId từ URL Cloudinary
const getPublicId = (imageUrl) => {
    if (!imageUrl) return null;

    try {
        const url = new URL(imageUrl);
        const pathname = url.pathname;

        const uploadIndex = pathname.indexOf("/upload/");
        if (uploadIndex === -1) return null;

        let publicId = pathname.substring(uploadIndex + 8);

        // Bỏ version v123456789 nếu có
        publicId = publicId.replace(/^v\d+\//, "");

        // Bỏ phần đuôi file
        publicId = publicId.replace(/\.[^/.]+$/, "");

        return publicId;
    } catch (error) {
        return null;
    }
};


// Chuyển sizes từ FormData thành mảng
const parseSizes = (sizes) => {
    if (sizes === undefined || sizes === null || sizes === "") {
        return [];
    }

    if (Array.isArray(sizes)) {
        return sizes;
    }

    try {
        const parsedSizes = JSON.parse(sizes);

        if (!Array.isArray(parsedSizes)) {
            throw new Error("Danh sách size phải là một mảng");
        }

        return parsedSizes;
    } catch (error) {
        throw new Error("Dữ liệu size không hợp lệ");
    }
};


const dishController = {

    // Thêm món ăn
    createDish: async (req, res) => {
        try {
            const {
                businessId,
                categoryId,
                dishName,
                description,
                price,
                dishType
            } = req.body;

            // Kiểm tra thông tin cơ bản
            if (!businessId || !categoryId || !dishName) {
                return res.status(400).json({
                    success: false,
                    message: "Vui lòng nhập đầy đủ thông tin món ăn"
                });
            }

            // Xử lý danh sách size
            const sizes = parseSizes(req.body.sizes);

            // Upload ảnh nếu có
            let image = null;

            if (req.file) {
                const result = await uploadImage(req.file);
                image = result.secure_url;
            }

            const dishData = {
                businessId,
                categoryId,
                dishName,
                description,
                image,
                price: price !== undefined && price !== ""
                    ? Number(price)
                    : undefined,
                dishType,
                sizes
            };

            const result = await dishModel.createDish(dishData);

            return res.status(201).json({
                success: true,
                message: "Thêm món ăn thành công",
                data: result
            });

        } catch (error) {
            console.error("Lỗi createDish:", error);

            return res.status(500).json({
                success: false,
                message: error.message || "Không thể thêm món ăn"
            });
        }
    },


    // Hiển thị món theo businessId
    getDishesByBusinessId: async (req, res) => {
        try {
            const { businessId } = req.params;

            const dishes = await dishModel.getDishesByBusinessId(businessId);

            return res.status(200).json({
                success: true,
                data: dishes
            });

        } catch (error) {
            console.error("Lỗi getDishesByBusinessId:", error);

            return res.status(500).json({
                success: false,
                message: "Không thể lấy danh sách món ăn"
            });
        }
    },


    // Hiển thị tất cả món
    getAllDishes: async (req, res) => {
        try {
            const dishes = await dishModel.getAllDishes();

            return res.status(200).json({
                success: true,
                data: dishes
            });

        } catch (error) {
            console.error("Lỗi getAllDishes:", error);

            return res.status(500).json({
                success: false,
                message: "Không thể lấy danh sách món ăn"
            });
        }
    },


    // Cập nhật món ăn
    updateDish: async (req, res) => {
        try {
            const { businessId, dishId } = req.params;

            const {
                categoryId,
                dishName,
                description,
                price,
                dishType
            } = req.body;

            // Lấy thông tin món cũ
            const oldDish = await dishModel.getDishById(
                dishId,
                businessId
            );

            if (!oldDish) {
                return res.status(404).json({
                    success: false,
                    message: "Không tìm thấy món ăn"
                });
            }

            // Chỉ xử lý sizes nếu frontend có gửi
            const sizes = req.body.sizes !== undefined
                ? parseSizes(req.body.sizes)
                : undefined;

            // Giữ ảnh cũ nếu không chọn ảnh mới
            let image = oldDish.image;

            if (req.file) {
                const result = await uploadImage(req.file);
                image = result.secure_url;
            }

            const dishData = {
                categoryId,
                dishName,
                description,
                image,
                price: price !== undefined && price !== ""
                    ? Number(price)
                    : undefined,
                dishType,
                sizes
            };

            const result = await dishModel.updateDish(
                dishId,
                businessId,
                dishData
            );

            // Nếu cập nhật thành công và có ảnh mới thì xóa ảnh cũ
            if (req.file && oldDish.image) {
                const oldPublicId = getPublicId(oldDish.image);

                if (oldPublicId) {
                    await cloudinary.uploader.destroy(oldPublicId);
                }
            }

            return res.status(200).json({
                success: true,
                message: "Cập nhật món ăn thành công",
                data: result
            });

        } catch (error) {
            console.error("Lỗi updateDish:", error);

            return res.status(500).json({
                success: false,
                message: error.message || "Không thể cập nhật món ăn"
            });
        }
    }

};

module.exports = dishController;
