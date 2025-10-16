import React from 'react';

// Import the actual component from components directory
import WelcomeScreen from '../components/layout/WelcomeScreen';

export default function WelcomeWrapper() {
  // This wrapper ensures the route is properly handled by Expo Router
  return <WelcomeScreen />;
}