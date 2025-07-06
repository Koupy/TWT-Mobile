import React, { useEffect, useState } from 'react';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Slot, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { View, Text, StyleSheet } from 'react-native';
import LogViewer from '../components/LogViewer';
import logger from '../utils/logger';
// Inline ErrorBoundary component instead of importing it
import { Component, ErrorInfo, ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error, errorInfo: null };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    this.setState({
      error,
      errorInfo
    });
    console.error('ErrorBoundary caught an error', error, errorInfo);
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <View style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: '#000000',
          padding: 20,
        }}>
          <Text style={{
            color: '#FF3B30',
            fontSize: 20,
            fontWeight: 'bold',
            marginBottom: 10,
          }}>Une erreur est survenue</Text>
          <Text style={{
            color: '#FFFFFF',
            fontSize: 16,
            textAlign: 'center',
            marginBottom: 20,
          }}>{this.state.error?.toString()}</Text>
          <Text style={{
            color: 'rgba(255, 255, 255, 0.6)',
            fontSize: 14,
            textAlign: 'center',
          }}>Veuillez redémarrer l'application</Text>
        </View>
      );
    }

    return this.props.children;
  }
}

import { useColorScheme } from '../hooks/useColorScheme';
import { AuthContextType, User } from '../types';

// Prevent display before loading is complete.
try {
  SplashScreen.preventAutoHideAsync();
} catch (e) {
  console.log('Error preventing splash screen hide:', e);
}

// Restauration du contexte d'authentification avec des valeurs par défaut
export const AuthContext = React.createContext<AuthContextType>({
  isAuthenticated: false,
  setIsAuthenticated: () => {},
  user: undefined,
  setUser: () => {},
});

// Fonction auxiliaire pour la redirection - pas un hook React
function redirectToLogin(router: ReturnType<typeof useRouter>) {
  console.log('[Navigation] Tentative de redirection vers login');
  
  setTimeout(() => {
    try {
      router.replace('/auth/login');
    } catch (e) {
      console.log('[Navigation] Erreur de redirection:', e);
    }
  }, 500);
}

export default function RootLayout() {
  const colorScheme = useColorScheme();
  // Définir l'état initial comme déconnecté pour éviter la connexion automatique
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | undefined>(undefined);
  const [appIsReady, setAppIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [startupComplete, setStartupComplete] = useState(false);

  // Préparation améliorée de l'application
  useEffect(() => {
    async function prepare() {
      try {
        // Réduire le délai de démarrage au minimum nécessaire
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Configurer le logger
        logger.configure({
          enableConsoleOutput: true,
          maxHistorySize: 500
        });
        
        // Logs de test pour la console Metro
        console.log('======= TEST LOGS DIRECTS =======');
        console.log('Test log direct 1');
        console.log('Test log direct 2');
        console.log('================================');
        
        // Logs via notre logger
        logger.info('APP', 'Application démarrée', { version: '1.0.0' });
        logger.debug('APP', 'Mode développement activé');
        logger.warn('APP', 'Test warn message');
        logger.error('APP', 'Test error message');
        logger.info('APP', 'Ces logs devraient apparaître dans la console Metro');
        
        // S'assurer explicitement qu'on démarre déconnecté
        setIsAuthenticated(false);
        setUser(undefined);
        
        // Marquer le démarrage comme terminé
        setStartupComplete(true);
      } catch (e) {
        logger.error('Startup', 'Erreur:', e);
        setError(String(e));
      } finally {
        // Marquer l'application comme prête
        setAppIsReady(true);
        
        // Cacher l'écran de démarrage avec un délai supplémentaire
        try {
          setTimeout(async () => {
            await SplashScreen.hideAsync();
            logger.info('Splash', 'Écran de démarrage masqué');
          }, 500);
        } catch (splashError) {
          logger.error('Splash', 'Erreur:', splashError);
        }
      }
    }

    prepare();
  }, []);

  // Gérer la redirection directement dans le composant RootLayout
  const segments = useSegments();
  const router = useRouter();
  const [isNavigationReady, setIsNavigationReady] = useState(false);
  
  // Première étape : s'assurer que la navigation est prête
  useEffect(() => {
    // N'activer que si l'application est prête
    if (appIsReady && startupComplete && segments.length >= 0) {
      // Activer la navigation immédiatement
      logger.info('Navigation', 'Navigation ready, segments:', segments);
      setIsNavigationReady(true);
    }
  }, [appIsReady, startupComplete, segments]);
  
  // Deuxième étape : rediriger vers login si nécessaire
  useEffect(() => {
    if (isNavigationReady) {
      logger.info('Layout', 'Démarrage terminé, protection des routes activée');
      
      // Vérifier le chemin de navigation actuel
      const currentSegment = segments.length > 0 ? String(segments[0]) : '';
      const inAuthGroup = currentSegment === 'auth';
      const inTabsGroup = currentSegment === '(tabs)';
      const isInitialRoute = currentSegment === '';
      
      logger.debug('Navigation', 'Auth status:', { isAuthenticated, inAuthGroup, inTabsGroup, isInitialRoute, segments });
      
      if (isInitialRoute && !isAuthenticated) {
        logger.info('Navigation', 'Route initiale -> login');
        router.replace('/auth/login');
      } else if (isAuthenticated && inAuthGroup) {
        logger.info('Navigation', 'Redirection vers tabs (déjà authentifié)');
        router.replace('/(tabs)/connection');
      } else if (!isAuthenticated && inTabsGroup) {
        logger.info('Navigation', 'Protection des routes -> login');
        router.replace('/auth/login');
      } else {
        logger.info('Navigation', 'Aucune redirection nécessaire');
      }
    }
  }, [isNavigationReady, segments, router, isAuthenticated]);

  // Écran de chargement pendant le démarrage
  if (!appIsReady) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Chargement de l'application...</Text>
      </View>
    );
  }

  // Show error screen if there was a startup error
  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorTitle}>Une erreur est survenue au démarrage</Text>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }
  
  // Version simplifiée mais avec contexte d'authentification
  logger.info('Layout', 'Rendu avec contexte auth (mais sans vérification API)');

  // Rendu avec contexte d'authentification rétabli
  return (
    <ErrorBoundary>
      <AuthContext.Provider value={{ isAuthenticated, setIsAuthenticated, user, setUser }}>
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          <Slot />
          <StatusBar style="auto" />
          {__DEV__ && <LogViewer initialVisible={false} />}
        </ThemeProvider>
      </AuthContext.Provider>
    </ErrorBoundary>
  );
}

// Styles for the layout
const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000000',
  },
  loadingText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000000',
    padding: 20,
  },
  errorTitle: {
    color: '#FF3B30',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  errorText: {
    color: '#FFFFFF',
    fontSize: 16,
    textAlign: 'center',
  },
});
