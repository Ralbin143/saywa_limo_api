const express = require("express");
const {
  addPackage,
  getAllPackage,
  getActivePackages,
  getSinglePackage,
  togglePackageStatus,
  liveSearchPackage,
} = require("../controllers/packages/PackageController");
const { uploadPhoto } = require("../middlewares/UploadMiddleware");
const router = express.Router();

router.post("/new", uploadPhoto.array("images"), addPackage);
router.get("/", getAllPackage);

router.post("/get-active", getActivePackages);
router.post("/get-single", getSinglePackage);
router.post("/toggle-status", togglePackageStatus);
router.post("/live-search", liveSearchPackage);

module.exports = router;
