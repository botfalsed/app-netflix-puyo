import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

import { Colors } from '../../../constants/theme';
import { contentService, type Content } from '../../../services/content';

interface DownloadedContent extends Content {
  download_date: string;
  file_size: string;
  download_quality: 'standard' | 'high' | 'ultra';
  progress?: number; // For ongoing downloads
  status: 'completed' | 'downloading' | 'paused' | 'error';
}

export default function DownloadsScreen() {
  const [downloads, setDownloads] = useState<DownloadedContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalStorage, setTotalStorage] = useState('2.1 GB');
  const [availableStorage, setAvailableStorage] = useState('15.3 GB');

  useEffect(() => {
    loadDownloads();
  }, []);

  const loadDownloads = async () => {
    try {
      setLoading(true);
      // Simulate downloaded content with mock data
      // In a real app, this would come from local storage or a downloads API
      const mockDownloads: DownloadedContent[] = [
        {
          id: 1,
          title: 'Stranger Things',
          description: 'Una serie de ciencia ficción y terror sobrenatural.',
          thumbnail_url: 'https://image.tmdb.org/t/p/w500/49WJfeN0moxb9IPfGn8AIqMGskD.jpg',
          backdrop_url: 'https://image.tmdb.org/t/p/w1280/56v2KjBlU4XaOv9rVYEQypROD7P.jpg',
          type: 'series',
          genre: 'Ciencia ficción',
          release_year: 2016,
          rating: '8.7',
          duration_minutes: 51,
          seasons: 4,
          video_url: '',
          trailer_url: '',
          is_featured: false,
          categories: [{ id: 101, name: 'Ciencia ficción' }],
          created_at: new Date().toISOString(),
          download_date: getRandomPastDate(),
          file_size: '2.1 GB',
          download_quality: 'high',
          status: 'completed' as const,
        },
        {
          id: 2,
          title: 'The Witcher',
          description: 'Un cazador de monstruos lucha por encontrar su lugar en un mundo.',
          thumbnail_url: 'https://image.tmdb.org/t/p/w500/7vjaCdMw15FEbXyLQTVa04URsPm.jpg',
          backdrop_url: 'https://image.tmdb.org/t/p/w1280/wmN8aTqNhJuCqOTX6b6l8lCJOKx.jpg',
          type: 'series',
          genre: 'Fantasía',
          release_year: 2019,
          rating: '8.2',
          duration_minutes: 60,
          seasons: 3,
          video_url: '',
          trailer_url: '',
          is_featured: false,
          categories: [{ id: 102, name: 'Fantasía' }],
          created_at: new Date().toISOString(),
          download_date: getRandomPastDate(),
          file_size: '1.8 GB',
          download_quality: 'ultra',
          status: 'completed' as const,
        },
        {
          id: 3,
          title: 'Extraction',
          description: 'Un mercenario de operaciones encubiertas debe rescatar al hijo secuestrado.',
          thumbnail_url: 'https://image.tmdb.org/t/p/w500/wlfDxbGEsW58vGhFljKkcR5IxDj.jpg',
          backdrop_url: 'https://image.tmdb.org/t/p/w1280/umC04Cozevu8nn3JTDJ1pc7PVTn.jpg',
          type: 'movie',
          genre: 'Acción',
          release_year: 2020,
          rating: '6.7',
          duration_minutes: 116,
          video_url: '',
          trailer_url: '',
          is_featured: false,
          categories: [{ id: 103, name: 'Acción' }],
          created_at: new Date().toISOString(),
          download_date: getRandomPastDate(),
          file_size: '1.5 GB',
          download_quality: 'standard',
          status: 'completed' as const,
        },
        {
          id: 4,
          title: 'Money Heist',
          description: 'Un grupo de ladrones planea el atraco perfecto.',
          thumbnail_url: 'https://image.tmdb.org/t/p/w500/reEMJA1uzscCbkpeRJeTT2bjqUp.jpg',
          backdrop_url: 'https://image.tmdb.org/t/p/w1280/xGexTKCJJVSx4bUIH0P7cGhfgp2.jpg',
          type: 'series',
          genre: 'Drama',
          release_year: 2017,
          rating: '8.3',
          duration_minutes: 70,
          seasons: 5,
          video_url: '',
          trailer_url: '',
          is_featured: false,
          categories: [{ id: 104, name: 'Drama' }],
          created_at: new Date().toISOString(),
          download_date: new Date().toISOString(),
          file_size: '1.2 GB',
          download_quality: 'high',
          status: 'downloading' as const,
          progress: 65,
        },
      ];

      setDownloads(mockDownloads);
    } catch (error) {
      console.error('Error loading downloads:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRandomPastDate = () => {
    const today = new Date();
    const pastDate = new Date(today);
    pastDate.setDate(today.getDate() - Math.floor(Math.random() * 30));
    return pastDate.toISOString();
  };

  const getRandomFileSize = () => {
    const sizes = ['850 MB', '1.2 GB', '2.1 GB', '1.8 GB', '950 MB'];
    return sizes[Math.floor(Math.random() * sizes.length)];
  };

  const formatDownloadDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const diffTime = today.getTime() - date.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Hoy';
    if (diffDays === 1) return 'Ayer';
    if (diffDays < 7) return `Hace ${diffDays} días`;
    
    return date.toLocaleDateString('es-ES', { 
      day: 'numeric', 
      month: 'short'
    });
  };

  const getQualityLabel = (quality: string) => {
    switch (quality) {
      case 'standard': return 'Estándar';
      case 'high': return 'Alta';
      case 'ultra': return 'Ultra';
      default: return 'Estándar';
    }
  };

  const handleDeleteDownload = (item: DownloadedContent) => {
    Alert.alert(
      'Eliminar descarga',
      `¿Estás seguro de que quieres eliminar "${item.title}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => {
            setDownloads(prev => prev.filter(d => d.id !== item.id));
          },
        },
      ]
    );
  };

  const handlePlayDownload = (item: DownloadedContent) => {
    if (item.status === 'completed') {
      router.push({
        pathname: '/content/details/[id]',
        params: { id: `tmdb-${item.id}` }
      });
    }
  };

  const handlePauseResume = (item: DownloadedContent) => {
    setDownloads(prev => prev.map(d => 
      d.id === item.id 
        ? { ...d, status: d.status === 'downloading' ? 'paused' : 'downloading' }
        : d
    ));
  };

  const renderDownloadItem = (item: DownloadedContent) => (
    <View key={item.id} style={styles.downloadItem}>
      <TouchableOpacity
        onPress={() => handlePlayDownload(item)}
        disabled={item.status !== 'completed'}
        activeOpacity={0.8}
      >
        <Image
          source={{ uri: item.thumbnail_url }}
          style={styles.thumbnail}
          resizeMode="cover"
        />
        {item.status === 'completed' && (
          <View style={styles.playOverlay}>
            <Ionicons name="play" size={24} color={Colors.netflix.white} />
          </View>
        )}
        {item.status === 'downloading' && item.progress && (
          <View style={styles.progressOverlay}>
            <View style={[styles.progressBar, { width: `${item.progress}%` }]} />
            <Text style={styles.progressText}>{item.progress}%</Text>
          </View>
        )}
      </TouchableOpacity>

      <View style={styles.downloadInfo}>
        <Text style={styles.downloadTitle} numberOfLines={2}>
          {item.title}
        </Text>
        
        <View style={styles.downloadMeta}>
          <Text style={styles.downloadDate}>
            {item.status === 'completed' 
              ? formatDownloadDate(item.download_date)
              : 'Descargando...'
            }
          </Text>
          <Text style={styles.downloadSize}>{item.file_size}</Text>
          <Text style={styles.downloadQuality}>
            {getQualityLabel(item.download_quality)}
          </Text>
        </View>

        {item.status === 'downloading' && (
          <View style={styles.downloadControls}>
            <TouchableOpacity
              style={styles.controlButton}
              onPress={() => handlePauseResume(item)}
            >
              <Ionicons
                name={item.status === 'downloading' ? 'pause' : 'play'}
                size={16}
                color={Colors.netflix.white}
              />
            </TouchableOpacity>
          </View>
        )}
      </View>

      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => handleDeleteDownload(item)}
      >
        <Ionicons name="trash-outline" size={20} color={Colors.netflix.lightGray} />
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.netflix.red} />
          <Text style={styles.loadingText}>Cargando descargas...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Mis descargas</Text>
        <TouchableOpacity style={styles.settingsButton}>
          <Ionicons name="settings-outline" size={24} color={Colors.netflix.white} />
        </TouchableOpacity>
      </View>

      {downloads.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="download-outline" size={64} color={Colors.netflix.darkGray} />
          <Text style={styles.emptyTitle}>No tienes descargas</Text>
          <Text style={styles.emptyText}>
            Descarga series y películas para verlas sin conexión
          </Text>
          <TouchableOpacity
            style={styles.browseButton}
            onPress={() => router.push('/(main)/(tabs)/')}
          >
            <Text style={styles.browseButtonText}>Explorar contenido</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Storage Info */}
          <View style={styles.storageInfo}>
            <View style={styles.storageRow}>
              <Text style={styles.storageLabel}>Espacio usado:</Text>
              <Text style={styles.storageValue}>{totalStorage}</Text>
            </View>
            <View style={styles.storageRow}>
              <Text style={styles.storageLabel}>Espacio disponible:</Text>
              <Text style={styles.storageValue}>{availableStorage}</Text>
            </View>
          </View>

          {/* Downloads List */}
          <View style={styles.downloadsSection}>
            <Text style={styles.sectionTitle}>
              {downloads.length} {downloads.length === 1 ? 'descarga' : 'descargas'}
            </Text>
            
            {downloads.map(renderDownloadItem)}
          </View>

          <View style={styles.bottomPadding} />
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.netflix.black,
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
    padding: 5,
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
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    color: Colors.netflix.white,
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 20,
    textAlign: 'center',
  },
  emptyText: {
    color: Colors.netflix.lightGray,
    fontSize: 16,
    marginTop: 10,
    textAlign: 'center',
    lineHeight: 22,
  },
  browseButton: {
    backgroundColor: Colors.netflix.red,
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 4,
    marginTop: 30,
  },
  browseButtonText: {
    color: Colors.netflix.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  storageInfo: {
    backgroundColor: Colors.netflix.darkGray,
    margin: 20,
    padding: 15,
    borderRadius: 8,
  },
  storageRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  storageLabel: {
    color: Colors.netflix.lightGray,
    fontSize: 14,
  },
  storageValue: {
    color: Colors.netflix.white,
    fontSize: 14,
    fontWeight: '500',
  },
  downloadsSection: {
    paddingHorizontal: 20,
  },
  sectionTitle: {
    color: Colors.netflix.white,
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  downloadItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    backgroundColor: Colors.netflix.darkGray,
    borderRadius: 8,
    padding: 10,
  },
  thumbnail: {
    width: 80,
    height: 120,
    borderRadius: 4,
  },
  playOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 4,
  },
  progressOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    padding: 8,
    borderBottomLeftRadius: 4,
    borderBottomRightRadius: 4,
  },
  progressBar: {
    height: 3,
    backgroundColor: Colors.netflix.red,
    borderRadius: 1.5,
    marginBottom: 4,
  },
  progressText: {
    color: Colors.netflix.white,
    fontSize: 10,
    textAlign: 'center',
  },
  downloadInfo: {
    flex: 1,
    marginLeft: 15,
  },
  downloadTitle: {
    color: Colors.netflix.white,
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  downloadMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  downloadDate: {
    color: Colors.netflix.lightGray,
    fontSize: 12,
    marginRight: 10,
  },
  downloadSize: {
    color: Colors.netflix.lightGray,
    fontSize: 12,
    marginRight: 10,
  },
  downloadQuality: {
    color: Colors.netflix.lightGray,
    fontSize: 12,
  },
  downloadControls: {
    flexDirection: 'row',
    marginTop: 8,
  },
  controlButton: {
    backgroundColor: Colors.netflix.red,
    padding: 8,
    borderRadius: 4,
    marginRight: 10,
  },
  deleteButton: {
    padding: 10,
  },
  bottomPadding: {
    height: 100,
  },
});