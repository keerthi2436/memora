"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export type UserRole = "patient" | "caregiver";

export interface User {
    id: string;
    name: string;
    role: UserRole;
    avatar?: string;
}

interface AuthContextType {
    user: User | null;
    login: (role: UserRole) => void;
    logout: () => void;
    loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    // Load user from local storage on mount
    useEffect(() => {
        const stored = localStorage.getItem("memora_user");
        if (stored) {
            try {
                setUser(JSON.parse(stored));
            } catch (e) {
                console.error("Failed to parse user", e);
            }
        }
        setLoading(false);
    }, []);

    const login = (role: UserRole) => {
        let mockUser: User;

        if (role === "patient") {
            mockUser = {
                id: "p1",
                name: "Sarah",
                role: "patient",
                avatar: "/avatars/sarah.jpg"
            };
            router.push("/");
        } else {
            mockUser = {
                id: "c1",
                name: "Mark",
                role: "caregiver",
                avatar: "/avatars/mark.jpg"
            };
            router.push("/caregiver");
        }

        setUser(mockUser);
        localStorage.setItem("memora_user", JSON.stringify(mockUser));
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem("memora_user");
        router.push("/login"); // Redirect to login
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}
