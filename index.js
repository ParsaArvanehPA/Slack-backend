const config = require("config");
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const fileUpload = require("express-fileupload");

const socketio = require("socket.io");
const http = require("http");
const app = express();
const server = http.createServer(app);
const io = socketio(server);
const router = require("./routes/socket");
const usersRoute = require("./routes/users.route");
const mailSendingConfig = require("./routes/mailConfig.route");
const {
  getMessages,
  saveMessage,
  roomsListGetter,
  deleteMessage,
  projectListGetter,
  userInfoGetter,
  sameUsersInProjectGetter,
  profileImageGetter,
} = require("./middleware/socketHelperFunctions");
const { use } = require("./routes/socket");

/////////
const exphb = require("express-handlebars");
const bodyParser = require("body-parser");
app.engine("handlebars", exphb());
app.set("view engine", "handlebars");
/////////

if (!config.get("myprivatekey")) {
  console.error("FATAL ERROR: privatekey is not defiened.");
  process.exit(1);
}
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);

app.use(express.json({ limit: "50mb" }));

app.use(
  bodyParser.urlencoded({
    limit: "50mb",
    extended: true,
    parameterLimit: 50000,
  })
);

app.use(cookieParser());
app.use(fileUpload());
app.use("/userAuth", usersRoute);
app.use("/sendMail", mailSendingConfig);

const port = config.get("PORT");
app.listen(port, () => {
  console.log(`listening on port ${port}...`);
});

io.on("connection", (socket) => {
  // console.log("socket", socket.id);

  console.log("we have a new connection.");

  // socket.on("join", ({ roomName }) => {
  //   console.log(">>>>>>>>>>>>>>", roomName);
  // });

  socket.on("userInfoGetter", ({ userName }, callback) => {
    console.log("YYYYYYYYYYYYYYYYYYYYYYYYYYY", userName);
    userInfoGetter(userName, (data) => {
      // console.log("userNameTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT", data);
      // callback(data);
      callback(data);
    });
  });

  socket.on("join", ({ userName, roomName }, callback) => {
    // console.log("userName, roomName", userName, roomName);
    getMessages(userName, roomName, (err, data) => {
      // console.log(data);
      callback(data);
    });

    socket.join(roomName.roomName);
  });

  socket.on("roomListGetter", ({ projectName }, callback) => {
    roomsListGetter(projectName, (err, data) => {
      callback(data);
    });
  });

  socket.on("saveMessage", ({ projectName, roomName, userName, message }) => {
    saveMessage(projectName, roomName, userName, message);
    socket.to(roomName).emit("showNewMessage", {
      projectName,
      roomName,
      userName,
      message,
    });
  });

  socket.on("deleteMessage", ({ messageID, roomName }) => {
    deleteMessage(messageID, () => {
      console.log(`message ID ${messageID} DELETED.`);
      // console.log(socket);
      socket.broadcast.to(roomName).emit("deleteMessageClientSide", {
        messageID,
      });
    });
  });

  socket.on("projectGetter", ({ userName }, callback) => {
    console.log("USERNAME: ", userName);
    projectListGetter(userName, (data) => {
      let projetList = [];
      for (var counter in data) {
        projetList.push(data[counter].projectMember_projectName);
      }
      console.log(projetList);
      callback(projetList);
    });
  });

  socket.on("usersInTheSameProjectListGetter", ({ projectName }, callback) => {
    sameUsersInProjectGetter(projectName, (data) => {
      callback(data);
    });
  });

  socket.on("profileImageGetter", ({ projectUsers }, callback) => {
    console.log("projectUsers", projectUsers);
    let imgArray = [];
    for (var row in projectUsers) {
      profileImageGetter(
        { userName: projectUsers[row].projectMember_userName },
        (img) => {
          // console.log(row, " : ", img.substring(0, 20));
          // callback(img, projectUsers[row].projectMember_userName);
          imgArray.push({
            userName: projectUsers[row].projectMember_userName,
            img,
          });
        }
      );
    }
    callback(imgArray);
  });

  socket.on("currentImgGetter", ({ userName }, callback) => {
    profileImageGetter({ userName }, (img) => {
      callback(img);
    });
  });

  socket.on("disconnect", () => {
    console.log("user have already left!!!");
  });
});
app.use(router);

server.listen(5000, () => {
  console.log(`socket listening on port ${PORT}`);
});

const PORT = 4000;
