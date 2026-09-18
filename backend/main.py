import os
import json
import logging
from typing import Dict, Any, List, Optional
from fastapi import FastAPI, File, UploadFile, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sse_starlette.sse import EventSourceResponse
from dotenv import load_dotenv

from services.gemini_client import gemini_client
from services.document_parser import DocumentParser
from services.pipeline import pipeline_runner, PIPELINE_REASONING_PROMPT, WRITER_PROMPT
from agents.lore_agent import lore_agent
from agents.interview_agent import interview_agent
from sample_data.samples import SAMPLE_STORIES

load_dotenv()

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("main")

app = FastAPI(
    title="Multi-Agent Narrative Framework API",
    description="Backend service for AI narrative divergence, character profiling, and story transformation.",
    version="1.0.0"
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
    source_text: str
    character_name: str
    plot_point: str
    intervention: str
    existing_lore: Optional[Dict[str, Any]] = None

class ChatRequest(BaseModel):
    character_name: str
    user_message: str
    chat_history: List[Dict[str, str]] = []
    lore_context: Dict[str, Any]
    plot_point: Optional[str] = None

@app.get("/api/health")
async def health_check():
    has_key = bool(os.getenv("GEMINI_API_KEY"))
    return {
        "status": "healthy",
        "service": "Multi-Agent Narrative Framework",
        "has_env_gemini_key": has_key
    }

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

@app.post("/api/analyze")
async def analyze_lore(req: AnalyzeRequest):
    if not req.text.strip():
        raise HTTPException(status_code=400, detail="Source text cannot be empty.")
    try:
        lore = await lore_agent.analyze(req.text)
        return {"success": True, "lore": lore}
    except Exception as e:
        logger.error(f"Error analyzing lore: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/generate")
async def generate_divergence_sync(req: GenerationRequest):
    """
    Fast synchronous endpoint returning structured divergence & narrative output in ~5 seconds.
    """
    try:
        lore_context = req.existing_lore or {
            "genre": "Fiction",
            "narrative_tone": "Dramatic",
            "characters": [{"name": req.character_name}],
            "world_rules": ["Source timeline rules apply"]
        }

        # 1. Divergence Reasoning
        reasoning_user_prompt = f"""
INTERVENTION: "{req.intervention}"
CHARACTER: {req.character_name}
PLOT CHECKPOINT: {req.plot_point}

WORLD CONTEXT:
Genre: {lore_context.get('genre', 'Drama')}
Tone: {lore_context.get('narrative_tone', 'Tense')}
"""
        reasoning_data = await gemini_client.generate_json(
            prompt=reasoning_user_prompt,
            system_instruction=PIPELINE_REASONING_PROMPT,
            temperature=0.3,
            max_tokens=2048
        )

        char_profile = reasoning_data.get("character_profile", {"character_name": req.character_name})
        timeline_context = reasoning_data.get("timeline_context", {})
        divergence_data = reasoning_data.get("divergence", {
            "divergence_title": f"The Divergent Path of {req.character_name}",
            "point_of_divergence": req.intervention,
            "immediate_consequences": [{"title": "Altered Choice", "description": "Decision outcome modified."}],
            "secondary_consequences": [{"title": "Ripple Effect", "description": "Downstream timeline shifted."}],
            "unchanged_elements": ["Established world rules"],
            "alternate_timeline": [{"step": 1, "title": "Altered Choice", "description": req.intervention}]
        })

        # 2. Narrative Writer
        writer_user_prompt = f"""
INTERVENTION: "{req.intervention}"
DIVERGENCE TITLE: {divergence_data.get('divergence_title')}
POINT OF DIVERGENCE: {divergence_data.get('point_of_divergence')}

ALTERNATE TIMELINE OUTLINE:
{json.dumps(divergence_data.get('alternate_timeline', []))}

Write a rich alternate narrative story.
"""
        final_story = await gemini_client.generate_text(
            prompt=writer_user_prompt,
            system_instruction=WRITER_PROMPT,
            temperature=0.7,
            max_tokens=2500
        )

        return {
            "success": True,
            "lore": lore_context,
            "character_profile": char_profile,
            "timeline_context": timeline_context,
            "divergence": divergence_data,
            "story": final_story
        }
    except Exception as e:
        logger.error(f"Error in sync generation: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/generate/stream")
async def generate_divergence_stream(req: GenerationRequest):
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
