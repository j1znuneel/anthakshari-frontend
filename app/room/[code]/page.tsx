'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import axios from '@/lib/axios';
import PlayerList from '@/components/PlayerList';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { motion } from 'framer-motion';
import { Users, MessageCircle } from 'lucide-react';

type Player = {
  id: string;
  name: string;
};

type Room = {
  code: string;
  currentTurn: string;
  players: Player[];
};

export default function RoomPage() {
  const params = useParams();
  const code = typeof params.code === 'string' ? params.code : params.code?.[0] || '';

  const [room, setRoom] = useState<Room | null>(null);
  const [lastLetter, setLastLetter] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchRoom = async () => {
    try {
      const { data } = await axios.get<Room>(`api/room/${code}`);
      setRoom(data);
    } catch (error) {
      console.error('Failed to fetch room:', error);
    }
  };

  useEffect(() => {
    fetchRoom();
    const interval = setInterval(fetchRoom, 5000);
    return () => clearInterval(interval);
  }, [code]);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await axios.post('api/room/submit', {
        code,
        letter: lastLetter,
        playerId: room?.currentTurn,
      });
      setLastLetter('');
    } catch (error: any) {
      alert(error?.response?.data?.error || 'Failed to submit');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!room) return <div className="text-center p-10">Loading...</div>;

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-1/4 border-b md:border-b-0 md:border-r bg-muted/20 p-6 space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <Users className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-semibold">Players</h2>
        </div>
        <PlayerList players={room.players} currentTurn={room.currentTurn} />
      </aside>

      {/* Main */}
      <main className="flex-1 p-6">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="space-y-6"
        >
          <div>
            <h1 className="text-2xl font-bold">Room Code: {room.code}</h1>
            <p className="text-muted-foreground mt-1">
              Current Turn: <span className="font-medium text-primary">{room.currentTurn}</span>
            </p>
          </div>

          <Dialog>
            <DialogTrigger asChild>
              <Button className="flex gap-2">
                <MessageCircle className="w-4 h-4" />
                Submit Last Letter
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Enter the last letter of your song</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <Input
                  placeholder="e.g. A, M, N..."
                  value={lastLetter}
                  onChange={(e) => setLastLetter(e.target.value)}
                  maxLength={1}
                  className="text-center uppercase tracking-wide text-lg"
                />
                <Button onClick={handleSubmit} disabled={isSubmitting || !lastLetter.trim()}>
                  {isSubmitting ? 'Submitting...' : 'Submit'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </motion.div>
      </main>
    </div>
  );
}
