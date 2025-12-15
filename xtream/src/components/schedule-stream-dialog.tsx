
"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar, WandSparkles } from "lucide-react";
import { suggestStreamTitle } from "@/ai/flows/suggest-stream-title";
import { useToast } from "@/hooks/use-toast";
import { useFirestore, useUser, addDocumentNonBlocking, useDoc, useMemoFirebase } from "@/firebase";
import { collection, serverTimestamp, doc } from "firebase/firestore";
import type { User } from "@/lib/types";

export function ScheduleStreamDialog() {
  const { toast } = useToast();
  const firestore = useFirestore();
  const { user } = useUser();
  
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [startTime, setStartTime] = useState("");

  const [isGenerating, setIsGenerating] = useState(false);
  const [open, setOpen] = useState(false);

  const userDocRef = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return doc(firestore, 'users', user.uid);
  }, [firestore, user]);

  const { data: userProfile } = useDoc<User>(userDocRef);

  useEffect(() => {
    if (userProfile?.defaultStreamCategory && !category) {
      setCategory(userProfile.defaultStreamCategory);
    }
  }, [userProfile, category]);


  const handleSuggestTitle = async () => {
    if (!description) {
      toast({
        title: "Description needed",
        description: "Please enter a stream description first to get suggestions.",
        variant: "destructive",
      });
      return;
    }
    setIsGenerating(true);
    try {
      const result = await suggestStreamTitle({ streamDescription: description, currentTitle: title, categoryPreferences: category });
      if (result.suggestedTitle) {
        setTitle(result.suggestedTitle);
        if (result.suggestedCategories && result.suggestedCategories.length > 0) {
          setCategory(result.suggestedCategories[0]);
        }
        toast({
          title: "Suggestion applied!",
          description: "A new title and category has been generated for you.",
        });
      }
    } catch (error) {
      console.error("Failed to suggest title:", error);
       toast({
        title: "Error",
        description: "Could not generate a title suggestion. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleScheduleStream = async () => {
    if (!user || !firestore) {
      toast({ variant: "destructive", title: "Not logged in", description: "You must be logged in to schedule a stream." });
      return;
    }
    if (!title || !description || !category || !startTime) {
      toast({ variant: "destructive", title: "Missing fields", description: "Please fill out all fields." });
      return;
    }

    const streamsCollection = collection(firestore, 'streams');
    try {
      await addDocumentNonBlocking(streamsCollection, {
        title,
        category,
        description, // Not in schema, but good to have
        live: false,
        startTime: new Date(startTime),
        userId: user.uid,
        viewerIds: [],
        tags: [],
        thumbnailUrl: 'stream-2', // Default placeholder
        createdAt: serverTimestamp(),
      });

      toast({ title: "Stream Scheduled!", description: "Your stream is now on the schedule." });
      setOpen(false);
      // Reset form
      setTitle('');
      setDescription('');
      setCategory(userProfile?.defaultStreamCategory || '');
      setStartTime('');
    } catch (error) {
      console.error("Error scheduling stream:", error);
      toast({ variant: "destructive", title: "Scheduling failed", description: "Could not schedule the stream. Please try again." });
    }
  };


  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="secondary" className="flex-1"><Calendar className="w-4 h-4 mr-2"/>SCHEDULE STREAM</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-secondary border-border">
        <DialogHeader>
          <DialogTitle>Schedule Stream</DialogTitle>
          <DialogDescription>
            Plan your next live stream. Fill in the details below.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="description">Stream Description</Label>
            <Textarea
              id="description"
              placeholder="What will your stream be about? e.g., 'Baking a sourdough bread from scratch.'"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="bg-background"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="title">Stream Title</Label>
            <div className="flex gap-2">
            <Input
              id="title"
              placeholder="e.g., 'My First Sourdough! 🍞'"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="bg-background"
            />
            <Button variant="outline" size="icon" onClick={handleSuggestTitle} disabled={isGenerating} className="border-primary text-primary hover:bg-primary hover:text-primary-foreground flex-shrink-0">
                <WandSparkles className={`h-4 w-4 ${isGenerating ? 'animate-spin' : ''}`} />
                <span className="sr-only">Suggest Title</span>
            </Button>
            </div>
          </div>
           <div className="grid gap-2">
            <Label htmlFor="category">Category</Label>
            <Input
              id="category"
              placeholder="e.g., 'Cooking', 'Gaming'"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="bg-background"
            />
          </div>
           <div className="grid gap-2">
            <Label htmlFor="startTime">Schedule Time</Label>
            <Input
              id="startTime"
              type="datetime-local"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="bg-background"
            />
          </div>
        </div>
        <DialogFooter>
          <Button type="submit" onClick={handleScheduleStream}>
            Schedule
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
