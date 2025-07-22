'use client';

import React, { useState } from 'react';
import { useUser } from '@/contexts/user-context';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, Gift, Twitter, Send, Tv, PlusCircle, Tag, Trophy } from 'lucide-react';
import Image from 'next/image';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';

const iconMap: { [key: string]: React.ReactNode } = {
  Twitter: <Twitter className="h-6 w-6 text-sky-500" />,
  Send: <Send className="h-6 w-6 text-blue-500" />,
  Gift: <Gift className="h-6 w-6 text-primary" />,
  Tv: <Tv className="h-6 w-6 text-green-500" />,
  Tag: <Tag className="h-6 w-6 text-gray-500" />,
  Trophy: <Trophy className="h-6 w-6 text-yellow-500" />,
};

const getIcon = (iconName?: string) => {
    if (iconName && iconMap[iconName]) {
        return iconMap[iconName];
    }
    return <Tag className="h-6 w-6 text-gray-500" />;
}

export default function TasksTab() {
  const { user, tasks, claimTaskReward, isAdmin, addTask } = useUser();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskReward, setNewTaskReward] = useState('');

  const handleAddTask = () => {
    const reward = parseInt(newTaskReward, 10);
    if (!newTaskTitle || isNaN(reward) || reward <= 0) {
      toast({
        title: 'Invalid Input',
        description: 'Please provide a valid title and a positive reward amount.',
        variant: 'destructive',
      });
      return;
    }
    addTask({ title: newTaskTitle, reward });
    toast({
      title: 'Task Added',
      description: `Successfully added task: ${newTaskTitle}`,
    });
    setNewTaskTitle('');
    setNewTaskReward('');
    setIsDialogOpen(false);
  };

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
        
        {isAdmin && (
          <div className="text-center mb-6">
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Add New Task
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create a New Task</DialogTitle>
                  <DialogDescription>
                    Add a new task that will be available for all users to complete.
                  </DialogDescription>
                </DialogHeader>
                <div className="py-4 space-y-4">
                  <div>
                    <Label htmlFor="taskTitle">Task Title</Label>
                    <Input 
                      id="taskTitle" 
                      value={newTaskTitle} 
                      onChange={(e) => setNewTaskTitle(e.target.value)} 
                      placeholder="e.g., Like our latest post"
                    />
                  </div>
                  <div>
                    <Label htmlFor="taskReward">Pika Token Reward</Label>
                    <Input 
                      id="taskReward" 
                      type="number" 
                      value={newTaskReward} 
                      onChange={(e) => setNewTaskReward(e.target.value)} 
                      placeholder="e.g., 250"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={handleAddTask}>Create Task</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tasks.map((task) => {
            const isCompleted = user?.tasksCompleted[task.id] || (task.id === 'first_stake' && (user?.stakedBalance || 0) > 0);

            return (
              <Card key={task.id} className="shadow-lg hover:shadow-xl transition-shadow bg-card/80 backdrop-blur-sm">
                <CardHeader className="flex flex-row items-center gap-4">
                  <div className="bg-secondary p-3 rounded-full">{getIcon(task.icon)}</div>
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
