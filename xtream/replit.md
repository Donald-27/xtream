# Xtream - Social Media Platform

## Overview
Xtream is a unique social media platform combining features from YouTube, TikTok, Instagram, and Facebook with distinctive twists. Built with Next.js 15 and Supabase.

## Key Features Implemented
- **Live Streaming** - Go live with co-streaming support
- **Stories Carousel** - Instagram-style stories at top of feed
- **Reels/Vertical Video Feed** - TikTok-style scrollable videos
- **Audio Download** - Unique feature to extract and download audio from streams/posts (perfect for DJ sets, podcasts)
- **Challenges/Vybes** - Community games and creative challenges
- **Events & Beacons** - Local meetups and location-based discovery
- **AI-Powered Features** - Title suggestions, descriptions via Genkit
- **Post-Signup Onboarding** - Interactive 5-slide onboarding flow for new users
- **Features Section** - Landing page with "How Xtream Works" section
- **100% Free** - No premium tiers, all features accessible to everyone

## Tech Stack
- **Frontend**: Next.js 15 with Turbopack, React 19, TypeScript
- **Styling**: Tailwind CSS, Radix UI components
- **Backend**: Supabase (Auth, PostgreSQL Database)
- **AI**: Google Genkit for AI features
- **Port**: 5000 (required for Replit)

## Authentication
- Email/password authentication with 6-digit verification codes
- OAuth support for Google login
- Session management via Supabase Auth

## Database (Supabase)
Environment variables required:
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key

Tables:
- `users` - User profiles
- `streams` - Live streams and replays
- `posts` - User posts/clips
- `events` - Events and meetups
- `beacons` - Location-based quick meetups
- `challenges` - Community challenges

## Brand Assets
- Logo Primary: `/public/logo-primary.png` (with tagline "streams vybes")
- Logo Secondary: `/public/logo-secondary.png` (speed-effect design)
- Increased logo sizes throughout the app (150px on landing, 40px in headers)

## Project Structure
```
xtream/
├── src/
│   ├── app/           # Next.js app router pages
│   │   ├── (tabs)/    # Main tabbed navigation
│   │   │   ├── page.tsx      # Home feed with Stories
│   │   │   ├── reels/        # TikTok-style vertical videos
│   │   │   ├── play/         # Challenges/Vybes
│   │   │   ├── connect/      # Events & social
│   │   │   └── profile/      # User profile
│   │   ├── stream/    # Stream viewing page
│   │   ├── login/     # Login page with features section
│   │   ├── signup/    # Signup flow with onboarding
│   │   └── go-live/   # Start streaming
│   ├── components/
│   │   ├── onboarding-modal.tsx     # Post-signup onboarding
│   │   ├── features-section.tsx     # Landing page features (100% Free messaging)
│   │   ├── audio-download-dialog.tsx
│   │   ├── stories-carousel.tsx
│   │   ├── vertical-video-feed.tsx
│   │   ├── icons/logo.tsx   # Xtream logo component (uses PNG)
│   │   └── ui/        # Radix UI components
│   ├── lib/
│   │   ├── supabase/  # Supabase client, provider, hooks
│   │   ├── types.ts   # Database types and mappers
│   │   └── utils.ts   # Utility functions
│   ├── ai/            # Genkit AI flows
```

## Running the App
```bash
cd xtream && npm run dev
```
The app runs on port 5000.

## Unique Differentiators
1. **100% Free** - All features available to everyone, no premium tiers
2. **Audio Download** - Users can extract audio from any streamed content
3. **Custom Reactions** - Spark, Bright Idea, Support, Gold, Grow
4. **Co-streaming** - Multiple users can join a live stream
5. **Beacons** - Location-based quick meetups
6. **AI Assistance** - AI-powered content suggestions
7. **Privacy-First** - "We only collect essential data"

## Recent Changes (Dec 2024)
- Migrated from Firebase to Supabase (authentication and database)
- Updated Premium section to "100% Free Forever" messaging
- Increased logo sizes throughout the app
- Added "Get Started Free" and "Sign In" buttons on landing page
- Updated features section with free-focused messaging
- Rebranded from VybVerse to Xtream
- Added new Xtream logos (PNG) throughout the app
- Created post-signup onboarding modal (5 interactive slides)
- Added "How Xtream Works" features section on login/signup

## User Preferences
- No hardcoded values - use proper configuration and environment variables
- Keep all existing features working during migrations
- Email verification with 6-digit code system
- Liking, commenting, and threading features must be fully implemented

## Onboarding Flow
1. User completes signup and email verification
2. User sets username on /signup/username page
3. Onboarding modal appears with 5 slides:
   - Welcome message
   - Go Live feature
   - Connect & Discover
   - Play & Compete
   - Privacy assurance
4. On completion, hasSeenOnboarding is set to true
5. User is redirected to home page

## Remaining Tasks
- Complete migration of remaining Firebase-dependent pages
- Create Supabase database schema with Row Level Security (RLS)
- Implement Direct Messaging
- Add notification system
- Complete end-to-end user flow testing
