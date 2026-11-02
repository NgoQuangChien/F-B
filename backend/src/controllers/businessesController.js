const Business = require("../models/businessesModel");
const cloudinary = require("../configs/cloudinary");
const { Readable } = require("stream");
const { pool } = require("../configs/database");

// Upload ảnh lên Cloudinary
function uploadBuffer(buffer, publicId) {
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            {
                folder: "businessesprofile",
                public_id: publicId,
                resource_type: "image",
                type: "authenticated",
                overwrite: false
            },
            (error, result) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(result);
                }
            }
        );

        Readable.from(buffer).pipe(stream);
    });
}

// Xóa ảnh đã upload nếu tạo hồ sơ thất bại
async function deleteUploadedImages(publicIds) {
    for (const publicId of publicIds) {
        try {
            await cloudinary.uploader.destroy(publicId, {
                resource_type: "image",
                type: "authenticated"
            });
        } catch (error) {
            console.log("Không thể xóa ảnh:", error.message);
        }
    }
}

// Kiểm tra chuỗi bắt buộc
function isEmpty(value) {
    return typeof value !== "string" || !value.trim();
}

const businessController = {

    // 1. Chủ quán đăng ký hồ sơ
    register: async (req, res) => {
        const uploadedPublicIds = [];

        try {
            // Lấy userId từ token
            const userId = req.user.userId;

            // Lấy thông tin từ form
            const {
                businessName,
                address,
                addressLink,
                phone,
                citizenId,
                introduce,
                latitude,
                longitude,
                openStatus
            } = req.body;

            // Kiểm tra thông tin bắt buộc
            if (
                isEmpty(businessName) ||
                isEmpty(address) ||
                isEmpty(phone) ||
                isEmpty(citizenId)
            ) {
                return res.status(400).json({
                    message: "Vui lòng nhập đầy đủ thông tin hồ sơ quán"
                });
            }

            // Lấy 3 ảnh từ form
            const imageBusiness = req.files?.imageBusiness?.[0] || null;

            const imageCitizenBefore =
                req.files?.imageCitizenBefore?.[0] || null;

            const imageCitizenAfter =
                req.files?.imageCitizenAfter?.[0] || null;

            // Kiểm tra ảnh
            if (
                !imageBusiness ||
                !imageCitizenBefore ||
                !imageCitizenAfter
            ) {
                return res.status(400).json({
                    message: "Vui lòng tải ảnh đại diện quán và đủ hai ảnh CCCD"
                });
            }

            // Kiểm tra cơ sở kinh doanh đã tồn tại chưa
            const existingBusiness = await Business.checkBusinessExists(
                businessName,
                address
            );

            if (existingBusiness) {
                return res.status(409).json({
                    message: "Cơ sở kinh doanh này đã tồn tại trong hệ thống!"
                });
            }

            // Lấy email từ tài khoản đăng nhập
            const [users] = await pool.execute(
                `
                SELECT email
                FROM users
                WHERE userId = ?
                LIMIT 1
                `,
                [userId]
            );

            if (users.length === 0) {
                return res.status(404).json({
                    message: "Không tìm thấy tài khoản"
                });
            }

            // Tạo tên riêng cho ảnh
            const prefix = `business-${userId}-${Date.now()}`;

            // =====================================
            // UPLOAD ẢNH ĐẠI DIỆN QUÁN
            // =====================================
            const businessImageResult = await uploadBuffer(
                imageBusiness.buffer,
                `${prefix}-business`
            );

            uploadedPublicIds.push(businessImageResult.public_id);

            // =====================================
            // UPLOAD CCCD MẶT TRƯỚC
            // =====================================
            const frontResult = await uploadBuffer(
                imageCitizenBefore.buffer,
                `${prefix}-citizen-front`
            );

            uploadedPublicIds.push(frontResult.public_id);

            // =====================================
            // UPLOAD CCCD MẶT SAU
            // =====================================
            const backResult = await uploadBuffer(
                imageCitizenAfter.buffer,
                `${prefix}-citizen-back`
            );

            uploadedPublicIds.push(backResult.public_id);

            // =====================================
            // LƯU THÔNG TIN VÀO MYSQL
            // =====================================
            const businessId = await Business.createProfile({
                userId,

                businessName: businessName.trim(),

                // URL ảnh đại diện quán
                imageBusiness: businessImageResult.secure_url,

                address: address.trim(),
                addressLink: addressLink?.trim() || null,
                phone: phone.trim(),
                email: users[0].email,
                citizenId: citizenId.trim(),

                // URL ảnh CCCD
                imageCitizenBefore: frontResult.secure_url,
                imageCitizenAfter: backResult.secure_url,

                introduce: introduce?.trim() || null,
                latitude: latitude || null,
                longitude: longitude || null,
                openStatus: openStatus?.trim() || null
            });

            return res.status(201).json({
                success: true,
                message: "Đăng ký hồ sơ quán thành công. Vui lòng chờ admin duyệt.",
                businessId,
                status: "pending"
            });

        } catch (error) {
            // Nếu thất bại, xóa các ảnh đã upload
            await deleteUploadedImages(uploadedPublicIds);

            if (error.code === "ER_DUP_ENTRY") {
                return res.status(409).json({
                    message: "Tài khoản đã có hồ sơ quán"
                });
            }

            console.log("Lỗi đăng ký hồ sơ quán:", error);

            return res.status(500).json({
                message: "Không thể đăng ký hồ sơ quán"
            });
        }
    },

    // 2. Admin lấy danh sách hồ sơ chờ duyệt
    getPending: async (req, res) => {
        try {
            const businesses = await Business.getPending();

            return res.status(200).json({
                message: "Lấy danh sách hồ sơ thành công",
                data: businesses
            });

        } catch (error) {
            console.log("Lỗi lấy danh sách hồ sơ:", error);

            return res.status(500).json({
                message: "Không thể lấy danh sách hồ sơ"
            });
        }
    },

    // 3. Lấy danh sách quán đã được duyệt
    getAllBusiness: async (req, res) => {
        try {
            const businesses = await Business.getAllBusiness();

            return res.status(200).json({
                success: true,
                message: "Lấy danh sách quán thành công!",
                data: businesses
            });

        } catch (error) {
            console.error("Lỗi lấy danh sách quán:", error);

            return res.status(500).json({
                success: false,
                message: "Lỗi server khi lấy danh sách quán!"
            });
        }
    },

    // 4. Lấy danh sách hồ sơ theo tài khoản
    getBusinessByUserId: async (req, res) => {
        try {
            const userId = req.params.userId;

            const businesses = await Business.getByUserId(userId);

            return res.status(200).json({
                success: true,
                message: "Lấy danh sách hồ sơ quán thành công!",
                data: businesses
            });

        } catch (error) {
            console.error(error);

            return res.status(500).json({
                success: false,
                message: "Lỗi server!"
            });
        }
    },

    // 5. Admin duyệt hoặc từ chối hồ sơ
    review: async (req, res) => {
        try {
            const businessId = Number(req.params.businessId);
            const status = req.body.status;

            // Kiểm tra ID
            if (!Number.isInteger(businessId) || businessId <= 0) {
                return res.status(400).json({
                    message: "businessId không hợp lệ"
                });
            }

            // Kiểm tra trạng thái
            if (status !== "approved" && status !== "rejected") {
                return res.status(400).json({
                    message: "Trạng thái phải là approved hoặc rejected"
                });
            }

            // Kiểm tra hồ sơ tồn tại
            const business = await Business.getByIdForReview(businessId);

            if (!business) {
                return res.status(404).json({
                    message: "Không tìm thấy hồ sơ quán"
                });
            }

            // Kiểm tra hồ sơ đã được xét duyệt chưa
            if (business.status !== "pending") {
                return res.status(409).json({
                    message: "Hồ sơ đã được xét duyệt"
                });
            }

            // Lấy adminId từ token
            const adminId = req.user.userId;

            // Gọi model cập nhật hồ sơ
            const updated = await Business.review({
                businessId,
                adminId,
                status
            });

            if (!updated) {
                return res.status(409).json({
                    message: "Không thể cập nhật hồ sơ"
                });
            }

            if (status === "approved") {
                return res.status(200).json({
                    message: "Đã duyệt hồ sơ quán",
                    businessId,
                    status: "approved"
                });
            }

            return res.status(200).json({
                message: "Đã từ chối hồ sơ quán",
                businessId,
                status: "rejected"
            });

        } catch (error) {
            if (error.code === "FORBIDDEN") {
                return res.status(403).json({
                    message: "Bạn không có quyền admin"
                });
            }

            if (error.code === "BUSINESS_NOT_FOUND") {
                return res.status(404).json({
                    message: error.message
                });
            }

            if (error.code === "BUSINESS_ALREADY_REVIEWED") {
                return res.status(409).json({
                    message: error.message
                });
            }

            if (error.code === "OWNER_ROLE_NOT_FOUND") {
                return res.status(500).json({
                    message: error.message
                });
            }

            console.log("Lỗi xét duyệt hồ sơ quán:", error);

            return res.status(500).json({
                message: "Không thể xét duyệt hồ sơ quán"
            });
        }
    },

    // 6. Lấy thông tin chi tiết quán
    getBusinessDetail: async (req, res) => {
        try {
            const businessId = Number(req.params.businessId);

            if (!Number.isInteger(businessId) || businessId <= 0) {
                return res.status(400).json({
                    success: false,
                    message: "businessId không hợp lệ"
                });
            }

            const business = await Business.getBusinessDetail(businessId);

            if (!business) {
                return res.status(404).json({
                    success: false,
                    message: "Không tìm thấy thông tin quán"
                });
            }

            return res.status(200).json({
                success: true,
                message: "Lấy thông tin quán thành công",
                data: business
            });

        } catch (error) {
            console.error("Lỗi lấy thông tin chi tiết quán:", error);

            return res.status(500).json({
                success: false,
                message: "Không thể lấy thông tin quán"
            });
        }
    }
};

module.exports = businessController;