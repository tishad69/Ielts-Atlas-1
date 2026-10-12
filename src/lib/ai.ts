// Dual-Engine AI Bridge: Supports 100% Free Google Gemini 1.5 Flash and OpenAI.
// If either GEMINI_API_KEY or OPENAI_API_KEY is configured in the environment,
// these helpers upgrade the heuristic engines with real LLM output.
// If no key is present, callers fall back to local heuristic engines
// (writingEngine.ts / speakingEngine.ts) — the app works fully offline/free either way.

export function aiEnabled(): boolean {
  return Boolean(process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY);
}

// -------------------------------------------------------------
// Google Gemini 1.5 Flash API Client (Free Tier via aistudio.google.com)
// -------------------------------------------------------------
async function callGemini(systemPrompt: string, userPrompt: string, jsonMode = false): Promise<string> {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error("GEMINI_API_KEY not configured");

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${key}`;

  const payload: any = {
    contents: [
      {
        role: "user",
        parts: [
          { text: `${systemPrompt}\n\nUser Request:\n${userPrompt}` }
        ]
      }
    ],
    generationConfig: {
      temperature: 0.3,
    }
  };

  if (jsonMode) {
    payload.generationConfig.responseMimeType = "application/json";
  }

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Google Gemini API error ${res.status}: ${errText}`);
  }

  const data = await res.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error("Empty response from Gemini API");
  return text;
}

// -------------------------------------------------------------
// OpenAI Client (GPT-4o-mini)
// -------------------------------------------------------------
async function callOpenAI(messages: Array<{ role: string; content: string }>, jsonMode = false): Promise<string> {
  const key = process.env.OPENAI_API_KEY;
  if (!key) throw new Error("OPENAI_API_KEY not configured");

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages,
      temperature: 0.4,
      ...(jsonMode ? { response_format: { type: "json_object" } } : {}),
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`OpenAI error ${res.status}: ${text}`);
  }

  const data = await res.json();
  return data.choices?.[0]?.message?.content as string;
}

// Unified LLM Dispatcher
async function chatUnified(systemPrompt: string, userPrompt: string, jsonMode = false): Promise<string> {
  if (process.env.GEMINI_API_KEY) {
    return callGemini(systemPrompt, userPrompt, jsonMode);
  } else if (process.env.OPENAI_API_KEY) {
    return callOpenAI(
      [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      jsonMode
    );
  } else {
    throw new Error("No AI API key configured (neither GEMINI_API_KEY nor OPENAI_API_KEY).");
  }
}

// -------------------------------------------------------------
// AI Writing Evaluation & Band 9 Master Rewrite
// -------------------------------------------------------------
export async function aiWritingFeedback(essayText: string, prompt: string, taskType: string) {
  const systemPrompt = 
    "You are an official Senior Cambridge IELTS Examiner. Score the essay strictly against the official Band Descriptors for Task Achievement/Response, Coherence & Cohesion, Lexical Resource, and Grammatical Range & Accuracy. Respond ONLY with compact valid JSON: {\"bandTa\":n,\"bandCc\":n,\"bandLr\":n,\"bandGr\":n,\"bandOverall\":n,\"strengths\":[string],\"issues\":[string],\"rewrite\":string}. Bands are numbers in 0.5 steps from 1 to 9. 'rewrite' must be a full, authentic Band-9 rewritten version of the candidate's essay incorporating sophisticated collocations, complex clause structures, and academic tone.";

  const userPrompt = `Task type: ${taskType}\nPrompt: ${prompt || "(not provided)"}\n\nCandidate Essay:\n${essayText}`;

  const rawJson = await chatUnified(systemPrompt, userPrompt, true);
  return JSON.parse(rawJson);
}

// -------------------------------------------------------------
// AI Speaking Diagnostic Feedback
// -------------------------------------------------------------
export async function aiSpeakingFeedback(transcript: string, question: string, part: string) {
  const systemPrompt = 
    "You are a certified IELTS Speaking examiner. Assess the candidate transcript against Fluency & Coherence, Lexical Resource, Grammatical Range & Accuracy, and Pronunciation proxy. Respond ONLY with compact valid JSON: {\"bandOverall\":n,\"fluency\":n,\"lexical\":n,\"grammar\":n,\"strengths\":[string],\"issues\":[string],\"modelAnswer\":string}. Bands are numbers in 0.5 steps from 1 to 9.";

  const userPrompt = `Speaking Part: ${part}\nQuestion: ${question || "(not provided)"}\n\nCandidate Transcript:\n${transcript}`;

  const rawJson = await chatUnified(systemPrompt, userPrompt, true);
  return JSON.parse(rawJson);
}

// -------------------------------------------------------------
// Mihu AI Speaking Conversation Partner Chat
// -------------------------------------------------------------
export async function aiChatReply(history: Array<{ role: string; content: string }>) {
  const systemPrompt = 
    "You are Mihu, an encouraging but precise IELTS Speaking partner bot. Ask natural IELTS Part 1/2/3 style follow-up questions based on the user's replies, gently note grammar/vocabulary slips in brackets after your reply, and keep responses concise (under 80 words).";

  const conversationText = history.map(h => `${h.role.toUpperCase()}: ${h.content}`).join("\n");
  return chatUnified(systemPrompt, conversationText, false);
}