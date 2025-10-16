import React, { useState } from 'react';
import { View, Text, ImageBackground, StyleSheet, TextInput, TouchableOpacity, useWindowDimensions, Platform, StatusBar } from 'react-native';
import LoginModal from '../layout/LoginModal';
import { setToken } from '../../services/token';

const backgroundImage = require('../assets/images/fondoNet.jpg');

const stylesFactory = (width: number, height: number, topPadding: number) => StyleSheet.create({
  backgroundImage: { minHeight: height * 0.9, width },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', paddingTop: topPadding, paddingBottom: 20 },
  content: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: width * 0.05, marginBottom: height * 0.05 },
  logo: { color: '#E50914', fontSize: 22, fontWeight: 'bold' },
  headerActions: { flexDirection: 'row', alignItems: 'center' },
  language: { color: 'white' },
  loginButton: { backgroundColor: '#E50914', padding: 8, borderRadius: 4 },
  loginButtonText: { color: 'white', fontWeight: '700' },
  hero: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: width * 0.05 },
  heroContentContainer: { alignItems: 'center', width: '80%', maxWidth: 600 },
  title: { color: 'white', fontSize: 28, fontWeight: '900', textAlign: 'center', marginBottom: 10 },
  subtitle: { color: 'white', fontSize: 16, textAlign: 'center', marginBottom: 20 },
  promptText: { color: '#C0C0C0', textAlign: 'center', marginBottom: 10 },
  formWrapper: { flexDirection: 'row', width: '100%', maxWidth: 600, height: 50 },
  textInput: { flex: 1, backgroundColor: '#222', color: 'white', padding: 10, borderTopLeftRadius: 4, borderBottomLeftRadius: 4 },
  button: { backgroundColor: '#E50914', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 16, borderTopRightRadius: 4, borderBottomRightRadius: 4 },
  buttonText: { color: 'white', fontWeight: '700' },
});

const HeroSectionClean: React.FC = () => {
  const [showLogin, setShowLogin] = useState(false);
  const { width, height } = useWindowDimensions();
  const topPadding = (Platform.OS === 'android' ? (StatusBar.currentHeight || 24) : 40) + 10;
  const styles = stylesFactory(width, height, topPadding);

  return (
    <ImageBackground source={backgroundImage} style={styles.backgroundImage} resizeMode="cover">
      <View style={styles.overlay}>
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.logo}>NETFLIX</Text>
            <View style={styles.headerActions}>
              <Text style={styles.language}>En Español</Text>
              <TouchableOpacity style={styles.loginButton} onPress={() => setShowLogin(true)}>
                <Text style={styles.loginButtonText}>Iniciar sesión</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.hero}>
            <View style={styles.heroContentContainer}>
              <Text style={styles.title}>Películas y series ilimitadas y mucho más</Text>
              <Text style={styles.subtitle}>A partir de S/ 28.90. Cancela cuando quieras.</Text>
              <Text style={styles.promptText}>¿Quieres ver Netflix ya? Ingresa tu email para crear una cuenta o reiniciar la membresía de Netflix.</Text>

              <View style={styles.formWrapper}>
                <TextInput style={styles.textInput} placeholder="Email" placeholderTextColor="#8C8C8C" />
                <TouchableOpacity style={styles.button}>
                  <Text style={styles.buttonText}>Comenzar →</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </View>

      <LoginModal visible={showLogin} onClose={() => setShowLogin(false)} onLogin={(token) => { setToken(token); setShowLogin(false); }} />
    </ImageBackground>
  );
};

export default HeroSectionClean;
