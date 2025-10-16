import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  StatusBar,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useFocusEffect } from 'expo-router';

import { Colors } from '../../../constants/theme';
import { contentService, type HomeData, type Content } from '../../../services/content';
import { getActiveProfile } from '../../../services/profiles';
import { tmdbContentService } from '../../../services/tmdbContent';
import ContentCarousel from '../../../components/browse/ContentCarousel';
import LoadingCarousel from '../../../components/browse/LoadingCarousel';
import NetflixHeader from '../../../components/browse/NetflixHeader';
import NavigationBar from '../../../components/browse/NavigationBar';
import HeroBanner from '../../../components/browse/HeroBanner';
import CategoriesModal from '../../../components/browse/CategoriesModal';
import { useFilter } from '../../../contexts/FilterContext';
import { useContentContext } from '../../../contexts/ContentContext';

const categories = [
  'Inicio',
  'Mi lista',
  'Disponibles para descargar',
  'Tendencias',
  'Populares',
  'Mejor Valoradas',
  'Acción',
  'Aventura',
  'Animación',
  'Comedias',
  'Crimen',
  'Documentales',
  'Dramas',
  'Familia',
  'Fantasía',
  'Historia',
  'Terror',
  'Música',
  'Misterio',
  'Romance',
  'Ciencia Ficción',
  'Suspenso',
  'Thriller',
  'Guerra',
  'Western',
  'Series Populares',
  'Series Mejor Valoradas',
  'Series de Acción y Aventura',
  'Series de Comedia',
  'Series de Drama',
  'Series de Crimen',
  'Series Documentales',
  'Series de Misterio',
  'Series de Ciencia Ficción y Fantasía'
];

