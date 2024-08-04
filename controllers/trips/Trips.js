const asyncHandler = require("express-async-handler");
const Trips = require("../../models/Trips");
const Notifications = require("../../models/Notifications");
const USERS = require("../../models/Users");
const custData = require("../../models/Customers");
const Vehicle = require("../../models/Vehicles");
const REFERAL = require("../../models/Referals");
const moment = require("moment/moment");
const nodemailer = require("nodemailer");
const mongoose = require("mongoose");
const Customers = require("../../models/Customers");
const stripe = require("stripe")(process.env.STRIPE_KEY);
const fs = require("fs");
const PDFDocument = require("pdfkit");
const path = require("path");
const { error } = require("console");

const tripCount = asyncHandler(async (req, res) => {
  const query = { customerId: req.body.customerId };
  const count = await Trips.find(query);
  return res.status(200).json({
    count: count.length,
  });
});

const newTripPayment = asyncHandler(async (req, res) => {
  const CLIENT_URL = process.env.CLIENT_URL;

  const zeroPad = (num, places) => String(num).padStart(places, "0");
  const tripCount = (await Trips.find()).length;

  try {
    // Create a price
    const price = await stripe.prices.create({
      unit_amount: parseInt(req.body.totalAmount) * 100,
      currency: "USD",

      metadata: {
        tripNo: zeroPad(tripCount + 1, 6),
        custName: req.body.customerName,
        source: req.body.source,
        destination: req.body.destination,
      },
      product_data: {
        name: zeroPad(tripCount + 1, 4),
      },
    });

    const queryxx = { user_id: req.body.customerId };
    const custDetails = await Customers.find(queryxx).limit(1);

    const invoice = await stripe.invoices.create({
      customer: custDetails[0].stripeId,
    });

    // Create a checkout session

    console.log("====================================");
    console.log(req.body);
    console.log("====================================");

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price: price.id,
          quantity: 1,
        },
      ],
      mode: "payment",
      metadata: {
        invoiceId: invoice.id,
        no: tripCount + 1,
        tripNo: zeroPad(tripCount + 1, 4),
        invoiceId: invoice.id,
        source: req.body.source,
        destination: req.body.destination,
        routeNo: req.body.routeNo,
        vehicleId: req.body.vehicleId,
        customerId: req.body.customerId,
        customerName: req.body.customerName,
        scheduledDate: req.body.scheduledDate,
        scheduledTime: req.body.scheduledTime,
        shortDescription: req.body.shortDescription,
        tripStatus: "Pending",
        totalAmount: parseInt(req.body.totalAmount),
        paymentStatus: req.body.paymentStatus,
        // paymentId: session.id,
        paymentReference: "",
        paymentMode: req.body.paymentMode,
        noOfPassengers: req.body.noOfPassengers,
        noOfBags: req.body.noOfBags,
        // signature: req.body.signature,
        // documents: req.body.documents,
        meetAndGreet: req.body.meetAndGreet,
        tripOccasion: req.body.tripOccasion,
        tripOccasionDetails: req.body.tripOccasionDetails,
        totalKms: req.body.totalKms,
        stops: JSON.stringify(req.body.stops),
        scheduleDate: req.body.scheduleDate,
        scheduleTime: req.body.scheduleTime,
        rideType: req.body.rideType,
        totalHours: req.body.totalHours,
        bagType: req.body.bagType,
        flightInformation: req.body.flightInformation,
        needCarSeat: req.body.needCarSeat,
        seatCount: JSON.stringify(req.body.seatCount),
        additionalInfo: req.body.additionalInfo,
        gratuiryTypeCash: req.body.gratuiryTypeCash,
        gratuityAmount: req.body.gratuityAmount,
        discount: req.body.discount,
        nightCharge: req.body.nightCharge,
        voucherAmount: req.body.voucherAmount,
        voucherCode: req.body.voucherCode,
        walletBalance: req.body.walletBalance,
        returnDate: req.body.returnDate,
        returnTime: req.body.returnTime,
        wheelChair: req.body.wheelChair,
        carryOnBagsCount: req.body.carryOnBagsCount,
        checkedBagCount: req.body.checkedBagCount,
      },
      success_url: `${CLIENT_URL}/success?success=true`,
      cancel_url: `${CLIENT_URL}/Reservation`,
    });

    const tripData = new Trips({
      no: tripCount + 1,
      tripNo: zeroPad(tripCount + 1, 4),
      invoiceId: invoice.id,
      source: req.body.source,
      destination: req.body.destination,
      routeNo: req.body.routeNo,
      vehicleId: req.body.vehicleId,
      customerId: req.body.customerId,
      customerName: req.body.customerName,
      scheduledDate: req.body.scheduledDate,
      scheduledTime: req.body.scheduledTime,
      shortDescription: req.body.shortDescription,
      tripStatus: "Pending",
      totalAmount: req.body.totalAmount,
      paymentStatus: req.body.paymentStatus,
      paymentId: session.id,
      paymentReference: "",
      paymentMode: req.body.paymentMode,
      noOfPassengers: req.body.noOfPassengers,
      noOfBags: req.body.noOfBags,
      // signature: req.body.signature,
      // documents: req.body.documents,
      meetAndGreet: req.body.meetAndGreet,
      tripOccasion: req.body.tripOccasion,
      tripOccasionDetails: req.body.tripOccasionDetails,
      totalKms: req.body.totalKms,
      stops: req.body.stops,
      scheduleDate: req.body.scheduleDate,
      scheduleTime: req.body.scheduleTime,
      rideType: req.body.rideType,
      totalHours: req.body.totalHours,
      bagType: req.body.bagType,
      flightInformation: req.body.flightInformation,
      needCarSeat: req.body.needCarSeat,
      seatCount: req.body.seatCount,
      additionalInfo: req.body.additionalInfo,
      gratuiryTypeCash: req.body.gratuiryTypeCash,
      gratuityAmount: req.body.gratuityAmount,
      discount: req.body.discount,
      voucherAmount: req.body.voucherAmount,
      voucherCode: req.body.voucherCode,
      walletBalance: req.body.walletBalance,
      returnDate: req.body.returnDate,
      returnTime: req.body.returnTime,
    });

    // --------------------[Changed as per client request]--------------------
    // await tripData
    //   .save()
    //   .then((response) => {})
    //   .catch((err) => {
    //     console.log(err);
    //   });

    return res.status(200).json(session.url);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

