
const multer = require("multer");

const upload = multer({
    storage: multer.memoryStorage(),

    limits: {
        fileSize: 5 * 1024 * 1024,
        files: 3
    },

    fileFilter: (req, file, callback) => {
        if (
            file.mimetype !== "image/jpeg" &&
            file.mimetype !== "image/png" &&
            file.mimetype !== "image/webp"
        ) {
            return callback(
                new Error("Chỉ chấp nhận ảnh JPG, PNG hoặc WEBP")
            );
        }

        callback(null, true);
    }
});

const uploadBusinesses = upload.fields([
    {
        name: "imageCitizenBefore",
        maxCount: 1
    },
    {
        name: "imageCitizenAfter",
        maxCount: 1
    },

    { name: "imageBusiness", maxCount: 1 },
]);

module.exports = uploadBusinesses;
