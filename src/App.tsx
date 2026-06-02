/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { Mood } from './types';
import MoodPicker from './components/MoodPicker';
import MoodDashboard from './components/MoodDashboard';
import NavigationViews from './components/NavigationViews';

// Curated default playlists to feed our station decks immediately
const PRE_CURATED_PLAYLISTS: Record<string, { name: string; artist: string; duration: string }[]> = {
  hype: [
    { name: 'Blinding Lights', artist: 'The Weeknd', duration: '03:20' },
    { name: "Don't Stop Me Now", artist: 'Queen', duration: '03:29' },
    { name: 'Stay', artist: 'The Kid LAROI & Justin Bieber', duration: '02:21' },
    { name: 'Humility', artist: 'Gorillaz', duration: '03:17' },
    { name: 'Starboy', artist: 'The Weeknd ft. Daft Punk', duration: '03:50' }
  ],
  chill: [
    { name: 'Sunset Lover', artist: 'Petit Biscuit', duration: '03:57' },
    { name: 'Weightless', artist: 'Marconi Union', duration: '08:00' },
    { name: 'Intro', artist: 'The xx', duration: '02:08' },
    { name: 'Amber', artist: '311', duration: '03:21' },
    { name: 'Sunrise', artist: 'Norah Jones', duration: '03:20' }
  ],
  melancholic: [
    { name: 'Someone Like You', artist: 'Adele', duration: '04:45' },
    { name: 'Fix You', artist: 'Coldplay', duration: '04:55' },
    { name: 'Skinny Love', artist: 'Bon Iver', duration: '03:59' },
    { name: 'Creep', artist: 'Radiohead', duration: '03:58' },
    { name: 'Breathe Me', artist: 'Sia', duration: '04:32' }
  ],
  focus: [
    { name: 'Resonance', artist: 'Home', duration: '03:32' },
    { name: 'Time', artist: 'Hans Zimmer', duration: '04:35' },
    { name: 'Clair de Lune', artist: 'Claude Debussy', duration: '05:05' },
    { name: 'Gymnopedie No.1', artist: 'Erik Satie', duration: '03:10' },
    { name: 'Nightcrawler', artist: 'Kavinsky', duration: '03:44' }
  ],
  euphoric: [
    { name: 'Walking on Sunshine', artist: 'Katrina & The Waves', duration: '03:58' },
    { name: 'Happy', artist: 'Pharrell Williams', duration: '03:53' },
    { name: 'Good Vibrations', artist: 'The Beach Boys', duration: '03:35' },
    { name: 'On Top Of The World', artist: 'Imagine Dragons', duration: '03:12' },
    { name: 'Safe and Sound', artist: 'Capital Cities', duration: '03:13' }
  ],
  romantic: [
    { name: 'Perfect', artist: 'Ed Sheeran', duration: '04:23' },
    { name: 'All of Me', artist: 'John Legend', duration: '04:29' },
    { name: 'Make You Feel My Love', artist: 'Adele', duration: '03:32' },
    { name: 'Thinking Out Loud', artist: 'Ed Sheeran', duration: '04:41' },
    { name: 'At Last', artist: 'Etta James', duration: '03:00' }
  ]
};

// Generates direct fallback query search urls for Spotify & YouTube
function createTracksForMood(moodId: string) {
  const songs = PRE_CURATED_PLAYLISTS[moodId] || [];
  return songs.map((song, index) => {
    const query = `${song.name} ${song.artist}`;
    return {
      id: `${moodId}-preset-${index}`,
      name: song.name,
      artist: song.artist,
      duration: song.duration,
      spotifyUrl: `https://open.spotify.com/search/${encodeURIComponent(query)}`,
      youtubeUrl: `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`
    };
  });
}

