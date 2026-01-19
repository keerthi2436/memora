"use client";

import { Mic, Camera, Search, Brain, Calendar, Heart, User, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { SearchModal } from "@/components/SearchModal";
import { VoiceRecorder } from "@/components/VoiceRecorder";
import { CameraCapture } from "@/components/CameraCapture";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";

export default function Home() {
  const { user, logout, loading } = useAuth();
  const router = useRouter();
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
  const [activeTab, setActiveTab] = useState<'all' | 'personal' | 'caregiver'>('all');

  const filteredMemories = recentMemories.filter(mem => {
    if (activeTab === 'all') return true;
    if (activeTab === 'caregiver') return mem.payload.type === 'caregiver';
    if (activeTab === 'personal') return mem.payload.type !== 'caregiver';
    return true;
  });

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login"); // Protect route
    } else if (!loading && user?.role === 'caregiver') {
      router.push("/caregiver"); // Redirect caregiver to their dashboard
    }
  }, [user, loading, router]);

  useEffect(() => {
    // Poll for recent memories every 5 seconds (simple real-time update)
    const fetchRecent = async () => {
      try {
        const res = await fetch('/api/memories?role=patient');
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

  if (loading || !user) return <div className="min-h-screen bg-background flex items-center justify-center">Loading...</div>;

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
            onClick={logout}
            className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors border border-white/10"
            title="Logout"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Hero / Greeting */}
      <section className="mb-12 relative z-10">
        <h1 className="text-4xl md:text-6xl font-light mb-2">
          Good Afternoon, <span className="font-semibold text-white">{user.name}</span>
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
        <div className="flex flex-col md:flex-row justify-between items-end mb-6 gap-4">
          <h2 className="text-2xl font-semibold flex items-center gap-2">
            <Calendar className="w-5 h-5 text-muted-foreground" />
            Recent Moments
          </h2>

          {/* Activity Tabs */}
          <div className="flex p-1 bg-white/5 rounded-xl border border-white/5">
            {(['all', 'personal', 'caregiver'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "px-4 py-1.5 rounded-lg text-sm font-medium transition-all",
                  activeTab === tab
                    ? "bg-white/10 text-white shadow-sm"
                    : "text-muted-foreground hover:text-white hover:bg-white/5"
                )}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          {filteredMemories.length === 0 ? (
            <div className="text-center py-12 bg-white/5 rounded-3xl border border-white/5 border-dashed">
              <p className="text-muted-foreground mb-2">No memories found in this category.</p>
              {activeTab === 'personal' && (
                <button
                  onClick={() => setIsVoiceOpen(true)}
                  className="text-primary hover:underline text-sm"
                >
                  Record a memory now
                </button>
              )}
            </div>
          ) : (
            filteredMemories.map((mem) => (
              <MockMemoryCard
                key={mem.id}
                title={mem.payload.type === 'audio' ? 'Voice Memo' : mem.payload.type === 'caregiver' ? 'Caregiver Update' : 'Memory'}
                time={mem.payload.date ? new Date(mem.payload.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now'}
                preview={mem.payload.content}
                type={mem.payload.type || 'text'}
                tags={mem.payload.tags}
              />
            ))
          )}
        </div>
      </section>
    </main>
  );
}

// Privacy Indicator helper
function PrivacyBadge({ isShared }: { isShared: boolean }) {
  const { Lock, Eye } = require("lucide-react"); // Dynamic import for cleaner file structure or just standard import
  return (
    <div className={cn(
      "flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded border uppercase tracking-wider font-medium",
      isShared
        ? "bg-teal-500/10 text-teal-400 border-teal-500/20"
        : "bg-zinc-500/10 text-zinc-400 border-zinc-500/20"
    )}>
      {isShared ? <Eye className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
      {isShared ? "Shared" : "Private"}
    </div>
  );
}

function MockMemoryCard({ title, time, preview, type, tags }: { title: string, time: string, preview: string, type: string, tags?: string[] }) {
  const isAudio = type === 'audio';
  const isImage = type === 'image';
  const isCaregiver = type === 'caregiver';

  // Privacy Logic: Safe tags are shared, everything else is private
  const safeTags = ['caregiver', 'health', 'emergency', 'external'];
  const isShared = isCaregiver || tags?.some(t => safeTags.includes(t)) || false;

  return (
    <div className={cn(
      "p-4 rounded-2xl glass hover:bg-white/5 transition-colors border flex items-center gap-4",
      isCaregiver ? "border-teal-500/30 bg-teal-500/5" : "border-white/5"
    )}>
      <div className={cn(
        "w-12 h-12 rounded-full flex items-center justify-center shrink-0",
        isAudio ? "bg-primary/20 text-primary" :
          isImage ? "bg-secondary/20 text-secondary" :
            isCaregiver ? "bg-teal-500/20 text-teal-300" :
              "bg-accent/20 text-accent"
      )}>
        {isAudio && <Mic className="w-5 h-5" />}
        {isImage && <Camera className="w-5 h-5" />}
        {isCaregiver && <Heart className="w-5 h-5" />}
        {!isAudio && !isImage && !isCaregiver && <User className="w-5 h-5" />}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-start mb-1">
          <div className="flex items-baseline gap-2">
            <h4 className="font-semibold text-lg truncate">{title}</h4>
            <span className="text-xs text-muted-foreground whitespace-nowrap">{time}</span>
          </div>
          <PrivacyBadge isShared={isShared} />
        </div>
        <p className="text-sm text-gray-300 line-clamp-1">{preview}</p>
      </div>
    </div>
  )
}
