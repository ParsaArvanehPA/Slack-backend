const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const express = require("express");
const config = require("config");
const mysql = require("mysql");
const {
  userInfoFormatValidation,
  userInfoTableData,
} = require("../models/user.model");
const {
  createAccessToken,
  createRefreshToken,
  sendAccessToken,
  sendRefreshToken,
  createInviteCode,
} = require("../middleware/tokens");
const { isAuth } = require("../middleware/auth");
const { Router } = require("express");
const { reach } = require("joi");

const fs = require("fs");
const { Console } = require("console");

const router = express.Router();

const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "password",
  database: "slack",
});

connection.connect((err) => {
  if (err) {
    console.error(err);
    return;
  }
  console.log("successfuly connected to DB");
});

/////////////////////TEMP,DELETE LATER////////////////////////
router.post("/upload", (req, res) => {
  console.log(req.file);
  // if (req.files === null) {
  //   return res.status(400).send({ error: "no file uploaded" });
  // }
  // const file = req.files.file;
  // file.mv(`./public/usersProfileImage/${file.name}`, (err) => {
  //   if (err) {
  //     console.log(err);
  //     return res.status(500).send({ error: err });
  //   }
  //   return res.send({ fileName: file.name, filePath: `/uploads/${file.name}` });
  // });
});

// router.get("/getFile", (req, res) => {
//   var bitmap = fs.readFileSync("public/usersProfileImage/3.jpg", { root: "." });
//   // var tmp = bitmap.toString().replace(/[“”‘’]/g, "");
//   var img = new Buffer(bitmap).toString("base64");
//   console.log(img.substring(0, 20));
//   // return res.sendFile("public/usersProfileImage/3.jpg", { root: "." });
//   return res.send({ img });
// });
/////////////////////TEMP,DELETE LATER////////////////////////

router.post("/signUp", async (req, res, next) => {
  console.log(req.body);
  //validating the format of inputs

  const { error } = userInfoFormatValidation(req.body);
  if (error) {
    return res.send({ error });
  }
  //checking for duplicate username
  connection.query("SELECT * FROM userInfo", (err, row) => {
    console.log(row);
    if (err) {
      console.log(err);
      return;
    }
    for (var counter in row) {
      if (
        row[counter].userInfo_userName.toLowerCase() ===
        req.body.userName.toLowerCase()
      ) {
        return res.status(400).send({ error: "duplicate user name" });
      }
    }

    //inserting new row to userInfo table
    var insertedRowNumber = 0;
    ///
    connection.query(
      `INSERT INTO userInfo (userInfo_username, userInfo_firstName, userInfo_lastName, userInfo_email, userInfo_major, userInfo_password, userInfo_imageDir, userInfo_dateCreated) VALUES ('${req.body.userName}', '${req.body.firstName}',
      '${req.body.lastName}','${req.body.email}','${req.body.major}','${req.body.password}', 'rowNumber.png', Now())`,
      (err, results) => {
        console.log(
          ">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>"
        );
        // console.log("results", results.insertId);
        insertedRowNumber = results.insertId;

        if (err) {
          console.log(err);
          return;
        }

        if (req.body.imageDir !== "not available") {
          let base64Image = req.body.imageDir.split(";base64,").pop();
          fs.writeFile(
            `./public/users-profile-image/${req.body.userName}.png`,
            base64Image,
            { encoding: "base64" },
            function (err) {
              console.log("File created");
            }
          );
        }

        return res.send({ message: "successfully added username info!" });
      }
    );
  });
});

