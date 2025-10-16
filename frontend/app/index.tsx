import React, { useEffect, useState } from 'react';
import { Redirect } from 'expo-router';
import { getToken } from '../services/token';

export default function Index() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const checkAuth = () => {
      const token = getToken();
      setIsAuthenticated(!!token);
    };

    checkAuth();
  }, []);

  // Show loading while checking authentication
  if (isAuthenticated === null) {
    return null;
  }

  // Redirect based on authentication status
  if (isAuthenticated) {
    return <Redirect href="/(main)/(tabs)" />;
  } else {
    return <Redirect href="/welcome" />;
  }
}