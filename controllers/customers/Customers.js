const asyncHandler = require("express-async-handler");
const Customers = require("../../models/Customers");
const nodemailer = require("nodemailer");
const stripe = require("stripe")(process.env.STRIPE_KEY);

const signUpWithEmail = asyncHandler(async (req, res) => {
  const customer = await stripe.customers.create({
    name: req.body.fullName,
    email: req.body.email,
    phone: req.body.contactNumber,
  });

  const new_customer = new Customers({
    user_id: req.body.uid,
    stripeId: customer.id,
    fullName: req.body.fullName,
    email: req.body.email,
    contact_no: req.body.contactNumber,
  });
  try {
    await new_customer
      .save()
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

const adminSignUpWithEmail = asyncHandler(async (req, res) => {
  const customer = await stripe.customers.create({
    name: req.body.fullName,
    email: req.body.email,
    phone: req.body.contactNumber,
  });

  const new_customer = new Customers({
    user_id: req.body.uid,
    stripeId: customer.id,
    fullName: req.body.fullName,
    email: req.body.email,
    contact_no: req.body.contactNumber,
  });
  try {
    await new_customer
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

        const mailOptions = {
          from: `"Saywa" <${process.env.CONTACT_EMAIL}>`,
          to: req.body.email,
          subject: "Saywa Limo Account Creation",
          html: `<p>Dear ${req.body.fullName},</p>
          <p>Your account has been successfully created. Welcome to Saywa Limo! We are excited to have you on board.</p>
          <p>Please note your default login credentials</p>
          <table>
          <tr>
          <th>Email </td>
          <td>: ${req.body.email}</td>
          </tr>
          <tr>
          <th>Password</td>
          <td>: ${req.body.password}</td>
          </tr>
          <table> 
          <p>Thank you for choosing Saywa Limo. If you have any questions or need assistance, feel free to contact our support team at <a href="mailto:${process.env.CONTACT_EMAIL}">${process.env.CONTACT_EMAIL}</a>.</p>
          <p>Best regards,<br>Saywa Limo</p>`,
        };
        // Send email
        transporter.sendMail(mailOptions);
        return res.status(200).json({
          data: response,
        });
      })
      .catch((err) => {
        console.log(err);
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

const signUpWithGoogle = asyncHandler(async (req, res) => {
  const matchQuery = {
    email: req.body.email,
  };

  try {
    const checkExists = await Customers.find(matchQuery);
    console.log(checkExists);
    if (checkExists.length === 0) {
      const customer = await stripe.customers.create({
        name: req.body.fullName,
        email: req.body.email,
        phone: req.body.phoneNumber,
      });

      const new_customer = new Customers({
        user_id: req.body.uid,
        stripeId: customer.id,
        fullName: req.body.fullName,
        email: req.body.email,
        contact_no: req.body.phoneNumber,
        userImage: req.body.userImage,
      });
      const data = await new_customer.save();
    }
    const userData = await Customers.find(matchQuery);

    return res.status(200).json(userData);
  } catch (error) {
    return res.status(400).json({
      message: error,
    });
  }
});

const checkExistonDB = asyncHandler(async (req, res) => {
  const query = { email: req.body.email };
  try {
    const checkExist = await Customers.findOne(query);
    if (checkExist) {
      return res.status(200).json("Exist");
    } else {
      return res.status(200).json("NotExist");
    }
  } catch (error) {
    return res.status(500).json({ message: "internal Server Error" });
  }
});

const updateUserPhone = asyncHandler(async (req, res) => {
  const query = {
    user_id: req.body.uid,
  };
  const data = {
    $set: {
      contact_no: req.body.phone,
    },
  };

  const getStripeID = await Customers.find(query);

  await stripe.customers.update(getStripeID[0].stripeId, {
    phone: req.body.phone,
    metadata: {
      key: "updated_value",
    },
  });

  await Customers.updateOne(query, data);
  Customers.find(query).then((result) => {
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
      subject: "Saywa Limo Contact Number reset",
      html: `<div style="padding: 20px;">
    <p style="text-align: left;">Dear user,</p>
    <p style="text-align: left;">We hope this message finds you well. Thank you for choosing Saywa Limo for your upcoming trip. We are delighted to inform you that the your contact number has been updated.</p>
    <p>Updatd Contact NUmber : ${req.body.phon}</p>
    <p>Should you have any specific requirements or if there are changes to your travel plans, please feel free to contact our customer support at [Customer Support Email/Phone].</p>
    <p>Your satisfaction and safety are our top priorities, and we assure you that our driver will provide you with a comfortable and secure journey.</p>
    <p>Thank you for choosing Saywa Limo. We look forward to serving you and ensuring a seamless travel experience.</p>
    <p>Best regards,</br>Saywa Limo Support Team</p>
  </div>`,
    };

    //   Send Action
    transporter.sendMail(mailOptions);
    return res.status(200).json({
      data: result,
    });
  });
});
const newSignature = asyncHandler(async (req, res) => {
  const query = {
    user_id: req.body.customer_id,
  };
  const data = {
    signature: req.body.signature,
    documentStatus: "",
  };
  await Customers.findOneAndUpdate(query, data);
  Customers.find(query).then((result) => {
    return res.status(200).json({
      data: result,
    });
  });
});
const findCustomer = asyncHandler(async (req, res) => {
  const query = {
    user_id: req.body.customer_id,
  };

  Customers.find(query).then((result) => {
    return res.status(200).json(result);
  });
});

const updateCustomer = async (req, res) => {
  try {
    const query = {
      _id: req.body.id,
    };

    const update = {
      $set: {
        fullName: req.body.name,
        email: req.body.email,
        contact_no: req.body.contactNo,
      },
    };

    // const getStripeID = await Customers.find(query);

    // await stripe.customers.update(getStripeID[0].stripeId, {
    //   phone: req.body.contactNo,
    //   metadata: {
    //     key: "updated_value",
    //   },
    // });

    const result = await Customers.updateOne(query, update);

    if (result.modifiedCount === 0) {
      return res.status(404).json({ message: "Customer not found" });
    }
    const updatedData = await Customers.find();

    return res
      .status(200)
      .json({ message: "Customer updated successfully", data: updatedData });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const updateCustomerModal = async (req, res) => {
  try {
    const query = {
      user_id: req.body.cid,
    };

    const update = {
      $set: {
        fullName: req.body.name,
        email: req.body.email,
        contact_no: req.body.contactNo,
        addressLine1: req.body.addressLine1,
        addressLine2: req.body.addressLine2,
        addressLine3: req.body.addressLine3,
        zipCode: req.body.zipCode,
      },
    };

    const result = await Customers.updateOne(query, update);

    if (result.modifiedCount === 0) {
      return res.status(404).json({ message: "Customer not found" });
    }

    return res.status(200).json({ message: "Customer updated successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
};

const adminCustomerList = asyncHandler(async (req, res) => {
  const pageNumber = req.body.page;
  const pageSize = req.body.per_page;
  const skip = (pageNumber - 1) * pageSize;

  const regex = new RegExp(req.body.searchKey, "i");

  if (req.body.searchKey == undefined || req.body.searchKey == "") {
    const total = await Customers.find({ customerStatus: "active" });
    await Customers.find({ customerStatus: "active" })
      .skip(skip)
      .limit(pageSize)
      .then((response) => {
        return res.status(200).json({
          data: response,
          total: total.length,
        });
      });
  } else {
    const total = await Customers.find({
      $or: [{ fullName: regex }, { contact_no: regex }],
    });
    await Customers.find({
      $or: [{ fullName: regex }, { contact_no: regex }],
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

const liveSearch = asyncHandler(async (req, res) => {
  const regex = new RegExp(req.body.searchKey, "i");

  await Customers.find({
    $or: [{ fullName: regex }, { contact_no: regex }],
  }).then((response) => {
    return res.status(200).json(response);
  });
});

const liveCustomersCount = asyncHandler(async (req, res) => {
  const count = await Customers.find();
  return res.status(200).json({ count: count.length });
});

const deleteUser = async (req, res) => {
  try {
    const query = {
      _id: req.body.id,
    };
    const data = {
      customerStatus: "inactive",
    };
    await Customers.updateOne(query, data);
    return res.status(200).json([]);
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
};

const walletBalance = async (req, res) => {
  try {
    const { cust_id } = req.body;
    const result = await Customers.find({ user_id: cust_id });

    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
};
module.exports = {
  signUpWithEmail,
  signUpWithGoogle,
  updateUserPhone,
  newSignature,
  findCustomer,
  updateCustomer,
  adminCustomerList,
  liveSearch,
  liveCustomersCount,
  updateCustomerModal,
  checkExistonDB,
  adminSignUpWithEmail,
  deleteUser,
  walletBalance,
};