router.post("/login", async (req, res) => {
  const { userName, password } = req.body;
  console.log("<<<<<<<<<<<<<<<>>>>>>>>>>>>>>>>>>>>>", userName, password);
  try {
    connection.query("SELECT * FROM userInfo", (err, row) => {
      if (err) {
        return res.send(err);
      }

      var currentUser = "";
      for (var counter in row) {
        if (
          row[counter].userInfo_userName.toLowerCase() ===
          userName.toLowerCase()
        ) {
          currentUser = row[counter];
          break;
        }
      }
      if (currentUser == "") {
        // return res.send("no such user name exists");
        return res.send({ error: "Incorrect Username" });
      }
      // console.log(currentUser);

      // const passwordValidation = bcrypt.compare(
      //   password,
      //   currentUser.password
      // );

      // console.log("1111111111111 ", currentUser.userInfo_password);
      // console.log("2222222222222 ", password);
      const passwordValidation = password === currentUser.userInfo_password;

      if (!passwordValidation) {
        return res.send({ error: "Incorrect password" });
      }
      console.log("++++++++++++++++++++++++, ", currentUser);
      const accessToken = createAccessToken(currentUser.userInfo_id);
      const refreshToken = createRefreshToken(currentUser.userInfo_id);

      sendRefreshToken(res, refreshToken);
      sendAccessToken(req, res, accessToken);
      console.log(currentUser);

      connection.query(
        `UPDATE userInfo SET userInfo_refreshToken = '${refreshToken}' WHERE userInfo_id = ${currentUser.userInfo_id}`
      );
    });
  } catch {
    return res.send(err);
  }
});

router.post("/logout", (req, res) => {
  try {
    res.clearCookie("refreshtoken", {});
    console.log("After: ", req.cookies.refreshtoken);
    return res.send("logged out");
  } catch (err) {
    return res.send(err);
  }
});

router.post("/protected", async (req, res) => {
  try {
    const userId = isAuth(req);
    if (userId !== null) {
      res.send({
        data: "This is protected data.",
      });
    }
  } catch (err) {
    return res.send(err);
  }
});

router.post("/refresh_token", async (req, res) => {
  const token = req.cookies.refreshtoken;
  console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>", token);
  if (!token) {
    // console.log(req.cookies);
    return res.send({ accessToken: "" });
  }
  //////////////////////
  // let payLoad = token.split(".")[1];
  // let buff = new Buffer(payLoad, "base64");
  // let text = buff.toString("ascii");
  // console.log("===============================", text);
  /////////////////////
  var payload = null;
  try {
    payload = jwt.verify(token, config.get("REFRESH_TOKEN_SECRET"));
  } catch (err) {
    console.log("HERE1");
    return res.send({ accessToken: "" });
  }
  console.log("payload", payload);
  var currentUser = "";
  const tokenUserID = payload.userId;
  console.log("tokenUserID", tokenUserID);
  connection.query("SELECT * FROM userInfo", (err, row) => {
    if (err) {
      console.error(err);
    }
    for (var counter in row) {
      if (row[counter].userInfo_id === tokenUserID) {
        // console.log("XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX", row[counter]);
        currentUser = row[counter];
        break;
      }
    }

    // console.log("now Here 2");
    if (!currentUser) {
      return res.send({ accessToken: "" });
    }
    console.log("CURRENT USER: ", currentUser);
    console.log("DB_REFRESH_TOKEN : ", currentUser.userinfo_refreshToken);
    console.log("COOKIE_REFRESH_TOKEN : ", token);
    if (currentUser.userinfo_refreshToken !== token) {
      return res.send({ accessToken: "" });
    }

    const accessToken = createAccessToken(currentUser.userInfo_id);
    const refreshToken = createRefreshToken(currentUser.userInfo_id);
    connection.query(
      `UPDATE userInfo SET userInfo_refreshToken = '${refreshToken}' WHERE userInfo_id = ${currentUser.userInfo_id}`
    );
    sendRefreshToken(res, refreshToken);
    // console.log(
    //   "/////////////////////////////////////////////////",
    //   accessToken,
    //   currentUser.userInfo_userName
    // );
    return res.send({
      accessToken: accessToken,
      userName: currentUser.userInfo_userName,
    });
  });
});

