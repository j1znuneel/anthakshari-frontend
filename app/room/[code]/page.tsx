'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import axios from '@/lib/axios';
import PlayerList from '@/components/PlayerList';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';

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
        playerId: room?.currentTurn, // assuming currentTurn holds player ID
      });
    } catch (error: any) {
      alert(error?.response?.data?.error || 'Failed to submit');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!room) return <div>Loading...</div>;

  return (
    <div className="flex h-screen">
      <aside className="w-1/4 p-4 border-r">
        <h2 className="text-xl font-bold mb-4">Players</h2>
        <PlayerList players={room.players} currentTurn={room.currentTurn} />
      </aside>
      <main className="flex-1 p-4">
        <h2 className="text-xl font-bold mb-4">Room: {code}</h2>
        <p>Current Turn: {room.currentTurn}</p>
        <Dialog>
          <DialogTrigger asChild>
            <Button>Submit Last Letter</Button>
          </DialogTrigger>
          <DialogContent>
            <Input
              placeholder="Enter last letter"
              value={lastLetter}
              onChange={(e) => setLastLetter(e.target.value)}
            />
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              Submit
            </Button>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}
