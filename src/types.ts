/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Track {
  id: string;
  name: string;
  artist: string;
  duration: string;
  spotifyUrl: string;
  youtubeUrl: string;
}

export interface Message {
  id: string;
  nickname: string;
  text: string;
  timestamp: string;
  isBot: boolean;
  mood: string;
  userAvatar?: string;
}

export interface Mood {
  id: string;
  name: string;
  emoji: string;
  description: string;
  color: string; // Tailwind class name, e.g., 'emerald-500'
  accentColor: string; // e.g., '#10B981'
  bgGradient: string; // tailwind gradient classes
  preCuratedTracks: Track[];
}
