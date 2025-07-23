
'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { toast } from '@/hooks/use-toast';
import { useSearchParams } from 'next/navigation';

export type Transaction = {
  id: string;
  type: 'stake' | 'withdraw' | 'task' | 'login_bonus' | 'earning' | 'referral_bonus' | 'referral_milestone' | 'task_submission';
  amount: number;
  date: string;
  description: string;
  status: 'pending' | 'approved' | 'completed' | 'rejected';
  taskId?: string; // Link transaction to a specific task
  uid?: string;
};

export type Task = {
  id: string;
  title: string;
  reward: number;
  icon?: string;
  url?: string;
  htmlContent?: string;
  requiresApproval?: boolean;
};

export interface User {
  uid: string;
  isAdmin: boolean;
  tokenBalance: number;
  stakedBalance: number;
  hasStaked: boolean; 
  tasksCompleted: { [key: string]: string };
  transactions: Transaction[];
  lastPayoutTime?: string;
  referrerId?: string;
  referrals: string[];
  claimedReferralMilestones: number[];
}

export type ReferralMilestone = {
  id: number;
  requiredRefs: number;
  reward: number;
  title: string;
};

interface UserContextType {
  user: User | null;
  loading: boolean;
  isAdmin: boolean;
  tasks: Task[];
  referralMilestones: ReferralMilestone[];
  login: (uid: string) => void;
  logout: () => void;
  updateTokenBalance: (amount: number) => void;
  stakeTokens: (orderId: string) => Promise<boolean>;
  withdrawTokens: (amount: number) => boolean;
  claimTaskReward: (taskId: string, submission?: string) => Promise<boolean>;
  claimReferralMilestone: (milestoneId: number) => Promise<boolean>;
  addTask: (task: Omit<Task, 'id' | 'icon'>) => void;
  editTask: (task: Task) => void;
  deleteTask: (taskId: string) => void;
  approveTransaction: (transactionId: string, targetUserId: string) => void;
  rejectTransaction: (transactionId: string, targetUserId: string) => void;
  getAllTransactions: () => Transaction[];
  getAllUsers: () => { [key: string]: User };
}

const UserContext = createContext<UserContextType | undefined>(undefined);

const initialTasks: Task[] = [
  { id: 'follow_twitter', title: 'Follow us on X (Twitter)', reward: 500, icon: 'Twitter', url: 'https://x.com/Pika_Token_io' },
  { id: 'join_telegram', title: 'Join our Telegram Channel', reward: 500, icon: 'Send', url: 'https://t.me/pikatoken_io' },
  { id: 'first_stake', title: 'Make your first stake', reward: 1000, icon: 'Gift' },
  { id: 'watch_ad', title: 'Watch an Ad', reward: 100, icon: 'Tv', requiresApproval: true, htmlContent: '<p>This is a sample ad. Watch for 10 seconds!</p>' },
  { id: 'submit_tweet', title: 'Tweet about Pika Token', reward: 1500, icon: 'Twitter', requiresApproval: true },
];

const referralMilestones: ReferralMilestone[] = [
    { id: 1, requiredRefs: 1, reward: 200, title: '1 Referral' },
    { id: 2, requiredRefs: 5, reward: 700, title: '5 Referrals' },
    { id: 3, requiredRefs: 10, reward: 1400, title: '10 Referrals' },
    { id: 4, requiredRefs: 25, reward: 3000, title: '25 Referrals' },
    { id: 5, requiredRefs: 50, reward: 5500, title: '50 Referrals' },
    { id: 6, requiredRefs: 100, reward: 14000, title: '100 Referrals' },
    { id: 7, requiredRefs: 250, reward: 35000, title: '250 Referrals' },
    { id: 8, requiredRefs: 500, reward: 75000, title: '500 Referrals' },
    { id: 9, requiredRefs: 1000, reward: 180000, title: '1000 Referrals' },
];

const ADMIN_UID = "admin_user_123";
const HOURLY_EARNING_RATE_FACTOR = (0.03 / 24) * 45;
const MINIMUM_WITHDRAWAL_AMOUNT = 100000;
const ONE_TIME_TASKS = ['follow_twitter', 'join_telegram', 'first_stake', 'submit_tweet'];

