
'use client';

import { useDoc, useFirestore, useMemoFirebase, useUser, updateDocumentNonBlocking } from '@/firebase';
import { doc, arrayUnion, arrayRemove } from 'firebase/firestore';
import type { Stream, User } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { ChatPanel } from '@/components/chat-panel';
import { ArrowLeft, Mic, UserPlus, Users, Video, Headphones, Download } from 'lucide-react';
import { AudioDownloadDialog } from '@/components/audio-download-dialog';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

function CoStreamerList({ userIds }: { userIds: string[] }) {
    if (!userIds || userIds.length === 0) {
        return <p className="text-sm text-muted-foreground">No co-streamers yet.</p>;
    }
    // In a real app, you'd fetch profiles for these IDs
    return (
        <div className="flex -space-x-2 overflow-hidden">
            {userIds.map(id => (
                 <Avatar key={id} className="inline-block h-8 w-8 rounded-full ring-2 ring-background">
                    <AvatarFallback>{id.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
            ))}
        </div>
    );
}

export default function StreamDetailsPage({ params }: { params: { streamId: string } }) {
  const { streamId } = params;
  const firestore = useFirestore();
  const router = useRouter();
  const { user } = useUser();
  const { toast } = useToast();

  const streamRef = useMemoFirebase(() => {
    if (!firestore || !streamId) return null;
    return doc(firestore, 'streams', streamId as string);
  }, [firestore, streamId]);

  const { data: stream, isLoading } = useDoc<Stream>(streamRef);

  const isOwner = user && stream && user.uid === stream.userId;
  const canRequest = stream && stream.allowCoStreaming;
  const hasRequested = user && stream?.joinRequests?.includes(user.uid);

  const handleRequestToJoin = () => {
    if (!user || !streamRef || hasRequested) return;
    updateDocumentNonBlocking(streamRef, {
        joinRequests: arrayUnion(user.uid)
    });
    toast({ title: "Request Sent!", description: "The streamer has been notified of your request to join."});
  };

  const handleAcceptRequest = (requestingUserId: string) => {
     if (!streamRef) return;
     updateDocumentNonBlocking(streamRef, {
        coStreamerIds: arrayUnion(requestingUserId),
        joinRequests: arrayRemove(requestingUserId)
     });
     toast({ title: "Co-streamer Added!", description: `${requestingUserId} can now join the stream.`});
  }

  const handleRemoveCoStreamer = (coStreamerId: string) => {
    if (!streamRef) return;
    updateDocumentNonBlocking(streamRef, {
        coStreamerIds: arrayRemove(coStreamerId)
    });
    toast({ title: "Co-streamer Removed."});
  }


  return (
    <div className="flex flex-col h-screen">
       <header className="sticky top-0 z-40 flex h-16 items-center justify-between gap-4 border-b border-border/80 bg-secondary/80 px-4 backdrop-blur-sm sm:px-6 shrink-0">
        <button onClick={() => router.back()} className="flex items-center gap-2">
            <ArrowLeft className="h-6 w-6" />
        </button>
        <h1 className="text-xl font-bold truncate">{stream?.title || 'Stream'}</h1>
        
        {isOwner && (
             <Sheet>
                <SheetTrigger asChild>
                    <Button variant="outline"><Users className="mr-2 h-4 w-4"/> Manage</Button>
                </SheetTrigger>
                <SheetContent className="bg-secondary border-border">
                    <SheetHeader>
                        <SheetTitle>Manage Co-streamers</SheetTitle>
                        <SheetDescription>
                           Accept requests from viewers who want to join your stream.
                        </SheetDescription>
                    </SheetHeader>
                    <div className="py-4 space-y-6">
                        <div>
                            <h3 className="font-semibold mb-2">Join Requests</h3>
                            {stream?.joinRequests && stream.joinRequests.length > 0 ? (
                                <div className="space-y-2">
                                    {stream.joinRequests.map(uid => (
                                        <div key={uid} className="flex items-center justify-between bg-card p-2 rounded-md">
                                            <span className="text-sm font-medium truncate">User: {uid.substring(0, 6)}...</span>
                                            <Button size="sm" onClick={() => handleAcceptRequest(uid)}>Accept</Button>
                                        </div>
                                    ))}
                                </div>
                            ) : <p className="text-sm text-muted-foreground">No pending requests.</p>}
                        </div>
                         <div>
                            <h3 className="font-semibold mb-2">Current Co-streamers</h3>
                             {stream?.coStreamerIds && stream.coStreamerIds.length > 0 ? (
                                <div className="space-y-2">
                                    {stream.coStreamerIds.map(uid => (
                                        <div key={uid} className="flex items-center justify-between bg-card p-2 rounded-md">
                                            <span className="text-sm font-medium truncate">User: {uid.substring(0, 6)}...</span>
                                            <Button size="sm" variant="destructive" onClick={() => handleRemoveCoStreamer(uid)}>Remove</Button>
                                        </div>
                                    ))}
                                </div>
                            ) : <p className="text-sm text-muted-foreground">No co-streamers.</p>}
                        </div>
                    </div>
                </SheetContent>
            </Sheet>
        )}
      </header>
      
      <main className="flex-1 grid md:grid-cols-3 overflow-hidden">
        {/* Main Content: Video */}
        <div className="md:col-span-2 flex flex-col bg-black overflow-y-auto">
          <div className="w-full aspect-video bg-muted flex items-center justify-center relative">
            <p className="text-muted-foreground">Stream video would be here</p>
             <div className="absolute bottom-4 left-4 flex gap-2">
                {stream?.coStreamerIds?.map(id => (
                     <div key={id} className="h-24 aspect-video bg-card rounded-md border-2 border-primary flex items-center justify-center text-sm">
                        <Video className="w-6 h-6"/>
                    </div>
                ))}
            </div>
          </div>
          <div className="p-4 space-y-4">
              <h2 className="text-xl font-bold">{stream?.title}</h2>
              <p className="text-sm text-muted-foreground">{stream?.description || "No description provided."}</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-primary"/>
                    <h3 className="font-semibold">Co-streamers</h3>
                    <CoStreamerList userIds={stream?.coStreamerIds || []} />
                </div>
                {!isOwner && canRequest && (
                    <Button onClick={handleRequestToJoin} disabled={hasRequested}>
                        <UserPlus className="mr-2 h-4 w-4" />
                        {hasRequested ? 'Request Sent' : 'Request to Join'}
                    </Button>
                )}
              </div>
              
              {!stream?.live && stream?.allowAudioDownload !== false && stream && (
                <div className="p-4 bg-secondary rounded-lg flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-full">
                      <Headphones className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm">Audio Download Available</p>
                      <p className="text-xs text-muted-foreground">Extract the audio track from this stream</p>
                    </div>
                  </div>
                  <AudioDownloadDialog item={stream} itemType="stream" />
                </div>
              )}
          </div>
        </div>

        {/* Sidebar: Chat */}
        <div className="md:col-span-1 flex flex-col bg-card border-t md:border-t-0 md:border-l border-border/60">
            {streamId && <ChatPanel chatId={`stream_${streamId}`} />}
        </div>
      </main>
    </div>
  );
}

    