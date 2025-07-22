const mongoose = require('mongoose');

const roomieSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  branch: { type: String, required: true },
  hostelType: { type: String, enum: ['boys', 'girls'], required: true },
  hostel: { type: String, required: true },
  room: { type: String, required: true },
  instagram: { type: String },
  registeredAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Roomie', roomieSchema);
