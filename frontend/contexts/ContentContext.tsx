import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { HomeData, Content } from '../services/content';
import { tmdbContentService } from '../services/tmdbContent';

interface ContentCache {
  homeData: HomeData | null;
  filteredContent: { [key: string]: Content[] };
  featuredContentCache: { [key: string]: Content | null };
  lastUpdated: number;
  isLoading: boolean;
}

interface ContentContextType {
  cache: ContentCache;
  loadHomeData: (profileId: number, forceRefresh?: boolean) => Promise<void>;
  updateFilteredContent: (filter: string, content: Content[]) => void;
  updateFeaturedContent: (filter: string, content: Content | null) => void;
  clearCache: () => void;
  isDataStale: () => boolean;
}

const ContentContext = createContext<ContentContextType | undefined>(undefined);

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos en milisegundos

interface ContentProviderProps {
  children: ReactNode;
}

export const ContentProvider: React.FC<ContentProviderProps> = ({ children }) => {
  const [cache, setCache] = useState<ContentCache>({
    homeData: null,
    filteredContent: {},
    featuredContentCache: {},
    lastUpdated: 0,
    isLoading: false,
  });

  const isDataStale = useCallback(() => {
    if (!cache.homeData || cache.lastUpdated === 0) return true;
    return Date.now() - cache.lastUpdated > CACHE_DURATION;
  }, [cache.lastUpdated, cache.homeData]);

  const loadHomeData = useCallback(async (profileId: number, forceRefresh: boolean = false) => {
    // Si ya tenemos datos y no están obsoletos, no recargar
    if (!forceRefresh && cache.homeData && !isDataStale()) {
      console.log('📦 Usando datos del caché - no es necesario recargar');
      return;
    }

    console.log('🔄 Cargando datos del home...');
    setCache(prev => ({ ...prev, isLoading: true }));

    try {
      const data = await tmdbContentService.getHomeData(profileId);
      
      if (data) {
        setCache(prev => ({
          ...prev,
          homeData: data,
          filteredContent: { 'Inicio': data.categoryContent },
          lastUpdated: Date.now(),
          isLoading: false,
        }));
        console.log('✅ Datos del home cargados y cacheados');
      } else {
        throw new Error('No se pudieron cargar los datos');
      }
    } catch (error) {
      console.error('❌ Error cargando datos del home:', error);
      setCache(prev => ({ ...prev, isLoading: false }));
      throw error;
    }
  }, [cache.homeData, isDataStale]);

  const updateFilteredContent = useCallback((filter: string, content: Content[]) => {
    setCache(prev => ({
      ...prev,
      filteredContent: { ...prev.filteredContent, [filter]: content }
    }));
  }, []);

  const updateFeaturedContent = useCallback((filter: string, content: Content | null) => {
    setCache(prev => ({
      ...prev,
      featuredContentCache: { ...prev.featuredContentCache, [filter]: content }
    }));
  }, []);

  const clearCache = useCallback(() => {
    setCache({
      homeData: null,
      filteredContent: {},
      featuredContentCache: {},
      lastUpdated: 0,
      isLoading: false,
    });
    console.log('🗑️ Caché limpiado');
  }, []);

  const contextValue: ContentContextType = {
    cache,
    loadHomeData,
    updateFilteredContent,
    updateFeaturedContent,
    clearCache,
    isDataStale,
  };

  return (
    <ContentContext.Provider value={contextValue}>
      {children}
    </ContentContext.Provider>
  );
};

export const useContentContext = () => {
  const context = useContext(ContentContext);
  if (context === undefined) {
    throw new Error('useContentContext must be used within a ContentProvider');
  }
  return context;
};

export default ContentContext;