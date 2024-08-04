const asyncHandler = require("express-async-handler");
const Trips = require("../../models/Trips");
const Notifications = require("../../models/Notifications");
const Vehicle = require("../../models/Vehicles");
const moment = require("moment/moment");
const nodemailer = require("nodemailer");
const mongoose = require("mongoose");

const newTrip = asyncHandler(async (req, res) => {
  const zeroPad = (num, places) => String(num).padStart(places, "0");
  const tripCount = await (await Trips.find()).length;

  const tripData = new Trips({
    no: tripCount + 1,
    tripNo: zeroPad(tripCount + 1, 4),
    source: req.body.source,
    destination: req.body.destination,
    vehicleId: req.body.vehicleId,
    customerId: req.body.customerId,
    scheduledDate: req.body.scheduledDate,
    scheduledTime: req.body.scheduledTime,
    shortDescription: req.body.shortDescription,
    tripStatus: "Pending",
    totalAmount: req.body.totalAmount,
    paymentStatus: req.body.paymentStatus,
    paymentReference: req.body.paymentReference,
    paymentMode: req.body.paymentMode,
    noOfPassengers: req.body.noOfPassengers,
    signature: req.body.signature,
    documents: req.body.documents,
  });

  const newNotification = new Notifications({
    customerId: req.body.customerId,
    tripNo: zeroPad(tripCount + 1, 4),
    notificationTitle: "New Booking ",
    notificationMessage:
      "New Booking on " + moment(req.body.scheduledDate).format("DD-MM-YYYY"),
    notificationStatus: "New",
  });
  try {
    await tripData
      .save()
      .then((response) => {
        newNotification.save();
        return res.status(200).json({
          data: response,
        });
      })
      .catch((err) => {
        return res.status(500).json({
          message: err,
        });
      });
  } catch (error) {
    return res.status(400).json({
      message: error,
    });
  }
});

const getTrip = asyncHandler(async (req, res) => {
  const query = {
    customerId: req.body._id,
  };
  try {
    await Trips.aggregate([
      { $match: { customerId: req.body._id } },
      {
        $lookup: {
          from: "vehicles",
          localField: "vehicleId",
          foreignField: "_id",
          as: "vehicle",
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "driverId",
          foreignField: "_id",
          as: "drivers",
        },
      },
    ])
      .sort({ no: -1 })
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
  } catch (error) {
    return res.status(400).json({
      message: error,
    });
  }
});

const unAssignedTrips = asyncHandler(async (req, res) => {
  const pageNumber = req.body.page; // the current page number
  const pageSize = req.body.per_page; // the number of items per page
  const skip = (pageNumber - 1) * pageSize;

  const regex = new RegExp(req.body.searchKey, "i");
  const query = {
    tripStatus: "Pending",
  };
  const total = await Trips.find(query);
  await Trips.find(query)
    .skip(skip)
    .limit(pageSize)
    .then((response) => {
      return res.status(200).json({
        data: response,
        total: total.length,
      });
    });
});

const getAllTrips = asyncHandler(async (req, res) => {
  const pageNumber = req.body.page; // the current page number
  const pageSize = req.body.per_page; // the number of items per page
  const skip = (pageNumber - 1) * pageSize;
  const regex = new RegExp(req.body.searchKey, "i");

  const total = await Trips.find();
  await Trips.find()
    .skip(skip)
    .limit(pageSize)
    .sort({ no: -1 })
    .then((response) => {
      return res.status(200).json({
        data: response,
        total: total.length,
      });
    });
});

const getSingleTrips = asyncHandler(async (req, res) => {
  try {
    await Trips.aggregate([
      {
        $match: {
          $expr: {
            $eq: [
              "$_id",
              {
                $toObjectId: req.body.id,
              },
            ],
          },
        },
      },
      {
        $lookup: {
          from: "vehicles",
          localField: "vehicleId",
          foreignField: "_id",
          as: "vehicles",
        },
      },
    ])
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
  } catch (error) {
    return res.status(400).json({
      message: error,
    });
  }
});

