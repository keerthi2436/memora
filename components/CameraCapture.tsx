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
    const [userContext, setUserContext] = useState("");
    const fileInputRef = useRef<HTMLInputElement>(null);

    // OPTIMIZATION: Resize image to max 800px width to speed up OpenAI latency
    const resizeImage = (file: File): Promise<string> => {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    let width = img.width;
                    let height = img.height;
                    // Aggressive resizing for speed (500px is enough for recognition)
                    const MAX_WIDTH = 500;

                    if (width > MAX_WIDTH) {
                        height = Math.round((height * MAX_WIDTH) / width);
                        width = MAX_WIDTH;
                    }

                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    ctx?.drawImage(img, 0, 0, width, height);
                    resolve(canvas.toDataURL('image/jpeg', 0.6)); // 60% quality (Good enough for AI)
                };
                img.src = e.target?.result as string;
            };
            reader.readAsDataURL(file);
        });
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setStatus("analyzing"); // Temporary feedback
            const resized = await resizeImage(file);
            setCapturedImage(resized);
            setStatus("preview");
        }
    };

    const analyzeImage = async () => {
        setStatus("analyzing");

        try {
            // 1. Get Description from Real AI (GPT-4o Vision)
            const analysisRes = await fetch('/api/analyze-image', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    image: capturedImage,
                    prompt: userContext
                })
            });

            if (!analysisRes.ok) {
                const errData = await analysisRes.json();
                console.error("Server Error:", errData);
                throw new Error(errData.details || "Vision analysis failed");
            }

            const { description } = await analysisRes.json();

            // UPDATE UI IMMEDIATELY (Don't wait for DB save)
            setDescription(description);
            setStatus("success");

            // HACK: Save to LocalStorage for immediate demo recall (Bypasses DB latency/failure)
            if (capturedImage) {
                localStorage.setItem('memora_demo_image', capturedImage);
                localStorage.setItem('memora_demo_desc', description);
            }

            // Speak the result (Accessibility)
            if ('speechSynthesis' in window) {
                const utterance = new SpeechSynthesisUtterance("I see " + description);
                window.speechSynthesis.speak(utterance);
            }

            // 2. Save this "Memory" to Qdrant in BACKGROUND
            const finalContent = userContext
                ? `[Visual] ${userContext} - Identified as: ${description}`
                : `[Visual Identification] ${description}`;

            fetch('/api/memories', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    text: finalContent,
                    type: 'image',
                    tags: ['vision', 'camera', 'gpt-4o'],
                    // SAVE THE IMAGE DATA FOR DISPLAY
                    imageDetails: capturedImage
                })
            }).catch(err => console.error("Background memory save failed:", err));

        } catch (e) {
            console.error(e);
            alert("Failed to analyze image. Ensure your browser supports WebGPU/WASM.");
        }
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
                            <div className="w-full space-y-4">
                                <textarea
                                    className="w-full bg-black/50 border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                                    placeholder="Add context or ask a specific question (optional)..."
                                    rows={2}
                                    value={userContext}
                                    onChange={(e) => setUserContext(e.target.value)}
                                />
                                <button
                                    onClick={analyzeImage}
                                    className="w-full py-4 bg-primary rounded-xl font-semibold text-primary-foreground hover:opacity-90 transition-opacity"
                                >
                                    Analyze & Save
                                </button>
                            </div>
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
