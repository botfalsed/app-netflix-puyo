import React from 'react';
import { View, Text, ImageBackground, StyleSheet, TouchableOpacity, StatusBar } from 'react-native';

const backgroundImage = require('../assets/images/fondoNet.jpg');

const ProfileHome: React.FC<{ profile: any; onBack: () => void }> = ({ profile, onBack }) => {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="rgba(0,0,0,0)" translucent={true} />
      <TouchableOpacity onPress={onBack} style={styles.back}>
        <Text style={styles.backText}>← Volver</Text>
      </TouchableOpacity>
      <Text style={styles.profileTitle}>{profile?.name || 'Perfil'}</Text>

      <ImageBackground source={backgroundImage} style={styles.hero} resizeMode="cover">
        <View style={styles.overlay} />
        <View style={styles.heroContent}>
          <Text style={styles.heroMain}>Películas y series ilimitadas y mucho más</Text>
          <Text style={styles.heroSub}>A partir de S/ 28.90. Cancela cuando quieras.</Text>
          <Text style={styles.heroPrompt}>¿Quieres ver Netflix ya? Ingresa tu email para crear una cuenta o reiniciar la membresía de Netflix.</Text>
        </View>
      </ImageBackground>

    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'black' },
  back: { paddingTop: 12, paddingLeft: 12 },
  backText: { color: 'white', fontSize: 16 },
  profileTitle: { color: 'white', fontSize: 48, fontWeight: '900', paddingLeft: 16, marginBottom: 8 },
  hero: { height: 420, justifyContent: 'flex-end' },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.5)' },
  heroContent: { padding: 24, paddingBottom: 40 },
  heroMain: { color: 'white', fontSize: 32, fontWeight: '800', marginBottom: 8 },
  heroSub: { color: 'white', fontSize: 16, marginBottom: 12 },
  heroPrompt: { color: '#CFCFCF', fontSize: 14, maxWidth: 700 },
});

export default ProfileHome;
