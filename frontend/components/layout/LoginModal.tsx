import React, { useState } from 'react';
import { Modal, View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { loginUser, registerUser } from '../../services/auth';

const LoginModal: React.FC<{ visible: boolean; onClose: () => void; onLogin: (token: string) => void }> = ({ visible, onClose, onLogin }) => {
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isRegister, setIsRegister] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    setError(null);
    try {
      if (isRegister && !name.trim()) {
        return setError('El nombre es obligatorio');
      }
      const res = isRegister
        ? await registerUser({ name: name.trim(), emailOrPhone, password })
        : await loginUser({ emailOrPhone, password });
      if (res.token) {
        onLogin(res.token);
        onClose();
      } else {
        setError(res.error || 'unknown');
      }
    } catch (err: any) {
      setError(err.message || 'network_error');
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.backdrop}>
        <View style={styles.container}>
          <Text style={styles.title}>{isRegister ? 'Crear cuenta' : 'Iniciar sesión'}</Text>
          {error ? <Text style={styles.error}>{error}</Text> : null}

          {isRegister ? (
            <TextInput placeholder="Nombre" value={name} onChangeText={setName} style={styles.input} />
          ) : null}
          <TextInput placeholder="Email o número" value={emailOrPhone} onChangeText={setEmailOrPhone} style={styles.input} />
          <TextInput placeholder="Contraseña" value={password} onChangeText={setPassword} secureTextEntry style={styles.input} />

          <TouchableOpacity style={styles.action} onPress={submit}>
            <Text style={styles.actionText}>{isRegister ? 'Registrarme' : 'Entrar'}</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setIsRegister(!isRegister)}>
            <Text style={styles.link}>{isRegister ? '¿Ya tienes cuenta? Inicia sesión' : '¿No tienes cuenta? Crea una'}</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={onClose} style={styles.close}>
            <Text style={styles.closeText}>Cerrar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  container: { width: '90%', maxWidth: 420, backgroundColor: '#111', padding: 20, borderRadius: 8 },
  title: { color: 'white', fontSize: 18, fontWeight: '700', marginBottom: 12 },
  input: { backgroundColor: '#222', color: 'white', padding: 10, borderRadius: 6, marginBottom: 10 },
  action: { backgroundColor: '#E50914', padding: 12, borderRadius: 6, alignItems: 'center', marginBottom: 10 },
  actionText: { color: 'white', fontWeight: '700' },
  link: { color: '#CFCFCF', textAlign: 'center', marginBottom: 10 },
  close: { alignItems: 'center' },
  closeText: { color: '#999' },
  error: { color: 'salmon', marginBottom: 8 },
});

export default LoginModal;
