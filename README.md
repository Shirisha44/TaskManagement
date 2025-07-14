# ✅ Task Management System with WhatsApp Reminders

This is a Node.js-based Task Management API that sends automated WhatsApp reminders using Twilio and stores message logs in MongoDB. Ideal for personal productivity apps, team task alerts, or educational projects.

---

## 📌 Features

- 📬 Send WhatsApp reminders to users using Twilio API
- 💾 Store sent messages with phone number and timestamp in MongoDB
- 🌐 CORS-enabled Express API server
- 🔒 Environment variable support for secure credentials
- 📦 Organized with `server.js` and Mongoose schema

---

## 🛠️ Tech Stack

| Tool       | Purpose                  |
|------------|---------------------------|
| Node.js    | Runtime environment       |
| Express.js | Web server framework      |
| Twilio     | WhatsApp messaging API    |
| MongoDB    | NoSQL database            |
| Mongoose   | MongoDB ODM               |
| dotenv     | Load environment variables|
| CORS       | Enable cross-origin access|

---

## 🚀 Getting Started

### 1️⃣ Clone the Repo

'''bash
git clone https://github.com/Shirisha44/TaskManagement.git
cd TaskManagement/internship

### 2️⃣ Install Dependencies
npm install

### 3️⃣ Setup .env
Create a .env file in the same folder as server.js with:
TWILIO_ACCOUNT_SID=your_actual_twilio_sid
TWILIO_AUTH_TOKEN=your_actual_twilio_token

### 4️⃣ Run MongoDB (if not already running)
mongod

### 5️⃣ Start the Server
node server.js
You'll see:
✅ Connected to MongoDB
🚀 Server running at http://localhost:4000
🔄 API Endpoint
➤ POST /send-whatsapp
Sends a WhatsApp message.
Request Body:

json
Copy
Edit
{
  "phoneNumber": "+91xxxxxxxxxx",
  "message": "Reminder from Task Management App"
}
Response:

200 OK: Message sent and saved to MongoDB

400 Bad Request: Missing phone number or message

500 Internal Server Error: Twilio/MongoDB failure

### 📁 Folder Structure

TaskManagement/
│
├── internship/
│   ├── server.js         # Main backend logic
│   ├── message.js        # Mongoose model
│   ├── .gitignore        # To ignore .env and node_modules
│   └── node_modules/
│
└── README.md

### ✅ Example Use Cases
Daily task reminders

Assignment or deadline notifications

Group updates via WhatsApp

Personalized message automation

🔐 Important
Do not commit your .env or any secret credentials. GitHub will block uploads containing secrets.

📬 Contact
Made with ❤️ by Shirisha
Feel free to fork, star, or open issues if you use or improve the project!




