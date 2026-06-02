/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { Mood, Track } from '../types';
import { ChevronLeft, Music, MessageSquare, ExternalLink, Youtube, Headphones, Sparkles, Volume2, VolumeX, Play, Pause, SkipForward, SkipBack, Download, Share2 } from 'lucide-react';
import { motion } from 'motion/react';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import VibeChatRoom from './VibeChatRoom';
import AIPaylistCustomizer from './AIPaylistCustomizer';

interface MoodDashboardProps {
  mood: Mood;
  nickname: string;
  setNickname: (name: string) => void;
  onGoBack: () => void;
  onOpenNavTab?: (tab: 'communities' | 'analytics' | 'settings') => void;
}

export default function MoodDashboard({ mood, nickname, setNickname, onGoBack, onOpenNavTab }: MoodDashboardProps) {
  const [activeTab, setActiveTab] = useState<'tracks' | 'chat'>('tracks');
  const [sessionTracks, setSessionTracks] = useState<Track[]>(mood.preCuratedTracks);
  const [vibeLabel, setVibeLabel] = useState<string>(`${mood.name} curation`);
  const [intensities, setIntensities] = useState<{ subject: string; value: number }[]>([]);
  const [volume, setVolume] = useState<number>(75);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [currentTrackIndex, setCurrentTrackIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [playbackSecs, setPlaybackSecs] = useState<number>(24);
  const [shareMessage, setShareMessage] = useState<string | null>(null);

  // Mock running audio track timeline ticker
  useEffect(() => {
    let interval: any = null;
    if (isPlaying) {
      interval = setInterval(() => {
        setPlaybackSecs((prev) => {
          if (prev >= 180) { // standard song duration limit
            setCurrentTrackIndex((idx) => (idx + 1) % sessionTracks.length);
            return 0;
          }
          return prev + 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying, sessionTracks.length]);

  // Reset timeline ticker when track changes
  useEffect(() => {
    setPlaybackSecs(0);
  }, [currentTrackIndex]);

  // Global keydown keyboard listeners to control playback, omitting triggers when typing in text fields
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeEl = document.activeElement;
      if (activeEl) {
        const tagName = activeEl.tagName.toUpperCase();
        if (tagName === 'INPUT' || tagName === 'TEXTAREA' || activeEl.hasAttribute('contenteditable')) {
          return;
        }
      }

      if (e.code === 'Space') {
        e.preventDefault();
        setIsPlaying((prev) => !prev);
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        setCurrentTrackIndex((prev) => (prev + 1) % sessionTracks.length);
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        setCurrentTrackIndex((prev) => (prev - 1 + sessionTracks.length) % sessionTracks.length);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [sessionTracks.length]);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Calculate & Synchronize Dynamic Intensity Waves based on selected mood & active label
  useEffect(() => {
    // Check if user loaded customized metrics parameter through a shared link
    try {
      const params = new URLSearchParams(window.location.search);
      const sharedMetrics = params.get('metrics');
      if (sharedMetrics) {
        const parsed = JSON.parse(decodeURIComponent(sharedMetrics));
        if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].subject) {
          setIntensities(parsed);
          // Gently replace the metrics search params so that further real-time updates don't lock
          const cleanSearch = `?mood=${mood.id}`;
          const cleanUrl = window.location.protocol + "//" + window.location.host + window.location.pathname + cleanSearch;
          window.history.replaceState({ path: cleanUrl }, '', cleanUrl);
          return;
        }
      }
    } catch (err) {
      console.error("Failed to parse shared URL metrics: ", err);
    }

    const baseValues: Record<string, Record<string, number>> = {
      hype: { Energy: 95, Focus: 40, Calm: 15, Social: 85, Positive: 90 },
      chill: { Energy: 20, Focus: 75, Calm: 95, Social: 30, Positive: 80 },
      melancholic: { Energy: 25, Focus: 85, Calm: 70, Social: 15, Positive: 30 },
      focus: { Energy: 40, Focus: 98, Calm: 80, Social: 20, Positive: 75 },
      euphoric: { Energy: 90, Focus: 50, Calm: 60, Social: 95, Positive: 98 },
      romantic: { Energy: 35, Focus: 60, Calm: 85, Social: 75, Positive: 85 },
    };

    const currentBase = baseValues[mood.id] || { Energy: 50, Focus: 50, Calm: 50, Social: 50, Positive: 50 };

    if (vibeLabel !== `${mood.name} curation`) {
      let hash = 0;
      for (let i = 0; i < vibeLabel.length; i++) {
        hash = vibeLabel.charCodeAt(i) + ((hash << 5) - hash);
      }
      
      const mapped = Object.entries(currentBase).map(([metric, value], idx) => {
        const offset = ((Math.abs(hash) + idx * 17) % 31) - 15;
        const newValue = Math.max(10, Math.min(100, value + offset));
        return { subject: metric, value: newValue };
      });
      setIntensities(mapped);
    } else {
      const mapped = Object.entries(currentBase).map(([metric, value]) => ({
        subject: metric,
        value,
      }));
      setIntensities(mapped);
    }
  }, [mood, vibeLabel]);

  // Handle fine-tuning sliders updating the radar shape dynamically
  const handleIntensityChange = (subject: string, value: number) => {
    setIntensities(prev => 
      prev.map(item => item.subject === subject ? { ...item, value } : item)
    );
  };

  // Handle setting a custom Gemini AI track output directly within the user deck
  const handleApplyAITracks = (aiTracks: Track[], customLabel: string) => {
    setSessionTracks(aiTracks);
    setVibeLabel(customLabel);
    setActiveTab('tracks'); // flip focus to the playlist deck to view them!
    setCurrentTrackIndex(0);
    setIsPlaying(true);
  };

  // Reset to original preset playlist
  const handleResetToPrecurated = () => {
    setSessionTracks(mood.preCuratedTracks);
    setVibeLabel(`${mood.name} curation`);
    setCurrentTrackIndex(0);
    setIsPlaying(true);
  };

  // Download current session tracklist as a JSON file
  const handleDownloadJSON = () => {
    try {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(sessionTracks, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", dataStr);
      const filename = `moodmatch-${mood.id}-tracklist.json`;
      downloadAnchor.setAttribute("download", filename);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    } catch (err) {
      console.error("Failed to export JSON tracklist: ", err);
    }
  };

  // Download current session tracklist as a CSV file
  const handleDownloadCSV = () => {
    try {
      const headers = ["ID", "Name", "Artist", "Duration", "Spotify URL", "YouTube URL"];
      const rows = sessionTracks.map((t, idx) => [
        t.id,
        `"${t.name.replace(/"/g, '""')}"`,
        `"${t.artist.replace(/"/g, '""')}"`,
        t.duration,
        t.spotifyUrl,
        t.youtubeUrl
      ]);
      const csvContent = [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
      const dataStr = "data:text/csv;charset=utf-8," + encodeURIComponent(csvContent);
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", dataStr);
      const filename = `moodmatch-${mood.id}-tracklist.csv`;
      downloadAnchor.setAttribute("download", filename);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    } catch (err) {
      console.error("Failed to export CSV tracklist: ", err);
    }
  };

  // Copy custom vibe spectrum setup link to clipboard
  const handleShareMetricsLink = () => {
    try {
      const shareUrl = `${window.location.protocol}//${window.location.host}${window.location.pathname}?mood=${mood.id}&metrics=${encodeURIComponent(JSON.stringify(intensities))}`;
      navigator.clipboard.writeText(shareUrl);
      setShareMessage("Vibe spectrum link copied!");
      setTimeout(() => {
        setShareMessage(null);
      }, 3500);
    } catch (err) {
      console.error("Clipboard copy failed: ", err);
      setShareMessage("Export via downloaded file instead!");
    }
  };

  // Export a direct text metrics summary as snapshot
  const handleExportMetricsTXT = () => {
    try {
      const textLines = [
        `=== MoodMatch Vibe Spectrum Signature ===`,
        `Station Name: #${mood.name}`,
        `Station Description: ${mood.description}`,
        `Current Playback Vibe: ${vibeLabel}`,
        `Metric Values:`,
        ...intensities.map(i => ` - ${i.subject}: ${i.value}%`),
        `Generated At: ${new Date().toISOString()}`,
        `========================================`
      ].join("\n");
      const dataStr = "data:text/plain;charset=utf-8," + encodeURIComponent(textLines);
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", dataStr);
      const filename = `moodmatch-${mood.id}-spectrum-snapshot.txt`;
      downloadAnchor.setAttribute("download", filename);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      setShareMessage("Spectrum snapshot exported!");
      setTimeout(() => {
        setShareMessage(null);
      }, 3500);
    } catch (err) {
      console.error("Text metrics export failed: ", err);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-zinc-100 flex flex-col font-sans select-none relative overflow-x-hidden p-4">
      
      {/* Decorative ambient blobs matching the reference HTML */}
      <div className="absolute top-[-100px] left-[-100px] w-[400px] h-[400px] bg-purple-600/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-100px] right-[-100px] w-[500px] h-[500px] bg-emerald-500/10 blur-[120px] rounded-full pointer-events-none" />

      {/* Navigation header row matching reference design */}
      <nav className="w-full max-w-4xl mx-auto h-16 flex items-center justify-between px-6 bg-zinc-900/40 backdrop-blur-md border border-white/5 rounded-2xl mb-4 z-10 shrink-0">
        <div className="flex items-center gap-3">
          <button
            id="btn-back-to-picker"
            onClick={onGoBack}
            className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-blue-500 rounded-lg flex items-center justify-center font-bold text-black font-display cursor-pointer hover:opacity-90 active:scale-95 transition-all text-xs"
            title="Return to Picker"
          >
            ←
          </button>
          <span className="text-sm font-bold tracking-tight text-white flex items-center gap-1 font-sans">
            MoodMatch <span className="text-emerald-400">v1.0</span>
          </span>
        </div>
        <div className="hidden md:flex items-center gap-6 text-xs sm:text-sm font-medium text-zinc-400">
          <span onClick={onGoBack} className="hover:text-white transition cursor-pointer text-white font-bold">Dashboard</span>
          <span 
            onClick={() => onOpenNavTab?.('communities')} 
            className="hover:text-white transition duration-200 cursor-pointer text-zinc-300"
          >
            Communities
          </span>
          <span 
            onClick={() => onOpenNavTab?.('analytics')} 
            className="hover:text-white transition duration-200 cursor-pointer text-zinc-300"
          >
            Analytics
          </span>
          <span 
            onClick={() => onOpenNavTab?.('settings')} 
            className="hover:text-white transition duration-200 cursor-pointer text-zinc-300"
          >
            Settings
          </span>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          {/* Global Volume Controller linked to mock audio player state */}
          <div className="flex items-center gap-2 bg-zinc-800/60 border border-white/5 rounded-xl px-2.5 py-1.5 transition-all hover:border-white/10">
            <button
              onClick={() => setIsMuted(!isMuted)}
              className="text-zinc-400 hover:text-emerald-400 transition cursor-pointer flex items-center justify-center shrink-0"
              title={isMuted ? "Unmute Mock Player" : "Mute Mock Player"}
            >
              {isMuted || volume === 0 ? (
                <VolumeX className="w-4 h-4 text-zinc-500" />
              ) : (
                <Volume2 className="w-4 h-4 text-emerald-400" />
              )}
            </button>
            <input
              type="range"
              min="0"
              max="100"
              value={isMuted ? 0 : volume}
              onChange={(e) => {
                const vol = Number(e.target.value);
                setVolume(vol);
                if (vol > 0) {
                  setIsMuted(false);
                }
              }}
              className="w-12 sm:w-20 h-1 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-emerald-500 focus:outline-none"
              title={`Mock Volume: ${isMuted ? 0 : volume}%`}
            />
            <span className="hidden sm:inline-block font-mono text-[9px] text-zinc-400 w-7 text-right">
              {isMuted ? 0 : volume}%
            </span>
          </div>

          <div className="px-3 py-1 bg-zinc-800/80 rounded-full border border-white/10 flex items-center gap-2 text-[10px] sm:text-xs text-zinc-300">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
            WebSocket: Connected
          </div>
        </div>
      </nav>

      {/* Main dashboard content container */}
      <main className="w-full max-w-4xl mx-auto flex-1 z-10 flex flex-col">
        
        {/* Mood description card, modern bento card layout */}
        <section className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between p-5 rounded-2xl bg-zinc-900/40 border border-white/5 backdrop-blur-md gap-4">
          <div className="flex items-center gap-4">
            <motion.div
              initial={{ scale: 0.8, rotate: -5 }}
              animate={{ scale: 1, rotate: 0 }}
              className="text-4xl sm:text-5xl p-2.5 bg-zinc-800/40 rounded-2xl border border-white/5 shadow-lg shrink-0 flex items-center justify-center aspect-square select-none"
            >
              {mood.emoji}
            </motion.div>
            
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-black text-white capitalize tracking-tight">
                  #{mood.name} Station
                </h2>
                <span className="px-2 py-0.5 rounded text-[9px] bg-emerald-500/20 text-emerald-400 font-bold tracking-wide uppercase">
                  Connected
                </span>
              </div>
              <p className="text-zinc-400 text-xs mt-1 max-w-md font-medium leading-relaxed">
                {mood.description} — You are synchronized with others in this live room.
              </p>
            </div>
          </div>

          {/* Tab buttons optimized for thumbs in reference style */}
          <div className="flex bg-zinc-950 p-1 rounded-xl border border-white/5 shrink-0 self-start sm:self-center font-sans">
            <button
              id="tab-btn-tracks"
              onClick={() => setActiveTab('tracks')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition duration-200 cursor-pointer ${
                activeTab === 'tracks'
                  ? 'bg-emerald-500 text-black shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Music className="w-3.5 h-3.5" />
              Playlist
            </button>
            
            <button
              id="tab-btn-chat"
              onClick={() => setActiveTab('chat')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition duration-200 cursor-pointer ${
                activeTab === 'chat'
                  ? 'bg-emerald-500 text-black shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              Chat Room
            </button>
          </div>
        </section>

        {/* Dynamic Display area depending on Active Tab pane */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start self-stretch">
          
          {/* Main Content Column */}
          <div className="md:col-span-7 space-y-4 self-stretch">
            {activeTab === 'tracks' ? (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-5 rounded-2xl bg-zinc-900/40 border border-white/5 backdrop-blur-md self-stretch flex flex-col"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 mb-4">
                  <div className="flex items-center gap-2">
                    <Headphones className="w-4 h-4 text-emerald-400" />
                    <h3 className="font-bold text-zinc-300 text-xs uppercase tracking-wider">
                      {vibeLabel} Tracks
                    </h3>
                  </div>
                  
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-[10px] text-zinc-500 font-mono">Export Deck:</span>
                    <button
                      id="btn-download-json"
                      onClick={handleDownloadJSON}
                      className="text-[10px] text-zinc-400 hover:text-emerald-400 font-bold cursor-pointer flex items-center gap-1 transition-all bg-zinc-800/50 hover:bg-zinc-850 border border-white/5 hover:border-emerald-500/20 px-2.5 py-1 rounded"
                      title="Download setup tracklist as JSON"
                    >
                      <Download className="w-2.5 h-2.5 text-emerald-400/80" />
                      JSON
                    </button>
                    <button
                      id="btn-download-csv"
                      onClick={handleDownloadCSV}
                      className="text-[10px] text-zinc-400 hover:text-emerald-400 font-bold cursor-pointer flex items-center gap-1 transition-all bg-zinc-800/50 hover:bg-zinc-850 border border-white/5 hover:border-emerald-500/20 px-2.5 py-1 rounded"
                      title="Download setup tracklist as CSV"
                    >
                      <Download className="w-2.5 h-2.5 text-emerald-400/80" />
                      CSV
                    </button>

                    {sessionTracks !== mood.preCuratedTracks && (
                      <button
                        id="btn-restore-playlist"
                        onClick={handleResetToPrecurated}
                        className="text-[10px] text-zinc-400 hover:text-emerald-400 font-bold cursor-pointer underline flex items-center transition ml-1"
                      >
                        Restore defaults
                      </button>
                    )}
                  </div>
                </div>

                <div className="space-y-3">
                  {sessionTracks.map((track, index) => {
                    const isNowPlaying = index === currentTrackIndex;
                    const isNext = index === (currentTrackIndex + 1) % sessionTracks.length;

                    return (
                      <div
                        key={track.id}
                        onClick={() => {
                          setCurrentTrackIndex(index);
                          setIsPlaying(true);
                        }}
                        className={`group flex gap-4 items-center p-3 sm:p-4 rounded-xl border transition-all cursor-pointer ${
                          isNowPlaying 
                            ? 'border-emerald-500/40 bg-zinc-800/80 shadow-md ring-1 ring-emerald-500/10' 
                            : 'border-white/5 bg-white/5 hover:border-white/20'
                        }`}
                      >
                        {/* Artwork/Gradient Block */}
                        <div className={`w-12 h-12 rounded-lg shrink-0 flex items-center justify-center font-bold text-xs select-none ${
                          isNowPlaying 
                            ? 'bg-gradient-to-br from-emerald-500 to-indigo-600 text-black' 
                            : 'bg-zinc-800 border border-white/5 text-zinc-400'
                        }`}>
                          {isNowPlaying ? (isPlaying ? '🔊' : '⏸') : index + 1}
                        </div>

                        {/* Track detail info */}
                        <div className="flex-1 min-w-0">
                          <p className={`font-extrabold text-sm truncate ${isNowPlaying ? 'text-emerald-400 font-black' : 'text-zinc-150'}`}>
                            {track.name}
                          </p>
                          <p className="text-xs text-zinc-400 truncate">
                            {track.artist}
                          </p>
                        </div>

                        {/* Status Label or actions */}
                        <div className="flex items-center gap-2 shrink-0" onClick={(e) => e.stopPropagation()}>
                          <span className="text-[10px] text-zinc-500 italic hidden sm:inline-block">
                            {isNowPlaying ? 'Now Playing' : isNext ? 'Up Next' : track.duration}
                          </span>

                          <a
                            id={`deck-spotify-${track.id}`}
                            href={track.spotifyUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-2.5 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/15 text-[10px] sm:text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                          >
                            <span>Spotify</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                          
                          <a
                            id={`deck-youtube-${track.id}`}
                            href={track.youtubeUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/15 transition flex items-center justify-center cursor-pointer"
                            title="Open YouTube Search"
                          >
                            <Youtube className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Floating Player Control Bar at the bottom of the playlist deck */}
                {sessionTracks[currentTrackIndex] && (
                  <div className="mt-5 bg-zinc-950/90 border border-white/10 rounded-xl p-4 flex flex-col gap-3 relative overflow-hidden backdrop-blur-md">
                    {/* Top running timeline progress element */}
                    <div className="w-full h-1 bg-zinc-800 rounded-full overflow-hidden absolute top-0 left-0">
                      <div 
                        className="h-full bg-emerald-500 transition-all duration-1000"
                        style={{ width: `${(playbackSecs / 180) * 100}%` }}
                      />
                    </div>

                    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-sans pt-1">
                      {/* Left: Track Name & Info */}
                      <div className="flex items-center gap-3 w-full sm:w-auto min-w-0">
                        <div className="w-9 h-9 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 rounded-lg flex items-center justify-center shrink-0 border border-emerald-500/10">
                          <Headphones className="w-4 h-4 text-emerald-400 animate-pulse" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-zinc-100 truncate">
                            {sessionTracks[currentTrackIndex].name}
                          </p>
                          <p className="text-[10px] text-zinc-500 truncate">
                            {sessionTracks[currentTrackIndex].artist}
                          </p>
                        </div>
                      </div>

                      {/* Center: Interactive Playback buttons */}
                      <div className="flex items-center gap-4 shrink-0">
                        <button
                          onClick={() => {
                            setCurrentTrackIndex((prev) => (prev - 1 + sessionTracks.length) % sessionTracks.length);
                          }}
                          className="p-1 px-1.5 text-zinc-400 hover:text-white active:scale-95 transition cursor-pointer"
                          title="Previous Track"
                        >
                          <SkipBack className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => setIsPlaying(!isPlaying)}
                          className="w-8 h-8 rounded-full bg-emerald-500 hover:bg-emerald-400 text-black flex items-center justify-center shadow-lg active:scale-90 transition cursor-pointer"
                          title={isPlaying ? "Pause Session Stream" : "Resume Session Stream"}
                        >
                          {isPlaying ? (
                            <Pause className="w-4 h-4 fill-black" />
                          ) : (
                            <Play className="w-4 h-4 fill-black ml-0.5" />
                          )}
                        </button>

                        <button
                          onClick={() => {
                            setCurrentTrackIndex((prev) => (prev + 1) % sessionTracks.length);
                          }}
                          className="p-1 px-1.5 text-zinc-400 hover:text-white active:scale-95 transition cursor-pointer"
                          title="Skip Track"
                        >
                          <SkipForward className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Right: Running timeline metadata timer */}
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="font-mono text-[10px] text-zinc-400">
                          {formatTime(playbackSecs)}
                        </span>
                        <span className="text-zinc-600 text-[9px] font-mono">/</span>
                        <span className="font-mono text-[10px] text-zinc-600">
                          03:00
                        </span>
                        <span className="px-1.5 py-0.5 rounded text-[8px] bg-emerald-500/20 text-emerald-400 font-bold uppercase tracking-wider font-mono">
                          {isPlaying ? 'Live stream' : 'Paused'}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="self-stretch"
              >
                <VibeChatRoom mood={mood} nickname={nickname} setNickname={setNickname} />
              </motion.div>
            )}
          </div>

          {/* Secondary Bento Grid Items: Custom prompt or helper panels */}
          <div className="md:col-span-5 space-y-4">
            
            {/* Dynamic Vibe Signature Radar Chart */}
            <div className="p-5 rounded-2xl bg-zinc-900/40 border border-white/5 backdrop-blur-md shadow-lg flex flex-col font-sans">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 mb-4">
                <div className="flex items-center gap-2">
                  <span className="p-1 px-1.5 bg-emerald-500/10 text-emerald-400 rounded text-[9px] font-bold leading-none font-sans uppercase">
                    Vibe Spectrum
                  </span>
                  <h4 className="font-bold text-zinc-200 text-xs uppercase tracking-wider">
                    Signature Analytics
                  </h4>
                </div>
                
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    id="btn-share-vibe-link"
                    onClick={handleShareMetricsLink}
                    className="text-[10px] text-zinc-400 hover:text-emerald-400 font-bold cursor-pointer flex items-center gap-1 transition-all bg-zinc-800/50 hover:bg-zinc-850 border border-white/5 hover:border-emerald-500/20 px-2.5 py-1 rounded"
                    title="Copy Shareable link with current custom metrics"
                  >
                    <Share2 className="w-2.5 h-2.5 text-emerald-400/80" />
                    Share Link
                  </button>
                  <button
                    id="btn-download-vibe-txt"
                    onClick={handleExportMetricsTXT}
                    className="text-[10px] text-zinc-400 hover:text-emerald-400 font-bold cursor-pointer flex items-center gap-1 transition-all bg-zinc-800/50 hover:bg-zinc-850 border border-white/5 hover:border-emerald-500/20 px-2.5 py-1 rounded"
                    title="Download current spectrum numbers as TXT summary snapshot"
                  >
                    <Download className="w-2.5 h-2.5 text-emerald-400/80" />
                    TXT
                  </button>
                </div>
              </div>

              {/* Share micro-notification block */}
              {shareMessage && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="mb-3 p-2 text-center text-[10px] font-mono font-bold bg-emerald-500/5 border border-emerald-500/10 rounded-lg text-emerald-400"
                >
                  {shareMessage}
                </motion.div>
              )}

              {/* The radar chart itself */}
              <div className="w-full h-[180px] flex items-center justify-center relative justify-self-center self-center" style={{ minWidth: '0' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="70%" data={intensities}>
                    <PolarGrid stroke="rgba(255, 255, 255, 0.08)" />
                    <PolarAngleAxis 
                      dataKey="subject" 
                      tick={{ fill: '#a1a1aa', fontSize: 10, fontWeight: 'bold', fontFamily: 'monospace' }} 
                    />
                    <PolarRadiusAxis 
                      angle={30} 
                      domain={[0, 100]} 
                      tick={false} 
                      axisLine={false}
                    />
                    <Radar
                      name="Intensity"
                      dataKey="value"
                      stroke={mood.accentColor}
                      fill={mood.accentColor}
                      fillOpacity={0.25}
                      isAnimationActive={true}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>

              {/* Intensity Customizers / Fine-tuning sliders */}
              <div className="mt-2 space-y-2.5 border-t border-white/5 pt-3">
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block mb-1">
                  Manual Fine-Tuning
                </span>
                
                <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                  {intensities.map((item) => (
                    <div key={item.subject} className="flex flex-col gap-0.5">
                      <div className="flex justify-between items-center text-[10px]">
                        <span className="font-medium text-zinc-400 font-mono">{item.subject}</span>
                        <span className="font-bold text-zinc-200 font-mono">{item.value}%</span>
                      </div>
                      <input
                        type="range"
                        min="10"
                        max="100"
                        value={item.value}
                        onChange={(e) => handleIntensityChange(item.subject, Number(e.target.value))}
                        className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-emerald-500 focus:outline-none"
                        style={{
                          accentColor: mood.accentColor,
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* AI Generator styled within zinc card */}
            <AIPaylistCustomizer onAddTracksToDashboard={handleApplyAITracks} />
            
            {/* Docker Status Box from Reference Design */}
            <div className="bg-zinc-900/40 backdrop-blur-md border border-white/5 rounded-2xl p-4 font-sans shadow-lg">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Docker Registry Status</span>
                <span className="text-[10px] bg-emerald-550/20 text-emerald-400 px-2 py-0.5 rounded font-bold uppercase tracking-wider">
                  Healthy
                </span>
              </div>
              <div className="space-y-2 font-mono text-[11px] text-zinc-400 leading-relaxed">
                <p className="flex justify-between border-b border-white/5 pb-1.5">
                  <span>moodmatch-api</span>
                  <span className="text-emerald-400 font-bold">Running</span>
                </p>
                <p className="flex justify-between border-b border-white/5 pb-1.5">
                  <span>redis-cache-service</span>
                  <span className="text-emerald-400 font-bold">Running</span>
                </p>
                <p className="flex justify-between pt-0.5">
                  <span>db-postgres-instance</span>
                  <span className="text-emerald-400 font-bold">Running</span>
                </p>
              </div>
            </div>

            {/* Help / Tips Mobile Card */}
            <div className="p-4 rounded-2xl bg-zinc-900/40 border border-white/5 text-xs text-zinc-400 space-y-2 leading-relaxed">
              <span className="font-bold text-zinc-200 block uppercase tracking-wider text-[11px]">Pro Tips 💡</span>
              <p>
                • <strong>Quick Launch:</strong> The "Spotify" button uses an automated search redirect scheme. No logins required, opens app directly on mobile.
              </p>
              <p>
                • <strong>Call the DJ:</strong> Use <code>@dj</code> or <code>@bot</code> inside the chatbot room to obtain automated responses or prompt for song explanations!
              </p>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
