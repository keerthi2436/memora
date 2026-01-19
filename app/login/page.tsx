"use client";

import { useAuth } from "@/contexts/AuthContext";
import { User, Heart } from "lucide-react";

export default function LoginPage() {
    const { login } = useAuth();

    return (
        <main className="min-h-screen bg-background flex flex-col items-center justify-center p-6 relative overflow-hidden">
            {/* Background Glows */}
            <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-secondary/20 rounded-full blur-[120px] pointer-events-none" />

            <div className="z-10 text-center mb-12">
                <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-4">
                    Welcome to Memora
                </h1>
                <p className="text-muted-foreground">Select your role to continue</p>
            </div>

            <div className="flex flex-col md:flex-row gap-8 z-10 w-full max-w-4xl justify-center">
                {/* Patient Card */}
                <button
                    onClick={() => login("patient")}
                    className="group relative flex-1 p-8 rounded-3xl glass-card hover:bg-white/10 transition-all border border-white/5 text-left max-w-sm mx-auto w-full"
                >
                    <div className="absolute top-0 right-0 p-32 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-all" />
                    <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mb-6 text-primary group-hover:scale-110 transition-transform">
                        <User className="w-8 h-8" />
                    </div>
                    <h2 className="text-2xl font-semibold mb-2">I am Sarah</h2>
                    <p className="text-muted-foreground text-sm">
                        Access your memory companion, record moments, and recall memories.
                    </p>
                </button>

                {/* Caregiver Card */}
                <button
                    onClick={() => login("caregiver")}
                    className="group relative flex-1 p-8 rounded-3xl glass-card hover:bg-white/10 transition-all border border-white/5 text-left max-w-sm mx-auto w-full"
                >
                    <div className="absolute top-0 right-0 p-32 bg-teal-500/5 rounded-full blur-2xl group-hover:bg-teal-500/10 transition-all" />
                    <div className="w-16 h-16 rounded-full bg-teal-500/20 flex items-center justify-center mb-6 text-teal-400 group-hover:scale-110 transition-transform">
                        <Heart className="w-8 h-8" />
                    </div>
                    <h2 className="text-2xl font-semibold mb-2">I am Mark</h2>
                    <p className="text-muted-foreground text-sm">
                        Monitor Sarah's activity, send reminders, and manage care settings.
                    </p>
                </button>
            </div>
        </main>
    );
}
