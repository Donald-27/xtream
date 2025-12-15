
'use client';

import { useState } from 'react';
import { useDoc, useCollection, useFirestore, useMemoFirebase, useUser, addDocumentNonBlocking } from '@/firebase';
import { doc, collection, query, orderBy, serverTimestamp } from 'firebase/firestore';
import type { Challenge, ChallengeEntry, User } from '@/lib/types';
import { ChallengeCard } from '@/components/challenge-card';
import { Skeleton } from '@/components/ui/skeleton';
import { ChatPanel } from '@/components/chat-panel';
import { ArrowLeft, Send, Upload, Trophy, Flame, Lightbulb, Handshake, Star, Leaf } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatDistanceToNow } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { Textarea } from '@/components/ui/textarea';

function EntryCard({ entry }: { entry: ChallengeEntry }) {
    const firestore = useFirestore();

    const userDocRef = useMemoFirebase(() => {
        if (!firestore || !entry.userId) return null;
        return doc(firestore, 'users', entry.userId);
    }, [firestore, entry.userId]);

    const { data: userProfile } = useDoc<User>(userDocRef);

    const getInitials = (name?: string | null) => {
        return name ? name.charAt(0).toUpperCase() : 'U';
    }
    
    const reactions = entry.reactions || {};

    return (
        <div className="bg-card p-4 rounded-lg border border-border/60 flex flex-col h-full">
            <div className="flex items-center gap-3 mb-3">
                <Avatar className="w-8 h-8">
                    <AvatarImage src={userProfile?.profilePictureUrl} />
                    <AvatarFallback>{getInitials(userProfile?.username)}</AvatarFallback>
                </Avatar>
                <div>
                    <p className="font-semibold text-sm">{userProfile?.username || "Anonymous"}</p>
                    <p className="text-xs text-muted-foreground">{formatDistanceToNow(new Date(entry.createdAt.seconds * 1000), { addSuffix: true })}</p>
                </div>
            </div>
            {entry.textContent && <p className="text-primary-foreground mb-3 flex-grow">{entry.textContent}</p>}
            {entry.contentUrl && (
                 <div className="relative aspect-square w-full rounded-md overflow-hidden mt-auto">
                    <Image src={entry.contentUrl} alt="Challenge submission" fill className="object-cover" />
                </div>
            )}
            <div className="mt-3 pt-3 border-t border-border/60 flex flex-wrap gap-x-3 gap-y-1 text-xs items-center">
                 <div className="flex items-center gap-1.5" title="Sparks">
                    <Flame className="w-3 h-3 text-orange-500"/>
                    <span>{reactions.spark || 0}</span>
                </div>
                 <div className="flex items-center gap-1.5" title="Bright Ideas">
                    <Lightbulb className="w-3 h-3 text-yellow-400"/>
                    <span>{reactions.brightIdea || 0}</span>
                </div>
                 <div className="flex items-center gap-1.5" title="Support">
                    <Handshake className="w-3 h-3 text-blue-400"/>
                    <span>{reactions.support || 0}</span>
                </div>
                 <div className="flex items-center gap-1.5" title="Gold">
                    <Star className="w-3 h-3 text-amber-400"/>
                    <span>{reactions.gold || 0}</span>
                </div>
                 <div className="flex items-center gap-1.5" title="Grows">
                    <Leaf className="w-3 h-3 text-green-500"/>
                    <span>{reactions.grow || 0}</span>
                </div>
            </div>
        </div>
    )
}


