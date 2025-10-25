import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  StatusBar,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useFocusEffect } from 'expo-router';

import { Colors } from '../../../constants/theme';
import { contentService, type HomeData, type Content } from '../../../services/content';
import { getActiveProfile, setActiveProfile } from '../../../services/profiles';
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
  
  const [activeProfile, setActiveProfileState] = useState<any>(null);
  const [dailyFeatured, setDailyFeatured] = useState<Content | null>(null);
  const [showCategoriesModal, setShowCategoriesModal] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  // Usar datos del caché en lugar del estado local
  const homeData = cache.homeData;
  const loading = cache.isLoading;
  const featuredContentCache = cache.featuredContentCache;

  useEffect(() => {
    const initializeData = async () => {
      const profile = await getActiveProfile();
      if (profile) {
        setActiveProfileState(profile);
        await loadHomeData(profile.id);
      } else {
        // Fallback: carga inicial sin perfil para evitar bloquear la UI
        await loadHomeData(1);
      }
    };
    initializeData();
  }, []);

  const handleScroll = React.useCallback((event: any) => {
    const currentY = event.nativeEvent.contentOffset.y;
    setScrollPosition(currentY);
  }, [setScrollPosition]);

  const getDailyFeaturedContent = (categoryContent: { [key: string]: Content[] }) => {
    const allContent: Content[] = [];
    Object.values(categoryContent).forEach(contentArray => {
      allContent.push(...contentArray);
    });

    if (allContent.length === 0) return null;

    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 0);
    const diff = now.getTime() - start.getTime();
    const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));

    const index = dayOfYear % allContent.length;
    return allContent[index];
  };

  const getFeaturedContentByFilter = (filter: string, content: { [key: string]: Content[] }) => {
    if (featuredContentCache[filter]) {
      return featuredContentCache[filter];
    }

    if (!content || typeof content !== 'object') {
      return null;
    }

    let targetContent: Content[] = [];

    switch (filter) {
      case 'Inicio':
        Object.values(content).forEach(contentArray => {
          if (Array.isArray(contentArray)) {
            targetContent.push(...contentArray);
          }
        });
        break;
      case 'Series':
        Object.values(content).forEach(contentArray => {
          if (Array.isArray(contentArray)) {
            targetContent.push(...contentArray.filter(item => item.type === 'series'));
          }
        });
        break;
      case 'Películas':
        Object.values(content).forEach(contentArray => {
          if (Array.isArray(contentArray)) {
            targetContent.push(...contentArray.filter(item => item.type === 'movie'));
          }
        });
        break;
      case 'Mi lista':
        if (homeData?.watchlist) {
          targetContent = homeData.watchlist;
        }
        break;
      default:
        if (filteredContent[filter]) {
          targetContent = filteredContent[filter];
        } else {
          Object.values(content).forEach(contentArray => {
            if (Array.isArray(contentArray)) {
              targetContent.push(...contentArray);
            }
          });
        }
    }

    if (targetContent.length === 0) return null;

    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 0);
    const diff = now.getTime() - start.getTime();
    const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    const filterHash = filter.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const index = (dayOfYear + filterHash) % targetContent.length;
    
    const selectedContent = targetContent[index];
    
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

    const featuredContent = getFeaturedContentByFilter(filter, homeData.categoryContent || {});
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
        filtered = { 'Mi lista': homeData.watchlist || [] };
        break;
      default:
        try {
          const categoryContent = await tmdbContentService.getContentByCategory(filter, 20);
          filtered = { [filter]: categoryContent };
        } catch (error) {
          console.error(`Error loading content for category ${filter}:`, error);
          filtered = homeData.categoryContent || {};
        }
    }
    setFilteredContent(filtered);
    
    updateFilteredContent(filter, Object.values(filtered).flat());
  }, [homeData, setSelectedFilter, setFilteredContent, updateFilteredContent]);

  const handlePlayContent = (content: Content) => {
    router.push(`/content/player/${content.id}`);
  };

  const handleAddToList = async (content: Content) => {
    try {
      const profile = await getActiveProfile();
      if (!profile) {
        console.warn('No active profile found');
        return;
      }

      if (content.type !== 'movie') {
        Alert.alert('Mi Lista', 'Por ahora solo se pueden agregar películas.');
        return;
      }

      const ok = await tmdbContentService.addToWatchlist(profile.id, content.id);
      if (ok) {
        console.log('Agregado a Mi Lista:', content.title);
        Alert.alert('Mi Lista', 'Se agregó a tu lista');
        await loadHomeData(profile.id, true);
      } else {
        Alert.alert('Mi Lista', 'No se pudo agregar');
      }
    } catch (e) {
      console.error('Error agregando a Mi Lista:', e);
      Alert.alert('Mi Lista', 'Ocurrió un error al agregar');
    }
  };

  const handleViewDetails = (content: Content) => {
    router.push({
      pathname: '/content/details/[id]',
      params: { 
        id: `tmdb-${content.id}`,
        type: content.type 
      }
    });
  };

  const handleCategorySelect = async (category: string) => {
    setSelectedFilter(category);
    setShowCategoriesModal(false);
    await handleFilterChange(category);
  };

  const handleClearFilter = () => {
    setSelectedFilter('Inicio');
    if (homeData) {
      setFilteredContent(homeData.categoryContent || {});
      const featuredContent = getFeaturedContentByFilter('Inicio', homeData.categoryContent || {});
      setDailyFeatured(featuredContent);
    }
  };

  useEffect(() => {
    if (!homeData?.categoryContent) return;
    const featuredContent = getFeaturedContentByFilter(selectedFilter, homeData.categoryContent);
    setDailyFeatured(featuredContent);
  }, [homeData, selectedFilter, updateFeaturedContent]);

  useEffect(() => {
    if (homeData) {
      if (selectedFilter === 'Inicio') {
        setFilteredContent(homeData.categoryContent || {});
      } else {
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

  // Solo mostrar error si no hay datos después de intentar cargar y no está cargando
  if (!homeData && !loading) {
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

  // Si no hay homeData pero está cargando, mostrar loading
  if (!homeData) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.netflix.red} />
      </View>
    );
  }

  const { featured, categoryContent, continueWatching, watchlist } = homeData;

  // Helpers para ordenar y evitar categorías con un solo elemento
  function normalizeSections(sections: Record<string, Content[]>) {
    const entries = Object.entries(sections || {});
    const sorted = entries.sort((a, b) => (b[1]?.length ?? 0) - (a[1]?.length ?? 0));
    const filtered = sorted.filter(([, arr]) => Array.isArray(arr) && arr.length >= 2);
    const miscItems = sorted
      .filter(([, arr]) => Array.isArray(arr) && arr.length < 2)
      .flatMap(([, arr]) => arr);
    if (miscItems.length >= 2) {
      filtered.push(['Otros', miscItems.slice(0, 20)]);
    }
    return filtered;
  }

  function getSectionsForRender(
    selectedFilter: string,
    categoryContent: Record<string, Content[]>,
    filteredContent: Record<string, Content[]>
  ): Array<[string, Content[]]> {
    const source = selectedFilter === 'Inicio'
      ? categoryContent
      : (Object.keys(filteredContent).length > 0 ? filteredContent : categoryContent);
    return normalizeSections(source);
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      <NetflixHeader
        selectedFilter={selectedFilter}
        onClearFilter={handleClearFilter}
        onSearchPress={() => router.push('/main/search')}
      />

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
        {dailyFeatured && (
          <HeroBanner
            dailyFeatured={dailyFeatured}
            onPlayContent={handlePlayContent}
            onAddToList={handleAddToList}
            onViewDetails={handleViewDetails}
          />
        )}

        <View style={styles.contentSections}>
          {continueWatching && continueWatching.length > 0 && (
            <ContentCarousel
              title="Continuar viendo"
              data={continueWatching}
              onItemPress={handlePlayContent}
              showProgress={true}
            />
          )}

          {watchlist && watchlist.length > 0 && (
            <ContentCarousel
              title="Mi lista"
              data={watchlist}
              onItemPress={handlePlayContent}
            />
          )}

          // Dentro de HomeScreen, antes del return, añadimos helpers

          {getSectionsForRender(selectedFilter, categoryContent, filteredContent).map(([categoryName, content], index) => (
              <ContentCarousel
                key={`category-${selectedFilter}-${categoryName}-${index}`}
                title={categoryName}
                data={content}
                onItemPress={handlePlayContent}
              />
          ))}

          {Object.keys(categoryContent).length === 0 && (
            <>
              <LoadingCarousel title="Acción" />
              <LoadingCarousel title="Comedia" />
              <LoadingCarousel title="Drama" />
            </>
          )}
        </View>
      </ScrollView>

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
    // backgroundColor: "gray"
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