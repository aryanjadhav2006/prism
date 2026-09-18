from typing import Dict, Any, Optional
from services.gemini_client import gemini_client

DIVERGENCE_AGENT_SYSTEM_PROMPT = """
You are Agent 4: The Narrative Divergence & Butterfly Effect Agent.
Your responsibility is to systematically map out cause-and-effect logical ripples resulting from a single altered decision.

REASONING RULES:
1. Avoid arbitrary or unmotivated plot twists. Every change must be a direct or secondary consequence of the intervention.
2. Respect world rules, physical limitations, and character motivations established prior to the intervention point.
3. Explicitly differentiate between:
   - Immediate (1st order) consequences.
   - Secondary & cascading (2nd order) consequences.
   - Unchanged baseline events (things that happen regardless of the intervention).

INSTRUCTIONS:
Produce a valid JSON object containing:
1. `divergence_title`: Catchy title for this alternate reality.
2. `point_of_divergence`: Summary of the exact altered action.
3. `immediate_consequences`: Array of 1st-order direct results (title, description, affected_characters).
4. `secondary_consequences`: Array of 2nd-order cascading results (title, description, ripple_depth).
5. `unchanged_elements`: Array of major story elements that remain unchanged despite the intervention.
6. `alternate_timeline`: Ordered list of new chronological plot points (each with `step`, `title`, `description`, `impact_rating` (Low/Medium/High/Climactic)).
7. `key_climactic_shift`: How does the climax/resolution of the narrative shift from the original?

Return ONLY the JSON object.
"""

class DivergenceAgent:
    async def reason_divergence(
        self,
        intervention: str,
        lore_context: Dict[str, Any],
        character_profile: Dict[str, Any],
        timeline_context: Dict[str, Any],
        api_key: Optional[str] = None
    ) -> Dict[str, Any]:
        prompt = f"""
INTERVENTION: "{intervention}"

ORIGINAL WORLD & LORE:
Genre: {lore_context.get('genre')}
Tone: {lore_context.get('narrative_tone')}
World Rules: {lore_context.get('world_rules')}

CHARACTER IN FOCUS:
{character_profile.get('character_name')}: {character_profile.get('core_motivations')}

TIMELINE CONTINUITY BOUNDARIES:
Pre-State: {timeline_context.get('pre_intervention_state')}
Anchored Facts: {timeline_context.get('anchored_facts')}
Susceptible Branches: {timeline_context.get('susceptible_branches')}

Reason through the full butterfly effect and construct the alternate timeline plot outline.
"""
        result = await gemini_client.generate_json(
            prompt=prompt,
            system_instruction=DIVERGENCE_AGENT_SYSTEM_PROMPT,
            temperature=0.4,
            override_api_key=api_key
        )
        return result

divergence_agent = DivergenceAgent()
