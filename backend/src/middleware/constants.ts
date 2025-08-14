export const AUTH = {
  JWT_SECRET: process.env.JWT_SECRET || 'secret-key-to-be-change-in-production',
  TOKEN_EXPIRY: '24h',
  ERROR_NO_TOKEN: 'Access denied. No token provided.',
  ERROR_INVALID_TOKEN: 'Invalid token.',
  ERROR_USER_NOT_FOUND: 'User not found.',
  ERROR_AUTH_REQUIRED: 'Authentication required.',
  ERROR_INSUFFICIENT_PERMISSIONS: 'Insufficient permissions.',
  ERROR_INTERNAL: 'Internal server error during authentication.',
  HEADER_API_KEY: 'x-api-key'
};
