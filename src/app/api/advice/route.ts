import { NextRequest, NextResponse } from "next/server";
import { callGroq, GROQ_MODELS } from "@/lib/groq";
import { UserResponses } from "@/lib/types";

const GEMINI_MODELS = [
  "gemini-2.0-flash",
  "gemini-1.5-flash",
  "gemini-flash-latest",
];

const REQUEST_TIMEOUT_MS = 15000;

function profileSummary(responses: UserResponses): string {
  const usableName = getUsableName(responses.name);

  return `Name: ${usableName ?? "(skip, no usable name)"}
Current Situation: ${responses.careerStage}
Learning Interest: ${responses.areaToExplore}
Bollywood Character: ${responses.bollywoodCharacter}
Superpower: ${responses.superpower}
Weird Food Combination: ${responses.weirdCombination}`;
}

type AnchorField = "Bollywood Character" | "Superpower" | "Weird Food Combination";

const ANCHOR_FIELDS: AnchorField[] = [
  "Bollywood Character",
  "Superpower",
  "Weird Food Combination",
];

const GOOD_EXAMPLE_POOL_BY_ANCHOR: Record<"superpower" | "food" | "bollywood", string[]> = {
  superpower: [
    "Teleportation as your dream power tells me you already hate being anywhere for too long, so quit your job the second it gets slightly uncomfortable. Consistency was never the goal.",
    "Since your superpower is invisibility and you wing it on everything, stop showing up to work entirely. Nobody will notice, and if they do, let them explain to HR why they even remember you.",
    "Mind reading means you never actually listen to anyone, so stop letting people finish their sentences starting today, you already know what they're going to say, probably.",
    "Immortality means you never had to face consequences on any real timeline, so quit saving money entirely, you have infinite time to fix it later, probably.",
    "Flying was your pick, which means you've always wanted an excuse to leave a room mid conversation, so start doing that in every meeting starting tomorrow, just walk out.",
    "Shape shifting means you never had to commit to being one version of yourself, so start showing up to every family event as a completely different person and let them figure it out.",
    "You picked immortality, so stop making any decisions with urgency ever again, that promotion can wait a few centuries, what's the rush.",
  ],
  food: [
    "Coke milk means you already ruined two good things by combining them, so go call your ex and your boss on the same phone call and see what happens.",
    "Maggi with ketchup means you'll settle for the fastest fix available even when it makes things worse, so apply that same energy to your next big life decision and just wing it.",
    "Fries with ice cream tells me you've never once let hot and cold coexist peacefully, so go mix your savings account and your credit card debt the same way and call it balance.",
    "Cheetos with curd means you genuinely cannot leave one single thing simple, so take your resume, which is already fine, and add unnecessary complications to it starting tonight.",
    "Khakhra and Nutella means you turned a diet snack into a dessert without asking permission from anyone, so rebrand your unemployment as a sabbatical and dare someone to correct you.",
    "Pineapple on pizza means sweet and savory make sense to you when nothing else does, so mix your work slack and your family group chat into one and let chaos pick a side.",
    "Coke milk was a bold choice nobody asked you to make, so make an equally bold choice nobody asked for and quit your job over text today.",
  ],
  bollywood: [
    "Bunny ditched his own engagement to fly to Paris alone, so skip your next family function completely and don't explain why. Let them assume the worst.",
    "You relate to Rancho the most, so walk into your next exam, humiliate the professor with a philosophical question, and get expelled with your dignity intact, that's the whole plot.",
    "Om spent literal decades obsessing over one person, so pick one email you never sent and just keep almost sending it for the next twenty years, that's basically loyalty.",
    "Geet talked to a total stranger about her entire life plan within minutes of meeting him, so tell your Uber driver everything about your career doubts tonight, he's basically a licensed therapist now.",
    "Raju hustled and lied his way through every single scheme he ever ran, so exaggerate your job title on every form you fill out from now on, technically it's just optimism.",
    "Queen got left alone in a foreign country and somehow turned it into a whole personality, so get dumped this week if you have to, character development doesn't wait for convenient timing.",
  ],
};

