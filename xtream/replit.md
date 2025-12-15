# Xtream - Social Media Platform

## Overview
Xtream is a unique social media platform combining features from YouTube, TikTok, Instagram, and Facebook with distinctive twists. Built with Next.js 15 and Firebase.

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

## Tech Stack
- **Frontend**: Next.js 15 with Turbopack, React 19, TypeScript
- **Styling**: Tailwind CSS, Radix UI components
- **Backend**: Firebase (Auth, Firestore)
- **AI**: Google Genkit for AI features
- **Port**: 5000 (required for Replit)

## Brand Assets
- Logo Primary: `/public/logo-primary.png` (with tagline "streams vybes")
- Logo Secondary: `/public/logo-secondary.png` (speed-effect design)

## Project Structure
```
vybverse/
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
│   │   ├── features-section.tsx     # Landing page features
│   │   ├── audio-download-dialog.tsx
│   │   ├── stories-carousel.tsx
│   │   ├── vertical-video-feed.tsx
│   │   ├── icons/logo.tsx   # Xtream logo component (uses PNG)
│   │   └── ui/        # Radix UI components
│   ├── firebase/      # Firebase config & hooks
│   ├── ai/            # Genkit AI flows
│   └── lib/           # Types (includes hasSeenOnboarding), utils
```

## Running the App
```bash
cd vybverse && npm run dev
```
The app runs on port 5000.

## Unique Differentiators
1. **Audio Download** - Users can extract audio from any streamed content
2. **Custom Reactions** - Spark, Bright Idea, Support, Gold, Grow
3. **Co-streaming** - Multiple users can join a live stream
4. **Beacons** - Location-based quick meetups
5. **AI Assistance** - AI-powered content suggestions
6. **Privacy-First Messaging** - "We only collect essential data"

## Recent Changes (Dec 2024)
- Rebranded from VybVerse to Xtream
- Added new Xtream logos (PNG) throughout the app
- Created post-signup onboarding modal (5 interactive slides)
- Added "How Xtream Works" features section on login/signup
- Added hasSeenOnboarding flag to User type
- Updated all branding references in headers, emails, legal pages, and components

## Onboarding Flow
1. User completes signup and email verification
2. User sets username on /signup/username page
3. Onboarding modal appears with 5 slides:
   - Welcome message
   - Go Live feature
   - Connect & Discover
   - Play & Compete
   - Privacy assurance
4. On completion, hasSeenOnboarding is set to true in Firestore
5. User is redirected to home page

## Remaining Tasks
- Add monetization (Tips, Creator subscriptions)
- Implement Direct Messaging
- Add notification system
- Complete end-to-end user flow testing