router.post("/createNewProject", async (req, res) => {
  const { userName, description, projectName, isPublic } = req.body;
  // console.log(
  //   " userName, description, projectName, isPublic",
  //   userName,
  //   description,
  //   projectName,
  //   isPublic
  // );

  connection.query(`SELECT * FROM projectInfo`, (err, row) => {
    if (err) {
      return res.send(err);
    }

    for (var counter in row) {
      if (
        row[counter].projectInfo_name.toLowerCase() ===
        projectName.toLowerCase()
      ) {
        return res.send({ error: "Duplicate Project Name!" });
      }
    }

    connection.query(
      `INSERT INTO projectInfo ( projectInfo_name, projectInfo_image, projectInfo_description, projectInfo_creatorName, projectInfo_dateCreated, projectInfo_isPublic )
     VALUES ( '${projectName}','asdasd', '${description}','${userName}',NOW(), ${isPublic} )`,
      (err, row) => {
        if (err) {
          return res.send({ error: err });
        }
        console.log(
          "<<<<<<<<<<<<<<<<SUSSESSFULY CREATED NEW PROJECT>>>>>>>>>>>>>>>"
        );
        connection.query(
          `INSERT INTO projectMember ( projectMember_projectName, projectMember_userName, projectMember_joindeDate )
        VALUES ('${projectName}', '${userName}', NOW())`,
          (err, row) => {
            if (err) {
              return res.send({ error: err });
            }
            return res.send({ result: "Created new Project" });
          }
        );
      }
    );
  });
});

router.post("/createNewChannel", async (req, res) => {
  const { projectName, channelName, description, isPublic } = req.body;
  connection.query(
    `SELECT * FROM groupinfo WHERE groupInfo_projectName = '${projectName}'`,
    (err, result) => {
      for (var rowNumber in result) {
        if (
          result[rowNumber].groupInfo_name.toLowerCase() ===
          channelName.toLowerCase()
        ) {
          return res.send({ error: "This channel Already Exists." });
        }
      }
      connection.query(
        `INSERT INTO groupinfo (groupInfo_projectName, groupInfo_name, groupInfo_description, groupInfo_dateCreated , isPublic) VALUES
        ('${projectName}', '${channelName}', '${description}', NOW(), ${isPublic})`,
        (err, result) => {
          if (err) {
            return res.send({ error: err });
          }
          return res.send({ result: "Successfuly Added new Channel." });
        }
      );
    }
  );
});

router.get("/testing/users", async (req, res) => {
  res.setHeader("x-content-type-options", "nosniff");
  res.setHeader("x-powered-by", "Express");
  res.setHeader("x-ratelimit-limit", 1000);
  res.setHeader("x-ratelimit-remaining", 999);
  res.setHeader("x-ratelimit-reset", 1597003719);

  const array = [];
  let count = 0;
  connection.query(`SELECT * FROM userinfo`, (err, result) => {
    if (err) {
      return console.log(err);
    }
    for (var rowCounter in result) {
      count++;
      array.push({
        id: rowCounter,
        data: JSON.parse(JSON.stringify(result[rowCounter])),
      });
    }
    console.log(
      ">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>"
    );
    // console.log(array);
    // console.log(JSON.parse(JSON.stringify(result)));
    console.log(
      "<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<"
    );

    res.header("Access-Control-Expose-Headers", "X-Total-Count");
    res.setHeader("X-Total-Count", count);
    return res.send(array);
  });
});

