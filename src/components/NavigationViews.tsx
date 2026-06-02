/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from 'motion/react';
import { 
  X, 
  Users, 
  BarChart3, 
  Settings2, 
  Radio, 
  Activity, 
  Lock, 
  Gauge, 
  Volume2, 
  RefreshCw, 
  User,
  ExternalLink
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Cell 
} from 'recharts';
import { Mood } from '../types';

interface NavigationViewsProps {
  currentTab: 'communities' | 'analytics' | 'settings';
  onClose: () => void;
  moods: Mood[];
  activeMood: Mood | null;
  onSelectMood: (mood: Mood) => void;
  nickname: string;
  setNickname: (nickname: string) => void;
}

export default function NavigationViews({
  currentTab,
  onClose,
  moods,
  activeMood,
  onSelectMood,
  nickname,
  setNickname,
}: NavigationViewsProps) {
  
  // Custom mock analytics data matching each of the main stations
  const analyticsData = moods.map(m => {
    // Generate a clean mock listening duration statistic in minutes
    let minTuned = 0;
    if (m.id === 'chill') minTuned = 145;
    else if (m.id === 'focus') minTuned = 180;
    else if (m.id === 'hype') minTuned = 95;
    else if (m.id === 'euphoric') minTuned = 40;
    else if (m.id === 'melancholic') minTuned = 75;
    else minTuned = 25;

    // if it is active right now, add simulated active session metadata
    if (activeMood?.id === m.id) {
      minTuned += 12; 
    }

    return {
      name: m.name,
      emoji: m.emoji,
      minutes: minTuned,
      color: m.accentColor,
    };
  });

  // Calculate global summary stats
  const totalMinutes = analyticsData.reduce((sum, item) => sum + item.minutes, 0);
  const totalHours = (totalMinutes / 60).toFixed(1);

  // Simulated live listeners list mapping
  const communityStations = moods.map(m => {
    let listeners = 0;
    if (m.id === 'chill') listeners = 428;
    else if (m.id === 'focus') listeners = 196;
    else if (m.id === 'hype') listeners = 342;
    else if (m.id === 'euphoric') listeners = 88;
    else if (m.id === 'melancholic') listeners = 124;
    else listeners = 45;

    if (activeMood?.id === m.id) {
      listeners += 1; // plus user
    }

    return {
      ...m,
      listeners,
    };
  });

  return (
    <div className="fixed inset-0 bg-[#0a0a0c]/95 backdrop-blur-xl z-50 flex items-center justify-center p-4">
      {/* Container view */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="w-full max-w-3xl bg-zinc-900 border border-white/10 rounded-3xl shadow-2xl flex flex-col overflow-hidden max-h-[90vh]"
      >
        {/* Header toolbar */}
        <header className="px-6 py-4 border-b border-white/5 flex items-center justify-between bg-zinc-950/40">
          <div className="flex items-center gap-3">
            {currentTab === 'communities' && (
              <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/25">
                <Users className="w-5 h-5" />
              </div>
            )}
            {currentTab === 'analytics' && (
              <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/25">
                <BarChart3 className="w-5 h-5" />
              </div>
            )}
            {currentTab === 'settings' && (
              <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/25">
                <Settings2 className="w-5 h-5" />
              </div>
            )}
            
            <div>
              <h2 className="text-sm font-black uppercase tracking-wider text-white">
                {currentTab === 'communities' && 'Vibe Communities'}
                {currentTab === 'analytics' && 'Tuning Analytics & Statistics'}
                {currentTab === 'settings' && 'System Preferences'}
              </h2>
              <p className="text-[11px] text-zinc-500 font-medium font-sans">
                {currentTab === 'communities' && 'Meet fellow listeners, swap tracks, and join dynamic synchronized audio rooms.'}
                {currentTab === 'analytics' && 'Detailed telemetry showing your station popularity and historic wavelength resonance.'}
                {currentTab === 'settings' && 'Configure custom audio quality formats, network buffer sizes, and identity states.'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition active:scale-95 cursor-pointer"
            title="Exit Panel"
          >
            <X className="w-4 h-4" />
          </button>
        </header>

        {/* Content Dynamic Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">

          {/* COMMUNITIES VIEW */}
          {currentTab === 'communities' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {communityStations.map((station) => {
                  const isActive = activeMood?.id === station.id;
                  return (
                    <div 
                      key={station.id}
                      className={`p-4 rounded-2xl border transition relative flex flex-col justify-between ${
                        isActive 
                          ? 'border-emerald-500/40 bg-emerald-500/5 shadow-md shadow-emerald-500/5' 
                          : 'border-white/5 bg-white/5 hover:border-white/15'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-3xl select-none">{station.emoji}</span>
                          <div>
                            <h4 className="font-bold text-sm text-zinc-150">#{station.name}-station</h4>
                            <p className="text-[10px] text-zinc-500 mt-0.5 max-w-[200px] line-clamp-2">
                              {station.description}
                            </p>
                          </div>
                        </div>
                        
                        <div className="px-2 py-0.5 rounded bg-zinc-850 border border-white/5 flex items-center gap-1.5 text-[9px] font-mono font-bold text-zinc-400">
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          {station.listeners} online
                        </div>
                      </div>

                      <div className="mt-4 flex items-center justify-between border-t border-white/5 pt-3">
                        <span className="text-[10px] text-zinc-500 font-mono italic">
                          {isActive ? 'Currently listening here' : 'Inactive channel'}
                        </span>
                        
                        <button
                          onClick={() => {
                            onSelectMood(station);
                            onClose();
                          }}
                          className={`text-[10px] font-bold px-3 py-1.5 rounded-lg active:scale-95 transition cursor-pointer uppercase ${
                            isActive 
                              ? 'bg-emerald-500 text-black font-black' 
                              : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300'
                          }`}
                        >
                          {isActive ? 'Tune In Live' : 'Join Station'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Worldwide feed ticker */}
              <div className="p-4 rounded-xl bg-zinc-950/60 border border-white/5 font-sans space-y-2">
                <span className="text-[9px] font-bold tracking-wider text-emerald-400 uppercase flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                  Live Activity Stream
                </span>
                <div className="text-[11px] font-mono text-zinc-400 space-y-1.5">
                  <p className="border-b border-white/5 pb-1">
                    <span className="text-zinc-650">[23:54:12]</span> <span className="text-emerald-400 font-bold">@SynthWave99</span> switched to <span className="text-zinc-300">#focus-station</span>
                  </p>
                  <p className="border-b border-white/5 pb-1">
                    <span className="text-zinc-650">[23:55:04]</span> <span className="text-emerald-400 font-bold">@TechnoStar</span> requested dynamic track generation in <span className="text-zinc-300">#hype-station</span>
                  </p>
                  <p>
                    <span className="text-zinc-650">[23:56:45]</span> <span className="text-emerald-400 font-bold">@AuraVibes</span> applied a crafted deck in <span className="text-zinc-300">#chill-station</span>
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ANALYTICS VIEW */}
          {currentTab === 'analytics' && (
            <div className="space-y-6">
              
              {/* Telemetry Stat Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-3 bg-white/5 border border-white/5 rounded-xl text-center">
                  <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block">Tuned Time</span>
                  <span className="text-xl font-black text-white block mt-1 font-mono">{totalHours} Hours</span>
                  <span className="text-[9px] text-emerald-400 block mt-0.5">Across all moods</span>
                </div>
                <div className="p-3 bg-white/5 border border-white/5 rounded-xl text-center">
                  <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block">Top Channel</span>
                  <span className="text-xl font-black text-white block mt-1">
                    {analyticsData.sort((a,b)=>b.minutes - a.minutes)[0]?.name || 'N/A'}
                  </span>
                  <span className="text-[9px] text-zinc-400 block mt-0.5">Most synchronized</span>
                </div>
                <div className="p-3 bg-white/5 border border-white/5 rounded-xl text-center">
                  <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block">Live Latency</span>
                  <span className="text-xl font-black text-emerald-400 block mt-1 font-mono">18ms</span>
                  <span className="text-[9px] text-zinc-400 block mt-0.5">Optimized connection</span>
                </div>
                <div className="p-3 bg-white/5 border border-white/5 rounded-xl text-center">
                  <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block">Form Factor</span>
                  <span className="text-xl font-black text-white block mt-1 font-mono">96 kHz FLAC</span>
                  <span className="text-[9px] text-zinc-400 block mt-0.5">Lossless audio output</span>
                </div>
              </div>

              {/* Bar Chart representing listening minutes per category */}
              <div className="p-5 rounded-2xl bg-zinc-950/40 border border-white/5 flex flex-col">
                <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider block mb-4">
                  Weekly Audience & Station Resonance
                </span>

                <div className="w-full h-[220px]" style={{ minWidth: '0' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analyticsData}>
                      <XAxis 
                        dataKey="name" 
                        stroke="#71717a" 
                        fontSize={10} 
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis 
                        stroke="#71717a" 
                        fontSize={10} 
                        tickLine={false}
                        axisLine={false}
                        label={{ value: 'Minutes Tuned', angle: -90, position: 'insideLeft', style: { fill: '#71717a', fontSize: 10, fontWeight: 'bold' } }}
                      />
                      <Tooltip 
                        cursor={{ fill: 'rgba(255, 255, 255, 0.02)' }}
                        contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '12px', fontSize: '11px', color: '#f4f4f5' }}
                      />
                      <Bar dataKey="minutes" radius={[4, 4, 0, 0]}>
                        {analyticsData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Quality certification logo */}
              <p className="text-[10px] text-zinc-500 text-center font-mono">
                Analytics engine is local. Live listener counters represent real-time simulated client connections.
              </p>
            </div>
          )}

          {/* SETTINGS VIEW */}
          {currentTab === 'settings' && (
            <div className="space-y-6 font-sans">
              
              {/* Profile setup card */}
              <div className="p-4 rounded-xl bg-white/5 border border-white/5 flex flex-col gap-3">
                <span className="text-xs font-bold text-zinc-300 uppercase tracking-wider block">
                  Identity Handle Settings
                </span>
                
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-500/10 border border-emerald-500/25 rounded-xl flex items-center justify-center text-emerald-400 shrink-0">
                    <User className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <input
                      type="text"
                      id="settings-nickname-input"
                      value={nickname}
                      onChange={(e) => setNickname(e.target.value)}
                      placeholder="Enter new VibeHandle..."
                      className="w-full max-w-sm px-3.5 py-2 bg-zinc-950 border border-white/10 rounded-xl focus:border-emerald-500 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none font-bold"
                    />
                  </div>
                </div>
              </div>

              {/* Professional Settings Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Audio buffering & quality */}
                <div className="p-4 rounded-xl bg-white/5 border border-white/5 space-y-3">
                  <h4 className="font-bold text-xs text-zinc-200 uppercase tracking-wide flex items-center gap-2">
                    <Gauge className="w-4 h-4 text-emerald-400" />
                    Audio Buffer Size
                  </h4>
                  <p className="text-[11px] text-zinc-400">
                    Tweak buffer lengths to compromise between immediate song launch latency or high bit-rates.
                  </p>
                  
                  <div className="space-y-1.5 font-mono text-[11px]">
                    <label className="flex items-center gap-2 p-1.5 bg-zinc-950/40 rounded border border-white/5 cursor-pointer hover:border-emerald-500/20">
                      <input type="radio" name="buf" defaultChecked />
                      <span>Low Latency - 16ms buffer</span>
                    </label>
                    <label className="flex items-center gap-2 p-1.5 bg-zinc-950/40 rounded border border-white/5 cursor-pointer hover:border-emerald-500/20">
                      <input type="radio" name="buf" />
                      <span>Standard Audio - 64ms buffer</span>
                    </label>
                    <label className="flex items-center gap-2 p-1.5 bg-zinc-950/40 rounded border border-white/5 cursor-pointer hover:border-emerald-500/20">
                      <input type="radio" name="buf" />
                      <span>Lossless Studio - 256ms buffer</span>
                    </label>
                  </div>
                </div>

                {/* Simulated WebSocket Connections */}
                <div className="p-4 rounded-xl bg-white/5 border border-white/5 space-y-3">
                  <h4 className="font-bold text-xs text-zinc-200 uppercase tracking-wide flex items-center gap-2">
                    <Activity className="w-4 h-4 text-emerald-400" />
                    WebSocket Latency Mode
                  </h4>
                  <p className="text-[11px] text-zinc-400">
                    Simulate slower connection properties to match unstable real-world 4G networks or gigabit streams.
                  </p>
                  
                  <div className="space-y-1.5 font-mono text-[11px]">
                    <label className="flex items-center gap-2 p-1.5 bg-zinc-950/40 rounded border border-white/5 cursor-pointer hover:border-emerald-500/20">
                      <input type="radio" name="net" defaultChecked />
                      <span>Zero Delay (18ms average)</span>
                    </label>
                    <label className="flex items-center gap-2 p-1.5 bg-zinc-950/40 rounded border border-white/5 cursor-pointer hover:border-emerald-500/20">
                      <input type="radio" name="net" />
                      <span>Mobile 3G latency (320ms average)</span>
                    </label>
                    <label className="flex items-center gap-2 p-1.5 bg-zinc-950/40 rounded border border-white/5 cursor-pointer hover:border-emerald-500/20">
                      <input type="radio" name="net" />
                      <span>Deep Sea Cables (650ms delay)</span>
                    </label>
                  </div>
                </div>

              </div>

              {/* Danger zone actions */}
              <div className="p-4 border border-red-500/20 rounded-xl bg-red-950/5 space-y-3">
                <span className="text-[11px] uppercase tracking-wider font-extrabold text-red-500">
                  Danger Zone
                </span>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h5 className="text-xs font-bold text-zinc-200">Reset Local Application Variables</h5>
                    <p className="text-[10px] text-zinc-500">
                      Remove persistent cookies, delete custom applied AI generated deck overrides and sign out.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      localStorage.clear();
                      window.location.reload();
                    }}
                    className="text-[10px] font-bold text-black bg-red-500 hover:bg-red-400 px-3 py-1.5 rounded-lg active:scale-95 transition cursor-pointer"
                  >
                    Reset Now
                  </button>
                </div>
              </div>

            </div>
          )}

        </div>
      </motion.div>
    </div>
  );
}
