const { default: mongoose } = require("mongoose");
const PACKAGES = require("../../models/Packages");
const fs = require("fs");
const { cloudinaryUploadImg } = require("../../utils/Cloudinary");
const cloudinary = require("cloudinary").v2;

const addPackage = async (req, res) => {
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

    const {
      PackageName,
      TotalPerson,
      selectedStatus,
      Description,
      eventType,
      vehicles,
      TourLength, // Destructure TourLength from req.body
    } = req.body;

    const newPackages = new PACKAGES({
      PackageName,
      PackageImage: images, // Assign imagesList to PackageImage
      TourLength,
      TotalPerson,
      selectedStatus,
      Description,
      eventType,
      vehicles: JSON.parse(vehicles),
    });

    await newPackages.save();
    const result = await PACKAGES.find();
    return res.status(200).json(result);
  } catch (error) {
    console.log(error);
    return res.status(500).json(error);
  }
};

const getAllPackage = async (req, res) => {
  try {
    const result = await PACKAGES.find();
    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json(error);
  }
};

const getActivePackages = async (req, res) => {
  try {
    const query = {
      status: "Active",
    };
    const result = await PACKAGES.find(query);
    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json(error);
  }
};

const getSinglePackage = async (req, res) => {
  try {
    const { id } = req.body;
    const query = {
      _id: id,
    };
    const pipeline = [];
    pipeline.push({
      $match: { _id: new mongoose.Types.ObjectId(id) },
    });

    pipeline.push({
      $lookup: {
        from: "vehicles",
        localField: "_id",
        foreignField: "_id",
        as: "vehicles",
      },
    });
    const result = await PACKAGES.find(query);
    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json(error);
  }
};

const togglePackageStatus = async (req, res) => {
  try {
    const { id, status } = req.body;

    const query = {
      _id: id,
    };
    const data = {
      $set: {
        status: status,
      },
    };

    await PACKAGES.updateOne(query, data);
    const result = await PACKAGES.find();
    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json(error);
  }
};

module.exports = {
  getAllPackage,
  addPackage,
  getActivePackages,
  getSinglePackage,
  togglePackageStatus,
};
