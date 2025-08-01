
'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, Suspense } from 'react';
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
  cooldown: number; // Cooldown in seconds
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
  stakeCount: number; 
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
  loginIconUrl: string;
  loginBgUrl: string;
  mainBgUrl: string;
  adminNotes: string;
  withdrawalsEnabled: boolean;
  setWithdrawalsEnabled: (enabled: boolean) => void;
  login: (uid: string) => void;
  logout: () => void;
  updateTokenBalance: (amount: number) => void;
  stakeTokens: (orderId: string) => Promise<boolean>;
  withdrawTokens: (amount: number) => Promise<boolean>;
  claimTaskReward: (taskId: string, submission?: string) => Promise<boolean>;
  claimReferralMilestone: (milestoneId: number) => Promise<boolean>;
  addTask: (task: Omit<Task, 'id' | 'icon'>) => void;
  editTask: (task: Task) => void;
  deleteTask: (taskId: string) => void;
  approveTransaction: (transactionId: string, targetUserId: string) => void;
  rejectTransaction: (transactionId: string, targetUserId: string) => void;
  getAllTransactions: () => Transaction[];
  getAllUsers: () => { [key: string]: User };
  updateLoginIconUrl: (url: string) => void;
  updateLoginBgUrl: (url: string) => void;
  updateMainBgUrl: (url: string) => void;
  updateAdminNotes: (notes: string) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

const initialTasks: Task[] = [
  { id: 'follow_twitter', title: 'Follow us on X (Twitter)', reward: 500, icon: 'Twitter', url: 'https://x.com/pika_io', cooldown: 86400, },
  { id: 'join_telegram', title: 'Join our Telegram Channel', reward: 500, icon: 'Send', url: 'https://t.me/pika_io', cooldown: 86400, },
  { id: 'first_stake', title: 'Make your first stake', reward: 1000, icon: 'Gift', cooldown: 0 },
  { id: 'submit_tweet', title: 'Tweet about Pika Token', reward: 1500, icon: 'Twitter', requiresApproval: true, cooldown: 0 },
];

const referralMilestones: ReferralMilestone[] = [
    { id: 1, requiredRefs: 1, reward: 300, title: '1 Referral' },
    { id: 2, requiredRefs: 5, reward: 1500, title: '5 Referrals' },
    { id: 3, requiredRefs: 25, reward: 7500, title: '25 Referrals' },
    { id: 4, requiredRefs: 50, reward: 15000, title: '50 Referrals' },
    { id: 5, requiredRefs: 100, reward: 30000, title: '100 Referrals' },
    { id: 6, requiredRefs: 250, reward: 75000, title: '250 Referrals' },
    { id: 7, requiredRefs: 500, reward: 150000, title: '500 Referrals' },
    { id: 8, requiredRefs: 1000, reward: 300000, title: '1000 Referrals' },
    { id: 9, requiredRefs: 1500, reward: 450000, title: '1500 Referrals' },
    { id: 10, requiredRefs: 2000, reward: 600000, title: '2000 Referrals' },
];

const ADMIN_UID = "admin_user_123";
const FIVE_MINUTE_EARNING_RATE_PER_STAKE = 180;
const MAX_STAKES = 10;
const MINIMUM_WITHDRAWAL_AMOUNT = 100000;
const ONE_TIME_TASKS = ['first_stake', 'submit_tweet'];

