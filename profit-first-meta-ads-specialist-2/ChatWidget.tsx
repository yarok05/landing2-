
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Mic, MicOff, Sparkles } from 'lucide-react';
import { GoogleGenAI, Modality, GenerateContentResponse, LiveServerMessage } from "@google/genai";

const SYSTEM_PROMPT = "Ти — ШІ-асистент Ігоря Ярового, власника IGADSFLEX. Ти допомагаєш клієнтам зрозуміти, як будувати системи Meta Ads, що приносять прибуток. Ти професійний, лаконічний і орієнтований на результат. Відповідай виключно українською мовою. Якщо запитують про аудит, направляй їх до форми на сайті.";

// Audio Helpers following the strict PCM audio pattern
function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(data: Uint8Array, ctx: AudioContext, sampleRate: number, numChannels: number): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);
  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

function encode(bytes: Uint8Array) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function createBlob(data: Float32Array): { data: string; mimeType: string } {
  const l = data.length;
  const int16 = new Int16Array(l);
  for (let i = 0; i < l; i++) { int16[i] = data[i] * 32768; }
  return { data: encode(new Uint8Array(int16.buffer)), mimeType: 'audio/pcm;rate=16000' };
}

export const ChatWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<'text' | 'voice'>('text');
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant', text: string }[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const chatInstance = useRef<any>(null);
  const liveSession = useRef<any>(null);
  const audioContexts = useRef<{ input?: AudioContext, output?: AudioContext }>({});
  const nextStartTime = useRef(0);
  const sources = useRef(new Set<AudioBufferSourceNode>());

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, isTyping]);

  const initChat = () => {
    if (!chatInstance.current) {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      chatInstance.current = ai.chats.create({
        model: 'gemini-3-flash-preview',
        config: { systemInstruction: SYSTEM_PROMPT },
      });
    }
  };

  const handleSendMessage = async () => {
    if (!input.trim()) return;
    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsTyping(true);
    initChat();
    try {
      const result = await chatInstance.current.sendMessageStream({ message: userMsg });
      let fullResponse = '';
      setMessages(prev => [...prev, { role: 'assistant', text: '' }]);
      for await (const chunk of result) {
        // Correct handling of streaming response chunks
        const c = chunk as GenerateContentResponse;
        fullResponse += c.text;
        setMessages(prev => {
          const updated = [...prev];
          updated[updated.length - 1].text = fullResponse;
          return updated;
        });
      }
    } catch (err) { console.error(err); } finally { setIsTyping(false); }
  };

  const startVoiceSession = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      audioContexts.current.input = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      audioContexts.current.output = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Puck' } } },
          systemInstruction: SYSTEM_PROMPT + " Говори природно, як на консультації."
        },
        callbacks: {
          onopen: () => {
            const source = audioContexts.current.input!.createMediaStreamSource(stream);
            const scriptProcessor = audioContexts.current.input!.createScriptProcessor(4096, 1, 1);
            scriptProcessor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              // CRITICAL: Ensure sessionPromise resolves before sending realtime input
              sessionPromise.then(session => session.sendRealtimeInput({ media: createBlob(inputData) }));
            };
            source.connect(scriptProcessor);
            scriptProcessor.connect(audioContexts.current.input!.destination);
            setIsVoiceActive(true);
          },
          onmessage: async (msg: LiveServerMessage) => {
            const base64Audio = msg.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (base64Audio && audioContexts.current.output) {
              const ctx = audioContexts.current.output;
              nextStartTime.current = Math.max(nextStartTime.current, ctx.currentTime);
              const audioBuffer = await decodeAudioData(decode(base64Audio), ctx, 24000, 1);
              const source = ctx.createBufferSource();
              source.buffer = audioBuffer;
              source.connect(ctx.destination);
              source.start(nextStartTime.current);
              nextStartTime.current += audioBuffer.duration;
              sources.current.add(source);
              source.onended = () => sources.current.delete(source);
            }
          },
          // Fixed: Added mandatory onerror callback
          onerror: (e: ErrorEvent) => {
            console.error('Gemini Live API Error:', e);
            setIsVoiceActive(false);
          },
          onclose: () => setIsVoiceActive(false)
        }
      });
      liveSession.current = await sessionPromise;
    } catch (e) { console.error(e); }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[100]">
      <AnimatePresence>
        {isOpen && (
          <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="mb-4 w-[350px] md:w-[400px] h-[550px] bg-[#0a0a0a] border border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col backdrop-blur-xl">
            <div className="p-4 bg-gradient-to-r from-violet-900/40 to-black flex items-center justify-between border-b border-white/5">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-violet-600 flex items-center justify-center text-white"><Sparkles size={20} /></div>
                <div>
                  <h4 className="font-bold text-sm text-white">IGADSFLEX AI</h4>
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-[10px] text-white/50 uppercase tracking-widest">В мережі</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button onClick={() => { setMode(mode === 'text' ? 'voice' : 'text'); if(mode === 'voice') liveSession.current?.close(); }}
                  className={`p-2 rounded-lg transition-colors ${mode === 'voice' ? 'bg-violet-600 text-white' : 'hover:bg-white/5 text-white/40'}`}><Mic size={18} /></button>
                <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-white/5 rounded-lg text-white/40"><X size={18} /></button>
              </div>
            </div>
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
              {mode === 'text' ? (
                <>
                  {messages.length === 0 && <div className="text-center py-10 px-6"><p className="text-white/40 text-sm">Запитай мене про масштабування твого прибутку через Meta Ads.</p></div>}
                  {messages.map((m, i) => (
                    <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[85%] p-3 rounded-2xl text-sm ${m.role === 'user' ? 'bg-violet-600 text-white rounded-tr-none' : 'bg-white/5 text-white/80 rounded-tl-none border border-white/5'}`}>{m.text}</div>
                    </div>
                  ))}
                  {isTyping && <div className="flex justify-start"><div className="bg-white/5 p-3 rounded-2xl border border-white/5 flex space-x-1"><div className="w-1 h-1 bg-white/40 rounded-full animate-bounce" /><div className="w-1 h-1 bg-white/40 rounded-full animate-bounce delay-100" /><div className="w-1 h-1 bg-white/40 rounded-full animate-bounce delay-200" /></div></div>}
                </>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-8 text-white">
                   <div className={`w-24 h-24 rounded-full flex items-center justify-center border-2 border-violet-500/50 ${isVoiceActive ? 'bg-violet-600 animate-pulse' : 'bg-transparent'}`}><Mic size={40} /></div>
                   <h3 className="text-xl font-bold">{isVoiceActive ? 'Прямий зв\'язок активовано' : 'Голосова стратегічна сесія'}</h3>
                   {!isVoiceActive && <button onClick={startVoiceSession} className="px-8 py-3 bg-violet-600 rounded-full font-bold">Підключитись</button>}
                </div>
              )}
            </div>
            {mode === 'text' && (
              <div className="p-4 border-t border-white/5 bg-black">
                <form onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }} className="relative flex items-center text-white">
                  <input type="text" value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ваше запитання..." className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-violet-500 transition-all pr-12" />
                  <button disabled={!input.trim()} className="absolute right-2 p-2 text-violet-500 disabled:text-white/20"><Send size={18} /></button>
                </form>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
      <button onClick={() => setIsOpen(!isOpen)} className="w-14 h-14 bg-violet-600 rounded-full flex items-center justify-center shadow-2xl relative text-white group">
        <div className="absolute inset-0 bg-violet-400 blur-lg rounded-full opacity-0 group-hover:opacity-40 transition-opacity" />
        {isOpen ? <X size={24} /> : <MessageCircle size={24} />}
      </button>
    </div>
  );
};
