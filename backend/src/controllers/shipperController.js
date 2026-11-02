
const Shipper = require("../models/shipperModel");
const cloudinary = require("../configs/cloudinary");
const { Readable } = require("stream");
const { pool } = require("../configs/database");


// Upload một ảnh lên Cloudinary
function uploadBuffer(buffer, publicId) {
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            {
                folder: "shipperProfile",
                public_id: publicId,
                resource_type: "image",
                type: "authenticated",
                overwrite: false
            },
            function (error, result) {
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

// Xóa những ảnh đã upload nếu lưu hồ sơ thất bại
async function deleteUploadedImages(publicIds) {
    for (let i = 0; i < publicIds.length; i++) {
        try {
            await cloudinary.uploader.destroy(publicIds[i], {
                resource_type: "image",
                type: "authenticated"
            });
        } catch (error) {
            console.log("Không thể xóa ảnh:", error.message);
        }
    }
}

const shipperController = {
    // 1. Người dùng đăng ký hồ sơ shipper
    register: async (req, res) => {
        const uploadedPublicIds = [];

        try {
            // Lấy ID người dùng từ token đăng nhập
            const userId = req.user.userId;

            // Lấy thông tin từ form
            const shipperName = req.body.shipperName;
            const phone = req.body.phone;
            const citizenId = req.body.citizenId;
            const licensePlate = req.body.licensePlate;
            const vehicleType = req.body.vehicleType;

            // Kiểm tra các thông tin bắt buộc
            if (
                !shipperName.trim() ||
                !phone.trim() ||
                !citizenId.trim() ||
                !licensePlate.trim() ||
                !vehicleType.trim()
            ) {
                return res.status(400).json({
                    message: "Vui lòng nhập đầy đủ thông tin"
                });
            }

            // Lấy 3 ảnh người dùng đã tải lên
            let imageCitizenIdBefore = null;
            let imageCitizenIdAfter = null;
            let imageDrivingLicense = null;

            if (req.files) {
                if (req.files.imageCitizenIdBefore) {
                    imageCitizenIdBefore = req.files.imageCitizenIdBefore[0];
                }

                if (req.files.imageCitizenIdAfter) {
                    imageCitizenIdAfter = req.files.imageCitizenIdAfter[0];
                }

                if (req.files.imageDrivingLicense) {
                    imageDrivingLicense = req.files.imageDrivingLicense[0];
                }
            }

            // Kiểm tra người dùng đã tải đủ ảnh chưa
            if (!imageCitizenIdBefore || !imageCitizenIdAfter || !imageDrivingLicense) {
                return res.status(400).json({
                    message: "Vui lòng tải đủ 3 ảnh CCCD hai mặt và bằng lái"
                });
            }

            // Kiểm tra người dùng đã đăng ký hồ sơ chưa
            const existingShipper = await Shipper.getByUserId(userId);

            if (existingShipper) {
                return res.status(409).json({
                    message: "Bạn đã có hồ sơ shipper",
                    status: existingShipper.status
                });
            }

            // Lấy email từ tài khoản đang đăng nhập
            const [users] = await pool.execute(
                `SELECT fullname, email
                 FROM users
                 WHERE userId = ?`,
                [userId]
            );

            if (users.length === 0) {
                return res.status(404).json({
                    message: "Không tìm thấy tài khoản"
                });
            }

            const user = users[0];

            // Tạo tên riêng cho các ảnh
            const prefix = "shipper-" + userId + "-" + Date.now();

            // Upload ảnh CCCD mặt trước
            const frontResult = await uploadBuffer(
                imageCitizenIdBefore.buffer,
                prefix + "-citizen-front"
            );
            uploadedPublicIds.push(frontResult.public_id);

            // Upload ảnh CCCD mặt sau
            const backResult = await uploadBuffer(
                imageCitizenIdAfter.buffer,
                prefix + "-citizen-back"
            );
            uploadedPublicIds.push(backResult.public_id);

            // Upload ảnh bằng lái
            const licenseResult = await uploadBuffer(
                imageDrivingLicense.buffer,
                prefix + "-driving-license"
            );
            uploadedPublicIds.push(licenseResult.public_id);

            // Lưu thông tin hồ sơ vào MySQL
            const shipperId = await Shipper.createProfile({
                shipperName: shipperName.trim(),
                userId: userId,
                phone: phone.trim(),
                citizenId: citizenId.trim(),
                imageCitizenIdBefore: frontResult.secure_url,
                imageCitizenIdAfter: backResult.secure_url,
                imageDrivingLicense: licenseResult.secure_url,
                licensePlate: licensePlate.trim(),
                vehicleType: vehicleType.trim()
            });

            return res.status(201).json({
                message: "Đăng ký thành công. Vui lòng chờ admin duyệt.",
                shipperId: shipperId,
                status: "pending"
            });

        } catch (error) {
            // Nếu xảy ra lỗi, xóa những ảnh đã upload thành công
            await deleteUploadedImages(uploadedPublicIds);

            if (error.code === "ER_DUP_ENTRY") {
                return res.status(409).json({
                    message: "Tài khoản đã có hồ sơ shipper"
                });
            }

            console.log("Lỗi đăng ký shipper:", error);

            return res.status(500).json({
                message: "Không thể đăng ký hồ sơ shipper"
            });
        }
    },


    // 2. Admin lấy danh sách hồ sơ đang chờ duyệt
    getPending: async (req, res) => {
        try {
            const shippers = await Shipper.getPending();

            return res.status(200).json({
                message: "Lấy danh sách hồ sơ thành công",
                data: shippers
            });

        } catch (error) {
            console.log("Lỗi lấy danh sách hồ sơ:", error);

            return res.status(500).json({
                message: "Không thể lấy danh sách hồ sơ"
            });
        }
    },


    // 3. Admin duyệt hoặc từ chối hồ sơ
    review: async (req, res) => {
        try {
            // Lấy ID hồ sơ từ URL
            const shipperId = Number(req.params.shipperId);

            // Lấy trạng thái và lý do từ request body
            const status = req.body.status;
            const rejectionReason = req.body.rejectionReason;

            // Chỉ chấp nhận hai trạng thái này
            if (status !== "approved" && status !== "rejected") {
                return res.status(400).json({
                    message: "Trạng thái phải là approved hoặc rejected"
                });
            }

            // Nếu từ chối thì phải nhập lý do
            if (
                status === "rejected" &&
                (
                    typeof rejectionReason !== "string" ||
                    !rejectionReason.trim()
                )
            ) {
                return res.status(400).json({
                    message: "Vui lòng nhập lý do từ chối"
                });
            }

            // Tìm hồ sơ cần xét duyệt
            const shipper = await Shipper.getByIdForReview(shipperId);

            if (!shipper) {
                return res.status(404).json({
                    message: "Không tìm thấy hồ sơ"
                });
            }

            // Chỉ được xét duyệt hồ sơ đang chờ
            if (shipper.status !== "pending") {
                return res.status(409).json({
                    message: "Hồ sơ đã được xét duyệt"
                });
            }

            // Lấy ID admin từ token đăng nhập
            const adminId = req.user.userId;

            // Cập nhật hồ sơ trong database
            const updated = await Shipper.review({
                shipperId: shipperId,
                adminId: adminId,
                status: status,
                rejectionReason: rejectionReason
                    ? rejectionReason.trim()
                    : null
            });

            if (!updated) {
                return res.status(409).json({
                    message: "Không thể cập nhật hồ sơ"
                });
            }

            // Trả kết quả
            if (status === "approved") {
                return res.status(200).json({
                    message: "Đã duyệt hồ sơ shipper",
                    status: "approved"
                });
            }

            return res.status(200).json({
                message: "Đã từ chối hồ sơ shipper",
                status: "rejected"
            });

        } catch (error) {
            if (error.code === "FORBIDDEN") {
                return res.status(403).json({
                    message: "Bạn không có quyền admin"
                });
            }

            if (error.code === "SHIPPER_NOT_FOUND") {
                return res.status(404).json({
                    message: "Không tìm thấy hồ sơ"
                });
            }

            if (error.code === "SHIPPER_ALREADY_REVIEWED") {
                return res.status(409).json({
                    message: "Hồ sơ đã được xét duyệt"
                });
            }

            console.log("Lỗi xét duyệt shipper:", error);

            return res.status(500).json({
                message: "Không thể xét duyệt hồ sơ"
            });
        }
    }
};

module.exports = shipperController;
