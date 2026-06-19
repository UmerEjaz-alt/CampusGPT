// ============================================================================
//  CampusGPT — Central Core Session Management Layer
//  Global Security Context Pipeline Architecture via Central Axios Client
// ============================================================================

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import api from "./api";

export interface User {
  id:                  string;
  username:            string;
  email:               string;
  registrationNumber?: string;
  university?:         string;
  lastLogin?:          string;
}

export interface RegisterData {
  username:            string;
  email:               string;
  password:            string;
  registrationNumber?: string;
  university?:         string;
}

interface AuthContextType {
  user:     User | null;
  loading:  boolean;
  login:    (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout:   () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser]       = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Synchronize runtime application session with secure cookies on boot mounting
  useEffect(() => {
    let isMounted = true;

    api.get('/api/auth/me')
      .then(res => {
        if (isMounted && res.data?.user) {
          setUser(res.data.user);
        }
      })
      .catch(() => {
        if (isMounted) setUser(null);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    const res = await api.post('/api/auth/login', { email, password });
    if (res.data?.user) {
      setUser(res.data.user);
    }
  };

  const register = async (data: RegisterData): Promise<void> => {
    const res = await api.post('/api/auth/register', data);
    if (res.data?.user) {
      setUser(res.data.user);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await api.post('/api/auth/logout');
    } catch (err) {
      console.warn('Session synchronization warning during cluster logout cleanup:', err);
    } finally {
      // Force clean client state even if server connection returns invalid headers
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('Critical System Fault: useAuth must be executed within an active AuthProvider node.');
  }
  return context;
};