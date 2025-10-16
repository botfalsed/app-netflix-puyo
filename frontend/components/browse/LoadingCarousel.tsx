import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Dimensions,
  Animated,
} from 'react-native';
import { Colors } from '../../constants/theme';

const { width: screenWidth } = Dimensions.get('window');
const ITEM_WIDTH = screenWidth * 0.32;
const ITEM_HEIGHT = ITEM_WIDTH * 1.5;

interface LoadingCarouselProps {
  title: string;
}

const LoadingCarousel = React.memo(function LoadingCarousel({ title }: LoadingCarouselProps) {
  const shimmerAnimation = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    const shimmer = () => {
      Animated.sequence([
        Animated.timing(shimmerAnimation, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(shimmerAnimation, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]).start(() => shimmer());
    };
    shimmer();
  }, [shimmerAnimation]);

  const shimmerOpacity = shimmerAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  const renderSkeletonItem = React.useCallback((index: number) => {
    const isFirstItem = index === 0;
    const isLastItem = index === 4; // Mostrar 5 elementos skeleton

    return (
      <View
        key={index}
        style={[
          styles.skeletonItem,
          isFirstItem && styles.firstItem,
          isLastItem && styles.lastItem,
        ]}
      >
        <Animated.View 
          style={[
            styles.skeletonImage,
            { opacity: shimmerOpacity }
          ]} 
        />
        <View style={styles.skeletonTextContainer}>
          <Animated.View 
            style={[
              styles.skeletonTitle,
              { opacity: shimmerOpacity }
            ]} 
          />
          <Animated.View 
            style={[
              styles.skeletonSubtitle,
              { opacity: shimmerOpacity }
            ]} 
          />
        </View>
      </View>
    );
  }, [shimmerOpacity]);

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        scrollEnabled={false}
      >
        {Array.from({ length: 5 }, (_, index) => renderSkeletonItem(index))}
      </ScrollView>
    </View>
  );
});

export default LoadingCarousel;

const styles = StyleSheet.create({
  container: {
    marginBottom: 35,
  },
  sectionTitle: {
    color: Colors.netflix.white,
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 18,
    marginLeft: 20,
  },
  scrollContent: {
    paddingLeft: 20,
  },
  skeletonItem: {
    width: ITEM_WIDTH,
    marginRight: 12,
  },
  firstItem: {
    marginLeft: 0,
  },
  lastItem: {
    marginRight: 20,
  },
  skeletonImage: {
    width: '100%',
    height: ITEM_HEIGHT,
    backgroundColor: Colors.netflix.darkGray,
    borderRadius: 4,
  },
  skeletonTextContainer: {
    marginTop: 8,
  },
  skeletonTitle: {
    height: 16,
    backgroundColor: Colors.netflix.darkGray,
    borderRadius: 2,
    marginBottom: 4,
    width: '80%',
  },
  skeletonSubtitle: {
    height: 12,
    backgroundColor: Colors.netflix.darkGray,
    borderRadius: 2,
    width: '60%',
  },
});