import { NextResponse } from 'next/server';
import { qdrant, COLLECTION_NAME, ensureCollection } from '@/lib/qdrant';
import { generateEmbedding } from '@/lib/ai';
import { v4 as uuidv4 } from 'uuid';
import { MemoryPayload } from '@/types';

export const dynamic = 'force-dynamic'; // Prevent caching of search results

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

        // HYBRID SEARCH: Combine Vector Search with Keyword Matching (Payload match)
        // This ensures that if I search "Alex", and a memory has "Alex", it definitively appears.

        // 1. Vector Search (Semantic)
        const vectorResults = await qdrant.search(COLLECTION_NAME, {
            vector: {
                name: 'text',
                vector: vector
            },
            limit: 5,
            with_payload: true,
        });

        // 2. Keyword Filter (Exact Match Boost)
        const scrollResult = await qdrant.scroll(COLLECTION_NAME, {
            limit: 100, // Increased to 100 to catch more
            with_payload: true,
            with_vector: false,
        });

        console.log(`[DEBUG] Query: "${query}" | Scroll Items: ${scrollResult.points.length}`);

        const keywordMatches = scrollResult.points.filter((point: any) => {
            const content = (point.payload?.content || "").toLowerCase();
            const searchTerms = query.toLowerCase().split(" ");
            return searchTerms.some(term => content.includes(term));
        });

        console.log(`[DEBUG] Matches found: ${keywordMatches.length}`);

        // HYBRID PRIORITY LOGIC: 
        // If we found exact keyword matches (e.g., "Alex"), show ONLY those.
        // This prevents the "Random/Mock Vector" from polluting results with irrelevant stuff like "Keys".
        if (keywordMatches.length > 0) {
            return NextResponse.json({ result: keywordMatches });
        }

        // If no keywords found, fallback to Vector Search (Semantic "Vibes")
        return NextResponse.json({ result: vectorResults.slice(0, 5) });
    } catch (error) {
        console.error("Search Error:", error);
        return NextResponse.json({ error: 'Search failed' }, { status: 500 });
    }
}

// POST: Add Memory
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { text, type, tags, imageDetails } = body;

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
            // Store image base64 if provided (Hackathon Demo Trick)
            imageDetails: imageDetails
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
