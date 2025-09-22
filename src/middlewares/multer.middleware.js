import multer from "multer";


const storage = multer.memoryStorage();

    // {
    // destination: function (req, file, cb) {
    //     // Use path.join to create proper absolute path
    //     const uploadPath = path.join(process.cwd(), "public","temp", "uploads", "products");
    //     cb(null, uploadPath);
    // },
    // filename: function (req, file, cb) {
    //     const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    //     // Add file extension to saved filename
    //     cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    // }
// }
export const upload = multer({ 
    storage: storage,
    // limits: { fileSize: 5 * 1024 * 1024 }, //5MB
});