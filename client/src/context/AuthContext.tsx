import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Role } from '../types';
import { AuthService } from '../services/auth.service';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: any) => Promise<void>;
  logout: () => void;
  hasRole: (roles: Role[]) => boolean;
  updateUser: (updatedData: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('ayojanix_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('ayojanix_token');
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const verifyUser = async () => {
      const storedToken = localStorage.getItem('ayojanix_token');
      if (storedToken) {
        try {
          const profile = await AuthService.getMe();
          setUser(profile);
          localStorage.setItem('ayojanix_user', JSON.stringify(profile));
        } catch (error) {
          console.warn('Session expired or invalid, logging out.');
          localStorage.removeItem('ayojanix_token');
          localStorage.removeItem('ayojanix_user');
          setUser(null);
          setToken(null);
        }
      }
      setIsLoading(false);
    };

    verifyUser();
  }, []);

  const login = async (email: string, password: string) => {
    const res = await AuthService.login(email, password);
    setToken(res.token);
    setUser(res.user);
    localStorage.setItem('ayojanix_token', res.token);
    localStorage.setItem('ayojanix_user', JSON.stringify(res.user));
  };

  const register = async (userData: any) => {
    const res = await AuthService.register(userData);
    setToken(res.token);
    setUser(res.user);
    localStorage.setItem('ayojanix_token', res.token);
    localStorage.setItem('ayojanix_user', JSON.stringify(res.user));
  };

  const logout = () => {
    localStorage.removeItem('ayojanix_token');
    localStorage.removeItem('ayojanix_user');
    setToken(null);
    setUser(null);
  };

  const hasRole = (roles: Role[]) => {
    if (!user) return false;
    return roles.includes(user.role);
  };

  const updateUser = (updatedData: Partial<User>) => {
    setUser((prev) => {
      if (!prev) return null;
      const updated = { ...prev, ...updatedData };
      localStorage.setItem('ayojanix_user', JSON.stringify(updated));
      return updated;
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated: !!user && !!token,
        login,
        register,
        logout,
        hasRole,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
