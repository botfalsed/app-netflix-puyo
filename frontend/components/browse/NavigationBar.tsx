import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/theme';

interface NavigationBarProps {
  selectedFilter: string;
  onFilterChange: (filter: string) => void;
  onCategoriesPress: () => void;
}

export default function NavigationBar({ 
  selectedFilter, 
  onFilterChange, 
  onCategoriesPress 
}: NavigationBarProps) {
  return (
    <View style={styles.navigationBar}>
      <TouchableOpacity
        style={styles.navItem}
        onPress={() => onFilterChange('Series')}
      >
        <Text style={[styles.navText, selectedFilter === 'Series' && styles.navTextActive]}>
          Series
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.navItem}
        onPress={() => onFilterChange('Películas')}
      >
        <Text style={[styles.navText, selectedFilter === 'Películas' && styles.navTextActive]}>
          Películas
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.categoriesButton}
        onPress={onCategoriesPress}
      >
        <Text style={styles.navText}>Categorías</Text>
        <Ionicons name="chevron-down" size={16} color={Colors.netflix.white} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  navigationBar: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    gap: 15,
    backgroundColor: Colors.netflix.black,
  },
  navItem: {
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: Colors.netflix.lightGray,
    borderRadius: 11,
  },
  categoriesButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 5,
    paddingHorizontal: 12,
    gap: 4,
    borderWidth: 1,
    borderColor: Colors.netflix.lightGray,
    borderRadius: 11,
  },
  navText: {
    color: Colors.netflix.lightGray,
    fontSize: 16,
    fontWeight: '500',
  },
  navTextActive: {
    color: Colors.netflix.white,
    fontWeight: 'bold',
  },
});