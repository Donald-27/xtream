
'use client';

import React, { createContext, useContext, useState, ReactNode, useMemo } from 'react';

// This context is no longer used for recommendations but is kept to avoid breaking changes.
// The main feed logic is now handled directly on the home page.

type InteractionType = 'view' | 'like' | 'comment';

interface Interaction {
  type: InteractionType;
  category: string;
  streamId: string;
  tags?: string[];
}

interface SessionContextType {
  interactions: Interaction[];
  addInteraction: (interaction: Interaction) => void;
  getTopCategory: () => string | null;
  getViewedStreamIds: () => string[];
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [interactions, setInteractions] = useState<Interaction[]>([]);

  const addInteraction = (interaction: Interaction) => {
    setInteractions((prevInteractions) => [...prevInteractions, interaction]);
  };

  const getTopCategory = (): string | null => {
    if (interactions.length === 0) {
      return null;
    }

    const categoryCounts = interactions.reduce((acc, interaction) => {
      acc[interaction.category] = (acc[interaction.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const topCategory = Object.keys(categoryCounts).reduce((a, b) =>
      categoryCounts[a] > categoryCounts[b] ? a : b
    );

    return topCategory;
  };
  
  const getViewedStreamIds = (): string[] => {
    // Use a Set to get unique stream IDs
    const viewedIds = new Set(
        interactions
            .filter(i => i.type === 'view')
            .map(i => i.streamId)
    );
    return Array.from(viewedIds);
  }

  const contextValue = useMemo(() => ({
    interactions,
    addInteraction,
    getTopCategory,
    getViewedStreamIds,
  }), [interactions]);


  return (
    <SessionContext.Provider value={contextValue}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  const context = useContext(SessionContext);
  if (context === undefined) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  return context;
}

    