# PRISM: Multi-Agent Narrative Framework

PRISM is an AI-powered **Multi-Agent Narrative Framework** built for narrative divergence and butterfly effect simulation. Ingest any text-based story (PDF, DOCX, TXT, or raw text), extract its lore & continuity boundaries, intervene at pivotal decision checkpoints, and watch five specialized autonomous agents reason through cascading consequences to generate alternate realities.

---

## 🚀 Key Features

1. **Universal Story Ingestion**: Parses PDFs, DOCX, TXT documents, or raw text to extract characters, world rules, locations, and chronological plot checkpoints.
2. **Modular 5-Agent Pipeline**:
   - **Agent 1 (Ingestion & Lore Agent)**: Extracts structured lore, characters, world rules, and timeline.
   - **Agent 2 (Character Agent)**: Builds psychological profiles and strictly time-bounded knowledge states.
   - **Agent 3 (Timeline & Continuity Agent)**: Maps pre-intervention world state and flags susceptible plot branches.
   - **Agent 4 (Divergence Agent - Butterfly Effect)**: Calculates 1st-order direct and 2nd-order cascading consequences.
   - **Agent 5 (Narrative Writer Agent)**: Transforms alternate plot outlines into long-form prose matching the original source voice.
3. **Chatbot Narrative Laboratory UI**:
   - Dark cinematic interface with glassmorphism and real-time SSE streaming.
   - Left Sidebar Intelligence Deck with active lore memory & agent execution network status.
   - Conversational chat feed displaying agent thoughts, telemetry, butterfly effect ripple trees, and long-form alternate stories.
   - Interactive Character Interrogation Chat allowing direct Q&A with story characters bounded by timeline limits.
4. **Pre-Loaded Demo Datasets**: 1-click test datasets including *Game of Thrones: Jon Snow's Choice*, *Cyberpunk 2077: Konpeki Penthouse Heist*, and *Shakespeare's Hamlet*.

---

## 🛠️ Tech Stack

- **Frontend**: React, Vite, Tailwind CSS, Lucide Icons, Server-Sent Events (SSE) reader.
- **Backend**: Python, FastAPI, Uvicorn, SSE Starlette, PyPDF, python-docx.
- **LLM Engine**: Google Gemini API (`google-genai`).

---

## 🏁 Quick Start Instructions

### 1. Configure Gemini API Key
Create or edit `backend/.env` and add your Google Gemini API Key:
```bash
GEMINI_API_KEY=your_gemini_api_key_here
```

### 2. Start the Backend Server
```bash
cd backend
source venv/bin/activate
uvicorn main:app --host 0.0.0.0 --port 8000
```

### 3. Start the Frontend Dev Server
```bash
cd frontend
npm run dev
```

Open `http://localhost:5173` in your browser to launch the application!
