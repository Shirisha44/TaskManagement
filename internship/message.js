const mongoose = require('mongoose');

// Define the schema
const messageSchema = new mongoose.Schema({
  phoneNumber: { type: String, required: true },
  message: { type: String, required: true },
  dateSent: { type: Date, default: Date.now }
});

// Create the model
const Message = mongoose.model('Message', messageSchema);

module.exports = Message;
