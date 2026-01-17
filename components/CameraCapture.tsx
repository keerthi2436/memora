"use client";

import { useState, useRef } from "react";
import { Camera, X, CheckCircle2, Loader2, Upload } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface CameraCaptureProps {
    isOpen: boolean;
    onClose: () => void;
}

export function CameraCapture({ isOpen, onClose }: CameraCaptureProps) {
    const [status, setStatus] = useState<"idle" | "preview" | "analyzing" | "success">("idle");
    const [capturedImage, setCapturedImage] = useState<string | null>(null);
    const [description, setDescription] = useState("");
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setCapturedImage(reader.result as string);
                setStatus("preview");
            };
            reader.readAsDataURL(file);
        }
    };

    const analyzeImage = async () => {
        setStatus("analyzing");

        // Mock analysis for hackathon demo (Simulating a Vision API)
        // In a real app, we would send 'capturedImage' (base64) to GPT-4o or similar.
        setTimeout(async () => {
            // Randomly pick a "Dementia-relevant" recognition result
            const results = [
                "Prescription Bottle: ACE Inhibitors (Take 1 daily)",
                "Family Member: Grandson Alex (Last visited Tuesday)",
                "Object: Set of house keys on the kitchen counter",
                "Document: Appointment reminder for Oct 12th"
            ];
            const mockResult = results[Math.floor(Math.random() * results.length)];

            // Save this "Memory" to Qdrant via our existing API
            try {
                await fetch('/api/memories', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        text: `[Visual Identification] ${mockResult}`,
                        type: 'image',
                        tags: ['vision', 'camera']
                    })
                });
                setDescription(mockResult);
                setStatus("success");
            } catch (e) {
                console.error(e);
                setStatus("idle");
            }
        }, 2000);
    };

    const handleClose = () => {
        setStatus("idle");
        setCapturedImage(null);
        setDescription("");
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
                        className="relative w-full max-w-md bg-zinc-900 border border-white/10 rounded-3xl p-6 flex flex-col items-center shadow-2xl"
                    >
                        <button
                            onClick={handleClose}
                            className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-full transition-colors z-10"
                        >
                            <X className="w-5 h-5 text-gray-400" />
                        </button>

                        <h2 className="text-xl font-bold mb-6">Identify Object</h2>

                        {/* Image Preview Area */}
                        <div className="w-full aspect-square bg-black/50 rounded-2xl mb-6 relative overflow-hidden flex items-center justify-center border border-white/10 group">
                            {capturedImage ? (
                                <img src={capturedImage} alt="Capture" className="w-full h-full object-cover" />
                            ) : (
                                <div className="text-center p-6">
                                    <Camera className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                                    <p className="text-gray-500 text-sm">Upload a photo to analyze</p>
                                </div>
                            )}

                            {/* Overlay Controls */}
                            {status === "idle" && (
                                <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={() => fileInputRef.current?.click()}
                                        className="bg-white text-black px-6 py-2 rounded-full font-medium flex items-center gap-2 hover:scale-105 transition-transform"
                                    >
                                        <Upload className="w-4 h-4" /> Select Photo
                                    </button>
                                </div>
                            )}
                        </div>

                        <input
                            type="file"
                            ref={fileInputRef}
                            className="hidden"
                            accept="image/*"
                            onChange={handleFileChange}
                        />

                        {/* Actions */}
                        {status === "preview" && (
                            <button
                                onClick={analyzeImage}
                                className="w-full py-4 bg-primary rounded-xl font-semibold text-primary-foreground hover:opacity-90 transition-opacity"
                            >
                                Analyze Image
                            </button>
                        )}

                        {status === "analyzing" && (
                            <div className="flex flex-col items-center py-2">
                                <Loader2 className="w-8 h-8 animate-spin text-primary mb-2" />
                                <p className="text-sm text-gray-400">Processing visual data...</p>
                            </div>
                        )}

                        {status === "success" && (
                            <div className="w-full bg-green-500/10 border border-green-500/20 rounded-xl p-4 text-center">
                                <div className="flex justify-center mb-2">
                                    <CheckCircle2 className="w-8 h-8 text-green-500" />
                                </div>
                                <h3 className="text-green-400 font-semibold mb-1">Identified!</h3>
                                <p className="text-white text-lg">{description}</p>
                            </div>
                        )}
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    )
}