const updateDriver = asyncHandler(async (req, res) => {
  const query = {
    _id: new mongoose.Types.ObjectId(req.body.tripId),
  };
  const data = {
    $set: {
      driverId: req.body.driverId,
      tripStatus: "Trip Confirmed",
    },
  };
  const notificationQuery = {
    tripNo: req.body.tripNo,
  };
  const notoficationUpdateData = {
    $set: {
      userId: new mongoose.Types.ObjectId(req.body.driverId),
      customerId: req.body.customerId,
      notificationTitle: "Drive Alloted",
      notificationMessage:
        "Vehicle ride on " +
        moment(req.body.scheduledDate).format("DD-MM-YYYY"),
      notificationStatus: "Drive Alloted",
    },
  };

  var driverName = "";
  var driverContactNo = "";
  var vehicleType = "";
  var vehicleNo = "";
  var tripDatexx = "";
  var tripTimexx = "";
  var userEmail = "";
  var customerName = "";
  var pickupLocation = "";
  var destinationLocation = "";

  // mail setup
  let transporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE,
    host: process.env.EMAIL_HOST_NAME,
    port: process.env.EMAIL_PORT,
    secure: true, // true for 465, false for other ports
    auth: {
      user: process.env.AUTH_EMAIL_USER,
      pass: process.env.AUTH_EMAIL_PASSWORD,
    },
  });

  //   email content
  const mailOptions = {
    from: `"Saywa" <${process.env.CONTACT_EMAIL}>`,
    to: req.body.email,
    subject: "-Limo Driver Changed",
    html: `<div style="padding: 20px;">
    <p style="text-align: left;">Dear user,</p>
    <p style="text-align: left;">We hope this message finds you well. Thank you for choosing -Limo for your upcoming trip. We are delighted to inform you that the your Driver has been alotted.</p>

    <p>Should you have any specific requirements or if there are changes to your travel plans, please feel free to contact our customer support at [Customer Support Email/Phone].</p>
    <p>Your satisfaction and safety are our top priorities, and we assure you that our driver will provide you with a comfortable and secure journey.</p>
    <p>Thank you for choosing Saywa Limo. We look forward to serving you and ensuring a seamless travel experience.</p>
    <p>Best regards,</brSaywa Limo Support Team</p>
  </div`,
  };
  await Notifications.updateOne(notificationQuery, notoficationUpdateData);
  await Trips.updateOne(query, data).then((response) => {
    //   Send Action
    transporter.sendMail(mailOptions);
    return res.status(200).json({
      data: response,
    });
  });
});

const cancelTrip = asyncHandler(async (req, res) => {
  const query = {
    _id: req.body.tripId,
  };
  const data = {
    $set: {
      driverId: req.body.driverId,
      tripStatus: "Cancelled",
    },
  };
  await Trips.updateOne(query, data).then((response) => {
    return res.status(200).json({
      data: response,
    });
  });
});

