const API_BASE = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:4000';

type LoginCreds = { emailOrPhone: string; password: string };
type RegisterCreds = { name?: string; emailOrPhone: string; password: string };

export async function loginUser(creds: LoginCreds) {
  const res = await fetch(`${API_BASE}/api/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(creds) });
  return res.json();
}

export async function registerUser(creds: RegisterCreds) {
  const res = await fetch(`${API_BASE}/api/register`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(creds) });
  return res.json();
}
