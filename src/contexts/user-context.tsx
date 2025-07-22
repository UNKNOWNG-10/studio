'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Transaction = {
  id: string;
  type: 'stake' | 'withdraw' | 'task' | 'login_bonus';
  amount: number;
  date: string;
  description: string;
};

interface User {
  uid: string;
  tokenBalance: number;
  stakedBalance: number;
  tasksCompleted: { [key: string]: boolean };
  transactions: Transaction[];
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
    const newTransaction: Transaction = {
      id: `tx_${Date.now()}`,
      type: 'login_bonus',
      amount: 1000,
      date: new Date().toISOString(),
      description: 'Welcome bonus for signing up',
    };
    const newUser: User = {
      uid,
      tokenBalance: 1000,
      stakedBalance: 0,
      tasksCompleted: {},
      transactions: [newTransaction],
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
    if (!user) return false;
    
    // Simulate API call for approval
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const stakeAmount = 5000; // Example stake for a 0.05 USDT payment
    
    const newTransaction: Transaction = {
      id: `tx_${Date.now()}`,
      type: 'stake',
      amount: stakeAmount,
      date: new Date().toISOString(),
      description: `Stake confirmed with Order ID: ${orderId}`,
    };

    const updatedUser = {
      ...user,
      stakedBalance: user.stakedBalance + stakeAmount,
      transactions: [newTransaction, ...(user.transactions || [])],
    };
    updateUserInStateAndStorage(updatedUser);
    return true;
  };
  
  const withdrawTokens = (amount: number): boolean => {
    if (!user || user.tokenBalance < amount) return false;
    
    const newTransaction: Transaction = {
      id: `tx_${Date.now()}`,
      type: 'withdraw',
      amount: amount,
      date: new Date().toISOString(),
      description: 'Test withdrawal',
    };

    const updatedUser = { 
      ...user, 
      tokenBalance: user.tokenBalance - amount,
      transactions: [newTransaction, ...(user.transactions || [])],
    };
    updateUserInStateAndStorage(updatedUser);
    return true;
  };

  const claimTaskReward = (taskId: string, reward: number) => {
    if (!user || user.tasksCompleted[taskId]) return;
    
    const newTransaction: Transaction = {
      id: `tx_${Date.now()}`,
      type: 'task',
      amount: reward,
      date: new Date().toISOString(),
      description: `Reward for task: ${taskId.replace(/_/g, ' ')}`,
    };

    const updatedUser = {
      ...user,
      tokenBalance: user.tokenBalance + reward,
      tasksCompleted: { ...user.tasksCompleted, [taskId]: true },
      transactions: [newTransaction, ...(user.transactions || [])],
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
