import React, { useEffect, useState } from 'react';
import { pb, type PocketBaseUser } from '../lib/pocketbase';
import { AuthContext, type RegisterPayload } from './auth-context-def';

function getCurrentUser(): PocketBaseUser | null {
  const current = pb.authStore.record || pb.authStore.model;
  return (current as PocketBaseUser | null) || null;
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<PocketBaseUser | null>(() => getCurrentUser());
  const [token, setToken] = useState<string>(() => pb.authStore.token);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    // Subscribe to PocketBase authStore state changes (login, logout, token refresh)
    const unsubscribe = pb.authStore.onChange((newToken, record) => {
      setToken(newToken);
      setUser((record as PocketBaseUser | null) || null);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string): Promise<PocketBaseUser> => {
    setIsLoading(true);
    try {
      const authData = await pb.collection('users').authWithPassword<PocketBaseUser>(email, password);
      setUser(authData.record);
      setToken(authData.token);
      return authData.record;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (payload: RegisterPayload): Promise<PocketBaseUser> => {
    setIsLoading(true);
    try {
      // Create new user in users collection
      await pb.collection('users').create(payload);

      // Auto log in newly registered user
      const authData = await pb.collection('users').authWithPassword<PocketBaseUser>(
        payload.email,
        payload.password
      );
      setUser(authData.record);
      setToken(authData.token);
      return authData.record;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    pb.authStore.clear();
    setUser(null);
    setToken('');
  };

  const refreshAuth = async () => {
    setIsLoading(true);
    try {
      if (pb.authStore.isValid) {
        const authData = await pb.collection('users').authRefresh<PocketBaseUser>();
        setUser(authData.record);
        setToken(authData.token);
      }
    } catch {
      logout();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user && pb.authStore.isValid,
        isLoading,
        login,
        register,
        logout,
        refreshAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
