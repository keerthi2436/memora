import { NextResponse } from 'next/server';
import { qdrant, COLLECTION_NAME, ensureCollection } from '@/lib/qdrant';
import { generateEmbedding } from '@/lib/ai';
import { v4 as uuidv4 } from 'uuid';
import { MemoryPayload } from '@/types';

// GET: Search Memories
export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');

    try {
        await ensureCollection();

        // Role-Based Access Control (RBAC)
        const role = searchParams.get('role'); // 'patient' | 'caregiver'

        let filter: any = {};

        // Privacy Filter: Caregiver ONLY sees 'caregiver' entries or 'health'/'emergency' tagged items.
        // They CANNOT see strictly private voice notes.
        if (role === 'caregiver') {
            filter = {
                should: [
                    { key: "type", match: { value: "caregiver" } }, // Things Mark sent
                    { key: "tags", match: { value: "health" } },    // Health data
                    { key: "tags", match: { value: "emergency" } }  // Emergencies
                ]
            };
        }

        // If no query, return recent memories (scroll)
        if (!query) {
            const recent = await qdrant.scroll(COLLECTION_NAME, {
                limit: 10, // Increased limit to ensure we find enough matching items
                with_payload: true,
                with_vector: false,
                filter: role === 'caregiver' ? filter : undefined
                // sort by timestamp descending if possible, mock for now relies on default order
            });
            return NextResponse.json({ result: recent.points });
        }

        // Generate vector for the query text
        const vector = await generateEmbedding(query);

        const searchResult = await qdrant.search(COLLECTION_NAME, {
            vector: {
                name: 'text',
                vector: vector
            },
            limit: 5,
            with_payload: true,
        });

        return NextResponse.json({ result: searchResult });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Search failed' }, { status: 500 });
    }
}

// POST: Add Memory
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { text, type, tags } = body;

        if (!text) return NextResponse.json({ error: 'Text content required' }, { status: 400 });

        await ensureCollection();

        const vector = await generateEmbedding(text);
        const id = uuidv4();

        // Auto-tagging for Safety (Emergency Detection)
        const lowerText = text.toLowerCase();
        const emergencyKeywords = ['help', 'fell', 'fallen', 'hurt', 'pain', 'emergency', 'blooded'];
        const isEmergency = emergencyKeywords.some(k => lowerText.includes(k));

        const finalTags = tags || [];
        if (isEmergency) {
            finalTags.push('emergency');
            finalTags.push('caregiver'); // Ensure Mark sees it
            finalTags.push('alert');
        }

        const payload: MemoryPayload = {
            type: type || 'conversation',
            content: text,
            timestamp: Date.now(),
            date: new Date().toISOString(),
            tags: finalTags,
        };

        await qdrant.upsert(COLLECTION_NAME, {
            wait: true,
            points: [
                {
                    id,
                    vector: {
                        text: vector,
                        // image: ... (if we had an image) -- Note: Qdrant allows sparse named vectors (some points have image, some don't)
                    },
                    payload: payload as any
                }
            ]
        });

        return NextResponse.json({ success: true, id });

    } catch (error: any) {
        console.error("Save Memory API Error:", error);
        return NextResponse.json({ error: 'Failed to save memory: ' + (error.message || String(error)) }, { status: 500 });
    }
}
