// Create a simple Express server to handle Twilio API calls
// Save this as twilio-service.js

const express = require('express');
const cors = require('cors');
const twilio = require('twilio');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Initialize Twilio client
const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

const TWILIO_WHATSAPP_FROM = process.env.TWILIO_WHATSAPP_FROM;

// Endpoint to send OTP via WhatsApp
app.post('/api/send-otp', async (req, res) => {
  try {
    const { phoneNumber, otp, amount, merchantName } = req.body;
    
    // Format phone number for WhatsApp (needs whatsapp: prefix)
    const formattedPhone = `whatsapp:${phoneNumber}`;
    
    // Send WhatsApp message with OTP
    await twilioClient.messages.create({
      body: `Your ZepPay OTP is: ${otp}. Amount: $${amount} at ${merchantName}. This code will expire in 15 seconds.`,
      from: `whatsapp:${TWILIO_WHATSAPP_FROM}`,
      to: formattedPhone
    });
    
    res.status(200).json({ success: true, message: 'OTP sent successfully' });
  } catch (error) {
    console.error('Error sending OTP:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Start the server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Twilio service listening on port ${PORT}`);
});