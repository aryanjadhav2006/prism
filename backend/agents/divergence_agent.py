from typing import Dict, Any, Optional
from services.gemini_client import gemini_client

DIVERGENCE_AGENT_SYSTEM_PROMPT = """
You are Agent 4: The Narrative Divergence & Causal Butterfly Effect Agent.
Your responsibility is to systematically map out cause-and-effect logical ripples resulting strictly from a single altered decision.

========================
HARD GROUNDING RULES:
========================
Every single generated element must satisfy one of these two criteria:
A. Explicitly present in the provided Story Bible, OR
B. A logically necessary causal consequence of the user's intervention.

STRICT PROHIBITIONS:
- DO NOT invent new unrelated characters (e.g., Captain Herrera, Dolores Vega, General Vance).
- DO NOT invent new unrelated locations (e.g., Caymans, Yucatán, other countries/cities).
- DO NOT alter character occupations or fundamental identities (e.g., Elias is a lighthouse keeper; DO NOT make him a charter-boat captain or criminal).
- DO NOT introduce unrelated organizations (e.g., cartels, foreign militaries, coast guard agencies not in the source).
- DO NOT introduce modern technologies or items not present in the setting (e.g., helicopters, smartphones).
- DO NOT invent arbitrary or unmotivated plot twists or foreign backstories.

You are reasoning about the butterfly effect within THIS universe, NOT world-building a new universe.

INSTRUCTIONS:
Produce a valid JSON object containing:
1. `point_of_divergence`: Summary of the exact altered choice/action requested by the user.
2. `divergence_title`: Concise, grounded title for this alternate branch.
3. `source_facts`: Key established facts from the Story Bible that anchor this branch.
4. `user_requested_changes`: The direct changes triggered by the user's intervention.
5. `immediate_consequences`: Array of 1st-order direct results (title, description, affected_characters).
6. `secondary_consequences`: Array of 2nd-order cascading ripples (title, description, ripple_depth).
7. `changed_events`: Array of original events that are altered or replaced.
8. `unchanged_events`: Array of baseline events that still occur regardless of the change.
9. `affected_characters`: Array of characters from the Story Bible whose outcomes or actions change.
10. `alternate_timeline`: Ordered list of new chronological plot points (step, title, description, impact_rating).
11. `key_climactic_shift`: How does the climax/resolution of the narrative logically shift from the original?

Return ONLY the JSON object.
"""

class DivergenceAgent:
    async def reason_divergence(
        self,
        intervention: str,
        story_bible: Dict[str, Any],
        character_profile: Dict[str, Any],
        timeline_context: Dict[str, Any],
        feedback_instructions: Optional[str] = None,
        api_key: Optional[str] = None
    ) -> Dict[str, Any]:
        prompt = f"""
USER INTERVENTION: "{intervention}"

=== SOURCE FACTS (STORY BIBLE) ===
Title: {story_bible.get('title')}
Genre: {story_bible.get('genre')}
Tone: {story_bible.get('narrative_tone')}
Grounded Characters & Occupations: {story_bible.get('character_roles') or [c.get('name') for c in story_bible.get('characters', [])]}
Grounded Locations: {story_bible.get('locations', [])}
Important Objects: {story_bible.get('important_objects', [])}
World Rules: {story_bible.get('world_rules', [])}
Established Facts: {story_bible.get('established_facts', [])}

=== CHARACTER CONTEXT ===
Target Character: {character_profile.get('character_name')}
Occupation: {character_profile.get('occupation')}
Current Situation: {character_profile.get('current_situation')}
Motivations: {character_profile.get('core_motivations')}

=== TIMELINE AT DIVERGENCE ===
Locus: {timeline_context.get('intervention_locus')}
Events Already Happened: {timeline_context.get('events_already_happened')}
Current Situation: {timeline_context.get('current_situation')}
Continuity Constraints: {timeline_context.get('continuity_constraints')}
"""
        if feedback_instructions:
            prompt += f"""
=== VALIDATOR FEEDBACK (MUST CORRECT THESE MISTAKES) ===
{feedback_instructions}
"""

        prompt += "\nConstruct the strictly grounded causal plan following the system instructions."

        result = await gemini_client.generate_json(
            prompt=prompt,
            system_instruction=DIVERGENCE_AGENT_SYSTEM_PROMPT,
            temperature=0.2,
            override_api_key=api_key
        )
        return result

divergence_agent = DivergenceAgent()
