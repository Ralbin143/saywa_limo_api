const asyncHandler = require("express-async-handler");
const mongoose = require("mongoose");
const vehicles = require("../../models/Vehicles");

const addVehicle = asyncHandler(async (req, res) => {
  let imagesList = [];
  req.files.map((res) => {
    imagesList = [...imagesList, res.filename];
  });

  const vehicleData = new vehicles({
    vehicleName: req.body.vehicleName,
    feature: req.body.feature,
    basePrice: req.body.basePrice,
    baseDistance: req.body.baseDistance,
    pricePerUnitDistance: req.body.pricePerUnitDistance,
    pricePerUnitHour: req.body.pricePerUnitHour,
    description: req.body.description,
    images: imagesList,
    vehicleNo: req.body.vehicleNo,
    status: "Live",
    maxPersons: req.body.maxPersons,
    maxBags: req.body.maxBags,
  });

  await vehicleData.save().then((response) => {
    return res.status(200).json({
      data: response,
    });
  });
});

const getVehicle = asyncHandler(async (req, res) => {
  const pageNumber = req.body.page; // the current page number
  const pageSize = req.body.per_page; // the number of items per page
  const skip = (pageNumber - 1) * pageSize;
  const regex = new RegExp(req.body.searchKey, "i");

  if (req.body.searchKey == undefined || req.body.searchKey == "") {
    const total = await vehicles.find();
    await vehicles
      .find()
      .skip(skip)
      .limit(pageSize)
      .then((response) => {
        return res.status(200).json({
          data: response,
          total: total.length,
        });
      });
  } else {
    const total = await vehicles.find({
      $or: [{ vehicleName: regex }, { feature: regex }],
    });
    await Users.find({
      $or: [{ vehicleName: regex }, { feature: regex }],
    })
      .skip(skip)
      .limit(pageSize)
      .then((response) => {
        return res.status(200).json({
          data: response,
          total: total.length,
        });
      });
  }
});

const getVehicleList = asyncHandler(async (req, res) => {
  const query = {
    status: "Live",
  };
  await vehicles.find(query).then((response) => {
    return res.status(200).json({
      data: response,
    });
  });
});

const getSingleVehicle = asyncHandler(async (req, res) => {
  const query = {
    _id: new mongoose.Types.ObjectId(req.body.vhid),
  };
  await vehicles.find(query).then((response) => {
    return res.status(200).json(response);
  });
});

const updateVehicle = asyncHandler(async (req, res) => {
  const query = {
    _id: req.body.id,
  };
  const data = {
    $set: {
      vehicleName: req.body.vehicleName,
      feature: req.body.feature,
      basePrice: req.body.basePrice,
      baseDistance: req.body.baseDistance,
      pricePerUnitDistance: req.body.pricePerUnitDistance,
      pricePerUnitHour: req.body.pricePerUnitHour,
      description: req.body.description,
      vehicleNo: req.body.vehicleNo,
      maxPersons: req.body.maxPersons,
      maxBags: req.body.maxBags,
      status: req.body.status,
    },
  };
  await vehicles
    .updateOne(query, data)
    .then((response) => {
      return res.status(200).json({
        data: response,
      });
    })
    .catch((err) => {
      return res.status(500).json({
        message: err,
      });
    });
});

module.exports = {
  addVehicle,
  getVehicle,
  getVehicleList,
  getSingleVehicle,
  updateVehicle,
};
