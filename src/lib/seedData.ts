export const SEED_VOCAB: Array<{
  word: string;
  meaning: string;
  banglaMeaning?: string;
  example: string;
  synonym?: string;
  partOfSpeech: string;
  topic: string;
}> = [
  { word: "Ubiquitous", meaning: "present everywhere", banglaMeaning: "সর্বত্র বিদ্যমান", example: "Smartphones have become ubiquitous in modern society.", synonym: "omnipresent, widespread", partOfSpeech: "adjective", topic: "Technology" },
  { word: "Detrimental", meaning: "causing harm or damage", banglaMeaning: "ক্ষতিকর", example: "Excessive screen time can be detrimental to children's eyesight.", synonym: "harmful, damaging", partOfSpeech: "adjective", topic: "Health" },
  { word: "Exacerbate", meaning: "to make a problem worse", banglaMeaning: "আরও খারাপ করা", example: "Traffic congestion is exacerbated by the lack of public transport.", synonym: "worsen, aggravate", partOfSpeech: "verb", topic: "Environment" },
  { word: "Alleviate", meaning: "to make a problem less severe", banglaMeaning: "লাঘব করা", example: "The new policy aims to alleviate poverty in rural areas.", synonym: "ease, reduce", partOfSpeech: "verb", topic: "Society" },
  { word: "Sustainable", meaning: "able to continue without harming the environment", banglaMeaning: "টেকসই", example: "Governments are investing in sustainable energy sources.", synonym: "renewable, eco-friendly", partOfSpeech: "adjective", topic: "Environment" },
  { word: "Unprecedented", meaning: "never done or known before", banglaMeaning: "অভূতপূর্ব", example: "The pandemic caused unprecedented disruption to global trade.", synonym: "unparalleled, unmatched", partOfSpeech: "adjective", topic: "Society" },
  { word: "Paramount", meaning: "more important than anything else", banglaMeaning: "সর্বাপেক্ষা গুরুত্বপূর্ণ", example: "Safety is of paramount importance in the construction industry.", synonym: "supreme, foremost", partOfSpeech: "adjective", topic: "General" },
  { word: "Mitigate", meaning: "to reduce the severity of something", banglaMeaning: "প্রশমিত করা", example: "Planting trees helps mitigate the effects of climate change.", synonym: "lessen, moderate", partOfSpeech: "verb", topic: "Environment" },
  { word: "Affluent", meaning: "having a great deal of money", banglaMeaning: "ধনী", example: "Affluent families often have better access to education.", synonym: "wealthy, prosperous", partOfSpeech: "adjective", topic: "Society" },
  { word: "Controversial", meaning: "causing public disagreement", banglaMeaning: "বিতর্কিত", example: "Genetic engineering remains a controversial topic.", synonym: "disputed, contentious", partOfSpeech: "adjective", topic: "General" },
  { word: "Feasible", meaning: "possible to do easily or conveniently", banglaMeaning: "সম্ভবপর", example: "It is not economically feasible to build a new airport there.", synonym: "practicable, viable", partOfSpeech: "adjective", topic: "Work" },
  { word: "Discrepancy", meaning: "a difference between things that should be the same", banglaMeaning: "অসঙ্গতি", example: "There is a discrepancy between the two sets of data.", synonym: "inconsistency, gap", partOfSpeech: "noun", topic: "Academic" },
  { word: "Prevalent", meaning: "widespread in a particular area or time", banglaMeaning: "প্রচলিত", example: "Obesity is increasingly prevalent among teenagers.", synonym: "common, rampant", partOfSpeech: "adjective", topic: "Health" },
  { word: "Deteriorate", meaning: "to become progressively worse", banglaMeaning: "অবনতি ঘটা", example: "Air quality in the city has deteriorated over the past decade.", synonym: "decline, worsen", partOfSpeech: "verb", topic: "Environment" },
  { word: "Indispensable", meaning: "absolutely necessary", banglaMeaning: "অপরিহার্য", example: "The internet has become indispensable for modern education.", synonym: "essential, vital", partOfSpeech: "adjective", topic: "Technology" },
  { word: "Proliferation", meaning: "rapid increase in number", banglaMeaning: "দ্রুত বিস্তার", example: "The proliferation of social media has changed how we communicate.", synonym: "spread, growth", partOfSpeech: "noun", topic: "Technology" },
  { word: "Rigorous", meaning: "thorough and careful", banglaMeaning: "কঠোর", example: "Students must pass a rigorous selection process.", synonym: "strict, meticulous", partOfSpeech: "adjective", topic: "Education" },
  { word: "Inevitable", meaning: "certain to happen", banglaMeaning: "অনিবার্য", example: "Some degree of pollution is an inevitable result of industrialisation.", synonym: "unavoidable, certain", partOfSpeech: "adjective", topic: "General" },
  { word: "Lucrative", meaning: "producing a great deal of profit", banglaMeaning: "লাভজনক", example: "Tourism can be a lucrative industry for developing countries.", synonym: "profitable, rewarding", partOfSpeech: "adjective", topic: "Work" },
  { word: "Pragmatic", meaning: "dealing with things sensibly and realistically", banglaMeaning: "বাস্তববাদী", example: "The government took a pragmatic approach to the housing crisis.", synonym: "practical, realistic", partOfSpeech: "adjective", topic: "General" },
  { word: "Disparity", meaning: "a great difference", banglaMeaning: "বৈষম্য", example: "There is a wide disparity in income between rural and urban areas.", synonym: "inequality, gap", partOfSpeech: "noun", topic: "Society" },
  { word: "Entail", meaning: "to involve something as a necessary part", banglaMeaning: "অন্তর্ভুক্ত করা", example: "Studying medicine entails years of rigorous training.", synonym: "involve, require", partOfSpeech: "verb", topic: "Education" },
  { word: "Compelling", meaning: "evoking interest or attention in a powerful way", banglaMeaning: "বাধ্যকারী/আকর্ষণীয়", example: "She made a compelling argument for renewable energy.", synonym: "convincing, persuasive", partOfSpeech: "adjective", topic: "General" },
  { word: "Viable", meaning: "capable of working successfully", banglaMeaning: "কার্যকর", example: "Solar power is becoming a viable alternative to fossil fuels.", synonym: "workable, feasible", partOfSpeech: "adjective", topic: "Environment" },
  { word: "Candid", meaning: "truthful and straightforward", banglaMeaning: "অকপট", example: "The interview revealed a candid discussion about mental health.", synonym: "frank, honest", partOfSpeech: "adjective", topic: "Society" },
  { word: "Longevity", meaning: "long life; long duration", banglaMeaning: "দীর্ঘায়ু", example: "A balanced diet contributes to human longevity.", synonym: "lifespan, durability", partOfSpeech: "noun", topic: "Health" },
  { word: "Autonomy", meaning: "the right of self-government/independence", banglaMeaning: "স্বায়ত্তশাসন", example: "Many employees value autonomy in how they complete their work.", synonym: "independence, freedom", partOfSpeech: "noun", topic: "Work" },
  { word: "Meticulous", meaning: "showing great attention to detail", banglaMeaning: "নিখুঁত", example: "The scientist kept meticulous records of every experiment.", synonym: "thorough, precise", partOfSpeech: "adjective", topic: "Academic" },
  { word: "Tangible", meaning: "clear and definite; able to be perceived", banglaMeaning: "বাস্তব/স্পর্শযোগ্য", example: "The new policy has produced tangible benefits for small businesses.", synonym: "concrete, real", partOfSpeech: "adjective", topic: "General" },
  { word: "Resilient", meaning: "able to recover quickly from difficulties", banglaMeaning: "স্থিতিস্থাপক", example: "Children are often remarkably resilient after stressful experiences.", synonym: "tough, adaptable", partOfSpeech: "adjective", topic: "Society" },
];

