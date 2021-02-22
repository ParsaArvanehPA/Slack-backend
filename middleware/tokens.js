const jwt = require("jsonwebtoken");
const config = require("config");

const createAccessToken = (userId) => {
  console.log("createAccessToken -> userId", userId);
  return jwt.sign({ userId }, config.get("ACCESS_TOKEN_SECRET"), {
    expiresIn: "15m",
  });
};

const createRefreshToken = (userId) => {
  return jwt.sign({ userId }, config.get("REFRESH_TOKEN_SECRET"), {
    expiresIn: "7d",
  });
};

const sendAccessToken = (req, res, accessToken) => {
  res.send({
    accessToken,
    userName: req.body.userName,
  });
};

// const sendRefreshToken = (res, refreshToken) => {
//   res.cookie("refreshtoken", refreshToken, {
//     httpOnly: true,
//     path: "/refresh_token",
//   });
// };

const sendRefreshToken = (res, refreshToken) => {
  res.cookie("refreshtoken", refreshToken, {
    maxAge: 60 * 60 * 24 * 7 * 1000,
  });
};

const createInviteCode = (projectName) => {
  console.log("createInviteCode -> projectName", projectName);
  return jwt.sign({ projectName }, config.get("INVITE_TOKEN_SECRET"), {
    expiresIn: "7d",
  });
};

module.exports = {
  createAccessToken,
  createRefreshToken,
  sendAccessToken,
  sendRefreshToken,
  createInviteCode,
};
