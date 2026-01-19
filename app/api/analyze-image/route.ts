
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

        if (lowerPrompt.includes("medicine") || lowerPrompt.includes("pill")) {
            description = "I see a bottle of Lisinopril medication. The label says 10mg.";
        } else if (lowerPrompt.includes("key")) {
            description = "That looks like your house keys. I see a blue keychain attached.";
        } else if (lowerPrompt.includes("who")) {
            description = "That is your grandson, Alex. He visited last Tuesday.";
        } else if (lowerPrompt.includes("bill") || lowerPrompt.includes("paper")) {
            description = "It looks like an electric bill from PG&E for $45.20.";
        } else {
            // Random believable fallback
            const fallbacks = [
                "I see a red coffee mug on the table.",
                "That looks like your reading glasses.",
                "I see a handwritten note that says 'Call Dr. Smith'.",
                "That is a family photo from the beach trip in 2018."
            ];
            description = fallbacks[Math.floor(Math.random() * fallbacks.length)];
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
