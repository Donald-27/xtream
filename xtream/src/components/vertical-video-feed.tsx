'use client';

import { useState, useRef, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Heart, MessageCircle, Share2, Music, Bookmark, Headphones, Play, Pause, Volume2, VolumeX } from 'lucide-react';
import { AudioDownloadDialog } from "./audio-download-dialog";
import { useToast } from "@/hooks/use-toast";
import type { Post } from '@/lib/types';
import Link from 'next/link';

type VerticalVideo = {
  id: string;
  videoUrl: string;
  thumbnailUrl: string;
  title: string;
  creatorId: string;
  creatorName: string;
  creatorAvatar: string;
  likes: number;
  comments: number;
  shares: number;
  music?: string;
  isLiked?: boolean;
  isSaved?: boolean;
};

function VideoCard({ video, isActive }: { video: VerticalVideo; isActive: boolean }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [isLiked, setIsLiked] = useState(video.isLiked || false);
  const [isSaved, setIsSaved] = useState(video.isSaved || false);
  const [likes, setLikes] = useState(video.likes);
  const { toast } = useToast();

  const hasValidVideoUrl = Boolean(video.videoUrl && video.videoUrl.trim() !== '');

  useEffect(() => {
    if (videoRef.current) {
      if (isActive) {
        videoRef.current.play().catch(() => {});
        setIsPlaying(true);
      } else {
        videoRef.current.pause();
        setIsPlaying(false);
      }
    }
  }, [isActive]);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikes(prev => isLiked ? prev - 1 : prev + 1);
  };

  const handleSave = () => {
    setIsSaved(!isSaved);
    toast({
      title: isSaved ? "Removed from saved" : "Saved!",
      description: isSaved ? "Video removed from your collection" : "Video added to your collection",
    });
  };

  const handleComment = () => {
    toast({
      title: "Comments",
      description: "Comments feature coming soon!",
    });
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: video.title,
        text: `Check out this video by @${video.creatorName}`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Link Copied!",
        description: "Video link copied to clipboard",
      });
    }
  };

  const handleAudioDownload = () => {
    if (!hasValidVideoUrl) {
      toast({
        title: "Audio Unavailable",
        description: "No audio source available for this video",
        variant: "destructive",
      });
      return;
    }
    toast({
      title: "Audio Download",
      description: "Preparing audio extraction...",
    });
  };

  const formatCount = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  return (
    <div className="relative h-full w-full bg-black snap-start">
      <video
        ref={videoRef}
        src={video.videoUrl}
        poster={video.thumbnailUrl}
        loop
        muted={isMuted}
        playsInline
        className="h-full w-full object-cover"
        onClick={togglePlay}
      />

      {!isPlaying && (
        <button 
          onClick={togglePlay}
          className="absolute inset-0 flex items-center justify-center bg-black/20"
        >
          <div className="p-4 bg-white/20 rounded-full backdrop-blur-sm">
            <Play className="h-12 w-12 text-white" fill="white" />
          </div>
        </button>
      )}

      <div className="absolute right-3 bottom-24 flex flex-col items-center gap-4">
        <Link href={`/profile/${video.creatorId}`}>
          <Avatar className="h-12 w-12 ring-2 ring-white">
            <AvatarImage src={video.creatorAvatar} />
            <AvatarFallback>{video.creatorName?.charAt(0)}</AvatarFallback>
          </Avatar>
        </Link>
        
        <button 
          onClick={handleLike}
          className="flex flex-col items-center gap-1"
        >
          <div className={`p-2 rounded-full ${isLiked ? 'bg-red-500' : 'bg-black/30 backdrop-blur-sm'}`}>
            <Heart className={`h-7 w-7 ${isLiked ? 'text-white fill-white' : 'text-white'}`} />
          </div>
          <span className="text-white text-xs font-semibold">{formatCount(likes)}</span>
        </button>

        <button 
          onClick={handleComment}
          className="flex flex-col items-center gap-1"
        >
          <div className="p-2 rounded-full bg-black/30 backdrop-blur-sm">
            <MessageCircle className="h-7 w-7 text-white" />
          </div>
          <span className="text-white text-xs font-semibold">{formatCount(video.comments)}</span>
        </button>

        <button 
          onClick={handleSave}
          className="flex flex-col items-center gap-1"
        >
          <div className={`p-2 rounded-full ${isSaved ? 'bg-primary' : 'bg-black/30 backdrop-blur-sm'}`}>
            <Bookmark className={`h-7 w-7 ${isSaved ? 'text-white fill-white' : 'text-white'}`} />
          </div>
          <span className="text-white text-xs font-semibold">Save</span>
        </button>

        <button 
          onClick={handleShare}
          className="flex flex-col items-center gap-1"
        >
          <div className="p-2 rounded-full bg-black/30 backdrop-blur-sm">
            <Share2 className="h-7 w-7 text-white" />
          </div>
          <span className="text-white text-xs font-semibold">{formatCount(video.shares)}</span>
        </button>

        {hasValidVideoUrl && (
          <button 
            onClick={handleAudioDownload}
            className="flex flex-col items-center gap-1"
          >
            <div className="p-2 rounded-full bg-gradient-to-tr from-primary to-accent">
              <Headphones className="h-7 w-7 text-white" />
            </div>
            <span className="text-white text-xs font-semibold">Audio</span>
          </button>
        )}
      </div>

      <div className="absolute left-3 bottom-8 right-16 space-y-2">
        <Link href={`/profile/${video.creatorId}`}>
          <p className="text-white font-bold">@{video.creatorName}</p>
        </Link>
        <p className="text-white text-sm line-clamp-2">{video.title}</p>
        
        {video.music && (
          <div className="flex items-center gap-2 bg-black/30 backdrop-blur-sm rounded-full px-3 py-1 w-fit">
            <Music className="h-4 w-4 text-white animate-spin" style={{ animationDuration: '3s' }} />
            <p className="text-white text-xs truncate max-w-[180px]">{video.music}</p>
          </div>
        )}
      </div>

      <button 
        onClick={toggleMute}
        className="absolute top-4 right-4 p-2 rounded-full bg-black/30 backdrop-blur-sm"
      >
        {isMuted ? (
          <VolumeX className="h-5 w-5 text-white" />
        ) : (
          <Volume2 className="h-5 w-5 text-white" />
        )}
      </button>
    </div>
  );
}

