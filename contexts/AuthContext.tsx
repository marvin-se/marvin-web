"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { User } from '@/lib/types';

// Define the type for the context values
interface AuthContextType {
  user: User | null;
  login: (token: string, userData: any) => void;
  logout: () => void;
  loading: boolean;
}

// Create the context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider component that allows other components to access the context
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true); // For session check on initial page load
  const router = useRouter();

  useEffect(() => {
    // Check Local Storage when the page loads
    try {
      const storedUser = localStorage.getItem('user');
      const token = localStorage.getItem('token');
      if (storedUser && token) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error("Failed to parse user from localStorage", error);
      localStorage.removeItem('user');
      localStorage.removeItem('token');
    } finally {
      setLoading(false);
    }
  }, []);

  const login = (token: string, backendUser: any) => {
    // Map backend user to frontend User type
    const user: User = {
      id: backendUser.id,
      fullName: backendUser.fullName,
      email: backendUser.email,
      university: backendUser.university || null,
      phoneNumber: backendUser.phoneNumber,
      profilePicUrl: backendUser.profilePicUrl,
      createdAt: backendUser.createdAt,
      isActive: backendUser.isActive,
      token: token
    };

    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    setUser(user);
    router.push('/browse'); // Redirect to the main page after login
  };

  const logout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setUser(null);
    router.push('/auth/login'); // Redirect to the login page after logout
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
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
