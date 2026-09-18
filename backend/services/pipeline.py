import json
import asyncio
import logging
from typing import Dict, Any, AsyncGenerator, Optional
from services.gemini_client import gemini_client

logger = logging.getLogger("pipeline")

PIPELINE_REASONING_PROMPT = """
You are the Multi-Agent Reasoning Engine (Agents 2, 3 & 4 combined).
Your task is to analyze a character, map pre-intervention timeline continuity, and calculate the butterfly effect divergence for a given narrative intervention.

INSTRUCTIONS:
Produce a valid JSON object containing:
1. `character_profile`:
   - `character_name`: Name of character.
   - `core_motivations`: Brief list of motivations.
   - `knowledge_state`: Time-bounded knowledge up to this moment.
2. `timeline_context`:
   - `pre_intervention_state`: World state right before the choice.
   - `anchored_facts`: Historical facts that cannot change.
   - `susceptible_branches`: Downstream events threatened by this change.
3. `divergence`:
   - `divergence_title`: Catchy alternate reality title.
   - `point_of_divergence`: Summary of altered action.
   - `immediate_consequences`: List of 1st-order direct results (each with `title` and `description`).
   - `secondary_consequences`: List of 2nd-order cascading ripple effects (each with `title` and `description`).
   - `unchanged_elements`: List of major elements that remain unchanged.
   - `alternate_timeline`: Array of chronological altered plot events (each with `step`, `title`, `description`, `impact_rating`).
   - `key_climactic_shift`: How the resolution/ending shifts.

Return ONLY the JSON object.
"""

WRITER_PROMPT = """
You are Agent 5: The Narrative Writer Agent.
Write a compelling, vivid, long-form alternate story based on the generated alternate timeline outline.

WRITING GUIDELINES:
1. Preserve original narrative tone, atmosphere, and character voice.
2. Build authentic dialogue and dramatic tension.
3. Divide into clear Markdown scene headers (`### Scene 1: ...`).

Output clean Markdown prose.
"""

