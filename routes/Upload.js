const express = require("express");
const { uploadPhoto } = require("../middlewares/UploadMiddleware");
const fs = require("fs");
const { cloudinaryUploadImg } = require("../utils/Cloudinary");
const router = express.Router();
const cloudinary = require("cloudinary").v2;
const CUSTOMERS = require("../models/Customers");

router.post("/", uploadPhoto.array("file", 10), async (req, res) => {
  try {
    const uploader = (path) => cloudinaryUploadImg(path, "images");
    const urls = [];
    const files = req.files;
    for (const file of files) {
      const { path } = file;
      const newpath = await uploader(path);
      urls.push(newpath);
      fs.unlinkSync(path);
    }
    const images = urls.map((file) => {
      return file;
    });

    const query = { user_id: req.body.custId };
    const imageData = {
      documents: images,
      documentStatus: "",
    };
    await CUSTOMERS.updateOne(query, imageData);

    return res.json(images);
  } catch (error) {
    throw new Error(error);
  }
});

router.delete("/delete/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const result = await cloudinary.uploader.destroy(id);
    res.json(result);
  } catch (error) {
    throw new Error(error);
  }
});

module.exports = router;
