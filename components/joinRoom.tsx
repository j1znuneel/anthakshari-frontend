'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import axios from '@/lib/axios';

export default function JoinRoomForm() {
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const router = useRouter();

  const handleJoinRoom = async () => {
    try {
      const res = await axios.post('api/room/join', { name, code });
      router.push(`/room/${code}`);
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to join room');
    }
  };

  return (
    <div className="space-y-4">
      <Input
        placeholder="Your Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <Input
        placeholder="Room Code"
        value={code}
        onChange={(e) => setCode(e.target.value)}
      />
      <Button onClick={handleJoinRoom}>Join Room</Button>
    </div>
  );
}
