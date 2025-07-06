import apiService from './apiService';
import { API_CONFIG } from './config';
import nfcService from '../nfcService'; // Importation de l'instance singleton et non de la classe

// Interface pour la requête d'association NFC
export interface NfcAssociationRequest {
  nfcId: string;        // ID NFC virtuel unique par utilisateur
  userId?: string;      // Optionnel, car peut être extrait du token d'authentification
}

// Interface pour la réponse d'association NFC
export interface NfcAssociationResponse {
  success: boolean;
  message?: string;
  nfcId: string;
  userId: string;
  associationDate: string;
}

// Service pour gérer l'association des IDs NFC avec les utilisateurs et leurs badges
class NfcAssociationService {
  // Plus besoin de stocker le service en attribut car nous utilisons l'instance importée directement
  
  constructor() {
    // Pas besoin d'initialisation car l'instance est déjà créée et importée
  }
  
  /**
   * Génère un ID NFC virtuel pour l'utilisateur et l'associe à son compte
   * @param username Nom d'utilisateur pour lequel générer l'ID NFC virtuel
   */
  public async associateNfcWithUser(username: string): Promise<NfcAssociationResponse> {
    try {
      // Générer un ID NFC virtuel basé sur le nom d'utilisateur
      const virtualNfcId = await nfcService.getNfcId(username);
      
      if (!virtualNfcId) {
        throw new Error("Impossible de générer un ID NFC virtuel");
      }
      
      console.log(`Tentative d'association de l'ID NFC virtuel ${virtualNfcId} avec l'utilisateur ${username}...`);
      
      // Création de la requête
      const request: NfcAssociationRequest = { 
        nfcId: virtualNfcId
        // userId est optionnel car il sera extrait du token JWT côté serveur
      };
      
      // Envoi de la requête au serveur
      const response = await apiService.post<NfcAssociationResponse>(
        '/users/nfc-association', 
        request
      );
      
      console.log(`Association NFC réussie pour l'utilisateur ${username} avec l'ID ${virtualNfcId}`);
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de l'association NFC:`, error);
      throw error;
    }
  }
  
  // Vérifier si l'utilisateur a déjà un ID NFC associé
  public async checkNfcAssociation(): Promise<boolean> {
    try {
      const response = await apiService.get<{ hasAssociation: boolean }>('/users/nfc-status');
      return response.data.hasAssociation;
    } catch (error) {
      console.error('Erreur lors de la vérification de l\'association NFC:', error);
      return false;
    }
  }
}

// Export une seule instance du service
export const nfcAssociationService = new NfcAssociationService();
export default nfcAssociationService;
