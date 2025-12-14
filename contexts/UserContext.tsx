
import React, { createContext, useContext, useState } from 'react';
import { User } from '../types';
import { CURRENT_USER as DEFAULT_USER } from '../constants';

interface UserContextType {
  currentUser: User;
  isAuthenticated: boolean;
  updateCurrentUser: (updates: Partial<User>) => void;
  login: () => void;
  logout: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User>(DEFAULT_USER);
  const [isAuthenticated, setIsAuthenticated] = useState(true);

  const updateCurrentUser = (updates: Partial<User>) => {
    setCurrentUser(prev => ({ ...prev, ...updates }));
  };

  const login = () => setIsAuthenticated(true);
  const logout = () => setIsAuthenticated(false);

  return (
    <UserContext.Provider value={{ currentUser, isAuthenticated, updateCurrentUser, login, logout }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
