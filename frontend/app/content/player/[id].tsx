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
  Platform,
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
  const [isPlaying, setIsPlaying] = useState(Platform.OS === 'web' ? false : true);
  const [showControls, setShowControls] = useState(true);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isBuffering, setIsBuffering] = useState(false);
  const [unplayable, setUnplayable] = useState(false);
  // UI states for web controls
  const [showSettings, setShowSettings] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [showSubtitlesMenu, setShowSubtitlesMenu] = useState(false);
  const [volumeLevel, setVolumeLevel] = useState(1);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [muted, setMuted] = useState(false);
  const [selectedSubtitle, setSelectedSubtitle] = useState<string | null>(null);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  const [volumeBarWidth, setVolumeBarWidth] = useState(140);
  const videoRef = useRef<Video | null>(null);
  const controlsTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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

  useEffect(() => {
    const isPlayableWeb = (u?: string) => {
      if (!u) return false;
      const hasPlayableExt = /(\.mp4|\.webm|\.m3u8)(\?|$)/i.test(u);
      const isStreamingEndpoint = /\/api\/stream\/mp4/i.test(u);
      return hasPlayableExt || isStreamingEndpoint;
    };
    const fallbackUrl = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';
    const urlToCheck = content?.video_url ? String(content.video_url) : fallbackUrl;
    setUnplayable(!isPlayableWeb(urlToCheck));
  }, [content]);
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

      const rawId = String(id);
      let contentData: Content | null = null;

      const isTmdbId = /^\d+$/.test(rawId) || rawId.startsWith('tmdb-');
      if (isTmdbId) {
        const numericId = rawId.startsWith('tmdb-') ? parseInt(rawId.replace('tmdb-', '')) : parseInt(rawId);
        contentData = await tmdbContentService.getContentDetails(numericId);
      } else if (rawId.startsWith('local-')) {
        const numericLocalId = parseInt(rawId.replace('local-', ''));
        const localContent = await tmdbContentService.getLocalContent();
        contentData = localContent.find(item => item.id === numericLocalId) || null;
      }

      if (!contentData) {
        throw new Error('Contenido no encontrado');
      }

      setContent(contentData);

      if (episodeId && season) {
        // Por ahora no manejamos episodios específicos con TMDB
      }

      await tmdbContentService.updateProgress(
        profile.id,
        contentData.id,
        0,
        episodeId ? parseInt(String(episodeId)) : undefined
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
    setShowMoreMenu(false);
    setShowSettings(false);
    setShowSubtitlesMenu(false);
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
  // Volume, mute, speed and download handlers (web)
  const toggleMute = async () => {
    const next = !muted;
    setMuted(next);
    try { await videoRef.current?.setIsMutedAsync(next); } catch (e) { /* noop */ }
  };
  const changeVolume = async (delta: number) => {
    const next = Math.min(1, Math.max(0, volumeLevel + delta));
    setVolumeLevel(next);
    try { await videoRef.current?.setVolumeAsync(next); } catch (e) { /* noop */ }
  };
  const updateVolumeFromPosition = async (x: number) => {
    const ratio = Math.min(1, Math.max(0, x / volumeBarWidth));
    setVolumeLevel(ratio);
    setMuted(ratio === 0);
    try {
      await videoRef.current?.setVolumeAsync(ratio);
      await videoRef.current?.setIsMutedAsync(ratio === 0);
    } catch (e) { /* noop */ }
  };
  const selectSpeed = async (rate: number) => {
    setPlaybackRate(rate);
    try { await videoRef.current?.setRateAsync(rate, true); } catch (e) { /* noop */ }
  };
  const handleDownload = () => {
    if (Platform.OS === 'web' && content?.video_url) {
      const a = document.createElement('a');
      a.href = String(content.video_url);
      a.download = '';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  const handlePlaybackStatusUpdate = async (status: any) => {
    if (status.isLoaded) {
      setPosition(status.positionMillis || 0);
      setDuration(status.durationMillis || 0);
      setIsBuffering(status.isBuffering || false);
      setMuted(status.isMuted || false);
      setIsPlaying(Boolean(status.isPlaying));
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
  const isPlayableWeb = (u?: string) => {
    if (!u) return false;
    const hasPlayableExt = /(\.mp4|\.webm|\.m3u8)(\?|$)/i.test(u);
    const isStreamingEndpoint = /\/api\/stream\/mp4/i.test(u);
    return hasPlayableExt || isStreamingEndpoint;
  };
  // Siempre prioriza la URL del contenido seleccionado; usa muestra solo si falta.
  const videoUrl = content?.video_url
    ? String(content.video_url)
    : 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';

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
          useNativeControls={Platform.OS !== 'web'}
          resizeMode={Platform.OS === 'web' ? ResizeMode.CONTAIN : ResizeMode.COVER}
          isLooping={false}
          shouldPlay={isPlaying}
          onPlaybackStatusUpdate={async (status: any) => {
            if (status.isLoaded) {
              setPosition(status.positionMillis || 0);
              setDuration(status.durationMillis || 0);
              setIsBuffering(status.isBuffering || false);
              setMuted(status.isMuted || false);
            }
            await handlePlaybackStatusUpdate(status);
          }}
          onError={(err) => {
            console.error('Video playback error', err);
            setUnplayable(true);
            setIsBuffering(false);
            Alert.alert('Error de reproducción', 'Este formato no puede reproducirse en web.');
          }}
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
                    T{season}:E{episode} - {currentEpisode.name}
                  </Text>
                )}
              </View>

              <TouchableOpacity style={styles.settingsButton} onPress={() => { setShowSubtitlesMenu(!showSubtitlesMenu); setShowMoreMenu(false); }}>
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
                  size={64}
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
                <TouchableOpacity
                  style={styles.controlButton}
                  onPress={() => { setShowVolumeSlider(v => !v); setShowMoreMenu(false); setShowSubtitlesMenu(false); }}
                >
                  <Ionicons name={muted ? 'volume-mute' : 'volume-high'} size={20} color={Colors.netflix.white} />
                </TouchableOpacity>

                {showVolumeSlider && (
                  <View
                    style={styles.volumeSlider}
                    onLayout={(e) => setVolumeBarWidth(e.nativeEvent.layout.width)}
                    onStartShouldSetResponder={() => true}
                    onResponderGrant={(e) => { updateVolumeFromPosition(e.nativeEvent.locationX); }}
                    onResponderMove={(e) => { updateVolumeFromPosition(e.nativeEvent.locationX); }}
                  >
                    <View style={styles.volumeTrack} />
                    <View style={[styles.volumeFill, { width: `${volumeLevel * 100}%` }]} />
                    <View style={[styles.volumeHandle, { left: (volumeLevel * volumeBarWidth) - 6 }]} />
                  </View>
                )}

                <TouchableOpacity style={styles.controlButton} onPress={() => setShowMoreMenu(!showMoreMenu)}>
                  <Ionicons name="ellipsis-vertical" size={20} color={Colors.netflix.white} />
                </TouchableOpacity>
              </View>
            </View>

            {/* More Menu */}
            {showMoreMenu && (
              <View style={styles.menu}>
                <Text style={styles.menuTitle}>Opciones</Text>
                <TouchableOpacity style={styles.menuItem} onPress={handleDownload}>
                  <Ionicons name="download-outline" size={18} color={Colors.netflix.white} />
                  <Text style={styles.menuItemText}>Descargar</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.menuItem} onPress={() => {}}>
                  <Ionicons name="speedometer-outline" size={18} color={Colors.netflix.white} />
                  <Text style={styles.menuItemText}>Velocidad ({playbackRate}x)</Text>
                </TouchableOpacity>
                <View style={styles.subMenu}>
                  { [0.5, 1, 1.25, 1.5, 2].map((r) => (
                    <TouchableOpacity key={r} style={styles.menuItem} onPress={() => selectSpeed(r)}>
                      <Text style={styles.menuItemText}>{`${r}x`}</Text>
                    </TouchableOpacity>
                  )) }
                </View>
              </View>
            )}

            {/* Subtitles Menu */}
            {showSubtitlesMenu && (
              <View style={[styles.menu, { left: 20, top: 80, right: undefined }] }>
                <Text style={styles.menuTitle}>Subtítulos</Text>
                { ['Español', 'Inglés', 'Sin subtítulos'].map((lang) => (
                  <TouchableOpacity key={lang} style={styles.menuItem} onPress={() => setSelectedSubtitle(lang === 'Sin subtítulos' ? null : lang)}>
                    <Text style={styles.menuItemText}>{lang}</Text>
                  </TouchableOpacity>
                )) }
                <Text style={styles.menuHint}>Se aplican cuando haya pistas VTT disponibles.</Text>
              </View>
            )}
          </View>
        )}

        {/* Warning for unsupported formats on web */}
        {unplayable && (
          <View style={styles.warningBanner}>
            <Text style={styles.warningText}>
              Formato del video no compatible en web. Usa MP4/M3U8.
            </Text>
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
    width: '100%',
    height: '100%'
  },
  video: {
    width: '100%',
    height: '100%',
    backgroundColor: Colors.netflix.black,
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
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
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
  volumeSlider: {
    width: 140,
    height: 20,
    marginLeft: 6,
    position: 'relative',
    justifyContent: 'center',
  },
  volumeTrack: {
    position: 'absolute',
    top: 8,
    left: 0,
    right: 0,
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 2,
  },
  volumeFill: {
    position: 'absolute',
    top: 8,
    left: 0,
    height: 4,
    backgroundColor: Colors.netflix.white,
    borderRadius: 2,
  },
  volumeHandle: {
    position: 'absolute',
    top: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.netflix.white,
  },
  menu: {
    position: 'absolute',
    right: 20,
    top: 80,
    backgroundColor: 'rgba(0,0,0,0.8)',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    minWidth: 160,
  },
  menuTitle: {
    color: Colors.netflix.white,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 6,
  },
  menuItemText: {
    color: Colors.netflix.white,
  },
  subMenu: {
    marginTop: 6,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.2)',
    paddingTop: 6,
  },
  menuHint: {
    marginTop: 6,
    color: Colors.netflix.lightGray,
    fontSize: 12,
  },
  warningBanner: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(255, 0, 0, 0.8)',
    alignItems: 'center',
  },
  warningText: {
    color: Colors.netflix.white,
    fontSize: 12,
    textAlign: 'center',
  },
});