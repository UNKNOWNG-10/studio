
'use client';

import React, { useState, useEffect } from 'react';
import { useUser } from '@/contexts/user-context';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { Loader2, Clock, CheckCircle2, XCircle } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import Image from 'next/image';
import { Progress } from '@/components/ui/progress';


const MAX_STAKES = 10;
const EARNING_RATE_PER_STAKE = 180;

export default function HomeTab() {
  const { user, stakeTokens, approveTransaction, rejectTransaction, isAdmin, getAllTransactions, withdrawalsEnabled, withdrawTokens } = useUser();
  
  const [stakeOrderId, setStakeOrderId] = useState('');
  const [isStaking, setIsStaking] = useState(false);
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [isStakeDialogOpen, setStakeDialogOpen] = useState(false);
  const [isWithdrawDialogOpen, setWithdrawDialogOpen] = useState(false);
  const [nextPayoutTime, setNextPayoutTime] = useState('');
  
  const allTransactionsRaw = isAdmin ? getAllTransactions() : user?.transactions || [];
  const allTransactions = isAdmin 
    ? allTransactionsRaw.filter(tx => tx.type === 'stake' || tx.type === 'withdraw' || tx.type === 'task_submission')
    : allTransactionsRaw;

  useEffect(() => {
    if (user && user.stakedBalance > 0) {
      const payoutInterval = setInterval(() => {
        const lastPayout = new Date(user.lastPayoutTime || Date.now());
        const nextPayout = new Date(lastPayout.getTime() + 5 * 60 * 1000);
        const now = new Date();
        const diff = nextPayout.getTime() - now.getTime();

        if (diff <= 0) {
          setNextPayoutTime('Claiming now...');
          return;
        }

        const minutes = Math.floor((diff / 1000 / 60) % 60);
        const seconds = Math.floor((diff / 1000) % 60);

        setNextPayoutTime(`${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
      }, 1000);

      return () => clearInterval(payoutInterval);
    }
  }, [user]);

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
      toast({ title: 'Request Sent', description: 'Your staking request is pending admin approval. 1000 Pika Tokens have been deducted from your balance.' });
      setStakeOrderId('');
      setStakeDialogOpen(false);
    } else {
      toast({ title: 'Error', description: 'Staking request failed. You may have already reached the max stake limit or have insufficient balance.', variant: 'destructive' });
    }
    setIsStaking(false);
  };
  
  const handleWithdraw = async () => {
    const amount = parseFloat(withdrawAmount);
    if (isNaN(amount) || amount <= 0) {
      toast({ title: 'Error', description: 'Please enter a valid amount.', variant: 'destructive' });
      return;
    }
    setIsWithdrawing(true);
    const success = await withdrawTokens(amount);
    if (success) {
        toast({ title: 'Request Sent', description: 'Your withdrawal request is pending admin approval.' });
        setWithdrawAmount('');
        setWithdrawDialogOpen(false);
    } else {
        toast({ title: 'Error', description: 'Withdrawal failed. Check your balance and minimum withdrawal amount.', variant: 'destructive' });
    }
    setIsWithdrawing(false);
  };

  const handleApprove = (txId: string, uid: string) => {
    approveTransaction(txId, uid);
    toast({ title: 'Success', description: 'Transaction approved.'});
  }

  const handleReject = (txId: string, uid: string) => {
    rejectTransaction(txId, uid);
    toast({ title: 'Success', description: 'Transaction rejected.'});
  }

  const hourlyEarning = user ? (EARNING_RATE_PER_STAKE * user.stakeCount * 12) : 0;
  const tokenToUsdtRate = 5 / 10000;

  const getOrderId = (description: string) => {
    const match = description.match(/Order ID: (.*)/);
    return match ? match[1] : null;
  };

  const stakeCount = user?.stakeCount || 0;

  return (
    <div className="w-full max-w-4xl mx-auto mt-6 space-y-8">
      <div className="space-y-8">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-headline">Staking Dashboard</CardTitle>
            <CardDescription>Stake up to 10 times to maximize your hourly rewards.</CardDescription>
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
                  strokeDashoffset={283 - (283 * stakeCount) / MAX_STAKES}
                  transform="rotate(-90 50 50)"
                  className="transition-all duration-1000"
                />
              </svg>
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Staked Balance</p>
                <p className="text-3xl sm:text-4xl font-bold text-foreground">
                  {(user?.stakedBalance || 0).toLocaleString()}
                </p>
                <p className="text-xs text-green-500 font-semibold">
                  Hourly Earning: {hourlyEarning.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                </p>
              </div>
            </div>

            <div className="w-full max-w-sm space-y-2">
                <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Stake Level</span>
                    <span>{stakeCount} / {MAX_STAKES}</span>
                </div>
                <Progress value={(stakeCount / MAX_STAKES) * 100} className="h-2" />
            </div>

             {user?.stakedBalance && user.stakedBalance > 0 && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4 animate-spin" />
                <span>Next payout in: {nextPayoutTime}</span>
              </div>
            )}
          </CardContent>
          <CardFooter className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Dialog open={isStakeDialogOpen} onOpenChange={setStakeDialogOpen}>
              <DialogTrigger asChild>
                <Button className="w-full" size="lg" disabled={user?.stakeCount >= MAX_STAKES}>
                  {user?.stakeCount >= MAX_STAKES ? 'Max Stakes Reached' : 'Stake More Tokens'}
                  </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Stake 1,000 Pika Tokens</DialogTitle>
                  <DialogDescription>
                    To stake, please send 0.05 USDT to the Binance ID below and enter your order ID to confirm your stake. Each stake increases your reward level.
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
                        Request Stake
                    </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            
            <Dialog open={isWithdrawDialogOpen} onOpenChange={setWithdrawDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="w-full" size="lg" disabled={!withdrawalsEnabled}>
                  {withdrawalsEnabled ? 'Withdraw' : 'Withdrawals Disabled'}
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Withdraw Pika Tokens {withdrawalsEnabled ? '' : '(Coming Soon)'}</DialogTitle>
                  <DialogDescription>
                    Convert your Pika Tokens to USDT. Rate: 10,000 Pika Tokens = 5 USDT. Minimum withdrawal is 100,000 tokens. Your withdrawal will be processed after admin approval.
                  </DialogDescription>
                </DialogHeader>
                <div className="py-4 space-y-4">
                    <div>
                        <Label htmlFor="withdrawAmount">Pika Token Amount to Withdraw</Label>
                        <Input id="withdrawAmount" type="number" value={withdrawAmount} onChange={e => setWithdrawAmount(e.target.value)} placeholder="e.g., 100000" />
                    </div>
                    {withdrawAmount && <p className="font-semibold text-center text-lg">You will receive: <span className="text-primary">{(parseFloat(withdrawAmount || '0') * tokenToUsdtRate).toFixed(4)} USDT</span></p>}
                </div>
                <DialogFooter>
                    <Button onClick={handleWithdraw} disabled={isWithdrawing || !withdrawalsEnabled}>
                        {isWithdrawing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Request Withdraw
                    </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </CardFooter>
        </Card>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Transaction History</CardTitle>
            <CardDescription>{isAdmin ? 'All user stake and task approval requests' : 'A record of your recent staking and withdrawal activities.'}</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  {isAdmin && <TableHead>User ID</TableHead>}
                  <TableHead>Type</TableHead>
                  <TableHead>Description</TableHead>
                  {isAdmin && <TableHead>Order ID</TableHead>}
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="text-right">Date</TableHead>
                  {isAdmin && <TableHead className="text-right">Actions</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {allTransactions?.length > 0 ? allTransactions.slice(0, 20).map((tx: any) => {
                  const orderId = tx.type === 'stake' ? getOrderId(tx.description) : null;
                  return (
                  <TableRow key={tx.id}>
                    {isAdmin && <TableCell className="font-mono text-xs">{tx.uid}</TableCell>}
                    <TableCell>
                      <Badge variant={
                        tx.type === 'stake' ? 'default' : 
                        tx.type === 'withdraw' ? 'secondary' :
                        tx.type === 'task' || tx.type === 'earning' || tx.type === 'referral_bonus' || tx.type === 'login_bonus' || tx.type === 'referral_milestone' || tx.type === 'task_submission' ? 'outline' :
                        'default'
                      } className="capitalize">{tx.type.replace('_', ' ')}</Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground max-w-[200px] truncate">{tx.description}</TableCell>
                    {isAdmin && <TableCell className="font-mono text-xs">{orderId}</TableCell>}
                    <TableCell>
                      <Badge variant={
                        tx.status === 'approved' || tx.status === 'completed' ? 'default' : 
                        tx.status === 'pending' ? 'secondary' :
                        'destructive'
                      } className="capitalize bg-opacity-70">{tx.status}</Badge>
                    </TableCell>
                    <TableCell className={`text-right font-semibold ${tx.amount > 0 && (tx.type === 'stake' || tx.type === 'withdraw' || tx.type === 'task_submission') ? 'text-destructive' : 'text-green-600'}`}>
                      {tx.type === 'stake' || tx.type === 'withdraw' ? '-' : '+'}
                      {tx.amount.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground">{format(new Date(tx.date), "MMM d, yyyy")}</TableCell>
                     {isAdmin && (
                        <TableCell className="text-right">
                            {tx.status === 'pending' && (
                                <div className="flex gap-2 justify-end">
                                    <Button size="sm" onClick={() => handleApprove(tx.id, tx.uid)} variant="outline">
                                        <CheckCircle2 className="mr-2 h-4 w-4" /> Approve
                                    </Button>
                                    <Button size="sm" onClick={() => handleReject(tx.id, tx.uid)} variant="destructive">
                                        <XCircle className="mr-2 h-4 w-4" /> Reject
                                    </Button>
                                </div>
                            )}
                        </TableCell>
                     )}
                  </TableRow>
                  );
                }) : (
                  <TableRow>
                    <TableCell colSpan={isAdmin ? 8 : 5} className="text-center">No transactions yet.</TableCell>
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

    
    