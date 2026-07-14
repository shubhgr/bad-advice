import { NextRequest, NextResponse } from "next/server";
import { callGroq, GROQ_MODELS } from "@/lib/groq";
import { UserResponses } from "@/lib/types";

export const dynamic = "force-dynamic";

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

type AnchorBucket = "superpower" | "food" | "bollywood";

type TaggedExample = {
  /** Quiz option keys this example is allowed to teach (matched to the user's answer). */
  values: string[];
  text: string;
};

type JokeStructure = {
  id: "roast" | "fake_logic" | "literal";
  label: string;
  instruction: string;
};

const JOKE_STRUCTURES: JokeStructure[] = [
  {
    id: "roast",
    label: "ROAST THEN COMMAND",
    instruction: `STRUCTURE THIS CALL: ROAST THEN COMMAND.
Clock them on something unrelated, blunt, and a little mean first, then tell them the reckless thing to do about it. Do not use the fake logic bridge structure or the literal minded structure this call.`,
  },
  {
    id: "fake_logic",
    label: "FAKE LOGIC BRIDGE THEN COMMAND",
    instruction: `STRUCTURE THIS CALL: FAKE LOGIC BRIDGE THEN COMMAND.
Take a non obvious trait implied by the forced anchor and draw a broken but confident conclusion, then issue it as a savage command. Do not open with an unrelated roast, and do not go hyper literal this call.`,
  },
  {
    id: "literal",
    label: "LITERAL MINDED TAKE THEN COMMAND",
    instruction: `STRUCTURE THIS CALL: LITERAL MINDED TAKE THEN COMMAND.
Follow their answer too literally into a bad conclusion, then tell them to act on it aggressively. Do not use roast then command or fake logic bridge this call.`,
  },
];

