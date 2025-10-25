import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Image,
  Dimensions,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

import { Colors } from '../../../constants/theme';
import { tmdbContentService, type Content, type Episode } from '../../../services/tmdbContent';
import { getActiveProfile } from '../../../services/profiles';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export default function ContentDetailsScreen() {
  const { id, type } = useLocalSearchParams<{ id: string; type?: string }>();
  const [content, setContent] = useState<Content | null>(null);
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isInWatchlist, setIsInWatchlist] = useState(false);
  const [selectedSeason, setSelectedSeason] = useState(1);

  useEffect(() => {
    if (id) {
      loadContentDetails();
    }
  }, [id]);

  const loadContentDetails = async () => {
    try {
      setLoading(true);
      setError(null);

      // Check if it's a TMDB ID (numeric or with tmdb- prefix) or local ID (string)
      const isTmdbId = /^\d+$/.test(id) || id.startsWith('tmdb-');
      let contentData: Content | null = null;

      if (isTmdbId) {
        // It's a TMDB ID - extract the numeric part
        const numericId = id.startsWith('tmdb-') ? parseInt(id.replace('tmdb-', '')) : parseInt(id);
        contentData = await tmdbContentService.getContentDetails(numericId, type);
      } else {
        // It's a local ID, get from local content
        const localContent = await tmdbContentService.getLocalContent();
        contentData = localContent.find(item => item.id === Number(id)) || null;
      }

      if (!contentData) {
        setError('Contenido no encontrado');
        return;
      }

      setContent(contentData);

      // Check if content is in watchlist usando servicio TMDB
      const profile = await getActiveProfile();
      if (profile && contentData.type === 'movie') {
        const inList = await tmdbContentService.checkMovieInWatchlist(profile.id, contentData.id);
        setIsInWatchlist(inList);
      }

      // Load episodes if it's a series
      if (contentData.type === 'series') {
        const numericId = id.startsWith('tmdb-') ? parseInt(id.replace('tmdb-', '')) : parseInt(id);
        const seriesId = isTmdbId ? numericId : contentData.id;
        const episodesData = await tmdbContentService.getSeriesEpisodes(seriesId, selectedSeason);
        setEpisodes(episodesData);
      }
    } catch (error) {
      console.error('Error loading content details:', error);
      setError('Error al cargar el contenido');
    } finally {
      setLoading(false);
    }
  };

  const handlePlay = () => {
    if (content) {
      router.push(`/content/player/${content.id}`);
    }
  };

  const handleToggleWatchlist = async () => {
    if (!content) return;

    try {
      const profile = await getActiveProfile();
      if (!profile) return;

      if (content.type !== 'movie') {
        Alert.alert('Mi Lista', 'Por ahora solo se pueden agregar películas.');
        return;
      }

      if (isInWatchlist) {
        const ok = await tmdbContentService.removeFromWatchlist(profile.id, content.id);
        if (ok) {
          setIsInWatchlist(false);
          Alert.alert('Mi Lista', 'Se eliminó de tu lista');
        } else {
          Alert.alert('Mi Lista', 'No se pudo eliminar');
        }
      } else {
        const ok = await tmdbContentService.addToWatchlist(profile.id, content.id);
        if (ok) {
          setIsInWatchlist(true);
          Alert.alert('Mi Lista', 'Se agregó a tu lista');
        } else {
          Alert.alert('Mi Lista', 'No se pudo agregar');
        }
      }
    } catch (error) {
      console.error('Error updating watchlist:', error);
      Alert.alert('Error', 'No se pudo actualizar la lista');
    }
  };

  const handleDownload = () => {
    Alert.alert('Descargar', 'Función de descarga no implementada');
  };

  const handleShare = () => {
    Alert.alert('Compartir', 'Función de compartir no implementada');
  };

  const handlePlayEpisode = (episode: Episode) => {
    if (content) {
      router.push(`/content/player/${content.id}?episode=${episode.episode_number}&season=${episode.season_number}`);
    }
  };

  const renderEpisode = (episode: Episode, index: number) => (
    <TouchableOpacity
      key={`${episode.season_number}-${episode.episode_number}`}
      style={styles.episodeItem}
      onPress={() => handlePlayEpisode(episode)}
    >
      <View style={styles.episodeThumbnail}>
        <Image
          source={{ uri: episode.still_path }}
          style={styles.episodeThumbnail}
          resizeMode="cover"
        />
        <View style={styles.episodePlayOverlay}>
          <Ionicons name="play" size={16} color={Colors.netflix.white} />
        </View>
      </View>

      <View style={styles.episodeInfo}>
        <View style={styles.episodeHeader}>
          <Text style={styles.episodeNumber}>
            {episode.episode_number}. {episode.name}
          </Text>
          <Text style={styles.episodeDuration}>{episode.runtime}m</Text>
        </View>
        <Text style={styles.episodeDescription} numberOfLines={2}>
          {episode.overview}
        </Text>
      </View>

      <TouchableOpacity style={styles.episodeDownloadButton}>
        <Ionicons name="download-outline" size={20} color={Colors.netflix.white} />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.netflix.red} />
          <Text style={styles.loadingText}>Cargando contenido...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !content) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Contenido no encontrado</Text>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.push('/(main)/(tabs)')}
          >
            <Text style={styles.backButtonText}>Volver</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <Image
            source={{ uri: content.backdrop_url }}
            style={styles.backdropImage}
            resizeMode="cover"
          />
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.8)', Colors.netflix.black]}
            style={styles.heroGradient}
          />

          {/* Back Button */}
          <TouchableOpacity
            style={styles.headerBackButton}
            onPress={() => router.push('/(main)/(tabs)')}
          >
            <Ionicons name="arrow-back" size={24} color={Colors.netflix.white} />
          </TouchableOpacity>

          {/* Content Info */}
          <View style={styles.heroContent}>
            <Text style={styles.contentTitle}>{content.title}</Text>

            <View style={styles.contentMeta}>
              <Text style={styles.contentYear}>{content.release_year}</Text>
              <Text style={styles.contentRating}>{content.rating}</Text>
              <Text style={styles.contentDuration}>
                {content.type === 'series' ? `${content.seasons} temporadas` : `${content.duration_minutes ?? 0} min`}
              </Text>
            </View>

            <View style={styles.contentCategories}>
              {content.categories?.slice(0, 3).map((category, index) => (
                <Text key={index} style={styles.category}>
                  {category.name}
                  {index < (content.categories?.length || 0) - 1 && index < 2 ? ' • ' : ''}
                </Text>
              ))}
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.playButton} onPress={handlePlay}>
            <Ionicons name="play" size={20} color={Colors.netflix.black} />
            <Text style={styles.playButtonText}>Reproducir</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.secondaryButton} onPress={handleToggleWatchlist}>
            <Ionicons name={isInWatchlist ? 'checkmark' : 'add'} size={20} color={Colors.netflix.white} />
            <Text style={styles.secondaryButtonText}>{isInWatchlist ? 'En Mi Lista' : 'Mi Lista'}</Text>
          </TouchableOpacity>
        </View>

        {/* Description */}
        <View style={styles.descriptionSection}>
          <Text style={styles.description}>{content.description}</Text>
        </View>

        {/* Additional Actions */}
        <View style={styles.additionalActions}>
          <TouchableOpacity style={styles.actionItem} onPress={handleDownload}>
            <Ionicons name="download" size={20} color={Colors.netflix.white} />
            <Text style={styles.actionText}>Descargar</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionItem} onPress={handleShare}>
            <Ionicons name="share-outline" size={20} color={Colors.netflix.white} />
            <Text style={styles.actionText}>Compartir</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionItem}>
            <Ionicons name="information-circle-outline" size={20} color={Colors.netflix.white} />
            <Text style={styles.actionText}>Detalles</Text>
          </TouchableOpacity>
        </View>

        {/* Episodes */}
        {content.type === 'series' && (
          <View style={styles.episodesSection}>
            <View style={styles.episodesHeader}>
              <Text style={styles.episodesTitle}>Episodios</Text>
              <View style={styles.seasonSelector}>
                <Text style={styles.seasonText}>T{selectedSeason}</Text>
                <Ionicons name="chevron-down" size={16} color={Colors.netflix.white} />
              </View>
            </View>

            {episodes.map(renderEpisode)}
          </View>
        )}

        {/* Bottom Padding */}
        <View style={styles.bottomPadding} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.netflix.black,
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: Colors.netflix.white,
    fontSize: 16,
    marginTop: 10,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  errorText: {
    color: Colors.netflix.white,
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 20,
  },
  backButton: {
    backgroundColor: Colors.netflix.red,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 4,
  },
  backButtonText: {
    color: Colors.netflix.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  heroSection: {
    position: 'relative',
    height: screenHeight * 0.6,
  },
  backdropImage: {
    width: screenWidth,
    height: '100%',
  },
  heroGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '60%',
  },
  headerBackButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    zIndex: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 20,
    padding: 8,
  },
  heroContent: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
  },
  contentTitle: {
    color: Colors.netflix.white,
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  contentMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  contentYear: {
    color: Colors.netflix.lightGray,
    fontSize: 14,
    marginRight: 15,
  },
  contentRating: {
    color: Colors.netflix.lightGray,
    fontSize: 14,
    marginRight: 15,
    backgroundColor: Colors.netflix.darkGray,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 2,
  },
  contentDuration: {
    color: Colors.netflix.lightGray,
    fontSize: 14,
  },
  contentCategories: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  category: {
    color: Colors.netflix.white,
    fontSize: 14,
    fontWeight: '500',
  },
  actionButtons: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 20,
    gap: 10,
  },
  playButton: {
    flex: 1,
    backgroundColor: Colors.netflix.white,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 4,
  },
  playButtonText: {
    color: Colors.netflix.black,
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: Colors.netflix.darkGray,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 4,
  },
  secondaryButtonText: {
    color: Colors.netflix.white,
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  descriptionSection: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  description: {
    color: Colors.netflix.white,
    fontSize: 14,
    lineHeight: 20,
  },
  additionalActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: Colors.netflix.darkGray,
  },
  actionItem: {
    alignItems: 'center',
  },
  actionText: {
    color: Colors.netflix.white,
    fontSize: 12,
    marginTop: 5,
  },
  episodesSection: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  episodesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  episodesTitle: {
    color: Colors.netflix.white,
    fontSize: 18,
    fontWeight: 'bold',
  },
  seasonSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.netflix.darkGray,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  seasonText: {
    color: Colors.netflix.white,
    fontSize: 14,
    marginRight: 5,
  },
  episodeItem: {
    flexDirection: 'row',
    marginBottom: 15,
    backgroundColor: Colors.netflix.darkGray,
    borderRadius: 8,
    overflow: 'hidden',
  },
  episodeThumbnail: {
    width: 120,
    height: 68,
  },
  episodePlayOverlay: {
    position: 'absolute',
    top: 24,
    left: 50,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 15,
    padding: 8,
  },
  episodeInfo: {
    flex: 1,
    padding: 12,
  },
  episodeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 5,
  },
  episodeNumber: {
    color: Colors.netflix.white,
    fontSize: 14,
    fontWeight: 'bold',
    flex: 1,
    marginRight: 10,
  },
  episodeDuration: {
    color: Colors.netflix.lightGray,
    fontSize: 12,
  },
  episodeDescription: {
    color: Colors.netflix.lightGray,
    fontSize: 12,
    lineHeight: 16,
  },
  episodeDownloadButton: {
    padding: 15,
    justifyContent: 'center',
  },
  bottomPadding: {
    height: 100,
  },
});