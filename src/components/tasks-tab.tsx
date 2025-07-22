'use client';

import React from 'react';
import { useUser } from '@/contexts/user-context';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, Gift, Twitter, Send } from 'lucide-react';

const tasks = [
  { id: 'follow_twitter', title: 'Follow us on X (Twitter)', reward: 500, icon: <Twitter className="h-6 w-6 text-sky-500" /> },
  { id: 'join_telegram', title: 'Join our Telegram Channel', reward: 500, icon: <Send className="h-6 w-6 text-blue-500" /> },
  { id: 'first_stake', title: 'Make your first stake', reward: 1000, icon: <Gift className="h-6 w-6 text-primary" /> },
];

export default function TasksTab() {
  const { user, claimTaskReward } = useUser();

  return (
    <div className="w-full max-w-4xl mx-auto mt-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold font-headline">Complete Tasks, Earn Rewards</h2>
        <p className="text-muted-foreground">Get extra tokens by completing these simple tasks.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tasks.map((task) => {
          const isCompleted = user?.tasksCompleted[task.id] || (task.id === 'first_stake' && (user?.stakedBalance || 0) > 0);

          return (
            <Card key={task.id} className="shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader className="flex flex-row items-center gap-4">
                <div className="bg-secondary p-3 rounded-full">{task.icon}</div>
                <div>
                  <CardTitle>{task.title}</CardTitle>
                  <CardDescription>Reward: {task.reward.toLocaleString()} Tokens</CardDescription>
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
  );
}
