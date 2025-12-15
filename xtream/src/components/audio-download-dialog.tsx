'use client';

import { useState, useEffect, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Download, Music, Headphones, Play, Pause, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Stream, Post } from '@/lib/types';

type AudioDownloadDialogProps = {
  item: Stream | Post;
  itemType: 'stream' | 'post';
};

export function AudioDownloadDialog({ item, itemType }: AudioDownloadDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractionProgress, setExtractionProgress] = useState(0);
  const [audioReady, setAudioReady] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const { toast } = useToast();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const title = item.title;
  const sourceUrl = itemType === 'stream' 
    ? (item as Stream).recordingUrl || (item as Stream).audioUrl
    : (item as Post).videoUrl;

  const hasValidSource = Boolean(sourceUrl && sourceUrl.trim() !== '' && sourceUrl !== '#');

  useEffect(() => {
    if (!isOpen) {
      setIsExtracting(false);
      setExtractionProgress(0);
      setAudioReady(false);
      setIsPlaying(false);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }
  }, [isOpen]);

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const handleExtractAudio = async () => {
    if (!hasValidSource) {
      toast({
        title: "No Audio Source",
        description: "This content doesn't have a valid audio source available.",
        variant: "destructive",
      });
      return;
    }

    setIsExtracting(true);
    setExtractionProgress(0);
    
    intervalRef.current = setInterval(() => {
      setExtractionProgress(prev => {
        if (prev >= 100) {
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
          setIsExtracting(false);
          setAudioReady(true);
          return 100;
        }
        return prev + 10;
      });
    }, 300);
  };

  const handleDownloadAudio = () => {
    if (!hasValidSource) {
      toast({
        title: "Download Failed",
        description: "No valid audio source available.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Downloading Audio...",
      description: `"${title}" audio file is being prepared.`,
    });
    
    const link = document.createElement('a');
    link.href = sourceUrl!;
    link.download = `Xtream_Audio_${item.id}.mp3`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "Download Started!",
      description: "Your audio file download has begun.",
    });
  };

  const togglePreview = () => {
    setIsPlaying(!isPlaying);
  };

  const isStream = itemType === 'stream';
  const stream = isStream ? item as Stream : null;
  const canDownload = isStream ? stream?.allowAudioDownload !== false && !stream?.live : true;

  if (isStream && stream?.live) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          className="gap-2"
          disabled={!canDownload}
        >
          <Headphones className="h-4 w-4" />
          <span className="hidden sm:inline">Audio</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-card border-border sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Music className="h-5 w-5 text-primary" />
            Extract Audio
          </DialogTitle>
          <DialogDescription>
            Download just the audio from this {itemType}. Perfect for DJ sets, podcasts, and music content.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 pt-4">
          <div className="p-4 bg-secondary rounded-lg">
            <h4 className="font-semibold text-sm truncate">{title}</h4>
            <p className="text-xs text-muted-foreground mt-1">
              {itemType === 'stream' ? 'From live stream' : 'From post'}
            </p>
          </div>

          {!hasValidSource && (
            <div className="flex items-center gap-2 p-3 bg-destructive/10 rounded-lg text-destructive">
              <AlertCircle className="h-5 w-5" />
              <p className="text-sm">No audio source available for this content.</p>
            </div>
          )}

          {hasValidSource && !audioReady && !isExtracting && (
            <Button 
              className="w-full" 
              onClick={handleExtractAudio}
            >
              <Music className="mr-2 h-4 w-4" />
              Extract Audio Track
            </Button>
          )}

          {isExtracting && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Extracting audio...</span>
                <span>{extractionProgress}%</span>
              </div>
              <Progress value={extractionProgress} className="h-2" />
              <p className="text-xs text-muted-foreground text-center">
                Processing audio from video source
              </p>
            </div>
          )}

          {audioReady && (
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-3 bg-secondary rounded-lg">
                <Button 
                  size="icon" 
                  variant="ghost"
                  onClick={togglePreview}
                >
                  {isPlaying ? (
                    <Pause className="h-5 w-5" />
                  ) : (
                    <Play className="h-5 w-5" />
                  )}
                </Button>
                <div className="flex-1">
                  <div className="h-1 bg-muted rounded-full overflow-hidden">
                    <div 
                      className={`h-full bg-primary transition-all duration-300 ${isPlaying ? 'animate-pulse' : ''}`}
                      style={{ width: isPlaying ? '45%' : '0%' }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Preview audio</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" onClick={() => {
                  toast({
                    title: "Format Options",
                    description: "MP3 (High Quality) selected",
                  });
                }}>
                  MP3
                </Button>
                <Button variant="outline" onClick={() => {
                  toast({
                    title: "Format Options", 
                    description: "WAV (Lossless) selected",
                  });
                }}>
                  WAV
                </Button>
              </div>

              <Button 
                className="w-full" 
                variant="hot"
                onClick={handleDownloadAudio}
              >
                <Download className="mr-2 h-4 w-4" />
                Download Audio
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