export const SEED_RESOURCES: Array<{
  title: string;
  url: string;
  category: string;
  skill: string;
  notes?: string;
}> = [
  { title: "Cambridge Trap Radar — 30 Common Distractors", url: "https://ieltsliz.com", category: "strategy", skill: "reading", notes: "Khalid Farhan method: Master Cambridge distractor traps." },
  { title: "Band 9 Academic Collocation Swipe File", url: "https://docs.google.com/document/d/1DQnnnyyxC573QKML5NCTq5oo9nqiiFiQsI1TpPpVfpM/edit", category: "swipefile", skill: "writing", notes: "Academic phrases for engineering topics." },
  { title: "Italy Fall 2027 Track & DSU Regional Scholarship Guide", url: "https://www.polimi.it", category: "roadmap", skill: "general", notes: "Politecnico di Milano & UniBO admissions." },
  { title: "Engnovate — Cambridge 1-21 full practice (Listening/Reading/Writing/Speaking)", url: "https://engnovate.com", category: "tool", skill: "general", notes: "Do every test, log raw score + band in Mock Tests tab." },
  { title: "IELTS Liz — official tips & lessons", url: "https://ieltsliz.com", category: "article", skill: "general", notes: "Watch her Writing Task 2 structure + Speaking Part 2 cue card lessons." },
  { title: "Munzareen Shahid — IELTS Shikhun book", url: "", category: "tool", skill: "general", notes: "Primary structured book. Track chapter completion in Roadmap." },
  { title: "Cambridge IELTS 1-19 practice tests", url: "", category: "tool", skill: "general", notes: "Full timed mock tests — 1 per week minimum once foundation is solid." },
  { title: "Saved FB tips videos", url: "", category: "video", skill: "general", notes: "Re-watch during final revision week and extract checklist items into Mistake Log." },
];

