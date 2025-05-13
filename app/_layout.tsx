import React, { useEffect, useState } from 'react';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Slot, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/useColorScheme';

// Prevent display before loading is complete.
SplashScreen.preventAutoHideAsync();

// Authentication 
export const AuthContext = React.createContext({
  isAuthenticated: false,
  setIsAuthenticated: (value: boolean) => {},
});

function useProtectedRoute(isAuthenticated: boolean) {
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    // Attendre que l'application soit prête avant de naviguer
    if (segments.length === 0) return;
    
    const inAuthGroup = segments[0] === 'auth';
    
    if (!isAuthenticated && !inAuthGroup) {
      // Redirect to login if not authenticated and not in auth group
      router.replace('/auth/login');
    } else if (isAuthenticated && inAuthGroup) {
      // Redirect to main screen if authenticated and in auth group
      router.replace('/(tabs)');
    }
  }, [isAuthenticated, segments, router]);
}

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [appIsReady, setAppIsReady] = useState(false);

  // Préparer l'application et attendre que tout soit chargé
  useEffect(() => {
    async function prepare() {
      try {
        // Attendre que les ressources soient chargées
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (e) {
        console.warn(e);
      } finally {
        // Indiquer que l'application est prête
        setAppIsReady(true);
        // Masquer l'écran de chargement
        await SplashScreen.hideAsync();
      }
    }

    prepare();
  }, []);

  // Utiliser directement la protection des routes
  useProtectedRoute(isAuthenticated);

  if (!appIsReady) {
    return <View style={{ flex: 1, backgroundColor: '#000' }} />;
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, setIsAuthenticated }}>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Slot />
        <StatusBar style="auto" />
      </ThemeProvider>
    </AuthContext.Provider>
  );
}
