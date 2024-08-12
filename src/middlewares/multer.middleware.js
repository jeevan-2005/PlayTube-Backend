import multer from "multer";

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    //cb is a callback function
    cb(null, "./public/temp");
  },
  filname: (req, file, cb) => {
    //cb is a callback function
    cb(null, file.originalname);
  },
});

export const upload = multer({ storage });