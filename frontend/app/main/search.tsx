import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Colors } from '../../constants/theme';
import { contentService, type Content } from '../../services/content';
import { getActiveProfile } from '../../services/profiles';

const { width } = Dimensions.get('window');
const GRID_ITEM_WIDTH = (width - 60) / 3;

export default function SearchScreen() {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<Content[]>([]);
  const [loading, setLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [activeProfile, setActiveProfile] = useState<any>(null);

  useEffect(() => {
    loadActiveProfile();
  }, []);

  const loadActiveProfile = async () => {
    try {
      const profile = await getActiveProfile();
      setActiveProfile(profile);
    } catch (error) {
      console.error('Error loading active profile:', error);
    }
  };

  useEffect(() => {
    if (searchTerm.trim().length > 2) {
      const timeoutId = setTimeout(() => {
        performSearch(searchTerm);
      }, 500);

      return () => clearTimeout(timeoutId);
    } else {
      setSearchResults([]);
    }
  }, [searchTerm]);

  const performSearch = async (term: string) => {
    if (term.trim().length < 3) return;

    setLoading(true);
    try {
      const results = await contentService.searchContent(term, activeProfile?.id);
      setSearchResults(results);
      
      // Add to recent searches
      setRecentSearches(prev => {
        const updated = [term, ...prev.filter(t => t !== term)].slice(0, 5);
        return updated;
      });
    } catch (error) {
      console.error('Error searching content:', error);
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleContentPress = (content: Content) => {
    router.push({
      pathname: '/content/details/[id]',
      params: { 
        id: `tmdb-${content.id}`,
        type: content.type // Pasar el tipo de contenido (movie/series)
      }
    });
  };

  const handleRecentSearchPress = (term: string) => {
    setSearchTerm(term);
  };

  const clearSearch = () => {
    setSearchTerm('');
    setSearchResults([]);
  };

  const handleBackPress = () => {
    router.back();
  };

  const renderSearchResult = (item: Content) => (
    <TouchableOpacity
      key={item.id}
      style={styles.gridItem}
      onPress={() => handleContentPress(item)}
      activeOpacity={0.8}
    >
      <Image
        source={{ uri: item.thumbnail_url }}
        style={styles.gridItemImage}
        resizeMode="cover"
      />
      <View style={styles.gridItemOverlay}>
        <Text style={styles.gridItemTitle} numberOfLines={2}>
          {item.title}
        </Text>
        <Text style={styles.gridItemType}>
          {item.type === 'series' ? 'Serie' : 'Película'}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Search Header */}
      <View style={styles.searchHeader}>
        <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
          <Ionicons name="arrow-back" size={24} color={Colors.netflix.white} />
        </TouchableOpacity>
        <View style={styles.searchInputContainer}>
          <Ionicons 
            name="search" 
            size={20} 
            color={Colors.netflix.lightGray} 
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar series, películas..."
            placeholderTextColor={Colors.netflix.lightGray}
            value={searchTerm}
            onChangeText={setSearchTerm}
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="search"
            onSubmitEditing={() => performSearch(searchTerm)}
            autoFocus
          />
          {searchTerm.length > 0 && (
            <TouchableOpacity onPress={clearSearch} style={styles.clearButton}>
              <Ionicons name="close" size={20} color={Colors.netflix.lightGray} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Loading State */}
        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.netflix.red} />
            <Text style={styles.loadingText}>Buscando...</Text>
          </View>
        )}

        {/* Search Results */}
        {!loading && searchResults.length > 0 && (
          <View style={styles.resultsContainer}>
            <Text style={styles.sectionTitle}>
              Resultados para "{searchTerm}"
            </Text>
            <View style={styles.gridContainer}>
              {searchResults.map(renderSearchResult)}
            </View>
          </View>
        )}

        {/* No Results */}
        {!loading && searchTerm.length > 2 && searchResults.length === 0 && (
          <View style={styles.noResultsContainer}>
            <Ionicons name="search" size={64} color={Colors.netflix.darkGray} />
            <Text style={styles.noResultsTitle}>
              No se encontraron resultados
            </Text>
            <Text style={styles.noResultsText}>
              Intenta con otros términos de búsqueda
            </Text>
          </View>
        )}

        {/* Recent Searches */}
        {!loading && searchTerm.length === 0 && recentSearches.length > 0 && (
          <View style={styles.recentSearchesContainer}>
            <Text style={styles.sectionTitle}>Búsquedas recientes</Text>
            {recentSearches.map((term, index) => (
              <TouchableOpacity
                key={index}
                style={styles.recentSearchItem}
                onPress={() => handleRecentSearchPress(term)}
              >
                <Ionicons name="time" size={16} color={Colors.netflix.lightGray} />
                <Text style={styles.recentSearchText}>{term}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Popular Searches Placeholder */}
        {!loading && searchTerm.length === 0 && recentSearches.length === 0 && (
          <View style={styles.popularContainer}>
            <Text style={styles.sectionTitle}>Búsquedas populares</Text>
            <View style={styles.popularItem}>
              <Text style={styles.popularText}>Anime</Text>
            </View>
            <View style={styles.popularItem}>
              <Text style={styles.popularText}>Acción</Text>
            </View>
            <View style={styles.popularItem}>
              <Text style={styles.popularText}>Comedia</Text>
            </View>
            <View style={styles.popularItem}>
              <Text style={styles.popularText}>Drama</Text>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.netflix.black,
  },
  searchHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: Colors.netflix.darkGray,
    gap: 15,
  },
  backButton: {
    padding: 4,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.netflix.darkGray,
    borderRadius: 8,
    paddingHorizontal: 15,
    height: 50,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    color: Colors.netflix.white,
    fontSize: 16,
    height: '100%',
  },
  clearButton: {
    padding: 5,
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  loadingText: {
    color: Colors.netflix.white,
    fontSize: 16,
    marginTop: 10,
  },
  resultsContainer: {
    padding: 20,
  },
  sectionTitle: {
    color: Colors.netflix.white,
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  gridItem: {
    width: GRID_ITEM_WIDTH,
    marginBottom: 20,
    borderRadius: 4,
    overflow: 'hidden',
  },
  gridItemImage: {
    width: '100%',
    height: GRID_ITEM_WIDTH * 1.5,
  },
  gridItemOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 8,
  },
  gridItemTitle: {
    color: Colors.netflix.white,
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  gridItemType: {
    color: Colors.netflix.lightGray,
    fontSize: 10,
  },
  noResultsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
    paddingHorizontal: 40,
  },
  noResultsTitle: {
    color: Colors.netflix.white,
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 20,
    textAlign: 'center',
  },
  noResultsText: {
    color: Colors.netflix.lightGray,
    fontSize: 16,
    marginTop: 10,
    textAlign: 'center',
  },
  recentSearchesContainer: {
    padding: 20,
  },
  recentSearchItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.netflix.darkGray,
  },
  recentSearchText: {
    color: Colors.netflix.white,
    fontSize: 16,
    marginLeft: 12,
  },
  popularContainer: {
    padding: 20,
  },
  popularItem: {
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: Colors.netflix.darkGray,
  },
  popularText: {
    color: Colors.netflix.white,
    fontSize: 16,
  },
});