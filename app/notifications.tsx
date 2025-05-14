import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Switch,
  Platform,
  StatusBar as RNStatusBar,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';

export default function NotificationsScreen() {
  const router = useRouter();
  
  // Notification settings state
  const [badgeNotifications, setBadgeNotifications] = useState(true);
  const [securityAlerts, setSecurityAlerts] = useState(true);
  const [newsUpdates, setNewsUpdates] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [vibrationEnabled, setVibrationEnabled] = useState(true);
  
  // Handle toggle with haptic feedback
  const handleToggle = (setter: React.Dispatch<React.SetStateAction<boolean>>, value: boolean) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setter(value);
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.title}>Notifications</Text>
        <View style={styles.placeholder} />
      </View>
      
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Types de notifications</Text>
          
          <View style={styles.card}>
            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <View style={styles.settingIconContainer}>
                  <Ionicons name="card" size={20} color="#0A84FF" />
                </View>
                <View>
                  <Text style={styles.settingTitle}>Activité des badges</Text>
                  <Text style={styles.settingDescription}>Notifications lors de l'utilisation de vos badges</Text>
                </View>
              </View>
              <Switch
                value={badgeNotifications}
                onValueChange={(value) => handleToggle(setBadgeNotifications, value)}
                trackColor={{ false: '#3e3e3e', true: '#0A84FF' }}
                thumbColor="#FFFFFF"
              />
            </View>
            
            <View style={styles.separator} />
            
            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <View style={styles.settingIconContainer}>
                  <Ionicons name="shield-checkmark" size={20} color="#0A84FF" />
                </View>
                <View>
                  <Text style={styles.settingTitle}>Alertes de sécurité</Text>
                  <Text style={styles.settingDescription}>Notifications concernant la sécurité de votre compte</Text>
                </View>
              </View>
              <Switch
                value={securityAlerts}
                onValueChange={(value) => handleToggle(setSecurityAlerts, value)}
                trackColor={{ false: '#3e3e3e', true: '#0A84FF' }}
                thumbColor="#FFFFFF"
              />
            </View>
            
            <View style={styles.separator} />
            
            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <View style={styles.settingIconContainer}>
                  <Ionicons name="newspaper" size={20} color="#0A84FF" />
                </View>
                <View>
                  <Text style={styles.settingTitle}>Actualités et mises à jour</Text>
                  <Text style={styles.settingDescription}>Informations sur les nouvelles fonctionnalités</Text>
                </View>
              </View>
              <Switch
                value={newsUpdates}
                onValueChange={(value) => handleToggle(setNewsUpdates, value)}
                trackColor={{ false: '#3e3e3e', true: '#0A84FF' }}
                thumbColor="#FFFFFF"
              />
            </View>
          </View>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Préférences</Text>
          
          <View style={styles.card}>
            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <View style={styles.settingIconContainer}>
                  <Ionicons name="volume-high" size={20} color="#0A84FF" />
                </View>
                <View>
                  <Text style={styles.settingTitle}>Sons</Text>
                  <Text style={styles.settingDescription}>Activer les sons pour les notifications</Text>
                </View>
              </View>
              <Switch
                value={soundEnabled}
                onValueChange={(value) => handleToggle(setSoundEnabled, value)}
                trackColor={{ false: '#3e3e3e', true: '#0A84FF' }}
                thumbColor="#FFFFFF"
              />
            </View>
            
            <View style={styles.separator} />
            
            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <View style={styles.settingIconContainer}>
                  <Ionicons name="phone-portrait" size={20} color="#0A84FF" />
                </View>
                <View>
                  <Text style={styles.settingTitle}>Vibrations</Text>
                  <Text style={styles.settingDescription}>Activer les vibrations pour les notifications</Text>
                </View>
              </View>
              <Switch
                value={vibrationEnabled}
                onValueChange={(value) => handleToggle(setVibrationEnabled, value)}
                trackColor={{ false: '#3e3e3e', true: '#0A84FF' }}
                thumbColor="#FFFFFF"
              />
            </View>
            
            <View style={styles.separator} />
            
            <TouchableOpacity style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <View style={styles.settingIconContainer}>
                  <Ionicons name="time" size={20} color="#0A84FF" />
                </View>
                <View>
                  <Text style={styles.settingTitle}>Mode Ne pas déranger</Text>
                  <Text style={styles.settingDescription}>Configurer les plages horaires silencieuses</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color="rgba(255, 255, 255, 0.4)" />
            </TouchableOpacity>
          </View>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Historique</Text>
          
          <View style={styles.card}>
            <TouchableOpacity style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <View style={styles.settingIconContainer}>
                  <Ionicons name="list" size={20} color="#0A84FF" />
                </View>
                <View>
                  <Text style={styles.settingTitle}>Centre de notifications</Text>
                  <Text style={styles.settingDescription}>Voir toutes les notifications récentes</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color="rgba(255, 255, 255, 0.4)" />
            </TouchableOpacity>
            
            <View style={styles.separator} />
            
            <TouchableOpacity style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <View style={styles.settingIconContainer}>
                  <Ionicons name="trash-bin" size={20} color="#0A84FF" />
                </View>
                <View>
                  <Text style={styles.settingTitle}>Effacer l'historique</Text>
                  <Text style={styles.settingDescription}>Supprimer toutes les notifications</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color="rgba(255, 255, 255, 0.4)" />
            </TouchableOpacity>
          </View>
        </View>
        
        <TouchableOpacity style={styles.resetButton}>
          <Text style={styles.resetButtonText}>Réinitialiser les paramètres de notification</Text>
        </TouchableOpacity>
      </ScrollView>
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
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  placeholder: {
    width: 40,
  },
  content: {
    paddingBottom: 30,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginHorizontal: 20,
    marginBottom: 12,
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    marginHorizontal: 20,
    overflow: 'hidden',
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 10,
  },
  settingIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(10, 132, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  separator: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginHorizontal: 16,
  },
  resetButton: {
    backgroundColor: 'rgba(255, 149, 0, 0.1)',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginHorizontal: 20,
    marginTop: 16,
    marginBottom: 40,
  },
  resetButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FF9500',
  },
});
