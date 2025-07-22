
'use client';

import React, { useState, useEffect } from 'react';
import { useUser, Task } from '@/contexts/user-context';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, Gift, Twitter, Send, Tv, PlusCircle, Tag, Trophy, Loader2, ExternalLink } from 'lucide-react';
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

const ONE_TIME_TASKS = ['follow_twitter', 'join_telegram', 'first_stake'];

const TaskCard = ({ task }: { task: Task }) => {
  const { user, claimTaskReward } = useUser();
  const [timeLeft, setTimeLeft] = useState(0);
  const [isClaiming, setIsClaiming] = useState(false);
  const [hasVisitedLink, setHasVisitedLink] = useState(false);

  const lastCompleted = user?.tasksCompleted[task.id];
  const isOneTimeTask = ONE_TIME_TASKS.includes(task.id);
  
  const cooldown = task.id === 'watch_ad' ? 5 * 1000 : 60 * 1000;

  useEffect(() => {
    if (isOneTimeTask || !lastCompleted) {
      setTimeLeft(0);
      return;
    }

    const intervalId = setInterval(() => {
      const now = new Date().getTime();
      const nextAvailableTime = new Date(lastCompleted).getTime() + cooldown;
      const newTimeLeft = Math.max(0, nextAvailableTime - now);
      setTimeLeft(newTimeLeft);
    }, 1000);

    return () => clearInterval(intervalId);
  }, [lastCompleted, cooldown, task.id, isOneTimeTask]);
  
  const handleClaim = async () => {
    setIsClaiming(true);
    const success = await claimTaskReward(task.id, task.reward);
    if (success) {
      toast({ title: "Reward Claimed!", description: `You received ${task.reward.toLocaleString()} Pika Tokens.` });
    } else {
      let description = "Please wait for the timer to finish.";
      if (isOneTimeTask) {
        description = "This task can only be completed once.";
      } else if (task.id === 'first_stake' && user?.stakedBalance === 0) {
        description = "You must stake first to claim this reward.";
      }
      toast({ title: "Cannot Claim Task", description, variant: "destructive" });
    }
    setIsClaiming(false);
  }

  const handleAction = () => {
    if (task.url) {
      window.open(task.url, '_blank');
      setHasVisitedLink(true);
    } else {
      handleClaim();
    }
  }

  const formatTime = (ms: number) => {
    const seconds = Math.floor((ms / 1000) % 60);
    const minutes = Math.floor((ms / 1000 / 60) % 60);
    if (minutes > 0) return `${minutes}m ${seconds}s`;
    return `${seconds}s`;
  }
  
  const isCompletedOnce = !!lastCompleted;
  let isButtonDisabled = isClaiming || (isOneTimeTask && isCompletedOnce) || timeLeft > 0;
  let buttonText = 'Claim Reward';
  
  if (task.url && !hasVisitedLink && !isCompletedOnce) {
    buttonText = 'Go to Link';
    isButtonDisabled = false;
  } else if(task.url && hasVisitedLink && !isCompletedOnce) {
    buttonText = 'Claim Reward';
    isButtonDisabled = isClaiming;
  }
  else if (isClaiming) {
    buttonText = ''; // Loader will be shown
  } else if (isOneTimeTask) {
    if (isCompletedOnce) {
      buttonText = 'Completed';
    }
  } else if (timeLeft > 0) {
    buttonText = `Next in ${formatTime(timeLeft)}`;
  } else if (task.id === 'watch_ad') {
    buttonText = isCompletedOnce ? "Watch Next Ad" : "Watch Ad";
  } else {
    buttonText = isCompletedOnce ? 'Claim Again' : 'Claim Reward';
  }


  return (
    <Card className="shadow-lg hover:shadow-xl transition-shadow bg-card/80 backdrop-blur-sm flex flex-col justify-between">
      <CardHeader className="flex flex-row items-center gap-4">
        <div className="bg-secondary p-3 rounded-full">{getIcon(task.icon)}</div>
        <div>
          <CardTitle>{task.title}</CardTitle>
          <CardDescription>Reward: {task.reward.toLocaleString()} Pika Tokens</CardDescription>
        </div>
      </CardHeader>
      <CardFooter>
        <div className="w-full flex gap-2">
            <Button
              className="w-full"
              onClick={handleAction}
              disabled={isButtonDisabled && !(task.url && !hasVisitedLink && !isCompletedOnce)}
            >
              {isClaiming && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isOneTimeTask && isCompletedOnce && <Check className="mr-2 h-4 w-4" />}
              {task.url && !hasVisitedLink && !isCompletedOnce ? <ExternalLink className="mr-2 h-4 w-4" /> : null}
              {buttonText}
            </Button>
            {task.url && hasVisitedLink && !isCompletedOnce && (
                 <Button className="w-full" onClick={handleClaim} disabled={isClaiming || isCompletedOnce}>
                    {isClaiming && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Claim Reward
                 </Button>
            )}
        </div>
      </CardFooter>
    </Card>
  );
}


export default function TasksTab() {
  const { user, tasks, isAdmin, addTask } = useUser();
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
          {tasks.map((task) => (
             <TaskCard key={task.id} task={task} />
          ))}
        </div>
      </div>
    </div>
  );
}
