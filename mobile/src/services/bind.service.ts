import { API_BASE_URL } from "../config";

async function j(res: Response) {
  const txt = await res.text();
  let data: any = null;
  try { data = txt ? JSON.parse(txt) : null; } catch {}
  if (!res.ok) throw new Error(data?.error || `Request failed (${res.status})`);
  return data;
}

export async function getBindStatus(userId: string) {
  const res = await fetch(`${API_BASE_URL}/api/profile/bind/status?userId=${encodeURIComponent(userId)}`);
  return j(res);
}

export async function requestEmailOtp(userId: string, email: string) {
  const res = await fetch(`${API_BASE_URL}/api/profile/bind/email/request`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId, email }),
  });
  return j(res);
}

export async function verifyEmailOtp(userId: string, email: string, code: string) {
  const res = await fetch(`${API_BASE_URL}/api/profile/bind/email/verify`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId, email, code }),
  });
  return j(res);
}

export async function requestPhoneOtp(userId: string, countryCode: string, phone: string) {
  const res = await fetch(`${API_BASE_URL}/api/profile/bind/phone/request`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId, countryCode, phone }),
  });
  return j(res);
}

export async function verifyPhoneOtp(userId: string, phoneE164: string, code: string) {
  const res = await fetch(`${API_BASE_URL}/api/profile/bind/phone/verify`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId, phoneE164, code }),
  });
  return j(res);
}

export async function bindSocial(userId: string, provider: "facebook"|"instagram"|"tiktok"|"google", providerId: string) {
  const res = await fetch(`${API_BASE_URL}/api/profile/bind/social`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId, provider, providerId }),
  });
  return j(res);
}

export async function unbindSocial(userId: string, provider: "facebook"|"instagram"|"tiktok"|"google") {
  const res = await fetch(`${API_BASE_URL}/api/profile/bind/social`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId, provider }),
  });
  return j(res);
}