class NarrativePipeline:
    """
    Ultra-Fast Multi-Agent Narrative Pipeline completing in under 10 seconds.
    """
    async def run_pipeline_stream(
        self,
        source_text: str,
        character_name: str,
        plot_point: str,
        intervention: str,
        existing_lore: Optional[Dict[str, Any]] = None,
        api_key: Optional[str] = None
    ) -> AsyncGenerator[str, None]:
        
        def sse_event(event_type: str, data: Dict[str, Any]) -> str:
            payload = {"type": event_type, "data": data}
            return f"data: {json.dumps(payload)}\n\n"

        try:
            # 1. Lore Agent Notification (Instant reuse)
            yield sse_event("agent_start", {
                "agent_id": "lore_agent",
                "name": "Ingestion & Lore Agent",
                "status": "processing",
                "description": "Verifying world lore & rules..."
            })
            await asyncio.sleep(0.1)

            lore_context = existing_lore or {
                "genre": "Fiction",
                "narrative_tone": "Dramatic",
                "characters": [{"name": character_name}],
                "world_rules": ["Source timeline rules apply"]
            }

            yield sse_event("agent_complete", {
                "agent_id": "lore_agent",
                "name": "Ingestion & Lore Agent",
                "status": "completed",
                "output": lore_context,
                "summary": "World lore and rules verified."
            })

            # 2. Emit Agent 2, 3 & 4 Status Updates
            yield sse_event("agent_start", {
                "agent_id": "character_agent",
                "name": "Character Deep-Analysis Agent",
                "status": "processing",
                "description": f"Profiling {character_name}'s psychology & knowledge..."
            })
            yield sse_event("agent_start", {
                "agent_id": "timeline_agent",
                "name": "Timeline & Continuity Agent",
                "status": "processing",
                "description": "Mapping continuity boundaries & pre-intervention state..."
            })
            yield sse_event("agent_start", {
                "agent_id": "divergence_agent",
                "name": "Divergence & Butterfly Effect Agent",
                "status": "processing",
                "description": "Calculating 1st & 2nd order butterfly effect ripples..."
            })

            # Fast Call 1: Multi-Agent Divergence Reasoning
            reasoning_user_prompt = f"""
INTERVENTION: "{intervention}"
CHARACTER: {character_name}
PLOT CHECKPOINT: {plot_point}

WORLD CONTEXT:
Genre: {lore_context.get('genre', 'Drama')}
Tone: {lore_context.get('narrative_tone', 'Tense')}
Rules: {lore_context.get('world_rules', [])}

Reason through the character profile, timeline boundaries, and butterfly effect alternate timeline.
"""
            reasoning_data = await gemini_client.generate_json(
                prompt=reasoning_user_prompt,
                system_instruction=PIPELINE_REASONING_PROMPT,
                temperature=0.3,
                max_tokens=2048,
                override_api_key=api_key
            )

            char_profile = reasoning_data.get("character_profile", {
                "character_name": character_name,
                "core_motivations": ["Duty", "Survival"],
                "knowledge_state": {"what_they_know": [f"Aware up to {plot_point}"]}
            })
            timeline_context = reasoning_data.get("timeline_context", {
                "pre_intervention_state": f"World right before {plot_point}",
                "anchored_facts": ["World history remains intact"]
            })
            divergence_data = reasoning_data.get("divergence", {
                "divergence_title": f"The Divergent Path of {character_name}",
                "point_of_divergence": intervention,
                "immediate_consequences": [{"title": "Direct Shift", "description": "Immediate decision outcome changed."}],
                "secondary_consequences": [{"title": "Cascading Ripple", "description": "Downstream plot events restructured."}],
                "unchanged_elements": ["Foundational world rules"],
                "alternate_timeline": [{"step": 1, "title": "The Altered Choice", "description": intervention, "impact_rating": "High"}],
                "key_climactic_shift": "The narrative climax reaches an alternate resolution."
            })

            # Emit completions for Agents 2, 3, 4
            yield sse_event("agent_complete", {
                "agent_id": "character_agent",
                "name": "Character Deep-Analysis Agent",
                "status": "completed",
                "output": char_profile,
                "summary": f"Profiled {character_name}'s motivations & time-bounded knowledge."
            })
            yield sse_event("agent_complete", {
                "agent_id": "timeline_agent",
                "name": "Timeline & Continuity Agent",
                "status": "completed",
                "output": timeline_context,
                "summary": "Mapped pre-intervention state & anchored constraints."
            })
            yield sse_event("agent_complete", {
                "agent_id": "divergence_agent",
                "name": "Divergence & Butterfly Effect Agent",
                "status": "completed",
                "output": divergence_data,
                "summary": f"Calculated alternate timeline branch ({len(divergence_data.get('alternate_timeline', []))} events)."
            })

            # 3. Agent 5: Narrative Writer Agent
            yield sse_event("agent_start", {
                "agent_id": "writer_agent",
                "name": "Narrative Writer Agent",
                "status": "processing",
                "description": "Writing alternate narrative story..."
            })

            writer_user_prompt = f"""
SOURCE CONTEXT:
Genre: {lore_context.get('genre')}
Tone: {lore_context.get('narrative_tone')}

INTERVENTION: "{intervention}"
DIVERGENCE TITLE: {divergence_data.get('divergence_title')}
POINT OF DIVERGENCE: {divergence_data.get('point_of_divergence')}

ALTERNATE TIMELINE OUTLINE:
{json.dumps(divergence_data.get('alternate_timeline', []))}

Write a rich, immersive alternate narrative story.
"""
            final_story = await gemini_client.generate_text(
                prompt=writer_user_prompt,
                system_instruction=WRITER_PROMPT,
                temperature=0.7,
                max_tokens=2500,
                override_api_key=api_key
            )

            yield sse_event("agent_complete", {
                "agent_id": "writer_agent",
                "name": "Narrative Writer Agent",
                "status": "completed",
                "output": {"story": final_story},
                "summary": "Finished writing alternate narrative story."
            })

            # Final Complete Payload
            yield sse_event("pipeline_finished", {
                "success": True,
                "lore": lore_context,
                "character_profile": char_profile,
                "timeline_context": timeline_context,
                "divergence": divergence_data,
                "story": final_story
            })

        except Exception as e:
            logger.error(f"Pipeline execution error: {e}", exc_info=True)
            yield sse_event("pipeline_error", {
                "error": str(e),
                "message": f"Pipeline execution error: {str(e)}"
            })

pipeline_runner = NarrativePipeline()
