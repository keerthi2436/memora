
# DEMO SCRIPT: MEMORA (Qdrant Convolve Hackathon)
**Duration**: ~2 Minutes
**Focus**: Emotional Storytelling + Hard Technical Proof of Qdrant usage.

---

## 0:00 - 0:25 | The Problem (Face to Camera or B-Roll)
**(Audio)**:
"Dementia isn't just about forgetting. It's about losing the context of your own life. Patients ask the same question fifty times a day, not because they are difficult, but because they are lost. Current apps fail because they require *you* to remember to use them. We built Memora to change that."

**(Visuals)**:
*   Stock footage of an elderly person looking confused OR
*   Text on screen: "50 Million People Worldwide. One Solution."

---

## 0:25 - 0:55 | Core Demo: Voice & Memory (Show the App)
**(Audio)**:
"Memora is a multimodal cognitive prosthetic fueled by **Qdrant**. It listens, sees, and remembers."

"Watch this. I'll ask it something vague."
*User speaks*: 'Where did I leave my medication?'

"Memora doesn't use keywords. It uses **Semantic Vector Search**. It converts my voice to a 384-dimensional vector, scans the `memora_moments` collection in Qdrant, and finds the semantic match: 'You left your pills on the kitchen counter at 9 AM.'"

**(Visuals)**:
*   Show the beautiful Dark Mode Dashboard.
*   Click the microphone, speak naturally.
*   **Show the result pop up instantly.**
*   *Overlay Text*: `Qdrant: Cosine Similarity > 0.85`

---

## 0:55 - 1:25 | The "WOW" Moment: Multimodal Vision (The Feature We Just Built)
**(Audio)**:
"But memory isn't just text. It is visual. This is where we push the boundaries of the Hackathon."

"I see this bottle, but I don't know what it is. I use Memora's **Identify** feature."

*User snaps a photo of a random object (e.g., keys, bottle).*
*App responds*: "I see a prescription bottle of Lisinopril."

"This isn't magic. It's **Multimodal RAG**. We process the image with GPT-4o, generate a dense vector description, and store it in Qdrant's `image` vector namespace for future cross-modal retrieval."

**(Visuals)**:
*   Split screen: Show the phone/app taking the picture on the left.
*   Show the JSON payload appearing in the "Recent Moments" feed on the right.
*   *Highlight*: The tag `[Visual Identification]` appearing in the feed.

---

## 1:25 - 1:45 | The Architecture (Highlight Qdrant)
**(Audio)**:
"Under the hood, we use Qdrant for its **Hybrid Search** capabilities. We use Payload Filtering to prioritize 'Trusted Caregiver' notes over 'User Confabulations', creating a safety layer that standard text search cannot match."

"We use Qdrant's `recommend` API to proactively surface memories based on time and location context."

**(Visuals)**:
*   Show the Mermaid Diagram from the Project Report.
*   Show a snippet of the code: `qdrant.search(COLLECTION_NAME, { vector: ..., filter: ... })`.
*   *Big Badge*: **Powered by Qdrant**.

---

## 1:45 - 2:00 | Conclusion
**(Audio)**:
"Memora is more than code. It is dignity. It is independence. And with the speed of Qdrant, it is happening in real-time. Thank you."

**(Visuals)**:
*   Final shot of the Dashboard glowing.
*   Memora Logo + Qdrant Logo side by side.
