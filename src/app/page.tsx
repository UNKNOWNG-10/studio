'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/contexts/user-context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Home, Trophy, Users, CheckCircle, Wallet, LogOut } from 'lucide-react';
import HomeTab from '@/components/home-tab';
import LeaderboardTab from '@/components/leaderboard-tab';
import FriendsTab from '@/components/friends-tab';
import TasksTab from '@/components/tasks-tab';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

export default function DashboardPage() {
  const { user, loading, logout } = useUser();
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
    <div className="min-h-screen bg-background text-foreground">
      <header className="container mx-auto flex items-center justify-between p-4 border-b">
        <h1 className="text-2xl font-bold text-primary font-headline">Token Tycoon</h1>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 rounded-full bg-secondary px-4 py-2">
            <Wallet className="h-5 w-5 text-primary" />
            <span className="font-semibold text-lg">{Math.floor(user.tokenBalance).toLocaleString()}</span>
            <span className="text-sm text-muted-foreground">Tokens</span>
          </div>
          <Button variant="ghost" size="icon" onClick={() => {
            logout();
            router.push('/login');
          }}>
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </header>
      <main className="container mx-auto p-4">
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
      </main>
      <footer className="text-center p-4 text-muted-foreground text-sm border-t mt-8">
        <p>&copy; {new Date().getFullYear()} Token Tycoon. All rights reserved.</p>
      </footer>
    </div>
  );
}
