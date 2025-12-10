// admin-api/src/lib/email.ts
import nodemailer from "nodemailer";

const SMTP_HOST = process.env.SMTP_HOST;
const SMTP_PORT = Number(process.env.SMTP_PORT ?? "587");
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;
const SMTP_FROM =
  process.env.SMTP_FROM || `"Gold Live" <no-reply@goldlive.app>`;

// lazy-create transporter
let transporter: nodemailer.Transporter | null = null;

function getTransporter() {
  if (!transporter) {
    if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
      console.warn(
        "[email] SMTP env vars missing (SMTP_HOST / SMTP_USER / SMTP_PASS). Emails will be skipped."
      );
      return null;
    }

    transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: SMTP_PORT,
      secure: SMTP_PORT === 465, // true for 465, false for others
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASS,
      },
    });
  }

  return transporter;
}

export async function sendAppEmail(opts: {
  to: string;
  subject: string;
  html: string;
}) {
  const t = getTransporter();
  if (!t) return;

  try {
    await t.sendMail({
      from: SMTP_FROM,
      to: opts.to,
      subject: opts.subject,
      html: opts.html,
    });
  } catch (err) {
    console.error("[email] Failed to send email", err);
  }
}