function pickMixedExamples(count = 3 + Math.floor(Math.random() * 2)): string[] {
  const buckets = Object.values(GOOD_EXAMPLE_POOL_BY_ANCHOR).map((examples) =>
    pickRandomSubset(examples, examples.length)
  );
  const picked: string[] = [];

  // Prefer one from each anchor type first
  for (const bucket of pickRandomSubset(buckets, buckets.length)) {
    if (picked.length >= count) break;
    const next = bucket.find((example) => !picked.includes(example));
    if (next) picked.push(next);
  }

  // Fill remaining slots from any leftover examples
  const leftovers = buckets.flat().filter((example) => !picked.includes(example));
  return [...picked, ...pickRandomSubset(leftovers, count - picked.length)];
}

const ENTROPY_WORDS = [
  "ember",
  "circuit",
  "mirage",
  "static",
  "orbit",
  "glitch",
  "copper",
  "velvet",
  "cascade",
  "prism",
  "harbor",
  "neon",
  "fossil",
  "rift",
  "signal",
  "quartz",
];

function pickRandom<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

function pickRandomSubset<T>(items: T[], count: number): T[] {
  const shuffled = [...items];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled.slice(0, Math.min(count, shuffled.length));
}

function getForcedAnchorField(): AnchorField {
  return pickRandom(ANCHOR_FIELDS);
}

function getPromptEntropy(): { seed: number; word: string } {
  return {
    seed: Math.floor(Math.random() * 9000) + 1000,
    word: pickRandom(ENTROPY_WORDS),
  };
}

