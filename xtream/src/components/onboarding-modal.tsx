'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { LogoIcon } from '@/components/icons/logo';
import { Play, Compass, Shield, Radio, ChevronRight, ChevronLeft, X } from 'lucide-react';

interface OnboardingModalProps {
  isOpen: boolean;
  onComplete: () => void;
  username: string;
}

const slides = [
  {
    id: 'welcome',
    title: 'Welcome to Xtream!',
    description: 'Get ready to stream, connect, and vibe with a community that values your experience.',
    icon: null,
    isWelcome: true,
  },
  {
    id: 'streams',
    title: 'Go Live Anytime',
    description: 'Start streaming with one tap. Share your moments, talents, or just hang out with your audience in real-time.',
    icon: Play,
  },
  {
    id: 'connect',
    title: 'Connect & Discover',
    description: 'Find events, join beacons, and meet people nearby. Use the Connect tab to explore your community.',
    icon: Compass,
  },
  {
    id: 'play',
    title: 'Play & Compete',
    description: 'Join games, challenges, and interactive experiences. Level up and earn rewards as you play.',
    icon: Radio,
  },
  {
    id: 'privacy',
    title: 'Your Privacy Matters',
    description: "We only collect essential data for functionality. We don't sell your info or collect unnecessary personal data. Your privacy matters to us.",
    icon: Shield,
  },
];

export function OnboardingModal({ isOpen, onComplete, username }: OnboardingModalProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  
  const progress = ((currentSlide + 1) / slides.length) * 100;
  const slide = slides[currentSlide];
  const isLastSlide = currentSlide === slides.length - 1;
  const isFirstSlide = currentSlide === 0;

  const handleNext = () => {
    if (isLastSlide) {
      onComplete();
    } else {
      setCurrentSlide(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (!isFirstSlide) {
      setCurrentSlide(prev => prev - 1);
    }
  };

  const handleSkip = () => {
    onComplete();
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden border-border/60 bg-card">
        <DialogTitle className="sr-only">Welcome to Xtream - Onboarding</DialogTitle>
        <div className="relative">
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 z-10 text-muted-foreground hover:text-foreground"
            onClick={handleSkip}
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Skip</span>
          </Button>
          
          <div className="px-6 pt-12 pb-8">
            <Progress value={progress} className="h-1 mb-8" />
            
            <div className="flex flex-col items-center text-center min-h-[280px] justify-center">
              {slide.isWelcome ? (
                <>
                  <LogoIcon width={80} height={80} className="mb-6" />
                  <h2 className="text-2xl font-bold mb-2 gradient-text">
                    Welcome, {username}!
                  </h2>
                  <p className="text-lg text-foreground mb-2">Welcome to Xtream!</p>
                  <p className="text-muted-foreground max-w-sm">
                    {slide.description}
                  </p>
                </>
              ) : (
                <>
                  {slide.icon && (
                    <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mb-6">
                      <slide.icon className="h-8 w-8 text-primary" />
                    </div>
                  )}
                  <h2 className="text-2xl font-bold mb-4 text-foreground">
                    {slide.title}
                  </h2>
                  <p className="text-muted-foreground max-w-sm leading-relaxed">
                    {slide.description}
                  </p>
                </>
              )}
            </div>

            <div className="flex items-center justify-between mt-8">
              <Button
                variant="ghost"
                onClick={handlePrev}
                disabled={isFirstSlide}
                className={isFirstSlide ? 'invisible' : ''}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Back
              </Button>
              
              <div className="flex gap-1.5">
                {slides.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentSlide(index)}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      index === currentSlide ? 'bg-primary' : 'bg-muted-foreground/30'
                    }`}
                  />
                ))}
              </div>
              
              <Button onClick={handleNext}>
                {isLastSlide ? 'Get Started' : 'Next'}
                {!isLastSlide && <ChevronRight className="h-4 w-4 ml-1" />}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
