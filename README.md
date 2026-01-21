# 🧠 MEMORA
> **A Cognitive Prosthetic for Dementia Care**  
> *Submission for Qdrant "Convolve" Hackathon 2025*


## 💡 The Mission
Dementia strips away a person's context the "who, where, and why" of their life.  
**Memora** restores this context. It is an intelligent agent system that listens, sees, and remembers for you, acting as an "External Hippocampus" to help patients retain their independence.

🌐 **Explore Memora:**   [memora-eight-gamma.vercel.app](https://memora-eight-gamma.vercel.app)

---

## 🤖 The Multi-Agent Architecture

Memora isn't just a database; it is a **Swarm of 3 Specialized Agents** working together via **Qdrant**:

### 1. The Perception Agent (Ears & Eyes)
*   **Listens**: Uses the Web Speech API to capture ambient conversation.
*   **Sees**: Uses computer vision (GPT-4o) to identify objects and faces.
*   **Goal**: Turns the messy real world into structured data.

### 2. The Memory Agent (The Brain)
*   **Remembers**: Stores every interaction as a high-dimensional vector in **Qdrant**.
*   **Recalls**: Finds the right memory not by keywords, but by *meaning* (Semantic Search).
*   **Resilient**: Works 100% offline using a local fallback mode if the internet fails.

### 3. The Guardian Agent (Safety)
*   **Protects**: Filters hallucinations.
*   **Verifies**: Prioritizes medical facts from caregivers over potentially confused patient notes.
*   **Goal**: Ensures the system never reinforces a false memory.

---

## 🛠️ System Workflow

```mermaid
graph TD
    subgraph Perception_Layer [Perception Layer]
      A[Voice Agent] 
      B[Vision Agent]
    end

    subgraph Cognitive_Layer [Cognitive Layer - Qdrant]
      C{Embedding Engine}
      D[(Vector Memory)]
    end

    subgraph Safety_Layer [Safety Layer]
      E[Guardian Agent]
      F[Response Synthesis]
    end

    A -->|Transcript| C
    B -->|Image Description| C
    C -->|Vector 384d| D
    
    U[User Query] --> C
    C -->|ANN Search| D
    D -->|Raw Candidates| E
    E -->|Trust Re-ranking| F
    F -->|TTS Audio| U
```

---

## ⚡ Tech Stack (Powered by Qdrant)

*   **Memory Core**: **Qdrant** (Vector Database) - Using Hybrid Search & Payload Filtering.
*   **AI Logic**: **Transformers.js** (Local Embeddings) + **GPT-4o** (Vision/Reasoning).
*   **Frontend**: Next.js 16 (React Server Components), React 19, Framer Motion.
*   **Styling**: Tailwind CSS v4.
*   **Deployment**: Docker.

### Why Qdrant?
We chose Qdrant for three critical reasons:
1.  **Hybrid Search**: We combine "fuzzy" semantic search (finding related memories) with "strict" medical filters (ensuring safety) in a single query.
2.  **Binary Quantization**: Configured to compress vectors by 32x for extreme performance on edge devices (simulated in our setup).
3.  **Payload Indexing**: Fast filtering of "Emergency" tags vs "Casual" conversation.

---
## 👥 User Roles & System Overview

Memora is built around **two clearly separated user perspectives**:

### 👩‍🦳 Patient (Sarah)
A memory companion that helps record, identify, and recall personal memories.

### 👨‍👩‍⚕️ Caregiver (Mark)
A caregiver portal that enables reminders, messages, and activity awareness.

This separation ensures **clarity, safety, and role-appropriate interaction**.

---

## 🧠 Patient Features (Sarah’s Perspective)

### 1️⃣ Record Moments (Voice + Image)
- The user can **record memories using voice input** via a microphone.
- The user can **upload images** (e.g., people, objects, places).
- Along with the image, the user can **describe the memory in their own words**.
- These inputs are stored together as a **single contextual memory unit**.

📌 Example:
> Uploading a photo and saying  
> *“He is my grandson Alex.”*

---

### 2️⃣ Identify People & Objects
- When an image is uploaded, Memora **analyzes the image** and associates it with the provided description.
- The system **confirms and stores the identity** as a memory.
- This allows the user to later recognize people or objects they may forget.

✔ Image successfully analyzed  
✔ Memory stored and indexed

---

### 3️⃣ Automatic Memory Recognition
- If the **same image is uploaded again in the future**, Memora:
  - Recognizes the image
  - Retrieves the **previously stored memory**
  - Displays the associated information back to the user

📌 Example:
> Uploading the same photo again returns:  
> *“I can confirm: he is my grandson Alex.”*

This directly addresses real-world dementia challenges like **face recognition failure**.

---

### 4️⃣ Recall Memories (Semantic Search)
- The **Recall** feature allows the user to:
  - Type a name, keyword, or partial thought
  - Example: `alex`
- Memora performs **semantic search**, not keyword matching.
- It returns **all relevant memories** associated with the query:
  - Images
  - Descriptions
  - Past interactions

This enables **natural memory retrieval**, similar to human recall.

---

### 5️⃣ Recent Moments Feed
- Displays a timeline of:
  - Personal memories
  - Caregiver updates
- Keeps the user grounded in **recent context**.

---

## 👨‍👩‍⚕️ Caregiver Features (Mark’s Perspective)

### 1️⃣ Caregiver Portal
A dedicated dashboard connected directly to the patient.

The caregiver can see:
- Connection status
- Live activity indicators
- A real-time interaction feed

---

### 2️⃣ Send Reminders & Messages
- Caregivers can send messages such as:
  - Medication reminders
  - Appointment alerts
  - Daily check-ins
- Messages are **instantly delivered** to the patient.

📌 Example:
> “Did you take your medication?”

Confirmation is shown once the message is sent successfully.

---

### 3️⃣ Quick Actions
Caregivers have one-click actions for common scenarios:
- 💊 Medication Check
- 🏠 Visit Alert
- 📞 Call Request

These quick actions reduce friction during urgent or repetitive tasks.

---

### 4️⃣ Live Activity Feed
- Displays real-time caregiver interactions:
  - Messages sent
  - Updates added
- Helps caregivers understand **what support has already been provided**.

---

## 🚀 Quick Start (Judge's Guide)

### 1. Clone & Install
```bash
git clone https://github.com/keerthi2436/memora.git
cd memora
npm install
```

### 2. Configure Environment
Create a `.env.local` file. You can copy our example:
```bash
cp .env.example .env.local
```
> **Note**: To use the **Vision features (Camera)**, you must provide an `OPENAI_API_KEY` in `.env.local`.

### 3. Start the Engines
We recommend running Qdrant via Docker for the full experience:
```bash
docker-compose up -d
```
*If you cannot run Docker, don't worry! Memora features a **Robust Fallback Mode** that will automatically switch to a local file-based vector simulation (memora_db.json) if it cannot connect to Qdrant.*

### 4. Run the App
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 Demo Guide ("God Mode")

We added a special trigger to help judges test the full flow instantly:

1.  **Search**: Open the app and click the **Search** icon.
2.  **Trigger**: Type **"Alex"**.
3.  **Witness**: The system will simulate a "Perfect Recall" scenario, pulling up a photo and context about the user's grandson, demonstrating the full Vision + Vector + TTS pipeline in one go.

### Other Scenarios to Try:
*   **Voice**: Click the mic and say *"I put my glasses on the nightstand."* Later, ask *"Where are my glasses?"*
*   **Proactive**: If you mention *"I am feeling dizzy"*, the Guardian Agent will flag it as a health event.

---

## 📂 Project Structure

```
memora/
├── app/                # Next.js 16 App Router
├── components/         # React Components (VoiceRecorder, SearchModal)
├── lib/
│   ├── qdrant.ts       # Qdrant Client Integration & Fallback Logic
│   └── hooks/          # Custom Hooks for Audio/Vision
├── public/             # Static Assets
└── docker-compose.yml  # Qdrant Setup
```

---

## 🛡️ Robustness & Safety
*   **Offline Capable**: If the internet cuts out, the core memory retrieval keeps working via local fallback.
*   **Privacy First**: Medical data is tagged and prioritized over casual conversation using Qdrant's Payload Filtering.

---