function SubmissionForm({ challengeId, submissionType }: { challengeId: string, submissionType: Challenge['submissionType']}) {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [textContent, setTextContent] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!user || !firestore) {
      toast({ variant: 'destructive', title: 'Not logged in' });
      return;
    }
    if ((submissionType === 'photo' || submissionType === 'video') && !file) {
        toast({ variant: 'destructive', title: 'File required', description: 'Please select a file to upload.' });
        return;
    }
    if (submissionType === 'text' && !textContent.trim()) {
        toast({ variant: 'destructive', title: 'Text required', description: 'Please write something for your submission.' });
        return;
    }

    setIsSubmitting(true);

    const entriesCollection = collection(firestore, 'challenges', challengeId, 'entries');
    
    // This is a simplified upload. In a real app, you'd upload to Firebase Storage
    // and save the URL. For this prototype, we'll use a base64 data URL.
    let contentUrl: string | undefined;
    if (file) {
        contentUrl = await new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target?.result as string);
            reader.readAsDataURL(file);
        });
    }

    try {
      await addDocumentNonBlocking(entriesCollection, {
        challengeId,
        userId: user.uid,
        textContent: textContent || null,
        contentUrl: contentUrl || null,
        createdAt: serverTimestamp(),
        reactions: { spark: 0, brightIdea: 0, support: 0, gold: 0, grow: 0 },
      });
      toast({ title: 'Entry Submitted!', description: 'Your submission is now in the gallery.' });
      setTextContent('');
      setFile(null);
    } catch (error) {
      console.error('Error submitting entry:', error);
      toast({ variant: 'destructive', title: 'Submission Failed' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-secondary/50 p-4 rounded-lg border border-border/60 space-y-4">
        <h3 className="font-semibold text-lg">Submit Your Entry</h3>
        {submissionType === 'text' && (
            <Textarea 
                value={textContent}
                onChange={e => setTextContent(e.target.value)}
                placeholder="Write your entry here..."
                className="bg-background"
            />
        )}
        {(submissionType === 'photo' || submissionType === 'video') && (
            <div className="flex items-center justify-center w-full">
                <label htmlFor="file-upload" className="flex flex-col items-center justify-center w-full h-32 border-2 border-border border-dashed rounded-lg cursor-pointer bg-background hover:bg-secondary/80">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Upload className="w-8 h-8 mb-2 text-muted-foreground" />
                        <p className="mb-2 text-sm text-muted-foreground">
                            {file ? `Selected: ${file.name}` : `Click to upload ${submissionType}`}
                        </p>
                    </div>
                    <input id="file-upload" type="file" className="hidden" onChange={(e) => setFile(e.target.files?.[0] || null)} accept={submissionType === 'photo' ? 'image/*' : 'video/*'} />
                </label>
            </div> 
        )}
        <Button onClick={handleSubmit} disabled={isSubmitting} className="w-full">
            {isSubmitting ? 'Submitting...' : 'Submit'}
        </Button>
    </div>
  )
}

export default function ChallengeDetailsPage({ params }: { params: { gameId: string } }) {
  const { gameId: challengeId } = params;
  const firestore = useFirestore();
  const router = useRouter();

  const challengeRef = useMemoFirebase(() => {
    if (!firestore || !challengeId) return null;
    return doc(firestore, 'challenges', challengeId as string);
  }, [firestore, challengeId]);

  const entriesQuery = useMemoFirebase(() => {
    if (!firestore || !challengeId) return null;
    return query(collection(firestore, 'challenges', challengeId as string, 'entries'), orderBy('createdAt', 'desc'));
  }, [firestore, challengeId]);

  const { data: challenge, isLoading: isChallengeLoading } = useDoc<Challenge>(challengeRef);
  const { data: entries, isLoading: areEntriesLoading } = useCollection<ChallengeEntry>(entriesQuery);

  const isLoading = isChallengeLoading || areEntriesLoading;

  const isDeadlinePassed = challenge && new Date(challenge.deadline.seconds * 1000) < new Date();

  return (
    <div className="flex flex-col min-h-screen">
       <header className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b border-border/80 bg-secondary/80 px-4 backdrop-blur-sm sm:px-6">
        <button onClick={() => router.back()} className="flex items-center gap-2">
            <ArrowLeft className="h-6 w-6" />
        </button>
        <h1 className="text-xl font-bold truncate">{challenge?.title || 'Challenge'}</h1>
      </header>

      <main className="flex-1 grid md:grid-cols-3 overflow-hidden">
        {/* Main Content: Challenge Info & Submissions */}
        <div className="md:col-span-2 flex flex-col overflow-y-auto p-4 sm:p-6 space-y-6">
          {isChallengeLoading && <Skeleton className="w-full aspect-video rounded-xl" />}
          {challenge && (
            <div className="space-y-4">
               <ChallengeCard challenge={challenge} />
               
                {!isDeadlinePassed && <SubmissionForm challengeId={challenge.id} submissionType={challenge.submissionType} /> }
                {isDeadlinePassed && (
                    <div className="bg-card p-4 rounded-lg border border-border/60 text-center">
                        <Trophy className="h-8 w-8 mx-auto text-primary" />
                        <h3 className="font-semibold text-lg mt-2">This challenge has ended.</h3>
                        <p className="text-muted-foreground text-sm">Voting is now open! Winners will be announced soon.</p>
                    </div>
                )}
               
               <h2 className="text-xl font-bold pt-4 border-t border-border/60">Submission Gallery</h2>
               <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {areEntriesLoading && Array.from({length: 3}).map((_,i) => <Skeleton key={i} className="aspect-square w-full rounded-xl"/>)}
                    {entries?.map(entry => (
                        <EntryCard key={entry.id} entry={entry} />
                    ))}
                    {entries && entries.length === 0 && !areEntriesLoading && (
                        <p className="col-span-full text-center text-muted-foreground py-8">No entries submitted yet. Be the first!</p>
                    )}
               </div>
            </div>
          )}
        </div>

        {/* Sidebar: Chat */}
        <div className="md:col-span-1 flex flex-col bg-card border-t md:border-t-0 md:border-l border-border/60">
            {challengeId && <ChatPanel chatId={`challenge_${challengeId}`} />}
        </div>
      </main>
    </div>
  );
}
