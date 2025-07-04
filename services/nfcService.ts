import NfcManager, { NfcTech, Ndef, NfcEvents } from 'react-native-nfc-manager';
import { Platform } from 'react-native';


class NfcService {
  private static instance: NfcService;
  private nfcManagerIsInitialized: boolean = false;
  
  private constructor() {}
  
  private isProblematicDevice(brand: string, model: string): boolean {
    const problematicDevices = [
      { brand: 'motorola', model: 'moto g52' },
      { brand: 'realme', model: 'RMX3370' },
      // { brand: 'samsung', model: 'sm-a137f' }, // Samsung Galaxy A13
    ];
    
    return problematicDevices.some(device => 
      brand.includes(device.brand.toLowerCase()) && 
      model.includes(device.model)
    );
  }
  
  static getInstance(): NfcService {
    if (!NfcService.instance) {
      NfcService.instance = new NfcService();
    }
    return NfcService.instance;
  }

  async initialize() {
    try {
      console.log('Initialisation simplifiée du NFC Manager (style TWT-Badgeuse)...');
      
      // Utilisation de la méthode directe qui fonctionne dans TWT-Badgeuse
      await NfcManager.start();
      this.nfcManagerIsInitialized = true;
      console.log('NFC Manager initialisé avec succès');
      
      // Vérifier si NFC est supporté
      const isSupported = await NfcManager.isSupported();
      if (!isSupported) {
        console.log('NFC n\'est pas supporté sur cet appareil');
        return {
          isSupported: false,
          isEnabled: false,
          error: 'NFC non supporté sur cet appareil'
        };
      }
      
      // Vérifier si NFC est activé (Android uniquement)
      let isEnabled = true;
      if (Platform.OS === 'android') {
        isEnabled = await NfcManager.isEnabled();
      }
      
      return {
        isSupported: true,
        isEnabled,
        error: !isEnabled ? 'NFC est désactivé dans les paramètres de l\'appareil' : null
      };
    } catch (error: any) {
      console.error('Erreur lors de l\'initialisation NFC', error);
      return {
        isSupported: false,
        isEnabled: false,
        error: error.message || 'Erreur lors de l\'initialisation NFC'
      };
    }
  }
  
  async emitBadge(badge: any) {
    try {
      console.log('Préparation à l\'émission badge NFC...');
      
      // Démarrer NFC s'il n'est pas déjà démarré
      if (!this.nfcManagerIsInitialized) {
        await NfcManager.start();
        this.nfcManagerIsInitialized = true;
      }
      
      // Vérifier disponibilité NFC
      const supported = await NfcManager.isSupported();
      if (!supported) {
        throw new Error('Cet appareil ne supporte pas le NFC');
      }
      
      // Vérifier si NFC est activé (Android uniquement)
      if (Platform.OS === 'android') {
        const enabled = await NfcManager.isEnabled();
        if (!enabled) {
          throw new Error('Le NFC est désactivé. Veuillez l\'activer dans les paramètres');
        }
      }

      // Attendre que le NFC Adapter soit prêt
      await NfcManager.requestTechnology(NfcTech.Ndef);
      console.log('Technologie NFC NDEF requise avec succès');

      // Format des données en JSON string
      const badgeData = JSON.stringify(badge);
      console.log('Données du badge formatées pour NFC:', badgeData);
      
      // Créer le message NDEF avec les données du badge
      const bytes = Ndef.encodeMessage([
        Ndef.textRecord(badgeData),
      ]);
      
      if (bytes) {
        await NfcManager.ndefHandler.writeNdefMessage(bytes);
        console.log('Message NDEF écrit avec succès');
        return true;
      } else {
        throw new Error('Erreur lors de l\'encodage du message NDEF');
      }
    } catch (error: any) {
      console.error('Erreur lors de l\'émission du badge via NFC', error);
      throw error;
    } finally {
      // Toujours nettoyer après l'opération NFC
      this.cleanup();
    }
  }

  async checkAvailability() {
    try {
      // Initialiser NFC Manager de manière simple (comme dans TWT-Badgeuse)
      await NfcManager.start();
      console.log('NFC Manager démarré avec succès');
      
      // Vérifier si NFC est supporté
      const supported = await NfcManager.isSupported();
      if (!supported) {
        return { available: false, message: 'Cet appareil ne supporte pas le NFC' };
      }
      
      // Vérifier si NFC est activé (Android uniquement)
      if (Platform.OS === 'android') {
        const enabled = await NfcManager.isEnabled();
        if (!enabled) {
          return { available: false, message: 'Le NFC est désactivé. Veuillez l\'activer dans les paramètres de votre appareil' };
        }
      }
      
      return { available: true, message: 'NFC disponible et activé' };
    } catch (error: any) {
      console.error('Erreur lors de la vérification de la disponibilité NFC', error);
      return { available: false, message: error.message || 'Erreur lors de la vérification NFC' };
    }
  }

  async cleanup() {
    try {
      await NfcManager.cancelTechnologyRequest().catch(() => {});
      await NfcManager.unregisterTagEvent().catch(() => {});
    } catch (error) {
      console.error('Erreur lors du nettoyage NFC', error);
    }
  }
}

const nfcService = NfcService.getInstance();
export default nfcService;
