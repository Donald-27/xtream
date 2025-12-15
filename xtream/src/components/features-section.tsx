'use client';

import { LogoIcon } from '@/components/icons/logo';
import { Video, Users, Gamepad2, Shield, UserPlus, Play, Sparkles } from 'lucide-react';

const features = [
  {
    icon: Video,
    title: 'Live Streaming',
    description: 'Go live instantly and share your moments with your audience in real-time.',
  },
  {
    icon: Users,
    title: 'Connect & Discover',
    description: 'Find events, join local meetups, and connect with people who share your interests.',
  },
  {
    icon: Gamepad2,
    title: 'Play & Compete',
    description: 'Join interactive games, challenges, and earn rewards as you level up.',
  },
  {
    icon: Shield,
    title: 'Privacy First',
    description: 'We only collect essential data. Your privacy and security matter to us.',
  },
];

const steps = [
  {
    number: '1',
    icon: UserPlus,
    title: 'Create Your Account',
    description: 'Sign up in seconds with email or social login.',
  },
  {
    number: '2',
    icon: Play,
    title: 'Start Exploring',
    description: 'Browse streams, events, and discover your community.',
  },
  {
    number: '3',
    icon: Sparkles,
    title: 'Go Live & Connect',
    description: 'Stream your content and engage with your audience.',
  },
];

export function FeaturesSection() {
  return (
    <section className="w-full py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <div className="flex justify-center mb-4">
            <LogoIcon width={64} height={64} />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold mb-3 gradient-text">
            How Xtream Works
          </h1>
          <p className="text-muted-foreground max-w-md mx-auto">
            Stream, connect, and vibe with a community built for creators and explorers.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="group p-5 rounded-xl bg-card border border-border/60 hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5"
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-11 h-11 rounded-lg bg-primary/15 flex items-center justify-center group-hover:bg-primary/25 transition-colors">
                  <feature.icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-1 group-hover:text-primary transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-secondary/50 rounded-2xl p-6 border border-border/40">
          <h2 className="text-xl font-bold text-center mb-6 text-foreground">
            Get Started in 3 Easy Steps
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {steps.map((step) => (
              <div key={step.number} className="flex flex-col items-center text-center">
                <div className="relative mb-3">
                  <div className="w-14 h-14 rounded-full bg-primary/20 flex items-center justify-center">
                    <step.icon className="h-6 w-6 text-primary" />
                  </div>
                  <span className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center">
                    {step.number}
                  </span>
                </div>
                <h3 className="font-semibold text-foreground mb-1">{step.title}</h3>
                <p className="text-sm text-muted-foreground">{step.description}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-6">
          We only collect essential data for functionality. Your privacy matters.
        </p>
      </div>
    </section>
  );
}
