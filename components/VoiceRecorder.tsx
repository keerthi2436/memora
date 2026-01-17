"use client";

import { useState, useEffect, useRef } from "react";
import { Mic, StopCircle, X, Loader2, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface VoiceRecorderProps {
    isOpen: boolean;
    onClose: () => void;
}

export function VoiceRecorder({ isOpen, onClose }: VoiceRecorderProps) {
    const [isRecording, setIsRecording] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [status, setStatus] = useState<"idle" | "recording" | "processing" | "success">("idle");
    const [transcript, setTranscript] = useState("");

    // Web Speech API
    const recognitionRef = useRef<any>(null);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

            if (!SpeechRecognition) return;

            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = true;
            recognitionRef.current.interimResults = true;

            recognitionRef.current.onresult = (event: any) => {
                let finalTranscript = "";
                for (let i = event.resultIndex; i < event.results.length; ++i) {
                    if (event.results[i].isFinal) {
                        finalTranscript += event.results[i][0].transcript;
                    }
                }
                if (finalTranscript) {
                    setTranscript(prev => prev + " " + finalTranscript);
                }
            };

            recognitionRef.current.onerror = (event: any) => {
                console.error("Speech recognition error", event.error);
                if (event.error === 'not-allowed') {
                    alert("Microphone access denied. Please allow microphone permissions.");
                    setStatus("idle");
                    setIsRecording(false);
                }
            };
        }
    }, []);

    const startRecording = () => {
        if (!recognitionRef.current) {
            alert("Your browser does not support speech recognition. Try Chrome.");
            return;
        }
        setTranscript("");
        recognitionRef.current.start();
        setIsRecording(true);
        setStatus("recording");
    };

    const stopRecording = async () => {
        if (recognitionRef.current && isRecording) {
            recognitionRef.current.stop();
            setIsRecording(false);
            setStatus("processing");

            // Wait a moment for final result
            setTimeout(() => handleSaveMemory(), 1000);
        }
    };

    const handleSaveMemory = async () => {
        if (!transcript.trim()) {
            // Sometimes it's too fast, try one last check or fail gracefully
            if (!transcript) {
                setStatus("idle");
                return;
            }
        }

        try {
            const res = await fetch("/api/memories", {
                method: "POST",
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    text: transcript,
                    type: 'audio', // Stored as "audio" type but source is just text now
                    tags: ['voice-transcribed']
                }),
            });
            const data = await res.json();

            if (data.success) {
                setStatus("success");
            } else {
                console.error(data.error);
                setStatus("idle");
            }
        } catch (err) {
            console.error(err);
            setStatus("idle");
        } finally {
            setIsProcessing(false);
        }
    };

    const handleClose = () => {
        if (isRecording) {
            recognitionRef.current?.stop();
            setIsRecording(false);
        }
        setStatus("idle");
        setTranscript("");
        onClose();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={handleClose}
                        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                    />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="relative w-full max-w-md bg-white/10 border border-white/20 rounded-3xl p-8 flex flex-col items-center text-center shadow-2xl backdrop-blur-xl"
                    >
                        <button
                            onClick={handleClose}
                            className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-full transition-colors"
                        >
                            <X className="w-5 h-5 text-gray-400" />
                        </button>

                        <h2 className="text-2xl font-bold mb-2">Record Memory</h2>
                        <p className="text-gray-400 mb-8 h-6">
                            {status === "idle" && "Tap to start speaking."}
                            {status === "recording" && "Listening..."}
                            {status === "processing" && "Saving..."}
                            {status === "success" && "Memory saved!"}
                        </p>

                        <div className="relative mb-8">
                            {status === "recording" && (
                                <>
                                    <div className="absolute inset-0 bg-red-500/20 rounded-full animate-ping" />
                                    <div className="absolute inset-[-10px] bg-red-500/10 rounded-full animate-pulse" />
                                </>
                            )}

                            <button
                                onClick={status === "recording" ? stopRecording : startRecording}
                                disabled={isProcessing}
                                className={`
                                    relative w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300
                                    ${status === "recording" ? 'bg-red-500 scale-110' :
                                        status === "success" ? 'bg-green-500' :
                                            'bg-primary hover:bg-primary/80'}
                                    ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}
                                `}
                            >
                                {isProcessing ? (
                                    <Loader2 className="w-10 h-10 text-white animate-spin" />
                                ) : status === "success" ? (
                                    <CheckCircle2 className="w-10 h-10 text-white" />
                                ) : status === "recording" ? (
                                    <StopCircle className="w-10 h-10 text-white" />
                                ) : (
                                    <Mic className="w-10 h-10 text-white" />
                                )}
                            </button>
                        </div>

                        {/* Recent Transcript Live View */}
                        <div className="w-full min-h-[60px] bg-white/5 rounded-xl p-4 text-left border border-white/5">
                            <p className="text-xs text-uppercase text-gray-500 font-semibold mb-1">TRANSCRIPT</p>
                            <p className="text-sm text-gray-200">{transcript || "..."}</p>
                        </div>

                        <p className="text-xs text-gray-500 mt-6 max-w-xs">
                            Using browser speech recognition (Free).
                        </p>

                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
