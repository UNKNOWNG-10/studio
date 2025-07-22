
'use client';

import React, { useMemo } from 'react';
import { useUser } from '@/contexts/user-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import Image from 'next/image';

interface LeaderboardUser {
  rank: number;
  uid: string;
  tokens: number;
  isCurrentUser: boolean;
}

export default function LeaderboardTab() {
  const { user, getAllUsers } = useUser();
  const allUsers = getAllUsers();

  const leaderboardData: LeaderboardUser[] = useMemo(() => {
    if (!allUsers) return [];

    const sortedUsers = Object.values(allUsers)
      .sort((a, b) => b.tokenBalance - a.tokenBalance);

    const rankedUsers: LeaderboardUser[] = sortedUsers.map((u, index) => ({
      rank: index + 1,
      uid: u.uid.startsWith('admin') ? 'Pika Admin' : `*******${u.uid.slice(-4)}`,
      tokens: u.tokenBalance,
      isCurrentUser: user?.uid === u.uid,
    }));
    
    let top50 = rankedUsers.slice(0, 50);
    const currentUserInTop50 = top50.some(u => u.isCurrentUser);

    if (user && !currentUserInTop50) {
      const currentUserRank = rankedUsers.find(u => u.isCurrentUser);
      if (currentUserRank) {
        // Replace last entry with current user if not in top 50
        if (top50.length === 50) {
          top50[49] = currentUserRank;
        } else {
          top50.push(currentUserRank);
        }
      }
    }
    
    return top50;
  }, [allUsers, user]);

  return (
    <div className="relative w-full max-w-4xl mx-auto mt-6">
      <Image
        src="https://placehold.co/1200x800.png"
        alt="Leaderboard background"
        layout="fill"
        objectFit="cover"
        className="absolute inset-0 z-0 opacity-20 rounded-lg"
        data-ai-hint="stadium crowd"
      />
      <div className="relative z-10">
        <Card className="shadow-lg bg-card/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-2xl font-headline">Leaderboard</CardTitle>
            <CardDescription>Top 50 Pika Token earners in the community.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">Rank</TableHead>
                  <TableHead>User UID</TableHead>
                  <TableHead className="text-right">Pika Tokens</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {leaderboardData.map((player) => (
                  <TableRow key={player.rank} className={player.isCurrentUser ? 'bg-primary/20 hover:bg-primary/30' : ''}>
                    <TableCell className="font-medium text-lg">{player.rank}</TableCell>
                    <TableCell>{player.uid}</TableCell>
                    <TableCell className="text-right font-semibold text-primary">{Math.floor(player.tokens).toLocaleString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
