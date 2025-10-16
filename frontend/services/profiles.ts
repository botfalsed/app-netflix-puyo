import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.18.20:4000';

// Local storage key for active profile
const ACTIVE_PROFILE_KEY = 'netflix_active_profile';

export async function getProfiles(token: string) {
  const res = await fetch(`${API_BASE}/api/profiles`, { headers: { Authorization: `Bearer ${token}` } });
  return res.json();
}

export async function createProfile(token: string, body: { name: string; avatar?: string; is_kids?: boolean }) {
  const res = await fetch(`${API_BASE}/api/profiles`, { method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  return res.json();
}

// Set active profile in AsyncStorage
export async function setActiveProfile(profile: any) {
  try {
    await AsyncStorage.setItem(ACTIVE_PROFILE_KEY, JSON.stringify(profile));
  } catch (error) {
    console.error('Error setting active profile:', error);
  }
}

// Get active profile from AsyncStorage
export async function getActiveProfile() {
  try {
    const profileData = await AsyncStorage.getItem(ACTIVE_PROFILE_KEY);
    return profileData ? JSON.parse(profileData) : null;
  } catch (error) {
    console.error('Error getting active profile:', error);
    return null;
  }
}

// Clear active profile from AsyncStorage
export async function clearActiveProfile() {
  try {
    await AsyncStorage.removeItem(ACTIVE_PROFILE_KEY);
  } catch (error) {
    console.error('Error clearing active profile:', error);
  }
}
