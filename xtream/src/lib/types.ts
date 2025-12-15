
import type { Timestamp } from 'firebase/firestore';

export type Stream = {
  id: string;
  userId: string;
  title: string;
  category: string;
  description: string;
  tags: string[];
  live: boolean;
  startTime: any; // Can be string or Firestore Timestamp
  endTime?: any; // Can be string or Firestore Timestamp
  thumbnailUrl: string;
  reactions?: {
    spark?: number;
    brightIdea?: number;
    support?: number;
    gold?: number;
    grow?: number;
  };
  // Collaborative streaming fields
  allowCoStreaming: boolean;
  coStreamerIds: string[];
  joinRequests: string[];
  // Audio/Media fields for recorded streams
  recordingUrl?: string;
  audioUrl?: string;
  allowAudioDownload?: boolean;
  duration?: number; // Duration in seconds
};

export type Post = {
  id: string;
  creatorId: string;
  originalStreamId: string;
  title: string;
  videoUrl: string;
  thumbnailUrl: string;
  createdAt: any; // Firestore Timestamp
  reactions?: {
    spark?: number;
    brightIdea?: number;
    support?: number;
    gold?: number;
    grow?: number;
  };
  // For UI display
  type: 'post'; // To distinguish from streams in a mixed feed
  userProfile?: {
      username?: string;
      profilePictureUrl?: string;
  }
}

export type Challenge = {
  id: string;
  creatorId: string;
  title: string;
  description: string;
  rules: string;
  submissionType: 'photo' | 'video' | 'text';
  deadline: any; // Can be string or Firestore Timestamp
  createdAt: any;
  coverImageUrl?: string;
};

export type ChallengeEntry = {
    id: string;
    challengeId: string;
    userId: string;
    contentUrl?: string; // For photo/video
    textContent?: string; // For text
    createdAt: any;
    reactions?: {
      spark?: number;
      brightIdea?: number;
      support?: number;
      gold?: number;
      grow?: number;
    };
    // For UI display
    userProfile?: {
        username?: string;
        profilePictureUrl?: string;
    }
}

export type Event = {
    id: string;
    title: string;
    description: string;
    organizerId: string;
    eventType: string;
    location: string;
    startTime: any; // Can be string or Firestore Timestamp
    maxAttendees: number;
    attendeeIds: string[];
     // For UI display, can be denormalized or fetched separately
    host?: string;
    time?: string; 
    type?: 'virtual' | 'in-person';
    spots?: string; 
    isInvitation?: boolean;
    distance?: string;
    isFree?: boolean;
    category?: string;
};

export type Beacon = {
    id: string;
    creatorId: string;
    location: string;
    purpose: string;
    expiresAt: any; // Firestore Timestamp
    createdAt: any;
    participantIds: string[];
}

export type ChatMessage = {
  id: string;
  senderId: string;
  content: string;
  timestamp: any; // Can be client Date or Firestore Timestamp
  senderName?: string | null;
  senderPhotoURL?: string | null;
}

export type Chat = {
    id: string;
    type: 'direct' | 'group' | 'event' | 'game' | 'challenge' | 'beacon';
    participantIds: string[];
}

export type User = {
    id: string;
    username: string;
    email: string | null;
    displayName: string | null;
    isVerified: boolean;
    bio: string;
    location: string;
    profilePictureUrl: string;
    coverPhotoUrl: string;
    followerIds: string[];
    followingIds: string[];
    usernameLastChanged: any;
    qrCodeData?: string;
    createdAt: Timestamp;
    lifetimeGold?: number;
    blockedUserIds?: string[];
    defaultStreamCategory?: string;
    discoveryRadius?: number;
    isDiscoverable?: boolean;
    hasSeenOnboarding?: boolean;
}

export type UserLocation = {
  ip: string;
  userId: string;
  updatedAt: any; // Firestore Timestamp
}
