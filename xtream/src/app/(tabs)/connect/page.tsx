
'use client';

import { Button } from "@/components/ui/button";
import { EventCard } from "@/components/event-card";
import { Plus, Search, RadioTower, CalendarDays, Users, Radio, MapPin, WifiOff } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { useCollection, useFirestore, useMemoFirebase, useUser } from "@/firebase";
import { collection, query, orderBy, where, Timestamp, getDocs } from 'firebase/firestore';
import type { Event, Beacon, User } from '@/lib/types';
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { ActivateBeaconDialog } from "@/components/activate-beacon-dialog";
import { BeaconCard } from "@/components/beacon-card";
import { LogoIcon } from "@/components/icons/logo";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { UserCard } from "@/components/user-card";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";


export default function ConnectPage() {
  const firestore = useFirestore();
  const { user } = useUser();
  const { toast } = useToast();
  const now = Timestamp.now();
  
  const [nearbyState, setNearbyState] = useState<{
    users: User[];
    isLoading: boolean;
    error: string | null;
  }>({ users: [], isLoading: false, error: null });


  const eventsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'events'), orderBy('startTime', 'desc'));
  }, [firestore]);

  const beaconsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(
      collection(firestore, 'beacons'),
      where('expiresAt', '>', now),
      orderBy('expiresAt', 'asc')
    );
  }, [firestore, now]);

  const { data: events, isLoading: isLoadingEvents } = useCollection<Event>(eventsQuery);
  const { data: beacons, isLoading: isLoadingBeacons } = useCollection<Beacon>(beaconsQuery);
  
  const enrichedEvents = events?.map(event => ({
    ...event,
    type: 'virtual' as 'virtual' | 'in-person',
    isInvitation: false,
    category: event.eventType
  }));

  const invitations = enrichedEvents?.filter(e => e.isInvitation) || [];
  const otherEvents = enrichedEvents?.filter(e => !e.isInvitation) || [];

  const handleFindNearby = async () => {
    setNearbyState({ users: [], isLoading: true, error: null });
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    try {
      const response = await fetch('/api/nearby/ip', { signal: controller.signal });
      clearTimeout(timeoutId);

      if (!response.ok) {
        const data = await response.json().catch(() => ({ error: 'An unknown error occurred.' }));
        throw new Error(data.error || 'Failed to find nearby users.');
      }
      
      const data = await response.json();
      const nearbyUsers = data.users.filter((u: User) => u.id !== user?.uid);
      setNearbyState({ users: nearbyUsers, isLoading: false, error: null });

      if (nearbyUsers.length === 0) {
        toast({ title: "No users found", description: "No one on your network has discovery enabled." });
      }

    } catch (error: any) {
      clearTimeout(timeoutId);
      if (error.name === 'AbortError') {
        setNearbyState({ users: [], isLoading: false, error: "Search timed out. Please try again." });
      } else {
        console.error("Error finding nearby users:", error);
        setNearbyState({ users: [], isLoading: false, error: error.message });
      }
    }
  };


  return (
    <div className="flex flex-col">
      <header className="sticky top-0 z-40 flex h-16 items-center justify-between gap-4 border-b border-border/80 bg-secondary/80 px-4 backdrop-blur-sm sm:px-6">
        <Link href="/" passHref>
            <div className="flex items-center gap-2 cursor-pointer">
                <LogoIcon width={32} height={32} />
                <span className="text-2xl font-headline gradient-text">
                Xtream
                </span>
            </div>
        </Link>
        <div className="flex items-center gap-2">
            <ActivateBeaconDialog />
            <Link href="/connect/create" passHref>
                <Button size="sm" className="hidden sm:flex">
                    <Plus className="mr-2 h-4 w-4" />
                    Create
                </Button>
            </Link>
             <Link href="/connect/create" passHref>
                <Button size="icon" variant="outline" className="sm:hidden">
                    <Plus className="h-4 w-4" />
                </Button>
            </Link>
        </div>
      </header>
       <div className="p-4 sm:p-6">
        <Tabs defaultValue="events" className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-secondary mb-6">
            <TabsTrigger value="nearby" className="gap-2"><MapPin className="w-4 h-4"/> Nearby</TabsTrigger>
            <TabsTrigger value="beacons" className="gap-2"><RadioTower className="w-4 h-4"/> Beacons</TabsTrigger>
            <TabsTrigger value="events" className="gap-2"><CalendarDays className="w-4 h-4"/> Events</TabsTrigger>
            <TabsTrigger value="groups" className="gap-2"><Users className="w-4 h-4"/> Groups</TabsTrigger>
          </TabsList>
           <TabsContent value="nearby">
            <div className="text-center py-10 px-4 rounded-lg bg-card border border-border/60 flex flex-col items-center">
                <Users className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-semibold">Find People on Your Network</h3>
                <p className="mt-2 text-sm text-muted-foreground max-w-sm">
                    Discover other Xtream users on the same Wi-Fi network as you. You can control your visibility in your profile settings.
                </p>
                <Button onClick={handleFindNearby} disabled={nearbyState.isLoading} className="mt-6">
                    <Search className="mr-2 h-4 w-4" />
                    {nearbyState.isLoading ? 'Searching...' : 'Find Nearby Users'}
                </Button>
            </div>
            
            {nearbyState.error && (
                <Alert variant="destructive" className="mt-6">
                    <WifiOff className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{nearbyState.error}</AlertDescription>
                </Alert>
            )}

            {!nearbyState.isLoading && nearbyState.users.length > 0 && (
                 <div className="mt-6">
                    <h2 className="text-xl font-bold mb-4 text-center">Found {nearbyState.users.length} user(s)</h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {nearbyState.users.map(u => <UserCard key={u.id} user={u}/>)}
                    </div>
                </div>
            )}
           </TabsContent>
          <TabsContent value="beacons">
             <div className="flex flex-col gap-4">
                {isLoadingBeacons && (
                  <div className="flex flex-col gap-4">
                    <Skeleton className="h-28 w-full rounded-xl" />
                    <Skeleton className="h-28 w-full rounded-xl" />
                  </div>
                )}
                {beacons?.map((beacon) => (
                    <BeaconCard key={beacon.id} beacon={beacon} />
                ))}
                {beacons && beacons.length === 0 && !isLoadingBeacons && (
                    <div className="text-center py-10">
                        <RadioTower className="mx-auto h-12 w-12 text-muted-foreground" />
                        <h3 className="mt-4 text-lg font-semibold">No Active Beacons</h3>
                        <p className="mt-2 text-sm text-muted-foreground">
                            Activate a beacon to start a spontaneous local meetup.
                        </p>
                    </div>
                )}
             </div>
          </TabsContent>
          <TabsContent value="events">
            <div className="flex flex-col gap-8">
              {isLoadingEvents && (
                  <div className="flex flex-col gap-4">
                    <Skeleton className="h-32 w-full rounded-xl" />
                    <Skeleton className="h-32 w-full rounded-xl" />
                  </div>
              )}
              {invitations.length > 0 && (
                <section>
                  <h2 className="text-lg font-semibold text-primary-foreground mb-4">Your Invitations ({invitations.length})</h2>
                  <div className="flex flex-col gap-4">
                  {invitations.map((event) => (
                    <EventCard key={event.id} event={event} />
                  ))}
                  </div>
                </section>
              )}
               <section>
                  <h2 className="text-lg font-semibold text-primary-foreground mb-4">Near You & Virtual</h2>
                  <div className="flex flex-col gap-4">
                  {otherEvents.map((event) => (
                    <EventCard key={event.id} event={event} />
                  ))}
                   {events && events.length === 0 && !isLoadingEvents && (
                    <p className="text-center text-muted-foreground">No events scheduled. Why not create one?</p>
                  )}
                  </div>
                </section>
            </div>
          </TabsContent>
          <TabsContent value="groups">
            <div className="space-y-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input placeholder="Search Groups..." className="pl-10 bg-card" />
              </div>
              <p className="text-center text-muted-foreground">Discover and create groups.</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
