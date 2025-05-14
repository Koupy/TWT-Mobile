import React, { useEffect, useState } from 'react';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Slot, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/useColorScheme';
import { authService } from '../services/api';
import { AuthContextType, User } from '../types';

// Prevent display before loading is complete.
SplashScreen.preventAutoHideAsync();

// Authentication 
export const AuthContext = React.createContext<AuthContextType>({
  isAuthenticated: false,
  setIsAuthenticated: (value: boolean) => {},
});

function useProtectedRoute(isAuthenticated: boolean) {
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    // Wait for the application to be ready before navigating
    if (segments.length === 0) return;
    
    // Check if the first segment is 'auth' using a TypeScript-safe approach
    const inAuthGroup = segments[0] ? segments[0].toString() === 'auth' : false;
    
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
  const [user, setUser] = useState<User | undefined>(undefined);
  const [appIsReady, setAppIsReady] = useState(false);

  // Prepare the application and wait for everything to load
  useEffect(() => {
    async function prepare() {
      try {
        // Check if the user is already authenticated
        const isUserAuthenticated = await authService.isAuthenticated();
        setIsAuthenticated(isUserAuthenticated);
        
        // Wait for resources to load
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (e) {
        console.warn(e);
      } finally {
        // Indicate that the application is ready
        setAppIsReady(true);
        // Hide the loading screen
        await SplashScreen.hideAsync();
      }
    }

    prepare();
  }, []);

  // Use route protection directly
  useProtectedRoute(isAuthenticated);

  if (!appIsReady) {
    return <View style={{ flex: 1, backgroundColor: '#000' }} />;
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, setIsAuthenticated, user, setUser }}>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Slot />
        <StatusBar style="auto" />
      </ThemeProvider>
    </AuthContext.Provider>
  );
}
