import json
from typing import Dict, Any, Optional
from services.gemini_client import gemini_client

WRITER_AGENT_SYSTEM_PROMPT = """
You are Agent 5: The Narrative Realization Agent.
Your responsibility is to convert the validated divergence causal plan into rich, immersive literary prose.

CRITICAL ARCHITECTURAL CONSTRAINTS:
1. Narrative Realization Only: You are NOT a world-builder or independent plot designer. You must strictly execute the provided causal plan and alternate timeline.
2. Character Preservation: Keep character names, core identities, and occupations strictly as established (e.g. Elias is a lighthouse keeper tending Blackwater Point; he is NEVER a boat captain, merchant, or soldier).
3. Location Grounding: Confine scenes strictly to the locations established in the Story Bible (e.g., Blackwater Point, lantern room, granite cliffs, keeper's cottage, Outer Shoals).
4. No Invented Entities: DO NOT invent unrelated characters, foreign syndicates, modern rescue agencies, or unrelated backstories.
5. Tone & Pacing: Match the narrative tone, vocabulary, and literary voice of the source text.
6. Scene Structure: Divide into clear dramatic scenes using Markdown headers (e.g. `### Scene 1: ...`, `### Scene 2: ...`).

Deliver polished, evocative Markdown prose strictly grounded in this narrative universe.
"""

class WriterAgent:
    async def generate_story(
        self,
        source_sample: str,
        intervention: str,
        story_bible: Dict[str, Any],
        timeline_context: Dict[str, Any],
        divergence_data: Dict[str, Any],
        correction_notes: Optional[str] = None,
        api_key: Optional[str] = None
    ) -> str:
        prompt = f"""
SOURCE EXCERPT (FOR VOICE & TONE MATCHING):
---
{source_sample[:2500]}
---

AUTHORITATIVE STORY BIBLE CONSTRAINTS:
Characters & Occupations: {story_bible.get('character_roles') or [c.get('name') for c in story_bible.get('characters', [])]}
Locations: {story_bible.get('locations', [])}
Important Objects: {story_bible.get('important_objects', [])}
Narrative Tone: {story_bible.get('narrative_tone', 'Atmospheric and Dramatic')}

TIMELINE AT DIVERGENCE:
Locus: {timeline_context.get('intervention_locus')}
Current Situation: {timeline_context.get('current_situation')}

USER INTERVENTION: "{intervention}"

VALIDATED CAUSAL PLAN (EXECUTE THIS EXACTLY):
Divergence Title: {divergence_data.get('divergence_title')}
Point of Divergence: {divergence_data.get('point_of_divergence')}
Immediate Consequences: {divergence_data.get('immediate_consequences')}
Secondary Consequences: {divergence_data.get('secondary_consequences')}
Alternate Timeline Outline:
{json.dumps(divergence_data.get('alternate_timeline', []), indent=2)}
Climactic Shift: {divergence_data.get('key_climactic_shift')}
"""
        if correction_notes:
            prompt += f"""
CORRECTION DIRECTIVE:
{correction_notes}
"""

        prompt += "\nWrite the complete alternate narrative story in evocative prose matching the original source voice."

        result = await gemini_client.generate_text(
            prompt=prompt,
            system_instruction=WRITER_AGENT_SYSTEM_PROMPT,
            temperature=0.6,
            max_tokens=1800,
            override_api_key=api_key
        )
        return result

writer_agent = WriterAgent()
