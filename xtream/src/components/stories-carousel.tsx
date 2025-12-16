'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { useUser } from "@/lib/supabase/provider";
import { Plus, ChevronLeft, ChevronRight, X, Heart, Send, Eye } from 'lucide-react';
import Link from 'next/link';

const STORY_DURATION = 5000;

type Story = {
  id: string;
  userId: string;
  imageUrl: string;
  caption?: string;
  createdAt: any;
  expiresAt: any;
  viewerIds: string[];
};

type UserWithStories = {
  userId: string;
  username: string;
  profilePictureUrl: string;
  hasUnseenStory: boolean;
  stories: Story[];
};

function StoryRing({ user, onClick, hasUnseenStory }: {
  user: UserWithStories;
  onClick: () => void;
  hasUnseenStory: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center gap-1 min-w-[72px]"
    >
      <div className={`p-[2px] rounded-full ${hasUnseenStory ? 'bg-gradient-to-tr from-primary via-accent to-primary' : 'bg-border'}`}>
        <div className="p-[2px] bg-background rounded-full">
          <Avatar className="h-14 w-14">
            <AvatarImage src={user.profilePictureUrl} alt={user.username} />
            <AvatarFallback>{user.username?.charAt(0)?.toUpperCase() || 'U'}</AvatarFallback>
          </Avatar>
        </div>
      </div>
      <span className="text-xs truncate max-w-[64px]">{user.username}</span>
    </button>
  );
}

function AddStoryButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center gap-1 min-w-[72px]"
    >
      <div className="relative p-[2px] rounded-full bg-border">
        <div className="p-[2px] bg-background rounded-full">
          <div className="h-14 w-14 rounded-full bg-secondary flex items-center justify-center">
            <Plus className="h-6 w-6 text-primary" />
          </div>
        </div>
      </div>
      <span className="text-xs">Add Story</span>
    </button>
  );
}

