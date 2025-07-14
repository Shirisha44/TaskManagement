const express = require("express");
const bodyParser = require("body-parser");
const twilio = require("twilio");
const cors = require('cors');
const mongoose = require('mongoose');  // Import mongoose for database connection

const app = express();
const port = 4000;  // Change port to 4000

// MongoDB connection
const mongoURI = 'mongodb://localhost:27017';  // Database URL (default is localhost:27017)

mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('Connected to MongoDB'))
  .catch((error) => console.error('Error connecting to MongoDB:', error));

// Twilio Credentials
const accountSid = 'ACxxxxxxxxxxxxxxxxxxxxxxxxxxxx';
const authToken = "084bfddd6c4e748ea7165e53e7ad8f96";
const client = twilio(accountSid, authToken);

// Allowed Origins (Frontend URLs)
const allowedOrigins = [
  'http://127.0.0.1:5500', // Frontend URL (localhost with port 5500)
  'http://localhost:5500',  // Alternatively, for consistency
  'http://localhost:4000',  // Allowing the backend URL too
];

// Enable CORS for all domains
app.use(cors({
  origin: function(origin, callback) {
    // Check if the origin is allowed
    if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
}));

app.use(bodyParser.json());

// Endpoint to send WhatsApp message
app.post("/send-whatsapp", (req, res) => {
  const { phoneNumber, message } = req.body;

  if (!phoneNumber || !message) {
    return res.status(400).send("Phone number and message are required.");
  }

  client.messages
    .create({
      from: "whatsapp:+14155238886",  // Your Twilio WhatsApp sandbox number
      to: `whatsapp:${phoneNumber}`,  // The phone number from the request
      body: message,  // The message to be sent
    })
    .then((twilioMessage) => {
      console.log("Message sent: ", twilioMessage.sid);

      // Save the message to MongoDB
      const Message = mongoose.model('Message', new mongoose.Schema({
        phoneNumber: { type: String, required: true },
        message: { type: String, required: true },
        dateSent: { type: Date, default: Date.now }
      }));

      const newMessage = new Message({
        phoneNumber,
        message,
      });

      newMessage.save()
        .then(() => {
          console.log("Message saved to MongoDB");
          res.status(200).send("WhatsApp message sent and saved successfully.");
        })
        .catch((error) => {
          console.error("Error saving message to MongoDB:", error);
          res.status(500).send("Failed to save message to MongoDB.");
        });
    })
    .catch((error) => {
      console.error("Error sending WhatsApp message: ", error);
      res.status(500).send("Failed to send WhatsApp message.");
    });
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});

app.get("/", (req, res) => {
  res.send("Welcome to the Quest Management API!");
});




