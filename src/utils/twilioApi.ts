// src/utils/twilioApi.ts

/**
 * Sends an OTP code via Twilio WhatsApp using the Twilio Sandbox
 *
 * NOTE: For Twilio Sandbox testing, the recipient must first send a message to the
 * Twilio WhatsApp number (+14155238886) with the code "join <sandbox-code>"
 */
export const sendOtpViaWhatsApp = async (
  phoneNumber: string,
  otp: string,
  amount: string,
  merchantName: string
): Promise<{ success: boolean; message: string }> => {
  try {
    // Twilio account credentials
    const accountSid = "ACdee9811e109e9275dc1ecb54034cccf8";
    const authToken =
      import.meta.env.VITE_TWILIO_AUTH_TOKEN || "your_auth_token";

    // Twilio WhatsApp sandbox number
    const fromNumber = "+14155238886";

    // Format WhatsApp numbers (requires whatsapp: prefix)
    const to = `whatsapp:${phoneNumber}`;
    const from = `whatsapp:${fromNumber}`;

    // Message content
    const body = `Your ZepPay payment code is: ${otp}. Amount: $${amount} at ${merchantName}. This code will expire in 15 seconds.`;

    // Create Base64 authentication string
    const auth = btoa(`${accountSid}:${authToken}`);

    // Create form data
    const formData = new URLSearchParams();
    formData.append("To", to);
    formData.append("From", from);
    formData.append("Body", body);

    // Make API request to Twilio
    const response = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Basic ${auth}`,
        },
        body: formData,
      }
    );

    // Parse response
    const data = await response.json();

    // Check if message was sent successfully
    if (data.sid) {
      console.log("WhatsApp message sent successfully:", data.sid);
      return {
        success: true,
        message: `OTP sent to ${phoneNumber} via WhatsApp`,
      };
    } else {
      console.error("Failed to send WhatsApp message:", data);
      return {
        success: false,
        message: data.message || "Failed to send OTP via WhatsApp",
      };
    }
  } catch (error) {
    console.error("Error sending WhatsApp message:", error);
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Unknown error sending OTP",
    };
  }
};
