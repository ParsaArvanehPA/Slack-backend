const mysql = require("mysql");
const fs = require("fs");
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

const messages = ["first", "last", "parsa", "parham"];

const getMessages = (userName, roomName, callback) => {
  connection.query(
    `SELECT * FROM groupChatLog WHERE groupChatLog_groupName = '${roomName.roomName}' AND groupChatLog_projectName = 'test'`,
    (err, data) => {
      callback(err, data);
    }
  );
};

const saveMessage = (projectName, roomName, userName, message) => {
  connection.query(
    `INSERT INTO groupChatLog (
      groupChatLog_senderUserName, groupChatLog_groupName,groupChatLog_projectName,groupChatLog_message,groupChatLog_isFile,groupChatLog_sentDate) VALUES 
    ('${userName}','${roomName.roomName}','${projectName}','${message}',0,NOW())`
  );
};

const roomsListGetter = (projectName, callBack) => {
  connection.query(
    `SELECT * FROM groupInfo WHERE groupInfo_projectName = '${projectName}'`,
    (err, data) => {
      callBack(err, data);
    }
  );
};

const deleteMessage = (messageID, callback) => {
  connection.query(
    `DELETE FROM groupchatlog WHERE groupChatLog_ID = ${messageID}`,
    () => {
      callback();
    }
  );
};

const projectListGetter = (userName, callback) => {
  connection.query(
    `SELECT * FROM projectMember WHERE projectMember_userName = '${userName}'`,
    (err, data) => {
      callback(data);
    }
  );
};

const userInfoGetter = (userName, callback) => {
  connection.query(
    `SELECT * FROM  userinfo WHERE userInfo_userName = '${userName}'`,
    (err, data) => {
      if (err) {
        console.log(err);
      }
      console.log(data);
      callback(data);
    }
  );
};

const sameUsersInProjectGetter = (projectName, callback) => {
  connection.query(
    `SELECT * FROM projectmember WHERE projectMember_projectName = '${projectName}'`,
    (err, data) => {
      if (err) {
        console.log(err);
      }
      callback(data);
    }
  );
};

const profileImageGetter = ({ userName }, callback) => {
  try {
    var bitmap = fs.readFileSync(`public/users-profile-image/${userName}.png`, {
      root: ".",
    });
    var img = new Buffer(bitmap).toString("base64");
    callback(img);
  } catch {}
};

module.exports = {
  getMessages,
  saveMessage,
  roomsListGetter,
  deleteMessage,
  projectListGetter,
  userInfoGetter,
  sameUsersInProjectGetter,
  profileImageGetter,
};
