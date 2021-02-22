DROP DATABASE IF EXISTS slack;

create database slack;
use slack;

 CREATE TABLE `userinfo` (
  `userInfo_id` int(11) NOT NULL AUTO_INCREMENT,
  `userInfo_userName` varchar(50) NOT NULL,
  `userInfo_firstName` varchar(25) NOT NULL,
  `userInfo_lastName` varchar(25) NOT NULL,
  `userInfo_email` varchar(100) NOT NULL,
  `userInfo_major` varchar(50) NOT NULL,
  `userInfo_password` varchar(25) NOT NULL,
  `userinfo_imageDir` varchar(2000) NOT NULL,
  `userInfo_dateCreated` datetime NOT NULL,
  `userinfo_refreshToken` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`userInfo_id`)
) ENGINE=InnoDB AUTO_INCREMENT=52 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

 CREATE TABLE `projectmember` (
  `projectMember_id` int(11) NOT NULL AUTO_INCREMENT,
  `projectMember_projectName` varchar(25) NOT NULL,
  `projectMember_userName` varchar(25) NOT NULL,
  `projectMember_joindeDate` datetime NOT NULL,
  PRIMARY KEY (`projectMember_id`)
) ENGINE=InnoDB AUTO_INCREMENT=55 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

 CREATE TABLE `projectinfo` (
  `projectInfo_id` int(11) NOT NULL AUTO_INCREMENT,
  `projectInfo_name` varchar(25) NOT NULL,
  `projectInfo_image` varchar(2000) NOT NULL,
  `projectInfo_description` varchar(14000) NOT NULL,
  `projectInfo_creatorName` varchar(25) NOT NULL,
  `projectInfo_dateCreated` datetime NOT NULL,
  `projectInfo_isPublic` tinyint(1) DEFAULT NULL,
  PRIMARY KEY (`projectInfo_id`)
) ENGINE=InnoDB AUTO_INCREMENT=47 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


CREATE TABLE `groupinfo` (
  `groupInfo_id` int(11) NOT NULL AUTO_INCREMENT,
  `groupInfo_projectName` varchar(25) NOT NULL,
  `groupInfo_name` varchar(25) NOT NULL,
  `groupInfo_description` varchar(14000) NOT NULL,
  `groupInfo_dateCreated` datetime NOT NULL,
  `isPublic` tinyint(1) DEFAULT NULL,
  PRIMARY KEY (`groupInfo_id`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `groupchatlog` (
  `groupChatLog_ID` int(11) NOT NULL AUTO_INCREMENT,
  `groupChatLog_senderUserName` varchar(25) NOT NULL,
  `groupChatLog_groupName` varchar(25) NOT NULL,
  `groupChatLog_projectName` varchar(25) NOT NULL,
  `groupChatLog_message` varchar(14000) NOT NULL,
  `groupChatLog_isFile` tinyint(1) NOT NULL,
  `groupChatLog_sentDate` datetime NOT NULL,
  PRIMARY KEY (`groupChatLog_ID`)
) ENGINE=InnoDB AUTO_INCREMENT=95 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

 CREATE TABLE `directchatlog` (
  `directChatLog_id` int(11) NOT NULL AUTO_INCREMENT,
  `directChatLog_senderUserName` varchar(25) NOT NULL,
  `directChatLog_recieverUserName` varchar(25) NOT NULL,
  `directChatLog_projectName` varchar(25) NOT NULL,
  `directChatLog_message` varchar(14000) NOT NULL,
  `directChatLog_isMessageFile` tinyint(1) NOT NULL,
  `directChatLog_sentDate` datetime NOT NULL,
  PRIMARY KEY (`directChatLog_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