const driverTripData = asyncHandler(async (req, res) => {
  await Trips.aggregate([
    {
      $match: {
        $expr: {
          $eq: [
            "$driverId",
            {
              $toObjectId: req.body.id,
            },
          ],
        },
        $or: [{ tripStatus: "Trip Confirmed" }, { tripStatus: "Ride Started" }],
      },
    },
    {
      $lookup: {
        from: "vehicles",
        localField: "vehicleId",
        foreignField: "_id",
        as: "vehicle",
      },
    },
    {
      $lookup: {
        from: "customers",
        localField: "customerId",
        foreignField: "user_id",
        as: "customers",
      },
    },
  ])
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

const updateDriverTripData = asyncHandler(async (req, res) => {
  const query = {
    _id: req.body.tripId,
  };
  const data = {
    tripStatus: "Ride Started",
  };
  const vehicleQuerty = {
    _id: req.body.vehicleId,
  };
  const VehicleData = {
    status: "On Ride",
  };
  await Trips.updateOne(query, data).then((response) => {
    return res.status(200).json({
      data: response,
    });
  });
  await Vehicle.updateOne(vehicleQuerty, VehicleData);
});

const updateCompleteDriverTrip = asyncHandler(async (req, res) => {
  const query = {
    _id: req.body.tripId,
  };
  const data = {
    tripStatus: "Trip Completed",
  };
  const vehicleQuerty = {
    _id: req.body.vehicleId,
  };
  const VehicleData = {
    status: "Live",
  };
  await Trips.updateOne(query, data).then((response) => {
    // mail setup
    let transporter = nodemailer.createTransport({
      service: process.env.EMAIL_SERVICE,
      host: process.env.EMAIL_HOST_NAME,
      port: process.env.EMAIL_PORT,
      secure: true, // true for 465, false for other ports
      auth: {
        user: process.env.AUTH_EMAIL_USER,
        pass: process.env.AUTH_EMAIL_PASSWORD,
      },
    });

    //   Mail Data
    const mailOptions = {
      from: `"Saywa" <${process.env.NO_REPLY}>`,
      to: req.ody,
      subject: "Saywa Limo Driver Assignment Confirmation",
      html: `<div style="padding: 20px;">
      <p style="text-align: left;">Dear user,</p>
      <p style="text-align: left;">We hope this message finds you well. Thank you for choosing Saywa Limo for your upcoming trip. We are delighted to inform you that a professional driver has been assigned to cater to your transportation needs.</p>
      <p><table style="border-collapse: collapse; width: 100%;" border="1">
      <tbody>
      <tr>
      <td><strong>Driver's Name</strong></td>
      <td><strong>Contact Number</strong></td>
      <td><strong>Vehicle Information</strong></td>
      <td><strong>License Plate Number</strong></td>
      </tr>
      <tr>
      <td><strong>&nbsp;</strong>${driverName}</td>
      <td><strong>&nbsp;</strong>${driverContactNo}</td>
      <td><strong>&nbsp;</strong>${vehicleNo}</td>
      <td><strong>&nbsp;</strong>${vehicleType}</td>
      </tr>
      </tbody>
      </table>
      </p>
      <p>Should you have any specific requirements or if there are changes to your travel plans, please feel free to contact our customer support at [Customer Support Email/Phone].</p>
      <p>Your satisfaction and safety are our top priorities, and we assure you that our driver will provide you with a comfortable and secure journey.</p>
      <p>Thank you for choosing Saywa Limo. We look forward to serving you and ensuring a seamless travel experience.</p>
      <p>Best regards,</br>Saywa Limo Support Team</p>
    </div>`,
    };

    //   Send Action
    transporter.sendMail(mailOptions);
    return res.status(200).json({
      data: response,
    });
  });
  await Vehicle.updateOne(vehicleQuerty, VehicleData);
});

const verifyContent = asyncHandler(async (req, res) => {
  const query = {
    _id: new mongoose.Types.ObjectId(req.body._id),
  };
  const data = {
    $set: {
      tripStatus: req.body.tripStatus,
    },
  };

  try {
    const verifyContent = await Trips.updateOne(query, data);
    // mail setup
    let transporter = nodemailer.createTransport({
      service: process.env.EMAIL_SERVICE,
      host: process.env.EMAIL_HOST_NAME,
      port: process.env.EMAIL_PORT,
      secure: true, // true for 465, false for other ports
      auth: {
        user: process.env.AUTH_EMAIL_USER,
        pass: process.env.AUTH_EMAIL_PASSWORD,
      },
    });

    transporter.sendMail({
      from: '"Car Book" <noreply@ahydratech.com>', // sender address
      to: req.body.email, // list of receivers
      subject: "Agreement Verified", // Subject line
      text: "Hello world?", // plain text body
      html: "<p>Dear <br/> Your documents have been verified. We will assign a driver and send you another email.</p>",
    });

    return res.status(200).json(verifyContent);
  } catch (error) {
    return res.status(500).json({ error: "An error occurred" });
  }
});

module.exports = {
  newTrip,
  getTrip,
  unAssignedTrips,
  getAllTrips,
  getSingleTrips,
  updateDriver,
  cancelTrip,
  driverTripData,
  updateDriverTripData,
  updateCompleteDriverTrip,
  verifyContent,
};
