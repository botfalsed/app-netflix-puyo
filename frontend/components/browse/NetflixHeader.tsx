import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/theme';

interface NetflixHeaderProps {
  selectedFilter?: string;
  onClearFilter?: () => void;
  onDownloadPress?: () => void;
  onSearchPress?: () => void;
}

export default function NetflixHeader({ 
  selectedFilter, 
  onClearFilter, 
  onDownloadPress, 
  onSearchPress 
}: NetflixHeaderProps) {
  const isFilterActive = selectedFilter && selectedFilter !== 'Inicio';
  
  return (
    <SafeAreaView style={styles.headerContainer}>
      <View style={styles.topBar}>
        {isFilterActive ? (
          <View style={styles.filterHeader}>
            <TouchableOpacity style={styles.closeButton} onPress={onClearFilter}>
              <Ionicons name="close" size={24} color={Colors.netflix.white} />
            </TouchableOpacity>
            <Text style={styles.filterTitle}>{selectedFilter}</Text>
          </View>
        ) : (
          <Text style={styles.netflixLogo}>NETFLIX</Text>
        )}
        
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.headerButton} onPress={onDownloadPress}>
            <Ionicons name="download-outline" size={24} color={Colors.netflix.white} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerButton} onPress={onSearchPress}>
            <Ionicons name="search-outline" size={24} color={Colors.netflix.white} />
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    backgroundColor: Colors.netflix.black,
    paddingBottom: 0,
    zIndex: 1000,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  headerButton: {
    padding: 8,
  },
  netflixLogo: {
    color: Colors.netflix.red,
    fontSize: 28,
    fontWeight: 'bold',
    letterSpacing: 2,
  },
  filterHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  closeButton: {
    padding: 4,
  },
  filterTitle: {
    color: Colors.netflix.white,
    fontSize: 20,
    fontWeight: 'bold',
  },
});