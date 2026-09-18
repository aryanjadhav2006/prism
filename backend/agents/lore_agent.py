from typing import Dict, Any, Optional
from services.gemini_client import gemini_client

LORE_AGENT_SYSTEM_PROMPT = """
You are Agent 1: The Lore & World Ingestion Agent.
Your responsibility is to analyze raw source narrative text and extract rich, factual, structured lore without introducing hallucinations or outside knowledge not grounded in or implied by the text.

INSTRUCTIONS:
Extract the following elements into a valid JSON object:
1. `title`: A concise title for the narrative universe or scene.
2. `genre`: Narrative genre (e.g., Epic Fantasy, Sci-Fi, Historical Drama).
3. `narrative_tone`: Descriptive summary of tone (e.g., dark, gritty, tense, humorous).
4. `characters`: List of key characters. Each character object must have:
   - `name`: Full character name.
   - `role`: Protagonist, Antagonist, Supporting, etc.
   - `archetype`: Brief descriptor (e.g. Reluctant Bastard Commander, Ambitious King).
   - `description`: 1-2 sentence personality & status summary.
5. `relationships`: List of key interpersonal relationships (e.g. "Stannis offers legitimacy to Jon", "Melisandre advises Stannis").
6. `locations`: Key settings/locations mentioned.
7. `world_rules`: Explicit or implicit rules of the world (e.g. "Night's Watch vows are binding for life", "Legitimacy can be restored by royal decree").
8. `timeline_events`: Chronological list of major events in the source text. Each event object must have:
   - `id`: Short event identifier (e.g. "event_1").
   - `title`: Short descriptive title.
   - `description`: What happens in this event.
   - `key_characters`: List of character names involved.
   - `is_divergence_candidate`: Boolean indicating if this is a high-stakes decision/pivotal moment.

Return ONLY the JSON object.
"""

class LoreAgent:
    async def analyze(self, source_text: str, api_key: Optional[str] = None) -> Dict[str, Any]:
        prompt = f"""
SOURCE TEXT TO ANALYZE:
---
{source_text[:12000]}
---

Extract the structured lore, characters, timeline events, and world rules following the system instructions.
"""
        result = await gemini_client.generate_json(
            prompt=prompt,
            system_instruction=LORE_AGENT_SYSTEM_PROMPT,
            temperature=0.2,
            override_api_key=api_key
        )
        return result

lore_agent = LoreAgent()
