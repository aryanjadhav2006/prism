import os
import json
import logging
from typing import Dict, Any, List, Optional
from fastapi import FastAPI, File, UploadFile, Form, HTTPException, Header
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sse_starlette.sse import EventSourceResponse
from dotenv import load_dotenv

from services.gemini_client import gemini_client
from services.document_parser import DocumentParser
from services.pipeline import pipeline_runner
from agents.lore_agent import lore_agent
from agents.interview_agent import interview_agent
from sample_data.samples import SAMPLE_STORIES

load_dotenv()

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("main")

app = FastAPI(
    title="PRISM: Grounded Multi-Agent Narrative Framework API",
    description="Backend service for grounded AI narrative divergence, character profiling, and story transformation.",
    version="2.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class AnalyzeRequest(BaseModel):
    text: str

class GenerationRequest(BaseModel):
    source_text: Optional[str] = ""
    character_name: Optional[str] = "Protagonist"
    plot_point: Optional[str] = "Initial Checkpoint"
    intervention: str
    existing_lore: Optional[Dict[str, Any]] = None

class ChatRequest(BaseModel):
    character_name: str
    user_message: str
    chat_history: List[Dict[str, str]] = []
    lore_context: Dict[str, Any]
    plot_point: Optional[str] = None

class LoginRequest(BaseModel):
    username: str
    password: Optional[str] = ""

@app.get("/api/health")
async def health_check():
    has_key = bool(os.getenv("OPENROUTER_API_KEY") or os.getenv("GEMINI_API_KEY"))
    return {
        "status": "healthy",
        "service": "PRISM Grounded Multi-Agent Framework",
        "has_api_key": has_key,
        "active_provider": "OpenRouter" if os.getenv("OPENROUTER_API_KEY") else "Google Gemini"
    }

@app.post("/api/auth/login")
async def login(req: LoginRequest):
    username = req.username.strip() or "Narrator"
    return {
        "success": True,
        "token": f"prism_token_{username.lower()}",
        "user": {
            "username": username,
            "display_name": username.capitalize(),
            "role": "Narrative Architect",
            "avatar": f"https://api.dicebear.com/7.x/bottts/svg?seed={username}"
        }
    }

@app.post("/api/auth/logout")
async def logout():
    return {"success": True, "message": "Logged out successfully"}

@app.get("/api/samples")
async def get_samples():
    return {"samples": SAMPLE_STORIES}

@app.post("/api/upload")
async def upload_document(
    file: Optional[UploadFile] = File(None),
    raw_text: Optional[str] = Form(None)
):
    if file:
        try:
            content = await file.read()
            parsed = DocumentParser.parse_file(content, file.filename)
            return {
                "success": True,
                "filename": file.filename,
                "text": parsed["text"],
                "stats": {
                    "word_count": parsed.get("word_count"),
                    "char_count": parsed.get("char_count"),
                    "page_count": parsed.get("page_count")
                }
            }
        except Exception as e:
            logger.error(f"Error parsing file upload: {e}")
            raise HTTPException(status_code=400, detail=str(e))
    elif raw_text:
        return {
            "success": True,
            "filename": "Pasted Narrative Text",
            "text": raw_text,
            "stats": {
                "word_count": len(raw_text.split()),
                "char_count": len(raw_text)
            }
        }
    else:
        raise HTTPException(status_code=400, detail="Either a file upload or raw text must be provided.")

from services.pipeline import pipeline_runner, local_engine

@app.post("/api/analyze")
async def analyze_lore(req: AnalyzeRequest):
    if not req.text.strip():
        raise HTTPException(status_code=400, detail="Source text cannot be empty.")
    try:
        lore = local_engine.extract_story_bible(req.text)
        return {"success": True, "lore": lore}
    except Exception as e:
        logger.error(f"Error analyzing lore: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/generate")
async def generate_divergence_sync(req: GenerationRequest):
    """
    Synchronous endpoint executing the full grounded pipeline with Story Bible and Validators.
    """
    try:
        result = await pipeline_runner.run_pipeline_sync(
            source_text=req.source_text,
            character_name=req.character_name,
            plot_point=req.plot_point,
            intervention=req.intervention,
            existing_lore=req.existing_lore
        )
        return result
    except Exception as e:
        logger.error(f"Error in sync generation: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/generate/stream")
async def generate_divergence_stream(req: GenerationRequest):
    """
    Real-time Server-Sent Events stream executing the full grounded pipeline.
    """
    generator = pipeline_runner.run_pipeline_stream(
        source_text=req.source_text,
        character_name=req.character_name,
        plot_point=req.plot_point,
        intervention=req.intervention,
        existing_lore=req.existing_lore
    )
    return EventSourceResponse(generator)

@app.post("/api/chat")
async def character_chat(req: ChatRequest):
    try:
        reply = await interview_agent.respond(
            character_name=req.character_name,
            user_message=req.user_message,
            chat_history=req.chat_history,
            lore_context=req.lore_context,
            plot_point=req.plot_point
        )
        return {"success": True, "reply": reply}
    except Exception as e:
        logger.error(f"Error in character chat: {e}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)
