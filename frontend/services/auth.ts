const API_BASE = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.18.21:4000';

type LoginCreds = { emailOrPhone: string; password: string };
type RegisterCreds = { name: string; emailOrPhone: string; password: string };

export async function loginUser(creds: LoginCreds) {
  try {
    console.log('🔗 Attempting login to:', `${API_BASE}/api/login`);
    console.log('📱 Using API_BASE:', API_BASE);
    console.log('📤 Sending login data:', creds);
    
    const res = await fetch(`${API_BASE}/api/login`, { 
      method: 'POST', 
      headers: { 'Content-Type': 'application/json' }, 
      body: JSON.stringify(creds),
      timeout: 10000
    });
    
    console.log('✅ Response status:', res.status);
    const result = await res.json();
    console.log('📄 Response data:', result);
    
    if (res.ok && result.token) {
      return { success: true, token: result.token, user: result.user };
    } else {
      return { success: false, message: result.error || 'Error en la autenticación' };
    }
  } catch (error) {
    console.error('❌ Login error:', error);
    console.error('🔧 API_BASE being used:', API_BASE);
    return { success: false, message: 'Error de conexión' };
  }
}

export async function registerUser(creds: RegisterCreds) {
  try {
    console.log('🔗 Attempting register to:', `${API_BASE}/api/register`);
    console.log('📤 Sending register data:', creds);
    
    const res = await fetch(`${API_BASE}/api/register`, { 
      method: 'POST', 
      headers: { 'Content-Type': 'application/json' }, 
      body: JSON.stringify(creds),
      timeout: 10000
    });
    
    console.log('✅ Register response status:', res.status);
    const result = await res.json();
    console.log('📄 Register response data:', result);
    
    if (res.ok && result.token) {
      return { success: true, token: result.token, user: result.user };
    } else {
      return { success: false, message: result.error || 'Error en el registro' };
    }
  } catch (error) {
    console.error('❌ Register error:', error);
    console.error('🔧 API_BASE being used:', API_BASE);
    return { success: false, message: 'Error de conexión' };
  }
}
