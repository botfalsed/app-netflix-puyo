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
      <ImageBackground
        source={{ uri: dailyFeatured.thumbnail_url }}
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        {/* Gradient overlay */}
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.3)', 'rgba(0,0,0,0.8)']}
          style={styles.gradient}
        />
        
        {/* Content overlay */}
        <View style={styles.contentOverlay}>
          <View style={styles.contentInfo}>
            <Text style={styles.title} numberOfLines={2}>
              {dailyFeatured.title}
            </Text>
            
            {dailyFeatured.overview && (
              <Text style={styles.description} numberOfLines={3}>
                {dailyFeatured.overview}
              </Text>
            )}
            
            {/* Action buttons */}
            <View style={styles.buttonContainer}>
              <TouchableOpacity 
                style={styles.playButton}
                onPress={handlePlay}
                activeOpacity={0.8}
              >
                <Ionicons name="play" size={20} color={Colors.netflix.black} />
                <Text style={styles.playButtonText}>Reproducir</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.listButton}
                onPress={handleAddToList}
                activeOpacity={0.8}
              >
                <Ionicons name="add" size={20} color={Colors.netflix.white} />
                <Text style={styles.listButtonText}>Mi lista</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.infoButton}
                onPress={handleViewDetails}
                activeOpacity={0.8}
              >
                <Ionicons name="information-circle-outline" size={20} color={Colors.netflix.white} />
                <Text style={styles.infoButtonText}>Más información</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ImageBackground>
    </View>
  );
});

export default HeroBanner;

const styles = StyleSheet.create({
  container: {
    height: screenHeight * 0.6,
    width: screenWidth,
  },
  backgroundImage: {
    flex: 1,
    width: '100%',
  },
  gradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  contentOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  contentInfo: {
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.netflix.white,
    textAlign: 'center',
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    color: Colors.netflix.white,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 20,
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