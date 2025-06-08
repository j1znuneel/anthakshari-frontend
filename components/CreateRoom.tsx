'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import axios from "@/lib/axios";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";

const formSchema = z.object({
  playerName: z.string().min(2, {
    message: "Your name must be at least 2 characters.",
  }).max(15, {
    message: "Your name must be at most 15 characters."
  }),
  timePerTurn: z.number().min(15).max(90),
});

export function CreateRoomForm() {
  const router = useRouter();
  const [isCreating, setIsCreating] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      playerName: "",
      timePerTurn: 30,
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsCreating(true);
    try {
      const res = await axios.post("/api/room", {
        name: values.playerName,
        turnTime: values.timePerTurn,
      });

      router.push(`/room/${res.data.code}`);
    } catch (err: any) {
      alert(err.response?.data?.error || "Failed to create room");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Card className="w-full max-w-md shadow-lg border-2 border-primary/10">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Create New Game</CardTitle>
        <CardDescription>
          Host a new Antakshari game room for your friends to join
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
            <FormField
              control={form.control}
              name="timePerTurn"
              render={({ field: { value, onChange } }) => (
                <FormItem>
                  <FormLabel>Time Per Turn: {value} seconds</FormLabel>
                  <FormControl>
                    <Slider
                      min={15}
                      max={90}
                      step={5}
                      value={[value]}
                      onValueChange={(vals) => onChange(vals[0])}
                      className="py-4"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              type="submit"
              className="w-full"
              disabled={isCreating}
            >
              {isCreating ? "Creating..." : "Create Room"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