export function VerticalVideoFeed() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const mockVideos: VerticalVideo[] = [
    {
      id: '1',
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4',
      thumbnailUrl: 'https://picsum.photos/seed/vid1/400/700',
      title: 'Epic DJ set from last night! 🔥 The crowd was insane #dj #music #party',
      creatorId: 'user1',
      creatorName: 'DJ_VybMaster',
      creatorAvatar: 'https://picsum.photos/seed/avatar1/100',
      likes: 45200,
      comments: 892,
      shares: 234,
      music: 'Original Sound - DJ_VybMaster',
    },
    {
      id: '2',
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
      thumbnailUrl: 'https://picsum.photos/seed/vid2/400/700',
      title: 'New music production tutorial dropping soon 🎵 #producer #beats',
      creatorId: 'user2',
      creatorName: 'BeatMaker_Pro',
      creatorAvatar: 'https://picsum.photos/seed/avatar2/100',
      likes: 12300,
      comments: 456,
      shares: 89,
      music: 'Chill Beats Vol. 3',
    },
    {
      id: '3',
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
      thumbnailUrl: 'https://picsum.photos/seed/vid3/400/700',
      title: 'Live event vibes! Who was there? 🙌 #concert #livemusic',
      creatorId: 'user3',
      creatorName: 'EventCapture',
      creatorAvatar: 'https://picsum.photos/seed/avatar3/100',
      likes: 8900,
      comments: 234,
      shares: 156,
      music: 'Festival Anthem 2024',
    },
  ];

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const scrollTop = container.scrollTop;
      const itemHeight = container.clientHeight;
      const newIndex = Math.round(scrollTop / itemHeight);
      setCurrentIndex(newIndex);
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div 
      ref={containerRef}
      className="h-[calc(100vh-60px)] overflow-y-scroll snap-y snap-mandatory scrollbar-hide"
    >
      {mockVideos.map((video, idx) => (
        <div key={video.id} className="h-full snap-start">
          <VideoCard video={video} isActive={idx === currentIndex} />
        </div>
      ))}
    </div>
  );
}
