const multer = require('multer');
const { storage } = require('../config/cloudinary');

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|pdf|doc|docx|zip/;
  const mimetype = allowedTypes.test(file.mimetype);
  const extname = allowedTypes.test(file.originalname.toLowerCase());

  if (mimetype || extname) {
    return cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only images, PDFs, Docs, and ZIPs are allowed.'));
  }
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: fileFilter,
});

module.exports = upload;
