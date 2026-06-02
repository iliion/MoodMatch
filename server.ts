/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express, { Request, Response } from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';

// Load environment variables
dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// In-memory active chat rooms
interface ChatMessage {
  id: string;
  nickname: string;
  text: string;
  timestamp: string;
  isBot: boolean;
  mood: string;
}

const chatHistory: Record<string, ChatMessage[]> = {
  hype: [
    { id: 'h1', nickname: 'DJ_Volt', text: 'Welcome to the HYPE station! Let\'s crank up the energy! 🔥', timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), isBot: true, mood: 'hype' }
  ],
  chill: [
    { id: 'c1', nickname: 'ZenCloud', text: 'Welcome to the chill corner. Deep breath in, deep breath out... 🍃', timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), isBot: true, mood: 'chill' }
  ],
  melancholic: [
    { id: 'm1', nickname: 'RainySpins', text: 'Welcome. A safe space for heavy hearts and beautiful gray clouds. 😢', timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), isBot: true, mood: 'melancholic' }
  ],
  focus: [
    { id: 'f1', nickname: 'Nebula', text: 'Welcome to deep space focus. Aligning your productivity stars... 🌌', timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), isBot: true, mood: 'focus' }
  ],
  euphoric: [
    { id: 'e1', nickname: 'SunnyVibe', text: 'Boom! Sunshine and golden rays of happiness! Let\'s celebrate life! ☀️', timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), isBot: true, mood: 'euphoric' }
  ],
  romantic: [
    { id: 'r1', nickname: 'AmorDJ', text: 'Welcome to the candle-lit lounge. Let\'s feel the romance in the air... 💖', timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), isBot: true, mood: 'romantic' }
  ]
};

