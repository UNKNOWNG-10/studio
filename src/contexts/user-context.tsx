'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Transaction = {
  id: string;
  type: 'stake' | 'withdraw' | 'task' | 'login_bonus';
  amount: number;
  date: string;
  description: string;
};

export type Task = {
  id: string;
  title: string;
  reward: number;
  icon?: string; // Keeping this simple for now
};

interface User {
  uid: string;
  isAdmin: boolean;
  tokenBalance: number;
  stakedBalance: number;
  hasStaked: boolean; // To track if user has staked once
  tasksCompleted: { [key: string]: boolean };
  transactions: Transaction[];
}

interface UserContextType {
  user: User | null;
  loading: boolean;
  isAdmin: boolean;
  tasks: Task[];
  login: (uid: string) => void;
  logout: () => void;
  updateTokenBalance: (amount: number) => void;
  stakeTokens: (orderId: string) => Promise<boolean>;
  withdrawTokens: (amount: number) => boolean;
  claimTaskReward: (taskId: string, reward: number) => void;
  addTask: (task: Omit<Task, 'id'>) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

const initialTasks: Task[] = [
  { id: 'follow_twitter', title: 'Follow us on X (Twitter)', reward: 500, icon: 'Twitter' },
  { id: 'join_telegram', title: 'Join our Telegram Channel', reward: 500, icon: 'Send' },
  { id: 'first_stake', title: 'Make your first stake', reward: 1000, icon: 'Gift' },
  { id: 'watch_ad', title: 'Watch an Ad', reward: 100, icon: 'Tv' },
];

const ADMIN_UID = "admin_user_123";

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('pikaTokenUser');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
      const storedTasks = localStorage.getItem('pikaTokenTasks');
      if (storedTasks) {
        setTasks(JSON.parse(storedTasks));
      } else {
        setTasks(initialTasks);
        localStorage.setItem('pikaTokenTasks', JSON.stringify(initialTasks));
      }
    } catch (error) {
      console.error("Failed to parse from localStorage", error);
      localStorage.removeItem('pikaTokenUser');
      localStorage.removeItem('pikaTokenTasks');
    } finally {
      setLoading(false);
    }
  }, []);

  const login = (uid: string) => {
    const isAdmin = uid === ADMIN_UID;
    const newTransaction: Transaction = {
      id: `tx_${Date.now()}`,
      type: 'login_bonus',
      amount: 1000,
      date: new Date().toISOString(),
      description: 'Welcome bonus for signing up',
    };
    const newUser: User = {
      uid,
      isAdmin,
      tokenBalance: 1000,
      stakedBalance: 0,
      hasStaked: false,
      tasksCompleted: {},
      transactions: [newTransaction],
    };
    localStorage.setItem('pikaTokenUser', JSON.stringify(newUser));
    setUser(newUser);
  };

  const logout = () => {
    localStorage.removeItem('pikaTokenUser');
    setUser(null);
  };
  
  const updateUserInStateAndStorage = (updatedUser: User) => {
    setUser(updatedUser);
    localStorage.setItem('pikaTokenUser', JSON.stringify(updatedUser));
  };
  
  const updateTasksInStateAndStorage = (updatedTasks: Task[]) => {
    setTasks(updatedTasks);
    localStorage.setItem('pikaTokenTasks', JSON.stringify(updatedTasks));
  }

  const updateTokenBalance = (amount: number) => {
    if (!user) return;
    const updatedUser = { ...user, tokenBalance: user.tokenBalance + amount };
    updateUserInStateAndStorage(updatedUser);
  };
  
  const stakeTokens = async (orderId: string): Promise<boolean> => {
    if (!user || user.hasStaked) return false;
    
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const stakeAmount = 1000;
    
    if (user.tokenBalance < stakeAmount) return false;

    const newTransaction: Transaction = {
      id: `tx_${Date.now()}`,
      type: 'stake',
      amount: stakeAmount,
      date: new Date().toISOString(),
      description: `Stake confirmed with Order ID: ${orderId}`,
    };

    const updatedUser = {
      ...user,
      tokenBalance: user.tokenBalance - stakeAmount,
      stakedBalance: user.stakedBalance + stakeAmount,
      hasStaked: true,
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
    
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    const newTransaction: Transaction = {
      id: `tx_${Date.now()}`,
      type: 'task',
      amount: reward,
      date: new Date().toISOString(),
      description: `Reward for task: ${task.title}`,
    };

    const updatedUser = {
      ...user,
      tokenBalance: user.tokenBalance + reward,
      tasksCompleted: { ...user.tasksCompleted, [taskId]: true },
      transactions: [newTransaction, ...(user.transactions || [])],
    };
    updateUserInStateAndStorage(updatedUser);
  };

  const addTask = (task: Omit<Task, 'id'>) => {
    if(!user || !user.isAdmin) return;

    const newTask: Task = {
      ...task,
      id: `task_${Date.now()}`
    };

    const updatedTasks = [...tasks, newTask];
    updateTasksInStateAndStorage(updatedTasks);
  };

  return (
    <UserContext.Provider value={{ user, loading, isAdmin: user?.isAdmin || false, tasks, login, logout, updateTokenBalance, stakeTokens, withdrawTokens, claimTaskReward, addTask }}>
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
