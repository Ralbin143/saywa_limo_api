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
      id,
      PackageName,
      TotalPerson,
      selectedStatus,
      Description,
      eventType,
      vehicles,
      TourLength,
    } = req.body;

    let packageData;

    if (id !== "null") {
      console.log("id available");

      packageData = await PACKAGES.findByIdAndUpdate(
        id,
        {
          PackageName,
          PackageImage: images,
          TourLength,
          TotalPerson,
          selectedStatus,
          Description,
          eventType: JSON.parse(eventType),
          vehicles: JSON.parse(vehicles),
        },
        { new: true }
      );
    } else {
      console.log("id not available");

      packageData = new PACKAGES({
        PackageName,
        PackageImage: images,
        TourLength,
        TotalPerson,
        selectedStatus,
        Description,
        eventType: JSON.parse(eventType),
        vehicles: JSON.parse(vehicles),
      });

      await packageData.save();
    }

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

const liveSearchPackage = async (req, res) => {
  try {
    const regex = new RegExp(req.body.searchkey, "i");
    const query = { PackageName: regex };
    const result = await PACKAGES.find(query);
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
  liveSearchPackage,
};
