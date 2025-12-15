# Xtream - Social Media Platform

## Overview

Xtream is a social media platform that combines live streaming, short-form video content, community events, and interactive challenges. Built with Next.js 15 and Firebase, it offers features similar to YouTube, TikTok, Instagram, and Facebook with unique additions like audio extraction from streams, location-based discovery (beacons), and collaborative streaming.

The platform targets content creators and viewers who want real-time interaction through live streams, TikTok-style vertical video feeds, Instagram-style stories, community challenges, and local event discovery.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: Next.js 15 with App Router and React 19
- **Styling**: Tailwind CSS with CSS variables for theming, dark mode by default
- **UI Components**: Radix UI primitives with shadcn/ui component library
- **Typography**: Space Grotesk font loaded via next/font/google
- **State Management**: React Context for session data, Firebase hooks for real-time data

### Backend Architecture
- **Database**: Firebase Firestore for all data storage (users, streams, posts, events, challenges, beacons, chats)
- **Authentication**: Firebase Auth with email/password and social providers (Google, Facebook)
- **AI Integration**: Google Genkit with Gemini model for title suggestions, event descriptions, and location formatting
- **Server Functions**: Next.js API routes with Firebase Admin SDK for authenticated server-side operations

### Key Design Patterns
- **Non-blocking Firebase writes**: Custom `addDocumentNonBlocking` and `setDocumentNonBlocking` functions fire Firestore writes without awaiting, improving UI responsiveness
- **Memoized Firebase queries**: `useMemoFirebase` hook prevents unnecessary re-renders when query dependencies haven't changed
- **Global error handling**: Custom event emitter (`errorEmitter`) broadcasts Firestore permission errors to a listener component that throws for Next.js error boundaries
- **Client-side auth token injection**: Global fetch override automatically attaches Firebase auth tokens to `/api/` requests

### Data Models
Core entities stored in Firestore:
- **Users**: Profile data, follower/following lists, location, verification status
- **Streams**: Live and scheduled streams with reactions, co-streaming support, audio/recording URLs
- **Posts**: Clips from streams with reactions and creator info
- **Events**: Community events with attendance tracking and categories
- **Challenges**: Creative challenges with deadlines and submission types
- **Beacons**: Temporary location-based meetup signals
- **Chats**: Direct messages with subcollection for messages

### Authentication Flow
1. Email signup creates unverified account, redirects to email verification
2. Social sign-in (Google/Facebook) creates verified account, may need username setup
3. Post-signup onboarding modal introduces platform features
4. Tabs layout guards require verified email to access main app

## External Dependencies

### Firebase Services
- **Firebase Auth**: User authentication with email/password and OAuth providers
- **Cloud Firestore**: NoSQL document database for all application data
- **Firebase Admin SDK**: Server-side token verification and database access

### AI/ML Services
- **Google Genkit**: AI flow orchestration framework
- **Google Generative AI (Gemini 2.5 Flash)**: Powers title suggestions, event descriptions, game rules generation, and location formatting

### Email Services
- **Nodemailer with Gmail**: Sends verification emails using Gmail App Passwords (configured via environment variables)

### Media Handling
- **QRCode library**: Generates QR codes for device linking
- **Embla Carousel**: Powers the stories carousel and horizontal scrolling components

### Date/Time
- **date-fns**: Date formatting and relative time calculations throughout the app

### Development Configuration
- **Port**: Application runs on port 5000 (required for Replit compatibility)
- **TypeScript**: Strict mode enabled, build errors ignored for rapid development
- **ESLint**: Disabled during builds