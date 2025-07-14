require('dotenv').config(); // Load .env values

const express = require("express");
const bodyParser = require("body-parser");
const twilio = require("twilio");
const cors = require("cors");
const mongoose = require("mongoose");

const app = express();
const port = 4000;

// MongoDB connection
const mongoURI = 'mongodb://localhost:27017';
mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch((error) => console.error('❌ MongoDB connection error:', error));

// Twilio credentials from environment variables
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = twilio(accountSid, authToken);

// Allowed CORS origins
const allowedOrigins = [
  'http://127.0.0.1:5500',
  'http://localhost:5500',
  'http://localhost:4000',
];

app.use(cors({
  origin: function(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
}));

app.use(bodyParser.json());

// WhatsApp message sending route
app.post("/send-whatsapp", (req, res) => {
  const { phoneNumber, message } = req.body;

  if (!phoneNumber || !message) {
    return res.status(400).send("Phone number and message are required.");
  }

  client.messages
    .create({
      from: "whatsapp:+14155238886",
      to: `whatsapp:${phoneNumber}`,
      body: message,
    })
    .then((twilioMessage) => {
      console.log("✅ Message sent:", twilioMessage.sid);

      // MongoDB schema and save
      const Message = mongoose.model('Message', new mongoose.Schema({
        phoneNumber: { type: String, required: true },
        message: { type: String, required: true },
        dateSent: { type: Date, default: Date.now }
      }));

      const newMessage = new Message({ phoneNumber, message });

      newMessage.save()
        .then(() => {
          console.log("✅ Message saved to MongoDB");
          res.status(200).send("WhatsApp message sent and saved.");
        })
        .catch((error) => {
          console.error("❌ MongoDB save error:", error);
          res.status(500).send("Error saving message.");
        });
    })
    .catch((error) => {
      console.error("❌ Twilio error:", error);
      res.status(500).send("Failed to send message.");
    });
});

// Root route
app.get("/", (req, res) => {
  res.send("👋 Welcome to the Quest Management API!");
});

// Start server
app.listen(port, () => {
  console.log(`🚀 Server running at http://localhost:${port}`);
});
