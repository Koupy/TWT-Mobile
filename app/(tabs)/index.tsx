import React, { useState, useRef } from 'react';
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
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';

// Badge interface
interface Badge {
  id: string;
  name: string;
  type: string;
  iconName: keyof typeof Ionicons.glyphMap;
  color: string;
  location?: string;
}

// Activity interface
interface Activity {
  id: string;
  badgeId: string;
  badgeName: string;
  location: string;
  timestamp: string;
  success: boolean;
}

// Fake badge data
const fakeBadges: Badge[] = [
  {
    id: '1',
    name: 'Badge Principal',
    type: 'Bâtiment',
    iconName: 'business',
    color: '#0A84FF',
    location: 'Immeuble Principal',
  },
  {
    id: '2',
    name: 'Badge Parking',
    type: 'Véhicule',
    iconName: 'car',
    color: '#30D158',
    location: 'Parking Souterrain',
  },
  {
    id: '3',
    name: 'Badge Bureau',
    type: 'Salle',
    iconName: 'desktop',
    color: '#FF9F0A',
    location: 'Bureau 42',
  },
  {
    id: '4',
    name: 'Badge Cafétéria',
    type: 'Zone',
    iconName: 'cafe',
    color: '#FF375F',
    location: 'Cafétéria Principale',
  },
];

// Fake activity data
const fakeActivities: Activity[] = [
  {
    id: '1',
    badgeId: '1',
    badgeName: 'Badge Principal',
    location: 'Entrée Principale',
    timestamp: "Aujourd'hui, 09:32",
    success: true,
  },
  {
    id: '2',
    badgeId: '2',
    badgeName: 'Badge Parking',
    location: 'Barrière Entrée',
    timestamp: "Aujourd'hui, 09:15",
    success: true,
  },
  {
    id: '3',
    badgeId: '3',
    badgeName: 'Badge Bureau',
    location: 'Bureau 42',
    timestamp: 'Hier, 18:45',
    success: true,
  },
  {
    id: '4',
    badgeId: '1',
    badgeName: 'Badge Principal',
    location: 'Entrée Secondaire',
    timestamp: 'Hier, 13:20',
    success: false,
  },
];

export default function HomeScreen() {
  const [badges] = useState<Badge[]>(fakeBadges);
  const [activities] = useState<Activity[]>(fakeActivities);
  const scrollX = useRef(new Animated.Value(0)).current;
  const { width: screenWidth } = Dimensions.get('window');

  // Use a badge
  const useBadge = (badge: Badge) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    // Simulate badge usage
    console.log(`Utilisation du badge: ${badge.name}`);
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

  // Pagination dots
  const renderPaginationDots = () => {
    return (
      <View style={styles.paginationContainer}>
        {badges.map((_, i) => {
          const inputRange = [
            (i - 1) * screenWidth,
            i * screenWidth,
            (i + 1) * screenWidth,
          ];
          
          const dotWidth = scrollX.interpolate({
            inputRange,
            outputRange: [8, 16, 8],
            extrapolate: 'clamp',
          });
          
          const opacity = scrollX.interpolate({
            inputRange,
            outputRange: [0.3, 1, 0.3],
            extrapolate: 'clamp',
          });
          
          return (
            <Animated.View
              key={i}
              style={[
                styles.dot,
                { width: dotWidth, opacity },
              ]}
            />
          );
        })}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      
      <View style={styles.header}>
        <Text style={styles.greeting}>Bonjour, Utilisateur</Text>
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
            onScroll={Animated.event(
              [{ nativeEvent: { contentOffset: { x: scrollX } } }],
              { useNativeDriver: false }
            )}
          />
          {renderPaginationDots()}
        </View>
        
        <View style={styles.activitiesSection}>
          <Text style={styles.sectionTitle}>Activité récente</Text>
          <FlatList
            data={activities}
            keyExtractor={(item) => item.id}
            renderItem={renderActivity}
            scrollEnabled={false}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
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
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    paddingBottom: 100,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 15,
  },
  badgesContainer: {
    paddingHorizontal: 20,
  },
  badgeCard: {
    width: Dimensions.get('window').width * 0.75,
    height: 180,
    borderRadius: 20,
    marginRight: 20,
    overflow: 'hidden',
  },
  badgeBlur: {
    padding: 20,
    borderRadius: 20,
    height: '100%',
    justifyContent: 'space-between',
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
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
    backgroundColor: '#FFFFFF',
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
});
