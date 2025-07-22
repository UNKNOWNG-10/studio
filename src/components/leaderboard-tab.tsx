'use client';

import React, { useMemo } from 'react';
import { useUser } from '@/contexts/user-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface LeaderboardUser {
  rank: number;
  uid: string;
  tokens: number;
  isCurrentUser: boolean;
}

export default function LeaderboardTab() {
  const { user } = useUser();

  const leaderboardData: LeaderboardUser[] = useMemo(() => {
    const data: LeaderboardUser[] = [];
    let currentUserInList = false;

    for (let i = 1; i <= 50; i++) {
      const isCurrentUser = user?.uid === `_mock_${i}`; // This logic needs to be better
      if(isCurrentUser) currentUserInList = true;
      
      data.push({
        rank: i,
        uid: `*******${Math.floor(1000 + Math.random() * 9000)}`,
        tokens: Math.floor(500000 / i + Math.random() * 1000),
        isCurrentUser: false,
      });
    }

    // Try to insert current user into a random spot if they exist and are not top 50
    if(user) {
        const currentUserRank = data.findIndex(u => u.tokens < user.tokenBalance);
        if(currentUserRank !== -1) {
            data.splice(currentUserRank, 0, {
                rank: currentUserRank + 1,
                uid: user.uid,
                tokens: user.tokenBalance,
                isCurrentUser: true,
            });
            data.pop(); // keep it to 50
            // re-rank
            data.forEach((u, i) => u.rank = i + 1);
        } else {
             data[49] = {
                rank: 50,
                uid: user.uid,
                tokens: user.tokenBalance,
                isCurrentUser: true,
            };
        }
    }


    return data;
  }, [user]);

  return (
    <Card className="w-full max-w-4xl mx-auto mt-6 shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl font-headline">Leaderboard</CardTitle>
        <CardDescription>Top 50 token earners in the Token Tycoon community.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">Rank</TableHead>
              <TableHead>User UID</TableHead>
              <TableHead className="text-right">Tokens</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {leaderboardData.map((player) => (
              <TableRow key={player.rank} className={player.isCurrentUser ? 'bg-secondary' : ''}>
                <TableCell className="font-medium text-lg">{player.rank}</TableCell>
                <TableCell>{player.uid}</TableCell>
                <TableCell className="text-right font-semibold text-primary">{player.tokens.toLocaleString()}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
