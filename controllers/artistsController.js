const Artist = require("../models/artistModel");

// @desc    Get all artists
// @route   GET /api/artists
// @access  Public
exports.getArtists = async (req, res, next) => {
    try {
        const artists = await Artist.find();
        res.json(artists);
    } catch (error) {
        next(error);
    }
};

// @desc    Get an artist by ID
// @route   GET /api/artists/:id
// @access  Public
exports.getArtistById = async (req, res, next) => {
    try {
        const { id } = req.params;

        const artist = await Artist.findById(id);

        if (!artist) {
            throw new ErrorResponse("Artist not found", 404);
        }

        res.json(artist);
    } catch (error) {
        next(error);
    }
};

// @desc    Add a new artist
// @route   POST /api/artists
// @access  Public
exports.addArtist = async (req, res, next) => {
    try {
        const { name, genre } = req.body;

        const artist = await Artist.create({ name, genre });

        res.status(201).json(artist);
    } catch (error) {
        next(error);
    }
};

// @desc    Delete an artist by ID
// @route   DELETE /api/artists/:id
// @access  Public
exports.deleteArtist = async (req, res, next) => {
    try {
        const { id } = req.params;

        const artist = await Artist.findByIdAndDelete(id);

        if (!artist) {
            throw new ErrorResponse("Artist not found", 404);
        }

        res.sendStatus(204);
    } catch (error) {
        next(error);
    }
};
