from typing import Dict, Any, Optional
from services.gemini_client import gemini_client

TIMELINE_AGENT_SYSTEM_PROMPT = """
You are Agent 3: The Timeline & Continuity Agent.
Your responsibility is to analyze the precise point of intervention in a story's timeline and establish the baseline state of the world right before the change occurs.

INSTRUCTIONS:
Produce a valid JSON object containing:
1. `intervention_locus`: Clear summary of the exact moment and decision being altered.
2. `pre_intervention_state`: State of key characters, locations, factions, and immediate environment right before the decision.
3. `anchored_facts`: World rules, past history, physical laws, or historical facts that CANNOT be erased by this intervention (e.g. past deaths, geography).
4. `susceptible_branches`: Downstream events in the original timeline that are directly threatened or invalidated by this change.
5. `continuity_constraints`: Rules that any generated alternate timeline must obey to maintain logical coherence (e.g. "A character cannot be in two places at once", "Magic rules still apply").

Return ONLY the JSON object.
"""

class TimelineAgent:
    async def analyze(
        self,
        intervention: str,
        plot_point: str,
        lore_context: Dict[str, Any],
        character_profile: Dict[str, Any],
        api_key: Optional[str] = None
    ) -> Dict[str, Any]:
        prompt = f"""
INTERVENTION REQUEST: "{intervention}"
PLOT POINT LOCUS: "{plot_point}"

CHARACTER PROFILE:
Name: {character_profile.get('character_name')}
Knowledge State: {character_profile.get('knowledge_state')}
Constraints: {character_profile.get('behavioral_constraints')}

ORIGINAL TIMELINE EVENTS:
{[e.get('title') + ': ' + e.get('description', '') for e in lore_context.get('timeline_events', [])]}

WORLD RULES:
{lore_context.get('world_rules', [])}

Map out the timeline locus, pre-intervention state, anchored facts, susceptible branches, and continuity constraints.
"""
        result = await gemini_client.generate_json(
            prompt=prompt,
            system_instruction=TIMELINE_AGENT_SYSTEM_PROMPT,
            temperature=0.3,
            override_api_key=api_key
        )
        return result

timeline_agent = TimelineAgent()
