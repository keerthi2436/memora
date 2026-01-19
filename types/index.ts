export type MemoryType = 'conversation' | 'image' | 'audio' | 'thought';

export interface Memory {
    id: string;
    type: MemoryType;
    content: string; // "transcript", "image description", or "raw text"
    timestamp: string; // ISO string
    tags?: string[];
    emotion?: string;
    mediaUrl?: string; // URL to stored image/audio blob (mocked for now)
}

// Payload stored in Qdrant
export interface MemoryPayload {
    type: MemoryType;
    content: string;
    timestamp: number; // Unix timestamp for range filtering
    date: string; // Human readable
    tags: string[];
    emotion?: string;
    imageDetails?: string;
}
