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

const updateUnitPice = async (req, res) => {
  try {
    const { price, type } = req.body;

    if (typeof price !== "number" || price <= 0) {
      return res.status(400).json({ error: "Invalid price value" });
    }

    // Fetch all vehicles
    const vehiclesList = await vehicles.find();

    if (vehiclesList.length === 0) {
      return res.status(404).json({ error: "No vehicles found" });
    }

    // Update each vehicle's pricePerUnitDistance individually
    for (const vehicle of vehiclesList) {
      const currentPricePerUnitDistance = vehicle.pricePerUnitDistance;
      let updatedPricePerUnitDistance;

      if (type === "Increase") {
        // Increase the price by percentage
        const newPricePerUnitDistance =
          (currentPricePerUnitDistance * price) / 100;
        updatedPricePerUnitDistance =
          parseFloat(currentPricePerUnitDistance) +
          parseFloat(newPricePerUnitDistance);
      } else if (type === "Decrease") {
        // Decrease the price by percentage
        const newPricePerUnitDistance =
          (currentPricePerUnitDistance * price) / 100;
        updatedPricePerUnitDistance =
          parseFloat(currentPricePerUnitDistance) -
          parseFloat(newPricePerUnitDistance);
      } else {
        return res.status(400).json({ error: "Invalid type value" });
      }

      await vehicles.updateOne(
        { _id: vehicle._id },
        { $set: { pricePerUnitDistance: updatedPricePerUnitDistance } }
      );
    }

    const result = await vehicles.find();

    return res.status(200).json(result);
  } catch (error) {
    console.error("Error updating unit price:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

const updateBaseDistance = async (req, res) => {
  try {
    const { miles } = req.body;
    const data = { $set: { baseDistance: miles } };
    await vehicles.updateMany({}, data);
    const result = await vehicles.find();
    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json(error);
  }
};

const updatePriceOrDistance = async (req, res) => {
  try {
    const { _id, baseDistance, pricePerUnitDistance } = req.body;
    console.log(req.body);
    const query = { _id };
    const data = {
      $set: {
        baseDistance: baseDistance,
        pricePerUnitDistance: pricePerUnitDistance,
      },
    };
    const bbb = await vehicles.updateMany(query, data);

    console.log(bbb);
    const result = await vehicles.find();
    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json(error);
  }
};

const liveSearch = async (req, res) => {
  try {
    const { searchKey } = req.body;

    const query = {
      vehicleName: { $regex: searchKey, $options: "i" },
    };

    const result = await vehicles.find(query);
    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json(error);
  }
};

module.exports = {
  addVehicle,
  getVehicle,
  getVehicleList,
  getSingleVehicle,
  updateVehicle,
  updateBaseDistance,
  updateUnitPice,
  updatePriceOrDistance,
  liveSearch,
};
