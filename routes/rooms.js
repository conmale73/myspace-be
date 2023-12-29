const express = require("express");
const router = express.Router();
const roomsController = require("../controllers/roomsController");

// POST /api/rooms
router.get("/public/", roomsController.getAllPublicRooms);

// POST /api/rooms
router.get("/", roomsController.getAllRooms);

// POST /api/rooms/
router.post("/", roomsController.createRoom);

// GET /api/rooms/:room_id
router.get("/:room_id", roomsController.getRoomByID);

// POST /api/rooms/join/:room_id
router.put("/join/:room_id", roomsController.joinRoom);

// POST /api/rooms/quit/:room_id
router.patch("/quit/:room_id", roomsController.quitRoom);

module.exports = router;