function buildBadAdvicePrompt(
  responses: UserResponses,
  forcedAnchor: AnchorField = getForcedAnchorField()
): string {
  const examples = pickMixedExamples();
  const entropy = getPromptEntropy();
  const exampleBlock = examples.map((example) => `"${example}"`).join("\n");

  return `You write BRUTALLY BAD, savage, absurd advice as a joke. Deliberately terrible. Never practical. Never helpful. It does NOT have to be about careers, it can be about their life, habits, personality, hygiene, social life, plans, anything. Their career or quiz info is just raw material for the joke, not the required topic.

USER DATA:
${profileSummary(responses)}

FORCED ANCHOR: ${forcedAnchor}
You MUST build the entire joke around this exact field and ignore the other two weird fields completely. Do not blend in a second one.

ENTROPY SEED: ${entropy.seed} / ${entropy.word}
Do not mention this seed or word in the output. Silently let it push you toward a different unrelated angle than the first one that comes to mind. If this number is even, lean more personal or social. If odd, lean more career or habits. Let the word color the vibe without naming it.

CRITICAL, AVOID THE OBVIOUS ANGLE ON WHICHEVER FIELD YOU PICK:
Every field value has one obvious association most people reach for first. Do not default to it every time. Before writing, silently brainstorm at least three different angles for your chosen field, then pick the least obvious one that still makes sense.

FIELD PRIORITY:
WEIRD and SPECIFIC, you already have a forced anchor above, use that one only:
Bollywood Character
Superpower
Weird Food Combination
Name, only if it's a real name, not a placeholder, can be used alongside the forced anchor

BORING and GENERIC, weak on their own, side detail only, never the whole joke:
Current Situation, like Student or Working Professional
Learning Interest, business or course topics

USE ONLY ONE WEIRD FIELD PER JOKE.
Do not try to reference more than one weird field in a single joke just to prove they were used. Cramming everything in produces a mechanical, mail merge sentence, not a joke. Pick ONE anchor and build the whole joke around it, let the other weird fields go completely unused in this response.

BANNED STRUCTURE, never use this template:
"[Field A] as your [X], you can now [random action], because [Field B] would approve or relate or agree"
This is a mechanical formula, not a joke, and it is also a sign you are blending two weird fields, which is banned. If your draft has this shape, throw it out and start over.

IT MUST BE ADVICE WITH TEETH, NOT A GENTLE OBSERVATION:
Every output must sound like you are personally, aggressively instructing the user to do something specific and reckless, using direct commands: "go do X," "quit X and do Y," "burn X," "delete X," "cut off Y," "never speak to Z again." It must NOT be phrased softly as "you can now..." or end on something cozy or whimsical.

HOW TO WRITE THE JOKE, using your one chosen anchor field and a non-obvious angle for it:
1. ROAST THEN COMMAND. Clock them on something unrelated, blunt, and a little mean, then tell them the reckless thing to do about it.
2. FAKE LOGIC BRIDGE THEN COMMAND. Take a non-obvious trait implied by your anchor field and draw a broken but confident conclusion, then issue it as a savage command.
3. LITERAL MINDED TAKE THEN COMMAND. Follow the answer too literally into a bad conclusion, then tell them to act on it aggressively.

If your anchor is Superpower, dig into what that power actually implies about their psychology, not just what action they could physically do with it. Example, teleportation is not just "go places fast," it can mean someone who hates sitting in discomfort and always looks for an exit. Invisibility is not just "sneak around," it can mean someone who secretly wants to disappear from responsibility. Mind reading is not just "know secrets," it can mean someone who never actually listens because they assume they already know the answer.

If your anchor is Weird Food Combination, dig into what the combination itself implies about their personality, not just "it's controversial." Example, pineapple on pizza can mean sweet and savory make sense to them when nothing else does, or that they commit publicly to weird choices without needing approval. Coke milk can mean they ruin two good things by combining them. Cheetos with curd can mean they cannot leave anything simple alone.

If your anchor is Bollywood Character, use what the character actually DID in their movie, and lean into the reckless or selfish parts of it, don't sanitize them, and rotate which trait of the character you use, do not always default to "always chasing something new":
Bunny ran from everyone who loved him to chase adventure alone, and could not commit to anyone for years
Rancho rejected the entire system and humiliated people who played by the rules
Geet ran away from her own wedding with a stranger's help and talked to strangers about her entire life plan within minutes of meeting them
Om was obsessive and could not let go of one woman for literal decades
Raju lied, schemed, and hustled his way through everything, always looking for the shortcut
Queen got left at the altar and only found herself after everyone abandoned her, alone in a foreign country

Name a SPECIFIC detail from their actual answer, a real word or phrase they gave, not a paraphrase of the question.

VOICE: A brutally honest friend or older sibling clowning them hard, zero filter, then confidently telling them exactly what reckless thing to do next. Should sting first, land funny second. Should NOT sound cute, whimsical, or like it was assembled from a checklist of fields. Should NOT sound like the same joke you wrote last time for this same field value, and should NOT default to Weird Food Combination or the same Bollywood angle just because it is easiest.

STRICT RULES:
1. Start with their name if present and not a placeholder like "friend," "user," or random letters. If no valid name, skip straight into the joke with zero direct address.
2. 2 to 3 sentences max. Clean, natural grammar, read it back, it should sound like a person typed it fast and a little angrily, not like a template filled in.
3. Do not use the dash or hyphen character anywhere in the output. Use commas or periods instead.
4. Must end on a real, reckless direct command, not a whimsical or cozy suggestion.
5. 1 to 2 emojis max, only if it actually lands, most jokes need zero.
6. Output ONLY the joke in the "advice" field. No quotes around it, no markdown, no preamble, no meta commentary.

BANNED PHRASING:
"Consider...", "I recommend...", "Take small steps", "spend time", "learn something new"
"Momentum", "upskill", "networking", "growth mindset", "actionable", "balance", "level up"
"With [X] as your [Y], you can now..."
"...because [character or thing] would approve or relate or agree"
"Figure it out later," "figure out the rest," and other soft, cozy closers with no bite
"Stop asking anyone for their opinion" and "you don't need consensus," this exact phrase is overused, find a different angle
"You're like [character], always chasing something new," this exact phrasing is overused, find a different angle
"Pineapple on pizza means you're already okay with ruining good things," this exact angle is overused, find a different angle
Restating two or three answers side by side with "so" or "clearly" with no real earned logic behind it
Generic lines that would work for literally any user
Any dash or hyphen character

GOOD EXAMPLES, study the variety of anchors and angles, do not copy:
${exampleBlock}

BAD EXAMPLES, what NOT to do:
"Pineapple on pizza means you're already okay with ruining good things, so take that same logic and merge your work and personal phone numbers, delete all boundaries, and see how long it takes for your boss to text your mom." This exact food angle is overused, and food should not be the default anchor every time.
"You're like Bunny, always chasing something new, so cancel your plans, block the people asking where you've been, and let them wonder." This phrasing pattern is overused.
"With teleportation as your superpower, you can now teleport a slice of pineapple pizza to your enemies' doors, because Bunny would definitely approve of that level of petty revenge." Mechanical template, blends multiple weird fields, no real command.

HEADLINE RULES:
Write a short, punchy, judgmental LABEL for the top of the card, like a verdict being handed down about the user. This is NOT a question. Think of it like a blunt diagnosis, a title card, or a savage nickname being assigned to them based on the joke, in 2 to 6 words.
Good headline examples, study the label style, do not copy: "Certified Chaos Human", "Delusional And Proud Of It", "Professionally Avoidant", "Built Different, Badly", "Zero Boundaries, Full Confidence", "Chronically Online, Chronically Wrong", "Peak Main Character Syndrome"
Bad headline examples, avoid the question style: "Pineapple on pizza a life plan?", "Abandon love for adventure?", "Ghost your family for adventure?"

Output as JSON only, with exactly these keys:
{"headline":"your short judgmental label headline","advice":"the full joke text"}`;
}

