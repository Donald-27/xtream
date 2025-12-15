
export interface Medal {
  name: string;
  color: string;
  threshold: number;
}

const MEDALS: Medal[] = [
  { name: 'Diamond', color: '#b9f2ff', threshold: 1000000 },
  { name: 'Platinum', color: '#e5e4e2', threshold: 500000 },
  { name: 'Gold', color: '#FFD700', threshold: 50000 },
  { name: 'Silver', color: '#C0C0C0', threshold: 5000 },
  { name: 'Bronze', color: '#CD7F32', threshold: 500 },
];

export const getMedal = (followerCount: number): Medal | null => {
  for (const medal of MEDALS) {
    if (followerCount >= medal.threshold) {
      return medal;
    }
  }
  return null;
};
