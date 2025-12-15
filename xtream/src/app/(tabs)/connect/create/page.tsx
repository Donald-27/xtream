
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useFirestore, useUser, addDocumentNonBlocking } from '@/firebase';
import { collection, serverTimestamp } from 'firebase/firestore';
import { ArrowLeft, WandSparkles } from 'lucide-react';
import { generateEventDescription } from '@/ai/flows/generate-event-description';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';

const eventSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  eventType: z.string().min(1, 'Event type is required'),
  location: z.string().min(1, 'Location is required'),
  startTime: z.string().min(1, 'Start time is required'),
  maxAttendees: z.coerce.number().min(1, 'Max attendees must be at least 1'),
});

type EventFormData = z.infer<typeof eventSchema>;

export default function CreateEventPage() {
  const router = useRouter();
  const firestore = useFirestore();
  const { user } = useUser();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    getValues,
    formState: { errors },
  } = useForm<EventFormData>({
    resolver: zodResolver(eventSchema),
  });

  const handleGenerateDescription = async () => {
    const { title, eventType, location, startTime, description } = getValues();
    if (!title) {
        toast({
            variant: "destructive",
            title: "Title needed",
            description: "Please enter an event title first to get a description suggestion."
        });
        return;
    }
    setIsGenerating(true);
    try {
      const result = await generateEventDescription({
        title,
        eventType,
        location,
        date: new Date(startTime).toLocaleString(),
        description: description,
      });
      if (result.description) {
        setValue('description', result.description);
        toast({
          title: "Description generated!",
          description: "The AI has created a new description for your event.",
        });
      }
    } catch (error) {
      console.error("Failed to generate description:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not generate a description. Please try again.",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const onSubmit = async (data: EventFormData) => {
    if (!user || !firestore) {
      toast({
        variant: 'destructive',
        title: 'Authentication Error',
        description: 'You must be logged in to create an event.',
      });
      return;
    }
    setIsSubmitting(true);

    const eventsCollection = collection(firestore, 'events');
    try {
      await addDocumentNonBlocking(eventsCollection, {
        ...data,
        organizerId: user.uid,
        attendeeIds: [],
        createdAt: serverTimestamp(),
        startTime: new Date(data.startTime),
      });

      toast({
        title: 'Event Created!',
        description: 'Your event has been successfully scheduled.',
      });
      router.push('/connect');
    } catch (error) {
      console.error('Error creating event:', error);
      toast({
        variant: 'destructive',
        title: 'Uh oh! Something went wrong.',
        description: 'Could not create the event. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
       <header className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b border-border/80 bg-secondary/80 px-4 backdrop-blur-sm sm:px-6">
        <Link href="/connect" passHref>
          <button className="flex items-center gap-2">
            <ArrowLeft className="h-6 w-6" />
            <span className="sr-only">Back</span>
          </button>
        </Link>
        <h1 className="text-xl font-bold">Create Event</h1>
      </header>

      <main className="flex-1 p-4 sm:p-6">
        <Card className="w-full max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Event Details</CardTitle>
            <CardDescription>Fill out the form below to create your new event.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Event Title</Label>
                <Input id="title" {...register('title')} placeholder="e.g., Summer Rooftop Party" className="bg-background"/>
                {errors.title && <p className="text-destructive text-sm">{errors.title.message}</p>}
              </div>

               <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <div className="relative">
                    <Textarea
                    id="description"
                    {...register('description')}
                    placeholder="Tell everyone what your event is about..."
                    className="bg-background pr-12"
                    />
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={handleGenerateDescription}
                        disabled={isGenerating}
                        className="absolute top-2 right-2 text-primary hover:bg-primary/10"
                    >
                        <WandSparkles className={`h-5 w-5 ${isGenerating ? 'animate-spin' : ''}`} />
                        <span className="sr-only">Generate Description</span>
                    </Button>
                </div>
                {errors.description && <p className="text-destructive text-sm">{errors.description.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="eventType">Event Type</Label>
                <Input id="eventType" {...register('eventType')} placeholder="e.g., Party, Workshop, Meetup" className="bg-background"/>
                {errors.eventType && <p className="text-destructive text-sm">{errors.eventType.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input id="location" {...register('location')} placeholder="e.g., Online or Physical Address" className="bg-background"/>
                {errors.location && <p className="text-destructive text-sm">{errors.location.message}</p>}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="startTime">Start Time</Label>
                   <Input id="startTime" type="datetime-local" {...register('startTime')} className="bg-background"/>
                  {errors.startTime && <p className="text-destructive text-sm">{errors.startTime.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxAttendees">Max Attendees</Label>
                  <Input id="maxAttendees" type="number" {...register('maxAttendees')} placeholder="50" className="bg-background"/>
                  {errors.maxAttendees && <p className="text-destructive text-sm">{errors.maxAttendees.message}</p>}
                </div>
              </div>

              <Button type="submit" disabled={isSubmitting} className="w-full">
                {isSubmitting ? 'Creating Event...' : 'Create Event'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
