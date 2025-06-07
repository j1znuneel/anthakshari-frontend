// app/page.tsx
'use client';

import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import CreateRoomForm from '@/components/CreateRoom';
import JoinRoomForm from '@/components/joinRoom';

export default function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <Tabs defaultValue="create" className="w-full max-w-md">
        <TabsList className='w-full'>
          <TabsTrigger value="create">Create Room</TabsTrigger>
          <TabsTrigger value="join">Join Room</TabsTrigger>
        </TabsList>
        <TabsContent value="create">
          <CreateRoomForm />
        </TabsContent>
        <TabsContent value="join">
          <JoinRoomForm />
        </TabsContent>
      </Tabs>
    </main>
  );
}
