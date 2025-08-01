const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  message: {
    type: String,
    required: true
  },
  response: {
    type: String,
    required: true
  },
  translatedResponse: {
    type: String
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

const Chat = mongoose.model('Chat', chatSchema);

module.exports = Chat; 