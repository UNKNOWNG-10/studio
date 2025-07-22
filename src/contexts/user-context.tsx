'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Transaction = {
  id: string;
  type: 'stake' | 'withdraw' | 'task' | 'login_bonus' | 'earning';
  amount: number;
  date: string;
  description: string;
  status: 'pending' | 'approved' | 'completed';
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
  lastPayoutTime?: string;
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
  approveTransaction: (transactionId: string) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

const initialTasks: Task[] = [
  { id: 'follow_twitter', title: 'Follow us on X (Twitter)', reward: 500, icon: 'Twitter' },
  { id: 'join_telegram', title: 'Join our Telegram Channel', reward: 500, icon: 'Send' },
  { id: 'first_stake', title: 'Make your first stake', reward: 1000, icon: 'Gift' },
  { id: 'watch_ad', title: 'Watch an Ad', reward: 100, icon: 'Tv' },
];

const ADMIN_UID = "admin_user_123";
const HOURLY_EARNING_RATE_FACTOR = (0.03 / 24) * 45; // ~54.16 tokens per hour for 1000 staked

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

  useEffect(() => {
    const payoutInterval = setInterval(() => {
      if (user && user.stakedBalance > 0) {
        const lastPayout = new Date(user.lastPayoutTime || Date.now());
        const now = new Date();
        const hoursDiff = (now.getTime() - lastPayout.getTime()) / (1000 * 60 * 60);

        if (hoursDiff >= 1) {
          const hoursToPay = Math.floor(hoursDiff);
          const earnings = user.stakedBalance * HOURLY_EARNING_RATE_FACTOR * hoursToPay;
          
          const newTransaction: Transaction = {
            id: `tx_earn_${Date.now()}`,
            type: 'earning',
            amount: earnings,
            date: now.toISOString(),
            description: `Hourly staking reward for ${hoursToPay} hour(s)`,
            status: 'completed'
          };
          
          const updatedUser: User = {
            ...user,
            tokenBalance: user.tokenBalance + earnings,
            lastPayoutTime: now.toISOString(),
            transactions: [newTransaction, ...(user.transactions || [])],
          };
          updateUserInStateAndStorage(updatedUser);
        }
      }
    }, 60 * 1000); // Check every minute

    return () => clearInterval(payoutInterval);
  }, [user]);


  const login = (uid: string) => {
    const isAdmin = uid === ADMIN_UID;
    const newTransaction: Transaction = {
      id: `tx_${Date.now()}`,
      type: 'login_bonus',
      amount: 1000,
      date: new Date().toISOString(),
      description: 'Welcome bonus for signing up',
      status: 'completed',
    };
    const newUser: User = {
      uid,
      isAdmin,
      tokenBalance: 1000,
      stakedBalance: 0,
      hasStaked: false,
      tasksCompleted: {},
      transactions: [newTransaction],
      lastPayoutTime: new Date().toISOString(),
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
    
    // This is now just a pending transaction, admin must approve
    const stakeAmount = 1000;
    
    if (user.tokenBalance < stakeAmount) return false;

    const newTransaction: Transaction = {
      id: `tx_stake_${Date.now()}`,
      type: 'stake',
      amount: stakeAmount,
      date: new Date().toISOString(),
      description: `Stake request with Order ID: ${orderId}`,
      status: 'pending'
    };

    const updatedUser = {
      ...user,
      transactions: [newTransaction, ...(user.transactions || [])],
    };
    updateUserInStateAndStorage(updatedUser);
    return true;
  };
  
  const withdrawTokens = (amount: number): boolean => {
    if (!user || user.tokenBalance < amount) return false;
    
    const newTransaction: Transaction = {
      id: `tx_withdraw_${Date.now()}`,
      type: 'withdraw',
      amount: amount,
      date: new Date().toISOString(),
      description: 'Test withdrawal request',
      status: 'pending'
    };

    const updatedUser = { 
      ...user, 
      transactions: [newTransaction, ...(user.transactions || [])],
    };
    updateUserInStateAndStorage(updatedUser);
    return true;
  };

  const approveTransaction = (transactionId: string) => {
    if (!user || !user.isAdmin) return;
    
    // In a real app, you'd fetch all users' data, but here we just manage one user at a time.
    // This will only work for the currently logged-in user's transactions.
    // For a multi-user app, this logic would need to be on a server.
    const tx = user.transactions.find(t => t.id === transactionId);
    if (!tx || tx.status !== 'pending') return;

    let updatedUser: User = { ...user };
    
    if (tx.type === 'stake') {
        updatedUser = {
            ...updatedUser,
            tokenBalance: updatedUser.tokenBalance - tx.amount,
            stakedBalance: updatedUser.stakedBalance + tx.amount,
            hasStaked: true,
            lastPayoutTime: new Date().toISOString()
        }
    } else if (tx.type === 'withdraw') {
        if(updatedUser.tokenBalance < tx.amount) {
          // This can happen if they requested a withdraw then spent the tokens
          // before approval. We'll just deny it by not processing.
          // Or we can add a "denied" status. For now, let's just do nothing.
          return;
        }
        updatedUser = {
            ...updatedUser,
            tokenBalance: updatedUser.tokenBalance - tx.amount
        }
    }
    
    const updatedTransactions = updatedUser.transactions.map(t => 
      t.id === transactionId ? { ...t, status: 'approved' as const, description: t.description.replace('request', 'approved') } : t
    );

    updatedUser.transactions = updatedTransactions;
    updateUserInStateAndStorage(updatedUser);
  }

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
      status: 'completed'
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
    <UserContext.Provider value={{ user, loading, isAdmin: user?.isAdmin || false, tasks, login, logout, updateTokenBalance, stakeTokens, withdrawTokens, claimTaskReward, addTask, approveTransaction }}>
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
