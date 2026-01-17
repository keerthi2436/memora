import { NextResponse } from 'next/server';
import { qdrant, COLLECTION_NAME, ensureCollection } from '@/lib/qdrant';
import { generateEmbedding, transcribeAudio } from '@/lib/ai';
import { v4 as uuidv4 } from 'uuid';
import { MemoryPayload } from '@/types';

export async function POST(request: Request) {
    try {
        const formData = await request.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json({ error: 'Audio file required' }, { status: 400 });
        }

        console.log("Transcribing audio...");
        const transcript = await transcribeAudio(file);
        console.log("Transcription:", transcript);

        await ensureCollection();

        // Generate embedding from transcript
        const vector = await generateEmbedding(transcript);
        const id = uuidv4();

        const payload: MemoryPayload = {
            type: 'audio',
            content: transcript,
            timestamp: Date.now(),
            date: new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
            tags: ['voice-memo'],
        };

        await qdrant.upsert(COLLECTION_NAME, {
            wait: true,
            points: [
                {
                    id,
                    vector: {
                        text: vector,
                    },
                    payload: payload as any
                }
            ]
        });

        return NextResponse.json({ success: true, id, transcript });

    } catch (error: any) {
        console.error("Voice Upload Error Stack:", error);
        return NextResponse.json({ error: error.message || 'Failed to process voice memory' }, { status: 500 });
    }
}
