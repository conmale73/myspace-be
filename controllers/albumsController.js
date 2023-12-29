const Album = require("../models/albumModel");

// @desc    Get all albums
// @route   GET /api/albums
// @access  Public
exports.getAlbums = async (req, res, next) => {
    try {
        const albums = await Album.find();
        res.json(albums);
    } catch (error) {
        next(error);
    }
};

// @desc    Get an album by ID
// @route   GET /api/albums/:id
// @access  Public
exports.getAlbumById = async (req, res, next) => {
    try {
        const { id } = req.params;

        const album = await Album.findById(id);

        if (!album) {
            throw new ErrorResponse("Album not found", 404);
        }

        res.json(album);
    } catch (error) {
        next(error);
    }
};

// @desc    Add a new album
// @route   POST /api/albums
// @access  Public
exports.addAlbum = async (req, res, next) => {
    try {
        const { title, artist, releaseYear } = req.body;

        const album = await Album.create({ title, artist, releaseYear });

        res.status(201).json(album);
    } catch (error) {
        next(error);
    }
};

// @desc    Delete an album by ID
// @route   DELETE /api/albums/:id
// @access  Public
exports.deleteAlbum = async (req, res, next) => {
    try {
        const { id } = req.params;

        const album = await Album.findByIdAndDelete(id);

        if (!album) {
            throw new ErrorResponse("Album not found", 404);
        }

        res.sendStatus(204);
    } catch (error) {
        next(error);
    }
};