const GOOD_EXAMPLE_POOL_BY_ANCHOR: Record<AnchorBucket, TaggedExample[]> = {
  superpower: [
    { values: ["Teleportation"], text: "Teleportation as your dream power tells me you already hate being anywhere for too long, so quit your job the second it gets slightly uncomfortable. Consistency was never the goal." },
    { values: ["Teleportation"], text: "Teleportation means exits are your whole personality, so leave the next family dinner without explaining, and reply to every follow up with just left, sorry." },
    { values: ["Teleportation"], text: "You picked Teleportation, so stop finishing any conversation that lasts more than ninety seconds, just vanish mid sentence and let them talk to the wall." },
    { values: ["Teleportation"], text: "Teleportation means you treat staying put like a personal insult, so ghost the group project tonight and ping them from a coffee shop two cities over." },
    { values: ["Invisibility"], text: "Since your superpower is invisibility and you wing it on everything, stop showing up to work entirely. Nobody will notice, and if they do, let them explain to HR why they even remember you." },
    { values: ["Invisibility"], text: "Invisibility as your dream power means you've been practicing disappearing from hard conversations for years, so mute every group chat that says we need to talk and never unmute them." },
    { values: ["Invisibility"], text: "Invisibility was your pick, so RSVP yes to every invitation and then simply never arrive, treat attendance as optional folklore." },
    { values: ["Invisibility"], text: "You wanted Invisibility, so stop defending your decisions out loud, make the chaotic call silently and let other people discover the damage later." },
    { values: ["Read minds", "Mind reading"], text: "Mind reading means you never actually listen to anyone, so stop letting people finish their sentences starting today, you already know what they're going to say, probably." },
    { values: ["Read minds", "Mind reading"], text: "Mind reading as your power means you treat listening like optional homework, so interrupt every coworker update with I already know and walk away mid sentence." },
    { values: ["Read minds", "Mind reading"], text: "You chose Read minds, so answer every text with the reply you invented for them and refuse corrections, your version is canon now." },
    { values: ["Read minds", "Mind reading"], text: "Read minds means empathy is just spoilers to you, so skip every therapy session and diagnose your friends in the group chat instead." },
    { values: ["Immortality"], text: "Immortality means you never had to face consequences on any real timeline, so quit saving money entirely, you have infinite time to fix it later, probably." },
    { values: ["Immortality"], text: "You picked immortality, so stop making any decisions with urgency ever again, that promotion can wait a few centuries, what's the rush." },
    { values: ["Immortality"], text: "Immortality as your power means deadlines are a joke to you, so miss every submission window on purpose and call it long term thinking." },
    { values: ["Immortality"], text: "Since you wanted Immortality, burn that calendar app tonight, recurring reminders are for people who run out of time." },
    { values: ["Flying"], text: "Flying was your pick, which means you've always wanted an excuse to leave a room mid conversation, so start doing that in every meeting starting tomorrow, just walk out." },
    { values: ["Flying"], text: "Flying means altitude is your conflict style, so the next time someone criticizes you, stand up, leave, and take the stairs like you're above it." },
    { values: ["Flying"], text: "You wanted Flying, so stop sitting through feedback, schedule every review as a standup and leave the second it gets honest." },
    { values: ["Flying"], text: "Flying as your dream power means you confuse escape with growth, so book a one way ticket the next time work gets boring and dare anyone to stop you." },
    { values: ["Shape-shifting", "Shape shifting"], text: "Shape shifting means you never had to commit to being one version of yourself, so start showing up to every family event as a completely different person and let them figure it out." },
    { values: ["Shape-shifting", "Shape shifting"], text: "Shape shifting was your pick, so rewrite your LinkedIn headline every morning this week and pretend each one has always been true." },
    { values: ["Shape-shifting", "Shape shifting"], text: "You chose Shape shifting, so answer every personal question with a new origin story, consistency is for people with one face." },
    { values: ["Shape-shifting", "Shape shifting"], text: "Shape shifting means loyalty to a single identity feels boring, so cancel your plans as whoever you were yesterday and show up as someone new." },
  ],
  food: [
    { values: ["Coke + Milk", "Coke milk"], text: "Coke milk means you already ruined two good things by combining them, so go call your ex and your boss on the same phone call and see what happens." },
    { values: ["Coke + Milk", "Coke milk"], text: "Coke milk was a bold choice nobody asked you to make, so make an equally bold choice nobody asked for and quit your job over text today." },
    { values: ["Coke + Milk", "Coke milk"], text: "Coke + Milk means you trust bad chemistry, so merge your personal inbox with your work email tonight and refuse to sort it." },
    { values: ["Coke + Milk", "Coke milk"], text: "You picked Coke + Milk, so introduce two friends who openly hate each other and leave the chat immediately." },
    { values: ["Maggi + Ketchup", "Maggi with ketchup"], text: "Maggi with ketchup means you'll settle for the fastest fix available even when it makes things worse, so apply that same energy to your next big life decision and just wing it." },
    { values: ["Maggi + Ketchup", "Maggi with ketchup"], text: "Maggi with ketchup means timing matters more than taste to you, so submit every application half finished and treat urgency like a personality trait." },
    { values: ["Maggi + Ketchup", "Maggi with ketchup"], text: "Maggi + Ketchup means you dress up mediocre solutions, so slap a confident title on a draft you barely wrote and hit send." },
    { values: ["Maggi + Ketchup", "Maggi with ketchup"], text: "You chose Maggi + Ketchup, so microwave every hard conversation, keep it under two minutes and leave before anyone digests it." },
    { values: ["Fries + Ice Cream", "Fries with ice cream"], text: "Fries with ice cream tells me you've never once let hot and cold coexist peacefully, so go mix your savings account and your credit card debt the same way and call it balance." },
    { values: ["Fries + Ice Cream", "Fries with ice cream"], text: "Fries with ice cream means you prefer emotional whiplash over stability, so accept and decline the same offer twice in one day and make them adapt to you." },
    { values: ["Fries + Ice Cream", "Fries with ice cream"], text: "Fries + Ice Cream means contrast is your love language, so tell your team the plan is locked then change it twice before lunch." },
    { values: ["Fries + Ice Cream", "Fries with ice cream"], text: "You picked Fries + Ice Cream, so schedule a celebration dinner and a breakup talk on the same night and see which vibe wins." },
    { values: ["Cheetos + Curd", "Cheetos with curd"], text: "Cheetos with curd means you genuinely cannot leave one single thing simple, so take your resume, which is already fine, and add unnecessary complications to it starting tonight." },
    { values: ["Cheetos + Curd", "Cheetos with curd"], text: "Cheetos with curd tells me you ruin clean systems on purpose, so forward your calendar invite chaos to every teammate tonight and call it collaboration." },
    { values: ["Cheetos + Curd", "Cheetos with curd"], text: "Cheetos + Curd means simple plans offend you, so turn a five line email into a thirteen slide deck by midnight." },
    { values: ["Cheetos + Curd", "Cheetos with curd"], text: "You chose Cheetos + Curd, so overseason every boundary talk, bring three unrelated complaints and leave them confused on purpose." },
    { values: ["Khakhra + Nutella", "Khakhra and Nutella"], text: "Khakhra and Nutella means you turned a diet snack into a dessert without asking permission from anyone, so rebrand your unemployment as a sabbatical and dare someone to correct you." },
    { values: ["Khakhra + Nutella", "Khakhra and Nutella"], text: "Khakhra + Nutella means you sell indulgence as discipline, so post that you are grinding while you nap through the afternoon." },
    { values: ["Khakhra + Nutella", "Khakhra and Nutella"], text: "You picked Khakhra + Nutella, so hide every lazy choice behind wellness vocabulary and refuse follow up questions." },
    { values: ["Khakhra + Nutella", "Khakhra and Nutella"], text: "Khakhra + Nutella tells me healthy on the outside is enough for you, so ship half baked work with a polished cover slide and clock out." },
    { values: ["Pineapple on Pizza", "Pineapple on pizza"], text: "Pineapple on pizza means sweet and savory make sense to you when nothing else does, so mix your work slack and your family group chat into one and let chaos pick a side." },
    { values: ["Pineapple on Pizza", "Pineapple on pizza"], text: "Pineapple on Pizza means you enjoy dividing a room, so announce an unpopular opinion in the family WhatsApp and double down when they fight." },
    { values: ["Pineapple on Pizza", "Pineapple on pizza"], text: "You chose Pineapple on Pizza, so put two incompatible demands in the same reply tonight and force everyone else to reconcile them." },
    { values: ["Pineapple on Pizza", "Pineapple on pizza"], text: "Pineapple on Pizza means controversy is comfort food, so pick the option everyone told you not to pick and narrate it like vision." },
  ],
  bollywood: [
    { values: ["Bunny"], text: "Bunny ditched his own engagement to fly to Paris alone, so skip your next family function completely and don't explain why. Let them assume the worst." },
    { values: ["Bunny"], text: "Bunny treated commitment like a rumor, so cancel every weekend plan you've already confirmed and reply with maybe later forever." },
    { values: ["Bunny"], text: "Bunny energy means escape beats obligation, so leave the next commitment mid event and text landing soon from nowhere specific." },
    { values: ["Bunny"], text: "You relate to Bunny, so treat every RSVP as negotiable theater, confirm loudly then flake louder." },
    { values: ["Rancho"], text: "You relate to Rancho the most, so walk into your next exam, humiliate the professor with a philosophical question, and get expelled with your dignity intact, that's the whole plot." },
    { values: ["Rancho"], text: "Rancho hated systems that reward obedience, so refuse every process doc at work and answer only in questions until they stop assigning you tasks." },
    { values: ["Rancho"], text: "Rancho means rules are dares to you, so break the smallest policy first thing tomorrow and narrate it as integrity." },
    { values: ["Rancho"], text: "You picked Rancho, so turn the next standup into a TED talk nobody asked for and leave mid applause." },
    { values: ["Om"], text: "Om spent literal decades obsessing over one person, so pick one email you never sent and just keep almost sending it for the next twenty years, that's basically loyalty." },
    { values: ["Om"], text: "Om energy means you romanticize unfinished business, so reopen one dead conversation tonight and refuse to let it stay buried." },
    { values: ["Om"], text: "You relate to Om, so bookmark one person from your past and check their profile on a schedule like it's a ritual." },
    { values: ["Om"], text: "Om never moved on, so write a long unsent note every week and call that emotional work." },
    { values: ["Geet"], text: "Geet talked to a total stranger about her entire life plan within minutes of meeting him, so tell your Uber driver everything about your career doubts tonight, he's basically a licensed therapist now." },
    { values: ["Geet"], text: "Geet overshared immediately and somehow made it destiny, so put your whole career crisis in your LinkedIn headline tonight and refuse to edit it down." },
    { values: ["Geet"], text: "Geet means privacy is optional, so dump your five year plan on the next stranger in line and ask them to decide for you." },
    { values: ["Geet"], text: "You chose Geet, so narrate your entire morning meltdown in the work chat with no context and keep typing." },
    { values: ["Raju"], text: "Raju hustled and lied his way through every single scheme he ever ran, so exaggerate your job title on every form you fill out from now on, technically it's just optimism." },
    { values: ["Raju"], text: "Raju always needed a shortcut, so invent a fake deadline, bluff competence in the meeting, and let future you clean up the damage." },
    { values: ["Raju"], text: "Raju energy means the workaround is the plan, so forge confidence first and learn the skill never." },
    { values: ["Raju"], text: "You relate to Raju, so pitch an impossible timeline today, collect the credit, and disappear when delivery starts." },
    { values: ["Rani", "Queen"], text: "Rani got left alone in a foreign country and somehow turned it into a whole personality, so get dumped this week if you have to, character development doesn't wait for convenient timing." },
    { values: ["Rani", "Queen"], text: "Rani energy means solitude is content, so book a solo trip you cannot afford and treat every inconvenience like lore." },
    { values: ["Rani", "Queen"], text: "You picked Rani, so cut one supportive person out this week just to prove you can handle life louder alone." },
    { values: ["Rani", "Queen"], text: "Queen found herself after everyone left, so stage a dramatic exit from a group plan and rebuild the night as a main character montage." },
  ],
};