export default function HomeScreen() {
  const { selectedFilter, setSelectedFilter, filteredContent, setFilteredContent, scrollPosition, setScrollPosition } = useFilter();
  const { cache, loadHomeData, updateFilteredContent, updateFeaturedContent } = useContentContext();
  
  const [activeProfile, setActiveProfile] = useState<any>(null);
  const [dailyFeatured, setDailyFeatured] = useState<Content | null>(null);
  const [showCategoriesModal, setShowCategoriesModal] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  // Usar datos del caché en lugar del estado local
  const homeData = cache.homeData;
  const loading = cache.isLoading;
  const featuredContentCache = cache.featuredContentCache;

  useEffect(() => {
    const initializeData = async () => {
      // Crear un perfil temporal para testing
      const testProfile = { id: 1, name: 'Test Profile' };
      setActiveProfile(testProfile);
      
      // Cargar datos usando el contexto global
      await loadHomeData(testProfile.id);
    };
    
    initializeData();
  }, []);

  // Función simple de scroll sin restauración automática
  const handleScroll = React.useCallback((event: any) => {
    const currentY = event.nativeEvent.contentOffset.y;
    // Solo guardar la posición, sin restauración automática
    setScrollPosition(currentY);
  }, [setScrollPosition]);

  // Function to get daily featured content based on day of year
  const getDailyFeaturedContent = (categoryContent: { [key: string]: Content[] }) => {
    const allContent: Content[] = [];
    Object.values(categoryContent).forEach(contentArray => {
      allContent.push(...contentArray);
    });

    if (allContent.length === 0) return null;

    // Use day of year to select content (changes daily)
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 0);
    const diff = now.getTime() - start.getTime();
    const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));

    const index = dayOfYear % allContent.length;
    return allContent[index];
  };

  // Function to get featured content based on current filter
  const getFeaturedContentByFilter = (filter: string, content: { [key: string]: Content[] }) => {
    // Check if we already have cached content for this filter
    if (featuredContentCache[filter]) {
      return featuredContentCache[filter];
    }

    // Validate content parameter
    if (!content || typeof content !== 'object') {
      return null;
    }

    let targetContent: Content[] = [];

    switch (filter) {
      case 'Inicio':
        // Use all content for home
        Object.values(content).forEach(contentArray => {
          if (Array.isArray(contentArray)) {
            targetContent.push(...contentArray);
          }
        });
        break;
      case 'Series':
        // Filter only series content
        Object.values(content).forEach(contentArray => {
          if (Array.isArray(contentArray)) {
            targetContent.push(...contentArray.filter(item => item.type === 'series'));
          }
        });
        break;
      case 'Películas':
        // Filter only movie content
        Object.values(content).forEach(contentArray => {
          if (Array.isArray(contentArray)) {
            targetContent.push(...contentArray.filter(item => item.type === 'movie'));
          }
        });
        break;
      case 'Mi lista':
        // Use watchlist content
        if (homeData?.watchlist) {
          targetContent = homeData.watchlist;
        }
        break;
      default:
        // For specific categories, use filtered content
        if (filteredContent[filter]) {
          targetContent = filteredContent[filter];
        } else {
          // Fallback to all content
          Object.values(content).forEach(contentArray => {
            if (Array.isArray(contentArray)) {
              targetContent.push(...contentArray);
            }
          });
        }
    }

    if (targetContent.length === 0) return null;

    // Use day of year + filter hash to select content consistently
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 0);
    const diff = now.getTime() - start.getTime();
    const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    // Create a simple hash from filter name
    const filterHash = filter.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const index = (dayOfYear + filterHash) % targetContent.length;
    
    const selectedContent = targetContent[index];
    
    // Update the cache using the context
    updateFeaturedContent(filter, selectedContent);
    
    return selectedContent;
  };

  const filterContentByType = (categoryContent: Record<string, Content[]>, type: 'movie' | 'tv'): Record<string, Content[]> => {
    const filtered: Record<string, Content[]> = {};
    
    Object.entries(categoryContent).forEach(([categoryName, items]) => {
      const filteredItems = items.filter(item => {
        if (type === 'movie') return item.type === 'movie';
        if (type === 'tv') return item.type === 'series';
        return true;
      });
      
      if (filteredItems.length > 0) {
        filtered[categoryName] = filteredItems;
      }
    });
    
    return filtered;
  };

  const handleFilterChange = React.useCallback(async (filter: string) => {
    setSelectedFilter(filter);
    if (!homeData) return;

    // Actualizar el contenido destacado usando el caché del contexto
    const featuredContent = getFeaturedContentByFilter(filter, homeData.categoryContent ? Object.values(homeData.categoryContent).flat() : []);
    setDailyFeatured(featuredContent);

    let filtered: Record<string, Content[]>;
    switch (filter) {
      case 'Inicio':
        filtered = homeData.categoryContent || {};
        break;
      case 'Series':
        filtered = filterContentByType(homeData.categoryContent || {}, 'tv');
        break;
      case 'Películas':
        filtered = filterContentByType(homeData.categoryContent || {}, 'movie');
        break;
      case 'Mi lista':
        // Usar la watchlist existente
        filtered = { 'Mi lista': homeData.watchlist || [] };
        break;
      default:
        // Para categorías específicas, cargar contenido desde TMDB
        try {
          const categoryContent = await tmdbContentService.getContentByCategory(filter, 20);
          filtered = { [filter]: categoryContent };
        } catch (error) {
          console.error(`Error loading content for category ${filter}:`, error);
          // Fallback: mostrar contenido existente
          filtered = homeData.categoryContent || {};
        }
    }
    setFilteredContent(filtered);
    
    // Actualizar el caché de contenido filtrado usando el contexto
    updateFilteredContent(filter, Object.values(filtered).flat());
  }, [homeData, setSelectedFilter, setFilteredContent, updateFilteredContent]);

  const handlePlayContent = (content: Content) => {
    router.push(`/content/player/${content.id}`);
  };

  const handleAddToList = (content: Content) => {
    // TODO: Implement add to watchlist functionality
    console.log('Add to list:', content.title);
  };

  const handleViewDetails = (content: Content) => {
    router.push({
      pathname: '/content/details/[id]',
      params: { 
        id: `tmdb-${content.id}`,
        type: content.type // Pasar el tipo de contenido (movie/series)
      }
    });
  };

  const handleCategorySelect = async (category: string) => {
    setSelectedFilter(category);
    setShowCategoriesModal(false);

    // Cargar contenido para la categoría seleccionada
    await handleFilterChange(category);
  };

  const handleClearFilter = () => {
    setSelectedFilter('Inicio');
    if (homeData) {
      setFilteredContent(homeData.categoryContent || {});
      // Update featured content when clearing filter (will use cache if available)
      const featuredContent = getFeaturedContentByFilter('Inicio', homeData.categoryContent || {});
      setDailyFeatured(featuredContent);
    }
  };

  useEffect(() => {
    if (!homeData?.categoryContent) return;
    
    // Actualizar el contenido destacado usando el caché del contexto
    const featuredContent = getFeaturedContentByFilter(selectedFilter, homeData.categoryContent);
    setDailyFeatured(featuredContent);
  }, [homeData, selectedFilter, updateFeaturedContent]);

  useEffect(() => {
    if (homeData) {
      // Inicializar filteredContent con categoryContent cuando se carga homeData
      if (selectedFilter === 'Inicio') {
        setFilteredContent(homeData.categoryContent || {});
      } else {
        // Re-aplicar el filtro actual cuando se cargan nuevos datos
        handleFilterChange(selectedFilter);
      }
    }
  }, [homeData]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.netflix.red} />
      </View>
    );
  }

  if (!homeData || !activeProfile) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Error cargando contenido</Text>
        <TouchableOpacity 
                  style={styles.retryButton} 
                  onPress={() => loadHomeData(activeProfile?.id || 1, true)}
                >
          <Text style={styles.retryButtonText}>Reintentar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const { featured, categoryContent, continueWatching, watchlist } = homeData;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      {/* Netflix Header */}
      <NetflixHeader
        selectedFilter={selectedFilter}
        onClearFilter={handleClearFilter}
        onSearchPress={() => router.push('/main/search')}
      />

      {/* Navigation Bar */}
      <NavigationBar
        selectedFilter={selectedFilter}
        onFilterChange={handleFilterChange}
        onCategoriesPress={() => setShowCategoriesModal(true)}
      />

      <ScrollView
        ref={scrollViewRef}
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        bounces={false}
        onScroll={handleScroll}
        scrollEventThrottle={100}
      >
        {/* Hero Banner */}
        {dailyFeatured && (
          <HeroBanner
            dailyFeatured={dailyFeatured}
            onPlayContent={handlePlayContent}
            onAddToList={handleAddToList}
            onViewDetails={handleViewDetails}
          />
        )}

        {/* Content Sections */}
        <View style={styles.contentSections}>
          {/* Continue Watching */}
          {continueWatching && continueWatching.length > 0 && (
            <ContentCarousel
              title="Continuar viendo"
              data={continueWatching}
              onItemPress={handlePlayContent}
              showProgress={true}
            />
          )}

          {/* My List */}
          {watchlist && watchlist.length > 0 && (
            <ContentCarousel
              title="Mi lista"
              data={watchlist}
              onItemPress={handlePlayContent}
            />
          )}

          {/* Category Content */}
          {Object.entries(selectedFilter === 'Inicio' ? categoryContent : (Object.keys(filteredContent).length > 0 ? filteredContent : categoryContent)).map(([categoryName, content], index) => {
            return (
              <ContentCarousel
                key={`category-${selectedFilter}-${categoryName}-${index}`}
                title={categoryName}
                data={content}
                onItemPress={handlePlayContent}
              />
            );
          })}

          {/* Loading placeholders if no content */}
          {Object.keys(categoryContent).length === 0 && (
            <>
              <LoadingCarousel title="Acción" />
              <LoadingCarousel title="Comedia" />
              <LoadingCarousel title="Drama" />
            </>
          )}
        </View>
      </ScrollView>

      {/* Categories Modal */}
      <CategoriesModal
        visible={showCategoriesModal}
        categories={categories}
        onCategorySelect={handleCategorySelect}
        onClose={() => setShowCategoriesModal(false)}
      />
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.netflix.black,
    padding: 20,
  },
  errorText: {
    color: Colors.netflix.white,
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: Colors.netflix.red,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 4,
  },
  retryButtonText: {
    color: Colors.netflix.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  scrollView: {
    flex: 1,
  },
  contentSections: {
    paddingBottom: 100,
  },
});