const newTrip = asyncHandler(async (req, res) => {
  const zeroPad = (num, places) => String(num).padStart(places, "0");
  const tripCount = await (await Trips.find()).length;

  // const findQuery = {
  //   customerId: req.body.customerId,
  // };

  // const customTripCount = await Trips.find(findQuery);

  // let isFirstTrip = false;
  // let discount = 0;
  // if (customTripCount.length === 0) {
  //   isFirstTrip = true;
  // } else if (totalAmount % 4 === 0) {
  //   discount = "30%";
  // }

  const tripData = new Trips({
    no: tripCount + 1,
    tripNo: zeroPad(tripCount + 1, 4),
    source: req.body.source,
    destination: req.body.destination,
    vehicleId: req.body.vehicleId,
    customerId: req.body.customerId,
    customerName: req.body.customerName,
    scheduledDate: req.body.scheduledDate,
    scheduledTime: req.body.scheduledTime,
    shortDescription: req.body.shortDescription,
    tripStatus: "Pending",
    totalAmount: parseInt(req.body.totalAmount),
    paymentStatus: req.body.paymentStatus,
    paymentReference: req.body.paymentReference,
    paymentMode: req.body.paymentMode,
    noOfPassengers: req.body.noOfPassengers,
    noOfBags: req.body.noOfBags,
    // signature: req.body.signature,
    // documents: req.body.documents,
    meetAndGreet: req.body.meetAndGreet,
    tripOccasion: req.body.tripOccasion,
    tripOccasionDetails: req.body.tripOccasionDetails,
    totalKms: req.body.totalKms,
    stops: req.body.stops,
    scheduleDate: req.body.scheduleDate,
    scheduleTime: req.body.scheduleTime,
    rideType: req.body.rideType,
    totalHours: req.body.totalHours,
    bagType: req.body.bagType,
    flightInformation: req.body.flightInformation,
    needCarSeat: req.body.needCarSeat,
    seatCount: req.body.seatCount,
    additionalInfo: req.body.additionalInfo,
    gratuiryTypeCash: req.body.gratuiryTypeCash,
    gratuityAmount: req.body.gratuityAmount,
    returnDate: req.body.returnDate,
    returnTime: req.body.returnTime,
  });
  try {
    const newNotification = new Notifications({
      customerId: req.body.customerId,
      tripNo: zeroPad(tripCount + 1, 4),
      notificationTitle: "New Booking ",
      notificationMessage:
        "New Booking on " + moment(req.body.scheduledDate).format("DD-MM-YYYY"),
      notificationStatus: "New",
    });

    const updateQuery = {};
    const updateData = {
      $set: {
        signature: req.body.signature,
      },
    };

    await custData.updateOne(updateQuery, updateData);

    await tripData
      .save()
      .then((response) => {
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
          to: req.body.email,
          subject: "Saywa Contact Number reset",
          html: `<div style="padding: 20px;">
    <p style="text-align: left;">Dear user,</p>
    <p style="text-align: left;">We hope this message finds you well. Thank you for choosing Saywa Limo for your upcoming trip. We are delighted to inform you that the your new trip has been confirmed.</p>
    <p>Should you have any specific requirements or if there are changes to your travel plans, please feel free to contact our customer support at [Customer Support Email/Phone].</p>
    <p>Your satisfaction and safety are our top priorities, and we assure you that our driver will provide you with a comfortable and secure journey.</p>
    <p>Thank you for choosing Saywa Limo. We look forward to serving you and ensuring a seamless travel experience.</p>
    <p>Best regards,</br>Saywa Limo Support Team</p>
  </div>`,
        };

        //   Send Action
        transporter.sendMail(mailOptions);
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
    // // Create a transporter
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

    // Corrected mailOptions to use the html property directly in sendMail
    transporter.sendMail(
      {
        from: `"Saywa" <${process.env.NO_REPLY}>`,
        to: process.env.ADMIN_MAIL,
        subject: "New Trip Booked",
        html: `<div style="padding: 20px; text-align: center;">
        <p style="text-align: left;"> new  Trip Has Been Booked.Plese Verify</p>
       
        <p>If you have any questions or concerns, please don't hesitate to contact us at ${process.env.CONTACT_EMAIL}.</p>
        <p>Thank you for your business!</p>
        </div>`,
      },
      (error, info) => {
        if (error) {
          console.error("Error sending email:", error);
          // Handle the error, for example, return an error response
        } else {
          console.log("Email sent: " + info.response);
          // Handle the success, for example, return a success response
        }
      }
    );
  } catch (error) {
    return res.status(400).json({
      message: error.message || "An error occurred",
    });
  }
});

const getTrip = asyncHandler(async (req, res) => {
  const limit = req.body.pageCount;
  const query = {
    customerId: req.body._id,
  };
  const trips = await Trips.find(query);
  const tripCount = trips.length;
  try {
    await Trips.aggregate([
      { $match: { customerId: req.body._id } },
      {
        $lookup: {
          from: "customers",
          localField: "customerId",
          foreignField: "user_id",
          as: "customerData",
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
          from: "users",
          localField: "driverId",
          foreignField: "_id",
          as: "drivers",
        },
      },
    ])
      .sort({ no: -1 })
      .limit(limit)
      .then((response) => {
        return res.status(200).json({
          data: response,
          count: tripCount,
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

const getClientData = asyncHandler(async (req, res) => {
  try {
    await Trips.find({ customerId: req.body.id })
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
    tripStatus: req.body.status,
  };
  const total = await Trips.find(query);

  const cust_counts = await Trips.aggregate([
    {
      $group: {
        _id: "$customerId",
        count: { $sum: 1 },
      },
    },
  ]);

  const customerCountsMap = new Map();
  cust_counts.forEach((entry) => {
    customerCountsMap.set(entry._id, entry.count);
  });

  await Trips.aggregate([
    {
      $match: {
        $and: [{ tripStatus: req.body.status }, { customerName: regex }],
      },
    },
    {
      $lookup: {
        from: "customers",
        localField: "customerId",
        foreignField: "user_id",
        as: "customerdata",
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "driverId",
        foreignField: "_id",
        as: "driver",
      },
    },

    {
      $addFields: {
        // customerDataCount: { $size: "$customerdata" },

        // // Add your custom fields here
        // customField1: cust_counts,

        totalCustomerTrips: {
          $sum: {
            $map: {
              input: cust_counts,
              as: "customerCount",
              in: {
                $cond: {
                  if: { $eq: ["$$customerCount._id", "$customerId"] },
                  then: "$$customerCount.count",
                  else: 0,
                },
              },
            },
          },
        },
      },
    },
  ])
    .sort({ no: -1 })
    .skip(skip)
    .limit(pageSize)
    .then((response) => {
      return res.status(200).json({
        data: response,
        total: total.length,
      });
    });
});

const newUnAssignedTripsForAdminCard = async (req, res) => {
  try {
    const pageSize = req.body.per_page;
    const regex = new RegExp(req.body.searchKey, "i");
    const query = {
      tripStatus: req.body.status,
    };
    const total = await Trips.find(query);
    const cust_counts = await Trips.aggregate([
      {
        $group: {
          _id: "$customerId",
          count: { $sum: 1 },
        },
      },
    ]);
    const customerCountsMap = new Map();
    cust_counts.forEach((entry) => {
      customerCountsMap.set(entry._id, entry.count);
    });
    await Trips.aggregate([
      {
        $match: {
          $and: [
            { tripStatus: req.body.status },
            { $or: [{ customerName: regex }, { contactNo: regex }] },
          ],
        },
      },
      {
        $lookup: {
          from: "customers",
          localField: "customerId",
          foreignField: "user_id",
          as: "customerdata",
        },
      },

      {
        $addFields: {
          // customerDataCount: { $size: "$customerdata" },

          // // Add your custom fields here
          // customField1: cust_counts,

          totalCustomerTrips: {
            $sum: {
              $map: {
                input: cust_counts,
                as: "customerCount",
                in: {
                  $cond: {
                    if: { $eq: ["$$customerCount._id", "$customerId"] },
                    then: "$$customerCount.count",
                    else: 0,
                  },
                },
              },
            },
          },
        },
      },
    ])
      .sort({ no: -1 })
      .limit(pageSize)
      .then((response) => {
        return res.status(200).json({
          data: response,
          total: total.length,
        });
      });
  } catch (error) {
    console.log(error);
  }
};

const getAllTrips = asyncHandler(async (req, res) => {
  const pageNumber = req.body.page; // the current page number
  const pageSize = req.body.per_page; // the number of items per page
  const skip = (pageNumber - 1) * pageSize;
  const regex = new RegExp(req.body.searchKey, "i");
  const column = "";
  const sort = req.body.sort;

  const total = await Trips.find();

  const trips = await Trips.aggregate([
    { $match: { tripNo: regex } },
    {
      $lookup: {
        from: "customers",
        localField: "customerId",
        foreignField: "user_id",
        as: "customerdata",
      },
    },
  ])
    .sort({ no: sort })
    .skip(skip)
    .limit(pageSize);

  res.status(200).json({
    data: trips,
    total: total.length,
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
      {
        $lookup: {
          from: "customers",
          localField: "customerId",
          foreignField: "user_id",
          as: "customerdata",
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

  const TripDtls = await Trips.find(query).limit(1);
  const Vehicles = await Vehicle.find(TripDtls[0].vehicleId);

  const userDetais = await USERS.find({
    _id: new mongoose.Types.ObjectId(req.body.driverId),
  });
  const custDatas = await custData.find({
    user_id: TripDtls[0].customerId,
  });

  var toMailAddress = custDatas[0].email;
  var custName = custDatas[0].fullName;
  var driverName = userDetais[0].firstName + " " + userDetais[0].lastName;
  var driverContactNo = userDetais[0].contactNumber;
  var vehicleType = Vehicles[0].vehicleName;
  var vehicleNo = Vehicles[0].vehicleNo;

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

  const mailOptions = {
    from: `"Saywa" <${process.env.NO_REPLY}>`,
    to: toMailAddress,
    subject: "Chauffeur Assignment Confirmation for Your Trip",
    html: `<table
    width="100%"
    id="m_-4521581668634247801outer_wrapper"
    style="background-color: #f7f7f7"
    bgcolor="#f7f7f7"
  >
    <tbody>
      <tr>
        <td></td>
        <td width="600">
          <div
            id="m_-4521581668634247801wrapper"
            dir="ltr"
            style="margin: 0 auto; padding: 70px 0; width: 100%; max-width: 600px"
            width="100%"
          >
            <table
              border="0"
              cellpadding="0"
              cellspacing="0"
              height="100%"
              width="100%"
            >
              <tbody>
                <tr>
                  <td align="center" valign="top">
                    <div id="m_-4521581668634247801template_header_image"></div>
                    <table
                      border="0"
                      cellpadding="0"
                      cellspacing="0"
                      width="100%"
                      id="m_-4521581668634247801template_container"
                      style="
                        background-color: #fff;
                        border: 1px solid #dedede;
                        border-radius: 3px;
                      "
                      bgcolor="#fff"
                    >
                      <tbody>
                        <tr>
                          <td align="center" valign="top">
                            <table
                              border="0"
                              cellpadding="0"
                              cellspacing="0"
                              width="100%"
                              id="m_-4521581668634247801template_header"
                              style="
                                background-color: #000000;
                                color: #fff;
                                border-bottom: 0;
                                font-weight: bold;
                                line-height: 100%;
                                vertical-align: middle;
                                font-family: 'Helvetica Neue', Helvetica, Roboto,
                                  Arial, sans-serif;
                                border-radius: 3px 3px 0 0;
                              "
                              bgcolor="#0c9991"
                            >
                              <tbody>
                                <tr>
                                  <td
                                    id="m_-4521581668634247801header_wrapper"
                                    style="padding: 36px 48px; display: block"
                                  >
                                    <h1
                                      style="
                                        font-family: 'Helvetica Neue', Helvetica,
                                          Roboto, Arial, sans-serif;
                                        font-size: 30px;
                                        font-weight: 300;
                                        line-height: 150%;
                                        margin: 0;
                                        text-align: left;
                                        color: #fff;
                                        background-color: inherit;
                                      "
                                      bgcolor="inherit"
                                    >
                                    Chauffeur  Assigned
                                    </h1>
                                  </td>
                                </tr>
                              </tbody>
                            </table>
                          </td>
                        </tr>
                        <tr>
                          <td align="center" valign="top">
                            <table
                              border="0"
                              cellpadding="0"
                              cellspacing="0"
                              width="100%"
                              id="m_-4521581668634247801template_body"
                            >
                              <tbody>
                                <tr>
                                  <td
                                    valign="top"
                                    id="m_-4521581668634247801body_content"
                                    style="background-color: #fff"
                                    bgcolor="#fff"
                                  >
                                    <table
                                      border="0"
                                      cellpadding="20"
                                      cellspacing="0"
                                      width="100%"
                                    >
                                      <tbody>
                                        <tr>
                                          <td
                                            valign="top"
                                            style="padding: 48px 48px 32px"
                                          >
                                            <div
                                              id="m_-4521581668634247801body_content_inner"
                                              style="
                                                color: #636363;
                                                font-family: 'Helvetica Neue',
                                                  Helvetica, Roboto, Arial,
                                                  sans-serif;
                                                font-size: 14px;
                                                line-height: 150%;
                                                text-align: left;
                                              "
                                              align="left"
                                            >
                                              <p style="margin: 0 0">
                                                Dear ${custName}
                                              </p>
                                              <p style="color: #666666">
                                              We are delighted to inform you that a chauffeur has been assigned for your upcoming trip. Below are the details:
                                              </p>
  
                                              <ul style="color: #666666">
                                                <li>
                                                  <strong>Driver Name:</strong>
                                                  ${driverName}
                                                </li>
                                                <li>
                                                  <strong>Driver Contact:</strong>
                                                  ${driverContactNo}
                                                </li>
                                                
                                              </ul>
  
                                              <p style="color: #666666">
                                              If you have any questions or require further assistance, please don’t hesitate to reach out to us.
                                              </p>
  
                                              <p style="color: #666666">
                                              Wishing you safe travels!
                                              </p>
  
                                              <p style="color: #666666">
                                                Best regards,<br />Saywa
                                              </p>
  
                                              <br />
                                            </div>
                                          </td>
                                        </tr>
                                      </tbody>
                                    </table>
                                  </td>
                                </tr>
                              </tbody>
                            </table>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </td>
        <td></td>
      </tr>
    </tbody>
  </table>`,
  };

  // await Notifications.updateOne(notificationQuery, notoficationUpdateData);
  await Trips.updateOne(query, data).then((response) => {
    // Send email
    transporter.sendMail(mailOptions);
    return res.status(200).json({
      data: response,
    });
  });
});

const cancelTrip = asyncHandler(async (req, res) => {
  // Mail setup
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

  const ddd = await Trips.find({ _id: req.body.id });
  var userName = ddd[0].customerName;

  const mailOptions = {
    from: `"Saywa" <${process.env.NO_REPLY}>`,
    to: req.body.email,
    subject: "Booking Cancellation Confirmation    ",
    html: `<table
    width="100%"
    id="m_-4521581668634247801outer_wrapper"
    style="background-color: #f7f7f7"
    bgcolor="#f7f7f7"
  >
    <tbody>
      <tr>
        <td></td>
        <td width="600">
          <div
            id="m_-4521581668634247801wrapper"
            dir="ltr"
            style="margin: 0 auto; padding: 70px 0; width: 100%; max-width: 600px"
            width="100%"
          >
            <table
              border="0"
              cellpadding="0"
              cellspacing="0"
              height="100%"
              width="100%"
            >
              <tbody>
                <tr>
                  <td align="center" valign="top">
                    <div id="m_-4521581668634247801template_header_image"></div>
                    <table
                      border="0"
                      cellpadding="0"
                      cellspacing="0"
                      width="100%"
                      id="m_-4521581668634247801template_container"
                      style="
                        background-color: #fff;
                        border: 1px solid #dedede;
                        border-radius: 3px;
                      "
                      bgcolor="#fff"
                    >
                      <tbody>
                        <tr>
                          <td align="center" valign="top">
                            <table
                              border="0"
                              cellpadding="0"
                              cellspacing="0"
                              width="100%"
                              id="m_-4521581668634247801template_header"
                              style="
                                background-color: #000000;
                                color: #fff;
                                border-bottom: 0;
                                font-weight: bold;
                                line-height: 100%;
                                vertical-align: middle;
                                font-family: 'Helvetica Neue', Helvetica, Roboto,
                                  Arial, sans-serif;
                                border-radius: 3px 3px 0 0;
                              "
                              bgcolor="#0c9991"
                            >
                              <tbody>
                                <tr>
                                  <td
                                    id="m_-4521581668634247801header_wrapper"
                                    style="padding: 36px 48px; display: block"
                                  >
                                    <h1
                                      style="
                                        font-family: 'Helvetica Neue', Helvetica,
                                          Roboto, Arial, sans-serif;
                                        font-size: 30px;
                                        font-weight: 300;
                                        line-height: 150%;
                                        margin: 0;
                                        text-align: left;
                                        color: #fff;
                                        background-color: inherit;
                                      "
                                      bgcolor="inherit"
                                    >
                                      Trip Canceled
                                    </h1>
                                  </td>
                                </tr>
                              </tbody>
                            </table>
                          </td>
                        </tr>
                        <tr>
                          <td align="center" valign="top">
                            <table
                              border="0"
                              cellpadding="0"
                              cellspacing="0"
                              width="100%"
                              id="m_-4521581668634247801template_body"
                            >
                              <tbody>
                                <tr>
                                  <td
                                    valign="top"
                                    id="m_-4521581668634247801body_content"
                                    style="background-color: #fff"
                                    bgcolor="#fff"
                                  >
                                    <table
                                      border="0"
                                      cellpadding="20"
                                      cellspacing="0"
                                      width="100%"
                                    >
                                      <tbody>
                                        <tr>
                                          <td
                                            valign="top"
                                            style="padding: 48px 48px 32px"
                                          >
                                            <div
                                              id="m_-4521581668634247801body_content_inner"
                                              style="
                                                color: #636363;
                                                font-family: 'Helvetica Neue',
                                                  Helvetica, Roboto, Arial,
                                                  sans-serif;
                                                font-size: 14px;
                                                line-height: 150%;
                                                text-align: left;
                                              "
                                              align="left"
                                            >
                                              <p style="margin: 0 0">
                                                Dear ${userName}
                                              </p>
                                              <p>
                                              Warm greetings from Saywa!</p>
                                              <p style="color: #666666">
                                                We are writing to confirm the receipt and processing of your request to cancel your booking. Your cancellation has been successfully processed, and you can view the updated status in your account. Should you need further assistance or have any questions, our dedicated customer support team is ready to assist you promptly.
                                              </p>

                                              <!-- Add specific details or additional information here -->

                                              <p style="color: #666666">
                                              For inquiries or concerns, please reach out to us at ${process.env.CONTACT_EMAIL}.
                                             
                                              </p>

                                              <p style="color: #666666">
                                                Thank you for choosing Saywa!

                                              </p>

                                              <p style="color: #666666">
                                                Best regards,<br /><strong
                                                  >Saywa</strong
                                                >
                                              </p>
                                              <br />
                                            </div>
                                          </td>
                                        </tr>
                                      </tbody>
                                    </table>
                                  </td>
                                </tr>
                              </tbody>
                            </table>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </td>
        <td></td>
      </tr>
    </tbody>
  </table>`,
  };

  const paymentId = req.body.paymentReference;
  const refundAmount = parseInt(req.body.cancelationAmount) * 100;

  try {
    // Send email
    const emailInfo = await transporter.sendMail(mailOptions);

    // Update trip status
    const query = {
      _id: req.body.id,
    };
    const data = {
      $set: {
        tripStatus: "Cancelled",
      },
    };

    // Update trip status in the database
    await Trips.updateOne(query, data);

    if (
      req.body.paymentReference === undefined ||
      req.body.paymentReference === null ||
      req.body.paymentReference === ""
    ) {
    } else {
      const refund = await stripe.refunds.create({
        payment_intent: req.body.paymentReference, // Replace with the actual PaymentIntent ID
        amount: refundAmount,
      });
    }

    // Send a success response
    res.status(200).json({ message: "Trip cancelled successfully", emailInfo });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Failed to cancel trip" });
  }
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
      to: req.body.email,
      subject: "Saywa Limo Trip Completed",
      html: `<div style="padding: 20px;">
    <p style="text-align: left;">Dear user,</p>
    <p>We hope this message finds you well. Thank you for choosing Saywa Limo for your upcoming trip. We are delighted to inform you that your trip has completed successfully.</p>
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

const newAdminTrip = asyncHandler(async (req, res) => {
  const zeroPad = (num, places) => String(num).padStart(places, "0");
  const tripCount = await (await Trips.find()).length;
  const tripData = new Trips({
    no: tripCount + 1,
    tripNo: zeroPad(tripCount + 1, 4),
    source: req.body.source,
    destination: req.body.destination,
    vehicleId: req.body.vehicleId,
    customerId: req.body.customerId,
    customerName: req.body.customerName,
    scheduledDate: req.body.scheduledDate,
    scheduledTime: req.body.scheduledTime,
    shortDescription: req.body.shortDescription,
    tripStatus: "Pending",
    totalAmount: parseInt(req.body.totalAmount),
    paymentStatus: req.body.paymentStatus,
    paymentReference: req.body.paymentReference,
    paymentMode: req.body.paymentMode,
    noOfPassengers: req.body.noOfPassengers,
    noOfBags: req.body.noOfBags,
    // signature: req.body.signature,
    // documents: req.body.documents,
    meetAndGreet: req.body.meetAndGreet,
    tripOccasion: req.body.tripOccasion,
    tripOccasionDetails: req.body.tripOccasionDetails,
    totalKms: req.body.totalKms,
    stops: req.body.stops,
    scheduledDate: req.body.scheduleDate,
    scheduledTime: req.body.scheduleTime,
    rideType: req.body.rideType,
    totalHours: req.body.totalHours,
    bagType: req.body.bagType,
    flightInformation: req.body.flightInformation,
    needCarSeat: req.body.needCarSeat,
    seatCount: req.body.seatCount,
    additionalInfo: req.body.additionalInfo,
    gratuiryTypeCash: req.body.gratuiryTypeCash,
    gratuityAmount: req.body.gratuityAmount,
    paymentMode: req.body.paymentMode,
    checkInBags: req.body.checkInBags,
    carryBags: req.body.carryBags,
    tripSource: "Admin",
    discount: req.body.discount,
  });

  // const newNotification = new Notifications({
  //   customerId: req.body.customerId,
  //   tripNo: "A" + zeroPad(tripCount + 1, 4),
  //   notificationTitle: "New Booking ",
  //   notificationMessage:
  //     "New Booking on " + moment(req.body.scheduledDate).format("DD-MM-YYYY"),
  //   notificationStatus: "New",
  // });

  // const updateQuery = {};
  // const updateData = {
  //   $set: {
  //     signature: req.body.signature,
  //   },
  // };

  // await custData.updateOne(updateQuery, updateData);
  var tripID = "";
  try {
    const tripDATA = await tripData.save();

    if (req.body.paymentMode !== "Cash") {
      // Create a payment intent in Stripe

      const paymentIntent = await stripe.paymentIntents.create({
        amount: parseInt(req.body.totalAmount) * 100,
        currency: "USD",
        receipt_email: req.body.emailId,
        metadata: {
          custName: tripDATA.customerName,
          source: req.body.source,
          destination: req.body.destination,
          tripID: tripDATA._id.toString(),
          tripNo: tripDATA.tripNo,
          // Add more key-value pairs as needed
        },
        description: `Payment for trip ${zeroPad(tripCount + 1, 4).toString()}`,
      });

      var userName = tripDATA.customerName;

      tripID = paymentIntent._id;
      if (paymentIntent.error) {
        console.error("Stripe API error:", paymentIntent.error);
      } else {
        console.log(paymentIntent.client_secret);
      }
      // Mail setup
      let transporter = nodemailer.createTransport({
        host: "mail.ahydratech.com",
        port: 465,
        secure: true,
        auth: {
          user: "noreply@ahydratech.com",
          pass: "WuNr2]fpg(D,",
        },
      });

      const mailOptions = {
        from: `"Saywa" <${process.env.NO_REPLY}>`,
        to: req.body.emailId,
        subject: "Document Verification Completed - Payment Reminder",
        html: `<table
        width="100%"
        id="m_-4521581668634247801outer_wrapper"
        style="background-color: #f7f7f7"
        bgcolor="#f7f7f7"
      >
        <tbody>
          <tr>
            <td></td>
            <td width="600">
              <div
                id="m_-4521581668634247801wrapper"
                dir="ltr"
                style="margin: 0 auto; padding: 70px 0; width: 100%; max-width: 600px"
                width="100%"
              >
                <table
                  border="0"
                  cellpadding="0"
                  cellspacing="0"
                  height="100%"
                  width="100%"
                >
                  <tbody>
                    <tr>
                      <td align="center" valign="top">
                        <div id="m_-4521581668634247801template_header_image"></div>
                        <table
                          border="0"
                          cellpadding="0"
                          cellspacing="0"
                          width="100%"
                          id="m_-4521581668634247801template_container"
                          style="
                            background-color: #fff;
                            border: 1px solid #dedede;
                            border-radius: 3px;
                          "
                          bgcolor="#fff"
                        >
                          <tbody>
                            <tr>
                              <td align="center" valign="top">
                                <table
                                  border="0"
                                  cellpadding="0"
                                  cellspacing="0"
                                  width="100%"
                                  id="m_-4521581668634247801template_header"
                                  style="
                                    background-color: #000000;
                                    color: #fff;
                                    border-bottom: 0;
                                    font-weight: bold;
                                    line-height: 100%;
                                    vertical-align: middle;
                                    font-family: 'Helvetica Neue', Helvetica, Roboto,
                                      Arial, sans-serif;
                                    border-radius: 3px 3px 0 0;
                                  "
                                  bgcolor="#0c9991"
                                >
                                  <tbody>
                                    <tr>
                                      <td
                                        id="m_-4521581668634247801header_wrapper"
                                        style="padding: 36px 48px; display: block"
                                      >
                                        <h1
                                          style="
                                            font-family: 'Helvetica Neue', Helvetica,
                                              Roboto, Arial, sans-serif;
                                            font-size: 30px;
                                            font-weight: 300;
                                            line-height: 150%;
                                            margin: 0;
                                            text-align: left;
                                            color: #fff;
                                            background-color: inherit;
                                          "
                                          bgcolor="inherit"
                                        >
                                          Trip Created by Admin
                                        </h1>
                                      </td>
                                    </tr>
                                  </tbody>
                                </table>
                              </td>
                            </tr>
                            <tr>
                              <td align="center" valign="top">
                                <table
                                  border="0"
                                  cellpadding="0"
                                  cellspacing="0"
                                  width="100%"
                                  id="m_-4521581668634247801template_body"
                                >
                                  <tbody>
                                    <tr>
                                      <td
                                        valign="top"
                                        id="m_-4521581668634247801body_content"
                                        style="background-color: #fff"
                                        bgcolor="#fff"
                                      >
                                        <table
                                          border="0"
                                          cellpadding="20"
                                          cellspacing="0"
                                          width="100%"
                                        >
                                          <tbody>
                                            <tr>
                                              <td
                                                valign="top"
                                                style="padding: 48px 48px 32px"
                                              >
                                                <div
                                                  id="m_-4521581668634247801body_content_inner"
                                                  style="
                                                    color: #636363;
                                                    font-family: 'Helvetica Neue',
                                                      Helvetica, Roboto, Arial,
                                                      sans-serif;
                                                    font-size: 14px;
                                                    line-height: 150%;
                                                    text-align: left;
                                                  "
                                                  align="left"
                                                >
                                                  <p style="margin: 0 0">
                                                    Dear ${userName}
                                                  </p>
                                                  <p>
                                                 We are pleased to inform you that your documents have been successfully verified. We will proceed to assign a chauffeur for your upcoming trip and send you a follow-up email shortly.
    </p>
                                                  <p style="color: #666666">
                                                    Please note that there is a pending payment of $ ${
                                                      req.body.totalAmount
                                                    } for trip number ${zeroPad(
          tripCount + 1,
          4
        )}. To complete the payment, kindly click the link below:
    
                                                  </p>
                                                  
                                                   <table style="border-collapse: collapse; width: 100%;" border="1">
                  <thead>
                    <tr>
                      <th style="width: 20%;">Order No</th>
                      <th style="width: 20%;">Pick up location</th>
                      <th style="width: 20%;">Drop off location</th>
                      <th style="width: 20%;">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td style="width: 20%;">${zeroPad(tripCount + 1, 4)}</td>
                      <td style="width: 20%;">${req.body.source}</td>
                      <td style="width: 20%;">${req.body.destination}</td>
                      <td style="width: 20%;">${req.body.totalAmount}</td>
                    </tr>
                  </tbody>
                </table>
                <p  style="padding-top:16px"><a style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: #fff; text-decoration: none; border-radius: 5px;" href="${
                  process.env.CLIENT_URL
                }/payment/${paymentIntent.client_secret}/${
          tripDATA._id
        }">Pay Now</a></p>
     
    
                                                  <p style="color: #666666">
                                                  If you have any questions or concerns, please don't hesitate to contact us at ${
                                                    process.env.CONTACT_EMAIL
                                                  }.
                                                 
                                                  </p>
    
                                                  <p style="color: #666666">
                                                    Thank you for your business!
    
                                                  </p>
    
                                                  <p style="color: #666666">
                                                    Best regards,<br /><strong
                                                      >Saywa</strong
                                                    >
                                                  </p>
                                                  <br />
                                                </div>
                                              </td>
                                            </tr>
                                          </tbody>
                                        </table>
                                      </td>
                                    </tr>
                                  </tbody>
                                </table>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </td>
            <td></td>
          </tr>
        </tbody>
      </table>`,
      };

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          res.status(500).json({ error: "Failed to send email" });
        } else {
          res.json({ message: "Payment link sent successfully" });
          // return res.status(200).json(verifyContent);
        }
      });
    }
    return res.status(200).json({
      data: tripDATA,
    });
  } catch (error) {
    console.log(error);
    return res.status(400).json({
      message: error,
    });
  }
});

//add Trip Admin

// const addTrip =asyncHandler(async(req,res)=>{
//   const  newtrip = await
// })

// const verifyContent = asyncHandler(async (req, res) => {
//   const query = {
//     _id: new mongoose.Types.ObjectId(req.body._id),
//   };
//   const data = {
//     $set: {
//       tripStatus: req.body.tripStatus,
//     },
//   };

//   try {
//     const getCustomerData = await Trips.find(query);

//     // Create a payment intent in Stripe
//     const paymentIntent = await stripe.paymentIntents.create({
//       amount: getCustomerData[0].totalAmount * 100, // Amount in cents
//       currency: "INR",
//     });

//     // const verifyContent = await Trips.updateOne(query, data);
//     // mail setup
// let transporter = await nodemailer.createTransport({
//   host: "mail.ahydratech.com",
//   port: 465,
//   secure: true, // true for 465, false for other ports
//   auth: {
//     user: "noreply@ahydratech.com", // generated ethereal user
//     pass: "WuNr2]fpg(D,", // generated ethereal password
//   },
// });

// transporter.sendMail({
//   from: '"Saywa" <${process.env.NO_REPLY}>', // sender address
//   to: "ralbin@ahydratech.com", // list of receivers
//   subject: "Agreement Verified", // Subject line
//   // text: "Hello world?", // plain text body
//   // html: "<p>Dear <br/> Your documents have been verified. We will assign a driver and send you another email.</p>",
//   html: `<div style="padding: 20px; text-align: center;">
//         <h2>Payment Link</h2>
//         <p style="text-align: left;">Dear user,</p>
//         <p style="text-align: left;">Your documents have been verified. We will assign a driver and send you another email.</p>
//         <p style="text-align: left;">You have a pending payment of ${getCustomerData[0].totalAmount} for the trip number ${getCustomerData[0].tripNo}. To complete the payment, please click the link below:</p>
//         <table style="border-collapse: collapse; width: 100%;" border="1">
//         <tbody>
//         <tr>
//         <th style="width: 20%;">Order No</th>
//         <th style="width: 20%;">Pick up location</th>
//         <th style="width: 20%;">Drop off location</th>
//         <th style="width: 20%;">Amount</th>
//         </tr>
//         <tr>
//         <td style="width: 20%;">${tripNo}</td>
//         <td style="width: 20%;">${getCustomerData[0].source}</td>
//         <td style="width: 20%;">${getCustomerData[0].destination}</td>
//         <td style="width: 20%;">${getCustomerData[0].totalAmount}</td>
//         </tr>
//         </tbody>
//         </table>
//         <p><a style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: #fff; text-decoration: none; border-radius: 5px;" href="http://localhost:5173/payment/${paymentIntent.client_secret}">Pay Now</a></p>
//         <p>Payment link :&nbsp; <a style="color: #007bff; text-decoration: none; border-radius: 5px;" href="http://localhost:5173/payment/${paymentIntent.client_secret}">http://localhost:5173/payment/${paymentIntent.client_secret}</a></p>
//         <p>If you have any questions or concerns, please don't hesitate to contact us at [Contact Email].</p>
//         <p>Thank you for your business!</p>
//         </div>`,
// });
// transporter.sendMail(mailOptions, (error, info) => {
//   if (error) {
//     res.status(500).json({ error: "Failed to send email" });
//   } else {
//     console.log("Email sent: " + info.response);
//     res.json({ message: "Payment link sent successfully" });
//   }
// });
//     // return res.status(200).json(verifyContent);
//   } catch (error) {
//     return res.status(500).json({ error: "An error occurred" });
//   }
// });

const verifyContent = asyncHandler(async (req, res) => {
  const query = {
    _id: new mongoose.Types.ObjectId(req.body.id), //User Id
  };
  const data = {
    $set: {
      documentStatus: req.body.status, //Document Status
    },
  };

  if (data === "verified") {
    await Customers.updateOne(query, data);
    return res.status(200).json({ message: "Document Verified" });
  } else if (data === "rejected") {
    await Customers.updateOne(query, data);
    return res.status(200).json({ message: "Document Rejected" });
  }

  // try {
  //   const getCustomerData = await Trips.findOne(query); // Use findOne instead of find since you expect a single document
  //   await Trips.updateOne(query, data);
  //   const custData1 = await custData.find({
  //     user_id: getCustomerData.customerId,
  //   });

  //   // Mail setup
  //   let transporter = nodemailer.createTransport({
  //     host: "mail.ahydratech.com",
  //     port: 465,
  //     secure: true,
  //     auth: {
  //       user: "noreply@ahydratech.com",
  //       pass: "WuNr2]fpg(D,",
  //     },
  //   });

  //   const mailOptions = {
  //     from: '"Saywa" <${process.env.NO_REPLY}>',
  //     to: custData1[0].email,
  //     subject: "Agreement Verified",
  //     html: `<div style="padding: 20px; text-align: center;">
  //       <h2>Payment Link</h2>
  //       <p style="text-align: left;">Dear user,</p>
  //       <p style="text-align: left;">Your documents have been verified. We will assign a driver and send you another email.</p>
  //       <p style="text-align: left;">You have a pending payment of ${getCustomerData.totalAmount} for the trip number ${getCustomerData.tripNo}. To complete the payment, please click the link below:</p>
  //       <table style="border-collapse: collapse; width: 100%;" border="1">
  //         <thead>
  //           <tr>
  //             <th style="width: 20%;">Order No</th>
  //             <th style="width: 20%;">Pick up location</th>
  //             <th style="width: 20%;">Drop off location</th>
  //             <th style="width: 20%;">Amount</th>
  //           </tr>
  //         </thead>
  //         <tbody>
  //           <tr>
  //             <td style="width: 20%;">${getCustomerData.tripNo}</td>
  //             <td style="width: 20%;">${getCustomerData.source}</td>
  //             <td style="width: 20%;">${getCustomerData.destination}</td>
  //             <td style="width: 20%;">${getCustomerData.totalAmount}</td>
  //           </tr>
  //         </tbody>
  //       </table>
  //       <p  style="padding-top:16px"><a style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: #fff; text-decoration: none; border-radius: 5px;" href="${process.env.CLIENT_URL}/payment/${paymentIntent.client_secret}/${getCustomerData._id}">Pay Now</a></p>
  //       <p>Payment link: <a style="color: #007bff; text-decoration: none; border-radius: 5px;" href="${process.env.CLIENT_URL}/payment/${paymentIntent.client_secret}">${process.env.CLIENT_URL}/payment/${paymentIntent.client_secret}/${getCustomerData._id}</a></p>
  //       <p>If you have any questions or concerns, please don't hesitate to contact us at [Contact Email].</p>
  //       <p>Thank you for your business!</p>
  //     </div>`,
  //   };

  //   transporter.sendMail(mailOptions, (error, info) => {
  //     if (error) {
  //       res.status(500).json({ error: "Failed to send email" });
  //     } else {
  //       const data = {
  //         $set: {
  //           tripStatus: req.body.tripStatus,
  //         },
  //       };
  //       const verifyContent = Trips.updateOne(query, data);
  //       res.json({ message: "Payment link sent successfully" });
  //       // return res.status(200).json(verifyContent);
  //     }
  //   });

  //   // Update the trip status in your database

  //   // Return a response if needed
  // } catch (error) {
  //   return res.status(500).json({ error: error });
  // }
});

const update_driver_state = asyncHandler(async (req, res) => {
  const query = {
    _id: req.body.tripId,
  };

  const data = {
    $set: {
      tripStatus: req.body.status,
    },
  };

  const datax = await Trips.updateOne(query, data);
  return res.status(200).json({ data: "Done" });
});

const filteredTripData = asyncHandler(async (req, res) => {
  const query = {
    tripStatus: req.body.status,
  };

  const datax = await Trips.find(query);
  return res.status(200).json(datax);
});

const updateTripStatus = asyncHandler(async (req, res) => {
  try {
    const query = {
      _id: req.body.tripId,
    };
    const data = {
      $set: {
        tripStatus: req.body.status,
      },
    };

    const customer = await Trips.find(query).limit(1);

    const custData = await Customers.find({
      user_id: customer[0].customerId,
    }).limit(1);

    const tripData = await Trips.find({ _id: req.body.tripId });

    if (req.body.status == "Completed") {
      const referal = await REFERAL.find({
        refered_email: custData[0].email,
      });

      await sendEmail(custData[0].email, customer, tripData, custData);
    }

    await Trips.updateOne(query, data).then((response) => {
      return res.status(200).json({
        data: response,
      });
    });
  } catch (error) {
    return res.status(500).json(error);
  }
});

function generateHr(doc, y) {
  doc.strokeColor("#aaaaaa").lineWidth(1).moveTo(50, y).lineTo(550, y).stroke();
}

function formatDate(date) {
  const day = date.getDate();
  const month = date.getMonth() + 1;
  const year = date.getFullYear();

  return +month + "/" + day + "/" + year;
}
function formatCurrency(val) {
  return "$" + val.toFixed(0);
}

function generateTableRow(
  doc,
  y,
  item,
  description,
  unitCost,
  quantity,
  lineTotal
) {
  doc
    .fontSize(10)
    .text(item, 50, y)
    .text(description, 150, y)
    .text(unitCost, 280, y, { width: 90, align: "right" })
    // .text(quantity, 370, y, { width: 90, align: "right" })
    .text(lineTotal, 0, y, { align: "right" });
}

const VehiclesRateCalc = async (vahicleId, tripData, nit) => {
  const vehicleData = await Vehicle.findOne({ _id: vahicleId });

  console.log("vehicleData", vehicleData);
  console.log("tripData", tripData);
  let gratuityPrize = 0;
  let prizeData = 0;

  if (Math.ceil(tripData[0]?.totalKms) > 18) {
    const balseKmRate =
      (Math.ceil(tripData[0]?.totalKms) - vehicleData?.baseDistance) *
      vehicleData.pricePerUnitDistance;

    gratuityPrize =
      Math.ceil(
        (parseFloat(vehicleData?.basePrice) + (nit ? 20 : 0) + balseKmRate) * 20
      ) / 100;
    prizeData = parseFloat(vehicleData?.basePrice) + balseKmRate;

    console.log("gratuityPrize", gratuityPrize);

    return { gratuityPrize, prizeData };
  } else {
    gratuityPrize = (parseFloat(vehicleData?.basePrice) * 20) / 100;
    prizeData = parseFloat(vehicleData?.basePrice);
    return { gratuityPrize, prizeData };
  }
};

const generateInvoice = async (customer, tripData, custData) => {
  const doc = new PDFDocument();

  const pdfPath = path.join(__dirname, "invoice.pdf");
  let nightCharge = false;
  let TimeAndAMPMData = customer[0].scheduledTime.split(" ");
  console.log("TimeAndAMPMData", TimeAndAMPMData);
  if (TimeAndAMPMData.length > 0) {
    timeData = TimeAndAMPMData[0].split(":");
    if (parseInt(timeData[0]) == 10 || parseInt(timeData[0]) == 11) {
      if (TimeAndAMPMData[1] == "PM") {
        nightCharge = true;
      } else {
        nightCharge = false;
      }
    } else if (parseInt(timeData[0]) == 12 || 1 || 2 || 3 || 4 || 5) {
      if (
        parseInt(
          timeData[0] == 5 && timeData[1] <= 45 && TimeAndAMPMData[1] == "AM"
        )
      ) {
        nightCharge = true;
      } else if (TimeAndAMPMData[1] == "AM") {
        nightCharge = true;
      } else {
        nightCharge = false;
      }
    }
  }
  console.log(nightCharge);

  // Arrived
  const totalValue = await VehiclesRateCalc(
    customer[0]?.vehicleId.toString(),
    tripData,
    nightCharge
  );
  const vehicleinfo = await Vehicle.findOne({
    _id: customer[0]?.vehicleId.toString(),
  });

  doc.pipe(fs.createWriteStream(pdfPath));

  doc
    // .image("logo.png", 50, 45, { width: 50 })
    .fillColor("#444444")
    .fontSize(20)
    .text("Saywa", 55, 57)

    .fontSize(10)
    .text("3009 Bridgeport Way West", 55, 79)
    .text("Tacoma, WA 98466", 55, 92)
    .text("reservations@saywalimo.com", 55, 105)
    .text("877-206-0780", 55, 118)

    .fontSize(10)
    // .text("Seattle", 200, 65, { align: "right" })
    // .text("US", 200, 80, { align: "right" })
    .moveDown();

  doc.fillColor("#444444").fontSize(20).text("Invoice", 50, 160);

  generateHr(doc, 185);
  const customerInformationTop = 200;

  doc
    .fontSize(10)
    .text("Invoice no:", 50, customerInformationTop)
    .font("Helvetica-Bold")
    .text(tripData[0].tripNo, 150, customerInformationTop)
    .font("Helvetica")
    .text("Invoice Date:", 50, customerInformationTop + 15)
    .text(formatDate(tripData[0].created_at), 150, customerInformationTop + 15)

    .text("Bill to:", 300, customerInformationTop)
    .font("Helvetica-Bold")
    .text(tripData[0].customerName, 350, customerInformationTop)
    .font("Helvetica")
    .text(custData[0].email, 350, customerInformationTop + 14)
    .text(custData[0].contact_no, 350, customerInformationTop + 28)

    .moveDown();
  let i;
  const invoiceTableTop = 230;
  const { client } = "invoice";
  //   const { pricePerSession } = client;

  doc
    .font("Helvetica-Bold")
    .text("#", 50, invoiceTableTop + 60)
    .text("Quantity", 75, invoiceTableTop + 60)
    .text("Description", 125, invoiceTableTop + 60)
    .text("Price", 425, invoiceTableTop + 60, { align: "right" });
  generateHr(doc, invoiceTableTop + 80);

  const onewayTrip =
    "Transfer Ride starting at " +
    tripData[0].scheduledDate +
    ", " +
    tripData[0].scheduledTime +
    " from " +
    tripData[0].source +
    " to " +
    tripData[0].destination;

  doc
    .font("Helvetica")
    .text("1", 70, invoiceTableTop + 90)
    .text("1", 95, invoiceTableTop + 90)
    .text(onewayTrip, 135, invoiceTableTop + 90, { align: "left" })
    .text(
      "$ " +
        (parseInt(tripData[0].totalAmount) + parseInt(tripData[0].discount)),
      430,
      invoiceTableTop + 90,
      { align: "right" }
    );

  generateHr(doc, invoiceTableTop + 180);

  // const subtotalPosition = invoiceTableTop + 200;
  // generateTableRow(
  //   doc,
  //   subtotalPosition,
  //   "",
  //   "",
  //   "Subtotal",
  //   "",
  //   tripData[0].discount
  //     ? formatCurrency(
  //         parseInt(tripData[0].totalAmount) + parseInt(tripData[0].discount)
  //       )
  //     : formatCurrency(parseInt(tripData[0].totalAmount))
  // );
  const BaseRatePosition = invoiceTableTop + 200;
  generateTableRow(
    doc,
    BaseRatePosition,
    "",
    "",
    "Base Rate",
    "",
    vehicleinfo ? `$ ${vehicleinfo.basePrice}` : "-"
  );
  const primeTimePosition = BaseRatePosition + 20;
  generateTableRow(
    doc,
    primeTimePosition,
    "",
    "",
    "Prime Time",
    "",
    nightCharge ? "$ 20" : "$ 0"
  );
  const gratuityPosition = primeTimePosition + 20;
  generateTableRow(
    doc,
    gratuityPosition,
    "",
    "",
    "Gratuity",
    "",
    tripData[0].gratuityAmount
      ? `$ ${Math.round(totalValue.gratuityPrize)}`
      : "-"
  );
  const additionalChargePosition = gratuityPosition + 20;
  generateTableRow(
    doc,
    additionalChargePosition,
    "",
    "",
    "Distance Charge",
    "",
    tripData[0]
      ? `$ ${totalValue.prizeData - parseFloat(vehicleinfo?.basePrice)}`
      : "-"
  );
  const paidToDatePosition = additionalChargePosition + 20;
  generateTableRow(
    doc,
    paidToDatePosition,
    "",
    "",
    "Discount",
    "",
    tripData[0].discount ? `$ ${Math.round(tripData[0].discount)}` : "-"
  );
  const duePosition = paidToDatePosition + 25;
  doc.font("Helvetica-Bold");
  generateTableRow(
    doc,
    duePosition,
    "",
    "",
    "Grand Total",
    "",
    `$ ${tripData[0]?.totalAmount}`
  );
  doc.font("Helvetica");

  doc.text("===============", 452, duePosition + 10, { align: "right" });

  // OLD

  doc.moveDown(2);
  doc.text(
    "If weather/road conditions become harsh and hazardous. An extra surcharge will be billed to the client depending on the extent of conditions.For airport pickups, we provide an hour standby.",
    50
  );
  doc.moveDown(1);
  doc.text(
    "For regular reservations, a 30 minute standby is provided, afterwards standby will be charged. $95 for Sedan. $115 for SUV. Cancellations made within 3 hours of the reservation are charged full fare. No shows is the same concept with no refund. The driver has the right to decline a reservation if the client hasn't shown up for 1 hour since the scheduled pickup time. Changes made within 3 hours of the reservation will be charged as standby. By paying this invoice, the client agrees to these terms and conditions.",
    50
  );
  // doc.moveDown(1);
  // doc.text(
  //   "You're welcome! If you have any more questions or need further assistance in the future, feel free to ask. Have a great day and we look forward to assisting you again soon!",
  //   50
  // );
  doc.moveDown(1);
  doc.text("Best regards,", 50);
  doc.moveDown();
  doc.text("Saywa Team", 50);
  doc.moveDown(1);

  doc.end();
};

// Function to send the email with the invoice attached
async function sendEmail(email, customer, tripData, custData) {
  await generateInvoice(customer, tripData, custData);
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

  const mailOptions = {
    from: `"Saywa" <${process.env.CONTACT_EMAIL}>`,
    to: email,
    subject: "Thank You for Riding with Saywa!",
    html: `<table
    width="100%"
    id="m_-4521581668634247801outer_wrapper"
    style="background-color: #f7f7f7"
    bgcolor="#f7f7f7"
  >
    <tbody>
      <tr>
        <td></td>
        <td width="600">
          <div
            id="m_-4521581668634247801wrapper"
            dir="ltr"
            style="margin: 0 auto; padding: 70px 0; width: 100%; max-width: 600px"
            width="100%"
          >
            <table
              border="0"
              cellpadding="0"
              cellspacing="0"
              height="100%"
              width="100%"
            >
              <tbody>
                <tr>
                  <td align="center" valign="top">
                    <div id="m_-4521581668634247801template_header_image"></div>
                    <table
                      border="0"
                      cellpadding="0"
                      cellspacing="0"
                      width="100%"
                      id="m_-4521581668634247801template_container"
                      style="
                        background-color: #fff;
                        border: 1px solid #dedede;
                        border-radius: 3px;
                      "
                      bgcolor="#fff"
                    >
                      <tbody>
                        <tr>
                          <td align="center" valign="top">
                            <table
                              border="0"
                              cellpadding="0"
                              cellspacing="0"
                              width="100%"
                              id="m_-4521581668634247801template_header"
                              style="
                                background-color: #000000;
                                color: #fff;
                                border-bottom: 0;
                                font-weight: bold;
                                line-height: 100%;
                                vertical-align: middle;
                                font-family: 'Helvetica Neue', Helvetica, Roboto,
                                  Arial, sans-serif;
                                border-radius: 3px 3px 0 0;
                              "
                              bgcolor="#0c9991"
                            >
                              <tbody>
                                <tr>
                                  <td
                                    id="m_-4521581668634247801header_wrapper"
                                    style="padding: 36px 48px; display: block"
                                  >
                                    <h1
                                      style="
                                        font-family: 'Helvetica Neue', Helvetica,
                                          Roboto, Arial, sans-serif;
                                        font-size: 30px;
                                        font-weight: 300;
                                        line-height: 150%;
                                        margin: 0;
                                        text-align: left;
                                        color: #fff;
                                        background-color: inherit;
                                      "
                                      bgcolor="inherit"
                                    >
                                      Trip Completed
                                    </h1>
                                  </td>
                                </tr>
                              </tbody>
                            </table>
                          </td>
                        </tr>
                        <tr>
                          <td align="center" valign="top">
                            <table
                              border="0"
                              cellpadding="0"
                              cellspacing="0"
                              width="100%"
                              id="m_-4521581668634247801template_body"
                            >
                              <tbody>
                                <tr>
                                  <td
                                    valign="top"
                                    id="m_-4521581668634247801body_content"
                                    style="background-color: #fff"
                                    bgcolor="#fff"
                                  >
                                    <table
                                      border="0"
                                      cellpadding="20"
                                      cellspacing="0"
                                      width="100%"
                                    >
                                      <tbody>
                                        <tr>
                                          <td
                                            valign="top"
                                            style="padding: 48px 48px 32px"
                                          >
                                            <div
                                              id="m_-4521581668634247801body_content_inner"
                                              style="
                                                color: #636363;
                                                font-family: 'Helvetica Neue',
                                                  Helvetica, Roboto, Arial,
                                                  sans-serif;
                                                font-size: 14px;
                                                line-height: 150%;
                                                text-align: left;
                                              "
                                              align="left"
                                            >
                                              <p style="margin: 0 0">
                                                  Dear ${customer[0].customerName}
                                              </p>
                                              <p style="text-align:justify">Thank you for choosing Saywa for your recent ride! We hope you had a pleasant experience.
</p>
                                              <p style="text-align:justify">Your feedback is invaluable to us in our efforts to continually improve our service. Did we meet your expectations? Please share any suggestions on how we can enhance your experience next time.
</p>
                                              <p style="text-align:justify">
                                               Your ride has been charged to the payment method selected during booking, so no further action is required from you. Attached to this email, you will find a copy of your invoice for your reference.

                                              </p>
                                             
                                              <p>
                                              	<table style="width:100%">
                                                  <tr style="background:#f0f0f0 ">
                                                    <td style="text-align:start; padding:10px">Booking Number :
                                                    <td style="text-align:start; padding:10px">${tripData[0].tripNo}
                                                  </tr> 
                                                  <tr style="background:#f0f0f0 ">
                                                    <td style="text-align:start; padding:10px">Date and time :
                                                    <td style="text-align:start; padding:10px">${tripData[0].scheduledDate} ${tripData[0].scheduledTime}
                                                  </tr>
                                                  <tr style="background:#f0f0f0 ">
                                                    <td style="text-align:start; padding:10px">From :
                                                    <td style="text-align:start; padding:10px">${tripData[0].source}
                                                  </tr>
                                                  <tr style="background:#f0f0f0 ">
                                                    <td style="text-align:start; padding:10px">To :
                                                    <td style="text-align:start; padding:10px">${tripData[0].destination}
                                                  </tr>
                                                  <tr style="background:#f0f0f0 ">
                                                    <td style="text-align:start; padding:10px">Distance :
                                                    <td style="text-align:start; padding:10px">${tripData[0].totalKms}
                                                  </tr>
                                                   <tr style="background:#f0f0f0 ">
                                                    <td style="text-align:start; padding:10px">Price :
                                                    <td style="text-align:start; padding:10px">${tripData[0].totalAmount}
                                                  </tr>
                                                   <tr style="background:#f0f0f0 ">
                                                    <td style="text-align:start; padding:10px">Vehicle :
                                                    <td style="text-align:start; padding:10px">Distance
                                                  </tr>
                                                   
                                                     <tr style="background:#f0f0f0 ">
                                                    <td style="text-align:start; padding:10px">Mobile :
                                                    <td style="text-align:start; padding:10px">${custData[0].contact_no}
                                                  </tr>
                                                   <tr style="background:#f0f0f0 ">
                                                    <td style="text-align:start; padding:10px">Email :
                                                    <td style="text-align:start; padding:10px">${email}
                                                  </tr>
                                              </table>
                                              <p>Safe travels!</p>
                                              <p>
                                                Best regards,<br />Saywa Limo
                                              </p>
  
                                              <br />
                                               <div>
                                            <b>About Saywa</b><br/>
                                            <p style="text-align:justify">
Seattle’s premier luxury transportation provider specializing exclusively in airport transfers. Established in 2023, Saywa has built a solid reputation as the leading choice for limousine and luxury transportation services in Seattle.</p>
											<p style="text-align:justify"> Our services are tailored specifically for airport transfers, ensuring a seamless and luxurious experience for our clients. With a focus on corporate travel and special events, Saywa offers sleek and stylish vehicles paired with exceptional service and attention to detail. Choose Saywa for a truly extraordinary and memorable transportation experience.</p>
                                            <p>

<p>TRAVEL:<br/></p>

<p>Luxury Transportation Services | Saywa: Explore Destinations in Style</p>
											<p style="text-align:justify">
                                            Discover seamless travel experiences with Saywa’s luxury transportation services. Whether for corporate events, special celebrations, or reliable transportation needs, trust Saywa to take you in comfort and style. From bustling city centers to serene countryside retreats, Saywa is your trusted partner for exploring diverse destinations effortlessly. Begin your journey with Saywa and experience travel redefined.</p>

                                            </div>
                                            </div>
                                           
                                          </td>
                                        </tr>
                                      </tbody>
                                    </table>
                                  </td>
                                </tr>
                              </tbody>
                            </table>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </td>
        <td></td>
      </tr>
    </tbody>
  </table>
  `,
    attachments: [
      {
        filename: "invoice.pdf",
        path: __dirname + "/invoice.pdf",
        contentType: "application/pdf",
      },
    ],
  };

  // Send email
  try {
    const info = await transporter.sendMail(mailOptions);

    fs.unlink(__dirname + "/invoice.pdf", (err) => {
      if (err) {
        console.error("Error deleting invoice.pdf:", err);
      } else {
        console.log("Invoice.pdf deleted successfully.");
      }
    });
    console.log("Email sent:", info.response);
  } catch (error) {
    console.error("Error sending email:", error);
  }
}

const lastFiveTrips = asyncHandler(async (req, res) => {
  try {
    const response = await Trips.find().sort({ no: -1 }).limit(5);
    return res.status(200).json(response);
  } catch (error) {}
});
const totalTripCount = asyncHandler(async (req, res) => {
  try {
    const response = await Trips.find();
    return res.status(200).json({ count: response.length });
  } catch (error) {}
});

// const updateStatus = async (req, res) => {

//   const query = {
//     _id: req.body.id,
//   };
//   const data = {
//     documentStatus: req.body.status,
//   };

//   try {
//     await custData.updateOne(query, data);
//     const singleCustomer = await custData.find(query)
//     return res.status(200).json(singleCustomer);
//   } catch (error) {
//     return res.status(500).json(error);
//   }
// };

const updateStatus = async (req, res) => {
  console.log(req.body);
  try {
    const query = {
      _id: req.body.id,
    };

    const savedData = {
      documentStatus: req.body.status,
      reason_Rejection: req.body.reason,
    };

    const data = {
      $set: {
        documentStatus: req.body.status,
        reason_Rejection: req.body.reason,
      },
    };
    await Customers.updateOne(query, data);
    if (savedData.documentStatus === "Rejected") {
      const query = {
        _id: req.body.id,
      };

      const data = await Customers.find(query);

      sendVerificationFailedMail(data[0].email, data[0].fullName);
      return res.status(200).json([]);
    } else if (savedData.documentStatus === "Verified") {
      const query = {
        _id: req.body.id,
      };

      const data = await Customers.find(query);

      sendVerificationSuccessMail(data[0].email, data[0].fullName);
      return res.status(200).json([]);
    }
  } catch (error) {
    return res.status(400).json({
      message: error.message || "An error occurred",
    });
  }
};

function sendVerificationFailedMail(email, userName) {
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

  // Corrected mailOptions to use the html property directly in sendMail
  transporter.sendMail({
    from: `"Saywa" <${process.env.NO_REPLY}>`,
    to: email,
    subject: "Agreement Verification Falied",
    html: `<table
    width="100%"
    id="m_-4521581668634247801outer_wrapper"
    style="background-color: #f7f7f7"
    bgcolor="#f7f7f7"
  >
    <tbody>
      <tr>
        <td></td>
        <td width="600">
          <div
            id="m_-4521581668634247801wrapper"
            dir="ltr"
            style="margin: 0 auto; padding: 70px 0; width: 100%; max-width: 600px"
            width="100%"
          >
            <table
              border="0"
              cellpadding="0"
              cellspacing="0"
              height="100%"
              width="100%"
            >
              <tbody>
                <tr>
                  <td align="center" valign="top">
                    <div id="m_-4521581668634247801template_header_image"></div>
                    <table
                      border="0"
                      cellpadding="0"
                      cellspacing="0"
                      width="100%"
                      id="m_-4521581668634247801template_container"
                      style="
                        background-color: #fff;
                        border: 1px solid #dedede;
                        border-radius: 3px;
                      "
                      bgcolor="#fff"
                    >
                      <tbody>
                        <tr>
                          <td align="center" valign="top">
                            <table
                              border="0"
                              cellpadding="0"
                              cellspacing="0"
                              width="100%"
                              id="m_-4521581668634247801template_header"
                              style="
                                background-color: #000000;
                                color: #fff;
                                border-bottom: 0;
                                font-weight: bold;
                                line-height: 100%;
                                vertical-align: middle;
                                font-family: 'Helvetica Neue', Helvetica, Roboto,
                                  Arial, sans-serif;
                                border-radius: 3px 3px 0 0;
                              "
                              bgcolor="#0c9991"
                            >
                              <tbody>
                                <tr>
                                  <td
                                    id="m_-4521581668634247801header_wrapper"
                                    style="padding: 36px 48px; display: block"
                                  >
                                    <h1
                                      style="
                                        font-family: 'Helvetica Neue', Helvetica,
                                          Roboto, Arial, sans-serif;
                                        font-size: 30px;
                                        font-weight: 300;
                                        line-height: 150%;
                                        margin: 0;
                                        text-align: left;
                                        color: #fff;
                                        background-color: inherit;
                                      "
                                      bgcolor="inherit"
                                    >
                                      Document  Failed
                                    </h1>
                                  </td>
                                </tr>
                              </tbody>
                            </table>
                          </td>
                        </tr>
                        <tr>
                          <td align="center" valign="top">
                            <table
                              border="0"
                              cellpadding="0"
                              cellspacing="0"
                              width="100%"
                              id="m_-4521581668634247801template_body"
                            >
                              <tbody>
                                <tr>
                                  <td
                                    valign="top"
                                    id="m_-4521581668634247801body_content"
                                    style="background-color: #fff"
                                    bgcolor="#fff"
                                  >
                                    <table
                                      border="0"
                                      cellpadding="20"
                                      cellspacing="0"
                                      width="100%"
                                    >
                                      <tbody>
                                        <tr>
                                          <td
                                            valign="top"
                                            style="padding: 48px 48px 32px"
                                          >
                                            <div
                                              id="m_-4521581668634247801body_content_inner"
                                              style="
                                                color: #636363;
                                                font-family: 'Helvetica Neue',
                                                  Helvetica, Roboto, Arial,
                                                  sans-serif;
                                                font-size: 14px;
                                                line-height: 150%;
                                                text-align: left;
                                              "
                                              align="left"
                                            >
                                              <p style="margin: 0 0">
                                                Dear ${userName}
                                              </p>
                                              <p style="color: #666666">
                                                We are sorry to inform you that your document verification failed. Your information has been reviewed and rejected.

                                              </p>

                                              <!-- Add specific details or additional information here -->

                                              <p style="color: #666666">
                                              If you have any further questions or concerns, please feel free to contact us ${process.env.CONTACT_EMAIL}.
                                             
                                              </p>

                                              <p style="color: #666666">
                                                Thank you for choosing our
                                                services!
                                              </p>

                                              <p style="color: #666666">
                                                Best regards,<br /><strong
                                                  >Saywa</strong
                                                >
                                              </p>
                                              <br />
                                            </div>
                                          </td>
                                        </tr>
                                      </tbody>
                                    </table>
                                  </td>
                                </tr>
                              </tbody>
                            </table>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </td>
        <td></td>
      </tr>
    </tbody>
  </table>
  `,
  });
}
function sendVerificationSuccessMail(email, userName) {
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

  // Corrected mailOptions to use the html property directly in sendMail
  transporter.sendMail({
    from: `"Saywa" <${process.env.NO_REPLY}>`,
    to: email,
    subject: "Document  Approved",
    html: `<table
    width="100%"
    id="m_-4521581668634247801outer_wrapper"
    style="background-color: #f7f7f7"
    bgcolor="#f7f7f7"
  >
    <tbody>
      <tr>
        <td></td>
        <td width="600">
          <div
            id="m_-4521581668634247801wrapper"
            dir="ltr"
            style="margin: 0 auto; padding: 70px 0; width: 100%; max-width: 600px"
            width="100%"
          >
            <table
              border="0"
              cellpadding="0"
              cellspacing="0"
              height="100%"
              width="100%"
            >
              <tbody>
                <tr>
                  <td align="center" valign="top">
                    <div id="m_-4521581668634247801template_header_image"></div>
                    <table
                      border="0"
                      cellpadding="0"
                      cellspacing="0"
                      width="100%"
                      id="m_-4521581668634247801template_container"
                      style="
                        background-color: #fff;
                        border: 1px solid #dedede;
                        border-radius: 3px;
                      "
                      bgcolor="#fff"
                    >
                      <tbody>
                        <tr>
                          <td align="center" valign="top">
                            <table
                              border="0"
                              cellpadding="0"
                              cellspacing="0"
                              width="100%"
                              id="m_-4521581668634247801template_header"
                              style="
                                background-color: #000000;
                                color: #fff;
                                border-bottom: 0;
                                font-weight: bold;
                                line-height: 100%;
                                vertical-align: middle;
                                font-family: 'Helvetica Neue', Helvetica, Roboto,
                                  Arial, sans-serif;
                                border-radius: 3px 3px 0 0;
                              "
                              bgcolor="#0c9991"
                            >
                              <tbody>
                                <tr>
                                  <td
                                    id="m_-4521581668634247801header_wrapper"
                                    style="padding: 36px 48px; display: block"
                                  >
                                    <h1
                                      style="
                                        font-family: 'Helvetica Neue', Helvetica,
                                          Roboto, Arial, sans-serif;
                                        font-size: 30px;
                                        font-weight: 300;
                                        line-height: 150%;
                                        margin: 0;
                                        text-align: left;
                                        color: #fff;
                                        background-color: inherit;
                                      "
                                      bgcolor="inherit"
                                    >
                                    Document  Approved
                                    </h1>
                                  </td>
                                </tr>
                              </tbody>
                            </table>
                          </td>
                        </tr>
                        <tr>
                          <td align="center" valign="top">
                            <table
                              border="0"
                              cellpadding="0"
                              cellspacing="0"
                              width="100%"
                              id="m_-4521581668634247801template_body"
                            >
                              <tbody>
                                <tr>
                                  <td
                                    valign="top"
                                    id="m_-4521581668634247801body_content"
                                    style="background-color: #fff"
                                    bgcolor="#fff"
                                  >
                                    <table
                                      border="0"
                                      cellpadding="20"
                                      cellspacing="0"
                                      width="100%"
                                    >
                                      <tbody>
                                        <tr>
                                          <td
                                            valign="top"
                                            style="padding: 48px 48px 32px"
                                          >
                                            <div
                                              id="m_-4521581668634247801body_content_inner"
                                              style="
                                                color: #636363;
                                                font-family: 'Helvetica Neue',
                                                  Helvetica, Roboto, Arial,
                                                  sans-serif;
                                                font-size: 14px;
                                                line-height: 150%;
                                                text-align: left;
                                              "
                                              align="left"
                                            >
                                              <p style="margin: 0 0">
                                                Dear ${userName}
                                              </p>
                                              <p style="color: #666666">
                                               We are pleased to confirm that your document has been successfully verified. Your information has been thoroughly reviewed and confirmed.

                                              </p>

                                              <!-- Add specific details or additional information here -->

                                              <p style="color: #666666">
                                                Should you have any additional questions or concerns, please do not hesitate to reach out to us.

                                              </p>

                                              <p style="color: #666666">
                                                Thank you for choosing Saywa Limo’s services!

                                              </p>

                                              <p style="color: #666666">
                                                Best regards,<br /><strong
                                                  >Saywa</strong
                                                >
                                              </p>
                                              <br />
                                            </div>
                                          </td>
                                        </tr>
                                      </tbody>
                                    </table>
                                  </td>
                                </tr>
                              </tbody>
                            </table>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </td>
        <td></td>
      </tr>
    </tbody>
  </table>
  `,
  });
}

const sendPaymentLink = async (req, res) => {
  const data = req.body;
  const zeroPad = (num, places) => String(num).padStart(places, "0");
  const CLIENT_URL = process.env.CLIENT_URL;

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

  const paymentIntent = await stripe.paymentIntents.create({
    amount: parseFloat(req.body.totalAmount) * 100,
    currency: "USD",
    automatic_payment_methods: {
      enabled: true,
    },
    description: req.body.tripNo,
  });

  const mailOptions = {
    from: `"Saywa" <${process.env.CONTACT_EMAIL}>`,
    to: req.body.customerdata[0].email,
    subject: "Payment requested",
    html: `<table
        width="100%"
        id="m_-4521581668634247801outer_wrapper"
        style="background-color: #f7f7f7"
        bgcolor="#f7f7f7"
      >
        <tbody>
          <tr>
            <td></td>
            <td width="600">
              <div
                id="m_-4521581668634247801wrapper"
                dir="ltr"
                style="margin: 0 auto; padding: 70px 0; width: 100%; max-width: 600px"
                width="100%"
              >
                <table
                  border="0"
                  cellpadding="0"
                  cellspacing="0"
                  height="100%"
                  width="100%"
                >
                  <tbody>
                    <tr>
                      <td align="center" valign="top">
                        <div id="m_-4521581668634247801template_header_image"></div>
                        <table
                          border="0"
                          cellpadding="0"
                          cellspacing="0"
                          width="100%"
                          id="m_-4521581668634247801template_container"
                          style="
                            background-color: #fff;
                            border: 1px solid #dedede;
                            border-radius: 3px;
                          "
                          bgcolor="#fff"
                        >
                          <tbody>
                            <tr>
                              <td align="center" valign="top">
                                <table
                                  border="0"
                                  cellpadding="0"
                                  cellspacing="0"
                                  width="100%"
                                  id="m_-4521581668634247801template_header"
                                  style="
                                    background-color: #000000;
                                    color: #fff;
                                    border-bottom: 0;
                                    font-weight: bold;
                                    line-height: 100%;
                                    vertical-align: middle;
                                    font-family: 'Helvetica Neue', Helvetica, Roboto,
                                      Arial, sans-serif;
                                    border-radius: 3px 3px 0 0;
                                  "
                                  bgcolor="#0c9991"
                                >
                                  <tbody>
                                    <tr>
                                      <td
                                        id="m_-4521581668634247801header_wrapper"
                                        style="padding: 36px 48px; display: block"
                                      >
                                        <h1
                                          style="
                                            font-family: 'Helvetica Neue', Helvetica,
                                              Roboto, Arial, sans-serif;
                                            font-size: 30px;
                                            font-weight: 300;
                                            line-height: 150%;
                                            margin: 0;
                                            text-align: left;
                                            color: #fff;
                                            background-color: inherit;
                                          "
                                          bgcolor="inherit"
                                        >
                                          Trip Created by Admin
                                        </h1>
                                      </td>
                                    </tr>
                                  </tbody>
                                </table>
                              </td>
                            </tr>
                            <tr>
                              <td align="center" valign="top">
                                <table
                                  border="0"
                                  cellpadding="0"
                                  cellspacing="0"
                                  width="100%"
                                  id="m_-4521581668634247801template_body"
                                >
                                  <tbody>
                                    <tr>
                                      <td
                                        valign="top"
                                        id="m_-4521581668634247801body_content"
                                        style="background-color: #fff"
                                        bgcolor="#fff"
                                      >
                                        <table
                                          border="0"
                                          cellpadding="20"
                                          cellspacing="0"
                                          width="100%"
                                        >
                                          <tbody>
                                            <tr>
                                              <td
                                                valign="top"
                                                style="padding: 48px 48px 32px"
                                              >
                                                <div
                                                  id="m_-4521581668634247801body_content_inner"
                                                  style="
                                                    color: #636363;
                                                    font-family: 'Helvetica Neue',
                                                      Helvetica, Roboto, Arial,
                                                      sans-serif;
                                                    font-size: 14px;
                                                    line-height: 150%;
                                                    text-align: left;
                                                  "
                                                  align="left"
                                                >
                                                   <div>
<p style="text-align: left;">Dear ${req.body.customerdata[0].fullName},</p>
    <p style="text-align: left;">Your documents have been verified. We will assign a driver and send you another email.</p>
    <p style="text-align: left;">You have a pending payment of <strong>$${parseFloat(
      req.body.totalAmount
    )} </strong>for the trip number <strong>${
      req.body.tripNo
    }</strong>. To complete the payment, please click the link below:</p>
        <table style="border-collapse: collapse; width: 100%;" border="1">
      <thead>
        <tr>
          <th style="width: 20%;">Order No</th>
          <th style="width: 20%;">Pick up location</th>
          <th style="width: 20%;">Drop off location</th>
          <th style="width: 20%;">Amount</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td style="width: 20%;">${req.body.tripNo}</td>
          <td style="width: 20%;">${req.body.source}</td>
          <td style="width: 20%;">${req.body.destination}</td>
          <td style="width: 20%;">$${parseFloat(req.body.totalAmount)}</td>
        </tr>
      </tbody>
    </table>
    <p  style="padding-top:16px"><a style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: #fff; text-decoration: none; border-radius: 5px;" href="${
      process.env.CLIENT_URL
    }/payment/${paymentIntent.client_secret}/${req.body._id}">Pay Now</a></p>
     
    <p>If you have any questions or concerns, please don't hesitate to contact us at ${
      process.env.CONTACT_EMAIL
    }.</p>
    <p>Thank you for your business!</p>
  </div>
                                                </div>
                                              </td>
                                            </tr>
                                          </tbody>
                                        </table>
                                      </td>
                                    </tr>
                                  </tbody>
                                </table>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </td>
            <td></td>
          </tr>
        </tbody>
      </table>
`,
  };
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      res.status(500).json({ error: "Failed to send email" });
    } else {
      res.json({ message: "Payment link sent successfully" });
      // return res.status(200).json(verifyContent);
    }
  });
};

const updatePaymentInfo = async (req, res) => {
  try {
    const query = {
      _id: req.body.tripId,
    };
    const data = {
      $set: {
        paymentId: req.body.clientSecret,
        paymentReference: req.body.paymentId,
      },
    };

    const tripData = await Trips.updateOne(query, data);
    return res.status(200).json(tripData);
  } catch (error) {
    return res.status(500).json(error);
  }
};

const downloadInvoice = async (req, res) => {
  const doc = new PDFDocument();
  const filePath = path.join(__dirname, "invoice.pdf");

  doc.pipe(fs.createWriteStream(filePath));

  const logoimage = path.join(__dirname, "logo.png");
  doc
    .fillColor("#444444")
    .image(`${logoimage}`, 55, 57, { width: 100 })
    .moveDown();
  doc
    .fillColor("#444444")
    .fontSize(20)
    // .text("Saywa", 55, 57)

    .fontSize(10)
    .text("3009 Bridgeport Way West", 55, 105)
    .text("Tacoma, WA 98466", 55, 118)
    .text("reservations@saywalimo.com", 55, 131)
    .text("877-206-0780", 55, 144)

    .fontSize(10)
    // .text("Seattle", 200, 105, { align: "right" })
    // .text("US", 200, 120, { align: "right" })
    .moveDown();

  doc
    .fillColor("#000000")
    .fontSize(20)
    .text("INVOICE", 50, 180, { align: "center" });
  generateHr(doc, 200);

  const customerInformationTop = 220;
  doc
    .fontSize(10)
    .text("Invoice no:", 50, customerInformationTop)
    .font("Helvetica-Bold")
    .text(req.body.data.tripNo, 150, customerInformationTop)
    .font("Helvetica")
    .text("Invoice Date:", 50, customerInformationTop + 15)
    .text(
      formatDate(new Date(req.body.data.created_at)),
      150,
      customerInformationTop + 15
    )

    .text("Bill to:", 300, customerInformationTop)
    .font("Helvetica-Bold")
    .text(req.body.data.customerName, 350, customerInformationTop)
    .font("Helvetica")
    .text(
      req.body.data?.customerData[0]?.email,
      350,
      customerInformationTop + 14
    )
    .text(
      req.body.data?.customerData[0]?.contact_no,
      350,
      customerInformationTop + 28
    )

    .moveDown();

  const invoiceTableTop = 230;
  doc
    .font("Helvetica-Bold")
    .text("#", 50, invoiceTableTop + 60)
    .text("Quantity", 75, invoiceTableTop + 60)
    .text("Description", 125, invoiceTableTop + 60)
    .text("Price", 325, invoiceTableTop + 60, { align: "right" });
  generateHr(doc, invoiceTableTop + 80);

  const destination =
    req.body.data.rideType === "hourly-trip"
      ? ""
      : ` to ${req.body.data?.destination}`;

  const onewayTrip =
    "Transfer Ride starting at " +
    req.body.data.scheduledDate +
    ", " +
    req.body.data.scheduledTime +
    " from " +
    req.body.data.source +
    destination;
  doc
    .font("Helvetica")
    .text("1", 70, invoiceTableTop + 90)
    .text("1", 95, invoiceTableTop + 90)
    .text(onewayTrip, 125, invoiceTableTop + 90, { align: "left" })
    .text(
      "$" + parseInt(req.body.data.totalAmount),
      300,
      invoiceTableTop + 90,
      { align: "right" }
    );
  generateHr(doc, invoiceTableTop + 180);
  const BaseRatePosition = invoiceTableTop + 200;

  const discountPrice = req.body.data.discount
    ? parseInt(req.body.data.discount)
    : 0;

  generateTableRow(
    doc,
    BaseRatePosition,
    "",
    "",
    "Sub Total",
    "",
    `$ ${parseInt(req.body.data?.totalAmount) - discountPrice}`
  );

  const primeTimePosition = BaseRatePosition + 20;
  generateTableRow(
    doc,
    primeTimePosition,
    "",
    "",
    "Discount",
    "",
    discountPrice
  );

  const duePosition = primeTimePosition + 25;
  doc.font("Helvetica-Bold");
  generateTableRow(
    doc,
    duePosition,
    "",
    "",
    "Grand Total",
    "",
    `$ ${req.body.data.totalAmount}`
  );
  doc.font("Helvetica");
  doc.moveDown(1);
  doc.text("Best regards,", 50);
  doc.moveDown();
  doc.text("Saywa Team", 50);
  doc.moveDown(2);
  doc.font("Helvetica-Bold");
  doc.text("Terms and Conditions");
  doc.font("Helvetica");
  doc.moveDown();
  doc.text(
    "If weather/road conditions become harsh and hazardous. An extra surcharge will be billed to the client depending on the extent of conditions.For airport pickups, we provide an hour standby.",
    50
  );
  doc.moveDown(1);
  doc.text(
    "For regular reservations, a 30 minute standby is provided, afterwards standby will be charged. $95 for Sedan. $115 for SUV. Cancellations made within 3 hours of the reservation are charged full fare. No shows is the same concept with no refund. The driver has the right to decline a reservation if the client hasn't shown up for 1 hour since the scheduled pickup time. Changes made within 3 hours of the reservation will be charged as standby. By paying this invoice, the client agrees to these terms and conditions.",
    50
  );

  doc.end();

  const fileName = "invoice.pdf";
  const file = fs.createReadStream(filePath);

  setTimeout(() => {
    // runs after 2 seconds
    res.setHeader("Content-Disposition", `attachment; filename=${fileName}`);
    file.pipe(res);
    // fs.unlink(__dirname + "/invoice.pdf", (err) => {
    //   if (err) {
    //     console.error("Error deleting invoice.pdf:", err);
    //   } else {
    //     console.log("Invoice.pdf deleted successfully.");
    //   }
    // });
  }, 2000);
};

module.exports = {
  newTripPayment,
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
  tripCount,
  update_driver_state,
  getClientData,
  filteredTripData,
  updateTripStatus,
  newAdminTrip,
  lastFiveTrips,
  totalTripCount,
  updateStatus,
  sendPaymentLink,
  updatePaymentInfo,
  downloadInvoice,
  newUnAssignedTripsForAdminCard,
};
