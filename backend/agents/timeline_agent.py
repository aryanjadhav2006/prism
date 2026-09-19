from typing import Dict, Any, Optional
from services.gemini_client import gemini_client

TIMELINE_AGENT_SYSTEM_PROMPT = """
You are Agent 3: The Timeline & Continuity Agent.
Your responsibility is to establish the precise historical state of the world at the selected intervention point.

CRITICAL CONSTRAINTS:
1. Divide the chronological timeline into what has ALREADY happened, what is happening NOW, and what was supposed to happen AFTERWARD.
2. Ground all constraints strictly in the provided Story Bible.

INSTRUCTIONS:
Produce a valid JSON object containing:
1. `intervention_locus`: Summary of the exact moment and action being altered.
2. `events_already_happened`: Chronological list of events in the story prior to this moment.
3. `current_situation`: Immediate physical and dramatic situation at the checkpoint.
4. `characters_present`: Characters physically present or immediately involved at this locus.
5. `known_information`: Factual state of the world known by characters at this moment.
6. `events_originally_happened_afterward`: What the original source text described happening next (if any).
7. `continuity_constraints`: Inviolable rules that the alternate timeline must respect (e.g. established injuries, geography, physical limitations of objects).

Return ONLY the JSON object.
"""

class TimelineAgent:
    async def analyze(
        self,
        intervention: str,
        plot_point: str,
        story_bible: Dict[str, Any],
        character_profile: Dict[str, Any],
        api_key: Optional[str] = None
    ) -> Dict[str, Any]:
        prompt = f"""
INTERVENTION REQUEST: "{intervention}"
CHECKPOINT LOCUS: "{plot_point}"

STORY BIBLE:
Characters: {[c.get('name') for c in story_bible.get('characters', [])]}
Locations: {story_bible.get('locations', [])}
Important Objects: {story_bible.get('important_objects', [])}
World Rules & Facts: {story_bible.get('world_rules', []) + story_bible.get('established_facts', [])}
Chronological Timeline: {[e.get('title') + ': ' + e.get('description', '') for e in (story_bible.get('chronological_timeline') or story_bible.get('timeline_events', []))]}

CHARACTER CONTEXT:
Name: {character_profile.get('character_name')}
Situation: {character_profile.get('current_situation')}

Determine the exact state of the timeline at this locus.
"""
        result = await gemini_client.generate_json(
            prompt=prompt,
            system_instruction=TIMELINE_AGENT_SYSTEM_PROMPT,
            temperature=0.2,
            override_api_key=api_key
        )
        return result

timeline_agent = TimelineAgent()
