'use client';

import { useState } from 'react';
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
import { RadioTower, WandSparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useUser } from "@/lib/supabase/provider";
import { useSupabase, useDoc } from "@/lib/supabase/hooks";
import { findLocation } from "@/ai/flows/find-location";
import { add } from "date-fns";
import { mapDbUserToUser } from "@/lib/types";
import { useMemo } from "react";

export function ActivateBeaconDialog() {
  const { toast } = useToast();
  const supabase = useSupabase();
  const { user } = useUser();

  const [purpose, setPurpose] = useState("");
  const [location, setLocation] = useState("");

  const [isActivating, setIsActivating] = useState(false);
  const [isFindingLocation, setIsFindingLocation] = useState(false);
  const [open, setOpen] = useState(false);

  const { data: rawUserProfile } = useDoc<any>(
    user ? 'users' : null,
    user?.id
  );

  const userProfile = useMemo(() => {
    if (!rawUserProfile) return null;
    return mapDbUserToUser(rawUserProfile);
  }, [rawUserProfile]);

  const handleFindLocation = async () => {
    if (!userProfile?.location && !location) {
      toast({ variant: 'destructive', title: 'Location needed', description: 'Please type a location to search for, or set one in your profile.' });
      return;
    }
    const query = location || userProfile?.location || '';
    setIsFindingLocation(true);
    try {
      const result = await findLocation({ query });
      if (result.formattedLocation) {
        setLocation(result.formattedLocation);
        toast({ title: 'Location Found!', description: `Set location to ${result.formattedLocation}` });
      } else {
        toast({ variant: 'destructive', title: 'Location not found' });
      }
    } catch (error) {
      console.error("Error finding location:", error);
      toast({ variant: 'destructive', title: 'Error', description: 'Could not find location.' });
    } finally {
      setIsFindingLocation(false);
    }
  };

  const handleActivateBeacon = async () => {
    if (!user || !supabase) {
      toast({ variant: "destructive", title: "Not logged in" });
      return;
    }
    if (!purpose || !location) {
      toast({ variant: "destructive", title: "Missing fields", description: "Please fill out all fields." });
      return;
    }
    setIsActivating(true);

    try {
      const { error } = await supabase
        .from('beacons')
        .insert({
          creator_id: user.id,
          purpose,
          location,
          expires_at: add(new Date(), { hours: 1 }).toISOString(),
          participant_ids: [user.id],
        });

      if (error) throw error;

      toast({ title: "Beacon Activated!", description: "Your beacon is now visible to nearby users." });
      setOpen(false);
      setPurpose('');
      setLocation('');
    } catch (error) {
      console.error("Error activating beacon:", error);
      toast({ variant: "destructive", title: "Activation failed" });
    } finally {
      setIsActivating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          <RadioTower className="mr-2 h-4 w-4" />
          Activate Beacon
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-secondary border-border">
        <DialogHeader>
          <DialogTitle>Activate a Beacon</DialogTitle>
          <DialogDescription>
            Create a spontaneous meetup. Your beacon will be active for one hour.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="purpose">Purpose</Label>
            <Input
              id="purpose"
              placeholder="e.g., 'Grabbing coffee', 'Dog walk at the park'"
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              className="bg-background"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="location">Location</Label>
            <div className="flex gap-2">
              <Input
                id="location"
                placeholder="e.g., 'Central Park' or your profile location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="bg-background"
              />
              <Button variant="outline" size="icon" onClick={handleFindLocation} disabled={isFindingLocation} className="border-primary text-primary hover:bg-primary hover:text-primary-foreground flex-shrink-0">
                <WandSparkles className={`h-4 w-4 ${isFindingLocation ? 'animate-spin' : ''}`} />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Defaults to your profile location if left blank.
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button type="submit" onClick={handleActivateBeacon} disabled={isActivating}>
            {isActivating ? 'Activating...' : 'Activate for 1 Hour'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
