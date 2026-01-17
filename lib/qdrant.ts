import { QdrantClient } from '@qdrant/js-client-rest';

// Prevent initializing multiple clients in dev hot-reload
const globalForQdrant = global as unknown as { qdrant: QdrantClient };

export const qdrant =
    globalForQdrant.qdrant ||
    new QdrantClient({
        url: process.env.QDRANT_URL || 'http://localhost:6333',
        apiKey: process.env.QDRANT_API_KEY,
    });

if (process.env.NODE_ENV !== 'production') globalForQdrant.qdrant = qdrant;

export const COLLECTION_NAME = 'memora_moments';

/**
 * Initializes the connection and ensures the collection exists with proper config.
 * This is "Lazy" initialization.
 */
export async function ensureCollection() {
    const result = await qdrant.getCollections();
    const exists = result.collections.some((c) => c.name === COLLECTION_NAME);

    if (!exists) {
        console.log(`Creating collection: ${COLLECTION_NAME}`);
        await qdrant.createCollection(COLLECTION_NAME, {
            vectors: {
                text: {
                    size: 384, // Local MiniLM-L6-v2 size
                    distance: 'Cosine',
                },
                image: {
                    size: 512, // Standard CLIP size (ViT-B/32)
                    distance: 'Cosine',
                },
            },
        });
        console.log('Collection created!');
    }
}
