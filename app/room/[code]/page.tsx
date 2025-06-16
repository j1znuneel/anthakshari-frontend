"use client";

import { useEffect, useState, useRef } from "react";
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
import { Users, MessageCircle, Mic, MicOff, Play, Pause } from "lucide-react";
import { io, Socket } from "socket.io-client";

type Player = {
  id: string;
  name: string;
};

type Room = {
  code: string;
  currentTurn: string;
  players: Player[];
  lastLetter?: string;
  currentSong?: {
    audioBlob: Blob;
    playerId: string;
    playerName: string;
  };
};

export default function RoomPage() {
  const params = useParams();
  const code =
    typeof params.code === "string" ? params.code : params.code?.[0] || "";
  const currentPlayerId =
    typeof window !== "undefined" ? localStorage.getItem("playerId") : null;

  const socketRef = useRef<Socket | null>(null);
  const [room, setRoom] = useState<Room | null>(null);
  const [lastLetter, setLastLetter] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [recordedChunks, setRecordedChunks] = useState<Blob[]>([]);
  const [isRecordingDialogOpen, setIsRecordingDialogOpen] = useState(false);
  const [currentSongUrl, setCurrentSongUrl] = useState<string | null>(null);

  useEffect(() => {
    socketRef.current = io("http://localhost:3000");

    socketRef.current.on("connect", () => {
      socketRef.current?.emit("join-room", code);
    });

    socketRef.current.on("room-data", (updatedRoom: Room) => {
      setRoom(updatedRoom);
    });

    socketRef.current.on("song-data", (songData: { audioData: string, playerId: string, playerName: string }) => {
      // Convert base64 back to blob
      const byteString = atob(songData.audioData.split(',')[1]);
      const mimeString = songData.audioData.split(',')[0].split(':')[1].split(';')[0];
      const ab = new ArrayBuffer(byteString.length);
      const ia = new Uint8Array(ab);
      
      for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
      }
      
      const blob = new Blob([ab], { type: mimeString });
      const url = URL.createObjectURL(blob);
      
      setCurrentSongUrl(url);
      setRoom(prev => prev ? {
        ...prev,
        currentSong: {
          audioBlob: blob,
          playerId: songData.playerId,
          playerName: songData.playerName
        }
      } : null);
    });

    socketRef.current.on("room-error", (msg: string) => {
      console.error("Room error:", msg);
    });

    return () => {
      socketRef.current?.disconnect();
      if (currentSongUrl) {
        URL.revokeObjectURL(currentSongUrl);
      }
    };
  }, [code]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks: Blob[] = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunks.push(e.data);
        }
      };

      recorder.onstop = () => {
        setRecordedChunks(chunks);
        stream.getTracks().forEach(track => track.stop());
      };

      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
    } catch (err) {
      console.error("Error accessing microphone:", err);
      alert("Could not access microphone. Please ensure you have granted permission.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop();
      setIsRecording(false);
    }
  };

  const handleSongSubmit = async () => {
    if (!room || room.currentTurn !== currentPlayerId || recordedChunks.length === 0) return;

    const audioBlob = new Blob(recordedChunks, { type: 'audio/webm' });
    const currentPlayer = room.players.find(p => p.id === currentPlayerId);
    
    if (!currentPlayer || !socketRef.current) return;

    // Convert blob to base64
    const reader = new FileReader();
    reader.readAsDataURL(audioBlob);
    reader.onloadend = () => {
      const base64Audio = reader.result as string;
      
      // Send the base64 audio through WebSocket
      socketRef.current?.emit('submit-song', {
        code,
        playerId: currentPlayerId,
        audioData: base64Audio,
        playerName: currentPlayer.name
      });

      setRecordedChunks([]);
      setIsRecordingDialogOpen(false);
    };
  };

  const handleSubmit = async () => {
    if (!room || room.currentTurn !== currentPlayerId || !socketRef.current) return;

    setIsSubmitting(true);

    return new Promise<void>((resolve) => {
      socketRef.current?.emit(
        "submit-letter",
        {
          code,
          letter: lastLetter.trim().toUpperCase(),
          playerId: room.currentTurn,
        },
        () => {
          setIsSubmitting(false);
          setLastLetter("");
          resolve();
        }
      );
    });
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

          {room.currentSong && (
            <div className="bg-muted/20 p-4 rounded-lg">
              <h3 className="font-medium mb-2">Current Song</h3>
              <p className="text-sm text-muted-foreground mb-2">
                Sung by: {room.currentSong.playerName}
              </p>
              <audio
                controls
                className="w-full"
                src={currentSongUrl || undefined}
              />
            </div>
          )}

          <div className="flex gap-2">
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
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
                    onClick={async () => {
                      await handleSubmit();
                      setIsDialogOpen(false);
                    }}
                    disabled={isSubmitting || !lastLetter.trim()}
                  >
                    {isSubmitting ? "Submitting..." : "Submit"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            <Dialog open={isRecordingDialogOpen} onOpenChange={setIsRecordingDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  className="flex gap-2"
                  disabled={room.currentTurn !== currentPlayerId}
                  title={
                    room.currentTurn !== currentPlayerId ? "Not your turn" : ""
                  }
                >
                  <Mic className="w-4 h-4" />
                  Record Song
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Record Your Song</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <div className="flex justify-center">
                    <Button
                      onClick={isRecording ? stopRecording : startRecording}
                      className="flex gap-2"
                      variant={isRecording ? "destructive" : "default"}
                    >
                      {isRecording ? (
                        <>
                          <MicOff className="w-4 h-4" />
                          Stop Recording
                        </>
                      ) : (
                        <>
                          <Mic className="w-4 h-4" />
                          Start Recording
                        </>
                      )}
                    </Button>
                  </div>
                  {recordedChunks.length > 0 && (
                    <div className="space-y-2">
                      <audio
                        controls
                        className="w-full"
                        src={URL.createObjectURL(
                          new Blob(recordedChunks, { type: "audio/webm" })
                        )}
                      />
                      <Button
                        onClick={handleSongSubmit}
                        className="w-full"
                        disabled={!recordedChunks.length}
                      >
                        Submit Song
                      </Button>
                    </div>
                  )}
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
