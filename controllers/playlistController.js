const Playlist = require("../models/playlistModel");
const User = require("../models/userModel");
const { ObjectId } = require("mongodb");

// @desc    Create a new playlist
// @route   POST /api/playlists
// @access  Public
exports.createPlaylist = async (req, res, next) => {
    try {
        const { title, creator, description, privacy } = req.body;

        const newPlaylist = new Playlist({
            title,
            creator,
            saved: [creator._id], // Add creator to saved list
            description,
            privacy,
        });

        const savedPlaylist = await newPlaylist.save();
        res.status(201).json(savedPlaylist);
    } catch (error) {
        next(error);
    }
};

// @desc    Get a playlist by id
// @route   GET /api/playlists/:playlist_id
// @access  Public
exports.getPlaylistByID = async (req, res, next) => {
    try {
        const { playlist_id } = req.params;
        const { user_id } = req.body;

        const playlist = await Playlist.findOne({ _id: playlist_id });
        console.log(req.body.user_id);
        console.log(playlist);
        //Check privacy
        if (playlist.privacy === "PRIVATE") {
            if (playlist.creator._id != user_id) {
                return res.status(200).json({
                    success: false,
                    error: "You are not authorized to access this playlist.",
                });
            } else {
                return res.status(200).json({
                    success: true,
                    data: playlist,
                });
            }
        } else {
            return res.status(200).json({
                success: true,
                data: playlist,
            });
        }
    } catch (error) {
        next(error);
    }
};

// @desc    Get all playlists by user id
// @route   GET /api/playlists/user/:user_id
// @access  Public
exports.getPlaylistsByUserID = async (req, res, next) => {
    try {
        const { user_id } = req.params;

        // Find playlists where creator _id is user_id
        const playlists = await Playlist.find({
            "creator._id": new ObjectId(user_id),
        }).sort({ updateAt: -1 }); // Sort by updateAt in descending order

        res.status(200).json({
            success: true,
            data: playlists,
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get two recent playlists by user id
// @route   GET /api/playlists/recentTwo/user/:user_id
// @access  Public
exports.getTwoRecentPlaylistsByUserID = async (req, res, next) => {
    try {
        const { user_id } = req.params;

        // Find playlists where creator _id is user_id
        const playlists = await Playlist.find({
            "creator._id": new ObjectId(user_id),
        })
            .sort({ updateAt: -1 }) // Sort by createAt in descending order
            .limit(2); // Get 2 playlists

        res.status(200).json({
            success: true,
            data: playlists,
        });
    } catch (error) {
        next(error);
    }
};
// @desc    Get all saved playlists by user id
// @route   GET /api/playlists/saved/:user_id
// @access  Public
exports.getSavedPlaylistsByUserID = async (req, res, next) => {
    try {
        const { user_id } = req.params;

        // Find playlists that saved indludes user_id
        const playlists = await Playlist.find({
            saved: user_id,
        }).sort({ updateAt: -1 });

        res.status(200).json({
            success: true,
            data: playlists,
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Save a playlist to library
// @route   GET /api/playlists/save/:playlist_id
// @access  Public
exports.savePlaylistToLibrary = async (req, res, next) => {
    try {
        const { playlist_id } = req.params;
        const { user_id } = req.body;

        const playlist = await Playlist.findOne({ _id: playlist_id });

        //Add user_id to saved list
        if (!playlist.saved.includes(user_id)) {
            playlist.saved.push(user_id);
        }

        const savedPlaylist = await playlist.save();

        res.status(200).json({
            success: true,
            data: savedPlaylist,
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Save a playlist to library
// @route   GET /api/playlists/remove/:playlist_id
// @access  Public
exports.removePlaylistFromLibrary = async (req, res, next) => {
    try {
        const { playlist_id } = req.params;
        const { user_id } = req.body;

        const playlist = await Playlist.findOne({ _id: playlist_id });

        const { saved } = playlist;
        //Add user_id to saved list
        if (saved.includes(user_id)) {
            saved.splice(saved.indexOf(user_id), 1);

            const updatedPlaylist = await Playlist.findOneAndUpdate(
                { _id: playlist_id },
                { saved },
                { new: true }
            );

            res.status(201).json(updatedPlaylist);
        } else {
            return res.status(201).json(playlist);
        }

        const savedPlaylist = await playlist.save();

        res.status(200).json({
            success: true,
            data: savedPlaylist,
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Add a song to a playlist
// @route   PUT /api/playlists/:playlist_id/addSong
// @access  Public
exports.addSongToPlaylist = async (req, res, next) => {
    try {
        const { playlist_id } = req.params;
        const song = req.body;

        const playlist = await Playlist.findOne({ _id: playlist_id });

        if (playlist.songs.some((s) => s.videoId === song.videoId)) {
            return res.status(200).json({
                success: false,
                data: playlist,
                error: "This song is already in the playlist.",
            });
        } else {
            playlist.songs.unshift(song);
            playlist.updateAt = Date.now();

            const savedPlaylist = await playlist.save();

            res.status(200).json({
                success: true,
                data: savedPlaylist,
            });
        }
    } catch (error) {
        next(error);
    }
};

// @desc    Remove a song from a playlist
// @route   PUT /api/playlists/:playlist_id/removeSong
// @access  Public
exports.removeSongFromPlaylist = async (req, res, next) => {
    try {
        const { playlist_id } = req.params;
        const { song_id } = req.body;

        const playlist = await Playlist.findOne({ _id: playlist_id });

        if (!playlist.songs.some((s) => s.videoId === song_id)) {
            return res.status(200).json({
                success: false,
                data: playlist,
                error: "This song is not in the playlist.",
            });
        } else {
            playlist.songs = playlist.songs.filter(
                (song) => song.videoId != song_id
            );
            playlist.updateAt = Date.now();

            const savedPlaylist = await playlist.save();

            res.status(200).json({
                success: true,
                data: savedPlaylist,
            });
        }
    } catch (error) {
        next(error);
    }
};

// @desc    Delete a playlist
// @route   DELETE /api/playlists/:playlist_id
// @access  Public
exports.deletePlaylist = async (req, res, next) => {
    try {
        const { playlist_id } = req.params;

        const playlist = await Playlist.deleteOne({ _id: playlist_id });

        res.status(200).json({
            success: true,
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Update a playlist
// @route   PUT /api/playlists/:playlist_id
// @access  Public
exports.updatePlaylist = async (req, res, next) => {
    try {
        const { playlist_id } = req.params;
        const { title, description, privacy } = req.body;

        const playlist = await Playlist.findOne({ _id: playlist_id });

        playlist.title = title;
        playlist.description = description;
        playlist.privacy = privacy;
        playlist.updateAt = Date.now();

        const savedPlaylist = await playlist.save();

        res.status(200).json({
            success: true,
            data: savedPlaylist,
        });
    } catch (error) {
        next(error);
    }
};
