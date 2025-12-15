'use client';

import { LogoIcon } from '@/components/icons/logo';
import { 
  Video, 
  Users, 
  Gamepad2, 
  Shield, 
  UserPlus, 
  Play, 
  Sparkles, 
  Zap, 
  Globe, 
  Heart, 
  Trophy, 
  MessageCircle, 
  Bell, 
  Star,
  Smartphone,
  Tv,
  Tablet,
  Monitor,
  Download,
  Apple,
  ChevronRight,
  CheckCircle2,
  TrendingUp,
  Clock,
  Gift
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import Image from 'next/image';

const features = [
  {
    icon: Video,
    title: 'Live Streaming',
    description: 'Go live instantly and share your moments with your audience in real-time. Broadcast in HD quality with ultra-low latency.',
    gradient: 'from-primary to-cyan-400',
  },
  {
    icon: Users,
    title: 'Connect & Discover',
    description: 'Find events, join local meetups, and connect with people who share your interests. Build meaningful relationships.',
    gradient: 'from-accent to-pink-400',
  },
  {
    icon: Gamepad2,
    title: 'Play & Compete',
    description: 'Join interactive games, challenges, and earn rewards as you level up. Compete with friends and climb the leaderboards.',
    gradient: 'from-yellow-500 to-orange-500',
  },
  {
    icon: Shield,
    title: 'Privacy First',
    description: 'We only collect essential data. Your privacy and security matter to us. End-to-end encryption for all your communications.',
    gradient: 'from-green-500 to-emerald-400',
  },
  {
    icon: Zap,
    title: 'AI-Powered Features',
    description: 'Smart recommendations, auto-generated highlights, and intelligent content discovery powered by cutting-edge AI technology.',
    gradient: 'from-purple-500 to-violet-400',
  },
  {
    icon: Globe,
    title: 'Global Community',
    description: 'Connect with creators and viewers from around the world. Break language barriers with real-time translation features.',
    gradient: 'from-blue-500 to-indigo-400',
  },
];

const steps = [
  {
    number: '1',
    icon: UserPlus,
    title: 'Create Your Account',
    description: 'Sign up in seconds with email or social login. Verify your account and personalize your profile.',
  },
  {
    number: '2',
    icon: Play,
    title: 'Start Exploring',
    description: 'Browse streams, events, and discover your community. Follow your favorite creators.',
  },
  {
    number: '3',
    icon: Sparkles,
    title: 'Go Live & Connect',
    description: 'Stream your content and engage with your audience. Earn rewards and build your following.',
  },
];

const stats = [
  { number: '10M+', label: 'Active Users', icon: Users },
  { number: '500K+', label: 'Live Streams Daily', icon: Video },
  { number: '1B+', label: 'Messages Sent', icon: MessageCircle },
  { number: '50+', label: 'Countries', icon: Globe },
];

const testimonials = [
  {
    name: 'Alex Chen',
    role: 'Content Creator',
    avatar: 'https://picsum.photos/seed/alex/100/100',
    content: 'Xtream has completely transformed how I connect with my audience. The streaming quality is incredible!',
    rating: 5,
  },
  {
    name: 'Maria Rodriguez',
    role: 'Gaming Streamer',
    avatar: 'https://picsum.photos/seed/maria/100/100',
    content: 'The best platform for gaming streams. Low latency, amazing community, and the rewards system is addictive!',
    rating: 5,
  },
  {
    name: 'James Wilson',
    role: 'Music Producer',
    avatar: 'https://picsum.photos/seed/james/100/100',
    content: 'Finally a platform that understands creators. The monetization options and analytics are top-notch.',
    rating: 5,
  },
];

const platforms = [
  { name: 'iOS', icon: Apple, store: 'App Store' },
  { name: 'Android', icon: Smartphone, store: 'Play Store' },
  { name: 'Tablet', icon: Tablet, store: 'Available' },
  { name: 'Smart TV', icon: Tv, store: 'Coming Soon' },
  { name: 'Desktop', icon: Monitor, store: 'Web App' },
];

const premiumFeatures = [
  { title: 'HD Streaming', description: 'Stream in 1080p quality' },
  { title: 'Priority Support', description: '24/7 dedicated support team' },
  { title: 'Exclusive Badges', description: 'Stand out with premium badges' },
  { title: 'Analytics Dashboard', description: 'Deep insights into your audience' },
  { title: 'Custom Emotes', description: 'Create your own emotes' },
  { title: 'Ad-Free Viewing', description: 'Enjoy uninterrupted streams' },
];

export function FeaturesSection() {
  return (
    <section className="w-full">
      {/* Hero Section with Animation */}
      <div className="relative min-h-[80vh] flex flex-col items-center justify-center px-4 py-16 overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-accent/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-primary/10 to-accent/10 rounded-full blur-3xl" />
        </div>
        
        {/* Floating Elements Animation */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-[10%] w-3 h-3 bg-primary rounded-full animate-bounce" style={{ animationDuration: '3s' }} />
          <div className="absolute top-40 right-[15%] w-2 h-2 bg-accent rounded-full animate-bounce" style={{ animationDuration: '2.5s', animationDelay: '0.5s' }} />
          <div className="absolute bottom-40 left-[20%] w-4 h-4 bg-yellow-500 rounded-full animate-bounce" style={{ animationDuration: '3.5s', animationDelay: '1s' }} />
          <div className="absolute bottom-20 right-[25%] w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDuration: '2s', animationDelay: '0.3s' }} />
        </div>

        <div className="relative z-10 text-center max-w-4xl mx-auto">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <LogoIcon width={120} height={120} />
              <div className="absolute inset-0 bg-primary/30 rounded-full blur-2xl -z-10 animate-pulse" />
            </div>
          </div>
          
          <h1 className="text-5xl sm:text-7xl font-bold mb-6 leading-tight">
            <span className="gradient-text">Stream.</span>{' '}
            <span className="text-foreground">Connect.</span>{' '}
            <span className="gradient-text">Vibe.</span>
          </h1>
          
          <p className="text-xl sm:text-2xl text-muted-foreground max-w-2xl mx-auto mb-8 leading-relaxed">
            The next generation streaming platform built for creators, gamers, and communities. 
            Experience live content like never before.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button size="lg" className="text-lg px-8 py-6 bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-all transform hover:scale-105">
              <Sparkles className="mr-2 h-5 w-5" />
              Get Started Free
            </Button>
            <Button size="lg" variant="outline" className="text-lg px-8 py-6 hover:bg-card transition-all">
              <Play className="mr-2 h-5 w-5" />
              Watch Demo
            </Button>
          </div>

          {/* App Download Buttons */}
          <div className="flex flex-col items-center gap-4">
            <p className="text-sm text-muted-foreground">Download the app for the best experience</p>
            <div className="flex flex-wrap gap-3 justify-center">
              <Button variant="secondary" className="h-14 px-6 hover:bg-card transition-all transform hover:scale-105">
                <Apple className="mr-2 h-6 w-6" />
                <div className="text-left">
                  <div className="text-xs text-muted-foreground">Download on the</div>
                  <div className="font-semibold">App Store</div>
                </div>
              </Button>
              <Button variant="secondary" className="h-14 px-6 hover:bg-card transition-all transform hover:scale-105">
                <svg className="mr-2 h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M3.609 1.814L13.792 12 3.61 22.186a.996.996 0 0 1-.61-.92V2.734a1 1 0 0 1 .609-.92zm10.89 10.893l2.302 2.302-10.937 6.333 8.635-8.635zm3.199-3.198l2.807 1.626a1 1 0 0 1 0 1.73l-2.808 1.626L15.206 12l2.492-2.491zM5.864 2.658L16.8 8.99l-2.302 2.302-8.634-8.634z"/>
                </svg>
                <div className="text-left">
                  <div className="text-xs text-muted-foreground">Get it on</div>
                  <div className="font-semibold">Google Play</div>
                </div>
              </Button>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <ChevronRight className="h-8 w-8 text-muted-foreground rotate-90" />
        </div>
      </div>

      {/* Video Showcase Section */}
      <div className="relative bg-gradient-to-b from-background via-card to-background py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4 gradient-text">See Xtream in Action</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Experience the future of live streaming with our powerful features
            </p>
          </div>
          
          <div className="relative aspect-video rounded-2xl overflow-hidden border border-border/60 shadow-2xl shadow-primary/20">
            <video 
              autoPlay 
              muted 
              loop 
              playsInline
              className="w-full h-full object-cover"
              poster="https://picsum.photos/seed/xtream-poster/1280/720"
            >
              <source src="https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4" type="video/mp4" />
            </video>
            <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-6">
              <div className="flex items-center gap-2 text-sm">
                <span className="flex items-center gap-1 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-semibold animate-pulse">
                  <span className="w-2 h-2 bg-white rounded-full" />
                  LIVE
                </span>
                <span className="text-muted-foreground">12.5K watching</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="py-16 px-4 bg-gradient-to-r from-primary/5 via-accent/5 to-primary/5">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center group">
                <div className="flex justify-center mb-3">
                  <div className="w-14 h-14 rounded-full bg-card border border-border/60 flex items-center justify-center group-hover:border-primary/50 transition-colors">
                    <stat.icon className="h-7 w-7 text-primary" />
                  </div>
                </div>
                <div className="text-3xl sm:text-4xl font-bold gradient-text mb-1">{stat.number}</div>
                <div className="text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Everything You Need to{' '}
              <span className="gradient-text">Create & Connect</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Powerful tools and features designed for modern creators and communities
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <div
                key={feature.title}
                className="group relative p-6 rounded-2xl bg-card border border-border/60 hover:border-primary/50 transition-all duration-500 hover:shadow-lg hover:shadow-primary/10 overflow-hidden"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Gradient Background on Hover */}
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />
                
                <div className="relative z-10">
                  <div className={`flex-shrink-0 w-14 h-14 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <feature.icon className="h-7 w-7 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Platform Availability */}
      <div className="py-20 px-4 bg-card">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Available on <span className="gradient-text">All Your Devices</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Stream seamlessly across smartphones, tablets, smart TVs, and computers
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6">
            {platforms.map((platform) => (
              <div key={platform.name} className="flex flex-col items-center p-6 rounded-2xl bg-background border border-border/60 hover:border-primary/50 transition-all group">
                <div className="w-16 h-16 rounded-full bg-card border border-border/60 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <platform.icon className="h-8 w-8 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground mb-1">{platform.name}</h3>
                <span className="text-xs text-muted-foreground">{platform.store}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Get Started in <span className="gradient-text">3 Easy Steps</span>
            </h2>
            <p className="text-muted-foreground">
              Join millions of creators and start streaming in minutes
            </p>
          </div>

          <div className="relative">
            {/* Connection Line */}
            <div className="hidden sm:block absolute top-24 left-1/2 -translate-x-1/2 w-2/3 h-0.5 bg-gradient-to-r from-primary via-accent to-primary" />
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
              {steps.map((step, index) => (
                <div key={step.number} className="relative flex flex-col items-center text-center">
                  <div className="relative mb-6">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center border-2 border-primary/30">
                      <step.icon className="h-9 w-9 text-primary" />
                    </div>
                    <span className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-gradient-to-r from-primary to-accent text-primary-foreground text-sm font-bold flex items-center justify-center shadow-lg">
                      {step.number}
                    </span>
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">{step.title}</h3>
                  <p className="text-muted-foreground">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Testimonials */}
      <div className="py-20 px-4 bg-gradient-to-b from-background to-card">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Loved by <span className="gradient-text">Creators Worldwide</span>
            </h2>
            <p className="text-muted-foreground">
              See what our community has to say
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="p-6 rounded-2xl bg-card border border-border/60 hover:border-primary/50 transition-all">
                <div className="flex items-center gap-4 mb-4">
                  <div className="relative w-12 h-12 rounded-full overflow-hidden">
                    <Image src={testimonial.avatar} alt={testimonial.name} fill className="object-cover" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground">{testimonial.name}</h4>
                    <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                  </div>
                </div>
                <div className="flex gap-1 mb-3">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                  ))}
                </div>
                <p className="text-muted-foreground">&ldquo;{testimonial.content}&rdquo;</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Premium Features */}
      <div className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 text-accent text-sm font-semibold mb-6">
                <Trophy className="h-4 w-4" />
                Premium
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                Unlock Your Full <span className="gradient-text">Potential</span>
              </h2>
              <p className="text-muted-foreground mb-8">
                Upgrade to Premium and get access to exclusive features, priority support, and more.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                {premiumFeatures.map((feature, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-foreground">{feature.title}</h4>
                      <p className="text-sm text-muted-foreground">{feature.description}</p>
                    </div>
                  </div>
                ))}
              </div>
              <Button size="lg" className="bg-gradient-to-r from-accent to-primary hover:opacity-90">
                <Gift className="mr-2 h-5 w-5" />
                Upgrade to Premium
              </Button>
            </div>
            <div className="relative">
              <div className="relative aspect-square rounded-2xl overflow-hidden border border-border/60">
                <Image
                  src="https://picsum.photos/seed/premium/600/600"
                  alt="Premium Features"
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
              </div>
              {/* Floating Cards */}
              <div className="absolute -top-4 -right-4 p-4 rounded-xl bg-card border border-border/60 shadow-xl">
                <div className="flex items-center gap-3">
                  <TrendingUp className="h-8 w-8 text-green-500" />
                  <div>
                    <div className="text-2xl font-bold text-foreground">+250%</div>
                    <div className="text-sm text-muted-foreground">Engagement</div>
                  </div>
                </div>
              </div>
              <div className="absolute -bottom-4 -left-4 p-4 rounded-xl bg-card border border-border/60 shadow-xl">
                <div className="flex items-center gap-3">
                  <Clock className="h-8 w-8 text-primary" />
                  <div>
                    <div className="text-2xl font-bold text-foreground">24/7</div>
                    <div className="text-sm text-muted-foreground">Support</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Final CTA */}
      <div className="py-20 px-4 bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex justify-center mb-6">
            <LogoIcon width={100} height={100} />
          </div>
          <h2 className="text-3xl sm:text-5xl font-bold mb-6">
            Ready to Start <span className="gradient-text">Streaming</span>?
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join millions of creators and viewers on Xtream. It&apos;s free to get started.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="text-lg px-8 py-6 bg-gradient-to-r from-primary to-accent hover:opacity-90 transform hover:scale-105 transition-all">
              Create Your Account
            </Button>
            <Button size="lg" variant="outline" className="text-lg px-8 py-6 hover:bg-card">
              Continue in Browser
            </Button>
          </div>
          <p className="text-sm text-muted-foreground mt-8">
            No credit card required. Start streaming in minutes.
          </p>
        </div>
      </div>

      {/* Footer Note */}
      <div className="py-8 px-4 text-center">
        <p className="text-xs text-muted-foreground">
          We only collect essential data for functionality. Your privacy matters. 
          <br />
          &copy; 2025 Xtream. All rights reserved.
        </p>
      </div>
    </section>
  );
}
