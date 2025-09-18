import multer from "multer";

const upload = multer({
storage,
limits: { fileSize: 50 * 1024 * 1024 }, // 50 MB limit, tune as needed
});

