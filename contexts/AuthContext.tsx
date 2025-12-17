"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { User } from '@/lib/types';
import api from '@/lib/api';

// Define the type for the context values
interface AuthContextType {
  user: User | null;
  login: (token: string, userData: any) => void;
  logout: () => void;
  refreshUser: () => Promise<void>;
  loading: boolean;
}

// Create the context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider component that allows other components to access the context
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true); // For session check on initial page load
  const router = useRouter();

  const refreshUser = async () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        const response = await api.get<User>('/user/me');
        const freshUser = response.data;
        login(token, freshUser); // Use login to update state and localStorage
      }
    } catch (error) {
      console.error("Failed to refresh user data, logging out.", error);
      logout(); // If token is invalid or refresh fails, log the user out
    }
  };

  useEffect(() => {
    const initializeAuth = async () => {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (token) {
        await refreshUser();
      }
      setLoading(false);
    };
    initializeAuth();
  }, []);

  const login = (token: string, backendUser: any) => {
    // Map backend user to frontend User type
    // Backend returns universityId and universityName, we need to map to university object
    const university = (backendUser.universityId && backendUser.universityName) 
      ? { id: backendUser.universityId, name: backendUser.universityName }
      : (backendUser.university || null);
    
    const user: User = {
      id: backendUser.id,
      fullName: backendUser.fullName,
      email: backendUser.email,
      university: university,
      phoneNumber: backendUser.phoneNumber,
      profilePicUrl: backendUser.profilePicUrl,
      createdAt: backendUser.createdAt,
      isActive: backendUser.isActive,
      items_sold: backendUser.items_sold || 0,
      items_purchased: backendUser.items_purchased || 0,
      items_listed: backendUser.items_listed || 0,
      token: token
    };

    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    setUser(user);
  };

  const logout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setUser(null);
    router.push('/auth/login'); // Redirect to the login page after logout
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, refreshUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook that allows other components to easily access the context values
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