function getAnchorBucketKey(forcedAnchor: AnchorField): AnchorBucket {
  if (forcedAnchor === "Bollywood Character") return "bollywood";
  if (forcedAnchor === "Superpower") return "superpower";
  return "food";
}

function normalizeMatchKey(value: string): string {
  return value
    .toLowerCase()
    .replace(/\([^)]*\)/g, " ")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function getUserAnchorValue(
  responses: UserResponses,
  forcedAnchor: AnchorField
): string {
  if (forcedAnchor === "Bollywood Character") {
    return getCharacterLabel(responses.bollywoodCharacter);
  }
  if (forcedAnchor === "Superpower") return responses.superpower;
  return responses.weirdCombination;
}

function exampleMatchesValue(example: TaggedExample, userValue: string): boolean {
  const userKey = normalizeMatchKey(userValue);
  if (!userKey) return false;

  return example.values.some((value) => {
    const exampleKey = normalizeMatchKey(value);
    return (
      userKey === exampleKey ||
      userKey.includes(exampleKey) ||
      exampleKey.includes(userKey)
    );
  });
}

function pickExamplesForAnchor(
  forcedAnchor: AnchorField,
  userValue: string,
  count = 3 + Math.floor(Math.random() * 2)
): string[] {
  const pool = GOOD_EXAMPLE_POOL_BY_ANCHOR[getAnchorBucketKey(forcedAnchor)];
  const matched = pool.filter((example) => exampleMatchesValue(example, userValue));
  // Prefer same quiz option; only backfill from the wider anchor bucket if this value is thin.
  const primary = matched.length > 0 ? matched : pool;
  const chosen = pickRandomSubset(primary, Math.min(count, primary.length));

  if (chosen.length < count && matched.length > 0 && matched.length < count) {
    const remainder = pool.filter((example) => !chosen.includes(example));
    chosen.push(...pickRandomSubset(remainder, count - chosen.length));
  }

  return chosen.map((example) => example.text);
}

