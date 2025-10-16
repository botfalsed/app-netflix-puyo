import React from 'react';
import { View, StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';
import { Colors } from '../../constants/theme';

const TabBarBackground: React.FC = () => {
  return (
    <View style={styles.container}>
      <BlurView
        intensity={100}
        tint="dark"
        style={StyleSheet.absoluteFillObject}
      />
      <View style={styles.overlay} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.netflix.black,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
});

export default TabBarBackground;