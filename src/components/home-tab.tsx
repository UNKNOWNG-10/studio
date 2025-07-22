'use client';

import React, { useState, useEffect } from 'react';
import { useUser } from '@/contexts/user-context';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import Image from 'next/image';

export default function HomeTab() {
  const { user, stakeTokens, withdrawTokens } = useUser();
  const [currentStaked, setCurrentStaked] = useState(user?.stakedBalance || 0);
  
  const [stakeOrderId, setStakeOrderId] = useState('');
  const [isStaking, setIsStaking] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [isStakeDialogOpen, setStakeDialogOpen] = useState(false);
  const [isWithdrawDialogOpen, setWithdrawDialogOpen] = useState(false);

  useEffect(() => {
    if (user && user.stakedBalance > 0) {
      const interval = setInterval(() => {
        setCurrentStaked(prev => prev + (user.stakedBalance * 0.03) / (24 * 60 * 60)); // 3% daily yield per second
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [user]);
  
  useEffect(() => {
    if(user) {
        setCurrentStaked(user.stakedBalance);
    }
  }, [user?.stakedBalance])

  const handleStake = async () => {
    if (!stakeOrderId) {
      toast({ title: 'Error', description: 'Please enter an order ID.', variant: 'destructive' });
      return;
    }
    if (user && user.tokenBalance < 1000) {
      toast({ title: 'Error', description: 'You need at least 1000 Pika Tokens to stake.', variant: 'destructive' });
      return;
    }
    setIsStaking(true);
    const success = await stakeTokens(stakeOrderId);
    if (success) {
      toast({ title: 'Success', description: 'Your stake is approved and 1000 Pika Tokens have been staked.' });
      setStakeOrderId('');
      setStakeDialogOpen(false);
    } else {
      toast({ title: 'Error', description: 'Staking failed. You may have already staked or have insufficient balance.', variant: 'destructive' });
    }
    setIsStaking(false);
  };

  const handleWithdraw = () => {
    const amount = parseFloat(withdrawAmount);
    if (isNaN(amount) || amount <= 0) {
      toast({ title: "Error", description: "Please enter a valid amount.", variant: "destructive" });
      return;
    }
    const success = withdrawTokens(amount);
    if(success) {
      toast({ title: "Success", description: `${amount.toLocaleString()} Pika Tokens withdrawn successfully.` });
      setWithdrawAmount('');
      setWithdrawDialogOpen(false);
    } else {
      toast({ title: "Error", description: "Insufficient Pika Token balance.", variant: "destructive" });
    }
  };

  const dailyEarning = (user?.stakedBalance || 0) * 0.03;
  const tokenToUsdtRate = 0.001;

  return (
    <div className="relative w-full max-w-3xl mx-auto mt-6 space-y-8">
       <Image
          src="https://placehold.co/1200x800.png"
          alt="Home background"
          layout="fill"
          objectFit="cover"
          className="absolute inset-0 z-0 opacity-20 rounded-lg"
          data-ai-hint="financial growth"
        />
      <div className="relative z-10 space-y-8">
        <Card className="shadow-lg bg-card/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-2xl font-headline">Staking Dashboard</CardTitle>
            <CardDescription>Stake your Pika Tokens to earn daily rewards.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-6">
            <div className="relative w-48 h-48 sm:w-64 sm:h-64 flex items-center justify-center">
              <svg className="absolute w-full h-full" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="45" stroke="hsl(var(--border))" strokeWidth="10" fill="none" />
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  stroke="hsl(var(--primary))"
                  strokeWidth="10"
                  fill="none"
                  strokeDasharray="283"
                  strokeDashoffset={user?.stakedBalance ? 0 : 283}
                  transform="rotate(-90 50 50)"
                  className="transition-all duration-1000"
                />
              </svg>
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Staked Balance</p>
                <p className="text-3xl sm:text-4xl font-bold text-primary">
                  {Math.floor(currentStaked).toLocaleString()}
                </p>
                <p className="text-xs text-green-500 font-semibold">
                  Daily Earning: {dailyEarning.toLocaleString(undefined, { maximumFractionDigits: 2 })} (3%)
                </p>
              </div>
            </div>
          </CardContent>
          <CardFooter className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Dialog open={isStakeDialogOpen} onOpenChange={setStakeDialogOpen}>
              <DialogTrigger asChild>
                <Button className="w-full" size="lg" disabled={user?.hasStaked}>
                  {user?.hasStaked ? 'Already Staked' : 'Stake Pika Tokens'}
                  </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Stake 1000 Pika Tokens</DialogTitle>
                  <DialogDescription>
                    To stake, please send 0.05 USDT to the Binance ID below and enter your order ID to confirm your one-time stake of 1000 Pika Tokens.
                  </DialogDescription>
                </DialogHeader>
                <div className="py-4 space-y-4">
                    <p className="font-semibold">Binance ID: <span className="font-mono text-primary bg-secondary px-2 py-1 rounded">522150826</span></p>
                    <div className="bg-muted p-4 rounded-lg text-center">
                        <p className="text-sm text-muted-foreground">Staking Amount</p>
                        <p className="text-2xl font-bold">1,000 Pika Tokens</p>
                    </div>
                    <div>
                        <Label htmlFor="orderId">Order ID</Label>
                        <Input id="orderId" value={stakeOrderId} onChange={e => setStakeOrderId(e.target.value)} placeholder="Enter your transaction order ID" />
                    </div>
                </div>
                <DialogFooter>
                    <Button onClick={handleStake} disabled={isStaking}>
                        {isStaking && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Wait for Approval
                    </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            
            <Dialog open={isWithdrawDialogOpen} onOpenChange={setWithdrawDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="w-full" size="lg">Test Withdraw</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Test Withdraw</DialogTitle>
                  <DialogDescription>
                    Convert your Pika Tokens to USDT. Rate: 1000 Pika Tokens = 1 USDT.
                  </DialogDescription>
                </DialogHeader>
                <div className="py-4 space-y-4">
                    <div>
                        <Label htmlFor="withdrawAmount">Pika Token Amount to Withdraw</Label>
                        <Input id="withdrawAmount" type="number" value={withdrawAmount} onChange={e => setWithdrawAmount(e.target.value)} placeholder="e.g., 1000" />
                    </div>
                    {withdrawAmount && <p className="font-semibold text-center text-lg">You will receive: <span className="text-primary">{(parseFloat(withdrawAmount) * tokenToUsdtRate).toFixed(2)} USDT</span></p>}
                </div>
                <DialogFooter>
                    <Button onClick={handleWithdraw}>Confirm Withdraw</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </CardFooter>
        </Card>

        <Card className="shadow-lg bg-card/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Transaction History</CardTitle>
            <CardDescription>A record of your recent staking and withdrawal activities.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="text-right">Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {user?.transactions?.length ? user.transactions.slice(0, 10).map((tx) => (
                  <TableRow key={tx.id}>
                    <TableCell>
                      <Badge variant={
                        tx.type === 'stake' ? 'default' : 
                        tx.type === 'withdraw' ? 'secondary' :
                        tx.type === 'task' ? 'outline' :
                        'default'
                      } className="capitalize">{tx.type.replace('_', ' ')}</Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{tx.description}</TableCell>
                    <TableCell className={`text-right font-semibold ${tx.type === 'withdraw' ? 'text-destructive' : 'text-green-600'}`}>
                      {tx.type === 'withdraw' ? '-' : '+'}
                      {tx.amount.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground">{format(new Date(tx.date), "MMM d, yyyy")}</TableCell>
                  </TableRow>
                )) : (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center">No transactions yet.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
