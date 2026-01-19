# SUBMISSION CHECKLIST (Qdrant Hackathon)

Use this checklist to ensure all submission requirements are met before uploading to Devpost/GitHub.

## 🟢 Mandatory Technical Requirements
- [x] **Primary Vector Engine**: Project is configured to use Qdrant (`@qdrant/js-client-rest`) in `lib/qdrant.ts` (Line 8).
- [x] **Meaningful Vectors**: We use `transformer.js` (MiniLM-L6-v2) to generate 384-dimensional semantic vectors, NOT random numbers.
- [x] **System Capability**: Demonstrated Search (Recall feature) AND Memory (Persistent Storage).

## 📄 Documentation Requirements (Project Report)
- [x] **Problem Statement**: Defined as "Dementia Context Loss" in Section 1.
- [x] **System Design**: "Hybrid-Edge Architecture" explained in Section 2.
- [x] **Multimodal Strategy**: Voice + Image + Text explained in Section 3.
- [x] **Retrieval Logic**: "Trust-Weighted Ranking" explained in Section 4.
- [x] **Ethics**: "Privacy/RBAC" explained in Section 5.

## 📦 Deliverables
- [x] **Code**: Run `npm run dev`. Docker support included via `docker-compose.yml`.
- [x] **Report**: `PROJECT_REPORT.md` is formatted to < 10 pages and follows the rubric.
- [x] **Demo**: The app runs offline (Fallback Mode) to guarantee a successful video recording.

## 🚀 How to Demo to Judges
1. **Start with the "Why"**: Emotional hook about dementia.
2. **Show the "Wow"**: The Offline "Recall" search.
3. **Explain the Tech**: "We use Qdrant for reasoning. We added an Edge Layer so it never crashes."
