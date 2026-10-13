// Dual-Engine AI Bridge: Supports 100% Free Google Gemini 1.5 Flash and OpenAI.

export function aiEnabled(): boolean {
  return Boolean(process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY);
}

// Google Gemini 1.5 Flash Client
async function callGemini(systemPrompt: string, userPrompt: string, jsonMode = false): Promise<string> {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error("GEMINI_API_KEY not configured");

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${key}`;

  const payload: any = {
    contents: [
      {
        role: "user",
        parts: [
          { text: `${systemPrompt}\n\nCandidate Submission:\n${userPrompt}` }
        ]
      }
    ],
    generationConfig: {
      temperature: 0.2,
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

// OpenAI Client (Fallback)
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
      temperature: 0.3,
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
    throw new Error("No AI API key configured.");
  }
}

// AI Writing Evaluation
export async function aiWritingFeedback(essayText: string, prompt: string, taskType: string) {
  const systemPrompt = 
    "You are an official Cambridge IELTS Examiner. Score the essay strictly against official Band Descriptors (Task Achievement, Coherence & Cohesion, Lexical Resource, Grammatical Range & Accuracy). Respond ONLY with compact valid JSON: {\"bandTa\":n,\"bandCc\":n,\"bandLr\":n,\"bandGr\":n,\"bandOverall\":n,\"strengths\":[string],\"issues\":[string],\"rewrite\":string}. Bands must be in 0.5 steps from 1 to 9.";

  const userPrompt = `Task type: ${taskType}\nPrompt: ${prompt || "(not provided)"}\n\nCandidate Essay:\n${essayText}`;
  const rawJson = await chatUnified(systemPrompt, userPrompt, true);
  return JSON.parse(rawJson);
}

// AI Speaking Diagnostic Feedback (Strict IELTS Relevance & Band 8.5 Standards)
export async function aiSpeakingFeedback(transcript: string, question: string, part: string) {
  const systemPrompt = 
    "You are a certified senior Cambridge IELTS Speaking examiner evaluating a candidate aiming for Band 8.5. Assess strictly on Fluency & Coherence, Lexical Resource, Grammatical Range & Accuracy, and Pronunciation.\n\nCRITICAL TASK RELEVANCE RULE: First check if the candidate actually answered the given question. If the response is off-topic, evasive, nonsensical, or wanders into unrelated subjects, heavily penalize Fluency & Coherence and Overall score, and explicitly explain the irrelevance in 'issues' with an '⚠️ Off-topic' tag.\n\nIdentify exact grammar/vocabulary slips under 'issues'. Provide 1-2 authentic strengths under 'strengths'. Provide an authentic, high-level native Band 8.5 sample answer under 'modelAnswer'.\n\nRespond ONLY with compact valid JSON: {\"bandOverall\":n,\"fluency\":n,\"lexical\":n,\"grammar\":n,\"strengths\":[string],\"issues\":[string],\"modelAnswer\":string}. All scores must be multiples of 0.5 between 1.0 and 9.0.";

  const userPrompt = `Speaking Part: ${part}\nQuestion: "${question || "General IELTS Speaking"}"\nCandidate Transcript: "${transcript}"`;
  const rawJson = await chatUnified(systemPrompt, userPrompt, true);
  return JSON.parse(rawJson);
}

// AI Speaking Conversation Partner (Mihu)
export async function aiChatReply(history: Array<{ role: string; content: string }>) {
  const systemPrompt = 
    "You are Mihu, an encouraging but precise Cambridge IELTS Speaking examiner. Ask natural IELTS Part 1/2/3 follow-up questions, gently note grammar slips in brackets, and keep responses concise (under 70 words).";

  const conversationText = history.map(h => `${h.role.toUpperCase()}: ${h.content}`).join("\n");
  return chatUnified(systemPrompt, conversationText, false);
}
