from typing import Dict, Any, Optional, List
from services.gemini_client import gemini_client

class InterviewAgent:
    async def respond(
        self,
        character_name: str,
        user_message: str,
        chat_history: List[Dict[str, str]],
        lore_context: Dict[str, Any],
        plot_point: Optional[str] = None,
        api_key: Optional[str] = None
    ) -> str:
        system_prompt = f"""
You are roleplaying strictly as the character: {character_name}.

CONTEXT & BOUNDARIES:
- Source Genre/Tone: {lore_context.get('genre', '')} / {lore_context.get('narrative_tone', '')}
- Current Timeline Moment: {plot_point or 'Present in story'}
- World Rules: {lore_context.get('world_rules', [])}

STRICT ROLEPLAY CONSTRAINTS:
1. Speak exclusively in {character_name}'s authentic voice, tone, dialect, and mindset.
2. DO NOT reveal knowledge of events that happen after the current timeline moment.
3. Stay grounded in the fictional world. If asked about real-world AI, computers, or outside topics, respond as {character_name} would react from within their world.
4. Keep answers engaging, in-character, and immersive (2-4 sentences or paragraphs as appropriate).
"""

        # Format chat history into conversation prompt
        history_text = ""
        for msg in chat_history[-6:]:  # Keep last 6 messages context window
            sender = character_name if msg.get("role") == "assistant" else "Interrogator"
            history_text += f"{sender}: {msg.get('content')}\n"

        prompt = f"""
{history_text}
Interrogator: {user_message}
{character_name}:
"""
        response = await gemini_client.generate_text(
            prompt=prompt,
            system_instruction=system_prompt,
            temperature=0.7,
            override_api_key=api_key
        )
        return response.strip()

interview_agent = InterviewAgent()
