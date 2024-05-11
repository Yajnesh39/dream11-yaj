const mongoose = require('mongoose');

const playerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  team: { type: String, required: true },
  role: { type: String, required: true },
});

module.exports = mongoose.model('Player', playerSchema);