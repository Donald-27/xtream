export type Stream = {
  id: string;
  userId: string;
  title: string;
  category: string;
  description: string;
  tags: string[];
  live: boolean;
  startTime: string;
  endTime?: string;
  thumbnailUrl: string;
  reactions?: {
    spark?: number;
    brightIdea?: number;
    support?: number;
    gold?: number;
    grow?: number;
  };
  allowCoStreaming: boolean;
  coStreamerIds: string[];
  joinRequests: string[];
  recordingUrl?: string;
  audioUrl?: string;
  allowAudioDownload?: boolean;
  duration?: number;
};

export type Post = {
  id: string;
  creatorId: string;
  originalStreamId: string;
  title: string;
  videoUrl: string;
  thumbnailUrl: string;
  createdAt: string;
  reactions?: {
    spark?: number;
    brightIdea?: number;
    support?: number;
    gold?: number;
    grow?: number;
  };
  type: 'post';
  userProfile?: {
    username?: string;
    profilePictureUrl?: string;
  };
};

export type Challenge = {
  id: string;
  creatorId: string;
  title: string;
  description: string;
  rules: string;
  submissionType: 'photo' | 'video' | 'text';
  deadline: string;
  createdAt: string;
  coverImageUrl?: string;
};

export type ChallengeEntry = {
  id: string;
  challengeId: string;
  userId: string;
  contentUrl?: string;
  textContent?: string;
  createdAt: string;
  reactions?: {
    spark?: number;
    brightIdea?: number;
    support?: number;
    gold?: number;
    grow?: number;
  };
  userProfile?: {
    username?: string;
    profilePictureUrl?: string;
  };
};

export type Event = {
  id: string;
  title: string;
  description: string;
  organizerId: string;
  eventType: string;
  location: string;
  startTime: string;
  maxAttendees: number;
  attendeeIds: string[];
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
  expiresAt: string;
  createdAt: string;
  participantIds: string[];
};

export type ChatMessage = {
  id: string;
  senderId: string;
  content: string;
  timestamp: string;
  senderName?: string | null;
  senderPhotoURL?: string | null;
};

export type Chat = {
  id: string;
  type: 'direct' | 'group' | 'event' | 'game' | 'challenge' | 'beacon';
  participantIds: string[];
};

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
  usernameLastChanged: string | null;
  qrCodeData?: string;
  createdAt: string;
  lifetimeGold?: number;
  blockedUserIds?: string[];
  defaultStreamCategory?: string;
  discoveryRadius?: number;
  isDiscoverable?: boolean;
  hasSeenOnboarding?: boolean;
};

export type UserLocation = {
  ip: string;
  userId: string;
  updatedAt: string;
};

export type Comment = {
  id: string;
  contentId: string;
  contentType: string;
  userId: string;
  text: string;
  parentId: string | null;
  createdAt: string;
  reactions?: {
    spark?: number;
    brightIdea?: number;
    support?: number;
    gold?: number;
    grow?: number;
  };
  userProfile?: {
    username?: string;
    profilePictureUrl?: string;
  };
  replies?: Comment[];
};

export type UserReaction = {
  id: string;
  userId: string;
  contentId: string;
  contentType: string;
  reactionType: string;
  createdAt: string;
};

export function mapDbStreamToStream(dbStream: any): Stream {
  return {
    id: dbStream.id,
    userId: dbStream.user_id,
    title: dbStream.title,
    category: dbStream.category,
    description: dbStream.description,
    tags: dbStream.tags || [],
    live: dbStream.live,
    startTime: dbStream.start_time,
    endTime: dbStream.end_time,
    thumbnailUrl: dbStream.thumbnail_url,
    reactions: dbStream.reactions,
    allowCoStreaming: dbStream.allow_co_streaming,
    coStreamerIds: dbStream.co_streamer_ids || [],
    joinRequests: dbStream.join_requests || [],
    recordingUrl: dbStream.recording_url,
    audioUrl: dbStream.audio_url,
    allowAudioDownload: dbStream.allow_audio_download,
    duration: dbStream.duration,
  };
}

export function mapDbPostToPost(dbPost: any): Post {
  return {
    id: dbPost.id,
    creatorId: dbPost.creator_id,
    originalStreamId: dbPost.original_stream_id,
    title: dbPost.title,
    videoUrl: dbPost.video_url,
    thumbnailUrl: dbPost.thumbnail_url,
    createdAt: dbPost.created_at,
    reactions: dbPost.reactions,
    type: 'post',
  };
}

export function mapDbEventToEvent(dbEvent: any): Event {
  return {
    id: dbEvent.id,
    title: dbEvent.title,
    description: dbEvent.description,
    organizerId: dbEvent.organizer_id,
    eventType: dbEvent.event_type,
    location: dbEvent.location,
    startTime: dbEvent.start_time,
    maxAttendees: dbEvent.max_attendees,
    attendeeIds: dbEvent.attendee_ids || [],
    host: dbEvent.host,
    type: dbEvent.type,
    spots: dbEvent.spots,
    isInvitation: dbEvent.is_invitation,
    distance: dbEvent.distance,
    isFree: dbEvent.is_free,
    category: dbEvent.category,
  };
}

export function mapDbChallengeToChallenge(dbChallenge: any): Challenge {
  return {
    id: dbChallenge.id,
    creatorId: dbChallenge.creator_id,
    title: dbChallenge.title,
    description: dbChallenge.description,
    rules: dbChallenge.rules,
    submissionType: dbChallenge.submission_type,
    deadline: dbChallenge.deadline,
    createdAt: dbChallenge.created_at,
    coverImageUrl: dbChallenge.cover_image_url,
  };
}

export function mapDbBeaconToBeacon(dbBeacon: any): Beacon {
  return {
    id: dbBeacon.id,
    creatorId: dbBeacon.creator_id,
    location: dbBeacon.location,
    purpose: dbBeacon.purpose,
    expiresAt: dbBeacon.expires_at,
    createdAt: dbBeacon.created_at,
    participantIds: dbBeacon.participant_ids || [],
  };
}

export function mapDbUserToUser(dbUser: any): User {
  return {
    id: dbUser.id,
    username: dbUser.username,
    email: dbUser.email,
    displayName: dbUser.display_name,
    isVerified: dbUser.is_verified,
    bio: dbUser.bio,
    location: dbUser.location,
    profilePictureUrl: dbUser.profile_picture_url,
    coverPhotoUrl: dbUser.cover_photo_url,
    followerIds: dbUser.follower_ids || [],
    followingIds: dbUser.following_ids || [],
    usernameLastChanged: dbUser.username_last_changed,
    qrCodeData: dbUser.qr_code_data,
    createdAt: dbUser.created_at,
    lifetimeGold: dbUser.lifetime_gold,
    blockedUserIds: dbUser.blocked_user_ids || [],
    defaultStreamCategory: dbUser.default_stream_category,
    discoveryRadius: dbUser.discovery_radius,
    isDiscoverable: dbUser.is_discoverable,
    hasSeenOnboarding: dbUser.has_seen_onboarding,
  };
}
