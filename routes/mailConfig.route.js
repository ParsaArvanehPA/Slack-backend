const express = require("express");
const nodemailer = require("nodemailer");
const exphb = require("express-handlebars");
const fs = require("fs");
const path = require("path");
const { promisify } = require("util");
const readFile = promisify(fs.readFile);
const handlebars = require("handlebars");
const router = express.Router();

const { createInviteCode } = require("../middleware/tokens");

// const app = express();
// app.engine("handlebars", exphb());
// app.set("view engine", "handlebars");

//
// app.use("/public", express.static(path.join(__dirname, "public")));
//

router.post("", (req, res) => {
  const { email, userName, inviteCode, projectName } = req.body;
  fs.readFile("./views/email.html", { encoding: "utf-8" }, (err, html) => {
    sendMail(res, html, projectName, createInviteCode(projectName), email);
  });
});

function sendMail(res, htmlFile, projectName, inviteCode, email) {
  console.log(
    "sendMail -> projectName, inviteCode, email",
    projectName,
    inviteCode,
    email
  );
  var template = handlebars.compile(htmlFile);
  var replacements = {
    projectName,
    inviteCode,
  };
  var htmlToSend = template(replacements);

  let transporter = nodemailer.createTransport({
    // host: "smtp.ethereal.email",
    // port: 587,
    // service: "Gmail",
    service: "Gmail",
    secure: false, // true for 465, false for other ports
    auth: {
      user: "parsa.arvaneh@gmail.com", // generated ethereal user
      pass: "22446688113355779900", // generated ethereal password
    },
    tls: {
      rejectUnauthorized: false,
    },
  });

  let info = transporter.sendMail({
    from: '"SLACK" <foo@example.com>', // sender address
    to: email, // list of receivers
    // to: "parsa.arvaneh@yahoo.com", // list of receivers
    subject: "Join SLACK", // Subject line
    // text: "Hello world???????/?", // plain text body
    html: htmlToSend, // html body
    // template: "./views/email.handlebars",
    // context: {
    //   msg: "worked?",
    // },
  });

  console.log("Message sent: %s", info.messageId);
  console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
  return res.send({ result: "email sent." });
}

module.exports = router;
