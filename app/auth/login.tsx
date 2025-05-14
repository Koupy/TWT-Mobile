import React, { useState, useContext } from 'react';
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
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { AuthContext } from '../_layout';

// Toggle quick login button
const ENABLE_QUICK_LOGIN = true;

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();
  const authContext = useContext(AuthContext);
  const { width } = useWindowDimensions();
  
  const isSmallDevice = width < 375;
  const isMediumDevice = width >= 375 && width < 414;
  
  const padding = isSmallDevice ? 16 : (isMediumDevice ? 20 : 24);
  const titleSize = isSmallDevice ? 28 : (isMediumDevice ? 32 : 36);
  const subtitleSize = isSmallDevice ? 16 : 18;
  const inputHeight = isSmallDevice ? 50 : 56;
  const buttonHeight = isSmallDevice ? 50 : 56;
  const fontSize = isSmallDevice ? 14 : 16;
  
  const handleLogin = () => {
    setError('');
    
    if (!email || !password) {
      setError('Veuillez remplir tous les champs');
      return;
    }
    
    if (email === 'demo@twallet.com' && password === 'Azerty11') {
      if (authContext) {
        authContext.setIsAuthenticated(true);
      }
      
      // Authentication successful
      router.replace('/(tabs)');
    } else {
      setError('Email ou mot de passe incorrect');
    }
  };
  
  // Quick login handler
  const handleQuickLogin = () => {
    if (authContext) {
      authContext.setIsAuthenticated(true);
    }
    router.replace('/(tabs)');
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView 
          contentContainerStyle={[styles.scrollContent, { padding }]}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <Text style={[styles.logo, { fontSize: titleSize }]}>T-Wallet</Text>
            <Text style={[styles.subtitle, { fontSize: subtitleSize }]}>
              Votre portefeuille de badges virtuels
            </Text>
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
                identifiants démo :
              </Text>
              <Text style={[styles.demoCredentials, { fontSize: fontSize - 2 }]}>
                Email: demo@twallet.com
              </Text>
              <Text style={[styles.demoCredentials, { fontSize: fontSize - 2 }]}>
                Mot de passe: Azerty11
              </Text>
            </View>
          </View>
        </ScrollView>
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
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'space-between',
  },
  header: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 60,
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
  },
  demoText: {
    color: 'rgba(255, 255, 255, 0.6)',
    marginBottom: 8,
  },
  demoCredentials: {
    color: '#FFFFFF',
    fontWeight: '500',
  },
});
