/**
 * JWT Utilities for G-Admin
 * Helper functions to work with JWT tokens and custom claims
 */

export interface JWTClaims {
  user_role?: string;
  is_active?: boolean;
  role_updated_at?: number;
  app_metadata?: {
    provider?: string;
    role_source?: string;
  };
  error?: string;
  // Standard JWT claims
  sub?: string;
  aud?: string;
  exp?: number;
  iat?: number;
  iss?: string;
}

/**
 * Decode JWT token payload (for development/debugging)
 * WARNING: This should only be used for reading claims, never for validation
 */
export function decodeJWT(token: string): JWTClaims | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      throw new Error('Invalid JWT format');
    }

    const payload = parts[1];
    const decoded = JSON.parse(atob(payload));
    
    return decoded as JWTClaims;
  } catch (error) {
    console.error('Error decoding JWT:', error);
    return null;
  }
}

/**
 * Check if JWT token is expired
 */
export function isJWTExpired(token: string): boolean {
  const claims = decodeJWT(token);
  if (!claims || !claims.exp) {
    return true;
  }

  const now = Math.floor(Date.now() / 1000);
  return claims.exp < now;
}

/**
 * Extract user role from JWT token
 */
export function getRoleFromJWT(token: string): string | null {
  const claims = decodeJWT(token);
  return claims?.user_role || null;
}

/**
 * Log JWT information (for debugging)
 */
export function logJWTInfo(token: string, label = 'JWT') {
  if (process.env.NODE_ENV !== 'development') {
    return;
  }

  const claims = decodeJWT(token);
  if (!claims) {
    console.log(`${label}: Invalid token`);
    return;
  }

  console.group(`🔐 ${label} Information`);
  console.log('User ID:', claims.sub);
  console.log('Role:', claims.user_role || 'Not set');
  console.log('Active:', claims.is_active !== false);
  console.log('Source:', claims.app_metadata?.role_source || 'Unknown');
  
  if (claims.exp) {
    const expiresAt = new Date(claims.exp * 1000);
    const isExpired = isJWTExpired(token);
    console.log('Expires:', expiresAt.toLocaleString());
    console.log('Expired:', isExpired ? '❌' : '✅');
  }
  
  if (claims.error) {
    console.warn('Error in claims:', claims.error);
  }
  
  console.groupEnd();
}

/**
 * Validate JWT structure (basic check)
 */
export function validateJWTStructure(token: string): boolean {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      return false;
    }

    // Try to decode each part
    atob(parts[0]); // header
    atob(parts[1]); // payload
    
    return true;
  } catch {
    return false;
  }
}

/**
 * Development helper to monitor JWT changes
 */
export function setupJWTMonitor() {
  if (process.env.NODE_ENV !== 'development') {
    return;
  }

  let lastToken: string | null = null;
  
  return {
    checkToken: (newToken: string | null, context = 'Auth') => {
      if (newToken !== lastToken) {
        lastToken = newToken;
        
        if (newToken) {
          logJWTInfo(newToken, `${context} Token Updated`);
        } else {
          console.log(`🔐 ${context}: Token cleared`);
        }
      }
    }
  };
}
