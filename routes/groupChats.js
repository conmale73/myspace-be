const express = require("express");
const router = express.Router();
const groupChatController = require("../controllers/groupChatController");

// POST /api/groupChats
router.post("/", groupChatController.createGroupChat);

// GET /api/groupChats/:group_chat_id
router.get("/id/:group_chat_id", groupChatController.getGroupChatByID);

// GET /api/groupChats/user/:user_id
router.get("/user/:user_id", groupChatController.getGroupChatsByUserID);

// GET /api/groupChats/all/:user_id
router.get("/all/:user_id", groupChatController.getAllChatsByUserID);

// GET /api/groupChats/messages/:user_id
router.get(
    "/messages/:user_id",
    groupChatController.getAllChatsHaveMessagesByUserID
);

// GET /api/groupChats/unread/:user_id
router.get(
    "/unread/:user_id",
    groupChatController.getAllChatsHaveUnreadMessagesByUserID
);

// GET /api/groupChats/two/
router.post("/two/", groupChatController.getGroupChatOfTwoUsers);

module.exports = router;
