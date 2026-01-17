
// Real Local Embeddings via Transformers.js
import { pipeline } from '@xenova/transformers';

// Singleton to hold the pipeline in memory
let embeddingPipeline: any = null;

export async function generateEmbedding(text: string): Promise<number[]> {
    try {
        if (!embeddingPipeline) {
            console.log("Loading extraction pipeline...");
            // Load the model. 'feature-extraction' is the task for embeddings.
            // Using a tiny quantized model for speed (20MB)
            embeddingPipeline = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
        }

        const output = await embeddingPipeline(text, { pooling: 'mean', normalize: true });
        // Output is a Tensor (size 384), we need a plain array.
        return Array.from(output.data);
    } catch (error) {
        console.error("Embedding Error (Local Transformers):", error);
        // Fallback to zeros if model fails to load (e.g. offline)
        return new Array(384).fill(0);
    }
}

// Mock Image Embedding (In real app, we'd use a server-side CLIP model or an API)
export async function generateImageEmbedding(imageUrl: string): Promise<number[]> {
    // Check if we are "online" (verified key) or just mocking
    console.log("Generating image mock embedding for:", imageUrl);
    return new Array(512).fill(0).map(() => Math.random());
}

// Simple legacy helper kept for compatibility if needed, though we use browser speech now
export async function transcribeAudio(file: File): Promise<string> {
    return "Use browser speech API instead.";
}
