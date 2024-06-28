const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  const token = req.header("x-auth-token");

  try {
    jwt.verify(token, "jwtPrivateKey");
  } catch (error) {
    return res.status(401).send({
      ok: false,
      error: "Token expired",
    });
  }

  next();
};
