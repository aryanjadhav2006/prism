const API_BASE = "http://localhost:8000/api";

export async function getHealth() {
  const res = await fetch(`${API_BASE}/health`);
  return res.json();
}

export async function getSamples() {
  const res = await fetch(`${API_BASE}/samples`);
  return res.json();
}

export async function uploadDocument(file, rawText) {
  const formData = new FormData();
  if (file) {
    formData.append("file", file);
  }
  if (rawText) {
    formData.append("raw_text", rawText);
  }

  const res = await fetch(`${API_BASE}/upload`, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || "Failed to parse document");
  }
  return res.json();
}

export async function analyzeLore(text) {
  const res = await fetch(`${API_BASE}/analyze`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || "Lore analysis failed");
  }
  return res.json();
}

export async function generateDivergenceSync({ source_text, character_name, plot_point, intervention, existing_lore }) {
  const res = await fetch(`${API_BASE}/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      source_text,
      character_name,
      plot_point,
      intervention,
      existing_lore,
    }),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || "Generation failed");
  }
  return res.json();
}

export function streamDivergence({ source_text, character_name, plot_point, intervention, existing_lore }, onEvent, onError) {
  fetch(`${API_BASE}/generate/stream`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      source_text,
      character_name,
      plot_point,
      intervention,
      existing_lore,
    }),
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let buffer = "";

      function readChunk() {
        reader.read().then(({ done, value }) => {
          if (done) return;

          buffer += decoder.decode(value, { stream: true });
          const parts = buffer.split("\n\n");
          buffer = parts.pop();

          for (const part of parts) {
            if (part.startsWith("data: ")) {
              try {
                const jsonStr = part.replace(/^data:\s*/, "");
                const eventData = JSON.parse(jsonStr);
                onEvent(eventData);
              } catch (e) {
                console.error("Failed to parse SSE event:", e, part);
              }
            }
          }

          readChunk();
        }).catch((err) => {
          if (onError) onError(err);
        });
      }

      readChunk();
    })
    .catch((err) => {
      if (onError) onError(err);
    });
}

export async function sendCharacterChat({ character_name, user_message, chat_history, lore_context, plot_point }) {
  const res = await fetch(`${API_BASE}/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      character_name,
      user_message,
      chat_history,
      lore_context,
      plot_point,
    }),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || "Character chat failed");
  }
  return res.json();
}

export async function generateImageStory({ details, genre, image_data }) {
  const res = await fetch(`${API_BASE}/image-story`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      details,
      genre,
      image_data,
    }),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || "Image story generation failed");
  }
  return res.json();
}
