const express = require('express');
const router = express.Router();
const artistsController = require('../controllers/artistsController');
const validateRequest = require('../middlewares/validateRequest');
const Joi = require('joi');

// Validation schema for the request body
const artistSchema = Joi.object({
  name: Joi.string().required(),
  genre: Joi.string().required(),
});

// GET /api/artists
router.get('/', artistsController.getArtists);

// GET /api/artists/:id
router.get('/:id', artistsController.getArtistById);

// POST /api/artists
router.post('/', validateRequest(artistSchema), artistsController.addArtist);

// DELETE /api/artists/:id
router.delete('/:id', artistsController.deleteArtist);

module.exports = router;
