import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Image,
  ScrollView,
  Platform,
  StatusBar as RNStatusBar,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { AuthContext } from '../_layout';

export default function ProfileScreen() {
  const router = useRouter();
  const authContext = React.useContext(AuthContext);

  const handleLogout = () => {
    // Reset authentication state
    if (authContext) {
      authContext.setIsAuthenticated(false);
    }
    
    // Redirect to login page
    router.replace('/auth/login');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      
      <View style={styles.header}>
        <Text style={styles.title}>Profil</Text>
        <TouchableOpacity style={styles.settingsButton}>
          <Ionicons name="settings-outline" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
      
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Text style={styles.avatarInitials}>DU</Text>
            </View>
          </View>
          <Text style={styles.userName}>Demo User</Text>
          <Text style={styles.userEmail}>demo@twallet.com</Text>
          <Text style={styles.userRole}>Utilisateur Standard</Text>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Informations</Text>
          
          <View style={styles.card}>
            <View style={styles.cardItem}>
              <View style={styles.cardIconContainer}>
                <Ionicons name="person-outline" size={20} color="#0A84FF" />
              </View>
              <View style={styles.cardContent}>
                <Text style={styles.cardLabel}>Nom complet</Text>
                <Text style={styles.cardValue}>Demo User</Text>
              </View>
            </View>
            
            <View style={styles.separator} />
            
            <View style={styles.cardItem}>
              <View style={styles.cardIconContainer}>
                <Ionicons name="mail-outline" size={20} color="#0A84FF" />
              </View>
              <View style={styles.cardContent}>
                <Text style={styles.cardLabel}>Email</Text>
                <Text style={styles.cardValue}>demo@twallet.com</Text>
              </View>
            </View>
            
            <View style={styles.separator} />
            
            <View style={styles.cardItem}>
              <View style={styles.cardIconContainer}>
                <Ionicons name="call-outline" size={20} color="#0A84FF" />
              </View>
              <View style={styles.cardContent}>
                <Text style={styles.cardLabel}>Téléphone</Text>
                <Text style={styles.cardValue}>+33 6 12 34 56 78</Text>
              </View>
            </View>
            
            <View style={styles.separator} />
            
            <View style={styles.cardItem}>
              <View style={styles.cardIconContainer}>
                <Ionicons name="business-outline" size={20} color="#0A84FF" />
              </View>
              <View style={styles.cardContent}>
                <Text style={styles.cardLabel}>Département</Text>
                <Text style={styles.cardValue}>Marketing</Text>
              </View>
            </View>
          </View>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Paramètres</Text>
          
          <View style={styles.card}>
            <TouchableOpacity 
              style={styles.cardItem}
              onPress={() => router.push('/security')}
            >
              <View style={styles.cardIconContainer}>
                <Ionicons name="lock-closed-outline" size={20} color="#0A84FF" />
              </View>
              <View style={styles.cardContent}>
                <Text style={styles.cardValue}>Sécurité</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="rgba(255, 255, 255, 0.4)" />
            </TouchableOpacity>
            
            <View style={styles.separator} />
            
            <TouchableOpacity style={styles.cardItem}>
              <View style={styles.cardIconContainer}>
                <Ionicons name="notifications-outline" size={20} color="#0A84FF" />
              </View>
              <View style={styles.cardContent}>
                <Text style={styles.cardValue}>Notifications</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="rgba(255, 255, 255, 0.4)" />
            </TouchableOpacity>
            
            <View style={styles.separator} />
            
            <TouchableOpacity style={styles.cardItem}>
              <View style={styles.cardIconContainer}>
                <Ionicons name="language-outline" size={20} color="#0A84FF" />
              </View>
              <View style={styles.cardContent}>
                <Text style={styles.cardValue}>Langue</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="rgba(255, 255, 255, 0.4)" />
            </TouchableOpacity>
          </View>
        </View>
        
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color="#FFFFFF" style={styles.logoutIcon} />
          <Text style={styles.logoutText}>Déconnexion</Text>
        </TouchableOpacity>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  settingsButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    paddingBottom: 100,
  },
  profileHeader: {
    alignItems: 'center',
    marginVertical: 20,
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(10, 132, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#0A84FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitials: {
    fontSize: 36,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  userName: {
    fontSize: 24,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 5,
  },
  userEmail: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.6)',
    marginBottom: 5,
  },
  userRole: {
    fontSize: 14,
    color: '#0A84FF',
    fontWeight: '500',
  },
  section: {
    marginVertical: 10,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 15,
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 16,
    overflow: 'hidden',
  },
  cardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  cardIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(10, 132, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  cardContent: {
    flex: 1,
  },
  cardLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.5)',
    marginBottom: 4,
  },
  cardValue: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  separator: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    marginHorizontal: 16,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FF3B30',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 20,
    marginTop: 30,
  },
  logoutIcon: {
    marginRight: 8,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