const UserProviderContent = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [users, setUsers] = useState<{ [key: string]: User }>({});
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  const searchParams = useSearchParams();
  const ref = searchParams.get('ref');

  useEffect(() => {
    try {
      const storedUsers = localStorage.getItem('pikaTokenUsers');
      if (storedUsers) {
        setUsers(JSON.parse(storedUsers));
      }

      const deviceUser = localStorage.getItem('pikaTokenDeviceUser');
      if (deviceUser && storedUsers) {
        const allUsers = JSON.parse(storedUsers);
        if (allUsers[deviceUser]) {
          setUser(allUsers[deviceUser]);
        }
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
      localStorage.removeItem('pikaTokenUsers');
      localStorage.removeItem('pikaTokenTasks');
      localStorage.removeItem('pikaTokenDeviceUser');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!user || user.stakedBalance <= 0) return;

    const payoutInterval = setInterval(() => {
      // We need to fetch the latest user data from the users state
      setUsers(currentUsers => {
        const currentUser = currentUsers[user.uid];
        if (!currentUser || currentUser.stakedBalance <= 0) {
          clearInterval(payoutInterval);
          return currentUsers;
        }

        const lastPayout = new Date(currentUser.lastPayoutTime || Date.now());
        const now = new Date();
        const hoursDiff = (now.getTime() - lastPayout.getTime()) / (1000 * 60 * 60);
  
        if (hoursDiff >= 1) {
          const hoursToPay = Math.floor(hoursDiff);
          const earnings = currentUser.stakedBalance * HOURLY_EARNING_RATE_FACTOR * hoursToPay;
          
          const newTransaction: Transaction = {
            id: `tx_earn_${Date.now()}`,
            type: 'earning',
            amount: earnings,
            date: now.toISOString(),
            description: `Hourly staking reward for ${hoursToPay} hour(s)`,
            status: 'completed'
          };
          
          const updatedUser: User = {
            ...currentUser,
            tokenBalance: currentUser.tokenBalance + earnings,
            lastPayoutTime: now.toISOString(),
            transactions: [newTransaction, ...(currentUser.transactions || [])],
          };

          const newUsers = { ...currentUsers, [currentUser.uid]: updatedUser };
          localStorage.setItem('pikaTokenUsers', JSON.stringify(newUsers));
          setUser(updatedUser); // Update active user state
          return newUsers;
        }
        return currentUsers;
      });

    }, 60 * 1000); 

    return () => clearInterval(payoutInterval);
  }, [user]);

  const updateUserAndSave = (updatedUser: User) => {
    setUser(updatedUser);
    setUsers(currentUsers => {
      const newUsers = { ...currentUsers, [updatedUser.uid]: updatedUser };
      localStorage.setItem('pikaTokenUsers', JSON.stringify(newUsers));
      return newUsers;
    });
  };
  
  const updateTasksInStateAndStorage = (updatedTasks: Task[]) => {
    setTasks(updatedTasks);
    localStorage.setItem('pikaTokenTasks', JSON.stringify(updatedTasks));
  }

  const login = (uid: string) => {
    const isAdminLogin = uid === ADMIN_UID;
    
    if (!isAdminLogin) {
      const deviceUser = localStorage.getItem('pikaTokenDeviceUser');
      if (deviceUser && deviceUser !== uid) {
        toast({ title: "Login Error", description: "This device is already associated with another account.", variant: "destructive" });
        return;
      }
    }
    
    if (users[uid]) {
      setUser(users[uid]);
      localStorage.setItem('pikaTokenDeviceUser', uid);
      return;
    }
    
    const newTransaction: Transaction = {
      id: `tx_bonus_${Date.now()}`,
      type: 'login_bonus',
      amount: 1000,
      date: new Date().toISOString(),
      description: 'Welcome bonus for signing up',
      status: 'completed',
    };
    const newUser: User = {
      uid,
      isAdmin: isAdminLogin,
      tokenBalance: 1000,
      stakedBalance: 0,
      hasStaked: false,
      tasksCompleted: {},
      transactions: [newTransaction],
      lastPayoutTime: new Date().toISOString(),
      referrerId: ref || undefined,
      referrals: [],
      claimedReferralMilestones: [],
    };
    
    updateUserAndSave(newUser);
    localStorage.setItem('pikaTokenDeviceUser', uid);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('pikaTokenDeviceUser');
  };
  
  const updateTokenBalance = (amount: number) => {
    if (!user) return;
    const updatedUser = { ...user, tokenBalance: user.tokenBalance + amount };
    updateUserAndSave(updatedUser);
  };
  
  const stakeTokens = async (orderId: string): Promise<boolean> => {
    if (!user || user.hasStaked) return false;
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
      tokenBalance: user.tokenBalance - stakeAmount,
      transactions: [newTransaction, ...(user.transactions || [])],
    };
    updateUserAndSave(updatedUser);
    return true;
  };
  
  const withdrawTokens = (amount: number): boolean => {
    if (!user || user.tokenBalance < amount || amount < MINIMUM_WITHDRAWAL_AMOUNT) return false;
    
    const newTransaction: Transaction = {
      id: `tx_withdraw_${Date.now()}`,
      type: 'withdraw',
      amount: amount,
      date: new Date().toISOString(),
      description: 'Withdrawal request',
      status: 'pending'
    };

    const updatedUser = { 
      ...user, 
      tokenBalance: user.tokenBalance - amount,
      transactions: [newTransaction, ...(user.transactions || [])],
    };
    updateUserAndSave(updatedUser);
    return true;
  };

  const approveTransaction = (transactionId: string, targetUserId: string) => {
    if (!user || !user.isAdmin) return;

    let allUsers = { ...users };
    let targetUser = allUsers[targetUserId];
    if (!targetUser) return;

    const tx = targetUser.transactions.find(t => t.id === transactionId);
    if (!tx || tx.status !== 'pending') return;
    
    let updatedUser = { ...targetUser };

    if (tx.type === 'stake') {
        updatedUser = {
            ...updatedUser,
            stakedBalance: updatedUser.stakedBalance + tx.amount,
            hasStaked: true,
            lastPayoutTime: new Date().toISOString()
        };

        // Referral logic
        if (updatedUser.referrerId && allUsers[updatedUser.referrerId]) {
            let referrer = allUsers[updatedUser.referrerId];
            const referralBonus = 300;
            const bonusTransaction: Transaction = {
                id: `tx_ref_${Date.now()}`,
                type: 'referral_bonus',
                amount: referralBonus,
                date: new Date().toISOString(),
                description: `Referral bonus from user ${updatedUser.uid}`,
                status: 'completed',
            };
            referrer = {
                ...referrer,
                tokenBalance: referrer.tokenBalance + referralBonus,
                transactions: [bonusTransaction, ...(referrer.transactions || [])],
                referrals: [...(referrer.referrals || []), updatedUser.uid],
            }
            allUsers[referrer.uid] = referrer;
        }
    } else if (tx.type === 'task_submission') {
        updatedUser = {
            ...updatedUser,
            tokenBalance: updatedUser.tokenBalance + tx.amount
        }
    }
    
    const updatedTransactions = updatedUser.transactions.map(t => 
      t.id === transactionId ? { ...t, status: 'approved' as const, description: t.description.replace('Submission', 'Approved') } : t
    );

    updatedUser.transactions = updatedTransactions;
    allUsers[targetUserId] = updatedUser;
    
    setUsers(allUsers);
    localStorage.setItem('pikaTokenUsers', JSON.stringify(allUsers));
    if (user.uid === targetUserId) {
      setUser(updatedUser);
    }
  }
  
  const rejectTransaction = (transactionId: string, targetUserId: string) => {
    if (!user || !user.isAdmin) return;
    
    let allUsers = { ...users };
    let targetUser = allUsers[targetUserId];
    if (!targetUser) return;

    const tx = targetUser.transactions.find(t => t.id === transactionId);
    if (!tx || tx.status !== 'pending') return;
    
    let updatedUser = { ...targetUser };
    
    if (tx.type === 'stake' || tx.type === 'withdraw') {
        updatedUser = { 
            ...updatedUser,
            tokenBalance: updatedUser.tokenBalance + tx.amount
        };
    }
    
    const updatedTransactions = updatedUser.transactions.map(t =>
      t.id === transactionId ? { ...t, status: 'rejected' as const, description: t.description.replace('request', 'rejected').replace('Submission', 'Rejected') } : t
    );

    updatedUser.transactions = updatedTransactions;
    allUsers[targetUserId] = updatedUser;

    setUsers(allUsers);
    localStorage.setItem('pikaTokenUsers', JSON.stringify(allUsers));
    if (user.uid === targetUserId) {
      setUser(updatedUser);
    }
  };


  const claimTaskReward = async (taskId: string, submission?: string): Promise<boolean> => {
    if (!user) return false;
    
    const task = tasks.find(t => t.id === taskId);
    if (!task) return false;

    const lastCompleted = user.tasksCompleted[taskId];
    const now = new Date();
    
    const isOneTime = ONE_TIME_TASKS.includes(taskId) || task.requiresApproval;

    if (isOneTime) {
      if (lastCompleted) return false; 
      if (taskId === 'first_stake' && user.stakedBalance <= 0) return false; 
    } else {
       const cooldown = 60 * 1000;
       if (lastCompleted && now.getTime() - new Date(lastCompleted).getTime() < cooldown) {
         return false;
       }
    }

    if (task.requiresApproval) {
        const newTransaction: Transaction = {
          id: `tx_tasksub_${Date.now()}`,
          type: 'task_submission',
          amount: task.reward,
          date: now.toISOString(),
          description: `Task Submission: ${task.title}. ${submission ? `Data: ${submission}`: ''}`,
          status: 'pending',
          taskId: taskId
        };
        const updatedUser = {
          ...user,
          tasksCompleted: { ...user.tasksCompleted, [taskId]: now.toISOString() },
          transactions: [newTransaction, ...(user.transactions || [])],
        };
        updateUserAndSave(updatedUser);
        toast({ title: "Task Submitted", description: "Your submission is pending admin approval." });
        return true;
    }
    
    const newTransaction: Transaction = {
      id: `tx_task_${Date.now()}`,
      type: 'task',
      amount: task.reward,
      date: now.toISOString(),
      description: `Reward for task: ${task.title}`,
      status: 'completed'
    };

    const updatedUser = {
      ...user,
      tokenBalance: user.tokenBalance + task.reward,
      tasksCompleted: { ...user.tasksCompleted, [taskId]: now.toISOString() },
      transactions: [newTransaction, ...(user.transactions || [])],
    };
    updateUserAndSave(updatedUser);
    return true;
  };
  
  const claimReferralMilestone = async (milestoneId: number): Promise<boolean> => {
    if (!user) return false;

    const milestone = referralMilestones.find(m => m.id === milestoneId);
    if (!milestone) return false;

    const referralsCount = user.referrals?.length || 0;
    if (referralsCount < milestone.requiredRefs) {
        toast({ title: 'Cannot Claim', description: 'You have not reached the required number of referrals.', variant: 'destructive' });
        return false;
    }

    if ((user.claimedReferralMilestones || []).includes(milestoneId)) {
        toast({ title: 'Already Claimed', description: 'You have already claimed this milestone reward.', variant: 'destructive' });
        return false;
    }
    
    const newTransaction: Transaction = {
      id: `tx_milestone_${Date.now()}`,
      type: 'referral_milestone',
      amount: milestone.reward,
      date: new Date().toISOString(),
      description: `Reward for milestone: ${milestone.title}`,
      status: 'completed'
    };

    const updatedUser: User = {
        ...user,
        tokenBalance: user.tokenBalance + milestone.reward,
        claimedReferralMilestones: [...(user.claimedReferralMilestones || []), milestone.id],
        transactions: [newTransaction, ...(user.transactions || [])],
    };

    updateUserAndSave(updatedUser);
    toast({ title: 'Reward Claimed!', description: `You received ${milestone.reward.toLocaleString()} Pika Tokens.` });
    return true;
  };

  const addTask = (task: Omit<Task, 'id' | 'icon' | 'htmlContent'>) => {
    if(!user || !user.isAdmin) return;

    const newTask: Task = {
      ...task,
      id: `task_${Date.now()}`,
      icon: 'Tag',
    };

    const updatedTasks = [...tasks, newTask];
    updateTasksInStateAndStorage(updatedTasks);
  };
  
  const editTask = (updatedTask: Task) => {
    if (!user || !user.isAdmin) return;
    const updatedTasks = tasks.map(task => (task.id === updatedTask.id ? updatedTask : task));
    updateTasksInStateAndStorage(updatedTasks);
  };

  const deleteTask = (taskId: string) => {
    if (!user || !user.isAdmin) return;
    const updatedTasks = tasks.filter(task => task.id !== taskId);
    updateTasksInStateAndStorage(updatedTasks);
  };

  const getAllTransactions = (): Transaction[] => {
    return Object.values(users)
      .flatMap(u => u.transactions.map(t => ({...t, uid: u.uid})))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  const getAllUsers = (): { [key: string]: User } => {
    return users;
  }

  return (
    <UserContext.Provider value={{ user, loading, isAdmin: user?.isAdmin || false, tasks, referralMilestones, login, logout, updateTokenBalance, stakeTokens, withdrawTokens, claimTaskReward, claimReferralMilestone, addTask, editTask, deleteTask, approveTransaction, rejectTransaction, getAllTransactions, getAllUsers }}>
      {children}
    </UserContext.Provider>
  );
};

export const UserProvider = ({ children }: { children: ReactNode }) => (
    <UserProviderContent>{children}</UserProviderContent>
);

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
