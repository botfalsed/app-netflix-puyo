const API_BASE = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:4000';

export async function getProfiles(token: string) {
  const res = await fetch(`${API_BASE}/api/profiles`, { headers: { Authorization: `Bearer ${token}` } });
  return res.json();
}

export async function createProfile(token: string, body: { name: string; avatar?: string; is_kids?: boolean }) {
  const res = await fetch(`${API_BASE}/api/profiles`, { method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  return res.json();
}