router.post("/joinExistingProject", async (req, res) => {
  const { userName, projectName, inviteCode } = req.body;

  console.log(
    "userName, projectName, inviteCode",
    userName,
    projectName,
    inviteCode
  );

  let doesExist = false;
  if (inviteCode) {
    try {
      let payload = jwt.verify(inviteCode, config.get("INVITE_TOKEN_SECRET"));
      console.log(payload.projectName);
      connection.query("SELECT * FROM projectinfo ", (err, result) => {
        if (err) {
          return console.log(err);
        }
        for (var rowNumber in result) {
          if (
            result[rowNumber].projectInfo_name.toLowerCase() ===
            payload.projectName.toLowerCase()
          ) {
            doesExist = true;
            break;
          }
        }
        if (!doesExist) {
          return res.send({ error: "wrong project name!" });
        }
        connection.query(
          `INSERT INTO projectmember (projectMember_projectName, projectMember_userName, projectMember_joindeDate )
         VALUES ('${payload.projectName}', '${userName}', NOW() )`,
          (err, result) => {
            if (err) {
              return console.log(err);
            }
            return res.send({
              result:
                "Joined a new project! Login to your account to get started.",
            });
          }
        );
      });
    } catch {
      return res.send({ error: "Invalid invite code." });
    }
  } else {
    connection.query("SELECT * FROM projectinfo ", (err, result) => {
      if (err) {
        return console.log(err);
      }
      for (var rowNumber in result) {
        if (
          result[rowNumber].projectInfo_name.toLowerCase() ===
          projectName.toLowerCase()
        ) {
          doesExist = true;
          if (!result[rowNumber].projectInfo_isPublic) {
            return res.send({
              error:
                "Project is private.It can only be accessed by invite code.",
            });
          }
          break;
        }
      }
      if (!doesExist) {
        return res.send({ error: "wrong project name!" });
      }
      connection.query(
        `INSERT INTO projectmember (projectMember_projectName, projectMember_userName, projectMember_joindeDate )
       VALUES ('${projectName}', '${userName}', NOW() )`,
        (err, result) => {
          if (err) {
            return console.log(err);
          }
          return res.send({ result: "Joined a new project!" });
        }
      );
    });
  }

  // const { userName, projectName, inviteCode } = req.body;
  // console.log(
  //   "userName, projectName, inviteCode",
  //   userName,
  //   projectName,
  //   inviteCode
  // );

  // if (projectName != "") {
  //   connection.query(`SELECT * FROM projectinfo`, (err, row) => {
  //     if (err) {
  //       return res.send({ error: err });
  //     }
  //     var currentProject = "";
  //     for (var counter in row) {
  //       console.log("HERE1");
  //       if (
  //         row[counter].projectInfo_name.toLowerCase() ==
  //         projectName.toLowerCase()
  //       ) {
  //         console.log("HERE5");
  //         currentProject = row[counter];
  //         console.log("currentProject", currentProject);
  //         break;
  //       }
  //     }
  //     if (currentProject == "") {
  //       console.log("HERE2");
  //       return res.send({ error: "No such Project exists." });
  //     }
  //     connection.query(
  //       `INSERT INTO projectMember ( projectMember_projectName, projectMember_userName, projectMember_joindeDate )
  //       VALUES ('${projectName}', '${userName}', NOW())`,
  //       (err, result) => {
  //         console.log("HERE3");
  //         if (err) {
  //           return res.send({ error: err });
  //         }
  //         return res.send({ result: `joined project ${projectName}` });
  //       }
  //     );
  //   });
  // } else {
  //   // console.log(createInviteCode(inviteCode));
  //   try {
  // let payLoad = inviteCode;
  // let buff = new Buffer(payLoad, "base64");
  // let text = JSON.parse(buff.toString("ascii"));

  //     const projectName = text.projectName;
  //     console.log("projectName", projectName);
  //     connection.query(
  //       `SELECT * FROM projectinfo WHERE projectInfo_name = ''`,
  //       (err, row) => {
  //         console.log(row);
  //         connection.query(
  //           `INSERT INTO projectmember (projectMember_projectName, projectMember_userName, projectMember_joindeDate)
  //         VALUES( '${projectName}', '${userName}', NOW() )`,
  //           (err, result) => {
  //             if (err) {
  //               return res.send({ error: err });
  //             }
  //             return res.send({ result: `joined project ${projectName}` });
  //           }
  //         );
  //       }
  //     );
  //   } catch {
  //     return res.send({ error: "INVALID INVITE CODE" });
  //   }
  // }
});

module.exports = router;
