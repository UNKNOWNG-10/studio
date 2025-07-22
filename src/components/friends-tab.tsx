'use client';

import React from 'react';
import { useUser } from '@/contexts/user-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Copy } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import Image from 'next/image';

export default function FriendsTab() {
  const { user } = useUser();
  const referralLink = user ? `https://tokentycoon.app/join?ref=${user.uid}` : '';

  const copyToClipboard = () => {
    navigator.clipboard.writeText(referralLink);
    toast({
      title: 'Copied to clipboard!',
      description: 'Your referral link is ready to be shared.',
    });
  };

  return (
    <div className="relative w-full max-w-2xl mx-auto mt-6">
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
              Share your referral link and earn a <span className="text-primary font-semibold">30% Pika Token bonus</span> for every friend that joins and stakes!
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
                    <li>When they make their first stake, you receive 30% of their staked Pika Token amount as a bonus!</li>
                </ol>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
