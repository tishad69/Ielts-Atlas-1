// Free, local, zero-cost heuristic IELTS Writing analyzer + Band-9 enhancer.
// Used automatically unless OPENAI_API_KEY is configured (see src/lib/ai.ts).

const LINKERS = [
  "however",
  "moreover",
  "furthermore",
  "therefore",
  "consequently",
  "in addition",
  "on the other hand",
  "for example",
  "for instance",
  "in contrast",
  "as a result",
  "in conclusion",
  "to conclude",
  "firstly",
  "secondly",
  "finally",
  "nevertheless",
  "in other words",
  "overall",
  "despite this",
];

const WEAK_WORD_MAP: Record<string, string[]> = {
  good: ["beneficial", "advantageous", "favourable"],
  bad: ["detrimental", "adverse", "unfavourable"],
  big: ["substantial", "considerable", "significant"],
  small: ["minimal", "negligible", "modest"],
  very: ["remarkably", "considerably", "significantly"],
  important: ["crucial", "paramount", "pivotal"],
  "a lot of": ["a substantial amount of", "a considerable number of"],
  lots: ["a substantial number of"],
  things: ["factors", "elements", "aspects"],
  thing: ["factor", "element", "aspect"],
  people: ["individuals", "members of society"],
  get: ["obtain", "acquire"],
  show: ["demonstrate", "illustrate"],
  think: ["believe", "contend", "argue"],
  nowadays: ["in contemporary society", "in the modern era"],
  also: ["additionally", "furthermore"],
  because: ["owing to the fact that", "due to the fact that"],
  but: ["however,", "yet"],
  so: ["therefore,", "consequently,"],
};

const OVERUSED_BASIC = ["good", "bad", "very", "nice", "thing", "things", "stuff", "a lot", "get", "got", "big"];

// A compact sample of the Academic Word List + IELTS-band-boosting vocabulary.
const ADVANCED_WORDS = [
  "significant",
  "crucial",
  "substantial",
  "consequently",
  "furthermore",
  "demonstrate",
  "mitigate",
  "exacerbate",
  "phenomenon",
  "perspective",
  "contemporary",
  "paramount",
  "inevitable",
  "controversial",
  "beneficial",
  "detrimental",
  "sustainable",
  "diverse",
  "implement",
  "facilitate",
  "comprehensive",
  "predominantly",
  "subsequently",
  "arguably",
  "unprecedented",
  "fundamental",
  "underlying",
  "alleviate",
  "correlation",
  "statistics",
];

const GRAMMAR_FLAGS: Array<{ pattern: RegExp; message: string }> = [
  { pattern: /\b(\w+)\s+\1\b/gi, message: "Repeated word detected (e.g. 'the the')." },
  { pattern: /\si\s/g, message: "Lowercase standalone 'i' should be capitalised 'I'." },
  { pattern: /[a-z]{1}\.[A-Z]/g, message: "Missing space after full stop." },
  { pattern: /\bdont\b|\bcant\b|\bwont\b|\bdidnt\b/gi, message: "Missing apostrophe in contraction." },
  { pattern: /\b(alot)\b/gi, message: "'alot' is not a word — use 'a lot' (or avoid informal phrasing)." },
  { pattern: /!{1,}/g, message: "Exclamation marks are too informal for IELTS Writing." },
];

