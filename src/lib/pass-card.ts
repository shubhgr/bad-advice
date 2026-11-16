/**
 * Six content placeholders from the brief.
 * Swap these when quiz → result mapping is ready.
 *
 * 1. personalityTitle  → display headline
 * 2. personalityRead   → glass pill
 * 3. strength          → glass pill
 * 4. blindSpot         → glass pill
 * 5. mission           → details MISSION
 * 6. match             → details MATCH
 *
 * `betterMove` → 4th glass pill
 * `name` → details NAME
 * `memberNo` → top-right Doto number
 */

export type PassTraitIcon = "lightning" | "search" | "tabs" | "rocket";

export type PassMascotGender = "female" | "male";

/** Kept for config continuity (coupon lives off-card for now). */
export const PASS_UNLOCK_TRIGGER: "download" | "print" | "either" = "download";

export const PASS_COUPON_CODE = "BAD15GR";

export interface PassCardContent {
  personalityTitle: string;
  personalityRead: string;
  strength: string;
  blindSpot: string;
  mission: string;
  match: string;
  betterMove: string;
  name: string;
  memberNo: string;
  tagline: string;
}

/** Real report-card example (Aarav) — used to stress-test layout & fit-text. */
export const PLACEHOLDER_PASS: PassCardContent = {
  personalityTitle: "Certified Overthinker",
  personalityRead: "Maggi chaos",
  strength: "Spirals first",
  blindSpot: "Starts later",
  mission: "Learn beside the job",
  match: "Online programs",
  betterMove: "Fit around job",
  name: "Aarav",
  memberNo: "4827",
  tagline: "Your GradRight personality",
};

/**
 * break-ui worst case — plausible production extremes, same shape as demo.
 * Limits: none found in schema/API (all unbounded). Mission brief once said ≤28 chars;
 * pills once said ≤15 — neither is enforced.
 */
export const WORST_CASE_PASS: PassCardContent = {
  personalityTitle: "Career Crisis LinkedIn Headliner",
  personalityRead: "enterprise-onboarding-feedback",
  strength: "Benachrichtigungen",
  blindSpot: "Spirals forever first",
  mission: "Upskill online with zero free time left",
  match: "Job-fit programs abroad",
  betterMove: "Shortlist twelve options",
  name: "Aleksandra Wiśniewska-Kowalczyk",
  memberNo: "9001284",
  tagline: "Paramètres de confidentialité et personnalité",
};

/** Empty / missing optional-looking fields (still required by the type). */
export const EMPTY_CASE_PASS: PassCardContent = {
  personalityTitle: "Untitled",
  personalityRead: "",
  strength: "",
  blindSpot: "",
  mission: "",
  match: "",
  betterMove: "",
  name: "",
  memberNo: "0",
  tagline: "",
};

/** Shortest realistic person + labels. */
export const SHORT_CASE_PASS: PassCardContent = {
  personalityTitle: "Jo",
  personalityRead: "Jo",
  strength: "J",
  blindSpot: "J",
  mission: "Go",
  match: "AI",
  betterMove: "Ok",
  name: "Jo",
  memberNo: "7",
  tagline: "Pass",
};

export type PassDataMode = "demo" | "worst" | "empty" | "short";

export function passContentForMode(mode: PassDataMode): PassCardContent {
  switch (mode) {
    case "worst":
      return WORST_CASE_PASS;
    case "empty":
      return EMPTY_CASE_PASS;
    case "short":
      return SHORT_CASE_PASS;
    default:
      return PLACEHOLDER_PASS;
  }
}

/** Four glass pills — strength, blind spot, read, better move. */
export function buildPassTraits(pass: PassCardContent) {
  return [
    { id: "strength", icon: "lightning" as const, label: pass.strength },
    { id: "blind", icon: "search" as const, label: pass.blindSpot },
    { id: "read", icon: "tabs" as const, label: pass.personalityRead },
    { id: "move", icon: "rocket" as const, label: pass.betterMove },
  ];
}

/** Stable ids for the four Pass personality results. */
export type PassPersonalityId =
  | "certified-overthinker"
  | "certified-yapper"
  | "the-never-settler"
  | "the-thorough-planner";

export interface PassPersonality {
  id: PassPersonalityId;
  title: string;
  /** Quiz answer pattern that maps to this result. */
  answerPattern: string;
  /** Character art for the Pass card mascot. */
  mascotSrc: string;
}

const PERSONALITY_ASSET = "/images/pass/personalities";

/**
 * Personality → character map. Resolve with `getPassPersonality(title)` when
 * wiring quiz results onto the Pass card.
 */
export const PASS_PERSONALITIES: readonly PassPersonality[] = [
  {
    id: "certified-overthinker",
    title: "Certified Overthinker",
    answerPattern: "Too many options / scared of picking wrong",
    mascotSrc: `${PERSONALITY_ASSET}/certified-overthinker.png`,
  },
  {
    id: "certified-yapper",
    title: "Certified Yapper",
    answerPattern: "A talkative, expressive personality selection",
    mascotSrc: `${PERSONALITY_ASSET}/certified-yapper.png`,
  },
  {
    id: "the-never-settler",
    title: "The Never-Settler",
    answerPattern: "Always looking for growth or a new challenge",
    mascotSrc: `${PERSONALITY_ASSET}/the-never-settler.png`,
  },
  {
    id: "the-thorough-planner",
    title: "The Thorough Planner",
    answerPattern: "Doesn't know where to start / wants to plan before acting",
    mascotSrc: `${PERSONALITY_ASSET}/the-thorough-planner.png`,
  },
] as const;

export const PASS_PERSONALITY_BY_ID: Record<
  PassPersonalityId,
  PassPersonality
> = Object.fromEntries(
  PASS_PERSONALITIES.map((p) => [p.id, p]),
) as Record<PassPersonalityId, PassPersonality>;

/** Lookup by Pass headline title (case-insensitive). */
export function getPassPersonality(
  title: string | null | undefined,
): PassPersonality | undefined {
  const key = title?.trim().toLowerCase();
  if (!key) return undefined;
  return PASS_PERSONALITIES.find((p) => p.title.toLowerCase() === key);
}

/** Mascot path for a title, or undefined if unknown. */
export function getPassPersonalityMascot(
  title: string | null | undefined,
): string | undefined {
  return getPassPersonality(title)?.mascotSrc;
}
