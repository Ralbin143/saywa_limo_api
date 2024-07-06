const express = require("express");
const router = express.Router();
const Auth = require("../middlewares/Auth");
const vehicles = require("../models/Vehicles");
const fs = require("fs");
const path = require("path");
const multer = require("multer");

const {
  addVehicle,
  getVehicle,
  getVehicleList,
  getSingleVehicle,
  updateVehicle,
  updateBaseDistance,
  updateUnitPice,
  updatePriceOrDistance,
  liveSearch,
} = require("../controllers/vehicles/Vehicles");
const Vehicles = require("../models/Vehicles");

const storage = multer.diskStorage({
  destination: function (req, file, callback) {
    callback(null, "./public/vehicle_images/");
  },
  filename: function (req, file, callback) {
    const timestamp = Date.now();
    const ext = path.extname(file.originalname);
    const filename = `${timestamp}${ext}`;
    callback(null, filename);
  },
});
const upload = multer({ storage: storage });

router.post("/add_vehicle", [Auth], upload.array("images"), addVehicle);
router.post("/get_vehicle", [Auth], getVehicle);
router.post("/get_vehicle_list", getVehicleList);
router.post("/get_single_vehicle", getSingleVehicle);
router.post("/update_vehicle", updateVehicle);

router.post("/delete_image", async (req, res) => {
  const imagePath = "./public/vehicle_images/" + req.body.imgid;
  const query = {
    _id: req.body.vhid,
  };
  const data = {
    $pull: { images: req.body.imgid },
  };

  fs.unlink(imagePath, (error) => {
    if (error) {
      console.error("Error deleting the image:", error);
    } else {
      vehicles
        .updateOne(query, data)
        .then((result) => {
          return res.status(200).json({
            data: result,
          });
        })
        .catch((err) => {
          return res.status(500).json({
            message: err,
          });
        });
    }
  });
});

router.post(
  "/update_image",
  // [Auth],
  upload.array("images"),
  async (req, res) => {
    try {
      let imagesList = req.files.map((file) => file.filename);

      console.log("Image Lust", imagesList);

      const query = {
        _id: req.body.id,
      };

      console.log("Images List:", imagesList);

      const data = {
        $push: {
          images: { $each: imagesList },
        },
      };

      console.log("Update Data:", data);

      const updateData = await Vehicles.updateOne(query, data);

      return res.status(200).json({
        message: "Images updated successfully",
        data: updateData,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  }
);

router.get("/vehicle-count", async (req, res) => {
  const ccc = await vehicles.find();
  return res.status(200).json({ count: ccc.length });
});

router.post("/update-base-distance", updateBaseDistance);
router.post("/update-distance-unit-price", updateUnitPice);
router.post("/update-price-distance", updatePriceOrDistance);
router.post("/live-search", liveSearch);

module.exports = router;
