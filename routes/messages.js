const express = require("express");
const router = express.Router();
const messagesController = require("../controllers/messagesController");

// POST /api/messages
router.post("/", messagesController.createMessage);

// GET /api/messages/chat/:chat_id
router.get("/chat/:chat_id", messagesController.getMessagesByChatID);

// GET /api/messages/last/:chat_id
router.get("/last/:chat_id", messagesController.getLastMessageByChatID);

// PUT /api/messages/readAll/:chat_id
router.put("/readAll/:chat_id", messagesController.readAllMessageOfAChat);

// GET /api/messages/unread/:chat_id/:user_id
router.get(
    "/unread/:chat_id/:user_id",
    messagesController.getUnreadMessagesOfAChat
);

// PUT /api/messages/countUnread/:user_id
router.get(
    "/countUnread/:user_id",
    messagesController.countUnreadMessagesOfChats
);
module.exports = router;
