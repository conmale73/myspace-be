const mongoose = require('mongoose');

const artistSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  genre: {
    type: String,
    required: true,
  },
  // Additional properties...
});

const Artist = mongoose.model('Artist', artistSchema);

module.exports = Artist;
