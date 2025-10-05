// import { Image } from 'expo-image';
// import { Platform, StyleSheet } from 'react-native';

// import { Collapsible } from '@/components/ui/collapsible';
// import { ExternalLink } from '@/components/external-link';
// import ParallaxScrollView from '@/components/parallax-scroll-view';
// import { ThemedText } from '@/components/themed-text';
// import { ThemedView } from '@/components/themed-view';
// import { IconSymbol } from '@/components/ui/icon-symbol';
// import { Fonts } from '@/constants/theme';

import React from 'react';
import { View, Text } from 'react-native';

export default function ExplorePlaceholder() {
	return (
		<View style={{ flex: 1, backgroundColor: 'black', justifyContent: 'center', alignItems: 'center' }}>
			<Text style={{ color: 'white' }}>Explore (placeholder)</Text>
		</View>
	);
}
