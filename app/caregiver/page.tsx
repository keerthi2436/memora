"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { Heart, User, Send, Clock, Activity, LogOut } from "lucide-react";

export default function CaregiverDashboard() {
    const { user, logout, loading } = useAuth();
    const router = useRouter();
    const [message, setMessage] = useState("");
    const [sending, setSending] = useState(false);
    const [recentMemories, setRecentMemories] = useState<any[]>([]);

    useEffect(() => {
        if (!loading && (!user || user.role !== "caregiver")) {
            router.push("/login"); // Protect route
        }
    }, [user, loading, router]);

    // Poll for recent memories (monitoring)
    useEffect(() => {
        const fetchRecent = async () => {
            try {
                const res = await fetch('/api/memories?role=caregiver');
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

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!message.trim()) return;

        setSending(true);
        try {
            await fetch('/api/memories', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    text: message,
                    type: 'caregiver',
                    tags: ['caregiver', 'external', 'alert']
                })
            });
            setMessage("");
            alert("Message sent to Sarah!");
        } catch (err) {
            console.error(err);
            alert("Failed to send message");
        } finally {
            setSending(false);
        }
    };

    if (loading || !user) return <div className="min-h-screen bg-black text-white p-12">Loading...</div>;

    return (
        <main className="min-h-screen bg-background text-foreground p-6 md:p-12 relative overflow-hidden">
            {/* Background Glows */}
            <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] bg-teal-500/10 rounded-full blur-[120px] pointer-events-none" />

            <header className="flex justify-between items-center mb-12 relative z-10">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-teal-500/20 rounded-xl flex items-center justify-center border border-teal-500/30">
                        <Heart className="w-6 h-6 text-teal-400" />
                    </div>
                    <div>
                        <span className="text-xl font-bold tracking-tight block">Caregiver Portal</span>
                        <span className="text-xs text-muted-foreground">Connected to: Sarah</span>
                    </div>
                </div>
                <button
                    onClick={logout}
                    className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm hover:bg-white/10 transition-colors"
                >
                    <LogOut className="w-4 h-4" />
                    Logout
                </button>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 relative z-10">
                {/* Left Column: Actions */}
                <div className="lg:col-span-1 space-y-6">
                    <section className="p-6 rounded-3xl glass-card border border-teal-500/20">
                        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                            <Send className="w-5 h-5 text-teal-400" />
                            Send Reminder
                        </h2>
                        <form onSubmit={handleSendMessage}>
                            <textarea
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                placeholder="E.g., Don't forget your appointment at 2 PM..."
                                className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-sm min-h-[120px] mb-4 focus:outline-none focus:border-teal-500/50 transition-colors"
                            />
                            <button
                                type="submit"
                                disabled={sending}
                                className="w-full py-3 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-medium transition-colors disabled:opacity-50"
                            >
                                {sending ? "Sending..." : "Send to Sarah"}
                            </button>
                        </form>
                    </section>

                    <section className="p-6 rounded-3xl glass-card border border-white/5">
                        <h2 className="text-lg font-semibold mb-4 text-muted-foreground">Quick Actions</h2>
                        <div className="space-y-3">
                            <button onClick={() => setMessage("Did you take your medication?")} className="w-full text-left p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors text-sm">
                                💊 Med Check
                            </button>
                            <button onClick={() => setMessage("I'm coming over in 1 hour.")} className="w-full text-left p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors text-sm">
                                🚗 Visit Alert
                            </button>
                            <button onClick={() => setMessage("Call me when you're free.")} className="w-full text-left p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors text-sm">
                                📞 Call Request
                            </button>
                        </div>
                    </section>
                </div>

                {/* Right Column: Sarah's Activity Feed */}
                <div className="lg:col-span-2">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-semibold flex items-center gap-2">
                            <Activity className="w-5 h-5 text-muted-foreground" />
                            Live Activity Feed
                        </h2>
                        <div className="flex items-center gap-2 text-xs text-green-400 bg-green-500/10 px-3 py-1 rounded-full border border-green-500/20">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                            </span>
                            Live
                        </div>
                    </div>

                    <div className="space-y-4">
                        {recentMemories.map((mem) => (
                            <div key={mem.id} className="group p-5 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-colors flex gap-4">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${mem.payload.type === 'caregiver' ? 'bg-teal-500/20 text-teal-400' : 'bg-primary/20 text-primary'
                                    }`}>
                                    {mem.payload.type === 'caregiver' ? <Heart className="w-5 h-5" /> : <User className="w-5 h-5" />}
                                </div>
                                <div className="flex-1">
                                    <div className="flex justify-between items-start mb-1">
                                        <span className="font-medium text-sm text-gray-300">
                                            {mem.payload.type === 'caregiver' ? 'You sent a reminder' : 'Sarah recorded a memory'}
                                        </span>
                                        <span className="text-xs text-gray-500 flex items-center gap-1">
                                            <Clock className="w-3 h-3" />
                                            {new Date(mem.payload.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                    <p className="text-lg text-white/90">{mem.payload.content}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </main>
    );
}
