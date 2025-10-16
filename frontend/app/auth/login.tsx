import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import SafeAreaWrapper from '../../components/common/SafeAreaWrapper';
import { loginUser, registerUser } from '../../services/auth';
import { setToken } from '../../services/token';

const LoginScreen: React.FC = () => {
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isRegister, setIsRegister] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { mode } = useLocalSearchParams();

  // Detectar si viene del botón "COMIENZA YA" para mostrar registro
  useEffect(() => {
    if (mode === 'register') {
      setIsRegister(true);
    }
  }, [mode]);

  const handleSubmit = async () => {
    setError(null);
    setIsLoading(true);

    try {
      if (isRegister && !name.trim()) {
        setError('El nombre es obligatorio');
        setIsLoading(false);
        return;
      }

      if (!emailOrPhone.trim() || !password.trim()) {
        setError('Todos los campos son obligatorios');
        setIsLoading(false);
        return;
      }

      let response;
      if (isRegister) {
        response = await registerUser({
          name: name.trim(),
          emailOrPhone: emailOrPhone.trim(),
          password: password.trim(),
        });
      } else {
        response = await loginUser({
          emailOrPhone: emailOrPhone.trim(),
          password: password.trim(),
        });
      }

      if (response.success) {
        await setToken(response.token);
        router.push('/auth/profiles');
      } else {
        setError(response.message || 'Error en la autenticación');
      }
    } catch (error) {
      console.error('Error en autenticación:', error);
      setError('Error de conexión. Inténtalo de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    router.back();
  };

  const toggleMode = () => {
    setIsRegister(!isRegister);
    setError(null);
    setName('');
    setEmailOrPhone('');
    setPassword('');
  };

  return (
    <SafeAreaWrapper>
      <LinearGradient
        colors={['#000000', '#1a1a1a', '#000000']}
        style={styles.container}
      >
        <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
        
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <ScrollView 
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
          >
            {/* Header */}
            <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
              <TouchableOpacity onPress={handleBack} style={styles.backButton}>
                <Ionicons name="arrow-back" size={24} color="#fff" />
              </TouchableOpacity>
              <Text style={styles.logo}>NETFLIX</Text>
              <View style={styles.headerSpacer} />
            </View>

            {/* Content */}
            <View style={styles.content}>
              <View style={styles.formContainer}>
                <Text style={styles.title}>
                  {isRegister ? 'Crear cuenta' : 'Iniciar sesión'}
                </Text>

                {error && (
                  <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>{error}</Text>
                  </View>
                )}

                <View style={styles.inputContainer}>
                  {isRegister && (
                    <View style={styles.inputWrapper}>
                      <TextInput
                        style={styles.input}
                        placeholder="Nombre completo"
                        placeholderTextColor="#999"
                        value={name}
                        onChangeText={setName}
                        autoCapitalize="words"
                        editable={!isLoading}
                      />
                    </View>
                  )}
                  
                  <View style={styles.inputWrapper}>
                    <TextInput
                      style={styles.input}
                      placeholder="Email o número de teléfono"
                      placeholderTextColor="#999"
                      value={emailOrPhone}
                      onChangeText={setEmailOrPhone}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      editable={!isLoading}
                    />
                  </View>

                  <View style={styles.inputWrapper}>
                    <TextInput
                      style={styles.input}
                      placeholder="Contraseña"
                      placeholderTextColor="#999"
                      value={password}
                      onChangeText={setPassword}
                      secureTextEntry
                      editable={!isLoading}
                    />
                  </View>
                </View>

                <TouchableOpacity
                  style={[
                    styles.loginButton,
                    isLoading && styles.loginButtonDisabled
                  ]}
                  onPress={handleSubmit}
                  disabled={isLoading}
                >
                  <Text style={styles.loginButtonText}>
                    {isLoading 
                      ? 'Cargando...' 
                      : isRegister 
                        ? 'Registrarse' 
                        : 'Iniciar sesión'
                    }
                  </Text>
                </TouchableOpacity>

                {!isRegister && (
                  <TouchableOpacity style={styles.forgotPasswordButton}>
                    <Text style={styles.forgotPasswordText}>
                      ¿Necesitas ayuda?
                    </Text>
                  </TouchableOpacity>
                )}

                <TouchableOpacity style={styles.toggleButton} onPress={toggleMode}>
                  <Text style={styles.toggleText}>
                    {isRegister ? '¿Ya tienes cuenta? ' : '¿Nuevo en Netflix? '}
                    <Text style={styles.underlineText}>
                      {isRegister ? 'Inicia sesión' : 'Regístrate ahora'}
                    </Text>
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </LinearGradient>
    </SafeAreaWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  backButton: {
    padding: 8,
  },
  logo: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#E50914',
    letterSpacing: 2,
  },
  headerSpacer: {
    width: 40,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingBottom: 70,
  },
  formContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    borderRadius: 8,
    padding: 30,
    marginHorizontal: 5,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 30,
  },
  errorContainer: {
    backgroundColor: 'rgba(229, 9, 20, 0.1)',
    borderWidth: 1,
    borderColor: '#E50914',
    borderRadius: 4,
    padding: 12,
    marginBottom: 20,
  },
  errorText: {
    color: '#E50914',
    fontSize: 14,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputWrapper: {
    marginBottom: 16,
  },
  input: {
    backgroundColor: '#333',
    color: '#fff',
    fontSize: 16,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#555',
  },
  loginButton: {
    backgroundColor: '#E50914',
    paddingVertical: 16,
    borderRadius: 4,
    alignItems: 'center',
    marginBottom: 20,
  },
  loginButtonDisabled: {
    backgroundColor: '#666',
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  forgotPasswordButton: {
    alignItems: 'center',
    marginBottom: 20,
  },
  forgotPasswordText: {
    color: '#fff',
    fontSize: 14,
    textDecorationLine: 'underline',
  },
  toggleButton: {
    alignItems: 'center',
  },
  toggleText: {
    color: '#fff',
    fontSize: 14,
  },
  underlineText: {
    textDecorationLine: 'underline',
    fontWeight: 'bold',
  },
});

export default LoginScreen;