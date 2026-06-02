/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from 'motion/react';
import { Mood } from '../types';

interface MoodPickerProps {
  moods: Mood[];
  onSelectMood: (mood: Mood) => void;
  onOpenNavTab?: (tab: 'communities' | 'analytics' | 'settings') => void;
}

export default function MoodPicker({ moods, onSelectMood, onOpenNavTab }: MoodPickerProps) {
  return (
    <div className="min-h-screen bg-[#0a0a0c] text-zinc-100 flex flex-col items-center p-4 relative overflow-hidden select-none">
      {/* Decorative ambient blobs matching the reference HTML */}
      <div className="absolute top-[-100px] left-[-100px] w-[400px] h-[400px] bg-purple-600/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-100px] right-[-100px] w-[500px] h-[500px] bg-emerald-500/10 blur-[120px] rounded-full pointer-events-none" />

      {/* Main Container Wrapper */}
      <div className="w-full max-w-4xl z-10 flex flex-col items-center">
        
        {/* Navigation bar from reference design */}
        <nav className="w-full h-16 flex items-center justify-between px-6 bg-zinc-900/40 backdrop-blur-md border border-white/5 rounded-2xl mt-2 mb-10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-blue-500 rounded-lg flex items-center justify-center font-bold text-black font-display">M</div>
            <span className="text-sm sm:text-base font-bold tracking-tight font-sans text-white">MoodMatch <span className="text-emerald-400">v1.0</span></span>
          </div>
          <div className="hidden md:flex items-center gap-6 text-xs sm:text-sm font-medium text-zinc-400">
            <span className="text-white font-bold cursor-default">Dashboard</span>
            <span 
              onClick={() => onOpenNavTab?.('communities')} 
              className="hover:text-white transition duration-200 cursor-pointer"
            >
              Communities
            </span>
            <span 
              onClick={() => onOpenNavTab?.('analytics')} 
              className="hover:text-white transition duration-200 cursor-pointer"
            >
              Analytics
            </span>
            <span 
              onClick={() => onOpenNavTab?.('settings')} 
              className="hover:text-white transition duration-200 cursor-pointer"
            >
              Settings
            </span>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <div className="px-3 py-1 bg-zinc-800/80 rounded-full border border-white/10 flex items-center gap-2 text-[10px] sm:text-xs text-zinc-300">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
              WebSocket: Connected
            </div>
          </div>
        </nav>

        {/* Header text container */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-xl text-center mb-8 px-4"
        >
          <span className="inline-block px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-emerald-400 bg-emerald-950/40 rounded-full border border-emerald-500/20">
            VIBE SYNCHRONIZER
          </span>
          <h1 className="mt-4 text-3xl sm:text-5xl font-black tracking-tight text-white font-sans">
            How are you feeling?
          </h1>
          <p className="mt-3 text-zinc-400 text-xs sm:text-sm max-w-md mx-auto leading-relaxed">
            Choose your wavelength below to tune in, gather with others, and access curated soundtrack decks.
          </p>
        </motion.div>

        {/* Dynamic selector list/grid */}
        <div className="w-full max-w-md grid grid-cols-2 gap-3 px-4 font-sans mb-10">
          {moods.map((mood, idx) => (
            <motion.button
              key={mood.id}
              id={`mood-btn-${mood.id}`}
              onClick={() => onSelectMood(mood)}
              className="group relative flex flex-col items-center justify-center p-5 rounded-2xl bg-zinc-900/40 backdrop-blur-md border border-white/5 hover:border-emerald-500/30 hover:bg-emerald-500/10 active:scale-95 transition-all text-center aspect-square shadow-lg overflow-hidden cursor-pointer"
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: idx * 0.05 }}
              whileHover={{ y: -4 }}
            >
              {/* Giant Thumb-friendly Emoji */}
              <span className="text-4xl sm:text-5xl mb-2.5 drop-shadow transition-transform duration-300 group-hover:scale-110 select-none">
                {mood.emoji}
              </span>

              {/* Mood label details */}
              <h3 className="font-bold text-zinc-150 text-sm sm:text-base tracking-wide mt-1">
                {mood.name}
              </h3>
              <p className="text-[10px] text-zinc-500 font-medium px-1 mt-1 line-clamp-1 group-hover:text-zinc-300">
                {mood.description}
              </p>
            </motion.button>
          ))}
        </div>

        {/* Quality Badge */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-xs text-zinc-500 font-mono tracking-wider flex items-center gap-1.5"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          Live synchronized DJ audio rooms ready.
        </motion.div>
      </div>
    </div>
  );
}
