
'use client';

import {
  Firestore,
  collection,
  writeBatch,
  doc,
  serverTimestamp,
} from 'firebase/firestore';
import type { Stream, Event } from './types';
import type { Challenge } from './types';


// Sample data for seeding
const streams: Omit<Stream, 'id' | 'userId' | 'allowCoStreaming' | 'coStreamerIds' | 'joinRequests'>[] = [
  {
    title: 'Live from the Grand Bazaar!',
    category: 'Travel & Events',
    description: 'Exploring the vibrant sights and sounds of the market.',
    tags: ['travel', 'market', 'live'],
    live: true,
    startTime: new Date(),
    thumbnailUrl: 'https://picsum.photos/seed/stream1/400/225',
    reactions: {
        spark: 1200,
        brightIdea: 50,
        support: 300,
        gold: 5,
        grow: 15
    }
  },
  {
    title: 'Scheduled: Pottery Crafting Session',
    category: 'Arts & Crafts',
    description: 'Join me as I craft a new vase from scratch. Q&A session included!',
    tags: ['pottery', 'crafting', 'diy'],
    live: false,
    startTime: new Date(new Date().getTime() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
    thumbnailUrl: 'https://picsum.photos/seed/stream2/400/225',
     reactions: {
        spark: 800,
        brightIdea: 250,
    }
  },
  {
    title: 'Night walk in Tokyo',
    category: 'IRL',
    description: 'A relaxing walk through the neon-lit streets of Shibuya.',
    tags: ['tokyo', 'night', 'city'],
    live: false,
    startTime: new Date(new Date().getTime() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
    endTime: new Date(new Date().getTime() - 1 * 24 * 60 * 60 * 1000 + 7200 * 1000), // Ended 2 hours later
    thumbnailUrl: 'https://picsum.photos/seed/stream3/400/225',
    reactions: {
        spark: 2500,
        support: 100,
        gold: 1
    }
  },
];

const challenges: Omit<Challenge, 'id' | 'creatorId' | 'createdAt'>[] = [
  {
    title: "Monochrome Cityscapes",
    description: "Capture the soul of your city using only black and white. Focus on shadows, light, and architecture.",
    rules: "1. Must be a new photo.\n2. Black and white only.\n3. No digital composites.",
    submissionType: 'photo',
    deadline: new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    coverImageUrl: "https://images.unsplash.com/photo-1519010470956-6d877008eaa4?q=80&w=2070&auto=format&fit=crop"
  },
  {
    title: "15-Second Story",
    description: "Tell a complete story in a single, 15-second video clip. No cuts, no edits. Just pure narrative.",
    rules: "1. Must be exactly 15 seconds.\n2. No editing or cuts allowed.\n3. Can be silent or have sound.",
    submissionType: 'video',
    deadline: new Date(new Date().getTime() + 10 * 24 * 60 * 60 * 1000), // 10 days from now
    coverImageUrl: "https://images.unsplash.com/photo-1505489874314-884897f16524?q=80&w=2070&auto=format&fit=crop"
  }
];


const events: Omit<Event, 'id' | 'attendeeIds'>[] = [
  {
    title: 'Virtual Reality Meetup',
    description:
      'Join us for a virtual gathering of VR enthusiasts. We will discuss the latest trends and showcase new demos.',
    organizerId: '', // This will be replaced by the current user's ID
    eventType: 'Virtual',
    location: 'Online',
    maxAttendees: 100,
    startTime: new Date(new Date().getTime() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
    category: 'Virtual',
    type: 'virtual',
  },
];

/**
 * Seeds the Firestore database with initial data for streams, games, and events.
 * This function is non-blocking and uses a batch write for efficiency.
 * @param firestore - The Firestore instance.
 * @param userId - The UID of the user to assign as the creator of the content.
 */
export async function seedDatabase(firestore: Firestore, userId: string) {
  if (!firestore || !userId) {
    console.error('Firestore instance or User ID is missing.');
    return { success: false, error: 'Firestore instance or User ID is missing.' };
  }

  const batch = writeBatch(firestore);

  // Seed Streams
  const streamsCollection = collection(firestore, 'streams');
  streams.forEach((streamData) => {
    const streamRef = doc(streamsCollection);
    batch.set(streamRef, {
      ...streamData,
      userId: userId,
      allowCoStreaming: Math.random() > 0.5, // Randomly allow co-streaming
      coStreamerIds: [],
      joinRequests: [],
      createdAt: serverTimestamp(),
    });
  });

  // Seed Challenges
  const challengesCollection = collection(firestore, 'challenges');
  challenges.forEach((challengeData) => {
    const challengeRef = doc(challengesCollection);
    batch.set(challengeRef, {
      ...challengeData,
      creatorId: userId,
      createdAt: serverTimestamp(),
    });
  });

  // Seed Events
  const eventsCollection = collection(firestore, 'events');
  events.forEach((eventData) => {
    const eventRef = doc(eventsCollection);
    batch.set(eventRef, {
      ...eventData,
      organizerId: userId,
      attendeeIds: [],
      createdAt: serverTimestamp(),
    });
  });

  try {
    await batch.commit();
    console.log('Database seeded successfully!');
    return { success: true };
  } catch (error) {
    console.error('Error seeding database:', error);
    return { success: false, error };
  }
}
