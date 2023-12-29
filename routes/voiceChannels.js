const voiceChannelController = require("../controllers/voiceChannelController");
const express = require("express");
const router = express.Router();

// POST /api/voiceChannels/create
router.post("/create", voiceChannelController.createVoiceChannel);

// GET /api/voiceChannels/?room_id=:room_id
router.get("/room_id/:room_id", voiceChannelController.getRoomVoiceChannels);

// GET /api/voiceChannels/?id=:id
router.get("/id/:id", voiceChannelController.getVoiceChannelById);

// POST /api/voiceChannels/join/:id
router.post("/join/:id", voiceChannelController.joinVoiceChannel);

// POST /api/voiceChannels/leave/:id
router.post("/leave/:id", voiceChannelController.leaveVoiceChannel);

//PUT /api/voiceChannels/leaveAll/
router.put("/leaveAll/", voiceChannelController.leaveAllVoiceChannel);
module.exports = router;
