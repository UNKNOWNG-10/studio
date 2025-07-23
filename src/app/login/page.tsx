
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
  const searchParams = useSearchParams();
  const referrerId = searchParams.get('ref');

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
    <div className="relative min-h-screen w-full flex items-center justify-center p-4">
      <Image
        src="https://placehold.co/1920x1080.png"
        alt="Pikachu background"
        layout="fill"
        objectFit="cover"
        className="absolute inset-0 z-0"
        data-ai-hint="pikachu thunder"
      />
       <div className="absolute inset-0 bg-black/30 backdrop-blur-sm"></div>

      <div className="relative z-10 w-full max-w-md">
        <Card className="w-full shadow-2xl bg-card/80">
          <CardHeader className="text-center">
            <div className="mx-auto rounded-full h-24 w-24 flex items-center justify-center mb-4 overflow-hidden bg-yellow-300 border-4 border-yellow-400">
               <Image 
                  src="https://placehold.co/256x256.png"
                  width={100}
                  height={100}
                  alt="Pika Token"
                  className="object-contain"
                  data-ai-hint="cute token mascot"
               />
            </div>
            <CardTitle className="text-3xl font-headline">Pika Token</CardTitle>
            <CardDescription>Sign in with your Binance UID to start earning.</CardDescription>
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
