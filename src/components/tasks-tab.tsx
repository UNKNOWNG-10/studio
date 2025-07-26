
'use client';

import React, { useState, useEffect } from 'react';
import { useUser, Task, User } from '@/contexts/user-context';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, Gift, Twitter, Send, Tv, PlusCircle, Tag, Trophy, Loader2, ExternalLink, Trash2, Edit, Users, BarChart2, Repeat, Eye, MessageSquare, Save, Clock } from 'lucide-react';
import Image from 'next/image';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';


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

const ONE_TIME_TASKS = ['first_stake', 'submit_tweet'];

const TaskCard = ({ task }: { task: Task }) => {
  const { user, claimTaskReward, isAdmin, deleteTask, editTask } = useUser();
  const [timeLeft, setTimeLeft] = useState(0);
  const [isClaiming, setIsClaiming] = useState(false);
  const [submission, setSubmission] = useState('');
  const [isSubmitDialogOpen, setIsSubmitDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAdDialogOpen, setIsAdDialogOpen] = useState(false);

  // Edit states
  const [editedTitle, setEditedTitle] = useState(task.title);
  const [editedReward, setEditedReward] = useState(task.reward.toString());
  const [editedUrl, setEditedUrl] = useState(task.url || '');
  const [editedHtml, setEditedHtml] = useState(task.htmlContent || '');
  const [editedCooldown, setEditedCooldown] = useState((task.cooldown || 0).toString());

  const [hasVisitedLink, setHasVisitedLink] = useState(() => {
    if (typeof window !== 'undefined' && task.url) {
      return localStorage.getItem(`visited_${task.id}`) === 'true';
    }
    return false;
  });

  if (!user) return null;

  const lastCompleted = user.tasksCompleted[task.id];
  const pendingTransaction = user.transactions.find(
    (tx) => tx.taskId === task.id && tx.status === 'pending'
  );

  const isOneTimeTask = ONE_TIME_TASKS.includes(task.id) || task.cooldown === 0;
  
  const cooldownMs = (task.cooldown || 60) * 1000;

  useEffect(() => {
    if (isOneTimeTask || !lastCompleted || task.requiresApproval) {
      setTimeLeft(0);
      return;
    }

    const intervalId = setInterval(() => {
      const now = new Date().getTime();
      const nextAvailableTime = new Date(lastCompleted).getTime() + cooldownMs;
      const newTimeLeft = Math.max(0, nextAvailableTime - now);
      setTimeLeft(newTimeLeft);
    }, 1000);

    return () => clearInterval(intervalId);
  }, [lastCompleted, cooldownMs, task.id, isOneTimeTask, task.requiresApproval]);
  
  const handleClaim = async () => {
    setIsClaiming(true);
    const success = await claimTaskReward(task.id);
    if (success) {
      if (!task.requiresApproval) {
        toast({ title: "Reward Claimed!", description: `You received ${task.reward.toLocaleString()} Pika Tokens.` });
      }
      if (task.htmlContent) {
        setIsAdDialogOpen(false);
      }
    } else {
      let description = "Please wait for the timer to finish.";
      if (isOneTimeTask) {
        description = "This task can only be completed once.";
      } else if (task.id === 'first_stake' && user?.stakedBalance === 0) {
        description = "You must stake first to claim this reward.";
      } else if (task.requiresApproval) {
        description = "This task requires admin approval and can only be done once."
      }
      toast({ title: "Cannot Claim Task", description, variant: "destructive" });
    }
    setIsClaiming(false);
  };

  const handleSubmitForApproval = async () => {
    setIsClaiming(true);
    const success = await claimTaskReward(task.id, submission);
    if (success) {
        setIsSubmitDialogOpen(false);
        setSubmission('');
        toast({ title: 'Task Submitted', description: 'Your submission is pending admin approval.' });

    } else {
       toast({ title: "Submission Failed", description: "You may have already submitted this task.", variant: "destructive" });
    }
    setIsClaiming(false);
  };

  const handleAction = () => {
    if (task.url) {
      window.open(task.url, '_blank');
      if(!hasVisitedLink) {
        localStorage.setItem(`visited_${task.id}`, 'true');
        setHasVisitedLink(true);
      }
    } else if (task.htmlContent) {
      setIsAdDialogOpen(true);
    } else if (task.requiresApproval) {
      setIsSubmitDialogOpen(true);
    } else {
      handleClaim();
    }
  };

  const handleEditSave = () => {
    const reward = parseInt(editedReward, 10);
    const cooldown = parseInt(editedCooldown, 10);

    if (!editedTitle || isNaN(reward) || reward <= 0 || isNaN(cooldown) || cooldown < 0) {
      toast({ title: 'Invalid Input', description: 'Please provide a valid title, a positive reward amount, and a non-negative cooldown.', variant: 'destructive' });
      return;
    }
    const updatedTask: Task = { 
      ...task,
      title: editedTitle,
      reward,
      cooldown,
      url: editedUrl,
      htmlContent: editedHtml,
    };
    editTask(updatedTask);
    toast({ title: 'Task Updated', description: 'Task has been successfully updated.' });
    setIsEditDialogOpen(false);
  };

  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    if (minutes > 0) return `${minutes}m ${seconds}s`;
    return `${seconds}s`;
  };
  
  const isCompletedOnce = !!lastCompleted;
  let isButtonDisabled = isClaiming || (isOneTimeTask && isCompletedOnce) || timeLeft > 0 || (task.requiresApproval && isCompletedOnce);
  let buttonText = 'Claim Reward';
  
  if (pendingTransaction) {
    buttonText = 'Pending Approval';
    isButtonDisabled = true;
  } else if (task.requiresApproval) {
     buttonText = 'Submit for Approval';
     isButtonDisabled = isClaiming || isCompletedOnce;
  } else if (task.htmlContent) {
    buttonText = 'Watch Ad';
    isButtonDisabled = isClaiming || (timeLeft > 0);
  } else if (task.url) {
    buttonText = 'Go to Link';
    isButtonDisabled = false; // Always allow clicking the link
  }
  else if (isClaiming) {
    buttonText = ''; // Loader will be shown
  } else if (isOneTimeTask) {
    if (isCompletedOnce) {
      buttonText = 'Completed';
    }
  } else if (timeLeft > 0) {
    buttonText = `Next in ${formatTime(timeLeft)}`;
  } else {
    buttonText = isCompletedOnce ? 'Claim Again' : 'Claim Reward';
  }

  // A separate claim button for tasks with URLs
  const showClaimButton = task.url && hasVisitedLink;
  const canClaimUrlTask = showClaimButton && timeLeft <= 0 && !isCompletedOnce && !isClaiming;


  return (
    <>
    <Card className="shadow-lg hover:shadow-xl transition-shadow flex flex-col justify-between">
      <CardHeader className="flex flex-row items-center gap-4">
        <div className="bg-secondary p-3 rounded-full">{getIcon(task.icon)}</div>
        <div>
          <CardTitle>{task.title}</CardTitle>
          <CardDescription>Reward: {task.reward.toLocaleString()} Pika Tokens</CardDescription>
        </div>
        {isAdmin && (
          <div className="ml-auto flex gap-2">
            <Button variant="ghost" size="icon" onClick={() => setIsEditDialogOpen(true)}>
              <Edit className="h-4 w-4" />
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="icon">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                  <AlertDialogHeader>
                      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                          This action cannot be undone. This will permanently delete the task.
                      </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => deleteTask(task.id)}>Delete</AlertDialogAction>
                  </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        )}
      </CardHeader>
      <CardFooter>
        <div className="w-full flex gap-2">
           <Button
              className="w-full"
              onClick={handleAction}
              disabled={task.url ? isClaiming : isButtonDisabled}
            >
              {isClaiming && task.url ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {isClaiming && !task.url ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {isCompletedOnce && !pendingTransaction && isOneTimeTask && !task.url && <Check className="mr-2 h-4 w-4" />}
              {buttonText}
           </Button>
           {showClaimButton && (
             <Button
                className="w-full"
                onClick={handleClaim}
                disabled={!canClaimUrlTask}
              >
                {isClaiming && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isCompletedOnce ? <><Check className="mr-2 h-4 w-4"/> Completed</> : 'Claim'}
             </Button>
           )}
        </div>
      </CardFooter>
    </Card>

    {/* Ad Dialog */}
    {task.htmlContent && (
        <Dialog open={isAdDialogOpen} onOpenChange={setIsAdDialogOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{task.title}</DialogTitle>
                </DialogHeader>
                <div className="py-4 space-y-4">
                    <div dangerouslySetInnerHTML={{ __html: task.htmlContent }} />
                </div>
                <DialogFooter>
                    <Button onClick={handleClaim} disabled={isClaiming || timeLeft > 0}>
                        {isClaiming && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {timeLeft > 0 ? <><Clock className="mr-2 h-4 w-4"/> {formatTime(timeLeft)} </> : 'Claim Reward'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )}

    {/* User submission dialog */}
    <Dialog open={isSubmitDialogOpen} onOpenChange={setIsSubmitDialogOpen}>
        <DialogContent>
        <DialogHeader>
            <DialogTitle>Submit Task: {task.title}</DialogTitle>
            <DialogDescription>
            Provide the required information for admin approval. For example, a link to your tweet or a screenshot of the completed action.
            </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-4">
            <div>
            <Label htmlFor="submissionData">Submission Data (optional)</Label>
            <Textarea 
                id="submissionData" 
                value={submission} 
                onChange={(e) => setSubmission(e.target.value)} 
                placeholder="e.g., https://x.com/username/status/12345"
            />
            </div>
        </div>
        <DialogFooter>
            <Button onClick={handleSubmitForApproval} disabled={isClaiming}>
                {isClaiming && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Submit
            </Button>
        </DialogFooter>
        </DialogContent>
    </Dialog>

    
    {/* Admin Edit Dialog */}
    <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
            <DialogHeader>
                <DialogTitle>Edit Task: {task.title}</DialogTitle>
            </DialogHeader>
            <div className="py-4 space-y-4">
                <div>
                  <Label htmlFor="editTaskTitle">Task Title</Label>
                  <Input id="editTaskTitle" value={editedTitle} onChange={(e) => setEditedTitle(e.target.value)} />
                </div>
                 <div>
                  <Label htmlFor="editTaskReward">Reward</Label>
                  <Input id="editTaskReward" type="number" value={editedReward} onChange={(e) => setEditedReward(e.target.value)} />
                </div>
                <div>
                  <Label htmlFor="editTaskCooldown">Cooldown (seconds)</Label>
                  <Input id="editTaskCooldown" type="number" value={editedCooldown} onChange={(e) => setEditedCooldown(e.target.value)} />
                </div>
                {(task.id.includes('twitter') || task.id.includes('telegram') || task.url) && (
                  <div>
                    <Label htmlFor="editTaskUrl">URL</Label>
                    <Input id="editTaskUrl" value={editedUrl} onChange={(e) => setEditedUrl(e.target.value)} />
                  </div>
                )}
                 <div>
                  <Label htmlFor="editTaskHtml">HTML Content / Ad Code</Label>
                  <Textarea 
                    id="editTaskHtml" 
                    value={editedHtml}
                    onChange={(e) => setEditedHtml(e.target.value)} 
                    rows={8}
                    placeholder="Enter any HTML or ad script here."
                  />
                </div>
            </div>
            <DialogFooter>
                <Button onClick={handleEditSave}>Save Changes</Button>
            </DialogFooter>
        </DialogContent>
    </Dialog>
    </>
  );
};

const AdminUserDetailsPanel = () => {
    const { getAllUsers, adminNotes, updateAdminNotes } = useUser();
    const [notes, setNotes] = useState(adminNotes);

    const usersData = React.useMemo(() => Object.values(getAllUsers()).filter(u => !u.isAdmin), [getAllUsers]);

    const totalUsers = usersData.length;
    
    const totalEarnings = usersData.reduce((acc, user) => {
        const userEarnings = user.transactions
            .filter(tx => tx.amount > 0 && tx.type !== 'stake' && tx.type !== 'login_bonus')
            .reduce((sum, tx) => sum + tx.amount, 0);
        return acc + userEarnings;
    }, 0);

    const totalReferrals = usersData.reduce((acc, user) => acc + (user.referrals?.length || 0), 0);

    const adsWatched = usersData.reduce((acc, user) => {
        const adWatches = user.transactions.filter(tx => tx.taskId === 'watch_ad').length;
        return acc + adWatches;
    }, 0);

    const handleSaveNotes = () => {
        updateAdminNotes(notes);
        toast({ title: 'Notes Saved', description: 'Your notes have been updated.' });
    };

    return (
        <Card className="shadow-lg">
            <CardHeader>
                <CardTitle className="text-xl font-headline">User Details</CardTitle>
                <CardDescription>An overview of platform-wide user activity.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Users className="h-5 w-5 text-muted-foreground" />
                        <span className="font-medium">Total Users</span>
                    </div>
                    <span className="font-bold text-lg">{totalUsers}</span>
                </div>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <BarChart2 className="h-5 w-5 text-muted-foreground" />
                        <span className="font-medium">Total Earned</span>
                    </div>
                    <span className="font-bold text-lg">{totalEarnings.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Repeat className="h-5 w-5 text-muted-foreground" />
                        <span className="font-medium">Total Referrals</span>
                    </div>
                    <span className="font-bold text-lg">{totalReferrals}</span>
                </div>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Eye className="h-5 w-5 text-muted-foreground" />
                        <span className="font-medium">Ads Watched</span>
                    </div>
                    <span className="font-bold text-lg">{adsWatched}</span>
                </div>
                <div className="space-y-2 pt-4">
                     <Label htmlFor="adminNotes" className="flex items-center gap-2 text-base"><MessageSquare className="h-5 w-5" />User View Opinion</Label>
                    <Textarea 
                        id="adminNotes"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Your private notes and observations about users..."
                        rows={6}
                    />
                </div>
            </CardContent>
            <CardFooter>
                 <Button className="w-full" onClick={handleSaveNotes}>
                    <Save className="mr-2 h-4 w-4" />
                    Save Notes
                </Button>
            </CardFooter>
        </Card>
    )
}


export default function TasksTab() {
  const { user, isAdmin, tasks, addTask } = useUser();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskReward, setNewTaskReward] = useState('');
  const [newTaskCooldown, setNewTaskCooldown] = useState('60');
  const [newTaskRequiresApproval, setNewTaskRequiresApproval] = useState(false);

  const handleAddTask = () => {
    const reward = parseInt(newTaskReward, 10);
    const cooldown = parseInt(newTaskCooldown, 10);

    if (!newTaskTitle || isNaN(reward) || reward <= 0 || isNaN(cooldown) || cooldown < 0) {
      toast({
        title: 'Invalid Input',
        description: 'Please provide a valid title, a positive reward amount and a non-negative cooldown.',
        variant: 'destructive',
      });
      return;
    }
    addTask({ title: newTaskTitle, reward, cooldown, requiresApproval: newTaskRequiresApproval });
    toast({
      title: 'Task Added',
      description: `Successfully added task: ${newTaskTitle}`,
    });
    setNewTaskTitle('');
    setNewTaskReward('');
    setNewTaskCooldown('60');
    setNewTaskRequiresApproval(false);
    setIsDialogOpen(false);
  };

  return (
    <div className="w-full max-w-6xl mx-auto mt-6">
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
                  <div>
                    <Label htmlFor="taskCooldown">Cooldown (seconds)</Label>
                    <Input 
                      id="taskCooldown" 
                      type="number" 
                      value={newTaskCooldown} 
                      onChange={(e) => setNewTaskCooldown(e.target.value)} 
                      placeholder="e.g., 60"
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="requiresApproval" checked={newTaskRequiresApproval} onCheckedChange={(checked) => setNewTaskRequiresApproval(checked as boolean)} />
                    <Label htmlFor="requiresApproval">Requires Admin Approval</Label>
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={handleAddTask}>Create Task</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
            {tasks.map((task) => (
                <TaskCard key={task.id} task={task} />
            ))}
        </div>
        <div className="lg:col-span-1">
            {isAdmin && <AdminUserDetailsPanel />}
        </div>
      </div>
    </div>
  );
}