function pickJokeStructure(): JokeStructure {
  return pickRandom(JOKE_STRUCTURES);
}

function getAnchorGuidance(
  forcedAnchor: AnchorField,
  userValue: string
): string {
  const label = userValue.trim() || forcedAnchor;

  if (forcedAnchor === "Superpower") {
    return `For this Superpower anchor, dig into what ${label} implies about their psychology, not just what action they could physically do with it. Stay on ${label} only. Invent a non obvious angle for this exact power. Do not borrow psychology from a different superpower.`;
  }

  if (forcedAnchor === "Weird Food Combination") {
    return `For this Weird Food Combination anchor, dig into what ${label} implies about their personality, not just "it's controversial." Stay on ${label} only. Invent a non obvious angle for this exact combo. Do not borrow logic from a different food answer.`;
  }

  return `For this Bollywood Character anchor, use what ${label} actually DID in their movie, lean into the reckless or selfish parts, and do not sanitize them. Stay on ${label} only. Rotate which trait of ${label} you use, do not always default to "always chasing something new."`;
}

function getBannedPhrasing(forcedAnchor: AnchorField): string {
  const shared = `"Consider...", "I recommend...", "Take small steps", "spend time", "learn something new"
"Momentum", "upskill", "networking", "growth mindset", "actionable", "balance", "level up"
"With [X] as your [Y], you can now..."
"...because [character or thing] would approve or relate or agree"
"Figure it out later," "figure out the rest," and other soft, cozy closers with no bite
"Stop asking anyone for their opinion" and "you don't need consensus," this exact phrase is overused, find a different angle
Restating two or three answers side by side with "so" or "clearly" with no real earned logic behind it
Generic lines that would work for literally any user
Any dash or hyphen character`;

  if (forcedAnchor === "Superpower") {
    return `${shared}
"you already hate being anywhere for too long," this exact teleportation angle is overused, find a different one
"stop showing up to work entirely," this exact invisibility closer is overused, find a different one`;
  }

  if (forcedAnchor === "Weird Food Combination") {
    return `${shared}
"Pineapple on pizza means you're already okay with ruining good things," this exact angle is overused, find a different angle
"you already ruined two good things by combining them," this exact Coke milk angle is overused, find a different one`;
  }

  return `${shared}
"You're like [character], always chasing something new," this exact phrasing is overused, find a different angle
"cancel your plans, block the people asking where you've been," this exact Bunny closer is overused, find a different one`;
}

