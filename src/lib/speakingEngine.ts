// Free, local heuristic IELTS Speaking transcript analyzer.

const FILLERS = ["um", "uh", "umm", "uhh", "like", "you know", "i mean", "actually", "basically", "sort of", "kind of", "er", "erm"];

const COMPLEX_MARKERS = [
  "although",
  "even though",
  "because",
  "since",
  "while",
  "whereas",
  "which",
  "that",
  "if",
  "unless",
  "in order to",
  "so that",
];

function words(text: string): string[] {
  return (text.toLowerCase().match(/[a-z']+/g) || []).filter(Boolean);
}

export interface SpeakingAnalysis {
  wordCount: number;
  fillerCount: number;
  fillerRate: number;
  wordsPerMinute: number;
  uniqueWordRatio: number;
  complexSentenceMarkers: number;
  repeatedWords: string[];
  bandFluency: number;
  bandLexical: number;
  bandGrammar: number;
  bandOverall: number;
  strengths: string[];
  issues: string[];
}

export function analyzeSpeaking(transcript: string, durationSeconds: number): SpeakingAnalysis {
  const text = transcript.trim();
  const w = words(text);
  const wordCount = w.length;
  const lower = text.toLowerCase();

  let fillerCount = 0;
  for (const f of FILLERS) {
    const re = new RegExp(`\\b${f}\\b`, "g");
    fillerCount += lower.match(re)?.length || 0;
  }
  const fillerRate = wordCount ? fillerCount / wordCount : 0;

  const minutes = Math.max(durationSeconds / 60, 0.1);
  const wordsPerMinute = Math.round(wordCount / minutes);

  const uniqueWords = new Set(w);
  const uniqueWordRatio = wordCount ? uniqueWords.size / wordCount : 0;

  const complexSentenceMarkers = COMPLEX_MARKERS.reduce(
    (acc, m) => acc + (lower.match(new RegExp(`\\b${m}\\b`, "g"))?.length || 0),
    0,
  );

  // Find words repeated excessively (ignoring stopwords)
  const stop = new Set(["the", "a", "an", "is", "it", "to", "and", "i", "of", "in", "that", "was", "for", "on", "my"]);
  const freq: Record<string, number> = {};
  for (const word of w) {
    if (stop.has(word) || word.length < 4) continue;
    freq[word] = (freq[word] || 0) + 1;
  }
  const repeatedWords = Object.entries(freq)
    .filter(([, c]) => c >= 4)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([word, c]) => `${word} (${c}×)`);

  let bandFluency =
    4 +
    (wordsPerMinute >= 110 && wordsPerMinute <= 190 ? 2.5 : wordsPerMinute > 0 ? 1 : 0) -
    Math.min(2.5, fillerRate * 20);
  let bandLexical = 4 + Math.min(2.5, uniqueWordRatio * 5);
  let bandGrammar = 4 + Math.min(2.5, complexSentenceMarkers * 0.4);

  const clampBand = (n: number) => Math.max(2, Math.min(9, Math.round(n * 2) / 2));
  bandFluency = clampBand(bandFluency);
  bandLexical = clampBand(bandLexical);
  bandGrammar = clampBand(bandGrammar);
  const bandOverall = Math.round(((bandFluency + bandLexical + bandGrammar) / 3) * 2) / 2;

  const strengths: string[] = [];
  const issues: string[] = [];
  if (wordsPerMinute >= 110 && wordsPerMinute <= 190) strengths.push(`Natural speaking pace (${wordsPerMinute} wpm).`);
  else if (wordsPerMinute > 0) issues.push(`Pace is ${wordsPerMinute} wpm — natural IELTS pace is ~110-190 wpm.`);
  if (fillerRate < 0.03) strengths.push("Very few filler words/hesitations.");
  else issues.push(`${fillerCount} filler word(s)/hesitation(s) detected — try pausing silently instead of saying 'um/like'.`);
  if (complexSentenceMarkers >= 3) strengths.push("Good use of complex sentence structures.");
  else issues.push("Use more complex sentences with 'because', 'although', 'which', 'if' etc.");
  if (repeatedWords.length) issues.push(`Repeated vocabulary: ${repeatedWords.join(", ")} — vary your word choice.`);
  if (uniqueWordRatio > 0.55) strengths.push("Good lexical variety.");

  return {
    wordCount,
    fillerCount,
    fillerRate: Math.round(fillerRate * 100) / 100,
    wordsPerMinute,
    uniqueWordRatio: Math.round(uniqueWordRatio * 100) / 100,
    complexSentenceMarkers,
    repeatedWords,
    bandFluency,
    bandLexical,
    bandGrammar,
    bandOverall,
    strengths,
    issues,
  };
}

export const SPEAKING_QUESTION_BANK: Record<string, string[]> = {
  part1: [
    "Let's talk about your hometown. Where is it?",
    "Do you work or are you a student?",
    "What do you usually do in your free time?",
    "Do you prefer reading books or watching movies? Why?",
    "How often do you use social media?",
    "What kind of weather do you like best?",
    "Do you enjoy cooking? Why or why not?",
    "What was your favourite subject at school?",
  ],
  part2: [
    "Describe a skill you would like to learn. You should say: what it is, why you want to learn it, how you would learn it, and explain how it would benefit you.",
    "Describe a memorable trip you have taken. You should say: where you went, who you went with, what you did there, and explain why it was memorable.",
    "Describe a person who has influenced you. You should say: who this person is, how you know them, what they are like, and explain how they have influenced you.",
    "Describe a piece of technology you find useful. You should say: what it is, how often you use it, what you use it for, and explain why it is useful to you.",
  ],
  part3: [
    "Do you think technology has changed the way people communicate? How?",
    "What are the advantages and disadvantages of studying abroad?",
    "How important is it for governments to invest in education?",
    "Do you think social media has a positive or negative impact on society?",
    "How has globalisation affected local cultures?",
  ],
};
