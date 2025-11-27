export function verifyToken(token: string): boolean {
  try {
    // Décoder le token JWT (sans vérifier la signature côté client)
    const parts = token.split('.');
    if (parts.length !== 3) {
      return false;
    }
    
    const payload = JSON.parse(atob(parts[1]));
    
    // Vérifier l'expiration
    if (payload.exp) {
      const now = Math.floor(Date.now() / 1000);
      if (payload.exp < now) {
        return false;
      }
    }
    
    return true;
  } catch (error) {
    return false;
  }
}

export function getTokenPayload(token: string): any {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      return null;
    }
    
    return JSON.parse(atob(parts[1]));
  } catch (error) {
    return null;
  }
}

export function isAuthenticated(): boolean {
  const token = localStorage.getItem('token');
  if (!token) {
    return false;
  }
  
  return verifyToken(token);
}

export function getUserFromStorage(): any {
  const userStr = localStorage.getItem('user');
  if (!userStr) {
    return null;
  }
  
  try {
    return JSON.parse(userStr);
  } catch {
    return null;
  }
}

export function logout(): void {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = '/';
}