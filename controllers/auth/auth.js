const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { validationResult } = require("express-validator");
const USERS = require("../../models/Users");

// -------------------------[DELETE THIS ON PRODUCTION]-------------------------
const createAdmin = async (req, res) => {
  const password = "123@admin";
  const salt = await bcrypt.genSalt(8);
  const hashed_password = await bcrypt.hash(password, salt);
  const createAdminUser = new USERS({
    userName: "Admin",
    firstName: "Admin",
    lastName: "Admin",
    countryCode: "+91",
    contactNumber: "9999999999",
    emailId: "-",
    address: "-",
    gender: "-",
    designation: "Admin",
    password: hashed_password,
  });
  try {
    createAdminUser.save().then((response) => {
      return res.status(200).json({
        data: response,
      });
    });
  } catch (error) {
    return res.status(200).json({
      message: error,
    });
  }
};

const loginAction = async (req, res) => {
  console.log(req.body.userId);
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }
  try {
    await USERS.findOne({
      userName: req.body.userId,
    })
      .then((response) => {
        console.log(response);
        const password_validity = bcrypt.compareSync(
          req.body.password,
          response.password
        );
        const new_token = jwt.sign(
          {
            id: response.password,
          },
          "jwtPrivateKey",
          { expiresIn: "60m" }
        );
        if (!password_validity) {
          return res.status(401).json({
            token: null,
            message: "Invalid Password",
          });
        } else {
          if (response.status === "Live") {
            return res.status(200).json({
              token: new_token,
              message: "Login Success",
              data: response,
            });
          } else {
            return res.status(200).json({
              token: new_token,
              message: "Suspended",
              data: response,
            });
          }
        }
      })
      .catch((err) => {
        console.log(err);
        return res.status(500).json({ message: err });
      });
  } catch (error) {
    console.log(error);
    return res.status(400).json({
      message: error,
    });
  }
};

module.exports = {
  createAdmin,
  loginAction,
};
