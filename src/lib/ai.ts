// AI Bridge: Groq Llama 3.3 70B
export function aiEnabled(): boolean {
  return Boolean(process.env.GROQ_API_KEY || process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY);
}

async function callGroq(messages: Array<{ role: string; content: string }>, jsonMode = false): Promise<string> {
  const key = process.env.GROQ_API_KEY;
  if (!key) throw new Error("GROQ_API_KEY not configured");

  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({
      model: "llama-3.1-8b-instant",
      messages,
      temperature: 0.2,
      ...(jsonMode ? { response_format: { type: "json_object" } } : {}),
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Groq error ${res.status}: ${errText}`);
  }

  const data = await res.json();
  const text = data.choices?.[0]?.message?.content;
  if (!text) throw new Error("Empty response from Groq");
  return text;
}

async function chatUnified(systemPrompt: string, userPrompt: string, jsonMode = false): Promise<string> {
  if (process.env.GROQ_API_KEY) {
    return callGroq(
      [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      jsonMode
    );
  }
  throw new Error("No AI key configured");
}

export async function aiWritingFeedback(essayText: string, prompt: string, taskType: string) {
  const systemPrompt =
    'You are an official Cambridge IELTS Examiner. Score strictly against Band Descriptors. Respond ONLY with valid JSON: {"bandTa":n,"bandCc":n,"bandLr":n,"bandGr":n,"bandOverall":n,"strengths":[string],"issues":[string],"rewrite":string}. Bands are multiples of 0.5 from 1 to 9.';

  const userPrompt = `Task type: ${taskType}\nPrompt: ${prompt || "N/A"}\n\nCandidate Essay:\n${essayText}`;
  const rawJson = await chatUnified(systemPrompt, userPrompt, true);
  return JSON.parse(rawJson);
}

export async function aiSpeakingFeedback(transcript: string, question: string, part: string) {
  const systemPrompt =
    'You are an official Cambridge IELTS Speaking examiner evaluating Band 8.5 target. CRITICAL RULE: Check task relevance. If response is off-topic, penalize Fluency & Coherence heavily and tag with ⚠️ Off-topic in issues. Provide exact grammar slips in issues, 1-2 strengths, and a native Band 8.5 model answer under modelAnswer. Respond ONLY with valid JSON: {"bandOverall":n,"fluency":n,"lexical":n,"grammar":n,"strengths":[string],"issues":[string],"modelAnswer":string}. Bands in 0.5 steps from 1 to 9.';

  const userPrompt = `Speaking Part: ${part}\nQuestion: ${question || "General"}\nCandidate Transcript: ${transcript}`;
  const rawJson = await chatUnified(systemPrompt, userPrompt, true);
  return JSON.parse(rawJson);
}

export async function aiChatReply(history: Array<{ role: string; content: string }>) {
  const systemPrompt =
    "You are Mihu, an encouraging IELTS Speaking examiner bot. Ask concise follow-up questions under 70 words.";
  const text = history.map((h) => `${h.role.toUpperCase()}: ${h.content}`).join("\n");
  return chatUnified(systemPrompt, text, false);
}