const UserProviderContent = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [users, setUsers] = useState<{ [key: string]: User }>({});
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [loginIconUrl, setLoginIconUrl] = useState('');
  const [loginBgUrl, setLoginBgUrl] = useState('');
  const [mainBgUrl, setMainBgUrl] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [withdrawalsEnabled, setWithdrawalsEnabled] = useState(false);

  const searchParams = useSearchParams();
  const ref = searchParams.get('ref');

  useEffect(() => {
    try {
      let allUsers: { [key: string]: User } = {};
      const storedUsers = localStorage.getItem('pikaTokenUsers');
      if (storedUsers) {
        try {
          allUsers = JSON.parse(storedUsers);
          setUsers(allUsers);
        } catch (e) {
          console.error("Failed to parse users from localStorage", e);
          localStorage.removeItem('pikaTokenUsers');
        }
      }

      const deviceUserUid = localStorage.getItem('pikaTokenDeviceUser');
      if (deviceUserUid && allUsers[deviceUserUid]) {
          setUser(allUsers[deviceUserUid]);
      }

      const storedTasks = localStorage.getItem('pikaTokenTasks');
      if (storedTasks) {
        try {
          setTasks(JSON.parse(storedTasks));
        } catch (e) {
          console.error("Failed to parse tasks from localStorage", e);
          localStorage.removeItem('pikaTokenTasks');
          setTasks(initialTasks);
        }
      } else {
        setTasks(initialTasks);
        localStorage.setItem('pikaTokenTasks', JSON.stringify(initialTasks));
      }

      const storedIconUrl = localStorage.getItem('pikaLoginIconUrl');
      if (storedIconUrl) setLoginIconUrl(storedIconUrl);
      
      const storedLoginBgUrl = localStorage.getItem('pikaLoginBgUrl');
      if (storedLoginBgUrl) setLoginBgUrl(storedLoginBgUrl);
      
      const storedMainBgUrl = localStorage.getItem('pikaMainBgUrl');
      if (storedMainBgUrl) setMainBgUrl(storedMainBgUrl);

      const storedAdminNotes = localStorage.getItem('pikaAdminNotes');
      if (storedAdminNotes) setAdminNotes(storedAdminNotes);

      const storedWithdrawalStatus = localStorage.getItem('pikaWithdrawalsEnabled');
      if (storedWithdrawalStatus) {
        try {
          setWithdrawalsEnabled(JSON.parse(storedWithdrawalStatus));
        } catch (e) {
          console.error("Failed to parse withdrawal status from localStorage", e);
          localStorage.removeItem('pikaWithdrawalsEnabled');
        }
      }

    } catch (error) {
      console.error("An unexpected error occurred during initialization", error);
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
        const minutesDiff = (now.getTime() - lastPayout.getTime()) / (1000 * 60);
  
        if (minutesDiff >= 5) {
          const intervalsToPay = Math.floor(minutesDiff / 5);
          const earnings = (FIVE_MINUTE_EARNING_RATE_PER_STAKE * currentUser.stakeCount) * intervalsToPay;
          const newLastPayoutTime = new Date(lastPayout.getTime() + intervalsToPay * 5 * 60 * 1000);
          
          const newTransaction: Transaction = {
            id: `tx_earn_${Date.now()}`,
            type: 'earning',
            amount: earnings,
            date: now.toISOString(),
            description: `Staking reward for ${intervalsToPay * 5} minute(s)`,
            status: 'completed'
          };
          
          const updatedUser: User = {
            ...currentUser,
            tokenBalance: currentUser.tokenBalance + earnings,
            lastPayoutTime: newLastPayoutTime.toISOString(),
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
      stakeCount: 0,
      tasksCompleted: {},
      transactions: [newTransaction],
      lastPayoutTime: new Date().toISOString(),
      referrerId: ref || undefined,
      referrals: [],
      claimedReferralMilestones: [],
    };
    
    updateUserAndSave(newUser);
    if (!isAdminLogin) {
        localStorage.setItem('pikaTokenDeviceUser', uid);
    }
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
    if (!user || user.stakeCount >= MAX_STAKES) return false;
    const stakeAmount = 1000;
    if (user.tokenBalance < stakeAmount) return false;

    const newTransaction: Transaction = {
      id: `tx_stake_${Date.now()}`,
      type: 'stake',
      amount: stakeAmount,
      date: new Date().toISOString(),
      description: `Stake #${user.stakeCount + 1} request with Order ID: ${orderId}`,
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
  
  const withdrawTokens = async (amount: number): Promise<boolean> => {
    if (!user || !withdrawalsEnabled || user.tokenBalance < amount || amount < MINIMUM_WITHDRAWAL_AMOUNT) return false;
    
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
        const isFirstStake = updatedUser.stakeCount === 0;
        updatedUser = {
            ...updatedUser,
            stakedBalance: updatedUser.stakedBalance + tx.amount,
            stakeCount: updatedUser.stakeCount + 1,
            lastPayoutTime: new Date().toISOString()
        };

        // Referral logic only on first stake
        if (isFirstStake && updatedUser.referrerId && allUsers[updatedUser.referrerId]) {
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
    } else if (tx.type === 'task_submission' || tx.type === 'withdraw') {
        updatedUser = {
            ...updatedUser,
            tokenBalance: updatedUser.tokenBalance + tx.amount
        }
    }
    
    const updatedTransactions = updatedUser.transactions.map(t => 
      t.id === transactionId ? { ...t, status: 'approved' as const, description: t.description.replace('Submission', 'Approved').replace('request', 'approved') } : t
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
    
    const isOneTime = ONE_TIME_TASKS.includes(taskId) || task.requiresApproval || task.cooldown === 0;

    if (isOneTime) {
      if (lastCompleted) return false; 
      if (taskId === 'first_stake' && user.stakedBalance <= 0) return false; 
    } else {
       const cooldownMs = (task.cooldown || 60) * 1000;
       if (lastCompleted && now.getTime() - new Date(lastCompleted).getTime() < cooldownMs) {
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
      status: 'completed',
      taskId: taskId
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
  
  const updateLoginIconUrl = (url: string) => {
    if (!user || !user.isAdmin) return;
    setLoginIconUrl(url);
    localStorage.setItem('pikaLoginIconUrl', url);
  }

  const updateLoginBgUrl = (url: string) => {
    if (!user || !user.isAdmin) return;
    setLoginBgUrl(url);
    localStorage.setItem('pikaLoginBgUrl', url);
  }
  
  const updateMainBgUrl = (url: string) => {
    if (!user || !user.isAdmin) return;
    setMainBgUrl(url);
    localStorage.setItem('pikaMainBgUrl', url);
  }

  const updateAdminNotes = (notes: string) => {
    if (!user || !user.isAdmin) return;
    setAdminNotes(notes);
    localStorage.setItem('pikaAdminNotes', notes);
  };
  
  const updateWithdrawalStatus = (enabled: boolean) => {
    if (!user || !user.isAdmin) return;
    setWithdrawalsEnabled(enabled);
    localStorage.setItem('pikaWithdrawalsEnabled', JSON.stringify(enabled));
  };


  return (
    <UserContext.Provider value={{ user, loading, isAdmin: user?.isAdmin || false, tasks, referralMilestones, login, logout, updateTokenBalance, stakeTokens, withdrawTokens, claimTaskReward, claimReferralMilestone, addTask, editTask, deleteTask, approveTransaction, rejectTransaction, getAllTransactions, getAllUsers, loginIconUrl, loginBgUrl, mainBgUrl, adminNotes, updateLoginIconUrl, updateLoginBgUrl, updateMainBgUrl, updateAdminNotes, withdrawalsEnabled, setWithdrawalsEnabled: updateWithdrawalStatus }}>
      {children}
    </UserContext.Provider>
  );
};

export const UserProvider = ({ children }: { children: ReactNode }) => (
    <Suspense>
        <UserProviderContent>{children}</UserProviderContent>
    </Suspense>
);

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

    
    