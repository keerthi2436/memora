
import { NextResponse } from 'next/server';

// MOCK VISION FOR HACKATHON DEMO (To bypass invalid OpenAI Key)
export async function POST(request: Request) {
    try {
        const { image, prompt } = await request.json();

        // Simulate network delay for realism
        await new Promise(resolve => setTimeout(resolve, 1500));

        let description = "I see a personal object.";

        // Smart Mocking based on user prompt (if they hint at what it is)
        const lowerPrompt = (prompt || "").toLowerCase();

        // SMART DETECTIVE MOCK (Deterministic for Demo)

        if (lowerPrompt.includes("who") || lowerPrompt.includes("person") || lowerPrompt.includes("boy")) {
            description = "That is your grandson, Alex. He visited last week.";
        } else if (lowerPrompt.includes("medicine") || lowerPrompt.includes("pill") || lowerPrompt.includes("meds")) {
            description = "I see a bottle of Lisinopril medication. The label says 10mg.";
        } else if (lowerPrompt.includes("key")) {
            description = "That looks like your house keys. I see a blue keychain attached.";
        } else if (lowerPrompt.includes("bill") || lowerPrompt.includes("paper")) {
            description = "It looks like an electric bill from PG&E for $45.20.";
        } else if (prompt && prompt.length > 5) {
            // USER PROVIDED CONTEXT: Trust it!
            // If user typed "This is Alex", we say "I see Alex."
            description = `I can confirm: ${prompt}`;
        } else {
            // SAFE DEFAULT
            description = "I see a photo. Could you give me a hint about what to look for?";
        }

        return NextResponse.json({ description });
    } catch (error) {
        console.error("Mock Vision API Error:", error);
        return NextResponse.json(
            { error: 'Failed to analyze image' },
            { status: 500 }
        );
    }
}
