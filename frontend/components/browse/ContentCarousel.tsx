import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

import { Colors } from '../../constants/theme';
import type { Content, ContinueWatchingItem } from '../../services/tmdbContent';

const { width: screenWidth } = Dimensions.get('window');
const ITEM_WIDTH = screenWidth * 0.32;
const ITEM_HEIGHT = ITEM_WIDTH * 1.5;

interface ContentCarouselProps {
  title: string;
  data: Content[] | ContinueWatchingItem[];
  onItemPress?: (item: Content | ContinueWatchingItem) => void;
  showProgress?: boolean;
}

const ContentCarousel = React.memo(function ContentCarousel({
  title,
  data,
  onItemPress,
  showProgress = false
}: ContentCarouselProps) {

  const handleItemPress = React.useCallback((item: Content | ContinueWatchingItem) => {
    if (showProgress && onItemPress) {
      // Para "Continuar viendo", usar el callback original (reproducir directamente)
      onItemPress(item);
    } else {
      // Para otros carruseles, navegar a detalles con tipo de contenido
      router.push({
        pathname: '/content/details/[id]',
        params: { 
          id: `tmdb-${item.id}`,
          type: item.type // Pasar el tipo de contenido (movie/series)
        }
      });
    }
  }, [showProgress, onItemPress]);

  const renderProgressBar = React.useCallback((item: ContinueWatchingItem) => {
    if (!showProgress || !('progress_seconds' in item)) return null;

    const progressPercentage = Math.min(
      (item.progress_seconds / (item.duration_minutes ? item.duration_minutes * 60 : 1)) * 100,
      100
    );

    return (
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              { width: `${progressPercentage}%` }
            ]}
          />
        </View>
      </View>
    );
  }, [showProgress]);

  const renderContentItem = React.useCallback((item: Content | ContinueWatchingItem, index: number) => {
    const isFirstItem = index === 0;
    const isLastItem = index === data.length - 1;

    return (
      <TouchableOpacity
        key={`${title}-${item.id}-${index}`}
        style={[
          styles.contentItem,
          isFirstItem && styles.firstItem,
          isLastItem && styles.lastItem,
        ]}
        onPress={() => handleItemPress(item)}
        activeOpacity={0.8}
      >
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: item.thumbnail_url }}
            style={styles.contentImage}
            resizeMode="cover"
          />

          {/* Play overlay for continue watching */}
          {showProgress && (
            <View style={styles.playOverlay}>
              <View style={styles.playButton}>
                <Ionicons name="play" size={16} color={Colors.netflix.black} />
              </View>
            </View>
          )}

          {/* Content type indicator */}
          <View style={styles.typeIndicator}>
            <Text style={styles.typeText}>
              {item.type === 'series' ? 'SERIE' : 'PELÍCULA'}
            </Text>
          </View>
        </View>

        {/* Progress bar for continue watching */}
        {renderProgressBar(item as ContinueWatchingItem)}

        {/* Content info */}
        <View style={styles.contentInfo}>
          <Text style={styles.contentTitle} numberOfLines={2}>
            {item.title}
          </Text>

          {showProgress && 'episode_title' in item && item.episode_title && (
            <Text style={styles.episodeInfo} numberOfLines={1}>
              T{item.season_number}:E{item.episode_number} {item.episode_title}
            </Text>
          )}
        </View>
      </TouchableOpacity>
    );
  }, [title, data.length, handleItemPress, showProgress, renderProgressBar]);

  if (!data || data.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>{title}</Text>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        decelerationRate="fast"
        snapToInterval={ITEM_WIDTH + 8}
        snapToAlignment="start"
      >
        {data.map((item, index) => renderContentItem(item, index))}
      </ScrollView>
    </View>
  );
});

export default ContentCarousel;

const styles = StyleSheet.create({
  container: {
    marginBottom: 35,
  },
  sectionTitle: {
    color: Colors.netflix.white,
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 18,
    marginLeft: 20,
  },
  scrollContent: {
    paddingLeft: 20,
  },
  contentItem: {
    width: ITEM_WIDTH,
    marginRight: 12,
  },
  firstItem: {
    marginLeft: 0,
  },
  lastItem: {
    marginRight: 20,
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    height: ITEM_HEIGHT,
    borderRadius: 4,
    overflow: 'hidden',
  },
  contentImage: {
    width: '100%',
    height: '100%',
  },
  playOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.netflix.white,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  typeIndicator: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 2,
  },
  typeText: {
    color: Colors.netflix.white,
    fontSize: 10,
    fontWeight: 'bold',
  },
  progressContainer: {
    marginTop: 4,
  },
  progressBar: {
    height: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 1.5,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.netflix.red,
    borderRadius: 1.5,
  },
  contentInfo: {
    marginTop: 8,
  },
  contentTitle: {
    color: Colors.netflix.white,
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 18,
  },
  episodeInfo: {
    color: Colors.netflix.lightGray,
    fontSize: 12,
    marginTop: 2,
  },
});