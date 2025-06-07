// components/CreateRoomForm.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import axios from '@/lib/axios';

export default function CreateRoomForm() {
  const [name, setName] = useState('');
  const [turnTime, setTurnTime] = useState(30);
  const router = useRouter();

  const handleCreateRoom = async () => {
    try {
      const res = await axios.post('api/room', { name, turnTime });
      router.push(`/room/${res.data.code}`);
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to create room');
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
        type="number"
        placeholder="Turn Time (seconds)"
        value={turnTime}
        onChange={(e) => setTurnTime(Number(e.target.value))}
      />
      <Button onClick={handleCreateRoom}>Create Room</Button>
    </div>
  );
}
