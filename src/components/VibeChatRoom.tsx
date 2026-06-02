/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef, FormEvent } from 'react';
import { Message, Mood } from '../types';
import { Send, User, ChevronUp, RefreshCw, Radio } from 'lucide-react';
import { motion } from 'motion/react';

interface VibeChatRoomProps {
  mood: Mood;
  nickname: string;
  setNickname: (name: string) => void;
}

export default function VibeChatRoom({ mood, nickname, setNickname }: VibeChatRoomProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [editingNick, setEditingNick] = useState(!nickname);
  const [nickInput, setNickInput] = useState(nickname || '');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch conversations from backend Express server
  const fetchMessages = async (silent = false) => {
    if (!silent) setIsLoading(true);
    try {
      const res = await fetch(`/api/chat/${mood.id}/messages`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data);
      }
    } catch (err) {
      console.error('Failed to pull messages:', err);
    } finally {
      if (!silent) setIsLoading(false);
    }
  };

  // Setup pooling to run active real-time updates and clear timer on dismount
  useEffect(() => {
    fetchMessages();
    
    // Low latency but 4G network friendly 2.5s interval
    pollIntervalRef.current = setInterval(() => {
      fetchMessages(true);
    }, 2500);

    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, [mood.id]);

  // Handle scrolling to bottom whenever new statements hit
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle Nickname Save
  const handleSaveNickname = (e: FormEvent) => {
    e.preventDefault();
    if (nickInput.trim()) {
      setNickname(nickInput.trim());
      setEditingNick(false);
    }
  };

  // Handle Message Submission
  const handleSendMessage = async (e: FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isSending || !nickname) return;

    setIsSending(true);
    const textToSend = inputText.trim();
    setInputText('');

    try {
      const res = await fetch(`/api/chat/${mood.id}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nickname,
          text: textToSend
        })
      });

      if (res.ok) {
        // Instant trigger refresh for buttery feeling
        await fetchMessages(true);
      }
    } catch (err) {
      console.error('Failed to broadcast statement:', err);
    } finally {
      setIsSending(false);
    }
  };

  // Generate randomized color block avatar based on nickname
  const getAvatarColor = (name: string, isBot: boolean) => {
    if (isBot) return 'bg-amber-500 text-slate-950 font-black ring-2 ring-amber-300';
    const codes = name.split('').map(c => c.charCodeAt(0));
    const total = codes.reduce((acc, c) => acc + c, 0);
    const hues = ['bg-purple-500', 'bg-emerald-500', 'bg-pink-500', 'bg-blue-500', 'bg-violet-500', 'bg-cyan-500', 'bg-rose-500'];
    return hues[total % hues.length] + ' text-white';
  };

  return (
    <div className="flex flex-col h-[520px] bg-zinc-900/40 rounded-2xl border border-white/5 backdrop-blur-md overflow-hidden font-sans shadow-xl">
      
      {/* Header Channel Panel */}
      <div className="px-4 py-3 bg-zinc-900/60 border-b border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center p-2 rounded-lg bg-red-400/10">
            <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
          </div>
          <div>
            <h4 id="chat-title-tag" className="font-bold text-zinc-150 text-xs uppercase tracking-wider capitalize">
              Live Chat: #{mood.id}
            </h4>
            <span className="text-[10px] text-zinc-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Connected to AI broadcast channel
            </span>
          </div>
        </div>

        <button 
          id="btn-nick-edit"
          onClick={() => setEditingNick(true)} 
          className="text-[10px] text-emerald-400 font-bold px-2.5 py-1 rounded-lg hover:bg-zinc-800/80 border border-white/5 transition-all text-right cursor-pointer"
        >
          {nickname ? `@${nickname}` : 'Set Name'}
        </button>
      </div>

      {/* Screen view overlay for empty or editing username name setting */}
      {editingNick ? (
        <div className="flex-1 flex flex-col items-center justify-center p-6 bg-zinc-950/90 backdrop-blur-lg z-20">
          <form onSubmit={handleSaveNickname} className="w-full max-w-xs text-center">
            <div className="w-12 h-12 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-3 border border-emerald-500/20">
              <User className="w-6 h-6 text-emerald-400" />
            </div>
            <h5 className="font-extrabold text-zinc-100 text-base uppercase tracking-wider">Set VibeHandle</h5>
            <p className="text-[11px] text-zinc-400 mt-1 mb-4">
              Provide a username to interact in #{mood.id}-station and query our automated DJ supervisor.
            </p>
            <input
              id="input-vibe-nick"
              type="text"
              required
              maxLength={15}
              placeholder="e.g. NeonSleeper"
              value={nickInput}
              onChange={(e) => setNickInput(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-white/5 focus:border-emerald-500/50 text-zinc-150 focus:outline-none placeholder-zinc-600 text-xs text-center font-bold font-mono"
            />
            <button
              id="btn-vibe-nick-submit"
              type="submit"
              className="w-full mt-3 py-2 bg-emerald-500 hover:bg-emerald-400 text-black rounded-xl font-bold text-xs uppercase tracking-wider cursor-pointer transition-all active:scale-95"
            >
              Enter DJ Room
            </button>
          </form>
        </div>
      ) : (
        /* Message Stream Scroller */
        <div className="flex-1 overflow-y-auto p-4 space-y-3.5 self-stretch">
          {isLoading && messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center">
              <RefreshCw className="w-6 h-6 text-emerald-400 animate-spin" />
              <span className="text-xs text-zinc-500 mt-2 font-mono uppercase tracking-wider">Frequency lockin...</span>
            </div>
          ) : messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-4">
              <span className="text-xl mb-1">💬</span>
              <p className="text-zinc-400 text-xs font-semibold">Tuned into clear static.</p>
              <p className="text-[10px] text-zinc-500 max-w-xs mt-1 leading-relaxed">
                Send a vibe statement or call <code>@dj</code> to prompt the automated supervisor!
              </p>
            </div>
          ) : (
            messages.map((msg) => {
              const self = msg.nickname === nickname;
              return (
                <div 
                  key={msg.id}
                  className={`flex items-start gap-2.5 ${self ? 'flex-row-reverse' : 'flex-row'}`}
                >
                  {/* Dynamic Avatar */}
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-[10px] font-black select-none shadow-sm ${getAvatarColor(msg.nickname, msg.isBot)}`}>
                    {msg.isBot ? '🎛️' : msg.nickname.charAt(0).toUpperCase()}
                  </div>

                  {/* Message Bubble Column */}
                  <div className={`flex flex-col max-w-[75%] ${self ? 'items-end' : 'items-start'}`}>
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="text-[11px] font-bold text-zinc-300">
                        {msg.nickname}
                      </span>
                      {msg.isBot && (
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 select-none font-mono uppercase">
                          Supervisor
                        </span>
                      )}
                      <span className="text-[9px] text-zinc-500 font-mono">
                        {msg.timestamp}
                      </span>
                    </div>

                    <div className={`px-3.5 py-2.5 rounded-xl text-xs leading-relaxed border ${
                      msg.isBot 
                        ? 'bg-zinc-800/30 border-white/5 text-zinc-250 rounded-tl-none font-medium' 
                        : self 
                          ? 'bg-emerald-500/10 border-emerald-550/30 text-emerald-100 rounded-tr-none font-medium' 
                          : 'bg-zinc-800/60 border-white/5 text-zinc-300 rounded-tl-none'
                    }`}>
                      {msg.text}
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>
      )}

      {/* Input Message panel footer */}
      {!editingNick && nickname && (
        <form onSubmit={handleSendMessage} className="p-3 bg-zinc-900/60 border-t border-white/5 flex gap-2">
          <div className="flex-1 flex gap-2 items-center bg-white/5 border border-white/10 rounded-xl p-2 px-4">
            <input
              id="chat-text-input"
              type="text"
              maxLength={250}
              required
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              disabled={isSending}
              placeholder={`Say something... (@dj triggers recommendation)`}
              className="bg-transparent border-none text-xs flex-1 focus:outline-none text-zinc-200"
            />
            <button
              id="chat-send-btn"
              type="submit"
              disabled={isSending || !inputText.trim()}
              className="text-xs text-emerald-400 font-bold uppercase hover:text-emerald-300 active:scale-95 transition cursor-pointer"
            >
              Send
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
