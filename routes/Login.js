const express = require("express");
const router = express.Router();
const { createAdmin, loginAction } = require("../controllers/auth/auth");

router.post("/create_admin_user", createAdmin);
router.post("/login", loginAction);

module.exports = router;
