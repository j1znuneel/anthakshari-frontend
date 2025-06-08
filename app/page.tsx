'use client';

import { useState } from "react";
import { CreateRoomForm } from "@/components/CreateRoom";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { MusicIcon } from "lucide-react";
import { motion } from "framer-motion";
import { JoinRoomForm } from "@/components/joinRoom";

export default function Home() {
  const [selectedTab, setSelectedTab] = useState<string>("create");

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col">
      {/* Header */}
      <section className="py-12 bg-gradient-to-b from-primary/5 to-background">
        <div className="container max-w-6xl mx-auto px-4">
          <div className="text-center space-y-4">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <MusicIcon className="mx-auto h-16 w-16 text-primary mb-4" />
              <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight">
                Antakshari
              </h1>
            </motion.div>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-xl text-muted-foreground max-w-xl mx-auto"
            >
              The classic Indian song game, now online! Create or join a room and start singing.
            </motion.p>
          </div>
        </div>
      </section>

      {/* Forms */}
      <section className="flex-1 py-8 container max-w-6xl mx-auto px-4">
        <div className="max-w-md mx-auto">
          <Tabs defaultValue="create" value={selectedTab} onValueChange={setSelectedTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="create">Create Room</TabsTrigger>
              <TabsTrigger value="join">Join Room</TabsTrigger>
            </TabsList>
            <div className="mt-6">
              <TabsContent value="create" className="mt-0">
                <CreateRoomForm />
              </TabsContent>
              <TabsContent value="join" className="mt-0">
                <JoinRoomForm />
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </section>

      {/* Instructions */}
      <section className="py-16 bg-muted/50">
        <div className="container max-w-4xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-center mb-8">How to Play</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                title: "Create or Join",
                desc: "Create a new room or join an existing one with a room code.",
              },
              {
                title: "Sing Songs",
                desc: "On your turn, sing a song starting with the given letter.",
              },
              {
                title: "Pass the Letter",
                desc: "Specify the last letter of your song for the next player to begin with.",
              },
            ].map((step, idx) => (
              <div key={idx} className="bg-background p-6 rounded-lg shadow-sm">
                <div className="mb-4 bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center">
                  <span className="font-bold text-primary text-xl">{idx + 1}</span>
                </div>
                <h3 className="text-lg font-semibold mb-2">{step.title}</h3>
                <p className="text-muted-foreground">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
