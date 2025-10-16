import React from 'react';
import { 
  View, 
  Text, 
  ImageBackground, 
  StyleSheet, 
  TouchableOpacity, 
  StatusBar,
  ScrollView 
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import SafeAreaWrapper from '../common/SafeAreaWrapper';

const backgroundImage = require('../../assets/images/fondoNet.jpg');

const ProfileHome: React.FC<{ profile: any; onBack: () => void }> = ({ profile, onBack }) => {
  const insets = useSafeAreaInsets();

  return (
    <SafeAreaWrapper>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header with back button */}
        <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <Text style={styles.backText}>← Perfiles</Text>
          </TouchableOpacity>
        </View>

        {/* Profile Title */}
        <View style={styles.profileTitleContainer}>
          <Text style={styles.profileTitle}>{profile?.name || 'Perfil'}</Text>
        </View>

        {/* Hero Section */}
        <View style={styles.heroContainer}>
          <ImageBackground source={backgroundImage} style={styles.hero} resizeMode="cover">
            <LinearGradient
              colors={['rgba(0,0,0,0.3)', 'rgba(0,0,0,0.7)', 'rgba(0,0,0,0.9)']}
              style={styles.heroOverlay}
            />
            <View style={styles.heroContent}>
              <Text style={styles.heroMain}>Películas y series ilimitadas</Text>
              <Text style={styles.heroSub}>Disfruta donde quieras. Cancela cuando quieras.</Text>
              <Text style={styles.heroPrompt}>
                Tu perfil está listo. Explora miles de títulos disponibles en Netflix.
              </Text>
              
              <TouchableOpacity style={styles.exploreButton}>
                <Text style={styles.exploreButtonText}>Explorar contenido</Text>
              </TouchableOpacity>
            </View>
          </ImageBackground>
        </View>

        {/* Profile Features Section */}
        <View style={styles.featuresContainer}>
          <View style={styles.featureItem}>
            <Text style={styles.featureTitle}>Mi lista</Text>
            <Text style={styles.featureDescription}>Guarda tus favoritos para verlos después</Text>
          </View>
          
          <View style={styles.featureItem}>
            <Text style={styles.featureTitle}>Continuar viendo</Text>
            <Text style={styles.featureDescription}>Retoma donde lo dejaste</Text>
          </View>
          
          <View style={styles.featureItem}>
            <Text style={styles.featureTitle}>Recomendaciones</Text>
            <Text style={styles.featureDescription}>Contenido personalizado para ti</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaWrapper>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#141414' 
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    backgroundColor: 'transparent'
  },
  backButton: {
    paddingVertical: 8,
    paddingHorizontal: 4
  },
  backText: { 
    color: 'white', 
    fontSize: 16,
    fontWeight: '400'
  },
  profileTitleContainer: {
    paddingHorizontal: 20,
    marginBottom: 24
  },
  profileTitle: { 
    color: 'white', 
    fontSize: 48, 
    fontWeight: '700', 
    letterSpacing: -1
  },
  heroContainer: {
    marginBottom: 32
  },
  hero: { 
    height: 400, 
    justifyContent: 'flex-end' 
  },
  heroOverlay: { 
    ...StyleSheet.absoluteFillObject 
  },
  heroContent: { 
    padding: 24, 
    paddingBottom: 40 
  },
  heroMain: { 
    color: 'white', 
    fontSize: 32, 
    fontWeight: '700', 
    marginBottom: 12,
    letterSpacing: -0.5
  },
  heroSub: { 
    color: 'white', 
    fontSize: 18, 
    marginBottom: 16,
    fontWeight: '400'
  },
  heroPrompt: { 
    color: '#e5e5e5', 
    fontSize: 16, 
    lineHeight: 24,
    marginBottom: 24,
    maxWidth: 400
  },
  exploreButton: {
    backgroundColor: '#e50914',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 4,
    alignSelf: 'flex-start'
  },
  exploreButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600'
  },
  featuresContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40
  },
  featureItem: {
    backgroundColor: '#222222',
    padding: 20,
    borderRadius: 8,
    marginBottom: 16
  },
  featureTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8
  },
  featureDescription: {
    color: '#999999',
    fontSize: 14,
    lineHeight: 20
  }
});

export default ProfileHome;
