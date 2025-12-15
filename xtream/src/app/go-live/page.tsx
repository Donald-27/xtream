
'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useFirestore, useUser, addDocumentNonBlocking, useDoc, useMemoFirebase } from '@/firebase';
import { collection, serverTimestamp, doc } from 'firebase/firestore';
import { ArrowLeft, Video, WandSparkles, AlertTriangle, Users } from 'lucide-react';
import { suggestStreamTitle } from '@/ai/flows/suggest-stream-title';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import type { User } from '@/lib/types';
import { Switch } from '@/components/ui/switch';

const streamSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  category: z.string().min(1, 'Category is required'),
  description: z.string().optional(),
  allowCoStreaming: z.boolean().default(false),
});

type StreamFormData = z.infer<typeof streamSchema>;

export default function GoLivePage() {
  const router = useRouter();
  const firestore = useFirestore();
  const { user } = useUser();
  const { toast } = useToast();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);

  const userDocRef = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return doc(firestore, 'users', user.uid);
  }, [firestore, user]);

  const { data: userProfile } = useDoc<User>(userDocRef);

  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    control,
    formState: { errors },
  } = useForm<StreamFormData>({
    resolver: zodResolver(streamSchema),
    defaultValues: {
      allowCoStreaming: false,
    },
  });

  useEffect(() => {
    if (userProfile?.defaultStreamCategory) {
      setValue('category', userProfile.defaultStreamCategory);
    }
  }, [userProfile, setValue]);


  useEffect(() => {
    const getCameraPermission = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        setHasCameraPermission(true);

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error('Error accessing camera:', error);
        setHasCameraPermission(false);
        toast({
          variant: 'destructive',
          title: 'Camera Access Denied',
          description: 'Please enable camera permissions in your browser settings to use this feature.',
        });
      }
    };

    getCameraPermission();

    return () => {
        // Stop camera stream when component unmounts
        if (videoRef.current && videoRef.current.srcObject) {
            const stream = videoRef.current.srcObject as MediaStream;
            stream.getTracks().forEach(track => track.stop());
        }
    }
  }, [toast]);

  const handleGenerateTitle = async () => {
    const { description, title, category } = getValues();
    if (!description) {
      toast({
        variant: "destructive",
        title: "Description needed",
        description: "Please enter a stream description first to get a title suggestion."
      });
      return;
    }
    setIsGenerating(true);
    try {
      const result = await suggestStreamTitle({
        streamDescription: description,
        currentTitle: title,
        categoryPreferences: category,
      });
      if (result.suggestedTitle) {
        setValue('title', result.suggestedTitle);
        if (result.suggestedCategories && result.suggestedCategories.length > 0) {
            setValue('category', result.suggestedCategories[0]);
        }
        toast({
          title: "Title generated!",
          description: "The AI has created a new title for your stream.",
        });
      }
    } catch (error) {
      console.error("Failed to generate title:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not generate a title. Please try again.",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const onSubmit = async (data: StreamFormData) => {
    if (!user || !firestore) {
      toast({
        variant: 'destructive',
        title: 'Authentication Error',
        description: 'You must be logged in to start a stream.',
      });
      return;
    }
    setIsSubmitting(true);

    const streamsCollection = collection(firestore, 'streams');
    try {
      // addDocumentNonBlocking returns a promise that resolves with the doc ref
      const newDocRef = await addDocumentNonBlocking(streamsCollection, {
        ...data,
        userId: user.uid,
        live: true,
        startTime: serverTimestamp(),
        coStreamerIds: [],
        joinRequests: [],
        tags: [],
        thumbnailUrl: 'https://picsum.photos/seed/live/400/225', // Generic placeholder for live streams
        createdAt: serverTimestamp(),
      });

      toast({
        title: 'You are Live!',
        description: 'Your stream has started successfully.',
      });

      // Navigate to the newly created stream page
      router.push(`/stream/${newDocRef.id}`);
    } catch (error) {
      console.error('Error starting stream:', error);
      toast({
        variant: 'destructive',
        title: 'Uh oh! Something went wrong.',
        description: 'Could not start the stream. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
       <header className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b border-border/80 bg-secondary/80 px-4 backdrop-blur-sm sm:px-6">
        <Link href="/profile" passHref>
          <ArrowLeft className="h-6 w-6" />
        </Link>
        <h1 className="text-xl font-bold">Go Live</h1>
      </header>

      <main className="flex-1 p-4 sm:p-6 md:grid md:grid-cols-2 md:gap-8">
        <div className="flex flex-col gap-4">
             <Card className="aspect-video w-full overflow-hidden">
                <video ref={videoRef} className="w-full h-full object-cover" autoPlay muted playsInline />
             </Card>
             {hasCameraPermission === false && (
                <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Camera Access Required</AlertTitle>
                    <AlertDescription>
                        Please allow camera access in your browser settings to use this feature.
                    </AlertDescription>
                </Alert>
             )}
        </div>

        <Card className="w-full max-w-2xl mx-auto mt-8 md:mt-0">
          <CardHeader>
            <CardTitle>Stream Details</CardTitle>
            <CardDescription>Tell everyone what you're about to stream.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
               <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <div className="relative">
                    <Textarea
                        id="description"
                        {...register('description')}
                        placeholder="What are you streaming about?"
                        className="bg-background pr-12"
                    />
                     <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={handleGenerateTitle}
                        disabled={isGenerating}
                        className="absolute top-2 right-2 text-primary hover:bg-primary/10"
                    >
                        <WandSparkles className={`h-5 w-5 ${isGenerating ? 'animate-spin' : ''}`} />
                        <span className="sr-only">Generate Title & Category</span>
                    </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="title">Stream Title</Label>
                <Input id="title" {...register('title')} placeholder="e.g., My Awesome Live Stream" className="bg-background"/>
                {errors.title && <p className="text-destructive text-sm">{errors.title.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Input id="category" {...register('category')} placeholder="e.g., Gaming, Cooking, IRL" className="bg-background"/>
                {errors.category && <p className="text-destructive text-sm">{errors.category.message}</p>}
              </div>
              
              <div className="flex items-center justify-between rounded-lg border p-3 shadow-sm bg-background">
                <div className="space-y-0.5">
                    <Label htmlFor="allowCoStreaming" className="text-base">Co-streaming</Label>
                    <p className="text-sm text-muted-foreground">
                        Allow other users to request to join your stream.
                    </p>
                </div>
                 <Controller
                    name="allowCoStreaming"
                    control={control}
                    render={({ field }) => (
                        <Switch
                        id="allowCoStreaming"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        />
                    )}
                />
              </div>


              <Button variant="hot" type="submit" disabled={isSubmitting || hasCameraPermission !== true} className="w-full">
                {isSubmitting ? 'Starting Stream...' : (
                    <>
                        <Video className="w-4 h-4 mr-2"/> Go Live Now
                    </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

    