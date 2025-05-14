/**
 * Mock data for testing the T-Wallet API integration
 * This file provides test data that simulates API responses
 */

// Mock user data
export const mockUsers = [
  {
    id: '1',
    email: 'demo@twallet.com',
    password: 'Azerty11', // Only for testing, never store passwords in production code
    first_name: 'Thomas',
    last_name: 'Dubois',
    phone: '+33 6 12 34 56 78',
    role: 'user',
    entity_id: '1',
    created_at: '2025-01-15T08:30:00Z',
    updated_at: '2025-05-01T14:22:33Z'
  },
  {
    id: '2',
    email: 'admin@twallet.com',
    password: 'Admin123', // Only for testing, never store passwords in production code
    first_name: 'Marie',
    last_name: 'Laurent',
    phone: '+33 6 98 76 54 32',
    role: 'admin',
    entity_id: '1',
    created_at: '2025-01-10T10:15:00Z',
    updated_at: '2025-04-28T09:11:45Z'
  },
  {
    id: '3',
    email: 'user@twallet.com',
    password: 'User123', // Only for testing, never store passwords in production code
    first_name: 'Jean',
    last_name: 'Martin',
    phone: '+33 7 11 22 33 44',
    role: 'user',
    entity_id: '2',
    created_at: '2025-02-05T11:20:00Z',
    updated_at: '2025-05-10T16:30:22Z'
  }
];

// Mock entity data
export const mockEntities = [
  {
    id: '1',
    name: 'Siège Social',
    description: 'Siège principal de l\'entreprise',
    address: '123 Avenue des Champs-Élysées, 75008 Paris',
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z'
  },
  {
    id: '2',
    name: 'Bureau de Lyon',
    description: 'Bureau régional de Lyon',
    address: '45 Rue de la République, 69002 Lyon',
    created_at: '2025-01-05T00:00:00Z',
    updated_at: '2025-01-05T00:00:00Z'
  }
];

// Mock badge data (items)
export const mockBadges = [
  {
    id: '1',
    name: 'Badge Accès Principal',
    description: 'Badge d\'accès à l\'entrée principale',
    price: 0,
    custom_data: JSON.stringify({
      type: 'Bâtiment',
      iconName: 'business',
      color: '#0A84FF',
      location: 'Entrée Principale',
      lastUsed: '2025-05-13T08:45:22Z'
    }),
    created_at: '2025-01-15T09:00:00Z',
    updated_at: '2025-05-13T08:45:22Z'
  },
  {
    id: '2',
    name: 'Badge Parking',
    description: 'Badge d\'accès au parking souterrain',
    price: 0,
    custom_data: JSON.stringify({
      type: 'Parking',
      iconName: 'car',
      color: '#30D158',
      location: 'Parking Niveau -1',
      lastUsed: '2025-05-14T07:30:15Z'
    }),
    created_at: '2025-01-15T09:05:00Z',
    updated_at: '2025-05-14T07:30:15Z'
  },
  {
    id: '3',
    name: 'Badge Salle de Conférence',
    description: 'Badge d\'accès aux salles de conférence',
    price: 0,
    custom_data: JSON.stringify({
      type: 'Salle',
      iconName: 'people',
      color: '#FF9F0A',
      location: 'Étage 3 - Salles de Conférence',
      lastUsed: '2025-05-10T14:22:10Z'
    }),
    created_at: '2025-01-15T09:10:00Z',
    updated_at: '2025-05-10T14:22:10Z'
  },
  {
    id: '4',
    name: 'Badge Cafétéria',
    description: 'Badge pour la cafétéria d\'entreprise',
    price: 0,
    custom_data: JSON.stringify({
      type: 'Service',
      iconName: 'cafe',
      color: '#BF5AF2',
      location: 'Étage 1 - Cafétéria',
      lastUsed: '2025-05-14T12:15:33Z'
    }),
    created_at: '2025-01-15T09:15:00Z',
    updated_at: '2025-05-14T12:15:33Z'
  },
  {
    id: '5',
    name: 'Badge Salle Serveurs',
    description: 'Badge d\'accès à la salle des serveurs',
    price: 0,
    custom_data: JSON.stringify({
      type: 'Sécurité',
      iconName: 'server',
      color: '#FF453A',
      location: 'Sous-sol - Salle Serveurs',
      lastUsed: '2025-05-05T10:45:00Z'
    }),
    created_at: '2025-01-15T09:20:00Z',
    updated_at: '2025-05-05T10:45:00Z'
  }
];

