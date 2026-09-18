from typing import Dict, Any, Optional
from services.gemini_client import gemini_client

CHARACTER_AGENT_SYSTEM_PROMPT = """
You are Agent 2: The Character Deep-Analysis Agent.
Your responsibility is to build a psychological profile and strict knowledge boundary for a chosen character at a specific moment in time.

CRITICAL RULE:
The character MUST NOT know or reference any events, revelations, or plot developments that occur AFTER the selected plot point in the timeline. Their perspective is strictly bounded by past and present events up to this moment.

INSTRUCTIONS:
Produce a valid JSON object containing:
1. `character_name`: Name of the character.
2. `personality_traits`: List of key personality traits.
3. `core_motivations`: What drives this character at this exact moment?
4. `primary_goals`: Short-term and long-term objectives.
5. `internal_conflicts`: Dilemmas, loyalties, or moral struggles facing them.
6. `knowledge_state`:
   - `what_they_know`: Key facts and events they are aware of up to now.
   - `what_they_do_not_know`: Crucial secrets or future events they are unaware of.
7. `behavioral_constraints`: Principles, oaths, or fears that constrain their choices.
8. `decision_predisposition`: How would this character typically respond to high-pressure choices?

Return ONLY the JSON object.
"""

class CharacterAgent:
    async def analyze(
        self,
        character_name: str,
        plot_point: str,
        lore_context: Dict[str, Any],
        api_key: Optional[str] = None
    ) -> Dict[str, Any]:
        prompt = f"""
CHARACTER TO PROFILE: {character_name}
TARGET TIMELINE MOMENT / PLOT POINT: {plot_point}

WORLD LORE CONTEXT:
Genre: {lore_context.get('genre', 'Unknown')}
World Rules: {lore_context.get('world_rules', [])}
Key Characters: {[c.get('name') for c in lore_context.get('characters', [])]}
Timeline Up To Now: {[e.get('title') for e in lore_context.get('timeline_events', [])]}

Construct a deep character analysis and time-bounded knowledge state for {character_name} right at the moment of: "{plot_point}".
"""
        result = await gemini_client.generate_json(
            prompt=prompt,
            system_instruction=CHARACTER_AGENT_SYSTEM_PROMPT,
            temperature=0.3,
            override_api_key=api_key
        )
        return result

character_agent = CharacterAgent()
