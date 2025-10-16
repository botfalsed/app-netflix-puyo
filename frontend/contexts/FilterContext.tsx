import React, { createContext, useContext, useState, ReactNode } from 'react';

interface FilterContextType {
  selectedFilter: string;
  setSelectedFilter: (filter: string) => void;
  filteredContent: Record<string, any[]>;
  setFilteredContent: (content: Record<string, any[]>) => void;
  scrollPosition: number;
  setScrollPosition: (position: number) => void;
}

const FilterContext = createContext<FilterContextType | undefined>(undefined);

interface FilterProviderProps {
  children: ReactNode;
}

export function FilterProvider({ children }: FilterProviderProps) {
  const [selectedFilter, setSelectedFilter] = useState('Inicio');
  const [filteredContent, setFilteredContent] = useState<Record<string, any[]>>({});
  const [scrollPosition, setScrollPosition] = useState(0);

  return (
    <FilterContext.Provider
      value={{
        selectedFilter,
        setSelectedFilter,
        filteredContent,
        setFilteredContent,
        scrollPosition,
        setScrollPosition,
      }}
    >
      {children}
    </FilterContext.Provider>
  );
}

export function useFilter() {
  const context = useContext(FilterContext);
  if (context === undefined) {
    throw new Error('useFilter must be used within a FilterProvider');
  }
  return context;
}