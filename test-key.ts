
import dotenv from 'dotenv';
import path from 'path';
import OpenAI from 'openai';

// Load .env.local manually
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

console.log("Checking OpenAI Key...");
const key = process.env.OPENAI_API_KEY;

if (!key) {
    console.error("❌ ERROR: No OPENAI_API_KEY found in .env.local");
    process.exit(1);
}

// Reveal first/last chars only
const visible = key.substring(0, 8) + "..." + key.substring(key.length - 4);
console.log(`Key found: ${visible}`);

const openai = new OpenAI({ apiKey: key });

async function check() {
    try {
        console.log("Attempting a simple embedding request...");
        await openai.embeddings.create({
            model: "text-embedding-3-small",
            input: "test",
        });
        console.log("✅ SUCCESS: Your OpenAI Key is working perfectly!");
    } catch (error: any) {
        console.error("❌ FAILURE: The key is invalid or lacks credits.");
        console.error(`Error Code: ${error.status}`);
        console.error(`Message: ${error.message}`);

        if (error.code === 'insufficient_quota') {
            console.log("\n💡 TIP: You have run out of credits or your free trial expired. Check https://platform.openai.com/account/billing/overview");
        }
    }
}

check();
