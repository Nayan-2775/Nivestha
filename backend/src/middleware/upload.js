import multer from "multer";
import path from "path";
import fs from "fs";

// Ensure uploads folder exists
const uploadPath = "uploads";

if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
}

// Storage config
const storage = multer.diskStorage({

  destination: function (req, file, cb) {
    cb(null, uploadPath);
  },

  filename: function (req, file, cb) {

    const uniqueName =
      Date.now() +
      "-" +
      Math.round(Math.random() * 1e9) +
      path.extname(file.originalname);

    cb(null, uniqueName);
  }

});

// File filter (only images)
const fileFilter = (req, file, cb) => {

  const allowedTypes = /jpg|jpeg|png|webp|avif/;

  const ext = allowedTypes.test(
    path.extname(file.originalname).toLowerCase()
  );

  const mime = file.mimetype.startsWith("image/");

  if (ext && mime) {
    cb(null, true);
  } else {
    cb(new Error("Only image files allowed (jpg, jpeg, png, webp, avif)"));
  }

};

// Upload middleware
const upload = multer({

  storage,

  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  },

  fileFilter

});

export default upload;