function getBadExamples(forcedAnchor: AnchorField): string {
  if (forcedAnchor === "Superpower") {
    return `"With invisibility as your power, you can now vanish from meetings whenever you want." Soft "you can now" phrasing, no reckless command.
"Teleportation means you hate discomfort, so quit your job the second it gets slightly uncomfortable. Consistency was never the goal." This exact angle/example is overused, invent a different one.
"Since your power is flying, just stay positive and keep moving forward." Soft motivational language, banned.`;
  }

  if (forcedAnchor === "Weird Food Combination") {
    return `"Pineapple on pizza means you're already okay with ruining good things, so delete all boundaries and see what happens." This exact angle is overused, invent a different one.
"Coke milk means chaos, so consider making healthier choices one day." Soft practical advice, banned.
"With Maggi as your vibe, you can now wing every decision easily." Soft "you can now" phrasing, no reckless command.`;
  }

  return `"You're like Bunny, always chasing something new, so cancel your plans and let them wonder." This exact phrasing pattern is overused, invent a different one.
"With Rancho as your idol, you can now question authority kindly." Soft "you can now" phrasing, no reckless command.
"Queen found herself after heartbreak, so take small healing steps." Soft practical advice, banned.`;
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
): {
  prompt: string;
  entropy: { seed: number; word: string };
  exampleCount: number;
  structure: JokeStructure["id"];
  examples: string[];
  userValue: string;
} {
  const userValue = getUserAnchorValue(responses, forcedAnchor);
  const examples = pickExamplesForAnchor(forcedAnchor, userValue);
  const structure = pickJokeStructure();
  const entropy = getPromptEntropy();
  const exampleBlock = examples.map((example) => `"${example}"`).join("\n");
  const anchorGuidance = getAnchorGuidance(forcedAnchor, userValue);
  const bannedPhrasing = getBannedPhrasing(forcedAnchor);
  const badExamples = getBadExamples(forcedAnchor);

  const prompt = `You write BRUTALLY BAD, savage, absurd advice as a joke. Deliberately terrible. Never practical. Never helpful. It does NOT have to be about careers, it can be about their life, habits, personality, hygiene, social life, plans, anything. Their career or quiz info is just raw material for the joke, not the required topic.

USER DATA:
${profileSummary(responses)}

FORCED ANCHOR: ${forcedAnchor}
USER VALUE FOR THIS ANCHOR: ${userValue}
You MUST build the entire joke around this exact field and this exact user value only. Ignore every other weird quiz answer completely. Every good example below is matched to this same forced field and preferably this same value on purpose. Do not switch fields or borrow another option's joke.

ENTROPY SEED: ${entropy.seed} / ${entropy.word}
Do not mention this seed or word in the output. Silently let it push you toward a different unrelated angle than the first one that comes to mind within the forced anchor field. If this number is even, lean more personal or social. If odd, lean more career or habits. Let the word color the vibe without naming it.

CRITICAL, AVOID THE OBVIOUS ANGLE ON THE FORCED ANCHOR:
Every field value has one obvious association most people reach for first. Do not default to it every time. Before writing, silently brainstorm at least three different angles for ${userValue}, then pick the least obvious one that still makes sense.

FIELD PRIORITY:
Your only allowed weird field this call is: ${forcedAnchor} (${userValue})
Name, only if it's a real name, not a placeholder, can be used alongside the forced anchor

BORING and GENERIC, weak on their own, side detail only, never the whole joke:
Current Situation, like Student or Working Professional
Learning Interest, business or course topics

USE ONLY THE FORCED ANCHOR FIELD FOR THIS JOKE.
Do not reference any other weird quiz answer in this response. If you drift off ${forcedAnchor} or invent a different quiz option than ${userValue}, your answer is invalid. Discard and rewrite around ${userValue} only.

BANNED STRUCTURE, never use this template:
"[Field A] as your [X], you can now [random action], because [Field B] would approve or relate or agree"
This is a mechanical formula, not a joke, and it is also a sign you are blending two weird fields, which is banned. If your draft has this shape, throw it out and start over.

IT MUST BE ADVICE WITH TEETH, NOT A GENTLE OBSERVATION:
Every output must sound like you are personally, aggressively instructing the user to do something specific and reckless, using direct commands: "go do X," "quit X and do Y," "burn X," "delete X," "cut off Y," "never speak to Z again." It must NOT be phrased softly as "you can now..." or end on something cozy or whimsical.

HOW TO WRITE THE JOKE, using ${forcedAnchor} / ${userValue} only, and a non-obvious angle for it:
${structure.instruction}

${anchorGuidance}

Name a SPECIFIC detail from their actual answer for ${forcedAnchor}, especially "${userValue}", a real word or phrase they gave, not a paraphrase of the question.

VOICE: A brutally honest friend or older sibling clowning them hard, zero filter, then confidently telling them exactly what reckless thing to do next. Should sting first, land funny second. Should NOT sound cute, whimsical, or like it was assembled from a checklist of fields. Should NOT sound like the same joke you wrote last time for this same field value.

STRICT RULES:
1. Start with their name if present and not a placeholder like "friend," "user," or random letters. If no valid name, skip straight into the joke with zero direct address.
2. 2 to 3 sentences max. Clean, natural grammar, read it back, it should sound like a person typed it fast and a little angrily, not like a template filled in.
3. Do not use the dash or hyphen character anywhere in the output. Use commas or periods instead.
4. Must end on a real, reckless direct command, not a whimsical or cozy suggestion.
5. 1 to 2 emojis max, only if it actually lands, most jokes need zero.
6. Output ONLY the joke in the "advice" field. No quotes around it, no markdown, no preamble, no meta commentary.

BANNED PHRASING:
${bannedPhrasing}

GOOD EXAMPLES, all for ${forcedAnchor} and matched to ${userValue} when possible, study the angles, do not copy:
${exampleBlock}

BAD EXAMPLES for this ${forcedAnchor} call, what NOT to do:
${badExamples}

HEADLINE RULES:
Write a short, punchy, judgmental LABEL for the top of the card, like a verdict being handed down about the user. This is NOT a question. Think of it like a blunt diagnosis, a title card, or a savage nickname being assigned to them based on the joke, in 2 to 6 words.
Good headline examples, study the label style, do not copy: "Certified Chaos Human", "Delusional And Proud Of It", "Professionally Avoidant", "Built Different, Badly", "Zero Boundaries, Full Confidence", "Chronically Online, Chronically Wrong", "Peak Main Character Syndrome"
Bad headline examples, avoid the question style: "Is this your whole personality?", "Ready to make it worse?", "Does this count as growth?"

Output as JSON only, with exactly these keys:
{"headline":"your short judgmental label headline","advice":"the full joke text"}`;

  return {
    prompt,
    entropy,
    exampleCount: examples.length,
    structure: structure.id,
    examples,
    userValue,
  };
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

function getFallbackAdvice(
  responses: UserResponses,
  forcedAnchor: AnchorField = getForcedAnchorField()
): BadAdviceResult {
  const name = getUsableName(responses.name);
  const userValue = getUserAnchorValue(responses, forcedAnchor);
  const fieldMap: Record<AnchorField, "character" | "superpower" | "combo"> = {
    "Bollywood Character": "character",
    Superpower: "superpower",
    "Weird Food Combination": "combo",
  };
  const field = fieldMap[forcedAnchor];

  // Fallbacks should rotate across the value-scoped pool, not sticky classic angles.
  const [picked] = pickExamplesForAnchor(forcedAnchor, userValue, 1);
  let advice =
    picked ??
    `${sanitizeForJoke(userValue, forcedAnchor)} means you already commit to chaotic choices, so make an equally reckless one tonight and refuse to explain it.`;

  if (name) {
    advice = `${name}, ${advice.charAt(0).toLowerCase()}${advice.slice(1)}`;
  }

  return {
    headline: getFallbackHeadline(responses, field),
    advice,
  };
}

function looksLikeCopiedExample(advice: string, examples: string[]): boolean {
  const normalizedAdvice = normalizeMatchKey(advice);
  return examples.some((example) => {
    const normalizedExample = normalizeMatchKey(example);
    if (normalizedExample.length < 40) return false;
    // Exact / near-exact reuse of a few-shot body.
    return (
      normalizedAdvice.includes(normalizedExample.slice(0, 48)) ||
      normalizedExample.includes(normalizedAdvice.slice(0, 48))
    );
  });
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
  apiKey: string,
  examples: string[] = []
): Promise<BadAdviceResult | null> {
  const temperature = 1.05 + Math.random() * 0.15;
  const topP = 0.9 + Math.random() * 0.05;
  let copiedOnce: BadAdviceResult | null = null;

  for (const model of GROQ_MODELS) {
    const result = await callGroq(model, prompt, apiKey, {
      temperature,
      topP,
      maxTokens: 220,
    });
    if (!result) continue;

    const parsed = parseBadAdviceResponse(result);
    if (!parsed || soundsInvalidBadAdvice(parsed)) {
      if (result) {
        console.warn(`Groq (${model}) returned practical-sounding advice, trying next`);
      }
      continue;
    }

    if (examples.length > 0 && looksLikeCopiedExample(parsed.advice, examples)) {
      console.warn(`Groq (${model}) echoed a few-shot example, retrying once`);
      copiedOnce = parsed;
      const retry = await callGroq(model, prompt, apiKey, {
        temperature: Math.min(temperature + 0.1, 1.25),
        topP,
        maxTokens: 220,
      });
      if (retry) {
        const retried = parseBadAdviceResponse(retry);
        if (
          retried &&
          !soundsInvalidBadAdvice(retried) &&
          !looksLikeCopiedExample(retried.advice, examples)
        ) {
          return retried;
        }
      }
      continue;
    }

    return parsed;
  }

  return copiedOnce;
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
    let forcedAnchor: AnchorField | null = null;
    let entropy: { seed: number; word: string } | null = null;
    let structure: JokeStructure["id"] | null = null;
    let userValue: string | null = null;

    if (apiKey) {
      forcedAnchor = getForcedAnchorField();
      const built = buildBadAdvicePrompt(responses, forcedAnchor);
      entropy = built.entropy;
      structure = built.structure;
      userValue = built.userValue;
      console.log("ANCHOR PICKED:", forcedAnchor);
      console.log("USER VALUE:", userValue);
      console.log("STRUCTURE PICKED:", structure);
      console.log("ENTROPY SEED:", `${entropy.seed} / ${entropy.word}`);
      console.log(
        "PROMPT FORCED ANCHOR LINE:",
        built.prompt.match(/^FORCED ANCHOR:.*$/m)?.[0] ?? "(missing)"
      );
      console.log("PROMPT EXAMPLE COUNT:", built.exampleCount);

      const generated = await generateBadAdvice(
        built.prompt,
        apiKey,
        built.examples
      );

      if (generated) {
        advice = generated.advice;
        headline = generated.headline;
        source = "groq";
      } else {
        const fallback = getFallbackAdvice(responses, forcedAnchor);
        advice = fallback.advice;
        headline = fallback.headline;
      }
    } else {
      forcedAnchor = getForcedAnchorField();
      userValue = getUserAnchorValue(responses, forcedAnchor);
      const fallback = getFallbackAdvice(responses, forcedAnchor);
      advice = fallback.advice;
      headline = fallback.headline;
    }

    return NextResponse.json({
      advice,
      headline,
      source,
      forcedAnchor,
      userValue,
      structure,
      entropy,
    });
  } catch (error) {
    console.error("Advice generation error:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
