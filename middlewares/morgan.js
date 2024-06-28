const express = require("express");
const app = express();
const morgan = require("morgan");
const chalk = require("chalk");

const morganConfiguration = (req, res) => {
  morgan.token("param", function (req, res, param) {
    return req.params[param];
  });
  morgan.token("host", function (req, res) {
    return req.hostname;
  });

  return morgan((tokens, req, res) => {
    return [
      chalk.green(tokens.method(req, res)),
      chalk.blue(tokens.url(req, res)),
      chalk.yellow(tokens.status(req, res)),
      chalk.cyan(tokens["response-time"](req, res)),
      "ms",
    ].join(" ");
  });
};

module.exports = morganConfiguration;
