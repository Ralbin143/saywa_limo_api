const express = require("express");
const router = express.Router();
const Auth = require("../middlewares/Auth");
const { body, validationResult } = require("express-validator");
const Users = require("../models/Users");
const bcrypt = require("bcrypt");

// Define the validation rules
const validateUserName = body("userName")
  .notEmpty()
  .withMessage("User name required.")
  .matches(/^[a-zA-Z0-9\s.]*$/)
  .withMessage("Invalid user name name.");
const validateFirstName = body("firstName")
  .notEmpty()
  .withMessage("First name is required.")
  .matches(/^[a-zA-Z0-9\s.]*$/)
  .withMessage("Invalid First name.");
const validateLastName = body("lastName")
  .notEmpty()
  .withMessage("Last name is required.")
  .matches(/^[a-zA-Z0-9\s.]*$/)
  .withMessage("Invalid Last name.");
const validateCountryCode = body("countryCode")
  .notEmpty()
  .withMessage("Country Code is required.")
  .matches(/^[0-9+]+$/)
  .withMessage("Invalid Country Code.");
const validateContactNumber = body("contactNumber")
  .notEmpty()
  .withMessage("Contact number is required")
  .matches(/^[0-9]+$/)
  .withMessage("Invalid Contact Number");
const validateEmail = body("email")
  .matches(/^\S+@\S+\.\S+$/)
  .withMessage("Invalid Email");
const validateAddress = body("address")
  .matches(/^[a-zA-Z0-9\s.,]*$/)
  .withMessage("Invalid Address.");
const validateGender = body("gender")
  .matches(/^[a-zA-Z]+$/)
  .withMessage("Invalid Gender");
const validateDesignation = body("designation")
  .matches(/^[a-zA-Z0-9\s.]*$/)
  .withMessage("Invalid First name.");

router.post(
  "/add_user",
  [
    validateUserName,
    validateFirstName,
    validateLastName,
    validateCountryCode,
    validateContactNumber,
    validateEmail,
    validateAddress,
    validateGender,
    validateDesignation,
    // Auth,
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const tempPassowrd = req.body.userPassword;
    const salt = await bcrypt.genSalt(16);
    const hashed_password = await bcrypt.hash(tempPassowrd, salt);

    const userData = new Users({
      userName: req.body.userName,
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      countryCode: req.body.countryCode,
      contactNumber: req.body.contactNumber,
      emailId: req.body.email,
      address: req.body.address,
      gender: req.body.gender,
      designation: req.body.designation,
      status: "Live",
      password: hashed_password,
    });

    try {
      userData.save().then((response) => {
        return res.status(200).json({
          data: response,
        });
      });
    } catch (error) {
      return res.status(200).json({
        data: "SSSSS",
      });
    }
  }
);

router.post("/check_user_name", [Auth], async (req, res) => {
  const query = {
    userName: req.body.searchKey,
  };
  const unamecheck = await Users.find(query);
  if (unamecheck.length !== 0) {
    return res.status(200).json({
      data: "NotAvailable",
      message: "User Name unavailable",
    });
  } else if (req.body.searchKey === "" || req.body.searchKey === undefined) {
    return res.status(200).json({
      data: "NotAvailable",
      message: "User Name cannot be empty",
    });
  } else {
    return res.status(200).json({
      data: "Available",
      message: "User Name available",
    });
  }
});

router.post("/all_users", [Auth], async (req, res) => {
  const pageNumber = req.body.page; // the current page number
  const pageSize = req.body.per_page; // the number of items per page
  const skip = (pageNumber - 1) * pageSize;
  // searchQuery={
  //     firstName: { $regex: req.body.searchKey, $options: 'i' }
  // }
  const regex = new RegExp(req.body.searchKey, "i");

  if (req.body.searchKey == undefined || req.body.searchKey == "") {
    const total = await Users.find();
    await Users.find()
      .skip(skip)
      .limit(pageSize)
      .then((response) => {
        return res.status(200).json({
          data: response,
          total: total.length,
        });
      });
  } else {
    const total = await Users.find({
      $or: [{ firstName: regex }, { lastName: regex }],
    });
    await Users.find({
      $or: [
        { firstName: regex },
        { lastName: regex },
        { contactNumber: regex },
        { userName: regex },
      ],
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

router.post("/toggle_status", [Auth], async (req, res) => {
  const query = {
    _id: req.body.id,
  };
  await Users.updateOne(query, { $set: { status: req.body.status } });
});

router.post("/get_single_user", [Auth], async (req, res) => {
  const query = {
    _id: req.body.id,
  };
  await Users.find(query).then((response) => {
    return res.status(200).json({
      data: response,
    });
  });
});

router.post("/update_user", [Auth], async (req, res) => {
  const filter = {
    _id: req.body.id,
  };
  const update = {
    $set: {
      userName: req.body.userName,
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      countryCode: req.body.countryCode,
      contactNumber: req.body.contactNumber,
      emailId: req.body.email,
      address: req.body.address,
      gender: req.body.gender,
      designation: req.body.designation,
      // status: 'Live',
      password: req.body.password,
    },
  };

  await Users.updateOne(filter, update).then((response) => {
    return res.status(200).json({
      data: response,
    });
  });
});

router.get("/users_list", async (req, res) => {
  const query = {
    designation: "Driver",
  };
  try {
    await Users.find(query)
      .then((response) => {
        return res.status(200).json({
          data: response,
        });
      })
      .catch((err) => {
        return res.status(400).json({
          message: err,
        });
      });
  } catch (error) {
    return res.status(400).json({
      message: error,
    });
  }
});

module.exports = router;
