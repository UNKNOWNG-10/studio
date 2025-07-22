'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';

interface User {
  uid: string;
  tokenBalance: number;
  stakedBalance: number;
  tasksCompleted: { [key: string]: boolean };
}

interface UserContextType {
  user: User | null;
  loading: boolean;
  login: (uid: string) => void;
  logout: () => void;
  updateTokenBalance: (amount: number) => void;
  stakeTokens: (orderId: string) => Promise<boolean>;
  withdrawTokens: (amount: number) => boolean;
  claimTaskReward: (taskId: string, reward: number) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('tokenTycoonUser');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error("Failed to parse user from localStorage", error);
      localStorage.removeItem('tokenTycoonUser');
    } finally {
      setLoading(false);
    }
  }, []);

  const login = (uid: string) => {
    const newUser: User = {
      uid,
      tokenBalance: 1000,
      stakedBalance: 0,
      tasksCompleted: {},
    };
    localStorage.setItem('tokenTycoonUser', JSON.stringify(newUser));
    setUser(newUser);
  };

  const logout = () => {
    localStorage.removeItem('tokenTycoonUser');
    setUser(null);
  };

  const updateUserInStateAndStorage = (updatedUser: User) => {
    setUser(updatedUser);
    localStorage.setItem('tokenTycoonUser', JSON.stringify(updatedUser));
  };

  const updateTokenBalance = (amount: number) => {
    if (!user) return;
    const updatedUser = { ...user, tokenBalance: user.tokenBalance + amount };
    updateUserInStateAndStorage(updatedUser);
  };
  
  const stakeTokens = async (orderId: string): Promise<boolean> => {
    if (!user || user.tokenBalance < 0.05) return false; // This check is symbolic as we don't convert to USDT here.
    
    // Simulate API call for approval
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const stakeAmount = 5000; // Example stake for a 0.05 USDT payment
    
    const updatedUser = {
      ...user,
      stakedBalance: user.stakedBalance + stakeAmount,
    };
    updateUserInStateAndStorage(updatedUser);
    return true;
  };
  
  const withdrawTokens = (amount: number): boolean => {
    if (!user || user.tokenBalance < amount) return false;
    const updatedUser = { ...user, tokenBalance: user.tokenBalance - amount };
    updateUserInStateAndStorage(updatedUser);
    return true;
  };

  const claimTaskReward = (taskId: string, reward: number) => {
    if (!user || user.tasksCompleted[taskId]) return;
    const updatedUser = {
      ...user,
      tokenBalance: user.tokenBalance + reward,
      tasksCompleted: { ...user.tasksCompleted, [taskId]: true },
    };
    updateUserInStateAndStorage(updatedUser);
  };

  return (
    <UserContext.Provider value={{ user, loading, login, logout, updateTokenBalance, stakeTokens, withdrawTokens, claimTaskReward }}>
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
