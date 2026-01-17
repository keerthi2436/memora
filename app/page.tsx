"use client";

import { Mic, Camera, Search, Brain, Calendar, Heart, User } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { SearchModal } from "@/components/SearchModal";
import { VoiceRecorder } from "@/components/VoiceRecorder";
import { CameraCapture } from "@/components/CameraCapture";

export default function Home() {
  const [time, setTime] = useState("");
  const [date, setDate] = useState("");

  useEffect(() => {
    setTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    setDate(new Date().toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' }));
  }, []);

  const [recentMemories, setRecentMemories] = useState<any[]>([]);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isVoiceOpen, setIsVoiceOpen] = useState(false);
  const [isCameraOpen, setIsCameraOpen] = useState(false);

  useEffect(() => {
    // Poll for recent memories every 5 seconds (simple real-time update)
    const fetchRecent = async () => {
      try {
        const res = await fetch('/api/memories');
        const data = await res.json();
        if (data.result) {
          setRecentMemories(data.result);
        }
      } catch (e) {
        console.error(e);
      }
    };

    fetchRecent();
    const interval = setInterval(fetchRecent, 5000);
    return () => clearInterval(interval);
  }, []);

  const simulateCaregiver = async () => {
    const texts = [
      "Reminder: Dr. Smith appointment tomorrow at 10 AM. (Added by Mark)",
      "Mark is coming over for dinner at 6 PM. (Added by Mark)",
      "Don't forget to take the blue pill with lunch. (Added by Nurse)",
    ];
    const randomText = texts[Math.floor(Math.random() * texts.length)];

    try {
      await fetch('/api/memories', {
        method: 'POST',
        body: JSON.stringify({
          text: randomText,
          type: 'caregiver',
          tags: ['caregiver', 'external']
        })
      });
      // The polling will pick it up automatically
      alert("Simulated: New memory received from Caregiver.");
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <main className="min-h-screen bg-background text-foreground p-6 md:p-12 relative overflow-hidden">
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
      <VoiceRecorder isOpen={isVoiceOpen} onClose={() => setIsVoiceOpen(false)} />
      <CameraCapture isOpen={isCameraOpen} onClose={() => setIsCameraOpen(false)} />

      {/* Ambient Background Glows */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-secondary/20 rounded-full blur-[120px] pointer-events-none" />

      {/* Header */}
      <header className="flex justify-between items-center mb-12 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center border border-primary/30">
            <Brain className="w-6 h-6 text-primary" />
          </div>
          <span className="text-2xl font-bold tracking-tight bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Memora
          </span>
        </div>
        <div className="flex gap-4">
          <button
            onClick={simulateCaregiver}
            className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-xs font-mono text-teal-300 hover:bg-teal-500/10 transition-colors"
          >
            + SIMULATE CAREGIVER
          </button>
          <button className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors border border-white/10">
            <User className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Hero / Greeting */}
      <section className="mb-12 relative z-10">
        <h1 className="text-4xl md:text-6xl font-light mb-2">
          Good Afternoon, <span className="font-semibold text-white">Sarah</span>
        </h1>
        <p className="text-muted-foreground text-lg">{date} • {time}</p>
      </section>

      {/* Core Actions Grid */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16 relative z-10">
        {/* Voice Action */}
        <div
          onClick={() => setIsVoiceOpen(true)}
          className="group relative overflow-hidden rounded-3xl p-8 glass-card hover:bg-white/10 transition-all cursor-pointer border-primary/20"
        >
          <div className="absolute top-0 right-0 p-32 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-all" />
          <Mic className="w-12 h-12 text-primary mb-6" />
          <h3 className="text-2xl font-semibold mb-2">Record Memory</h3>
          <p className="text-muted-foreground">Tell me about your day or a thought.</p>
        </div>

        {/* Vision Action */}
        <div
          onClick={() => setIsCameraOpen(true)}
          className="group relative overflow-hidden rounded-3xl p-8 glass-card hover:bg-white/10 transition-all cursor-pointer border-secondary/20"
        >
          <div className="absolute top-0 right-0 p-32 bg-secondary/5 rounded-full blur-2xl group-hover:bg-secondary/10 transition-all" />
          <Camera className="w-12 h-12 text-secondary mb-6" />
          <h3 className="text-2xl font-semibold mb-2">Identify</h3>
          <p className="text-muted-foreground">Who is this? What is this object?</p>
        </div>

        {/* Search Action */}
        <div
          onClick={() => setIsSearchOpen(true)}
          className="group relative overflow-hidden rounded-3xl p-8 glass-card hover:bg-white/10 transition-all cursor-pointer border-accent/20"
        >
          <div className="absolute top-0 right-0 p-32 bg-accent/5 rounded-full blur-2xl group-hover:bg-accent/10 transition-all" />
          <Search className="w-12 h-12 text-accent mb-6" />
          <h3 className="text-2xl font-semibold mb-2">Recall</h3>
          <p className="text-muted-foreground">Find a past conversation or photo.</p>
        </div>
      </section>

      {/* Recent Memories Feed (Real) */}
      <section className="relative z-10">
        <div className="flex justify-between items-end mb-6">
          <h2 className="text-2xl font-semibold flex items-center gap-2">
            <Calendar className="w-5 h-5 text-muted-foreground" />
            Recent Moments
          </h2>
        </div>

        <div className="space-y-4">
          {recentMemories.length === 0 ? (
            <div className="text-muted-foreground text-sm italic">No recent memories found. Record one above!</div>
          ) : (
            recentMemories.map((mem) => (
              <MockMemoryCard
                key={mem.id}
                title={mem.payload.type === 'audio' ? 'Voice Memo' : 'Memory'}
                time={mem.payload.date || 'Just now'}
                preview={mem.payload.content}
                type={mem.payload.type || 'text'}
              />
            ))
          )}
        </div>
      </section>
    </main>
  );
}

function MockMemoryCard({ title, time, preview, type }: { title: string, time: string, preview: string, type: string }) {
  const isAudio = type === 'audio';
  const isImage = type === 'image';
  const isCaregiver = type === 'caregiver';

  return (
    <div className="p-4 rounded-2xl glass hover:bg-white/5 transition-colors border border-white/5 flex items-center gap-4">
      <div className={cn(
        "w-12 h-12 rounded-full flex items-center justify-center shrink-0",
        isAudio ? "bg-primary/20 text-primary" :
          isImage ? "bg-secondary/20 text-secondary" :
            isCaregiver ? "bg-teal-500/20 text-teal-300" :
              "bg-accent/20 text-accent"
      )}>
        {isAudio && <Mic className="w-5 h-5" />}
        {isImage && <Camera className="w-5 h-5" />}
        {isCaregiver && <User className="w-5 h-5" />}
        {!isAudio && !isImage && !isCaregiver && <Heart className="w-5 h-5" />}
      </div>
      <div>
        <div className="flex items-baseline gap-2 mb-1">
          <h4 className="font-semibold text-lg">{title}</h4>
          <span className="text-xs text-muted-foreground">{time}</span>
          {isCaregiver && <span className="text-[10px] uppercase bg-teal-500/10 text-teal-400 px-1.5 py-0.5 rounded">External</span>}
        </div>
        <p className="text-sm text-gray-400 line-clamp-1">{preview}</p>
      </div>
    </div>
  )
}
