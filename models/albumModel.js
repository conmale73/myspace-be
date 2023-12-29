const mongoose = require('mongoose');

const albumSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  artist: {
    type: String,
    required: true,
  },
  releaseYear: {
    type: Number,
    required: true,
  },
  // Additional properties...
});

const Album = mongoose.model('Album', albumSchema);

module.exports = Album;