const APP_MOODS: Mood[] = [
  {
    id: 'hype',
    name: 'Hype',
    emoji: '🔥',
    description: 'High octane loops & beats. Power through workouts or gaming sessions.',
    color: 'red-500',
    accentColor: '#EF4444',
    bgGradient: 'from-orange-600/30 via-red-600/20 to-slate-900/10',
    preCuratedTracks: createTracksForMood('hype')
  },
  {
    id: 'chill',
    name: 'Chill',
    emoji: '🍃',
    description: 'Slow tempo lo-fi & ambient soundscapes for calming down.',
    color: 'emerald-500',
    accentColor: '#10B981',
    bgGradient: 'from-emerald-600/25 via-teal-600/15 to-slate-900/10',
    preCuratedTracks: createTracksForMood('chill')
  },
  {
    id: 'melancholic',
    name: 'Melancholic',
    emoji: '😢',
    description: 'Indie ballads & heavy keys. Beautiful space for gray clouds.',
    color: 'blue-500',
    accentColor: '#3B82F6',
    bgGradient: 'from-blue-600/25 via-indigo-900/15 to-slate-900/10',
    preCuratedTracks: createTracksForMood('melancholic')
  },
  {
    id: 'focus',
    name: 'Focus',
    emoji: '🌌',
    description: 'Binaural wave-lengths & synthwave tracks for coding flow.',
    color: 'indigo-500',
    accentColor: '#6366F1',
    bgGradient: 'from-indigo-600/25 via-purple-900/15 to-slate-900/10',
    preCuratedTracks: createTracksForMood('focus')
  },
  {
    id: 'euphoric',
    name: 'Euphoric',
    emoji: '☀️',
    description: 'Bright sunshine feel-goods and golden pop dance frequencies.',
    color: 'amber-500',
    accentColor: '#F59E0B',
    bgGradient: 'from-amber-600/25 via-yellow-600/15 to-slate-900/10',
    preCuratedTracks: createTracksForMood('euphoric')
  },
  {
    id: 'romantic',
    name: 'Romantic',
    emoji: '💖',
    description: 'Acoustic love notes & smooth jazz in a candle-lit acoustic layout.',
    color: 'pink-500',
    accentColor: '#EC4899',
    bgGradient: 'from-pink-600/25 via-rose-600/15 to-slate-900/10',
    preCuratedTracks: createTracksForMood('romantic')
  }
];

export default function App() {
  const [selectedMood, setSelectedMood] = useState<Mood | null>(null);
  const [nickname, setNickname] = useState<string>(() => {
    return localStorage.getItem('moodmatch_nickname') || '';
  });
  const [activeNavTab, setActiveNavTab] = useState<'communities' | 'analytics' | 'settings' | null>(null);

  // Auto-detect and open shared station from URL query parameters
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const moodParam = params.get('mood');
      if (moodParam) {
        const matchingMood = APP_MOODS.find(m => m.id === moodParam);
        if (matchingMood) {
          setSelectedMood(matchingMood);
        }
      }
    } catch (e) {
      console.error("Error reading initial URL params: ", e);
    }
  }, []);

  // Keep nickname persistent in local client preferences
  useEffect(() => {
    if (nickname) {
      localStorage.setItem('moodmatch_nickname', nickname);
    } else {
      localStorage.removeItem('moodmatch_nickname');
    }
  }, [nickname]);

  return (
    <div className="bg-[#0a0a0c] min-h-screen text-zinc-100 selection:bg-emerald-500/35 overflow-y-auto font-sans">
      {selectedMood ? (
        <MoodDashboard
          mood={selectedMood}
          nickname={nickname}
          setNickname={setNickname}
          onGoBack={() => setSelectedMood(null)}
          onOpenNavTab={(tab) => setActiveNavTab(tab)}
        />
      ) : (
        <MoodPicker
          moods={APP_MOODS}
          onSelectMood={(mood) => setSelectedMood(mood)}
          onOpenNavTab={(tab) => setActiveNavTab(tab)}
        />
      )}

      {activeNavTab && (
        <NavigationViews
          currentTab={activeNavTab}
          onClose={() => setActiveNavTab(null)}
          moods={APP_MOODS}
          activeMood={selectedMood}
          onSelectMood={(mood) => setSelectedMood(mood)}
          nickname={nickname}
          setNickname={setNickname}
        />
      )}
    </div>
  );
}

