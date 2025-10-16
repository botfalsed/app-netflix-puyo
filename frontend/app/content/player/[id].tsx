import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  StatusBar,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { Video, ResizeMode } from 'expo-av';
import * as ScreenOrientation from 'expo-screen-orientation';

import { Colors } from '../../../constants/theme';
import { tmdbContentService, type Content, type Episode } from '../../../services/tmdbContent';
import { getActiveProfile } from '../../../services/profiles';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export default function VideoPlayerScreen() {
  const { id, episodeId, season, episode } = useLocalSearchParams<{
    id: string;
    episodeId?: string;
    season?: string;
    episode?: string;
  }>();

  const [content, setContent] = useState<Content | null>(null);
  const [currentEpisode, setCurrentEpisode] = useState<Episode | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(true);
  const [showControls, setShowControls] = useState(true);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isBuffering, setIsBuffering] = useState(false);

  const videoRef = useRef<Video>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    loadContent();
    setupScreenOrientation();

    return () => {
      ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT);
    };
  }, []);

  useEffect(() => {
    if (showControls) {
      resetControlsTimeout();
    }
  }, [showControls]);

  const setupScreenOrientation = async () => {
    await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
  };

  const loadContent = async () => {
    try {
      setLoading(true);
      const profile = await getActiveProfile();

      if (!profile) {
        router.replace('/auth/profiles');
        return;
      }

      const contentData = await tmdbContentService.getContentDetails(parseInt(id!));
      setContent(contentData);

      // If it's an episode, load episode data
      if (episodeId && season) {
        // Por ahora no manejamos episodios específicos con TMDB
        // const episodes = await tmdbContentService.getEpisodes(contentData.id, parseInt(season));
        // const episodeData = episodes.find(ep => ep.id === parseInt(episodeId));
        // setCurrentEpisode(episodeData || null);
      }

      // Update viewing progress
      await tmdbContentService.updateProgress(
        profile.id,
        contentData.id,
        0, // Starting position
        episodeId ? parseInt(episodeId) : undefined
      );
    } catch (error) {
      console.error('Error loading content:', error);
      Alert.alert('Error', 'No se pudo cargar el contenido');
    } finally {
      setLoading(false);
    }
  };

  const resetControlsTimeout = () => {
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }

    controlsTimeoutRef.current = setTimeout(() => {
      setShowControls(false);
    }, 3000);
  };

  const toggleControls = () => {
    setShowControls(!showControls);
  };

  const togglePlayPause = async () => {
    if (videoRef.current) {
      if (isPlaying) {
        await videoRef.current.pauseAsync();
      } else {
        await videoRef.current.playAsync();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleSeek = async (seekPosition: number) => {
    if (videoRef.current && duration > 0) {
      const newPosition = (seekPosition * duration) / 100;
      await videoRef.current.setPositionAsync(newPosition);
      setPosition(newPosition);
    }
  };

  const handlePlaybackStatusUpdate = async (status: any) => {
    if (status.isLoaded) {
      setPosition(status.positionMillis || 0);
      setDuration(status.durationMillis || 0);
      setIsBuffering(status.isBuffering || false);

      // Update progress every 30 seconds
      if (status.positionMillis && status.durationMillis) {
        const progressPercent = (status.positionMillis / status.durationMillis) * 100;

        if (Math.floor(progressPercent) % 30 === 0) {
          try {
            const profile = await getActiveProfile();
            if (profile && content) {
              await tmdbContentService.updateProgress(
                profile.id,
                content.id,
                progressPercent,
                currentEpisode?.id
              );
            }
          } catch (error) {
            console.error('Error updating progress:', error);
          }
        }
      }
    }
  };

  const formatTime = (milliseconds: number) => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleBack = async () => {
    await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT);
    router.back();
  };

  const handleNext = () => {
    // Logic to play next episode
    Alert.alert('Próximo episodio', 'Funcionalidad de próximo episodio');
  };

  const handlePrevious = () => {
    // Logic to play previous episode
    Alert.alert('Episodio anterior', 'Funcionalidad de episodio anterior');
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.netflix.red} />
        <Text style={styles.loadingText}>Cargando video...</Text>
      </View>
    );
  }

  if (!content) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>No se pudo cargar el contenido</Text>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Text style={styles.backButtonText}>Volver</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Mock video URL - in a real app, this would come from the content data
  const videoUrl = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';

  return (
    <View style={styles.container}>
      <StatusBar hidden />

      <TouchableOpacity
        style={styles.videoContainer}
        onPress={toggleControls}
        activeOpacity={1}
      >
        <Video
          ref={videoRef}
          style={styles.video}
          source={{ uri: videoUrl }}
          useNativeControls={false}
          resizeMode={ResizeMode.CONTAIN}
          isLooping={false}
          shouldPlay={isPlaying}
          onPlaybackStatusUpdate={handlePlaybackStatusUpdate}
        />

        {/* Loading Overlay */}
        {isBuffering && (
          <View style={styles.bufferingOverlay}>
            <ActivityIndicator size="large" color={Colors.netflix.white} />
          </View>
        )}

        {/* Controls Overlay */}
        {showControls && (
          <View style={styles.controlsOverlay}>
            {/* Top Controls */}
            <View style={styles.topControls}>
              <TouchableOpacity style={styles.backButton} onPress={handleBack}>
                <Ionicons name="arrow-back" size={24} color={Colors.netflix.white} />
              </TouchableOpacity>

              <View style={styles.titleContainer}>
                <Text style={styles.contentTitle}>{content.title}</Text>
                {currentEpisode && (
                  <Text style={styles.episodeTitle}>
                    T{season}:E{episode} - {currentEpisode.title}
                  </Text>
                )}
              </View>

              <TouchableOpacity style={styles.settingsButton}>
                <Ionicons name="settings-outline" size={24} color={Colors.netflix.white} />
              </TouchableOpacity>
            </View>

            {/* Center Controls */}
            <View style={styles.centerControls}>
              <TouchableOpacity
                style={styles.controlButton}
                onPress={handlePrevious}
              >
                <Ionicons name="play-skip-back" size={32} color={Colors.netflix.white} />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.playPauseButton}
                onPress={togglePlayPause}
              >
                <Ionicons
                  name={isPlaying ? 'pause' : 'play'}
                  size={48}
                  color={Colors.netflix.white}
                />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.controlButton}
                onPress={handleNext}
              >
                <Ionicons name="play-skip-forward" size={32} color={Colors.netflix.white} />
              </TouchableOpacity>
            </View>

            {/* Bottom Controls */}
            <View style={styles.bottomControls}>
              <View style={styles.progressContainer}>
                <Text style={styles.timeText}>{formatTime(position)}</Text>

                <View style={styles.progressBar}>
                  <View style={styles.progressTrack} />
                  <View
                    style={[
                      styles.progressFill,
                      { width: `${duration > 0 ? (position / duration) * 100 : 0}%` }
                    ]}
                  />
                </View>

                <Text style={styles.timeText}>{formatTime(duration)}</Text>
              </View>

              <View style={styles.bottomRightControls}>
                <TouchableOpacity style={styles.controlButton}>
                  <Ionicons name="volume-high" size={20} color={Colors.netflix.white} />
                </TouchableOpacity>

                <TouchableOpacity style={styles.controlButton}>
                  <Ionicons name="expand" size={20} color={Colors.netflix.white} />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.netflix.black,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.netflix.black,
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
    backgroundColor: Colors.netflix.black,
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
  videoContainer: {
    flex: 1,
    position: 'relative',
  },
  video: {
    flex: 1,
  },
  bufferingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  controlsOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'space-between',
  },
  topControls: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 20,
  },
  titleContainer: {
    flex: 1,
    marginHorizontal: 20,
  },
  contentTitle: {
    color: Colors.netflix.white,
    fontSize: 18,
    fontWeight: 'bold',
  },
  episodeTitle: {
    color: Colors.netflix.lightGray,
    fontSize: 14,
    marginTop: 2,
  },
  settingsButton: {
    padding: 5,
  },
  centerControls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 40,
  },
  controlButton: {
    padding: 10,
  },
  playPauseButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 40,
    padding: 20,
  },
  bottomControls: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 40,
    paddingTop: 20,
  },
  progressContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
  },
  timeText: {
    color: Colors.netflix.white,
    fontSize: 12,
    minWidth: 40,
    textAlign: 'center',
  },
  progressBar: {
    flex: 1,
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 2,
    marginHorizontal: 10,
    position: 'relative',
  },
  progressTrack: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 2,
  },
  progressFill: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    backgroundColor: Colors.netflix.red,
    borderRadius: 2,
  },
  bottomRightControls: {
    flexDirection: 'row',
    gap: 10,
  },
});