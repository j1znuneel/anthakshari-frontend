'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { z } from 'zod';

import axios from '@/lib/axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

const formSchema = z.object({
  playerName: z.string().min(2, {
    message: 'Name must be at least 2 characters.',
  }).max(15, {
    message: 'Name must be at most 15 characters.',
  }),
  roomCode: z.string().length(6, {
    message: 'Room code must be exactly 6 characters.',
  }),
});

export function JoinRoomForm() {
  const router = useRouter();
  const [isJoining, setIsJoining] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      playerName: '',
      roomCode: '',
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsJoining(true);
    setError(null);

    try {
      await axios.post('/api/room/join', {
        name: values.playerName,
        code: values.roomCode.toUpperCase(),
      });
      router.push(`/room/${values.roomCode.toUpperCase()}`);
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Failed to join room');
      setIsJoining(false);
    }
  };

  return (
    <Card className="w-full max-w-md shadow-lg border-2 border-primary/10">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Join Game</CardTitle>
        <CardDescription>
          Enter a room code to join an existing Antakshari game
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="roomCode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Room Code</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="ABCDEF"
                      {...field}
                      onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                      className="bg-background uppercase tracking-widest text-center font-mono"
                      maxLength={6}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="playerName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Your Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter your name"
                      {...field}
                      className="bg-background"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {error && (
              <div className="text-sm font-medium text-destructive">
                {error}
              </div>
            )}
            <Button type="submit" className="w-full" disabled={isJoining}>
              {isJoining ? 'Joining...' : 'Join Room'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