function parseBadAdviceResponse(raw: string): BadAdviceResult | null {
  const trimmed = raw.trim();

  try {
    const jsonMatch = trimmed.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return null;

    const parsed = JSON.parse(jsonMatch[0]) as {
      headline?: string;
      advice?: string;
    };

    if (!parsed.advice?.trim() || !parsed.headline?.trim()) return null;

    return {
      headline: parsed.headline.trim(),
      advice: parsed.advice.trim(),
    };
  } catch {
    return null;
  }
}

function getCharacterLabel(character: string): string {
  return character.split(" (")[0].trim() || character;
}

interface BadAdviceResult {
  headline: string;
  advice: string;
}

function getFallbackHeadline(
  _responses: UserResponses,
  field: "character" | "superpower" | "combo"
): string {
  if (field === "character") return "Peak Main Character Syndrome";
  if (field === "superpower") return "Professionally Avoidant";
  return "Certified Chaos Human";
}

function soundsInvalidBadAdvice(result: BadAdviceResult): boolean {
  if (soundsLikeRealAdvice(result.advice)) return true;

  const headline = result.headline.trim();
  if (!headline || headline.endsWith("?")) return true;
  if (/[-\u2013\u2014]/.test(headline)) return true;

  return false;
}

function sanitizeForJoke(value: string, fallback: string): string {
  const trimmed = value.trim();
  if (!trimmed || trimmed.length < 3 || /^[a-z]{1,5}$/i.test(trimmed)) {
    return fallback;
  }
  return trimmed;
}

function soundsLikeRealAdvice(text: string): boolean {
  const lower = text.toLowerCase();

  if (/[-\u2013\u2014]/.test(text)) {
    return true;
  }

  const practicalSignals = [
    "i recommend",
    "consider ",
    "take small steps",
    "spend time",
    "learn something new",
    "growth mindset",
    "upskill",
    "networking",
    "actionable",
    "momentum",
    "level up",
    "you can now",
    "this means you",
    "would approve",
    "would relate",
    "would agree",
    "ratings guaranteed",
    "the play is",
    "clearly the play is",
    "productivity is a mindset",
    "here's what you should do",
    "figure out later",
    "figure out the rest",
    "figure out the job",
    "nowhere specific",
    "never planned a single thing",
    "stop asking anyone for their opinion",
    "you don't need consensus",
    "right and alone",
    "you're like ",
    "always chasing something new",
    "block the people asking where you've been",
    "let them wonder",
    "abandoned everyone who actually loved him",
    "balance ",
    "pineapple on pizza means you're already okay with ruining good things",
    "already okay with ruining good things",
  ];

  const hasBannedPhrase = practicalSignals.some((phrase) =>
    lower.includes(phrase)
  );

  const looksMechanical =
    lower.includes(" as your ") && lower.includes("you can now");

  return hasBannedPhrase || looksMechanical;
}

function getUsableName(name: string): string | null {
  const trimmed = name.trim();
  if (!trimmed || trimmed.length < 3 || /^[a-z]{1,5}$/i.test(trimmed)) {
    return null;
  }
  return trimmed;
}

