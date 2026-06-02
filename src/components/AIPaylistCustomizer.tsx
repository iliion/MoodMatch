/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, FormEvent } from 'react';
import { Track } from '../types';
import { Wand2, Play, Music, Sparkles, AlertCircle, Youtube, ExternalLink, Globe } from 'lucide-react';
import { motion } from 'motion/react';

interface AIPaylistCustomizerProps {
  onAddTracksToDashboard: (tracks: Track[], vibeLabel: string) => void;
}

export default function AIPaylistCustomizer({ onAddTracksToDashboard }: AIPaylistCustomizerProps) {
  const [prompt, setPrompt] = useState('');
  const [isCurationLoading, setIsCurationLoading] = useState(false);
  const [vibeResult, setVibeResult] = useState<{
    vibeName: string;
    aiThoughts: string;
    tracks: Track[];
    groundingSources?: { title: string; url: string }[];
  } | null>(null);
  const [errorStatus, setErrorStatus] = useState<string | null>(null);

  const handleCuratePlaylist = async (e: FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || isCurationLoading) return;

    setIsCurationLoading(true);
    setErrorStatus(null);
    setVibeResult(null);

    try {
      const res = await fetch('/api/gemini/curate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: prompt.trim() })
      });

      if (!res.ok) {
        throw new Error('Failed to generate customized music recommendation. Try again.');
      }

      const data = await res.json();
      setVibeResult(data);
    } catch (err: any) {
      console.error('Curation error:', err);
      setErrorStatus(err.message || 'Server error generating playlist tracks.');
    } finally {
      setIsCurationLoading(false);
    }
  };

  const applyCuratedToTracks = () => {
    if (vibeResult) {
      onAddTracksToDashboard(vibeResult.tracks, vibeResult.vibeName);
    }
  };

  return (
    <div className="p-5 rounded-2xl bg-zinc-900/40 border border-white/5 backdrop-blur-md font-sans shadow-lg">
      <div className="flex items-center gap-2.5 mb-3">
        <div className="p-2 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
          <Sparkles className="w-5 h-5 text-emerald-400 animate-pulse" />
        </div>
        <div>
          <h4 className="font-bold text-zinc-200 text-xs uppercase tracking-wider">
            AI Customized Vibe Generator
          </h4>
          <p className="text-[11px] text-zinc-400">
            Explain your precise scene to let Gemini assemble a targeted music setlist.
          </p>
        </div>
      </div>

      {/* Input query form */}
      <form onSubmit={handleCuratePlaylist} className="space-y-3">
        <textarea
          id="custom-vibe-prompt"
          required
          rows={2}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="e.g. late night programming a neo-tokyo cyberspace app on 3 cups of coffee..."
          className="w-full px-3.5 py-2.5 bg-zinc-950/80 border border-white/10 focus:border-emerald-500 text-zinc-100 placeholder-zinc-500 rounded-xl focus:outline-none text-xs leading-relaxed font-semibold transition"
        />
        
        <button
          id="btn-trigger-ai-curate"
          type="submit"
          disabled={isCurationLoading || !prompt.trim()}
          className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 text-black font-black rounded-xl text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer shadow-md"
        >
          {isCurationLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
              <span>Mixing AI Tracks...</span>
            </>
          ) : (
            <>
              <Wand2 className="w-4 h-4" />
              <span>Generate AI Vibe Setlist</span>
            </>
          )}
        </button>
      </form>

      {/* Error Output display prompt */}
      {errorStatus && (
        <div className="mt-3.5 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 flex items-start gap-2 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <p>{errorStatus}</p>
        </div>
      )}

      {/* Result Display container */}
      {vibeResult && (
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-5 border-t border-white/5 pt-4"
        >
          {/* Result details pane */}
          <div className="bg-emerald-500/5 border border-emerald-500/15 p-3.5 rounded-xl">
            <div className="flex items-start justify-between gap-2">
              <div>
                <span className="text-[9px] uppercase tracking-wider font-extrabold text-emerald-400">
                  AI CRAFTED MATCH
                </span>
                <h5 className="font-extrabold text-zinc-150 text-sm mt-0.5 leading-snug">
                  {vibeResult.vibeName}
                </h5>
              </div>
              
              <button
                id="btn-apply-tracks"
                onClick={applyCuratedToTracks}
                className="text-[10px] font-bold text-black bg-emerald-500 hover:bg-emerald-400 px-3 py-1.5 rounded-lg active:scale-95 shrink-0 transition cursor-pointer uppercase tracking-wider font-bold"
              >
                Apply to Deck
              </button>
            </div>
            
            <p className="text-zinc-300 text-xs mt-2.5 leading-relaxed italic bg-zinc-900/60 p-2.5 rounded-lg font-medium border border-white/5">
              "{vibeResult.aiThoughts}"
            </p>

            {/* Real-time Verification Sources via Google Search Grounding */}
            {vibeResult.groundingSources && vibeResult.groundingSources.length > 0 && (
              <div className="mt-3 p-2.5 rounded-lg bg-emerald-500/5 border border-emerald-500/10 space-y-2">
                <span className="text-[9px] uppercase tracking-wider font-bold text-emerald-400 flex items-center gap-1">
                  <Globe className="w-3 h-3 text-emerald-400" />
                  Real-time Verification Sources (Google Search)
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {vibeResult.groundingSources.map((source, idx) => (
                    <a
                      key={idx}
                      href={source.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-zinc-950/60 hover:bg-zinc-950 border border-white/5 hover:border-emerald-500/30 text-[10px] text-zinc-400 hover:text-emerald-400 transition truncate max-w-[220px]"
                      title={source.title}
                    >
                      <span className="truncate">{source.title}</span>
                      <ExternalLink className="w-2.5 h-2.5 shrink-0" />
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Generated track loops */}
            <div className="mt-3.5 space-y-2">
              {vibeResult.tracks.map((track, idx) => (
                <div 
                  key={track.id}
                  className="flex items-center justify-between p-2 rounded-lg bg-zinc-900/50 border border-white/5 text-xs hover:border-white/20 transition"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-6 h-6 rounded bg-emerald-500/10 flex items-center justify-center shrink-0">
                      <Music className="w-3.5 h-3.5 text-emerald-400" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-zinc-150 truncate">{track.name}</p>
                      <p className="text-[10px] text-zinc-500 truncate">{track.artist}</p>
                    </div>
                  </div>

                  {/* One-tap Spotify/YouTube links */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    <a
                      id={`spotify-btn-${track.id}`}
                      href={track.spotifyUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 rounded bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/15 transition flex items-center justify-center gap-1 cursor-pointer"
                      title="Open in Spotify"
                    >
                      <span className="text-[9px] font-bold px-0.5">Spotify</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                    
                    <a
                      id={`youtube-btn-${track.id}`}
                      href={track.youtubeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 rounded bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/15 transition flex items-center justify-center gap-1 cursor-pointer"
                      title="Open in YouTube"
                    >
                      <Youtube className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
