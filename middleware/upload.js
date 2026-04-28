const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: (request, file, cb) => cb(null, "uploads/"),
  filename: (request, file, cb) => {
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  },
});

module.exports = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });
