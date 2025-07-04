import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Image,
  Animated,
  Dimensions,
  Platform,
  Modal,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';

// Import API services
import { badgeService, activityService, authService } from '../../services/api';
import formatDateToFrenchFormat from '../../utils/dateFormatter';
import type { Badge as ApiBadge, Activity as ApiActivity, UserResponse } from '../../services/api';
import NfcManager from 'react-native-nfc-manager';

// Badge interface
interface Badge {
  id: string;
  name: string;
  type: string;
  iconName: keyof typeof Ionicons.glyphMap;
  color: string;
  location?: string;
  description?: string;
  lastUsed?: string;
}

// Convert API badge to UI badge
const convertApiBadgeToUiBadge = (apiBadge: ApiBadge): Badge => {
  const name = apiBadge.name;
  const type = 'Accès Principal';
  const iconName: keyof typeof Ionicons.glyphMap = 'key-outline';
  const color = apiBadge.color;
  const location = 'Entrée A';
  const description = `Badge d'accès ${apiBadge.status.toLowerCase()}`;
  const lastUsed = apiBadge.updated_at;

  return {
    id: apiBadge.id,
    name: name,
    type: type,
    iconName: iconName,
    color: color,
    location: location,
    description: description,
    lastUsed: formatDateToFrenchFormat(lastUsed) // Assurez-vous que formatDateToFrenchFormat gère bien les dates
  };
};

// Activity interface
interface Activity {
  id: string;
  badgeId: string;
  badgeName: string;
  location: string;
  timestamp: string;
  success: boolean;
  details?: string;
}

// Convert API activity to UI activity
const convertApiActivityToUiActivity = (apiActivity: ApiActivity): Activity => {
  return {
    id: apiActivity.id,
    badgeId: apiActivity.badgeId,
    badgeName: apiActivity.badgeName,
    location: apiActivity.location,
    timestamp: formatDateToFrenchFormat(apiActivity.timestamp),
    success: apiActivity.success,
    details: apiActivity.details
  };
};

