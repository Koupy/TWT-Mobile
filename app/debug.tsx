import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar as RNStatusBar,
  Platform,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { authService, badgeService, activityService } from '../services/api';

export default function DebugScreen() {
  const router = useRouter();
  const [activeSection, setActiveSection] = useState<string>('users');
  // Define a type for API results
  type ApiResultsType = {
    users: any | null;
    badges: any | null;
    activities: any | null;
    badgeActivities: any | null;
    userActivities: any | null;
    authStatus: any | null;
    [key: string]: any | null;
  };

  const [apiResults, setApiResults] = useState<ApiResultsType>({
    users: null,
    badges: null,
    activities: null,
    badgeActivities: null,
    userActivities: null,
    authStatus: null,
  });
  type LoadingStateType = Record<string, boolean>;
  type ErrorStateType = Record<string, string>;
  
  const [loading, setLoading] = useState<LoadingStateType>({});
  const [errors, setErrors] = useState<ErrorStateType>({});
  const [logs, setLogs] = useState<string[]>([]);

  // Capture console logs
  useEffect(() => {
    const originalConsoleLog = console.log;
    const originalConsoleError = console.error;
    const originalConsoleWarn = console.warn;

    console.log = (...args) => {
      originalConsoleLog(...args);
      if (args[0]?.toString().includes('[API]')) {
        setLogs(prevLogs => [...prevLogs, `LOG: ${args.map(a => JSON.stringify(a)).join(' ')}`]);
      }
    };

    console.error = (...args) => {
      originalConsoleError(...args);
      setLogs(prevLogs => [...prevLogs, `ERROR: ${args.map(a => JSON.stringify(a)).join(' ')}`]);
    };

    console.warn = (...args) => {
      originalConsoleWarn(...args);
      setLogs(prevLogs => [...prevLogs, `WARN: ${args.map(a => JSON.stringify(a)).join(' ')}`]);
    };

    return () => {
      console.log = originalConsoleLog;
      console.error = originalConsoleError;
      console.warn = originalConsoleWarn;
    };
  }, []);

  const testApi = async (section: string) => {
    setLoading((prev: LoadingStateType) => ({ ...prev, [section]: true }));
    setErrors((prev: ErrorStateType) => ({ ...prev, [section]: '' }));
    
    try {
      let result;
      
      switch (section) {
        case 'users':
          result = await authService.getUserInfo();
          break;
        case 'badges':
          result = await badgeService.getAllBadges();
          break;
        case 'activities':
          result = await activityService.getAllActivities();
          break;
        case 'badgeActivities':
          // Get activities for the first badge
          const badges = await badgeService.getAllBadges();
          if (badges.length > 0) {
            result = await activityService.getActivitiesByBadge(badges[0].id);
          } else {
            throw new Error('No badges available to test badge activities');
          }
          break;
        case 'userActivities':
          // Get current user ID
          const user = await authService.getUserInfo();
          if (user) {
            result = await activityService.getActivitiesByUser(user.id);
          } else {
            throw new Error('No user available to test user activities');
          }
          break;
        case 'authStatus':
          result = {
            isAuthenticated: await authService.isAuthenticated(),
            user: await authService.getUserInfo(),
          };
          break;
        case 'createActivity':
          // Create a test activity for the first badge
          const badgesForActivity = await badgeService.getAllBadges();
          if (badgesForActivity.length > 0) {
            result = await activityService.createActivity({
              badge_id: badgesForActivity[0].id,
              location: 'Test Location',
              success: true,
              timestamp: new Date().toISOString(),
              details: 'Test activity created from debug screen'
            });
          } else {
            throw new Error('No badges available to create test activity');
          }
          break;
        default:
          throw new Error(`Unknown section: ${section}`);
      }
      
      setApiResults((prev: ApiResultsType) => ({ ...prev, [section]: result }));
    } catch (error) {
      console.error(`Error testing ${section}:`, error);
      setErrors((prev: ErrorStateType) => ({ ...prev, [section]: error instanceof Error ? error.message : 'Unknown error' }));
    } finally {
      setLoading((prev: LoadingStateType) => ({ ...prev, [section]: false }));
    }
  };

  const clearLogs = () => {
    setLogs([]);
  };

  const renderSection = (title: string, key: string) => {
    const isActive = activeSection === key;
    
    return (
      <TouchableOpacity
        style={[styles.sectionTab, isActive && styles.activeTab]}
        onPress={() => setActiveSection(key)}
      >
        <Text style={[styles.sectionTabText, isActive && styles.activeTabText]}>{title}</Text>
      </TouchableOpacity>
    );
  };

  const renderApiTest = (title: string, section: string) => {
    const isLoading = loading[section];
    const error = errors[section];
    const result = apiResults[section];
    
    return (
      <View style={styles.apiTestContainer}>
        <View style={styles.apiTestHeader}>
          <Text style={styles.apiTestTitle}>{title}</Text>
          <TouchableOpacity 
            style={styles.testButton}
            onPress={() => testApi(section)}
            disabled={isLoading}
          >
            <Text style={styles.testButtonText}>
              {isLoading ? 'Chargement...' : 'Tester'}
            </Text>
          </TouchableOpacity>
        </View>
        
        {error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>Erreur: {error}</Text>
          </View>
        ) : null}
        
        {result ? (
          <View style={styles.resultContainer}>
            <Text style={styles.resultText}>
              {JSON.stringify(result, null, 2)}
            </Text>
          </View>
        ) : (
          <Text style={styles.noResultText}>Pas de résultat</Text>
        )}
      </View>
    );
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'users':
        return renderApiTest('Informations Utilisateur', 'users');
      case 'badges':
        return renderApiTest('Badges', 'badges');
      case 'activities':
        return renderApiTest('Activités', 'activities');
      case 'badgeActivities':
        return renderApiTest('Activités par Badge', 'badgeActivities');
      case 'userActivities':
        return renderApiTest('Activités par Utilisateur', 'userActivities');
      case 'authStatus':
        return renderApiTest('Statut d\'Authentification', 'authStatus');
      case 'createActivity':
        return renderApiTest('Créer une Activité', 'createActivity');
      case 'mockData':
        return (
          <View style={styles.mockDataContainer}>
            <Text style={styles.mockDataTitle}>Données de Test</Text>
            <ScrollView style={styles.mockDataScroll}>
              <Text style={styles.mockDataText}>
                Les données simulées ont été supprimées. L'application utilise désormais exclusivement l'API réelle.
              </Text>
            </ScrollView>
          </View>
        );
      case 'logs':
        return (
          <View style={styles.logsContainer}>
            <View style={styles.logsHeader}>
              <Text style={styles.logsTitle}>Logs API</Text>
              <TouchableOpacity style={styles.clearLogsButton} onPress={clearLogs}>
                <Text style={styles.clearLogsText}>Effacer</Text>
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.logsScroll}>
              {logs.length === 0 ? (
                <Text style={styles.noLogsText}>Pas de logs disponibles</Text>
              ) : (
                logs.map((log, index) => (
                  <Text key={index} style={styles.logText}>
                    {log}
                  </Text>
                ))
              )}
            </ScrollView>
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Débogage API</Text>
      </View>
      
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabsContainer}>
        {renderSection('Utilisateur', 'users')}
        {renderSection('Badges', 'badges')}
        {renderSection('Activités', 'activities')}
        {renderSection('Activités/Badge', 'badgeActivities')}
        {renderSection('Activités/User', 'userActivities')}
        {renderSection('Auth Status', 'authStatus')}
        {renderSection('Créer Activité', 'createActivity')}
        {renderSection('Mock Data', 'mockData')}
        {renderSection('Logs', 'logs')}
      </ScrollView>
      
      <ScrollView style={styles.content}>
        {renderContent()}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
    paddingTop: Platform.OS === 'android' ? RNStatusBar.currentHeight : 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  tabsContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
  },
  sectionTab: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#0A84FF',
  },
  sectionTabText: {
    fontSize: 14,
    color: '#AAAAAA',
  },
  activeTabText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  apiTestContainer: {
    marginBottom: 20,
  },
  apiTestHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  apiTestTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  testButton: {
    backgroundColor: '#0A84FF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  testButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  errorContainer: {
    backgroundColor: 'rgba(255, 59, 48, 0.2)',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  errorText: {
    color: '#FF3B30',
  },
  resultContainer: {
    backgroundColor: '#1C1C1E',
    padding: 12,
    borderRadius: 8,
  },
  resultText: {
    color: '#FFFFFF',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontSize: 12,
  },
  noResultText: {
    color: '#777777',
    fontStyle: 'italic',
  },
  mockDataContainer: {
    flex: 1,
  },
  mockDataTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  mockDataScroll: {
    backgroundColor: '#1C1C1E',
    padding: 12,
    borderRadius: 8,
    maxHeight: 500,
  },
  mockDataText: {
    color: '#FFFFFF',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontSize: 12,
  },
  logsContainer: {
    flex: 1,
  },
  logsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  logsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  clearLogsButton: {
    backgroundColor: '#555555',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  clearLogsText: {
    color: '#FFFFFF',
  },
  logsScroll: {
    backgroundColor: '#1C1C1E',
    padding: 12,
    borderRadius: 8,
    maxHeight: 500,
  },
  logText: {
    color: '#FFFFFF',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontSize: 11,
    marginBottom: 4,
  },
  noLogsText: {
    color: '#777777',
    fontStyle: 'italic',
  },
});
