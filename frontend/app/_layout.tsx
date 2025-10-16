import React from 'react';
import { Slot } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { FilterProvider } from '../contexts/FilterContext';
import { ContentProvider } from '../contexts/ContentContext';

export default function RootLayout() {
	// Minimal layout: just render child routes
	return (
		<SafeAreaProvider>
			<ContentProvider>
				<FilterProvider>
					<Slot />
				</FilterProvider>
			</ContentProvider>
		</SafeAreaProvider>
	);
}
