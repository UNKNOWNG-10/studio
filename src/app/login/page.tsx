
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useUser } from '@/contexts/user-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Coins } from 'lucide-react';
import Image from 'next/image';

export default function LoginPage() {
  const [uid, setUid] = useState('');
  const { login, user, loading } = useUser();
  const router = useRouter();
  const [isNewUser, setIsNewUser] = useState(false);
  const searchParams = useSearchParams();
  const referrerId = searchParams.get('ref');

  useEffect(() => {
    if (typeof window !== 'undefined') {
        const storedDeviceUid = localStorage.getItem('pikaTokenDeviceUser');
        setIsNewUser(!storedDeviceUid);
    }
  }, []);

  useEffect(() => {
    if (!loading && user) {
      router.push('/');
    }
  }, [user, loading, router]);
  
  const handleLogin = () => {
    if (uid) {
      login(uid);
    }
  };

  if (loading || user) {
      return <div className="flex h-screen items-center justify-center bg-background"><Coins className="animate-spin h-8 w-8 text-primary"/></div>;
  }

  return (
    <div className="relative min-h-screen w-full grid grid-cols-1 md:grid-cols-2">
      <div className="relative hidden md:block">
        <Image
          src="https://placehold.co/1200x1800.png"
          alt="Login background"
          layout="fill"
          objectFit="cover"
          className="absolute inset-0 z-0"
          data-ai-hint="cute token mascot"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
        <div className="relative z-10 flex flex-col justify-end h-full p-12 text-white">
            <h2 className="text-4xl font-bold font-headline">Join the Pika Token Revolution</h2>
            <p className="text-lg mt-4">Start your journey in the most exciting token community today. Stake, earn, and climb the leaderboard!</p>
        </div>
      </div>
      <div className="flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-sm shadow-2xl">
          <CardHeader className="text-center">
            <div className="mx-auto rounded-full h-24 w-24 flex items-center justify-center mb-4 overflow-hidden">
               <Image 
                  src="https://placehold.co/256x256.png"
                  width={100}
                  height={100}
                  alt="Pika Token"
                  className="object-cover"
                  data-ai-hint="cute creature"
               />
            </div>
            <CardTitle className="text-3xl font-headline">Pika Token</CardTitle>
            <CardDescription>{isNewUser ? "Sign in with your Binance UID to start earning." : "Welcome back! Please sign in." }</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={(e) => { e.preventDefault(); handleLogin(); }}>
              <div className="grid w-full items-center gap-4">
                <div className="flex flex-col space-y-1.5">
                  <Label htmlFor="uid">Binance UID</Label>
                  <Input 
                    id="uid" 
                    placeholder="Enter your UID" 
                    type="text"
                    value={uid}
                    onChange={(e) => setUid(e.target.value)}
                    required
                  />
                </div>
              </div>
            </form>
          </CardContent>
          <CardFooter className="flex-col">
            <Button 
              className="w-full" 
              onClick={handleLogin}
              disabled={!uid}
            >
              Sign In
            </Button>
            {referrerId && (
                <p className="text-sm text-muted-foreground mt-4">
                    Invited by: {referrerId}
                </p>
            )}
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
