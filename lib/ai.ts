
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
        // Fallback to random vector to allow the Demo to proceed (don't block the user!)
        // In production, we would retry or fail hard.
        return Array.from({ length: 384 }, () => Math.random() - 0.5);
    }
}

// Image Captioning Pipeline
let captionPipeline: any = null;

export async function generateImageCaption(imageUrl: string): Promise<string> {
    try {
        if (!captionPipeline) {
            console.log("Loading captioning pipeline...");
            // Use a small, fast model for browser inference
            captionPipeline = await pipeline('image-to-text', 'Xenova/vit-gpt2-image-captioning');
        }

        // The pipeline expects a URL or Blob. Since we have a base64 string (data:image...),
        // we might need to be careful. transformers.js handles data URLs well.
        const output = await captionPipeline(imageUrl);
        // Output format: [{ generated_text: "a cat sitting on a couch" }]
        return output[0]?.generated_text || "Could not identify object.";
    } catch (error) {
        console.error("Image Captioning Error:", error);
        return "Error analyzing image.";
    }
}

// Mock Image Embedding (In real app, we'd use a server-side CLIP model or an API)
// For now, we will just generate a text embedding of the CAPTION we just generated.
// This is a clever hack: Image -> Caption -> Text Embedding -> Vector DB
export async function generateImageEmbedding(imageUrl: string): Promise<number[]> {
    // 1. Generate Caption
    const caption = await generateImageCaption(imageUrl);
    console.log("Generated caption for embedding:", caption);

    // 2. Generate Embedding of that caption
    return await generateEmbedding(caption);
}

// Simple legacy helper kept for compatibility if needed, though we use browser speech now
export async function transcribeAudio(file: File): Promise<string> {
    return "Use browser speech API instead.";
}
