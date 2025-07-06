/**
 * Utilitaire de logging ultra-simple pour l'application TWT-Mobile
 * Version simplifiée pour garantir la visibilité dans la console Metro
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  level: LogLevel;
  tag: string;
  message: string;
  timestamp: Date;
  data?: any;
}

// Stockage interne des logs pour référence
const logHistory: LogEntry[] = [];

// Liste des écouteurs de logs
const logListeners: Array<(log: LogEntry) => void> = [];

// Configuration par défaut
let maxHistorySize = 200;

/**
 * Utilitaire de logging simplifié
 */
const logger = {
  debug(tag: string, message: string, data?: any) {
    this.log('debug', tag, message, data);
  },

  info(tag: string, message: string, data?: any) {
    this.log('info', tag, message, data);
  },

  warn(tag: string, message: string, data?: any) {
    this.log('warn', tag, message, data);
  },

  error(tag: string, message: string, data?: any) {
    this.log('error', tag, message, data);
  },

  // Support pour les méthodes utilisées par LogViewer
  getHistory(): LogEntry[] {
    return [...logHistory];
  },

  clearHistory(): void {
    logHistory.length = 0;
  },

  addLogListener(listener: (log: LogEntry) => void): void {
    logListeners.push(listener);
  },

  removeLogListener(listener: (log: LogEntry) => void): void {
    const index = logListeners.indexOf(listener);
    if (index !== -1) {
      logListeners.splice(index, 1);
    }
  },
  
  // Configuration simple (pour compatibilité avec le code existant)
  configure(options: { 
    enableConsoleOutput?: boolean,
    maxHistorySize?: number
  } = {}) {
    if (options.maxHistorySize !== undefined) {
      maxHistorySize = options.maxHistorySize;
    }
  },

  // Méthode de logging interne
  log(level: LogLevel, tag: string, message: string, data?: any) {
    const timestamp = new Date();
    
    // Créer l'entrée de log
    const logEntry: LogEntry = {
      level,
      tag,
      message,
      timestamp,
      data
    };

    // Ajouter à l'historique des logs
    logHistory.push(logEntry);
    
    // Maintenir la taille de l'historique
    if (logHistory.length > maxHistorySize) {
      logHistory.shift();
    }

    // Notifier les écouteurs
    logListeners.forEach(listener => {
      try {
        listener(logEntry);
      } catch (e) {
        // Ignorer les erreurs dans les écouteurs
      }
    });
    
    // Format spécifique pour la console Metro (très simple)
    const tagPrefix = `[${tag}]`;
    
    // Utiliser console.log pour tout en mode développement
    if (__DEV__) {
      if (data) {
        console.log(tagPrefix, message, data);
      } else {
        console.log(tagPrefix, message);
      }
    }
  }
};

export default logger;