// Mock activity data
export const mockActivities = [
  {
    id: '1',
    badge_id: '1',
    user_id: '1',
    location: 'Entrée Principale',
    timestamp: '2025-05-13T08:45:22Z',
    success: true,
    details: 'Accès autorisé',
    created_at: '2025-05-13T08:45:22Z',
    updated_at: '2025-05-13T08:45:22Z'
  },
  {
    id: '2',
    badge_id: '2',
    user_id: '1',
    location: 'Parking Niveau -1',
    timestamp: '2025-05-14T07:30:15Z',
    success: true,
    details: 'Accès autorisé',
    created_at: '2025-05-14T07:30:15Z',
    updated_at: '2025-05-14T07:30:15Z'
  },
  {
    id: '3',
    badge_id: '3',
    user_id: '1',
    location: 'Étage 3 - Salles de Conférence',
    timestamp: '2025-05-10T14:22:10Z',
    success: true,
    details: 'Accès autorisé',
    created_at: '2025-05-10T14:22:10Z',
    updated_at: '2025-05-10T14:22:10Z'
  },
  {
    id: '4',
    badge_id: '4',
    user_id: '1',
    location: 'Étage 1 - Cafétéria',
    timestamp: '2025-05-14T12:15:33Z',
    success: true,
    details: 'Accès autorisé',
    created_at: '2025-05-14T12:15:33Z',
    updated_at: '2025-05-14T12:15:33Z'
  },
  {
    id: '5',
    badge_id: '5',
    user_id: '2',
    location: 'Sous-sol - Salle Serveurs',
    timestamp: '2025-05-05T10:45:00Z',
    success: true,
    details: 'Accès autorisé',
    created_at: '2025-05-05T10:45:00Z',
    updated_at: '2025-05-05T10:45:00Z'
  },
  {
    id: '6',
    badge_id: '1',
    user_id: '1',
    location: 'Entrée Principale',
    timestamp: '2025-05-14T08:30:12Z',
    success: true,
    details: 'Accès autorisé',
    created_at: '2025-05-14T08:30:12Z',
    updated_at: '2025-05-14T08:30:12Z'
  },
  {
    id: '7',
    badge_id: '3',
    user_id: '1',
    location: 'Étage 3 - Salles de Conférence',
    timestamp: '2025-05-14T09:15:45Z',
    success: false,
    details: 'Accès refusé - Réservation requise',
    created_at: '2025-05-14T09:15:45Z',
    updated_at: '2025-05-14T09:15:45Z'
  },
  {
    id: '8',
    badge_id: '4',
    user_id: '3',
    location: 'Étage 1 - Cafétéria',
    timestamp: '2025-05-14T12:10:22Z',
    success: true,
    details: 'Accès autorisé',
    created_at: '2025-05-14T12:10:22Z',
    updated_at: '2025-05-14T12:10:22Z'
  },
  {
    id: '9',
    badge_id: '2',
    user_id: '1',
    location: 'Parking Niveau -1',
    timestamp: '2025-05-14T17:45:33Z',
    success: true,
    details: 'Accès autorisé',
    created_at: '2025-05-14T17:45:33Z',
    updated_at: '2025-05-14T17:45:33Z'
  },
  {
    id: '10',
    badge_id: '5',
    user_id: '3',
    location: 'Sous-sol - Salle Serveurs',
    timestamp: '2025-05-14T11:22:18Z',
    success: false,
    details: 'Accès refusé - Autorisation insuffisante',
    created_at: '2025-05-14T11:22:18Z',
    updated_at: '2025-05-14T11:22:18Z'
  },
  {
    id: '11',
    badge_id: '1',
    user_id: '2',
    location: 'Entrée Principale',
    timestamp: '2025-05-14T08:15:00Z',
    success: true,
    details: 'Accès autorisé',
    created_at: '2025-05-14T08:15:00Z',
    updated_at: '2025-05-14T08:15:00Z'
  },
  {
    id: '12',
    badge_id: '2',
    user_id: '2',
    location: 'Parking Niveau -1',
    timestamp: '2025-05-14T08:10:30Z',
    success: true,
    details: 'Accès autorisé',
    created_at: '2025-05-14T08:10:30Z',
    updated_at: '2025-05-14T08:10:30Z'
  },
  {
    id: '13',
    badge_id: '3',
    user_id: '2',
    location: 'Étage 3 - Salles de Conférence',
    timestamp: '2025-05-14T10:30:00Z',
    success: true,
    details: 'Accès autorisé',
    created_at: '2025-05-14T10:30:00Z',
    updated_at: '2025-05-14T10:30:00Z'
  },
  {
    id: '14',
    badge_id: '4',
    user_id: '2',
    location: 'Étage 1 - Cafétéria',
    timestamp: '2025-05-14T12:30:15Z',
    success: true,
    details: 'Accès autorisé',
    created_at: '2025-05-14T12:30:15Z',
    updated_at: '2025-05-14T12:30:15Z'
  },
  {
    id: '15',
    badge_id: '5',
    user_id: '2',
    location: 'Sous-sol - Salle Serveurs',
    timestamp: '2025-05-14T14:45:22Z',
    success: true,
    details: 'Accès autorisé',
    created_at: '2025-05-14T14:45:22Z',
    updated_at: '2025-05-14T14:45:22Z'
  }
];

// Helper function to get activities by badge ID
export const getActivitiesByBadgeId = (badgeId: string) => {
  return mockActivities.filter(activity => activity.badge_id === badgeId);
};

// Helper function to get activities by user ID
export const getActivitiesByUserId = (userId: string) => {
  return mockActivities.filter(activity => activity.user_id === userId);
};

// Helper function to get a badge by ID
export const getBadgeById = (badgeId: string) => {
  return mockBadges.find(badge => badge.id === badgeId);
};

// Helper function to get a user by ID
export const getUserById = (userId: string) => {
  return mockUsers.find(user => user.id === userId);
};

// Helper function to get a user by email
export const getUserByEmail = (email: string) => {
  return mockUsers.find(user => user.email === email);
};

// Helper function to authenticate a user
export const authenticateUser = (email: string, password: string) => {
  const user = getUserByEmail(email);
  if (user && user.password === password) {
    return {
      user: { ...user, password: undefined }, // Remove password from returned user
      tokens: {
        access_token: 'mock_access_token_' + user.id,
        refresh_token: 'mock_refresh_token_' + user.id,
        expires_in: 3600
      }
    };
  }
  return null;
};

// Export all mock data
export default {
  users: mockUsers,
  entities: mockEntities,
  badges: mockBadges,
  activities: mockActivities,
  helpers: {
    getActivitiesByBadgeId,
    getActivitiesByUserId,
    getBadgeById,
    getUserById,
    getUserByEmail,
    authenticateUser
  }
};
