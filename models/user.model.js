const config = require("config");
const jwt = require("jsonwebtoken");
const Joi = require("joi");
const mysql = require("mysql");
const { dBconnection } = require("../index");

validateUser = (userInfo) => {
  const schema = {
    userName: Joi.string().min(3).max(50).required(),
    firstName: Joi.string().min(3).max(50).required(),
    lastName: Joi.string().min(3).max(50).required(),
    email: Joi.string().min(5).max(255).required().email(),
    major: Joi.string().min(2).max(255).required(),
    password: Joi.string().min(5).max(255).required(),
    imageDir: Joi.string().min(0).max(50000000),
  };

  return Joi.validate(userInfo, schema);
};

selectDataUserInfoTable = () => {
  return "asdasd";
  //   const a = connection.query("SELECT * FROM userInfo", (_req, res, err) => {
  //     if (err) {
  //       console.log(err);
  //       return;
  //     }
  //     return res.json({
  //       data: res,
  //     });
  //   });
};

exports.userInfoFormatValidation = validateUser;
exports.userInfoTableData = selectDataUserInfoTable;
