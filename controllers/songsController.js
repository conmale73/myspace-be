const Song = require("../models/songModel");

// @desc    Get all songs
// @route   GET /api/songs
// @access  Public
exports.getSongs = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1; // Current page
        const limit = parseInt(req.query.limit) || 10; // Number of songs per page

        const startIndex = (page - 1) * limit;
        const endIndex = page * limit;

        const totalSongs = await Song.countDocuments();
        const totalPages = Math.ceil(totalSongs / limit);

        const songs = await Song.find().skip(startIndex).limit(limit);

        res.json({
            songs,
            page,
            totalPages,
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get a song by ID
// @route   GET /api/songs/:id
// @access  Public
exports.getSongById = async (req, res, next) => {
    try {
        const { id } = req.params;

        const song = await Song.findById(id);

        if (!song) {
            throw new ErrorResponse("Song not found", 404);
        }

        res.json(song);
    } catch (error) {
        next(error);
    }
};

// @desc    Add a new song
// @route   POST /api/songs
// @access  Public
exports.addSong = async (req, res, next) => {
    try {
        const {
            title,
            artist: [{ name, id }],
            genre,
            lyrics,
            thumbnails: [{ url, width, height }],
            duration,
            likes,
            createAt,
            updateAt,
        } = req.body;

        const newSong = new Song({
            title,
            artist: [{ name, id }],
            genre,
            lyrics,
            thumbnails: [{ url, width, height }],
            duration,
            likes,
            createAt,
            updateAt,
        });

        const savedSong = await newSong.save();
        res.status(201).json(savedSong);
    } catch (error) {
        next(error);
    }
};
// @desc    Update a song
// @route   PUT /api/songs/:id
// @access  Public
exports.updateSong = async (req, res, next) => {
    try {
        const { id } = req.params;
        const updateData = req.body; // The new data to update the song with

        // Find the song by ID and update it with the new data
        const updatedSong = await Song.findByIdAndUpdate(id, updateData, {
            new: true, // Return the updated document
            runValidators: true, // Run validation on the update data
        });

        if (!updatedSong) {
            throw new ErrorResponse("Song not found", 404);
        }

        res.json(updatedSong);
    } catch (error) {
        next(error);
    }
};

// New function to increment the number of likes for a song
exports.likeSong = async (req, res, next) => {
    try {
        const { id } = req.params;

        const song = await Song.findByIdAndUpdate(
            id,
            { $inc: { likes: 1 } }, // Increment the likes by 1
            { new: true }
        );

        if (!song) {
            throw new ErrorResponse("Song not found", 404);
        }

        res.json(song);
    } catch (error) {
        next(error);
    }
};
exports.unlikeSong = async (req, res, next) => {
    try {
        const { id } = req.params;

        const song = await Song.findByIdAndUpdate(
            id,
            { $inc: { likes: -1 } },
            { new: true }
        );

        if (!song) {
            throw new ErrorResponse("Song not found", 404);
        }

        res.json(song);
    } catch (error) {
        next(error);
    }
};

// @desc    Delete a song
// @route   DELETE /api/songs/:id
// @access  Public
exports.deleteSong = async (req, res, next) => {
    try {
        const { id } = req.params;

        const deletedSong = await Song.findByIdAndDelete(id);

        if (!deletedSong) {
            throw new ErrorResponse("Song not found", 404);
        }

        res.json({ message: "Song deleted successfully" });
    } catch (error) {
        next(error);
    }
};
