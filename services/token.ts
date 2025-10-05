let _token: string | null = null;

const STORAGE_KEY = 'netflix_token_v1';

function hasLocalStorage() {
	try {
		return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
	} catch (e) {
		return false;
	}
}

export function setToken(t: string) {
	_token = t;
	if (hasLocalStorage()) {
		try { window.localStorage.setItem(STORAGE_KEY, t); } catch (e) { /* ignore */ }
	}
}

export function getToken() {
	if (_token) return _token;
	if (hasLocalStorage()) {
		try { const v = window.localStorage.getItem(STORAGE_KEY); if (v) { _token = v; return v; } } catch (e) { /* ignore */ }
	}
	return _token;
}

export function clearToken() {
	_token = null;
	if (hasLocalStorage()) {
		try { window.localStorage.removeItem(STORAGE_KEY); } catch (e) { /* ignore */ }
	}
}
