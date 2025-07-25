
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/contexts/user-context';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Home, Trophy, Users, CheckCircle, Wallet, LogOut, Settings, Image as ImageIcon, Wallpaper, DollarSign } from 'lucide-react';
import HomeTab from '@/components/home-tab';
import LeaderboardTab from '@/components/leaderboard-tab';
import FriendsTab from '@/components/friends-tab';
import TasksTab from '@/components/tasks-tab';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { Switch } from '@/components/ui/switch';

function AdminSettings() {
  const { 
    loginIconUrl, 
    loginBgUrl, 
    mainBgUrl, 
    updateLoginIconUrl, 
    updateLoginBgUrl, 
    updateMainBgUrl,
    withdrawalsEnabled,
    setWithdrawalsEnabled
  } = useUser();
  const [iconUrl, setIconUrl] = useState('');
  const [loginBg, setLoginBg] = useState('');
  const [mainBg, setMainBg] = useState('');
  const [withdrawEnabled, setWithdrawEnabled] = useState(false);


  useEffect(() => {
    setIconUrl(loginIconUrl);
    setLoginBg(loginBgUrl);
    setMainBg(mainBgUrl);
    setWithdrawEnabled(withdrawalsEnabled);
  }, [loginIconUrl, loginBgUrl, mainBgUrl, withdrawalsEnabled]);

  const handleIconSave = () => {
    updateLoginIconUrl(iconUrl);
    toast({ title: 'Icon URL updated!' });
  };
  
  const handleLoginBgSave = () => {
    updateLoginBgUrl(loginBg);
    toast({ title: 'Login Background URL updated!' });
  };
  
  const handleMainBgSave = () => {
    updateMainBgUrl(mainBg);
    toast({ title: 'Dashboard Background URL updated!' });
  };

  const handleWithdrawalToggle = (enabled: boolean) => {
    setWithdrawalsEnabled(enabled);
    setWithdrawEnabled(enabled);
    toast({ title: `Withdrawals ${enabled ? 'Enabled' : 'Disabled'}` });
  };

  return (
    <Card className="mt-8">
      <CardHeader>
        <CardTitle className="flex items-center"><Settings className="mr-2" /> Admin Settings</CardTitle>
        <CardDescription>Customize the appearance and functionality of the application.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="iconUrl" className="flex items-center"><ImageIcon className="mr-2 h-4 w-4" /> Login Page Icon URL</Label>
          <div className="flex items-center gap-2">
            <Input id="iconUrl" value={iconUrl} onChange={(e) => setIconUrl(e.target.value)} placeholder="https://example.com/icon.png" />
            <Button onClick={handleIconSave}>Save</Button>
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="loginBgUrl" className="flex items-center"><Wallpaper className="mr-2 h-4 w-4" /> Login Page Background URL</Label>
           <div className="flex items-center gap-2">
            <Input id="loginBgUrl" value={loginBg} onChange={(e) => setLoginBg(e.target.value)} placeholder="https://example.com/background.jpg" />
            <Button onClick={handleLoginBgSave}>Save</Button>
          </div>
        </div>
         <div className="space-y-2">
          <Label htmlFor="mainBgUrl" className="flex items-center"><Wallpaper className="mr-2 h-4 w-4" /> Dashboard Background URL</Label>
           <div className="flex items-center gap-2">
            <Input id="mainBgUrl" value={mainBg} onChange={(e) => setMainBg(e.target.value)} placeholder="https://example.com/dashboard-bg.jpg" />
            <Button onClick={handleMainBgSave}>Save</Button>
          </div>
        </div>
        <div className="space-y-2">
          <Label className="flex items-center"><DollarSign className="mr-2 h-4 w-4" /> Withdrawal Status</Label>
           <div className="flex items-center justify-between rounded-lg border p-3">
              <p className="text-sm text-muted-foreground">
                  {withdrawEnabled ? 'Withdrawals are currently enabled for users.' : 'Withdrawals are currently disabled.'}
              </p>
              <Switch
                checked={withdrawEnabled}
                onCheckedChange={handleWithdrawalToggle}
              />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default function DashboardPage() {
  const { user, loading, logout, mainBgUrl } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background p-4">
        <div className="w-full max-w-md space-y-4">
          <Skeleton className="h-12 w-1/3" />
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen bg-background text-foreground flex flex-col bg-cover bg-center bg-fixed"
      style={{ backgroundImage: mainBgUrl ? `url(${mainBgUrl})` : 'none' }}
    >
      <div className="min-h-screen flex flex-col bg-background/80 backdrop-blur-sm">
       <header className="container mx-auto flex items-center justify-between p-4 border-b border-white/20">
        <h1 className="text-2xl font-bold text-primary font-headline">Pika Token</h1>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 rounded-full bg-secondary px-4 py-2">
            <Wallet className="h-5 w-5 text-primary" />
            <span className="font-semibold text-lg text-foreground">{Math.floor(user.tokenBalance).toLocaleString()}</span>
            <span className="text-sm text-muted-foreground">Pika Tokens</span>
          </div>
          <Button variant="ghost" size="icon" onClick={() => {
            logout();
            router.push('/login');
          }}>
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </header>
      <main className="container mx-auto p-4 flex-grow">
        <Tabs defaultValue="home" className="w-full">
          <TabsList className="grid w-full grid-cols-4 md:w-[600px] mx-auto">
            <TabsTrigger value="home"><Home className="mr-2 h-4 w-4" />Home</TabsTrigger>
            <TabsTrigger value="leaderboard"><Trophy className="mr-2 h-4 w-4" />Leaderboard</TabsTrigger>
            <TabsTrigger value="friends"><Users className="mr-2 h-4 w-4" />Friends</TabsTrigger>
            <TabsTrigger value="tasks"><CheckCircle className="mr-2 h-4 w-4" />Tasks</TabsTrigger>
          </TabsList>
          <TabsContent value="home">
            <HomeTab />
          </TabsContent>
          <TabsContent value="leaderboard">
            <LeaderboardTab />
          </TabsContent>
          <TabsContent value="friends">
            <FriendsTab />
          </TabsContent>
          <TabsContent value="tasks">
            <TasksTab />
          </TabsContent>
        </Tabs>
        {user.isAdmin && <AdminSettings />}
      </main>
      <footer className="w-full bg-slate-900/80 text-white mt-8 py-6">
        <div className="container mx-auto px-4">
           <div className="mt-8 pt-6 border-t border-slate-700 flex flex-col md:flex-row justify-between items-center text-sm">
            <div className="flex gap-4 mb-4 md:mb-0">
              <Link href="/privacy-policy" className="hover:text-primary transition-colors">Privacy Policy</Link>
              <Link href="/terms-of-service" className="hover:text-primary transition-colors">Terms of Service</Link>
              <Link href="/about-us" className="hover:text-primary transition-colors">About Us</Link>
              <Link href="/contact" className="hover:text-primary transition-colors">Contact</Link>
            </div>
            <p className="text-slate-400">&copy; {new Date().getFullYear()} Pika Token. All rights reserved.</p>
          </div>
        </div>
      </footer>
      </div>
    </div>
  );
}
