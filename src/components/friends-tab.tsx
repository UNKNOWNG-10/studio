
'use client';

import React from 'react';
import { useUser } from '@/contexts/user-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Copy, Users } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import Image from 'next/image';

export default function FriendsTab() {
  const { user } = useUser();
  const referralLink = user ? `https://pika-token.web.app/login?ref=${user.uid}` : '';

  const copyToClipboard = () => {
    navigator.clipboard.writeText(referralLink);
    toast({
      title: 'Copied to clipboard!',
      description: 'Your referral link is ready to be shared.',
    });
  };

  const referralsCount = user?.referrals?.length || 0;
  const totalBonus = referralsCount * 100;

  return (
    <div className="relative w-full max-w-2xl mx-auto mt-6 space-y-6">
      <Image
          src="https://placehold.co/1200x800.png"
          alt="Friends background"
          layout="fill"
          objectFit="cover"
          className="absolute inset-0 z-0 opacity-20 rounded-lg"
          data-ai-hint="social connection"
        />
      <div className="relative z-10">
        <Card className="shadow-lg bg-card/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-2xl font-headline">Invite Your Friends</CardTitle>
            <CardDescription>
              Share your referral link and earn a <span className="text-primary font-semibold">100 Pika Token bonus</span> for every friend that joins and stakes!
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex w-full items-center space-x-2">
              <Input
                type="text"
                value={referralLink}
                readOnly
                className="flex-grow"
              />
              <Button type="button" size="icon" onClick={copyToClipboard}>
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            <div className="mt-8 text-center">
                <h3 className="text-lg font-semibold">How it works</h3>
                <ol className="list-decimal list-inside text-left mt-2 max-w-md mx-auto text-muted-foreground space-y-1">
                    <li>Share your unique link with friends.</li>
                    <li>Your friend signs up using your link.</li>
                    <li>When their first stake is approved, you receive 100 Pika Tokens as a bonus!</li>
                </ol>
            </div>
          </CardContent>
        </Card>
      </div>

       <div className="relative z-10">
        <Card className="shadow-lg bg-card/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-2xl font-headline">Your Referrals</CardTitle>
            <CardDescription>
              Track your referral success and earnings.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-around text-center">
            <div>
              <p className="text-4xl font-bold text-primary">{referralsCount}</p>
              <p className="text-muted-foreground">Successful Referrals</p>
            </div>
             <div>
              <p className="text-4xl font-bold text-primary">{totalBonus.toLocaleString()}</p>
              <p className="text-muted-foreground">Total Bonus Earned</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
