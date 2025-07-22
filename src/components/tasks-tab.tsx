'use client';

import React from 'react';
import { useUser } from '@/contexts/user-context';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, Gift, Twitter, Send, Tv } from 'lucide-react';
import Image from 'next/image';

const tasks = [
  { id: 'follow_twitter', title: 'Follow us on X (Twitter)', reward: 500, icon: <Twitter className="h-6 w-6 text-sky-500" /> },
  { id: 'join_telegram', title: 'Join our Telegram Channel', reward: 500, icon: <Send className="h-6 w-6 text-blue-500" /> },
  { id: 'first_stake', title: 'Make your first stake', reward: 1000, icon: <Gift className="h-6 w-6 text-primary" /> },
  { id: 'watch_ad', title: 'Watch an Ad', reward: 100, icon: <Tv className="h-6 w-6 text-green-500" /> },
];

export default function TasksTab() {
  const { user, claimTaskReward } = useUser();

  return (
    <div className="relative w-full max-w-4xl mx-auto mt-6">
      <Image
          src="https://placehold.co/1200x800.png"
          alt="Tasks background"
          layout="fill"
          objectFit="cover"
          className="absolute inset-0 z-0 opacity-20 rounded-lg"
          data-ai-hint="checklist reward"
        />
      <div className="relative z-10">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold font-headline">Complete Tasks, Earn Rewards</h2>
          <p className="text-muted-foreground">Get extra Pika Tokens by completing these simple tasks.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tasks.map((task) => {
            const isCompleted = user?.tasksCompleted[task.id] || (task.id === 'first_stake' && (user?.stakedBalance || 0) > 0);

            return (
              <Card key={task.id} className="shadow-lg hover:shadow-xl transition-shadow bg-card/80 backdrop-blur-sm">
                <CardHeader className="flex flex-row items-center gap-4">
                  <div className="bg-secondary p-3 rounded-full">{task.icon}</div>
                  <div>
                    <CardTitle>{task.title}</CardTitle>
                    <CardDescription>Reward: {task.reward.toLocaleString()} Pika Tokens</CardDescription>
                  </div>
                </CardHeader>
                <CardFooter>
                  <Button
                    className="w-full"
                    onClick={() => claimTaskReward(task.id, task.reward)}
                    disabled={isCompleted}
                  >
                    {isCompleted ? (
                      <>
                        <Check className="mr-2 h-4 w-4" />
                        Completed
                      </>
                    ) : (
                      'Claim Reward'
                    )}
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
