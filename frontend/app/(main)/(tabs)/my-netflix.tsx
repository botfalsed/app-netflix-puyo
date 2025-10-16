import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Image,
  Switch,
  Alert,
  Modal,
  FlatList,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

import { Colors } from '../../../constants/theme';
import { getActiveProfile, clearActiveProfile } from '../../../services/profiles';
import { clearToken } from '../../../services/token';
import { tmdbContentService } from '../../../services/tmdbContent';
import type { Profile } from '../../../types';
import type { Content } from '../../../types';

const { width } = Dimensions.get('window');
const ITEM_WIDTH = (width - 60) / 3;

interface SettingItem {
  id: string;
  title: string;
  subtitle?: string;
  icon: string;
  type: 'navigation' | 'switch' | 'action';
  value?: boolean;
  onPress?: () => void;
  onToggle?: (value: boolean) => void;
}

export default function MyNetflixScreen() {
  const [activeProfile, setActiveProfile] = useState<Profile | null>(null);
  const [watchlist, setWatchlist] = useState<Content[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [autoDownload, setAutoDownload] = useState(false);
  const [cellularDownload, setCellularDownload] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const profile = await getActiveProfile();
      setActiveProfile(profile);

      if (profile) {
        const watchlistData = await tmdbContentService.getWatchlist(profile.id);
        setWatchlist(watchlistData);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFromWatchlist = async (movieId: number) => {
    if (!activeProfile) return;

    try {
      await tmdbContentService.removeFromWatchlist(activeProfile.id, movieId);
      setWatchlist(prev => prev.filter(item => item.id !== movieId));
    } catch (error) {
      console.error('Error removing from watchlist:', error);
      Alert.alert('Error', 'No se pudo eliminar de Mi Lista');
    }
  };

  const handleSignOut = () => {
    Alert.alert(
      'Cerrar sesión',
      '¿Estás seguro de que quieres cerrar sesión?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Cerrar sesión',
          style: 'destructive',
          onPress: async () => {
            try {
              await clearActiveProfile();
              clearToken(); // Clear authentication token
              router.replace('/auth/login');
            } catch (error) {
              console.error('Error signing out:', error);
            }
          },
        },
      ]
    );
  };

  const settingsItems: SettingItem[] = [
    {
      id: 'notifications',
      title: 'Notificaciones',
      subtitle: 'Recibe alertas sobre nuevo contenido',
      icon: 'notifications-outline',
      type: 'switch',
      value: notifications,
      onToggle: setNotifications,
    },
    {
      id: 'auto-download',
      title: 'Descarga automática',
      subtitle: 'Descarga episodios automáticamente',
      icon: 'download-outline',
      type: 'switch',
      value: autoDownload,
      onToggle: setAutoDownload,
    },
    {
      id: 'cellular-download',
      title: 'Descargas con datos móviles',
      subtitle: 'Permitir descargas usando datos móviles',
      icon: 'cellular-outline',
      type: 'switch',
      value: cellularDownload,
      onToggle: setCellularDownload,
    },
    {
      id: 'video-quality',
      title: 'Calidad de video',
      subtitle: 'Automática',
      icon: 'videocam-outline',
      type: 'navigation',
      onPress: () => console.log('Navigate to video quality settings'),
    },
    {
      id: 'audio-language',
      title: 'Idioma de audio',
      subtitle: 'Español',
      icon: 'volume-high-outline',
      type: 'navigation',
      onPress: () => console.log('Navigate to audio language settings'),
    },
    {
      id: 'subtitles',
      title: 'Subtítulos',
      subtitle: 'Español',
      icon: 'text-outline',
      type: 'navigation',
      onPress: () => console.log('Navigate to subtitle settings'),
    },
    {
      id: 'parental-controls',
      title: 'Control parental',
      subtitle: 'Gestionar restricciones de contenido',
      icon: 'shield-outline',
      type: 'navigation',
      onPress: () => console.log('Navigate to parental controls'),
    },
    {
      id: 'privacy',
      title: 'Privacidad',
      subtitle: 'Gestionar datos y privacidad',
      icon: 'lock-closed-outline',
      type: 'navigation',
      onPress: () => console.log('Navigate to privacy settings'),
    },
    {
      id: 'help',
      title: 'Ayuda',
      subtitle: 'Centro de ayuda y soporte',
      icon: 'help-circle-outline',
      type: 'navigation',
      onPress: () => console.log('Navigate to help center'),
    },
    {
      id: 'about',
      title: 'Acerca de',
      subtitle: 'Versión 1.0.0',
      icon: 'information-circle-outline',
      type: 'navigation',
      onPress: () => {
        Alert.alert(
          'Netflix Clone',
          'Versión 1.0.0\n\nUna aplicación de streaming desarrollada con React Native y Expo.',
          [{ text: 'OK' }]
        );
      },
    },
  ];

  const renderWatchlistItem = ({ item }: { item: Content }) => (
    <TouchableOpacity
      style={styles.watchlistItem}
      onPress={() => router.push({
        pathname: '/content/details/[id]',
        params: { 
          id: `tmdb-${item.id}`,
          type: item.type // Pasar el tipo de contenido (movie/series)
        }
      })}
      activeOpacity={0.8}
    >
      <Image
        source={{ uri: item.poster_url }}
        style={styles.watchlistPoster}
        resizeMode="cover"
      />
      <TouchableOpacity
        style={styles.removeButton}
        onPress={() => handleRemoveFromWatchlist(item.id)}
        activeOpacity={0.7}
      >
        <Ionicons name="close-circle" size={24} color={Colors.netflix.red} />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const renderSettingItem = (item: SettingItem) => (
    <TouchableOpacity
      key={item.id}
      style={styles.settingItem}
      onPress={item.onPress}
      disabled={item.type === 'switch'}
      activeOpacity={0.7}
    >
      <View style={styles.settingIcon}>
        <Ionicons name={item.icon as any} size={24} color={Colors.netflix.white} />
      </View>

      <View style={styles.settingContent}>
        <Text style={styles.settingTitle}>{item.title}</Text>
        {item.subtitle && (
          <Text style={styles.settingSubtitle}>{item.subtitle}</Text>
        )}
      </View>

      {item.type === 'switch' && (
        <Switch
          value={item.value}
          onValueChange={item.onToggle}
          trackColor={{
            false: Colors.netflix.darkGray,
            true: Colors.netflix.red,
          }}
          thumbColor={Colors.netflix.white}
        />
      )}

      {item.type === 'navigation' && (
        <Ionicons
          name="chevron-forward"
          size={20}
          color={Colors.netflix.lightGray}
        />
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Mi Netflix</Text>
          <TouchableOpacity
            style={styles.settingsButton}
            onPress={() => setShowSettingsModal(true)}
            activeOpacity={0.7}
          >
            <Ionicons name="settings-outline" size={24} color={Colors.netflix.white} />
          </TouchableOpacity>
        </View>

        {/* Profile Section */}
        {activeProfile && (
          <View style={styles.profileSection}>
            <TouchableOpacity
              style={styles.profileHeader}
              onPress={() => router.push('/auth/profiles')}
              activeOpacity={0.8}
            >
              <Image
                source={{ uri: activeProfile.avatar_url }}
                style={styles.profileAvatar}
                resizeMode="cover"
              />
              <View style={styles.profileInfo}>
                <Text style={styles.profileName}>{activeProfile.name}</Text>
                <Text style={styles.profileSubtitle}>Cambiar perfil</Text>
              </View>
              <Ionicons
                name="chevron-forward"
                size={20}
                color={Colors.netflix.lightGray}
              />
            </TouchableOpacity>
          </View>
        )}

        {/* Mi Lista Section */}
        <View style={styles.watchlistSection}>
          <Text style={styles.sectionTitle}>Mi Lista</Text>
          {loading ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Cargando...</Text>
            </View>
          ) : watchlist.length > 0 ? (
            <FlatList
              data={watchlist}
              renderItem={renderWatchlistItem}
              keyExtractor={(item) => item.id.toString()}
              numColumns={3}
              scrollEnabled={false}
              contentContainerStyle={styles.watchlistGrid}
            />
          ) : (
            <View style={styles.emptyContainer}>
              <Ionicons name="bookmark-outline" size={48} color={Colors.netflix.lightGray} />
              <Text style={styles.emptyTitle}>Tu lista está vacía</Text>
              <Text style={styles.emptySubtitle}>
                Agrega películas y series que quieras ver más tarde
              </Text>
            </View>
          )}
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* Settings Modal */}
      <Modal
        visible={showSettingsModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowSettingsModal(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Configuración</Text>
            <TouchableOpacity
              onPress={() => setShowSettingsModal(false)}
              style={styles.closeButton}
            >
              <Ionicons name="close" size={24} color={Colors.netflix.white} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            {settingsItems.map(renderSettingItem)}

            {/* Sign Out Button */}
            <View style={styles.signOutSection}>
              <TouchableOpacity
                style={styles.signOutButton}
                onPress={handleSignOut}
                activeOpacity={0.8}
              >
                <Ionicons name="log-out-outline" size={24} color={Colors.netflix.red} />
                <Text style={styles.signOutText}>Cerrar sesión</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: Colors.netflix.darkGray,
  },
  headerTitle: {
    color: Colors.netflix.white,
    fontSize: 24,
    fontWeight: 'bold',
  },
  settingsButton: {
    padding: 8,
  },
  profileSection: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.netflix.darkGray,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileAvatar: {
    width: 50,
    height: 50,
    borderRadius: 8,
    marginRight: 15,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    color: Colors.netflix.white,
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  profileSubtitle: {
    color: Colors.netflix.lightGray,
    fontSize: 14,
  },
  watchlistSection: {
    padding: 20,
  },
  sectionTitle: {
    color: Colors.netflix.white,
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    color: Colors.netflix.lightGray,
    fontSize: 16,
  },
  watchlistGrid: {
    gap: 10,
  },
  watchlistItem: {
    width: ITEM_WIDTH,
    marginRight: 10,
    marginBottom: 15,
    position: 'relative',
  },
  watchlistPoster: {
    width: '100%',
    height: ITEM_WIDTH * 1.5,
    borderRadius: 8,
  },
  removeButton: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 12,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    color: Colors.netflix.white,
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 15,
    marginBottom: 8,
  },
  emptySubtitle: {
    color: Colors.netflix.lightGray,
    fontSize: 14,
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  bottomPadding: {
    height: 100,
  },
  // Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: Colors.netflix.black,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: Colors.netflix.darkGray,
  },
  modalTitle: {
    color: Colors.netflix.white,
    fontSize: 20,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 8,
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: Colors.netflix.darkGray,
  },
  settingIcon: {
    width: 40,
    alignItems: 'center',
    marginRight: 15,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    color: Colors.netflix.white,
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 2,
  },
  settingSubtitle: {
    color: Colors.netflix.lightGray,
    fontSize: 14,
  },
  signOutSection: {
    paddingVertical: 30,
    alignItems: 'center',
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: Colors.netflix.red,
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 6,
  },
  signOutText: {
    color: Colors.netflix.red,
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
  },
});