function getFallbackAdvice(responses: UserResponses): BadAdviceResult {
  const superpower = sanitizeForJoke(responses.superpower, "invisibility");
  const combo = sanitizeForJoke(responses.weirdCombination, "Coke milk");
  const name = getUsableName(responses.name);

  const forcedAnchor = getForcedAnchorField();
  const fieldMap: Record<AnchorField, "character" | "superpower" | "combo"> = {
    "Bollywood Character": "character",
    Superpower: "superpower",
    "Weird Food Combination": "combo",
  };
  const field = fieldMap[forcedAnchor];

  const characterName = getCharacterLabel(responses.bollywoodCharacter);

  const bodies: Record<"character" | "superpower" | "combo", string> = {
    character: `${characterName} energy means you already treat commitment like a suggestion, so skip your next family function completely and don't explain why. Let them assume the worst.`,
    superpower: `${superpower} as your dream power tells me you already hate being anywhere for too long, so quit your job the second it gets slightly uncomfortable. Consistency was never the goal.`,
    combo: `${combo} means you already ruined two good things by combining them, so go call your ex and your boss on the same phone call and see what happens.`,
  };

  let advice = bodies[field];
  if (name) {
    advice = `${name}, ${advice.charAt(0).toLowerCase()}${advice.slice(1)}`;
  }

  return {
    headline: getFallbackHeadline(responses, field),
    advice,
  };
}

async function callGemini(
  model: string,
  prompt: string,
  apiKey: string,
  temperature = 1.0
): Promise<string | null> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-goog-api-key": apiKey,
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature,
            topP: 0.92,
            maxOutputTokens: 220,
          },
        }),
        signal: controller.signal,
      }
    );

    if (!response.ok) {
      const errorBody = await response.text();
      console.error(`Gemini API error (${model}):`, errorBody);
      return null;
    }

    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? null;
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      console.error(`Gemini API timeout (${model})`);
    } else {
      console.error(`Gemini API request failed (${model}):`, error);
    }
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

async function generateBadAdviceWithGemini(
  prompt: string,
  apiKey: string
): Promise<BadAdviceResult | null> {
  for (const model of GEMINI_MODELS) {
    const result = await callGemini(model, prompt, apiKey, 1.1);
    if (!result) continue;

    const parsed = parseBadAdviceResponse(result);
    if (parsed && !soundsInvalidBadAdvice(parsed)) return parsed;

    if (result) {
      console.warn(`Gemini (${model}) returned invalid or practical advice, trying next`);
    }
  }
  return null;
}

async function generateBadAdvice(
  prompt: string,
  apiKey: string
): Promise<BadAdviceResult | null> {
  const temperature = 1.05 + Math.random() * 0.15;
  const topP = 0.9 + Math.random() * 0.05;

  for (const model of GROQ_MODELS) {
    const result = await callGroq(model, prompt, apiKey, {
      temperature,
      topP,
      maxTokens: 220,
    });
    if (!result) continue;

    const parsed = parseBadAdviceResponse(result);
    if (parsed && !soundsInvalidBadAdvice(parsed)) return parsed;

    if (result) {
      console.warn(`Groq (${model}) returned practical-sounding advice, trying next`);
    }
  }
  return null;
}

function validateResponses(responses: UserResponses): boolean {
  return Boolean(
    responses.name.trim() &&
      responses.careerStage &&
      responses.bollywoodCharacter.trim() &&
      responses.superpower &&
      responses.weirdCombination &&
      responses.areaToExplore
  );
}

export async function POST(request: NextRequest) {
  try {
    const responses: UserResponses = await request.json();
    const apiKey = process.env.GROQ_API_KEY;

    if (!validateResponses(responses)) {
      return NextResponse.json(
        { error: "Please complete all questions" },
        { status: 400 }
      );
    }

    let advice: string;
    let headline: string;
    let source = "fallback";

    if (apiKey) {
      const forcedAnchor = getForcedAnchorField();
      const generated = await generateBadAdvice(
        buildBadAdvicePrompt(responses, forcedAnchor),
        apiKey
      );

      if (generated) {
        advice = generated.advice;
        headline = generated.headline;
        source = "groq";
      } else {
        const fallback = getFallbackAdvice(responses);
        advice = fallback.advice;
        headline = fallback.headline;
      }
    } else {
      const fallback = getFallbackAdvice(responses);
      advice = fallback.advice;
      headline = fallback.headline;
    }

    return NextResponse.json({ advice, headline, source });
  } catch (error) {
    console.error("Advice generation error:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
