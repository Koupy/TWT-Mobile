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

export default function SecurityScreen() {
  const router = useRouter();
  
  // Security settings state
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [pinEnabled, setPinEnabled] = useState(true);
  const [autoLockEnabled, setAutoLockEnabled] = useState(true);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [notifyLoginEnabled, setNotifyLoginEnabled] = useState(true);
  
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
        <Text style={styles.title}>Sécurité</Text>
        <View style={styles.placeholder} />
      </View>
      
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Authentification</Text>
          
          <View style={styles.card}>
            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <View style={styles.settingIconContainer}>
                  <Ionicons name="finger-print" size={20} color="#0A84FF" />
                </View>
                <View>
                  <Text style={styles.settingTitle}>Authentification biométrique</Text>
                  <Text style={styles.settingDescription}>Utiliser Face ID ou Touch ID pour déverrouiller l'application</Text>
                </View>
              </View>
              <Switch
                value={biometricEnabled}
                onValueChange={(value) => handleToggle(setBiometricEnabled, value)}
                trackColor={{ false: '#3e3e3e', true: '#0A84FF' }}
                thumbColor="#FFFFFF"
              />
            </View>
            
            <View style={styles.separator} />
            
            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <View style={styles.settingIconContainer}>
                  <Ionicons name="keypad" size={20} color="#0A84FF" />
                </View>
                <View>
                  <Text style={styles.settingTitle}>Code PIN</Text>
                  <Text style={styles.settingDescription}>Utiliser un code PIN pour déverrouiller l'application</Text>
                </View>
              </View>
              <Switch
                value={pinEnabled}
                onValueChange={(value) => handleToggle(setPinEnabled, value)}
                trackColor={{ false: '#3e3e3e', true: '#0A84FF' }}
                thumbColor="#FFFFFF"
              />
            </View>
            
            <View style={styles.separator} />
            
            <TouchableOpacity style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <View style={styles.settingIconContainer}>
                  <Ionicons name="lock-closed" size={20} color="#0A84FF" />
                </View>
                <View>
                  <Text style={styles.settingTitle}>Changer le code PIN</Text>
                  <Text style={styles.settingDescription}>Modifier votre code PIN actuel</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color="rgba(255, 255, 255, 0.4)" />
            </TouchableOpacity>
          </View>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Confidentialité</Text>
          
          <View style={styles.card}>
            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <View style={styles.settingIconContainer}>
                  <Ionicons name="time" size={20} color="#0A84FF" />
                </View>
                <View>
                  <Text style={styles.settingTitle}>Verrouillage automatique</Text>
                  <Text style={styles.settingDescription}>Verrouiller l'application après 5 minutes d'inactivité</Text>
                </View>
              </View>
              <Switch
                value={autoLockEnabled}
                onValueChange={(value) => handleToggle(setAutoLockEnabled, value)}
                trackColor={{ false: '#3e3e3e', true: '#0A84FF' }}
                thumbColor="#FFFFFF"
              />
            </View>
            
            <View style={styles.separator} />
            
            <TouchableOpacity style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <View style={styles.settingIconContainer}>
                  <Ionicons name="eye-off" size={20} color="#0A84FF" />
                </View>
                <View>
                  <Text style={styles.settingTitle}>Données confidentielles</Text>
                  <Text style={styles.settingDescription}>Gérer les informations sensibles</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color="rgba(255, 255, 255, 0.4)" />
            </TouchableOpacity>
          </View>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sécurité avancée</Text>
          
          <View style={styles.card}>
            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <View style={styles.settingIconContainer}>
                  <Ionicons name="shield-checkmark" size={20} color="#0A84FF" />
                </View>
                <View>
                  <Text style={styles.settingTitle}>Authentification à deux facteurs</Text>
                  <Text style={styles.settingDescription}>Ajouter une couche de sécurité supplémentaire</Text>
                </View>
              </View>
              <Switch
                value={twoFactorEnabled}
                onValueChange={(value) => handleToggle(setTwoFactorEnabled, value)}
                trackColor={{ false: '#3e3e3e', true: '#0A84FF' }}
                thumbColor="#FFFFFF"
              />
            </View>
            
            <View style={styles.separator} />
            
            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <View style={styles.settingIconContainer}>
                  <Ionicons name="notifications" size={20} color="#0A84FF" />
                </View>
                <View>
                  <Text style={styles.settingTitle}>Alertes de connexion</Text>
                  <Text style={styles.settingDescription}>Recevoir une notification lors d'une nouvelle connexion</Text>
                </View>
              </View>
              <Switch
                value={notifyLoginEnabled}
                onValueChange={(value) => handleToggle(setNotifyLoginEnabled, value)}
                trackColor={{ false: '#3e3e3e', true: '#0A84FF' }}
                thumbColor="#FFFFFF"
              />
            </View>
            
            <View style={styles.separator} />
            
            <TouchableOpacity style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <View style={styles.settingIconContainer}>
                  <Ionicons name="list" size={20} color="#0A84FF" />
                </View>
                <View>
                  <Text style={styles.settingTitle}>Historique des connexions</Text>
                  <Text style={styles.settingDescription}>Voir les appareils connectés récemment</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color="rgba(255, 255, 255, 0.4)" />
            </TouchableOpacity>
          </View>
        </View>
        
        <TouchableOpacity style={styles.dangerButton}>
          <Text style={styles.dangerButtonText}>Réinitialiser les paramètres de sécurité</Text>
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
  dangerButton: {
    backgroundColor: 'rgba(255, 59, 48, 0.1)',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginHorizontal: 20,
    marginTop: 16,
    marginBottom: 40,
  },
  dangerButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FF3B30',
  },
});
