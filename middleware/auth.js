const jwt = require("jsonwebtoken");
const config = require("config");

const isAuth = (req) => {
  const authorization = req.headers["authorization"];
  if (!authorization) throw new Error("you need to login.");
  console.log(authorization);
  const token = authorization.split(" ")[1];
  const { userId } = jwt.verify(token, config.get("ACCESS_TOKEN_SECRET"));
  return userId;
};

module.exports = {
  isAuth,
};
