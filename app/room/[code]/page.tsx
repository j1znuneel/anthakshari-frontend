"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import PlayerList from "@/components/PlayerList";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { motion } from "framer-motion";
import { Users, MessageCircle } from "lucide-react";
import { io, Socket } from "socket.io-client";

type Player = {
  id: string;
  name: string;
};

type Room = {
  code: string;
  currentTurn: string;
  players: Player[];
};

let socket: Socket;

export default function RoomPage() {
  const params = useParams();
  const code =
    typeof params.code === "string" ? params.code : params.code?.[0] || "";
  const currentPlayerId =
    typeof window !== "undefined" ? localStorage.getItem("playerId") : null;

  const [room, setRoom] = useState<Room | null>(null);
  const [lastLetter, setLastLetter] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    socket = io("http://localhost:3000");

    socket.on("connect", () => {
      socket.emit("join-room", code);
    });

    socket.on("room-data", (updatedRoom: Room) => {
      setRoom(updatedRoom);
    });

    socket.on("room-error", (msg: string) => {
      console.error("Room error:", msg);
    });

    return () => {
      socket.disconnect();
    };
  }, [code]);

  const handleSubmit = () => {
    if (!room || room.currentTurn !== currentPlayerId) return;
    setIsSubmitting(true);

    socket.emit("submit-song", {
      code,
      letter: lastLetter.trim().toUpperCase(),
      playerId: room.currentTurn,
    });

    setLastLetter("");
    setIsSubmitting(false);
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
              Current Turn:{" "}
              <span className="font-medium text-primary">
                {room.players.find((p) => p.id === room.currentTurn)?.name ||
                  "Unknown"}
              </span>
            </p>
          </div>

          <Dialog>
            <DialogTrigger asChild>
              <Button
                className="flex gap-2"
                disabled={room.currentTurn !== currentPlayerId}
                title={
                  room.currentTurn !== currentPlayerId ? "Not your turn" : ""
                }
              >
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
                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitting || !lastLetter.trim()}
                >
                  {isSubmitting ? "Submitting..." : "Submit"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </motion.div>
      </main>
    </div>
  );
}
