import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import SafeAreaWrapper from '../common/SafeAreaWrapper';

const { width } = Dimensions.get('window');

// Datos del carrusel con las imágenes del proyecto
const carouselData = [
  {
    id: 1,
    image: require('../../assets/images/juegoCalamar.jpg'),
    title: 'Películas y series',
    subtitle: 'ilimitadas y mucho más.',
    description: 'Disfruta donde quieras. Cancela cuando quieras. Toca el enlace de abajo para suscribirte.',
  },
  {
    id: 2,
    image: require('../../assets/images/merlina.jpg'),
    title: 'Descarga y ve',
    subtitle: 'sin conexión.',
    description: 'Guarda fácilmente tus favoritos y siempre tendrás algo que ver.',
  },
  {
    id: 3,
    image: require('../../assets/images/kimetsu.jpg'),
    title: 'Sin compromisos.',
    subtitle: 'Cancela en línea.',
    description: 'Únete hoy, cancela en cualquier momento.',
  },
  {
    id: 4,
    image: require('../../assets/images/one piece.jpg'),
    title: 'Ve en cualquier lugar.',
    subtitle: 'Cancela en cualquier momento.',
    description: 'Transmite películas y programas de TV ilimitados en tu teléfono, tableta, laptop y TV.',
  },
];

const WelcomeScreen: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const handleScroll = (event: any) => {
    const scrollPosition = event.nativeEvent.contentOffset.x;
    const index = Math.round(scrollPosition / width);
    setCurrentIndex(index);
  };

  const scrollToIndex = (index: number) => {
    scrollViewRef.current?.scrollTo({
      x: index * width,
      animated: true,
    });
    setCurrentIndex(index);
  };

  const handleLoginPress = () => {
    router.push('/auth/login');
  };

  const handleStartPress = () => {
    router.push('/auth/login?mode=register');
  };

  return (
    <>
      <SafeAreaWrapper backgroundColor="#000" statusBarStyle="light-content">
        {/* Header fijo con gradiente transparente */}
        <LinearGradient
          colors={['rgba(0,0,0,0.8)', 'rgba(40,40,40,0.3)', 'transparent']}
          style={[styles.headerGradient, { top: insets.top }]}
        >
          <View style={styles.header}>
            <Text style={styles.logo}>NETFLIX</Text>
            <View style={styles.headerRight}>
              <TouchableOpacity style={styles.languageButton}>
                <Text style={styles.languageText}>En español</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.loginButton} onPress={handleLoginPress}>
                <Text style={styles.loginText}>Iniciar sesión</Text>
              </TouchableOpacity>
            </View>
          </View>
        </LinearGradient>

        {/* Carrusel deslizable */}
        <View style={styles.carouselContainer}>
          <ScrollView
            ref={scrollViewRef}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={handleScroll}
            scrollEventThrottle={16}
            style={styles.scrollView}
          >
            {carouselData.map((item) => (
              <View key={item.id} style={styles.slide}>
                <View style={styles.imageContainer}>
                  <Image source={item.image} style={styles.slideImage} />
                  <LinearGradient
                    colors={['transparent', 'rgba(0,0,0,0.8)', 'rgba(0,0,0,0.95)']}
                    style={styles.gradient}
                  />
                </View>
                <View style={styles.textContainer}>
                  <Text style={styles.slideTitle}>
                    {item.title}
                  </Text>
                  <Text style={styles.slideSubtitle}>
                    {item.subtitle}
                  </Text>
                  <Text style={styles.slideDescription}>
                    {item.description}
                  </Text>
                </View>
              </View>
            ))}
          </ScrollView>

          {/* Puntos de navegación */}
          <View style={styles.pagination}>
            {carouselData.map((_, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.paginationDot,
                  currentIndex === index && styles.paginationDotActive,
                ]}
                onPress={() => scrollToIndex(index)}
              />
            ))}
          </View>
        </View>

        {/* Botón fijo inferior */}
        <View style={[styles.bottomContainer, { paddingBottom: insets.bottom + 30 }]}>
          <TouchableOpacity style={styles.startButton} onPress={handleStartPress}>
            <Text style={styles.startButtonText}>COMIENZA YA</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaWrapper>
    </>
  );
};

const styles = StyleSheet.create({
  headerGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    zIndex: 10,
    paddingTop: 0,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  logo: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#E50914',
    letterSpacing: 2,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  languageButton: {
    marginRight: 15,
    paddingVertical: 5,
    paddingHorizontal: 10,
  },
  languageText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '500',
  },
  loginButton: {
    paddingVertical: 5,
    paddingHorizontal: 10,
  },
  loginText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  carouselContainer: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  slide: {
    width: width,
    flex: 1,
  },
  imageContainer: {
    flex: 1,
    position: 'relative',
  },
  slideImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  gradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '20%',
  },
  textContainer: {
    position: 'absolute',
    bottom: 120,
    left: 20,
    right: 20,
    alignItems: 'center',
  },
  slideTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 5,
  },
  slideSubtitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 20,
  },
  slideDescription: {
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 10,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
    position: 'absolute',
    bottom: 80,
    left: 0,
    right: 0,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(151, 148, 148, 0.4)',
    marginHorizontal: 4,
  },
  paginationDotActive: {
    backgroundColor: '#fff',
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  bottomContainer: {
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  startButton: {
    backgroundColor: '#E50914',
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 2,
    width: '100%',
    alignItems: 'center',
    marginBottom: 15,
  },
  startButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
});

export default WelcomeScreen;