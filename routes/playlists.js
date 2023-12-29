const playlistController = require("../controllers/playlistController");
const express = require("express");
const router = express.Router();

// POST /api/playlists/
router.post("/", playlistController.createPlaylist);

// GET /api/playlists/:playlist_id
router.put("/:playlist_id", playlistController.getPlaylistByID);

// GET /api/playlists/user/:user_id
router.get("/user/:user_id", playlistController.getPlaylistsByUserID);

// GET /api/playlists/recent/user/:user_id
router.get(
    "/recentTwo/user/:user_id",
    playlistController.getTwoRecentPlaylistsByUserID
);

// GET /api/playlists/saved/:user_id
router.get("/saved/:user_id", playlistController.getSavedPlaylistsByUserID);

// PUT /api/playlists/save/:playlist_id
router.put("/save/:playlist_id", playlistController.savePlaylistToLibrary);

// PUT /api/playlists/remove/:playlist_id
router.put(
    "/remove/:playlist_id",
    playlistController.removePlaylistFromLibrary
);

// PUT /api/playlists/:playlist_id/addSong
router.put("/:playlist_id/addSong", playlistController.addSongToPlaylist);

// PUT /api/playlists/:playlist_id/removeSong
router.put(
    "/:playlist_id/removeSong",
    playlistController.removeSongFromPlaylist
);

// PUT /api/playlists/:playlist_id
router.put("/:playlist_id", playlistController.updatePlaylist);

// DELETE /api/playlists/:playlist_id
router.delete("/:playlist_id", playlistController.deletePlaylist);

module.exports = router;