export const SEED_PHASES: Array<{
  title: string;
  description: string;
  colorTag: string;
  tasks: Array<{ title: string; description?: string; skill: string; priority?: string }>;
}> = [
  {
    title: "Phase 1 — Foundation (Munzareen's IELTS Shikhun Book)",
    description: "Finish the full book end-to-end: concepts, strategy and practice sets for every skill.",
    colorTag: "violet",
    tasks: [
      { title: "Complete Listening chapters + exercises", skill: "listening", priority: "high" },
      { title: "Complete Reading chapters + exercises", skill: "reading", priority: "high" },
      { title: "Complete Writing Task 1 & Task 2 chapters", skill: "writing", priority: "high" },
      { title: "Complete Speaking Part 1/2/3 chapters", skill: "speaking", priority: "high" },
      { title: "Collect every rule/strategy into the Mistake Log as 'Prevent' entries", skill: "general" },
    ],
  },
  {
    title: "Phase 2 — Diagnostic & Baseline",
    description: "Find your true current band per skill before committing to a practice schedule.",
    colorTag: "sky",
    tasks: [
      { title: "Take the built-in Diagnostic Test (all 4 skills)", skill: "general", priority: "high" },
      { title: "Log current band estimate in Settings", skill: "general" },
      { title: "Identify top 2 weaknesses per skill", skill: "general" },
    ],
  },
  {
    title: "Phase 3 — Engnovate Cambridge Practice (Books 1-21)",
    description: "Systematic practice across all 4 skills using Engnovate's Cambridge test bank, 4 tests per book.",
    colorTag: "emerald",
    tasks: [
      { title: "Cambridge Book 10-13: Listening Tests 1-4", skill: "listening" },
      { title: "Cambridge Book 10-13: Reading Tests 1-4", skill: "reading" },
      { title: "Cambridge Book 14-17: Listening Tests 1-4", skill: "listening" },
      { title: "Cambridge Book 14-17: Reading Tests 1-4", skill: "reading" },
      { title: "Cambridge Book 18-21: Listening Tests 1-4", skill: "listening" },
      { title: "Cambridge Book 18-21: Reading Tests 1-4", skill: "reading" },
      { title: "Writing Task 1 — 15 timed practice reports/letters", skill: "writing" },
      { title: "Writing Task 2 — 15 timed practice essays", skill: "writing" },
      { title: "Speaking — full mock interviews (Part 1-3) 10x", skill: "speaking" },
    ],
  },
  {
    title: "Phase 4 — Vocabulary & Grammar Mastery",
    description: "Build topic-wise vocabulary and fix recurring grammar issues.",
    colorTag: "amber",
    tasks: [
      { title: "Review 20 new vocabulary words every week (spaced repetition)", skill: "vocab" },
      { title: "Watch IELTS Liz Writing/Speaking lessons + extract tips", skill: "general" },
      { title: "Clear every open item in the Mistake Log", skill: "general" },
    ],
  },
  {
    title: "Phase 5 — Full Mock Tests & Final Polish",
    description: "Simulate real exam conditions and fine-tune timing, nerves and band-9 phrasing.",
    colorTag: "rose",
    tasks: [
      { title: "2 full timed mock tests (all 4 skills, real exam timing)", skill: "general", priority: "high" },
      { title: "Record and self-review 5 Speaking Part 2 answers", skill: "speaking" },
      { title: "Rewrite 5 old essays using the Band-9 Enhancer and compare", skill: "writing" },
      { title: "Final checklist review 48 hours before the exam", skill: "general", priority: "high" },
    ],
  },
];

