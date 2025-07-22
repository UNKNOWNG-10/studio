'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/contexts/user-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Coins } from 'lucide-react';

export default function LoginPage() {
  const [uid, setUid] = useState('');
  const { login, user, loading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.push('/');
    }
  }, [user, loading, router]);
  
  const handleLogin = () => {
    if (uid.length >= 8) {
      login(uid);
      router.push('/');
    }
  };

  if (loading || user) {
      return <div className="flex h-screen items-center justify-center bg-background"><Coins className="animate-spin h-8 w-8 text-primary"/></div>;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-sm shadow-2xl">
        <CardHeader className="text-center">
          <div className="mx-auto bg-primary text-primary-foreground rounded-full h-16 w-16 flex items-center justify-center mb-4">
             <Coins className="h-8 w-8" />
          </div>
          <CardTitle className="text-3xl font-headline">Token Tycoon</CardTitle>
          <CardDescription>Sign in with your Binance UID to start earning.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={(e) => { e.preventDefault(); handleLogin(); }}>
            <div className="grid w-full items-center gap-4">
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="uid">Binance UID</Label>
                <Input 
                  id="uid" 
                  placeholder="Enter your 8-digit UID" 
                  type="number"
                  value={uid}
                  onChange={(e) => setUid(e.target.value)}
                  minLength={8}
                  required
                />
              </div>
            </div>
          </form>
        </CardContent>
        <CardFooter>
          <Button 
            className="w-full" 
            onClick={handleLogin}
            disabled={uid.length < 8}
          >
            Sign In & Claim 1000 Tokens
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
