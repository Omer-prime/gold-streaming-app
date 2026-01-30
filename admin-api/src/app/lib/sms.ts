export async function sendSmsOtp(phoneE164: string, code: string) {
  // Implement Twilio / any provider here.
  // For now, dev mode only.
  if (String(process.env.SMS_DEV_MODE ?? "false") === "true") return;

  throw new Error("SMS provider not configured. Set SMS_DEV_MODE=true for dev.");
}
