import multer from 'multer';
import fs from 'fs';
import path from 'path';

// Use `/tmp/public` instead of `__dirname/public`
const uploadDir = '/tmp/public';

// Ensure the folder exists
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    }
});

export const upload = multer({ storage: storage });
