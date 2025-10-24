import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:4000';

// Local storage key for active profile
const ACTIVE_PROFILE_KEY = 'netflix_active_profile';

// Fallback for web where AsyncStorage may not be available
function hasLocalStorage() {
  try {
    return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
  } catch (e) {
    return false;
  }
}

export async function getProfiles(token: string) {
  const res = await fetch(`${API_BASE}/api/profiles`, { headers: { Authorization: `Bearer ${token}` } });
  return res.json();
}

export async function createProfile(token: string, body: { name: string; avatar?: string; is_kids?: boolean }) {
  const res = await fetch(`${API_BASE}/api/profiles`, { method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  return res.json();
}

// Set active profile in storage (AsyncStorage on native, localStorage on web)
export async function setActiveProfile(profile: any) {
  try {
    await AsyncStorage.setItem(ACTIVE_PROFILE_KEY, JSON.stringify(profile));
    if (hasLocalStorage()) {
      try { window.localStorage.setItem(ACTIVE_PROFILE_KEY, JSON.stringify(profile)); } catch {}
    }
  } catch (error) {
    console.error('Error setting active profile:', error);
    // Attempt web fallback even if AsyncStorage fails
    if (hasLocalStorage()) {
      try { window.localStorage.setItem(ACTIVE_PROFILE_KEY, JSON.stringify(profile)); } catch {}
    }
  }
}

// Get active profile from storage (prefers AsyncStorage, falls back to localStorage)
export async function getActiveProfile() {
  try {
    const profileData = await AsyncStorage.getItem(ACTIVE_PROFILE_KEY);
    if (profileData) return JSON.parse(profileData);

    if (hasLocalStorage()) {
      try {
        const webData = window.localStorage.getItem(ACTIVE_PROFILE_KEY);
        return webData ? JSON.parse(webData) : null;
      } catch {
        return null;
      }
    }

    return null;
  } catch (error) {
    console.error('Error getting active profile:', error);
    // Fallback to web localStorage if AsyncStorage throws
    if (hasLocalStorage()) {
      try {
        const webData = window.localStorage.getItem(ACTIVE_PROFILE_KEY);
        return webData ? JSON.parse(webData) : null;
      } catch {
        return null;
      }
    }
    return null;
  }
}

// Clear active profile from storage
export async function clearActiveProfile() {
  try {
    await AsyncStorage.removeItem(ACTIVE_PROFILE_KEY);
    if (hasLocalStorage()) {
      try { window.localStorage.removeItem(ACTIVE_PROFILE_KEY); } catch {}
    }
  } catch (error) {
    console.error('Error clearing active profile:', error);
    // Attempt web fallback
    if (hasLocalStorage()) {
      try { window.localStorage.removeItem(ACTIVE_PROFILE_KEY); } catch {}
    }
  }
}
