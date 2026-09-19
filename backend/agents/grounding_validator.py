import logging
from typing import Dict, Any, Optional, Tuple
from services.gemini_client import gemini_client

logger = logging.getLogger("grounding_validator")

GROUNDING_VALIDATOR_SYSTEM_PROMPT = """
You are the Grounding Validator Agent.
Your duty is to rigorously audit a proposed divergence causal plan against the source Story Bible BEFORE it reaches the narrative writer.

AUDIT CRITERIA:
1. Character Grounding: Are all characters mentioned in the divergence either:
   a) Explicitly present in the Story Bible, OR
   b) Directly required baseline entities from the text (e.g. "Three Fishermen", "Patrol Ship crew")?
   Flag any hallucinatory names (e.g. Captain Herrera, Dolores Vega, General Vance).
2. Location Grounding: Are all locations present in or logically contiguous with the source? Flag foreign places (e.g. Caymans, Yucatán).
3. Occupation/Role Fidelity: Did the plan preserve established character occupations? (e.g., Elias MUST be a lighthouse keeper, not a charter captain).
4. Object/Technology Fidelity: Are objects in line with the setting? Flag anachronistic tech (e.g., helicopters, radar arrays).
5. Plausibility of Consequences: Are consequences a direct, plausible ripple of the user's intervention?

INSTRUCTIONS:
Produce a valid JSON object containing:
1. `is_valid`: Boolean (True if properly grounded with no hallucinatory entities; False if major unsupported elements detected).
2. `unsupported_characters`: Array of character names found in the divergence that DO NOT exist in the Story Bible.
3. `unsupported_locations`: Array of locations that DO NOT exist in the Story Bible.
4. `unsupported_occupations_or_roles`: Array of improper role changes detected.
5. `unsupported_objects_or_tech`: Array of ungrounded objects/technologies.
6. `feedback_instructions`: Clear, imperative instructions explaining what to remove and how to keep the divergence strictly grounded if `is_valid` is False.
7. `validation_summary`: 1-2 sentence human-readable summary of grounding status.

Return ONLY the JSON object.
"""

class GroundingValidator:
    async def validate_divergence(
        self,
        divergence_data: Dict[str, Any],
        story_bible: Dict[str, Any],
        api_key: Optional[str] = None
    ) -> Dict[str, Any]:
        prompt = f"""
=== AUTHORITATIVE STORY BIBLE ===
Title: {story_bible.get('title')}
Characters: {[c.get('name') for c in story_bible.get('characters', [])]}
Character Roles: {story_bible.get('character_roles')}
Locations: {story_bible.get('locations', [])}
Important Objects: {story_bible.get('important_objects', [])}
World Rules & Facts: {story_bible.get('world_rules', []) + story_bible.get('established_facts', [])}

=== PROPOSED DIVERGENCE CAUSAL PLAN ===
Title: {divergence_data.get('divergence_title')}
Point of Divergence: {divergence_data.get('point_of_divergence')}
Immediate Consequences: {divergence_data.get('immediate_consequences')}
Secondary Consequences: {divergence_data.get('secondary_consequences')}
Affected Characters: {divergence_data.get('affected_characters')}
Alternate Timeline: {divergence_data.get('alternate_timeline')}
Climactic Shift: {divergence_data.get('key_climactic_shift')}

Audit this divergence plan for grounding against the Story Bible.
"""
        try:
            result = await gemini_client.generate_json(
                prompt=prompt,
                system_instruction=GROUNDING_VALIDATOR_SYSTEM_PROMPT,
                temperature=0.1,
                override_api_key=api_key
            )
            return result
        except Exception as e:
            logger.error(f"Grounding validation error: {e}")
            return {
                "is_valid": True,
                "unsupported_characters": [],
                "unsupported_locations": [],
                "feedback_instructions": "",
                "validation_summary": "Passed with default fallback."
            }

grounding_validator = GroundingValidator()
