import React from 'react';
import {
  View,
  Text,
  ImageBackground,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/theme';
import type { Content } from '../../services/tmdbContent';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface HeroBannerProps {
  dailyFeatured: Content;
  onPlayContent: (content: Content) => void;
  onAddToList: (content: Content) => void;
  onViewDetails: (content: Content) => void;
}

const HeroBanner = React.memo(function HeroBanner({
  dailyFeatured,
  onPlayContent,
  onAddToList,
  onViewDetails
}: HeroBannerProps) {

  const handlePlay = React.useCallback(() => {
    onPlayContent(dailyFeatured);
  }, [onPlayContent, dailyFeatured]);

  const handleAddToList = React.useCallback(() => {
    onAddToList(dailyFeatured);
  }, [onAddToList, dailyFeatured]);

  const handleViewDetails = React.useCallback(() => {
    onViewDetails(dailyFeatured);
  }, [onViewDetails, dailyFeatured]);

  return (
    <View style={styles.container}>
      {/* Contenedor con sombra */}
      <View style={styles.shadowContainer}>
        {/* Contenedor con borde redondeado y recorte */}
        <View style={styles.imageWrapper}>
          <ImageBackground
            source={{ uri: dailyFeatured.thumbnail_url }}
            style={styles.backgroundImage}
            resizeMode="cover"
          >
            {/* Capa de gradiente */}
            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.3)', 'rgba(0,0,0,0.8)']}
              style={styles.gradient}
            />

            {/* Contenido sobre la imagen */}
            <View style={styles.contentOverlay}>
              <Text style={styles.title} numberOfLines={2}>
                {dailyFeatured.title}
              </Text>

              {dailyFeatured.overview && (
                <Text style={styles.description} numberOfLines={3}>
                  {dailyFeatured.overview}
                </Text>
              )}

              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={styles.playButton}
                  onPress={handlePlay}
                  activeOpacity={0.8}
                >
                  <Ionicons name="play" size={20} color={Colors.netflix.black} />
                  <Text style={styles.playButtonText}>Reproducir</Text>
                </TouchableOpacity>

                {/* <TouchableOpacity
                  style={styles.listButton}
                  onPress={handleAddToList}
                  activeOpacity={0.8}
                >
                  <Ionicons name="add" size={20} color={Colors.netflix.white} />
                  <Text style={styles.listButtonText}>Mi lista</Text>
                </TouchableOpacity> */}

                <TouchableOpacity
                  style={styles.infoButton}
                  onPress={handleViewDetails}
                  activeOpacity={0.8}
                >
                  <Ionicons
                    name="information-circle-outline"
                    size={20}
                    color={Colors.netflix.white}
                  />
                  <Text style={styles.infoButtonText}>Más información</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ImageBackground>
        </View>
      </View>
    </View>
  );
});

export default HeroBanner;

const styles = StyleSheet.create({
  container: {
    height: screenHeight * 0.6,
    width: screenWidth,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    
  },
  shadowContainer: {
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 10,
    backgroundColor: 'transparent',
  },
  imageWrapper: {
    borderRadius: 20,
    overflow: 'hidden', // recorta las esquinas
  },
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
    elevation: 10
  },
  gradient: {
    ...StyleSheet.absoluteFillObject,
  },
  contentOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.netflix.white,
    textAlign: 'center',
    marginBottom: 10,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
  },
  description: {
    fontSize: 16,
    color: Colors.netflix.white,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 20,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 10,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  playButton: {
    backgroundColor: Colors.netflix.white,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 25,
    paddingVertical: 12,
    borderRadius: 6,
    gap: 8,
  },
  playButtonText: {
    color: Colors.netflix.black,
    fontSize: 16,
    fontWeight: 'bold',
  },
  listButton: {
    backgroundColor: 'rgba(109, 109, 110, 0.7)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 6,
    gap: 8,
  },
  listButtonText: {
    color: Colors.netflix.white,
    fontSize: 16,
    fontWeight: '500',
  },
  infoButton: {
    backgroundColor: 'rgba(109, 109, 110, 0.7)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 6,
    gap: 8,
  },
  infoButtonText: {
    color: Colors.netflix.white,
    fontSize: 16,
    fontWeight: '500',
  },
});