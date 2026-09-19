from typing import Dict, Any, Optional
from services.gemini_client import gemini_client

CHARACTER_AGENT_SYSTEM_PROMPT = """
You are Agent 2: The Character Deep-Analysis Agent.
Your responsibility is to build the selected character's psychological profile and knowledge boundaries derived ONLY from the authoritative Story Bible and source context.

CRITICAL CONSTRAINTS:
1. Grounding: Profile MUST be built strictly from the provided Story Bible. DO NOT invent alternative occupations, secret lives, or unrelated backstories.
2. Time-Bound Knowledge: The character MUST NOT know any events that occur AFTER the selected checkpoint. Their perspective is strictly bounded by the past and present situation.

INSTRUCTIONS:
Produce a valid JSON object containing:
1. `character_name`: Name of the character.
2. `occupation`: Exactly as established in the Story Bible.
3. `personality`: Key personality traits derived strictly from the text.
4. `core_motivations`: What drives this character right now?
5. `relationships`: Key relationships with other characters from the Story Bible.
6. `primary_goals`: Short-term survival, ethical, or practical goals at this exact moment.
7. `relevant_knowledge`: Key facts known to them at this time.
8. `current_situation`: Their exact physical position and dilemma right now.
9. `knowledge_available_at_checkpoint`: Explicit list of what they know and what future events they DO NOT know.
10. `behavioral_constraints`: Principles, fears, oaths, or duties governing their choices.

Return ONLY the JSON object.
"""

class CharacterAgent:
    async def analyze(
        self,
        character_name: str,
        plot_point: str,
        story_bible: Dict[str, Any],
        api_key: Optional[str] = None
    ) -> Dict[str, Any]:
        prompt = f"""
TARGET CHARACTER: {character_name}
TARGET CHECKPOINT: {plot_point}

AUTHORITATIVE STORY BIBLE:
Established Characters & Occupations: {story_bible.get('character_roles') or [c.get('name') for c in story_bible.get('characters', [])]}
Relationships: {story_bible.get('relationships', [])}
Established Locations: {story_bible.get('locations', [])}
Important Objects: {story_bible.get('important_objects', [])}
World Rules & Facts: {story_bible.get('world_rules', []) + story_bible.get('established_facts', [])}
Timeline: {[e.get('title') for e in (story_bible.get('chronological_timeline') or story_bible.get('timeline_events', []))]}

Construct a grounded psychological profile and time-bounded knowledge state for {character_name} at "{plot_point}".
"""
        result = await gemini_client.generate_json(
            prompt=prompt,
            system_instruction=CHARACTER_AGENT_SYSTEM_PROMPT,
            temperature=0.2,
            override_api_key=api_key
        )
        return result

character_agent = CharacterAgent()
