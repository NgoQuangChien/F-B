const multer = require("multer");

const allowedMimeType = [
    "image/jpeg",
    "image/png",
    "image/webp"
];

const upload = multer({
    storage: multer.memoryStorage(),

    limits: {
        fileSize: 5 * 1024 * 1024,
        files: 1
    },

    fileFilter: (req, file, callback) => {
        if (!allowedMimeType.includes(file.mimetype)) {
            return callback(
                new Error("Chỉ có thể upload ảnh JPG, PNG hoặc WEBP")
            );
        }

        callback(null, true);
    }
});

const uploadDish = upload.single("image");

module.exports = uploadDish;