function StoryViewer({
  stories,
  initialIndex,
  onClose
}: {
  stories: UserWithStories[];
  initialIndex: number;
  onClose: () => void;
}) {
  const [currentUserIndex, setCurrentUserIndex] = useState(initialIndex);
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const currentUser = stories[currentUserIndex];
  const currentStory = currentUser?.stories[currentStoryIndex];

  const goToNextStory = useCallback(() => {
    if (!currentUser) return;

    if (currentStoryIndex < currentUser.stories.length - 1) {
      setCurrentStoryIndex(prev => prev + 1);
      setProgress(0);
    } else if (currentUserIndex < stories.length - 1) {
      setCurrentUserIndex(prev => prev + 1);
      setCurrentStoryIndex(0);
      setProgress(0);
    } else {
      onClose();
    }
  }, [currentUser, currentStoryIndex, currentUserIndex, stories.length, onClose]);

  const goToPrevStory = useCallback(() => {
    if (currentStoryIndex > 0) {
      setCurrentStoryIndex(prev => prev - 1);
      setProgress(0);
    } else if (currentUserIndex > 0) {
      setCurrentUserIndex(prev => prev - 1);
      const prevUser = stories[currentUserIndex - 1];
      setCurrentStoryIndex(prevUser.stories.length - 1);
      setProgress(0);
    }
  }, [currentStoryIndex, currentUserIndex, stories]);

  useEffect(() => {
    if (isPaused) return;

    const progressStep = 100 / (STORY_DURATION / 50);

    progressIntervalRef.current = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          return prev;
        }
        return prev + progressStep;
      });
    }, 50);

    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, [currentStoryIndex, currentUserIndex, isPaused]);

  useEffect(() => {
    if (progress >= 100) {
      goToNextStory();
    }
  }, [progress, goToNextStory]);

  useEffect(() => {
    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, []);

  const handleTouchStart = () => setIsPaused(true);
  const handleTouchEnd = () => setIsPaused(false);

  if (!currentStory || !currentUser) return null;

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-md h-[90vh] p-0 bg-black border-none overflow-hidden">
        <div className="relative h-full flex flex-col">
          <div className="absolute top-0 left-0 right-0 z-20 p-2 flex gap-1">
            {currentUser.stories.map((_, idx) => (
              <div key={idx} className="flex-1 h-1 rounded-full bg-white/30 overflow-hidden">
                <div
                  className="h-full bg-white transition-all duration-100"
                  style={{
                    width: idx < currentStoryIndex ? '100%' :
                      idx === currentStoryIndex ? `${progress}%` : '0%'
                  }}
                />
              </div>
            ))}
          </div>

          <div className="absolute top-6 left-0 right-0 z-20 p-3 flex items-center justify-between">
            <Link href={`/profile/${currentUser.userId}`} className="flex items-center gap-2">
              <Avatar className="h-8 w-8 ring-2 ring-primary">
                <AvatarImage src={currentUser.profilePictureUrl} />
                <AvatarFallback>{currentUser.username?.charAt(0)}</AvatarFallback>
              </Avatar>
              <span className="text-white font-semibold text-sm">{currentUser.username}</span>
            </Link>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="text-white hover:bg-white/20"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          <div
            className="flex-1 bg-cover bg-center"
            style={{ backgroundImage: `url(${currentStory.imageUrl || 'https://picsum.photos/400/700'})` }}
            onMouseDown={handleTouchStart}
            onMouseUp={handleTouchEnd}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            <div className="absolute inset-0 flex">
              <button
                className="w-1/3 h-full"
                onClick={goToPrevStory}
              />
              <div className="w-1/3" />
              <button
                className="w-1/3 h-full"
                onClick={goToNextStory}
              />
            </div>
          </div>

          {currentStory.caption && (
            <div className="absolute bottom-20 left-0 right-0 p-4">
              <p className="text-white text-center text-sm bg-black/50 rounded-lg p-2">
                {currentStory.caption}
              </p>
            </div>
          )}

          <div className="absolute bottom-0 left-0 right-0 p-4 flex items-center gap-2 bg-gradient-to-t from-black/80 to-transparent">
            <input
              type="text"
              placeholder="Reply to story..."
              className="flex-1 bg-white/10 border border-white/20 rounded-full px-4 py-2 text-white text-sm placeholder:text-white/50"
            />
            <Button variant="ghost" size="icon" className="text-white hover:bg-white/20">
              <Heart className="h-6 w-6" />
            </Button>
            <Button variant="ghost" size="icon" className="text-white hover:bg-white/20">
              <Send className="h-6 w-6" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function StoriesCarousel() {
  const { user } = useUser();
  const [viewingStories, setViewingStories] = useState(false);
  const [selectedUserIndex, setSelectedUserIndex] = useState(0);

  const mockStoriesUsers: UserWithStories[] = [
    {
      userId: '1',
      username: 'DJ_Max',
      profilePictureUrl: 'https://picsum.photos/seed/user1/100',
      hasUnseenStory: true,
      stories: [
        { id: '1', userId: '1', imageUrl: 'https://picsum.photos/seed/story1/400/700', caption: 'Live from the club!', createdAt: null, expiresAt: null, viewerIds: [] },
        { id: '2', userId: '1', imageUrl: 'https://picsum.photos/seed/story2/400/700', caption: 'New set dropping tonight', createdAt: null, expiresAt: null, viewerIds: [] },
      ]
    },
    {
      userId: '2',
      username: 'MusicVibes',
      profilePictureUrl: 'https://picsum.photos/seed/user2/100',
      hasUnseenStory: true,
      stories: [
        { id: '3', userId: '2', imageUrl: 'https://picsum.photos/seed/story3/400/700', caption: 'Studio session', createdAt: null, expiresAt: null, viewerIds: [] },
      ]
    },
    {
      userId: '3',
      username: 'EventKing',
      profilePictureUrl: 'https://picsum.photos/seed/user3/100',
      hasUnseenStory: false,
      stories: [
        { id: '4', userId: '3', imageUrl: 'https://picsum.photos/seed/story4/400/700', createdAt: null, expiresAt: null, viewerIds: [] },
      ]
    },
  ];

  const handleStoryClick = (index: number) => {
    setSelectedUserIndex(index);
    setViewingStories(true);
  };

  const handleAddStory = () => {
    console.log('Add story clicked');
  };

  return (
    <div className="w-full">
      <div className="flex gap-3 overflow-x-auto py-2 px-1 scrollbar-hide">
        <AddStoryButton onClick={handleAddStory} />
        {mockStoriesUsers.map((user, idx) => (
          <StoryRing
            key={user.userId}
            user={user}
            hasUnseenStory={user.hasUnseenStory}
            onClick={() => handleStoryClick(idx)}
          />
        ))}
      </div>

      {viewingStories && (
        <StoryViewer
          stories={mockStoriesUsers}
          initialIndex={selectedUserIndex}
          onClose={() => setViewingStories(false)}
        />
      )}
    </div>
  );
}
