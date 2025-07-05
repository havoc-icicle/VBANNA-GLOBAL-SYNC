import multer from 'multer';
import path from 'path';

const storage = multer.memoryStorage(); // Using memory storage to process file before uploading to Supabase

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|pdf/;
  const mimetype = allowedTypes.test(file.mimetype);
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());

  if (mimetype && extname) {
    return cb(null, true);
  }
  cb(new Error('File type not supported. Only PDF, PNG, and JPEG are allowed.'));
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 15 * 1024 * 1024 }, // 15MB size limit
  fileFilter: fileFilter,
});

export default upload;