function splitSentences(text: string): string[] {
  return text
    .replace(/\s+/g, " ")
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function words(text: string): string[] {
  return (text.toLowerCase().match(/[a-z']+/g) || []).filter(Boolean);
}

export interface WritingAnalysis {
  wordCount: number;
  sentenceCount: number;
  paragraphCount: number;
  avgSentenceLength: number;
  uniqueWordRatio: number;
  linkerCount: number;
  advancedWordCount: number;
  overusedBasicCount: number;
  grammarIssues: string[];
  bandTa: number;
  bandCc: number;
  bandLr: number;
  bandGr: number;
  bandOverall: number;
  strengths: string[];
  issues: string[];
}

export function analyzeWriting(essayText: string, prompt: string, taskType: string): WritingAnalysis {
  const text = essayText.trim();
  const w = words(text);
  const sentences = splitSentences(text);
  const paragraphs = text.split(/\n\s*\n/).filter((p) => p.trim().length > 0);
  const wordCount = w.length;
  const sentenceCount = Math.max(sentences.length, 1);
  const avgSentenceLength = wordCount / sentenceCount;
  const uniqueWords = new Set(w);
  const uniqueWordRatio = wordCount ? uniqueWords.size / wordCount : 0;

  const lowerText = text.toLowerCase();
  const linkerCount = LINKERS.reduce((acc, l) => acc + (lowerText.split(l).length - 1), 0);
  const advancedWordCount = ADVANCED_WORDS.reduce(
    (acc, word) => acc + (lowerText.match(new RegExp(`\\b${word}\\b`, "g"))?.length || 0),
    0,
  );
  const overusedBasicCount = OVERUSED_BASIC.reduce(
    (acc, word) => acc + (lowerText.match(new RegExp(`\\b${word}\\b`, "g"))?.length || 0),
    0,
  );

  const grammarIssues: string[] = [];
  for (const { pattern, message } of GRAMMAR_FLAGS) {
    pattern.lastIndex = 0;
    if (pattern.test(text)) grammarIssues.push(message);
  }
  const fragmentCount = sentences.filter((s) => words(s).length < 3).length;
  if (fragmentCount > 0) grammarIssues.push(`${fragmentCount} very short sentence(s)/fragments detected.`);
  const runOnCount = sentences.filter((s) => words(s).length > 40).length;
  if (runOnCount > 0) grammarIssues.push(`${runOnCount} very long sentence(s) (40+ words) — risk of run-ons.`);

  const minWords = taskType === "task1" ? 150 : 250;
  const wordCoverage = Math.min(1.3, wordCount / minWords);
  const promptWords = new Set(words(prompt || ""));
  const overlap = promptWords.size
    ? [...promptWords].filter((pw) => pw.length > 3 && w.includes(pw)).length / promptWords.size
    : 0.5;

  // --- Sub-band heuristic scoring (1-9 scale) ---
  let bandTa = 4 + wordCoverage * 2 + overlap * 2.5 + (paragraphs.length >= 3 ? 0.5 : -0.5);
  let bandCc =
    4 +
    Math.min(2, (linkerCount / sentenceCount) * 8) +
    (paragraphs.length >= (taskType === "task1" ? 2 : 4) ? 1.5 : 0) -
    (avgSentenceLength > 35 ? 0.5 : 0);
  let bandLr =
    4 +
    Math.min(2, uniqueWordRatio * 4) +
    Math.min(2, advancedWordCount * 0.3) -
    Math.min(1.5, overusedBasicCount * 0.3);
  let bandGr =
    4 +
    Math.min(2, (avgSentenceLength >= 10 && avgSentenceLength <= 25 ? 2 : 0.8)) -
    Math.min(3, grammarIssues.length * 0.4);

  const clampBand = (n: number) => Math.max(2, Math.min(9, Math.round(n * 2) / 2));
  bandTa = clampBand(bandTa);
  bandCc = clampBand(bandCc);
  bandLr = clampBand(bandLr);
  bandGr = clampBand(bandGr);

  const avg = (bandTa + bandCc + bandLr + bandGr) / 4;
  const bandOverall = Math.round(avg * 2) / 2;

  const strengths: string[] = [];
  const issues: string[] = [];
  if (wordCount >= minWords) strengths.push(`Meets the minimum word count (${wordCount} words).`);
  else issues.push(`Below the minimum word count — write at least ${minWords} words (currently ${wordCount}).`);
  if (linkerCount >= 3) strengths.push("Good use of linking devices for cohesion.");
  else issues.push("Use more linking words (however, therefore, in addition...) to connect ideas.");
  if (advancedWordCount >= 4) strengths.push("Good range of topic-specific/academic vocabulary.");
  else issues.push("Try to use more precise, less common vocabulary instead of basic words.");
  if (overusedBasicCount > 2) issues.push(`Overused basic words detected (${overusedBasicCount}×) — e.g. good/bad/very/thing.`);
  if (grammarIssues.length > 0) issues.push(...grammarIssues);
  if (paragraphs.length < (taskType === "task1" ? 2 : 4))
    issues.push("Organise your answer into clearer paragraphs (intro, body idea(s), conclusion).");

  return {
    wordCount,
    sentenceCount,
    paragraphCount: paragraphs.length,
    avgSentenceLength: Math.round(avgSentenceLength * 10) / 10,
    uniqueWordRatio: Math.round(uniqueWordRatio * 100) / 100,
    linkerCount,
    advancedWordCount,
    overusedBasicCount,
    grammarIssues,
    bandTa,
    bandCc,
    bandLr,
    bandGr,
    bandOverall,
    strengths,
    issues,
  };
}

function capitalize(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/** Produces a heuristic "Band 9 style" enhanced rewrite — vocabulary upgrades + linking words + formal tone. */
export function enhanceToBandNine(essayText: string): string {
  const paragraphs = essayText.trim().split(/\n\s*\n/).filter(Boolean);
  const linkerCycle = ["Furthermore", "Moreover", "In addition", "Consequently", "Nevertheless", "As a result"];
  let linkerIdx = 0;

  const upgraded = paragraphs.map((para) => {
    const sentences = splitSentences(para);
    const newSentences = sentences.map((sentence, idx) => {
      let s = sentence;
      // Vocabulary upgrade
      for (const [weak, options] of Object.entries(WEAK_WORD_MAP)) {
        const re = new RegExp(`\\b${weak}\\b`, "gi");
        if (re.test(s)) {
          const replacement = options[Math.floor(Math.random() * options.length)];
          s = s.replace(re, replacement);
        }
      }
      // Formal contractions
      s = s
        .replace(/don't/gi, "do not")
        .replace(/can't/gi, "cannot")
        .replace(/won't/gi, "will not")
        .replace(/isn't/gi, "is not")
        .replace(/it's/gi, "it is");

      // Add a linking word to interior sentences lacking one
      const hasLinker = LINKERS.some((l) => s.toLowerCase().includes(l));
      if (idx > 0 && !hasLinker && Math.random() > 0.4) {
        const linker = linkerCycle[linkerIdx % linkerCycle.length];
        linkerIdx += 1;
        s = `${linker}, ${s.charAt(0).toLowerCase()}${s.slice(1)}`;
      }

      s = capitalize(s.trim());
      if (!/[.!?]$/.test(s)) s += ".";
      return s;
    });
    return newSentences.join(" ");
  });

  return upgraded.join("\n\n");
}