export const DIAGNOSTIC_QUESTIONS: Record<
  string,
  Array<{ q: string; options: string[]; answer: number }>
> = {
  grammar: [
    { q: "Choose the correct sentence.", options: ["She don't like coffee.", "She doesn't like coffee.", "She not like coffee.", "She isn't likes coffee."], answer: 1 },
    { q: "By the time we arrived, the movie ___.", options: ["already started", "had already started", "has already started", "already starts"], answer: 1 },
    { q: "If I ___ more time, I would travel the world.", options: ["have", "had", "will have", "having"], answer: 1 },
    { q: "The report ___ by the manager tomorrow.", options: ["will review", "will be reviewed", "is reviewing", "reviewed"], answer: 1 },
    { q: "Neither of the students ___ finished the assignment.", options: ["have", "has", "having", "had been"], answer: 1 },
  ],
  vocabulary: [
    { q: "'Ubiquitous' most nearly means:", options: ["Rare", "Everywhere", "Expensive", "Dangerous"], answer: 1 },
    { q: "A synonym for 'detrimental' is:", options: ["Beneficial", "Harmful", "Neutral", "Minor"], answer: 1 },
    { q: "'Alleviate' means to:", options: ["Worsen", "Ease", "Ignore", "Measure"], answer: 1 },
    { q: "'Feasible' means:", options: ["Impossible", "Expensive", "Practicable", "Risky"], answer: 2 },
    { q: "A synonym for 'prevalent' is:", options: ["Rare", "Common", "Secret", "Old"], answer: 1 },
  ],
  reading: [
    { q: "'Not Given' is used when the passage:", options: ["Contradicts the statement", "Confirms the statement", "Has no information about the statement", "Is unrelated to the topic"], answer: 2 },
    { q: "'False' is used when the passage:", options: ["Has no information", "Contradicts the statement", "Agrees with the statement", "Is ambiguous"], answer: 1 },
    { q: "Matching Headings tests your ability to:", options: ["Find exact word matches", "Understand the main idea of each paragraph", "Count words", "Identify the author's name"], answer: 1 },
    { q: "Skimming is best used to:", options: ["Find a specific date", "Get the general idea quickly", "Translate every word", "Memorise the passage"], answer: 1 },
    { q: "Scanning is best used to:", options: ["Understand tone", "Find specific keywords/numbers quickly", "Summarise the passage", "Analyse grammar"], answer: 1 },
  ],
  listening: [
    { q: "In Listening Section 1, you typically hear:", options: ["An academic lecture", "A conversation about everyday/social needs", "A group discussion on a study topic", "A monologue on a specialised topic"], answer: 1 },
    { q: "Form-filling questions mainly test:", options: ["Your opinion", "Specific factual details (names, numbers)", "Your pronunciation", "Grammar range"], answer: 1 },
    { q: "If the word limit says 'NO MORE THAN TWO WORDS', writing three words is:", options: ["Accepted", "Marked incorrect", "Half marked", "Ignored"], answer: 1 },
    { q: "Section 4 of the Listening test is usually:", options: ["A conversation between two friends", "An academic monologue/lecture", "A phone booking call", "A radio advertisement"], answer: 1 },
    { q: "Numbers and spelling are often tested through:", options: ["Map labelling", "Short conversations about addresses/phone numbers", "Essay writing", "Speaking practice"], answer: 1 },
  ],
};
