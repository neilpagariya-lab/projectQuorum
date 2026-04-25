// Genre → Group Archetype mappings
export const ARCHETYPE_MAP: Record<string, string> = {
  'Action,Sci-Fi': 'Adrenaline Seekers',
  'Action,Thriller': 'Edge-of-Seat Junkies',
  'Romance,Drama': 'Hopeless Romantics',
  'Horror,Thriller': 'Thrill Chasers',
  'Comedy,Romance': 'Feel-Good Crew',
  'Comedy,Drama': 'Laugh-Cry Enthusiasts',
  'Drama,Thriller': 'Tension Addicts',
  'Sci-Fi,Drama': 'Deep Thinkers',
  'Horror,Comedy': 'Scare & Giggle Squad',
  'Action,Drama': 'Epic Saga Lovers',
  'Comedy': 'The Laugh Track',
  'Drama': 'The Critics',
  'Action': 'Pure Adrenaline',
  'Horror': 'Nightmare Fuel Fans',
  'Romance': 'Heart-Eyes Only',
  'Sci-Fi': 'Sci-Fi Nerds',
  'Thriller': 'Suspense Seekers',
};

export const FALLBACK_ARCHETYPES = [
  'The Eclectic Bunch',
  'Cinematic Explorers',
  'Genre Hoppers',
];

export const PARTICIPANT_BADGE_RULES = [
  { condition: 'most_loves', badge: '❤️ The Enthusiast' },
  { condition: 'most_nos', badge: '🚫 The Critic' },
  { condition: 'fastest_voter', badge: '⚡ Speed Demon' },
  { condition: 'slowest_voter', badge: '🤔 The Deliberator' },
  { condition: 'most_unique', badge: '🦄 The Contrarian' },
] as const;
