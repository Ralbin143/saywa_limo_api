const express = require("express");
const {
  addPackage,
  getAllPackage,
  getActivePackages,
  getSinglePackage,
} = require("../controllers/packages/PackageController");
const router = express.Router();

router.post("/new", addPackage);
router.get("/", getAllPackage);

router.post("/get-active", getActivePackages);
router.post("/get-single", getSinglePackage);

module.exports = router;
