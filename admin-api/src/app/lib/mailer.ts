import nodemailer from "nodemailer";

export async function sendEmailOtp(to: string, code: string) {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT ?? 587);
  const secure = String(process.env.SMTP_SECURE ?? "false") === "true";
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const from = process.env.SMTP_FROM || "Gold Live <no-reply@goldlive.app>";

  if (!host || !user || !pass) {
    throw new Error("SMTP config missing (SMTP_HOST/SMTP_USER/SMTP_PASS)");
  }

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass },
  });

  await transporter.sendMail({
    from,
    to,
    subject: "Gold Live verification code",
    text: `Your Gold Live verification code is: ${code}\n\nThis code expires soon.`,
  });
}
