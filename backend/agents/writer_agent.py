from typing import Dict, Any, Optional
from services.gemini_client import gemini_client

WRITER_AGENT_SYSTEM_PROMPT = """
You are Agent 5: The Master Narrative Writer Agent.
Your responsibility is to craft a compelling, vivid, long-form story based on the generated alternate timeline outline and divergence plot points.

WRITING GUIDELINES:
1. Match the narrative tone, literary depth, vocabulary, and pacing of the original source text.
2. Show, don't just tell. Build atmospheric descriptions, authentic dialogue, and genuine tension.
3. Maintain character voice and psychological authenticity.
4. Structurally divide the narrative into clear chapters or scenes with Markdown headers (`### Scene 1: ...`, `### Scene 2: ...`).
5. Conclude with a strong narrative climax or thought-provoking resolution.

Output your narrative directly in clean Markdown prose.
"""

class WriterAgent:
    async def generate_story(
        self,
        source_text: str,
        intervention: str,
        lore_context: Dict[str, Any],
        divergence_data: Dict[str, Any],
        api_key: Optional[str] = None
    ) -> str:
        prompt = f"""
ORIGINAL SOURCE SAMPLE (FOR TONE MATCHING):
---
{source_text[:2000]}
---

USER INTERVENTION: "{intervention}"

ALTERNATE REALITY TITLE: {divergence_data.get('divergence_title', 'The Divergent Branch')}
POINT OF DIVERGENCE: {divergence_data.get('point_of_divergence')}

ALTERNATE PLOT OUTLINE:
{divergence_data.get('alternate_timeline')}

KEY CLIMACTIC SHIFT:
{divergence_data.get('key_climactic_shift')}

Write the complete alternate narrative in rich, immersive prose matching the source tone.
"""
        result = await gemini_client.generate_text(
            prompt=prompt,
            system_instruction=WRITER_AGENT_SYSTEM_PROMPT,
            temperature=0.7,
            override_api_key=api_key
        )
        return result

writer_agent = WriterAgent()
