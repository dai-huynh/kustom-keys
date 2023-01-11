const multer = require("multer");

const storage = multer.diskStorage({
  // destination: (req, file, cb) => {
  //   cb(null, "./public/uploads/");
  // },
  // filename: (req, file, cb) => {
  //   cb(null, new Date().toISOString() + "-" + file.originalname);
  // },
});

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === "image/jpeg" ||
    file.mimetype === "image/jpg" ||
    file.mimetype === "image/png"
  ) {
    cb(null, true);
  } else {
    cb(new Error("File format should be JPEG, JPG, PNG"), false);
  }
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 1024 * 1024 * 10 },
  fileFilter: fileFilter,
});

module.exports = { upload };
