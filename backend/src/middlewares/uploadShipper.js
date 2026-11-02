const multer = require("multer");

const allowedMimeType = [
    "image/jpeg",
    "image/png",
    "image/webp"
];

const upload = multer({
    storage: multer.memoryStorage(),

    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB mỗi ảnh
        files: 3
    },

    fileFilter: (req, file, callback) => {
        if(!allowedMimeType.includes(file.mimetype)){
            return callback(
                new Error("Chỉ có thể upload ảnh JPG, PNG hoặc WEBP")
            );
        }

        callback(null, true);
    }
});


const uploadShipperImages = upload.fields([
    {
        name: "imageCitizenIdBefore",
        maxCount: 1
    },
    {
        name: "imageCitizenIdAfter",
        maxCount: 1
    },
    {
        name: "imageDrivingLicense",
        maxCount: 1
    }
]);


module.exports = uploadShipperImages;