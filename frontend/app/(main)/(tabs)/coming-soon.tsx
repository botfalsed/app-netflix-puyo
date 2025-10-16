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
  FlatList,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

import { Colors } from '../../../constants/theme';

const { width: screenWidth } = Dimensions.get('window');
const ITEM_WIDTH = (screenWidth - 40) / 2;

interface ComingSoonItem {
  id: number;
  title: string;
  description: string;
  backdrop_url: string;
  release_date: string;
  categories: string[];
  notification_enabled?: boolean;
}

export default function ComingSoonScreen() {
  const [comingSoonContent, setComingSoonContent] = useState<ComingSoonItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState<Set<number>>(new Set());

  useEffect(() => {
    loadComingSoonContent();
  }, []);

  const loadComingSoonContent = async () => {
    try {
      setLoading(true);
      
      // Datos falsos/placeholder para evitar errores
      const mockComingSoonData: ComingSoonItem[] = [
        {
          id: 1,
          title: "Stranger Things 5",
          description: "La temporada final de la serie más popular de Netflix. Los chicos de Hawkins enfrentan su batalla más épica contra el Mundo del Revés.",
          backdrop_url: "https://image.tmdb.org/t/p/w1280/56v2KjBlU4XaOv9rVYEQypROD7P.jpg",
          release_date: getRandomFutureDate(),
          categories: ["Ciencia Ficción", "Drama", "Terror"],
          notification_enabled: false,
        },
        {
          id: 2,
          title: "The Witcher: Sirenas de las Profundidades",
          description: "Una nueva aventura animada en el mundo de The Witcher. Geralt se embarca en una misión submarina llena de criaturas místicas.",
          backdrop_url: "https://image.tmdb.org/t/p/w1280/7HsHkOqhbSzAuJDwOLr6oQJXjmJ.jpg",
          release_date: getRandomFutureDate(),
          categories: ["Fantasía", "Animación", "Aventura"],
          notification_enabled: false,
        },
        {
          id: 3,
          title: "Casa de Papel: Berlín",
          description: "La precuela que todos esperaban. Descubre los orígenes del carismático ladrón Berlín antes de los atracos más famosos del mundo.",
          backdrop_url: "https://image.tmdb.org/t/p/w1280/reEMJA1uzscCbkpeRJeTT2bjqUp.jpg",
          release_date: getRandomFutureDate(),
          categories: ["Crimen", "Drama", "Suspenso"],
          notification_enabled: false,
        },
        {
          id: 4,
          title: "Avatar: La Leyenda de Aang - Temporada 2",
          description: "La continuación de la exitosa adaptación live-action. Aang continúa su viaje para dominar todos los elementos y salvar el mundo.",
          backdrop_url: "https://image.tmdb.org/t/p/w1280/qiwXlUhobIjYzUepg8hTAotXjRo.jpg",
          release_date: getRandomFutureDate(),
          categories: ["Fantasía", "Aventura", "Familia"],
          notification_enabled: false,
        },
        {
          id: 5,
          title: "Wednesday: Temporada 2",
          description: "Wednesday Addams regresa a la Academia Nevermore con nuevos misterios por resolver y más bailes virales que conquistar.",
          backdrop_url: "https://image.tmdb.org/t/p/w1280/iHSwvRVsRyxpX7FE7GbviaDvgGZ.jpg",
          release_date: getRandomFutureDate(),
          categories: ["Comedia", "Terror", "Misterio"],
          notification_enabled: false,
        }
      ];

      // Simular tiempo de carga
      setTimeout(() => {
        setComingSoonContent(mockComingSoonData);
        setLoading(false);
      }, 1000);
      
    } catch (error) {
      console.error('Error loading coming soon content:', error);
      setLoading(false);
    }
  };

  const getRandomFutureDate = () => {
    const today = new Date();
    const futureDate = new Date(today);
    futureDate.setDate(today.getDate() + Math.floor(Math.random() * 90) + 7); // 7-97 days from now
    return futureDate.toISOString().split('T')[0];
  };

  const formatReleaseDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const diffTime = date.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return 'Mañana';
    if (diffDays < 7) return `En ${diffDays} días`;
    if (diffDays < 30) return `En ${Math.ceil(diffDays / 7)} semanas`;
    
    return date.toLocaleDateString('es-ES', { 
      day: 'numeric', 
      month: 'long',
      year: 'numeric'
    });
  };

  const toggleNotification = (contentId: number) => {
    setNotifications(prev => {
      const newSet = new Set(prev);
      if (newSet.has(contentId)) {
        newSet.delete(contentId);
      } else {
        newSet.add(contentId);
      }
      return newSet;
    });
  };

  const handleContentPress = (content: ComingSoonItem) => {
    // Simular navegación a detalles
    console.log('Navegando a detalles de:', content.title);
    // router.push({
    //   pathname: '/details/[id]',
    //   params: { id: content.id.toString() }
    // });
  };

  const renderComingSoonItem = (item: ComingSoonItem) => (
    <View key={item.id} style={styles.comingSoonItem}>
      <TouchableOpacity
        onPress={() => handleContentPress(item)}
        activeOpacity={0.8}
      >
        <Image
          source={{ uri: item.backdrop_url }}
          style={styles.backdropImage}
          resizeMode="cover"
        />
      </TouchableOpacity>

      <View style={styles.contentInfo}>
        <View style={styles.headerRow}>
          <View style={styles.titleContainer}>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.releaseDate}>
              {formatReleaseDate(item.release_date)}
            </Text>
          </View>
          
          <TouchableOpacity
            style={styles.notificationButton}
            onPress={() => toggleNotification(item.id)}
          >
            <Ionicons
              name={notifications.has(item.id) ? "notifications" : "notifications-outline"}
              size={24}
              color={notifications.has(item.id) ? Colors.netflix.red : Colors.netflix.white}
            />
          </TouchableOpacity>
        </View>

        <Text style={styles.description} numberOfLines={3}>
          {item.description}
        </Text>

        <View style={styles.genresContainer}>
          {item.categories?.slice(0, 3).map((category, index) => (
            <Text key={index} style={styles.genre}>
              {category}
              {index < (item.categories?.length || 0) - 1 && index < 2 ? ' • ' : ''}
            </Text>
          ))}
        </View>

        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.infoButton}
            onPress={() => handleContentPress(item)}
          >
            <Ionicons name="information-circle-outline" size={20} color={Colors.netflix.white} />
            <Text style={styles.buttonText}>Información</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.shareButton}
            onPress={() => {
              // Handle share functionality
              console.log('Share content:', item.title);
            }}
          >
            <Ionicons name="share-outline" size={20} color={Colors.netflix.white} />
            <Text style={styles.buttonText}>Compartir</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.netflix.red} />
          <Text style={styles.loadingText}>Cargando próximamente...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Próximamente</Text>
        <TouchableOpacity style={styles.notificationSettingsButton}>
          <Ionicons name="settings-outline" size={24} color={Colors.netflix.white} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.subtitle}>
          Recibe notificaciones cuando llegue nuevo contenido
        </Text>

        {comingSoonContent.map(renderComingSoonItem)}

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
  notificationSettingsButton: {
    padding: 5,
  },
  content: {
    flex: 1,
  },
  subtitle: {
    color: Colors.netflix.lightGray,
    fontSize: 14,
    textAlign: 'center',
    paddingHorizontal: 40,
    paddingVertical: 20,
    lineHeight: 20,
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
  comingSoonItem: {
    marginBottom: 30,
  },
  backdropImage: {
    width: screenWidth,
    height: screenWidth * 0.56, // 16:9 aspect ratio
  },
  contentInfo: {
    padding: 20,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  titleContainer: {
    flex: 1,
    marginRight: 15,
  },
  title: {
    color: Colors.netflix.white,
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  releaseDate: {
    color: Colors.netflix.lightGray,
    fontSize: 14,
  },
  notificationButton: {
    padding: 5,
  },
  description: {
    color: Colors.netflix.lightGray,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 15,
  },
  genresContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
  },
  genre: {
    color: Colors.netflix.white,
    fontSize: 12,
    fontWeight: '500',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  infoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.netflix.darkGray,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 4,
    flex: 0.45,
    justifyContent: 'center',
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.netflix.darkGray,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 4,
    flex: 0.45,
    justifyContent: 'center',
  },
  buttonText: {
    color: Colors.netflix.white,
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 8,
  },
  bottomPadding: {
    height: 100,
  },
});