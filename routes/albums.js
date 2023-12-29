const express = require('express');
const router = express.Router();
const albumsController = require('../controllers/albumsController');
const validateRequest = require('../middlewares/validateRequest');
const Joi = require('joi');

// Validation schema for the request body
const albumSchema = Joi.object({
  title: Joi.string().required(),
  artist: Joi.string().required(),
  releaseYear: Joi.number().integer().required(),
});

// GET /api/albums
router.get('/', albumsController.getAlbums);

// GET /api/albums/:id
router.get('/:id', albumsController.getAlbumById);

// POST /api/albums
router.post('/', validateRequest(albumSchema), albumsController.addAlbum);

// DELETE /api/albums/:id
router.delete('/:id', albumsController.deleteAlbum);

module.exports = router;
