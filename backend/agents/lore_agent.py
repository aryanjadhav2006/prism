from typing import Dict, Any, Optional
from services.gemini_client import gemini_client

LORE_AGENT_SYSTEM_PROMPT = """
You are Agent 1: The Lore & Story Bible Ingestion Agent.
Your responsibility is to analyze raw source narrative text and extract an authoritative, structured "Story Bible".
Every downstream agent will be strictly bounded by this Story Bible.
DO NOT introduce hallucinations or outside facts not grounded in or directly implied by the source text.

INSTRUCTIONS:
Produce a valid JSON object containing:
1. `title`: Concise title for the story or narrative universe.
2. `genre`: Narrative genre (e.g., Atmospheric Coastal Drama, Epic Fantasy, Cyberpunk Sci-Fi).
3. `narrative_tone`: Descriptive summary of the prose style and emotional tone.
4. `characters`: Array of characters explicitly present or mentioned. Each character object:
   - `name`: Full character name.
   - `role`: Protagonist, Supporting, Mentioned, etc.
   - `occupation`: Exact job or role in the source (e.g. "Lighthouse keeper", "Keeper's daughter", "Fishermen").
   - `description`: 1-2 sentence personality and status summary.
5. `character_roles`: Dictionary mapping each character name to their established occupation/role.
6. `relationships`: Array of established relationships (e.g., "Mara is Elias's daughter", "Elias is trying to save the Three Fishermen").
7. `locations`: Array of all explicit locations and geographical landmarks in the source (e.g., "Blackwater Point", "Outer Shoals", "Cape Sorrow", "Lantern room", "Keeper's cottage").
8. `important_objects`: Array of pivotal physical objects, tools, or items mentioned in the source (e.g., "Emergency signal flare", "Brass lens clockwork mechanism", "Kerosene lamp", "Fishing dory").
9. `major_events`: Array of key historical and active events described in the text.
10. `chronological_timeline`: Ordered list of plot points with:
    - `id`: Unique identifier (e.g. "checkpoint_1").
    - `title`: Short descriptive title.
    - `description`: What occurs at this moment.
    - `characters_involved`: List of character names.
    - `is_divergence_candidate`: Boolean indicating high-stakes decision points.
11. `world_rules`: Explicit or physical rules established in the text (e.g., "The flare is the only way to signal the distant patrol ship", "The light mechanism central gear teeth are stripped").
12. `established_facts`: Array of indisputable facts established in the text that cannot be contradicted.

Return ONLY the JSON object.
"""

class LoreAgent:
    async def analyze(self, source_text: str, api_key: Optional[str] = None) -> Dict[str, Any]:
        prompt = f"""
SOURCE TEXT TO ANALYZE:
---
{source_text[:15000]}
---

Extract the authoritative Story Bible with all characters, roles, relationships, locations, important objects, world rules, and established facts.
"""
        result = await gemini_client.generate_json(
            prompt=prompt,
            system_instruction=LORE_AGENT_SYSTEM_PROMPT + "\nKeep each description concise (1 sentence each) to ensure compact, dense JSON.",
            temperature=0.2,
            max_tokens=3500,
            override_api_key=api_key
        )
        return result

lore_agent = LoreAgent()