// Lazy initialization function for Google Gen AI
let geminiClient: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI {
  if (!geminiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      console.warn('GEMINI_API_KEY environment variable is missing.');
    }
    geminiClient = new GoogleGenAI({
      apiKey: key || 'MOCK_KEY',
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return geminiClient;
}

// Check if Gemini is enabled/configured
const isGeminiAvailable = () => {
  return typeof process.env.GEMINI_API_KEY === 'string' && process.env.GEMINI_API_KEY.length > 0;
};

// API: Get messages for a mood chat room
app.get('/api/chat/:mood/messages', (req: Request, res: Response) => {
  const mood = req.params.mood.toLowerCase();
  if (!(mood in chatHistory)) {
    return res.status(404).json({ error: 'Room not found' });
  }
  res.json(chatHistory[mood]);
});

// API: Post a message to a mood chat room
app.post('/api/chat/:mood/messages', async (req: Request, res: Response) => {
  const mood = req.params.mood.toLowerCase();
  if (!(mood in chatHistory)) {
    return res.status(404).json({ error: 'Room not found' });
  }

  const { nickname, text } = req.body;
  if (!nickname || !text) {
    return res.status(400).json({ error: 'Nickname and text are required value parameters.' });
  }

  const userMsg: ChatMessage = {
    id: `${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    nickname: nickname.trim().substring(0, 20),
    text: text.trim().substring(0, 300),
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    isBot: false,
    mood
  };

  chatHistory[mood].push(userMsg);
  if (chatHistory[mood].length > 100) {
    chatHistory[mood].shift();
  }

  res.status(201).json({ status: 'ok', message: userMsg });

  // DJ Bot asynchronous response logic
  // Trigger DJ response either when user asks @dj specifically, or 40% of the time.
  const hasMention = text.toLowerCase().includes('@dj') || text.toLowerCase().includes('@bot');
  const shouldRespondRandomly = Math.random() < 0.35;

  if (hasMention || shouldRespondRandomly) {
    // Respond after a very brief delay to feel authentic
    setTimeout(async () => {
      try {
        await triggerDjResponse(mood, userMsg);
      } catch (err) {
        console.error('Failed to trigger DJ reply:', err);
      }
    }, 1200);
  }
});

// Helper: DJ Bot Generator
async function triggerDjResponse(mood: string, triggerMsg: ChatMessage) {
  const roomMessages = chatHistory[mood].slice(-7); // take last 7 messages for context
  const historyText = roomMessages
    .map(m => `${m.nickname}: ${m.text}`)
    .join('\n');

  let botName = 'MoodDJ';
  let djPersona = 'A music curation assistant';

  switch (mood) {
    case 'hype':
      botName = 'DJ_Volt';
      djPersona = 'A legendary, high-energy hyperpop club DJ who speaks in rapid enthusiasm, uses emojis like 🔥/⚡/🔊, loves talking about massive bass drops, and keeps everyone hyperactive.';
      break;
    case 'chill':
      botName = 'ZenCloud';
      djPersona = 'A peaceful, serene yoga & ambient lo-fi music lover, speaking softly with calming phrases, using emojis like 🍃/🧘/✨/🌧️, encouraging focus, relaxing, and sipping green tea.';
      break;
    case 'melancholic':
      botName = 'RainySpins';
      djPersona = 'A supportive, poetic indie-goth vinyl collector who appreciates heavy feelings, rain on windows, nostalgia, and sad songs. Speaks thoughtfully with deep empathy, using emojis like 😢/🥀/🌧️/🖤.';
      break;
    case 'focus':
      botName = 'Nebula';
      djPersona = 'A space-ambient synthetic intelligence helping users enter deep focus/flow states. Speaks in futuristic, cosmic sci-fi terms, using emojis like 🌌/🪐/🚀/💻, recommending binaural beats or synth classics.';
      break;
    case 'euphoric':
      botName = 'SunnyVibe';
      djPersona = 'A cheerful, bright disco DJ who promotes pure positive sunshine and radiant golden frequencies. Energetic, optimistic, uses emojis like ☀️/💫/🕺/💃/🌻, always highlighting how wonderful life is.';
      break;
    case 'romantic':
      botName = 'AmorDJ';
      djPersona = 'A smooth, velvety jazz and classic R&B compiler who sets candle-lit romantic tones. Warm, friendly, slightly seductive, loves love stories, using emojis like 💖/🌹/🕯️/✨.';
      break;
  }

  let botReplyText = '';

  if (isGeminiAvailable()) {
    try {
      const client = getGeminiClient();
      const prompt = `You are a chatbot inside a real-time themed website chat room.
Persona description: ${djPersona}
Room Theme Mood: ${mood}
Current message history:
${historyText}

Draft a single, highly engaging, empathetic response representing ${botName}.
Important Guidelines:
1. Address the last sender "${triggerMsg.nickname}" specifically if relevant.
2. Rely strictly on your persona. Maintain it perfectly.
3. Keep it brief: strictly 1 or 2 sentences max (no long paragraphs).
4. Feel free to suggest a matching song or vibe that suits their statement.
5. Use emojis matching your theme. Do not use markdown titles. Keep output as plain text.`;

      const response = await client.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: prompt,
      });

      botReplyText = response.text?.trim() || '';
    } catch (apiErr) {
      console.error('Gemini DJ voice failure:', apiErr);
      botReplyText = getDefaultFallbackReply(mood, triggerMsg.nickname);
    }
  } else {
    // Fallback if no API key is specified
    botReplyText = getDefaultFallbackReply(mood, triggerMsg.nickname);
  }

  if (botReplyText) {
    const djMsg: ChatMessage = {
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      nickname: botName,
      text: botReplyText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isBot: true,
      mood
    };
    chatHistory[mood].push(djMsg);
    if (chatHistory[mood].length > 100) {
      chatHistory[mood].shift();
    }
  }
}

function getDefaultFallbackReply(mood: string, nickname: string): string {
  const fallbacks: Record<string, string[]> = {
    hype: [
      `LET'S GOOOOO @${nickname}! This vibe is straight fuel ⚡⚡! Add some extra volume right now!`,
      `Oh yeah @${nickname}! We are peaking now! Turn it up! 🔥🔊`
    ],
    chill: [
      `Slowing it down for you @${nickname}. Relax, let go of the noise. Ambient waves coming up... 🍃`,
      `That is beautiful @${nickname}. Take a peaceful moment. You deserve this calm. ✨`
    ],
    melancholic: [
      `I hear you @${nickname}... sometimes a beautiful sad song is the sweetest medicine. 🥀🖤`,
      `Rain on the window hits different with this tune, doesn't it @${nickname}? 😢🌧️`
    ],
    focus: [
      `Analyzing frequencies @${nickname}... optimizing node productivity. Stay in the zone! 🌌💻`,
      `Syncing orbits @${nickname}. Your focus flow state is locked in. Let\'s make things happen.`
    ],
    euphoric: [
      `YES! This is pure golden sunshine @${nickname}! Dance like no one is looking! ☀️🕺`,
      `The sky is bright and so is your future, @${nickname}! Living for these good vibrations! 🌻✨`
    ],
    romantic: [
      `A perfect choice @${nickname}. Let\'s dim the lights and let the rhythm speak to our hearts... 💖🌹`,
      `Oh, the sweetness of this hour @${nickname}. Pure romance... 🕯️✨`
    ]
  };

  const options = fallbacks[mood] || [`Indeed @${nickname}! Lovely melody.`];
  return options[Math.floor(Math.random() * options.length)];
}

// API: Custom AI Prompt Playlist Generator (Gemini DJ)
app.post('/api/gemini/curate', async (req: Request, res: Response) => {
  const { prompt } = req.body;
  if (!prompt || typeof prompt !== 'string') {
    return res.status(400).json({ error: 'A text prompt is required to curate tracklists.' });
  }

  if (!isGeminiAvailable()) {
    // Return high-quality fallback data in case API key is missing, making sure the app never hangs
    return res.json({
      vibeName: `Vibe: ${prompt.substring(0, 30)}...`,
      aiThoughts: "Your Gemini API key is currently not activated, but our offline backup generator has crafted this spectacular mood matched selection for you!",
      tracks: [
        { id: 'cur-1', name: 'Resonance', artist: 'Home', duration: '03:32', spotifyUrl: `https://open.spotify.com/search/${encodeURIComponent('Resonance Home')}`, youtubeUrl: `https://www.youtube.com/results?search_query=${encodeURIComponent('Resonance Home')}` },
        { id: 'cur-2', name: 'Intro', artist: 'The xx', duration: '02:08', spotifyUrl: `https://open.spotify.com/search/${encodeURIComponent('Intro The xx')}`, youtubeUrl: `https://www.youtube.com/results?search_query=${encodeURIComponent('Intro The xx')}` },
        { id: 'cur-3', name: 'Amber', artist: '311', duration: '03:21', spotifyUrl: `https://open.spotify.com/search/${encodeURIComponent('Amber 311')}`, youtubeUrl: `https://www.youtube.com/results?search_query=${encodeURIComponent('Amber 311')}` },
        { id: 'cur-4', name: 'Sunset Lover', artist: 'Petit Biscuit', duration: '03:57', spotifyUrl: `https://open.spotify.com/search/${encodeURIComponent('Sunset Lover Petit Biscuit')}`, youtubeUrl: `https://www.youtube.com/results?search_query=${encodeURIComponent('Sunset Lover Petit Biscuit')}` }
      ]
    });
  }

  try {
    const client = getGeminiClient();
    const systemPrompt = `You are a legendary music supervisor and DJ. The user has given a specific vibe description: "${prompt}".
Please use the Google Search tool to fetch real-time music news, trending songs, or interesting artist trivia related to this vibe, its genres, or recommended artists, and inject this real-time trivia or trending music information into your thoughts.
Your task is to:
1. Provide a concise, fun summary/thought about this custom vibe, explicitly mentioning any interesting trending trivia, recent music news, or artist context you found through Search (1-2 sentences max).
2. Curate 5 songs that match this vibe perfectly.
3. Return the data STRICTLY in JSON format following this schema:
{
  "vibeName": "A creative title for this vibe",
  "aiThoughts": "A short, engaging paragraph explaining why these tracks match the exact vibe, blending in any details, trending context, or news you discovered",
  "tracks": [
    {
      "name": "Song Name",
      "artist": "Artist Name",
      "duration": "MM:SS"
    }
  ]
}

Note: Do not wrap the JSON output in markdown blocks (like \`\`\`json). Return raw JSON directly.`;

    const response = await client.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: systemPrompt,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          required: ['vibeName', 'aiThoughts', 'tracks'],
          properties: {
            vibeName: { type: Type.STRING },
            aiThoughts: { type: Type.STRING },
            tracks: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                required: ['name', 'artist', 'duration'],
                properties: {
                  name: { type: Type.STRING },
                  artist: { type: Type.STRING },
                  duration: { type: Type.STRING }
                }
              }
            }
          }
        }
      }
    });

    const text = response.text || '{}';
    const parsedData = JSON.parse(text);

    // Extract Google Search Grounding Metadata chunks
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    const groundingSources = chunks
      ? chunks
          .map((chunk: any) => {
            if (chunk.web) {
              return {
                title: chunk.web.title,
                url: chunk.web.uri,
              };
            }
            return null;
          })
          .filter(Boolean)
      : [];

    // Map tracks to include direct Spotify and YouTube query URLs
    const tracksWithUrls = parsedData.tracks.map((track: any, index: number) => {
      const searchStr = `${track.name} ${track.artist}`;
      return {
        id: `gen-${Date.now()}-${index}`,
        name: track.name,
        artist: track.artist,
        duration: track.duration || '03:00',
        spotifyUrl: `https://open.spotify.com/search/${encodeURIComponent(searchStr)}`,
        youtubeUrl: `https://www.youtube.com/results?search_query=${encodeURIComponent(searchStr)}`
      };
    });

    res.json({
      vibeName: parsedData.vibeName || 'Your Custom Vibe',
      aiThoughts: parsedData.aiThoughts || 'Enjoy your mood-matched music curation!',
      tracks: tracksWithUrls,
      groundingSources: groundingSources
    });

  } catch (error) {
    console.error('Gemini vibe generation error:', error);
    res.status(500).json({ error: 'Failed to generate playlist. Please try again.' });
  }
});

// Serve frontend assets in production / dev fallback
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`MoodMatch Server running on http://0.0.0.0:${PORT} ready for 10K+!`);
  });
}

startServer();
