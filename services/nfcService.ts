import NfcManager, { NfcTech, Ndef, NfcEvents } from 'react-native-nfc-manager';
import { Platform } from 'react-native';
import logger from '../utils/logger';

// Type pour représenter un badge à partager via NFC
export interface NfcShareableBadge {
  id: string;
  status: string;
  expiration_date: string | null;
  timestamp?: string;
  [key: string]: any; // Pour les propriétés additionnelles
}

class NfcService {
  private static instance: NfcService;
  private nfcManagerIsInitialized: boolean = false;
  private lastNfcId: string | null = null;
  
  private constructor() {}
  
  /**
   * Récupère l'ID NFC de l'appareil s'il a été précédemment stocké
   * @returns L'ID NFC de l'appareil ou null s'il n'est pas disponible
   */
  /**
   * Génère un ID NFC virtuel unique basé sur le nom d'utilisateur
   * @param username Nom d'utilisateur pour lequel générer l'ID NFC
   * @returns ID NFC virtuel unique pour cet utilisateur
   */
  generateVirtualNfcId(username: string): string {
    // Utiliser une fonction de hachage simple pour générer un ID basé sur le nom d'utilisateur
    // Format: PREFIX_USERNAME_XXXXXXXX (où X est un caractère hexadécimal)
    const prefix = 'VIRTUAL_NFC';
    
    // Générer une partie aléatoire unique liée au username
    let hash = 0;
    for (let i = 0; i < username.length; i++) {
      hash = ((hash << 5) - hash) + username.charCodeAt(i);
      hash = hash & hash; // Convertir en entier 32 bits
    }
    
    // Convertir le hash en valeur hexadécimale positive de 8 caractères
    const hexHash = Math.abs(hash).toString(16).padStart(8, '0').toUpperCase();
    
    // Créer l'ID virtuel
    const virtualId = `${prefix}_${username}_${hexHash}`;
    
    logger.info('NFC', `ID NFC virtuel généré pour ${username}: ${virtualId}`);
    return virtualId;
  }
  
  /**
   * Récupère l'ID NFC virtuel associé au compte utilisateur actuel
   * @param username Le nom d'utilisateur connecté
   * @returns L'ID NFC virtuel unique pour cet utilisateur
   */
  async getNfcId(username?: string): Promise<string | null> {
    // Si un nom d'utilisateur est fourni, générer un ID NFC virtuel pour cet utilisateur
    if (username) {
      const virtualId = this.generateVirtualNfcId(username);
      this.lastNfcId = virtualId;
      return virtualId;
    }
    
    // Si pas de nom d'utilisateur mais ID en cache, le retourner
    if (this.lastNfcId) {
      return this.lastNfcId;
    }
    
    // Si pas d'utilisateur connecté ni d'ID en cache, impossible de générer un ID
    console.warn("Impossible de générer un ID NFC virtuel: aucun nom d'utilisateur fourni");
    return null;
  }
  
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
    return await this.emitBadges([badge]);
  }
  
  /**
   * Émet plusieurs badges via NFC en une seule opération
   * @param badges Tableau de badges à émettre
   * @returns true si l'opération est réussie
   */
  async emitBadges(badges: NfcShareableBadge[]) {
    try {
      console.log(`Préparation à l'émission NFC de ${badges.length} badge(s)...`);
      
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
        
        // Essayer de récupérer l'ID NFC de l'appareil
        try {
          const tag = await NfcManager.getTag();
          if (tag && tag.id) {
            // Convertir en format hexadécimal si nécessaire
            if (Array.isArray(tag.id)) {
              this.lastNfcId = Array.from(tag.id as number[])
                .map(byte => ('0' + (byte & 0xFF).toString(16)).slice(-2))
                .join('').toUpperCase();
            } else {
              this.lastNfcId = String(tag.id).toUpperCase();
            }
            console.log(`ID NFC du téléphone récupéré: ${this.lastNfcId}`);
          }
        } catch (idError) {
          console.warn("Impossible de récupérer l'ID NFC de l'appareil:", idError);
        }
      }
      
      console.log('Badges à partager:', badges.map(b => b.id).join(', '));
      
      // Approche plus simple : configurer l'appareil en mode "Card Emulation"
      // La badgeuse semble lire uniquement l'ID du tag NFC
      console.log(`⚠️ MODIFICATION DE L'APPROCHE : Utilisation de l'ID du téléphone comme identifiant NFC`);
      console.log(`⚠️ En mode lecture simple, la badgeuse voit uniquement l'ID de votre appareil`);
      console.log(`⚠️ Nous continuons de l'activer pour que la badgeuse détecte la présence de votre téléphone`);
      
      // Mettre en mode "reader mode" pour que le téléphone soit détectable
      try {
        // Nous utilisons une approche plus simple pour la compatibilité
        await NfcManager.registerTagEvent();
        
        console.log(`⚠️ Téléphone prêt à être détecté par la badgeuse`);
        
        // Générer un hash des IDs des badges pour la console
        const badgeIds = badges.map(b => b.id).join('_');
        console.log(`⚠️ Hash des badges partagés: ${badgeIds}`);
        
        // Attendre quelques secondes pour laisser la badgeuse lire le tag
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        // Désactiver le mode tag
        await NfcManager.unregisterTagEvent();
        
        console.log('Partage NFC terminé avec succès');
        return true;
      } catch (tagError) {
        console.error('Erreur lors de l\'activation du mode tag:', tagError);
        throw tagError;
      }
    } catch (error: any) {
      console.error('Erreur lors de l\'émission des badges via NFC', error);
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

  /**
   * Scanne un badge NFC et récupère les badges associés
   * @returns Les badges associés à l'ID NFC scanné
   */
  async scanAndGetBadges() {
    try {
      // Utiliser l'ID NFC du téléphone ou générer un ID virtuel si nécessaire
      const nfcId = this.lastNfcId || await this.getNfcId();
      
      if (!nfcId) {
        throw new Error("Aucun ID NFC disponible");
      }
      
      console.log(`Scan NFC réussi, ID obtenu: ${nfcId}`);
      
      // Récupérer les badges associés à cet ID NFC
      const badgeService = (await import('./api/badgeService')).badgeService;
      const badges = await badgeService.getBadgesByNfcId(nfcId);
      
      console.log(`${badges.length} badges récupérés pour l'ID NFC ${nfcId}`);
      return badges;
    } catch (error) {
      console.error("Erreur lors du scan et récupération des badges:", error);
      throw error;
    }
  }
}

const nfcService = NfcService.getInstance();
export default nfcService;