export default function HomeScreen() {
  const [badges, setBadges] = useState<Badge[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [userName, setUserName] = useState<string>('');
  const [currentUser, setCurrentUser] = useState<UserResponse | null>(null);
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc'); // desc = newest first, asc = oldest first
  // Initialize scrollX with 0 to highlight first dot
  const scrollX = useRef(new Animated.Value(0)).current;
  const { width: screenWidth } = Dimensions.get('window');
  
  // State for badge detail modal
  const [selectedBadge, setSelectedBadge] = useState<Badge | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [badgeActivities, setBadgeActivities] = useState<Activity[]>([]);
  
  // Sort activities based on current sort order
  const sortActivities = (activitiesToSort: Activity[]) => {
    return [...activitiesToSort].sort((a, b) => {
      // Parse date in format DD-MM-YYYY HH:MM:SS
      const parseDate = (dateString: string) => {
        try {
          const [datePart, timePart] = dateString.split(' ');
          const [day, month, year] = datePart.split('-').map(Number);
          const [hours, minutes, seconds] = timePart.split(':').map(Number);
          
          // Month is 0-indexed in JavaScript Date
          return new Date(year, month - 1, day, hours, minutes, seconds);
        } catch (error) {
          console.warn('Error parsing date:', dateString, error);
          return new Date(0); // Return epoch date as fallback
        }
      };
      
      const dateA = parseDate(a.timestamp);
      const dateB = parseDate(b.timestamp);
      
      return sortOrder === 'desc' ? dateB.getTime() - dateA.getTime() : dateA.getTime() - dateB.getTime();
    });
  };
  
  // Refresh activities
  const refreshActivities = async () => {
    setIsLoading(true);
    try {
      // Load activities
      const apiActivities = await activityService.getAllActivities();
      if (apiActivities && apiActivities.length > 0) {
        const uiActivities = apiActivities.map(convertApiActivityToUiActivity);
        setActivities(sortActivities(uiActivities));
      }
    } catch (error) {
      console.warn('Error refreshing activities:', error);
      // Sort existing activities if refresh fails
      setActivities(sortActivities([...activities]));
    } finally {
      setIsLoading(false);
    }
  };
  
  // Toggle sort order
  const toggleSortOrder = () => {
    const newSortOrder = sortOrder === 'desc' ? 'asc' : 'desc';
    setSortOrder(newSortOrder);
  };
  
  // Effect to re-sort activities when sort order changes
  useEffect(() => {
    if (activities.length > 0) {
      setActivities(sortActivities([...activities]));
    }
  }, [sortOrder]);
  
  useEffect(() => {
    const originalConsoleWarn = console.warn;
    console.warn = (...args) => {
      const message = args.join(' ');
      if (message.includes('null value') && message.includes('TypeError')) {
        return;
      }
      originalConsoleWarn(...args);
    };
    
    return () => {
      console.warn = originalConsoleWarn;
      console.warn = originalConsoleWarn;
    };
  }, []);

  // Load data from API
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        // Load user information
        const userInfo = await authService.getUserInfo();
        if (userInfo) {
          setCurrentUser(userInfo);
          if (userInfo.first_name) {
            setUserName(userInfo.first_name);
          }
        }

        // Load badges
        try {
          const apiBadges = await badgeService.getAllBadges();
          if (apiBadges && apiBadges.length > 0) {
            const uiBadges = apiBadges.map(convertApiBadgeToUiBadge);
            setBadges(uiBadges);
          }
        } catch (error) {
          console.warn('Error loading badges:', error);
          // Garder le tableau vide en cas d'erreur
          setBadges([]);
        }

        // Load activities
        try {
          const apiActivities = await activityService.getAllActivities();
          if (apiActivities && apiActivities.length > 0) {
            const uiActivities = apiActivities.map(convertApiActivityToUiActivity);
            setActivities(sortActivities(uiActivities));
          }
        } catch (error) {
          console.warn('Error loading activities:', error);
          // Garder le tableau vide en cas d'erreur
          setActivities([]);
        }
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();

    // Force update of animation value to ensure first dot is highlighted
    scrollX.setValue(0);
  }, []);

  // Use a badge and show details
  const useBadge = async (badge: Badge) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    try {
      // Get activities specific to this badge from the API
      const badgeActivitiesFromApi = await activityService.getActivitiesByBadge(badge.id);
      const filteredActivities = badgeActivitiesFromApi.map(convertApiActivityToUiActivity);
      
      // If no activity is found, use local filtering
      if (filteredActivities.length === 0) {
        const localFilteredActivities = activities.filter(activity => activity.badgeId === badge.id);
        setBadgeActivities(localFilteredActivities);
      } else {
        setBadgeActivities(filteredActivities);
      }
    } catch (error) {
      console.warn('Error retrieving badge activities:', error);
      // Fallback: filter activities locally
      const localFilteredActivities = activities.filter(activity => activity.badgeId === badge.id);
      setBadgeActivities(localFilteredActivities);
    }
    
    // Set selected badge and show modal
    setSelectedBadge(badge);
    setModalVisible(true);
  };

  // Badge render
  const renderBadge = ({ item, index }: { item: Badge; index: number }) => {
    return (
      <TouchableOpacity
        style={[styles.badgeCard, { backgroundColor: item.color + '20' }]}
        onPress={() => useBadge(item)}
        activeOpacity={0.7}
      >
        <BlurView intensity={20} tint="dark" style={styles.badgeBlur}>
          <View style={[styles.iconContainer, { backgroundColor: item.color }]}>
            <Ionicons name={item.iconName} size={30} color="#FFFFFF" />
          </View>
          <Text style={styles.badgeName}>{item.name}</Text>
          <Text style={styles.badgeType}>{item.type}</Text>
          {item.location && (
            <View style={styles.locationContainer}>
              <Ionicons name="location-outline" size={14} color="rgba(255, 255, 255, 0.6)" />
              <Text style={styles.locationText}>{item.location}</Text>
            </View>
          )}
        </BlurView>
      </TouchableOpacity>
    );
  };

  // Activity render
  const renderActivity = ({ item }: { item: Activity }) => {
    return (
      <View style={styles.activityItem}>
        <View style={styles.activityIconContainer}>
          <Ionicons
            name={item.success ? 'checkmark-circle' : 'close-circle'}
            size={24}
            color={item.success ? '#30D158' : '#FF3B30'}
          />
        </View>
        <View style={styles.activityContent}>
          <Text style={styles.activityTitle}>{item.badgeName}</Text>
          <Text style={styles.activityLocation}>{item.location}</Text>
        </View>
        <Text style={styles.activityTime}>{item.timestamp}</Text>
      </View>
    );
  };

  // Track current page index
  const [currentIndex, setCurrentIndex] = useState(0);
  
  // Handle scroll events to update current index
  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { x: scrollX } } }],
    { 
      useNativeDriver: false,
      listener: (event: any) => {
        const offsetX = event.nativeEvent.contentOffset.x;
        const pageIndex = Math.round(offsetX / (screenWidth * 0.75 + 20));
        if (pageIndex !== currentIndex) {
          setCurrentIndex(pageIndex);
        }
      } 
    }
  );
  
  // Simple pagination dots
  const renderPaginationDots = () => {
    return (
      <View style={styles.paginationContainer}>
        {badges.map((_, i) => (
          <View
            key={i}
            style={[
              styles.dot,
              { 
                width: currentIndex === i ? 16 : 8,
                backgroundColor: currentIndex === i 
                  ? 'rgba(255, 255, 255, 1)' 
                  : 'rgba(255, 255, 255, 0.3)'
              }
            ]}
          />
        ))}
      </View>
    );
  };

  // Render badge detail modal
  const renderBadgeDetailModal = () => {
    if (!selectedBadge) return null;
    
    return (
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {/* Header with close button */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Détails du badge</Text>
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={() => setModalVisible(false)}
              >
                <Ionicons name="close" size={24} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
            
            {/* Badge info */}
            <View style={styles.badgeDetailContainer}>
              <View style={[styles.badgeIconLarge, { backgroundColor: selectedBadge.color }]}>
                <Ionicons name={selectedBadge.iconName} size={40} color="#FFFFFF" />
              </View>
              
              <View style={styles.badgeInfoContainer}>
                <Text style={styles.badgeDetailName}>{selectedBadge.name}</Text>
                <Text style={styles.badgeDetailType}>{selectedBadge.type}</Text>
                
                <View style={styles.badgeDetailRow}>
                  <Ionicons name="location-outline" size={16} color="rgba(255, 255, 255, 0.7)" />
                  <Text style={styles.badgeDetailLocation}>{selectedBadge.location}</Text>
                </View>
                
                <View style={styles.badgeDetailRow}>
                  <Ionicons name="time-outline" size={16} color="rgba(255, 255, 255, 0.7)" />
                  <Text style={styles.badgeDetailLastUsed}>Dernière utilisation: {selectedBadge.lastUsed}</Text>
                </View>
              </View>
            </View>
            
            {/* Badge description */}
            <View style={styles.descriptionContainer}>
              <Text style={styles.descriptionTitle}>Description</Text>
              <Text style={styles.descriptionText}>{selectedBadge.description}</Text>
            </View>
            
            {/* Badge specific activities */}
            <View style={styles.badgeActivitiesContainer}>
              <Text style={styles.badgeActivitiesTitle}>Historique d'accès</Text>
              
              {badgeActivities.length > 0 ? (
                <FlatList
                  data={badgeActivities}
                  keyExtractor={(item) => item.id}
                  renderItem={({ item }) => (
                    <View style={styles.badgeActivityItem}>
                      <View style={styles.badgeActivityStatus}>
                        <Ionicons 
                          name={item.success ? "checkmark-circle" : "close-circle"} 
                          size={20} 
                          color={item.success ? "#30D158" : "#FF3B30"} 
                        />
                      </View>
                      <View style={styles.badgeActivityInfo}>
                        <Text style={styles.badgeActivityLocation}>{item.location}</Text>
                        <Text style={styles.badgeActivityTime}>{item.timestamp}</Text>
                      </View>
                    </View>
                  )}
                  style={styles.badgeActivityList}
                />
              ) : (
                <Text style={styles.noActivitiesText}>Aucun historique disponible</Text>
              )}
            </View>
            
            {/* Button container */}
            <View style={styles.buttonContainer}>
              {/* Use badge button */}
              <TouchableOpacity 
                style={[styles.useBadgeButton, { backgroundColor: selectedBadge.color }]}
                onPress={async () => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

                  if (!selectedBadge || !currentUser) {
                    console.error('Selected badge or current user is missing.');
                    return;
                  }
                  
                  try {
                    // Create a new activity for badge usage
                    await activityService.createActivity({
                      badge_id: selectedBadge.id,
                      user_id: currentUser.id,
                      location: selectedBadge.location || 'Emplacement inconnu',
                      success: true,
                      timestamp: new Date().toISOString(),
                      details: "Badge utilisé via l'application mobile"
                    });
                    
                    // Refresh activities
                    const newActivities = await activityService.getAllActivities();
                    setActivities(newActivities.map(convertApiActivityToUiActivity));
                    
                    // Update activities for the selected badge
                    const badgeActivitiesFromApi = await activityService.getActivitiesByBadge(selectedBadge.id);
                    setBadgeActivities(badgeActivitiesFromApi.map(convertApiActivityToUiActivity));
                    
                    alert(`Badge ${selectedBadge.name} utilisé avec succès`);
                  } catch (error) {
                    console.warn('Error using badge:', error);
                    // Simulate badge usage if API fails
                    alert(`Badge ${selectedBadge.name} utilisé avec succès (simulation)`);
                  }
                }}
              >
                <Ionicons name="scan-outline" size={20} color="#FFFFFF" style={styles.buttonIcon} />
                <Text style={styles.buttonText}>Utiliser</Text>
              </TouchableOpacity>
              
              {/* Share via NFC button */}
              <TouchableOpacity 
                style={styles.nfcButton}
                onPress={async () => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                  
                  if (!selectedBadge) {
                    Alert.alert('Erreur', 'Aucun badge sélectionné');
                    return;
                  }
                  
                  try {
                    try {
                      await NfcManager.start();
                      console.log('NFC Manager démarré avec succès (patch Samsung Galaxy A13)');
                    } catch (initError) {
                      console.debug('Initialisation NFC ignorée (probablement déjà initialisé)');
                    }
                    
                    const isSupported = await NfcManager.isSupported();
                    if (!isSupported) {
                      Alert.alert('NFC non disponible', 'Cet appareil ne supporte pas la technologie NFC');
                      return;
                    }
                    
                    if (Platform.OS === 'android') {
                      const isEnabled = await NfcManager.isEnabled();
                      if (!isEnabled) {
                        Alert.alert('NFC désactivé', 'Veuillez activer NFC dans les paramètres de votre appareil pour utiliser cette fonctionnalité.');
                        return;
                      }
                    }
                    
                    console.log('NFC disponible et activé');
                  } catch (error) {
                    if (error instanceof TypeError && error.message.includes('null value')) {
                      console.debug('Erreur Samsung Galaxy A13 détectée, continuation en mode fallback');
                    } else {
                      console.error('Erreur lors de la vérification NFC:', error);
                      Alert.alert('Erreur NFC', 'Une erreur s\'est produite lors de la vérification du NFC');
                      return;
                    }
                  }
                  
                  setModalVisible(false);
                  router.push(`/nfc?badgeId=${selectedBadge.id}` as any);
                }}
              >
                <Ionicons name="wifi" size={20} color="#FFFFFF" style={styles.buttonIcon} />
                <Text style={styles.buttonText}>NFC</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      
      <View style={styles.header}>
        <Text style={styles.greeting}>Bonjour, {userName}</Text>
        <TouchableOpacity style={styles.notificationButton}>
          <Ionicons name="notifications-outline" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
      
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.sectionTitle}>Vos badges</Text>
        
        <View>
          <Animated.FlatList
            data={badges}
            keyExtractor={(item) => item.id}
            renderItem={renderBadge}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.badgesContainer}
            snapToInterval={screenWidth * 0.75 + 20}
            decelerationRate="fast"
            pagingEnabled
            snapToAlignment="center"
            onScroll={handleScroll}
          />
          {renderPaginationDots()}
        </View>
        
        <View style={styles.activitiesSection}>
          <View style={styles.activitiesHeader}>
            <Text style={styles.sectionTitle}>Activité récente</Text>
            <View style={styles.activitiesActions}>
              {/* Sort button */}
              <TouchableOpacity 
                style={styles.actionButton}
                onPress={toggleSortOrder}
              >
                <Ionicons 
                  name={sortOrder === 'desc' ? 'arrow-down' : 'arrow-up'} 
                  size={18} 
                  color="#FFFFFF" 
                />
              </TouchableOpacity>
              
              {/* Refresh button */}
              <TouchableOpacity 
                style={styles.actionButton}
                onPress={refreshActivities}
                disabled={isLoading}
              >
                <Ionicons 
                  name="refresh" 
                  size={18} 
                  color="#FFFFFF" 
                  style={isLoading ? { opacity: 0.5 } : undefined}
                />
              </TouchableOpacity>
            </View>
          </View>
          
          {/* Indicator text showing current sort order */}
          <Text style={styles.sortIndicator}>
            {sortOrder === 'desc' ? 'Plus récent d\'abord' : 'Plus ancien d\'abord'}
          </Text>
          
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Chargement des activités...</Text>
            </View>
          ) : (
            <FlatList
              data={activities}
              keyExtractor={(item) => item.id}
              renderItem={renderActivity}
              scrollEnabled={false}
              ListEmptyComponent={(
                <View style={styles.emptyListContainer}>
                  <Text style={styles.emptyListText}>Aucune activité récente</Text>
                </View>
              )}
            />
          )}
        </View>
      </ScrollView>
      
      {/* Badge detail modal */}
      {renderBadgeDetailModal()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
    paddingTop: Platform.OS === 'ios' ? 20 : 10, // Add top spacing
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 25, // Increase top padding
    paddingBottom: 20,
    marginTop: 10, // Extra margin for spacing
  },
  greeting: {
    fontSize: 24,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  notificationButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    paddingBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 15,
  },
  badgesContainer: {
    paddingHorizontal: 10,
  },
  badgeCard: {
    width: Dimensions.get('window').width * 0.75,
    height: 180,
    borderRadius: 16,
    marginHorizontal: 10,
    overflow: 'hidden',
  },
  badgeBlur: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#0A84FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  badgeName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 5,
  },
  badgeType: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
    marginBottom: 10,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
    marginLeft: 5,
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 15,
  },
  dot: {
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    marginHorizontal: 4,
  },
  activitiesSection: {
    marginTop: 10,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 12,
    padding: 15,
    marginHorizontal: 20,
    marginBottom: 12,
  },
  activityIconContainer: {
    marginRight: 15,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  activityLocation: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  activityTime: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.4)',
  },
  activitiesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 15,
  },
  activitiesActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  sortMenu: {
    backgroundColor: '#1C1C1E',
    borderRadius: 12,
    marginHorizontal: 20,
    marginBottom: 15,
    padding: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  sortOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
  },
  selectedSortOption: {
    backgroundColor: 'rgba(10, 132, 255, 0.1)',
  },
  sortOptionText: {
    fontSize: 14,
    color: '#FFFFFF',
    marginLeft: 10,
  },
  selectedSortOptionText: {
    color: '#0A84FF',
    fontWeight: '500',
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  emptyListContainer: {
    padding: 30,
    alignItems: 'center',
  },
  emptyListText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
    fontStyle: 'italic',
  },
  sortIndicator: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.5)',
    textAlign: 'center',
    marginBottom: 10,
    marginTop: -5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#121212',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeDetailContainer: {
    flexDirection: 'row',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  badgeIconLarge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 20,
  },
  badgeInfoContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  badgeDetailName: {
    fontSize: 22,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 5,
  },
  badgeDetailType: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 10,
  },
  badgeDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  badgeDetailLocation: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    marginLeft: 8,
  },
  badgeDetailLastUsed: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    marginLeft: 8,
  },
  descriptionContainer: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  descriptionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 10,
  },
  descriptionText: {
    fontSize: 14,
    lineHeight: 20,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  badgeActivitiesContainer: {
    padding: 20,
    maxHeight: 250,
  },
  badgeActivitiesTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 15,
  },
  badgeActivityList: {
    maxHeight: 200,
  },
  badgeActivityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
  },
  badgeActivityStatus: {
    marginRight: 12,
  },
  badgeActivityInfo: {
    flex: 1,
  },
  badgeActivityLocation: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  badgeActivityTime: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.5)',
  },
  noActivitiesText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.5)',
    textAlign: 'center',
    marginTop: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    gap: 10,
    marginHorizontal: 20,
  },
  useBadgeButton: {
    flex: 1,
    backgroundColor: '#30D158',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 10,
  },
  nfcButton: {
    flex: 1,
    backgroundColor: '#0A84FF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 10,
  },
  buttonIcon: {
    marginRight: 10,
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
