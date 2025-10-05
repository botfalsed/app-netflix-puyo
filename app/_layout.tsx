import React from 'react';
import { Slot } from 'expo-router';

export default function RootLayout() {
	// Minimal layout: just render child routes
	return <Slot />;
}
