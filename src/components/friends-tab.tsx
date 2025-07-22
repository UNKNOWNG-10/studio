
'use client';

import React, { useState } from 'react';
import { useUser, ReferralMilestone } from '@/contexts/user-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Copy, Users, Gift, Check, Loader2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import Image from 'next/image';
import { Progress } from '@/components/ui/progress';

const MilestoneCard = ({ milestone }: { milestone: ReferralMilestone }) => {
  const { user, claimReferralMilestone } = useUser();
  const [isClaiming, setIsClaiming] = useState(false);

  if (!user) return null;

  const referralsCount = user.referrals?.length || 0;
  const isClaimed = (user.claimedReferralMilestones || []).includes(milestone.id);
  const canClaim = referralsCount >= milestone.requiredRefs && !isClaimed;

  const handleClaim = async () => {
    setIsClaiming(true);
    await claimReferralMilestone(milestone.id);
    setIsClaiming(false);
  };
  
  return (
    <Card className="flex flex-col justify-between">
      <CardHeader className="flex-row items-start gap-4 space-y-0">
          <div className="space-y-1">
             <CardTitle>{milestone.title}</CardTitle>
             <CardDescription>Reward: {milestone.reward.toLocaleString()} Tokens</CardDescription>
          </div>
          <div className="p-2 bg-secondary rounded-full ml-auto">
            <Gift className="w-5 h-5 text-primary"/>
          </div>
      </CardHeader>
      <CardContent>
          <div className="space-y-2">
            <Progress value={(referralsCount / milestone.requiredRefs) * 100} className="h-2" />
            <p className="text-sm text-muted-foreground">{Math.min(referralsCount, milestone.requiredRefs)} / {milestone.requiredRefs} referrals</p>
          </div>
      </CardContent>
      <CardFooter>
        <Button className="w-full" disabled={!canClaim || isClaiming} onClick={handleClaim}>
          {isClaiming && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isClaimed ? <><Check className="mr-2 h-4 w-4"/> Claimed</> : 'Claim Reward'}
        </Button>
      </CardFooter>
    </Card>
  )
}

export default function FriendsTab() {
  const { user, referralMilestones } = useUser();
  const referralLink = user ? `https://pika-token.web.app/login?ref=${user.uid}` : '';

  const copyToClipboard = () => {
    navigator.clipboard.writeText(referralLink);
    toast({
      title: 'Copied to clipboard!',
      description: 'Your referral link is ready to be shared.',
    });
  };

  const referralsCount = user?.referrals?.length || 0;
  const totalBonus = referralsCount * 300;

  return (
    <div className="relative w-full max-w-4xl mx-auto mt-6 space-y-8">
      <Image
          src="https://placehold.co/1200x800.png"
          alt="Friends background"
          layout="fill"
          objectFit="cover"
          className="absolute inset-0 z-0 opacity-20 rounded-lg"
          data-ai-hint="social connection"
        />
      <div className="relative z-10 space-y-8">
        <Card className="shadow-lg bg-card/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-2xl font-headline">Invite Your Friends</CardTitle>
            <CardDescription>
              Share your referral link and earn a <span className="text-primary font-semibold">300 Pika Token bonus</span> for every friend that joins and stakes!
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
          </CardContent>
        </Card>

        <Card className="shadow-lg bg-card/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-2xl font-headline">Your Referral Stats</CardTitle>
             <CardDescription>
              Track your referral success and direct earnings. Milestone rewards below.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-around text-center">
            <div>
              <p className="text-4xl font-bold text-primary">{referralsCount}</p>
              <p className="text-muted-foreground">Successful Referrals</p>
            </div>
             <div>
              <p className="text-4xl font-bold text-primary">{totalBonus.toLocaleString()}</p>
              <p className="text-muted-foreground">Direct Bonus Earned</p>
            </div>
          </CardContent>
        </Card>

        <div>
            <h2 className="text-2xl font-bold text-center mb-4 font-headline">Referral Milestone Rewards</h2>
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {referralMilestones.map(milestone => (
                    <MilestoneCard key={milestone.id} milestone={milestone} />
                ))}
             </div>
        </div>
      </div>
    </div>
  );
}
