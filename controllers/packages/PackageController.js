const { default: mongoose } = require("mongoose");
const PACKAGES = require("../../models/Packages");

const addPackage = async (req, res) => {
  try {
    let imagesList = [];
    req.files.map((file) => {
      imagesList.push(file.filename);
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
      PackageImage: imagesList, // Assign imagesList to PackageImage
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
    const result = await PACKAGES.find();
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

module.exports = {
  getAllPackage,
  addPackage,
  getActivePackages,
  getSinglePackage,
};
