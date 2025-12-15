
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
import { ArrowLeft, WandSparkles, UploadCloud } from 'lucide-react';
import { generateGameDescription } from '@/ai/flows/generate-game-description';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';

const challengeSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  rules: z.string().min(10, 'Please provide some rules or criteria'),
  submissionType: z.enum(['photo', 'video', 'text'], { required_error: 'You must select a submission type.' }),
  deadline: z.date({ required_error: "A deadline is required." }),
  coverImageUrl: z.string().optional(),
});

type ChallengeFormData = z.infer<typeof challengeSchema>;

export default function CreateChallengePage() {
  const router = useRouter();
  const firestore = useFirestore();
  const { user } = useUser();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    control,
    watch,
    formState: { errors },
  } = useForm<ChallengeFormData>({
    resolver: zodResolver(challengeSchema),
  });

  const coverImageUrl = watch('coverImageUrl');

  const handleGenerateDescription = async () => {
    const { title } = getValues();
    if (!title) {
        toast({
            variant: "destructive",
            title: "Title needed",
            description: "Please enter a challenge title first to get AI suggestions."
        });
        return;
    }
    setIsGenerating(true);
    try {
      const result = await generateGameDescription({
        title,
        gameType: "Creative Challenge", // Provide a generic type for the AI
      });
      if (result.description && result.rules) {
        setValue('description', result.description);
        setValue('rules', result.rules);
        toast({
          title: "Content generated!",
          description: "The AI has created a description and rules for your challenge.",
        });
      }
    } catch (error) {
      console.error("Failed to generate description:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not generate content. Please try again.",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      setValue('coverImageUrl', base64String);
    };
    reader.readAsDataURL(file);
  };

  const onSubmit = async (data: ChallengeFormData) => {
    if (!user || !firestore) {
      toast({
        variant: 'destructive',
        title: 'Authentication Error',
        description: 'You must be logged in to create a challenge.',
      });
      return;
    }
    setIsSubmitting(true);

    const challengesCollection = collection(firestore, 'challenges');
    try {
      await addDocumentNonBlocking(challengesCollection, {
        ...data,
        creatorId: user.uid,
        createdAt: serverTimestamp(),
      });

      toast({
        title: 'Challenge Created!',
        description: 'Your challenge is now live.',
      });
      router.push('/play');
    } catch (error) {
      console.error('Error creating challenge:', error);
      toast({
        variant: 'destructive',
        title: 'Uh oh! Something went wrong.',
        description: 'Could not create the challenge. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
       <header className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b border-border/80 bg-secondary/80 px-4 backdrop-blur-sm sm:px-6">
        <Link href="/play" passHref>
          <ArrowLeft className="h-6 w-6" />
        </Link>
        <h1 className="text-xl font-bold">Create a Challenge</h1>
      </header>

      <main className="flex-1 p-4 sm:p-6">
        <Card className="w-full max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Challenge Details</CardTitle>
            <CardDescription>Fill out the form below to create your new creative challenge.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Challenge Title</Label>
                <Input id="title" {...register('title')} placeholder="e.g., 'Monochrome Cityscapes' Photo Challenge" className="bg-background"/>
                {errors.title && <p className="text-destructive text-sm">{errors.title.message}</p>}
              </div>

               <div className="space-y-2">
                <Label>Description & Rules</Label>
                <div className="relative">
                    <Textarea
                        id="description"
                        {...register('description')}
                        placeholder="Describe your challenge. What's the theme? What are you looking for?"
                        className="bg-background pr-12 min-h-[100px]"
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
                        <span className="sr-only">Generate Description & Rules</span>
                    </Button>
                </div>
                 {errors.description && <p className="text-destructive text-sm">{errors.description.message}</p>}
                 <Textarea
                    id="rules"
                    {...register('rules')}
                    placeholder="Explain the rules. e.g., '1. One entry per person. 2. Must be taken in the last week. 3. No digital manipulation allowed.'"
                    className="bg-background min-h-[100px]"
                    />
                 {errors.rules && <p className="text-destructive text-sm">{errors.rules.message}</p>}
              </div>

              <div className="space-y-2">
                <Label>Cover Image (Optional)</Label>
                <div className="relative aspect-video w-full rounded-md overflow-hidden border-2 border-dashed border-border flex items-center justify-center">
                    {coverImageUrl ? (
                        <img src={coverImageUrl} alt="Cover" className="h-full w-full object-cover"/>
                    ) : (
                        <div className="text-center text-muted-foreground p-4">
                            <UploadCloud className="h-8 w-8 mx-auto"/>
                            <p className="mt-2 text-sm">Click to upload a cover image</p>
                        </div>
                    )}
                    <input
                        type="file"
                        onChange={handleFileChange}
                        accept="image/png, image/jpeg, image/gif"
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                </div>
              </div>


              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="space-y-2">
                    <Label>Submission Type</Label>
                    <Controller
                        name="submissionType"
                        control={control}
                        render={({ field }) => (
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <SelectTrigger className="bg-background">
                                    <SelectValue placeholder="How will users submit entries?" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="photo">Photo</SelectItem>
                                    <SelectItem value="video">Video</SelectItem>
                                    <SelectItem value="text">Text</SelectItem>
                                </SelectContent>
                            </Select>
                        )}
                    />
                     {errors.submissionType && <p className="text-destructive text-sm">{errors.submissionType.message}</p>}
                 </div>
                 <div className="space-y-2">
                    <Label>Submission Deadline</Label>
                    <Controller
                        control={control}
                        name="deadline"
                        render={({ field }) => (
                        <Popover>
                            <PopoverTrigger asChild>
                            <Button
                                variant={"outline"}
                                className="w-full justify-start text-left font-normal bg-background"
                            >
                                {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                            </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                            <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
                                initialFocus
                            />
                            </PopoverContent>
                        </Popover>
                        )}
                    />
                    {errors.deadline && <p className="text-destructive text-sm">{errors.deadline.message}</p>}
                 </div>
              </div>

              <Button type="submit" disabled={isSubmitting} className="w-full">
                {isSubmitting ? 'Creating Challenge...' : 'Create Challenge'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
