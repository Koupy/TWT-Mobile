import { badgeService } from './api/badgeService';
import nfcService from './nfcService';
import apiService from './api/apiService';

// Type pour les résultats de vérification d'accès
export interface AccessVerificationResult {
  granted: boolean;
  message: string;
  badgeId?: string;
  timestamp: string;
}

class AccessVerificationService {
  /**
   * Vérifie si l'utilisateur a accès à une porte/lecteur spécifique
   * @param readerId Identifiant du lecteur/porte
   * @returns Résultat de la vérification d'accès
   */
  async verifyAccess(readerId: string): Promise<AccessVerificationResult> {
    try {
      // Obtenir l'ID NFC du téléphone
      const nfcId = await nfcService.getNfcId();
      
      if (!nfcId) {
        return {
          granted: false,
          message: "Aucun identifiant NFC disponible",
          timestamp: new Date().toISOString()
        };
      }
      
      console.log(`Vérification d'accès pour le lecteur ${readerId} avec l'ID NFC ${nfcId}`);
      
      // Récupérer les badges associés à cet ID NFC
      const badges = await badgeService.getBadgesByNfcId(nfcId);
      
      if (!badges || badges.length === 0) {
        return {
          granted: false,
          message: "Aucun badge trouvé pour cet identifiant NFC",
          timestamp: new Date().toISOString()
        };
      }
      
      console.log(`${badges.length} badges trouvés, vérification des badges actifs...`);
      
      // Vérifier si au moins un badge est actif (non expiré)
      const activeBadge = badges.find(badge => 
        badge.status === 'active' && 
        (!badge.expiration_date || new Date(badge.expiration_date) > new Date())
      );
      
      if (!activeBadge) {
        return {
          granted: false,
          message: "Aucun badge actif trouvé",
          timestamp: new Date().toISOString()
        };
      }
      
      console.log(`Badge actif trouvé: ${activeBadge.id}`);
      
      // Pour l'instant, considérer qu'un badge actif donne accès
      // Dans une future implémentation, on vérifiera l'accès spécifique à ce lecteur
      return {
        granted: true,
        message: "Accès autorisé",
        badgeId: activeBadge.id,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error("Erreur lors de la vérification d'accès:", error);
      return {
        granted: false,
        message: "Erreur technique lors de la vérification",
        timestamp: new Date().toISOString()
      };
    }
  }
  
  /**
   * Enregistre une tentative d'accès dans le système
   * @param badgeId ID du badge utilisé (optionnel)
   * @param readerId ID du lecteur/porte
   * @param granted Accès accordé ou refusé
   * @param details Détails supplémentaires
   */
  async logAccessAttempt(badgeId: string | undefined, readerId: string, granted: boolean, details?: string): Promise<void> {
    try {
      console.log(`Enregistrement d'une tentative d'accès: Badge=${badgeId}, Lecteur=${readerId}, Accès=${granted ? 'Autorisé' : 'Refusé'}`);
      
      // Enregistrer l'activité via l'API
      await apiService.post('/activities', {
        badge_id: badgeId,
        location: readerId,
        success: granted,
        details: details || (granted ? "Accès autorisé" : "Accès refusé")
      });
      
      console.log('Tentative d\'accès enregistrée avec succès');
    } catch (error) {
      console.error("Erreur lors de l'enregistrement de l'activité:", error);
    }
  }
}

export const accessVerificationService = new AccessVerificationService();
export default accessVerificationService;
