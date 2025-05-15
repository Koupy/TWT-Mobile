import React, { useState, useContext, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  StatusBar as RNStatusBar,
  Platform,
  useWindowDimensions,
  KeyboardAvoidingView,
  ScrollView,
  Image,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { AuthContext } from '../_layout';
import { authService } from '../../services/api';

// Toggle quick login button
const ENABLE_QUICK_LOGIN = true;

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();
  const authContext = useContext(AuthContext);
  const { width } = useWindowDimensions();
  
  const { height } = useWindowDimensions();
  
  const isSmallDevice = width < 375;
  const isMediumDevice = width >= 375 && width < 414;
  const isSmallHeight = height < 700;
  
  const padding = isSmallDevice ? 16 : (isMediumDevice ? 20 : 24);
  const titleSize = isSmallDevice ? 28 : (isMediumDevice ? 32 : 36);
  const subtitleSize = isSmallDevice ? 16 : 18;
  const inputHeight = isSmallDevice ? 50 : 56;
  const buttonHeight = isSmallDevice ? 50 : 56;
  const fontSize = isSmallDevice ? 14 : 16;
  
  // Calculate logo size based on screen dimensions
  const logoSize = Math.min(width * 0.6, height * 0.25);
  
  const handleLogin = async () => {
    setError('');
    
    if (!email || !password) {
      setError('Veuillez remplir tous les champs');
      return;
    }
    
    try {
      // Try to connect via the API
      await authService.login(email, password);
      
      if (authContext) {
        authContext.setIsAuthenticated(true);
      }
      
      // Authentication successful - redirect to connection tab
      router.replace('/(tabs)/connection');
    } catch (error) {
      // Fallback for demo if API is not available
      if (email === 'demo@twallet.com' && password === 'Azerty11') {
        if (authContext) {
          authContext.setIsAuthenticated(true);
        }
        
        // Authentication successful - redirect to connection tab
        router.replace('/(tabs)/connection');
      } else {
        setError('Incorrect email or password');
      }
    }
  };
  
  // Quick login handler
  const handleQuickLogin = async () => {
    try {
      // Simulate a quick login for development
      await authService.login('demo@twallet.com', 'Azerty11');
      
      if (authContext) {
        authContext.setIsAuthenticated(true);
      }
      router.replace('/(tabs)');
    } catch (error) {
      // Fallback if API is not available
      if (authContext) {
        authContext.setIsAuthenticated(true);
      }
      router.replace('/(tabs)');
    }
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <View style={[styles.content, { padding, paddingBottom: padding + (Platform.OS === 'ios' ? 30 : 20) }]}>
          <View style={styles.header}>
            <Text style={[styles.logo, { fontSize: titleSize }]}>T-Wallet</Text>
            <Text style={[styles.subtitle, { fontSize: subtitleSize }]}>
              Votre portefeuille de badges virtuels
            </Text>
            
            {/* Logo */}
            <View style={[styles.logoContainer, isSmallHeight && { marginTop: 20, marginBottom: 20 }]}>
              <View style={[styles.logoWrapper, { padding: isSmallHeight ? 8 : 15 }]}>
                <Image 
                  source={require('../../assets/images/logo.png')} 
                  style={[styles.logoImage, { width: logoSize, height: logoSize }]} 
                  resizeMode="contain"
                />
              </View>
            </View>
          </View>
          
          <View style={styles.formContainer}>
            <View style={styles.inputContainer}>
              <View style={[styles.inputWrapper, { height: inputHeight }]}>
                <Ionicons name="mail-outline" size={22} color="rgba(255, 255, 255, 0.6)" />
                <TextInput
                  style={[styles.input, { fontSize }]}
                  placeholder="Email"
                  placeholderTextColor="rgba(255, 255, 255, 0.4)"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
              
              <View style={[styles.inputWrapper, { height: inputHeight }]}>
                <Ionicons name="lock-closed-outline" size={22} color="rgba(255, 255, 255, 0.6)" />
                <TextInput
                  style={[styles.input, { fontSize }]}
                  placeholder="Mot de passe"
                  placeholderTextColor="rgba(255, 255, 255, 0.4)"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                />
              </View>
              
              {error ? <Text style={styles.errorText}>{error}</Text> : null}
              
              <TouchableOpacity style={styles.forgotPassword}>
                <Text style={[styles.forgotPasswordText, { fontSize: fontSize - 2 }]}>
                  Mot de passe oublié ?
                </Text>
              </TouchableOpacity>
            </View>
            
            <TouchableOpacity 
              style={[styles.loginButton, { height: buttonHeight }]} 
              onPress={handleLogin}
            >
              <Text style={[styles.loginButtonText, { fontSize }]}>Se connecter</Text>
            </TouchableOpacity>
            
            {ENABLE_QUICK_LOGIN && (
              <TouchableOpacity 
                style={[styles.quickLoginButton, { height: buttonHeight - 10, marginTop: 10 }]} 
                onPress={handleQuickLogin}
              >
                <Text style={[styles.quickLoginText, { fontSize: fontSize - 2 }]}>Connexion rapide (Dev)</Text>
              </TouchableOpacity>
            )}
            
            <View style={styles.demoContainer}>
              <Text style={[styles.demoText, { fontSize: fontSize - 2 }]}>
                Informations de démo :
              </Text>
              <Text style={[styles.demoCredentials, { fontSize: fontSize - 2 }]}>
                Email : demo@twallet.com
              </Text>
              <Text style={[styles.demoCredentials, { fontSize: fontSize - 2 }]}>
                Mot de passe : Azerty11
              </Text>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
    paddingTop: Platform.OS === 'android' ? RNStatusBar.currentHeight : 0,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
  },
  header: {
    alignItems: 'center',
    marginTop: Platform.OS === 'ios' ? 20 : 10,
    marginBottom: 15,
  },
  logo: {
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  subtitle: {
    color: 'rgba(255, 255, 255, 0.6)',
    textAlign: 'center',
  },
  formContainer: {
    width: '100%',
  },
  inputContainer: {
    marginBottom: 24,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  input: {
    flex: 1,
    color: '#FFFFFF',
    marginLeft: 12,
  },
  errorText: {
    color: '#FF3B30',
    marginBottom: 16,
    fontSize: 14,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
  },
  forgotPasswordText: {
    color: '#0A84FF',
  },
  loginButton: {
    backgroundColor: '#0A84FF',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  quickLoginButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderStyle: 'dashed',
  },
  quickLoginText: {
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.7)',
  },
  demoContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: Platform.OS === 'ios' ? 10 : 15,
  },
  demoText: {
    color: 'rgba(255, 255, 255, 0.6)',
    marginBottom: 8,
  },
  demoCredentials: {
    color: '#FFFFFF',
    fontWeight: '500',
  },
  logoContainer: {
    marginTop: 20,
    marginBottom: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoWrapper: {
    borderRadius: 30,
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: 15,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  logoImage: {
    borderRadius: 25,
  },
});
