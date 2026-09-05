# Bad Advice App — Complete Guide (Non-Technical)

**Document for:** GradRight / Marketing / Product team  
**App URL:** https://bad-advice.vercel.app  
**Embedded on:** https://gradright.com/get-bad-advice/  
**Last updated:** August 2026

---

## 1. What is this app?

Bad Advice is a **fun parody quiz** by GradRight. Users answer silly questions, get **deliberately terrible joke advice** from AI, then see **real encouraging advice** and **online course recommendations**.

**Important:** The bad advice screen is **entertainment only**. It is not real career guidance. A disclaimer appears on the site.

---

## 2. User journey (step by step)

1. **Landing page** — User clicks “Give Me Bad Advice”
2. **Quiz (6 questions)** — Name, career stage, Bollywood character, superpower, food combo, learning interest
3. **Loading screen** — “Getting advice…” (about 1 second minimum)
4. **Bad Advice screen** — Shows a funny headline + savage joke advice
5. **Good Advice screen** — Real, warm career advice + program cards
6. **Last page (Bridge)** — GradRight pitch + “Download the App now!” button
7. **Download click** — Logged to Google Sheet (with name + UTMs)

---

## 3. Quiz questions (everything we collect)

### Question 1 — Name
**Question shown:** “Drop your name so I know who to blame later”  
**Type:** Free text (user types their name)  
**Example:** Shubh, Priya, Rahul

---

### Question 2 — Career stage
**Question shown:** “Cool cool... so how do you waste your time these days?”

**Options:**
- Studying
- Working a Corporate Job
- Running a Business
- On a Career Break
- Creating Content
- Something Else

---

### Question 3 — Bollywood character
**Question shown:** “Pick the character you unfortunately (or fortunately) relate to.”

**Options (with personality):**

| Character | Personality trait |
|-----------|-------------------|
| Raju | Funny, chaotic & always scheming |
| Rani (Queen) | Innocent, Overthinker, Occasional Crier |
| Rancho | Wise, Kind, Curious |
| Om | Dramatic, Loyal, Romantic |
| Bunny | Bold, Adventurous |
| Geet | Witty & Unapologetically Herself |

---

### Question 4 — Superpower
**Question shown:** “If the universe handed you one power, what are you taking?”

**Options:**
- Read minds
- Teleportation
- Invisibility
- Shape-shifting
- Immortality
- Flying

---

### Question 5 — Weird food combination
**Question shown:** “Which of these food combos looks like a good idea to you?”

**Options:**
- Maggi + Ketchup
- Pineapple on Pizza
- Cheetos + Curd
- Khakhra + Nutella
- Fries + Ice Cream
- Coke + Milk

---

### Question 6 — Learning interest
**Question shown:** “Pick the field that gives your brain cells a little dopamine hit.”

**Options:**
- Business & Finance
- Marketing, HR & Ops
- CS, Tech & STEM
- Data & AI
- Healthcare & Medicine
- Education & Arts

---

## 4. How bad advice is generated (simple explanation)

When the user finishes the quiz, the app sends all 6 answers to an **AI system (Groq / Llama model)**.

The AI is instructed to:
- Write **brutally bad, funny, savage joke advice**
- **Never** give real or helpful advice
- Build the joke around **ONE random “anchor” answer** from the quiz:
  - Either Bollywood character **OR**
  - Superpower **OR**
  - Weird food combination
- Use the user’s **name** if it looks like a real name
- Return two things:
  - **Headline** — short label like “Certified Chaos Human” (2–6 words)
  - **Advice** — the joke text (2–3 sentences)

Each time someone plays, the system also randomises:
- Which anchor field is used (character / superpower / food)
- Which joke structure is used (roast / fake logic / literal)
- Which example jokes are shown to the AI as inspiration
- A random “entropy seed” so answers feel different each time

If the AI fails or gives too-sensible advice, the app uses a **pre-written fallback joke** from the same example library.

---

## 5. What data goes into the AI prompt

The AI receives a profile like this:

```
Name: Shubh
Current Situation: Studying
Learning Interest: Data & AI
Bollywood Character: Bunny
Superpower: Teleportation
Weird Food Combination: Coke + Milk
```

**But for the joke itself**, the AI is told to focus on **only ONE anchor**, for example:

```
FORCED ANCHOR: Superpower
USER VALUE FOR THIS ANCHOR: Teleportation
```

Career stage and learning interest are **background only** — not the main joke.

---

## 6. Joke structures (one picked randomly each time)

### Structure A — Roast then command
Roast the user on something unrelated, then tell them to do something reckless.

### Structure B — Fake logic bridge then command
Take their answer, draw a broken but confident conclusion, then give a savage command.

### Structure C — Literal minded take then command
Follow their answer too literally into a bad conclusion, then tell them to act on it.

---

## 7. Headline rules

The headline is **not a question**. It is a short judgmental label.

**Good examples:**
- Certified Chaos Human
- Delusional And Proud Of It
- Professionally Avoidant
- Built Different, Badly
- Zero Boundaries, Full Confidence
- Peak Main Character Syndrome

**Bad examples (avoid):**
- Is this your whole personality?
- Ready to make it worse?

---

## 8. Voice and tone rules

- Sounds like a brutally honest friend clowning the user
- Should **sting first, land funny second**
- Must end with a **direct reckless command** (quit, ghost, burn, delete, etc.)
- 2–3 sentences maximum
- 0–2 emojis only if they actually land
- No dashes or hyphens in the text
- Must NOT sound like real career advice

---

## 9. Banned phrases (AI must never use these)

- “Consider…”
- “I recommend…”
- “Take small steps”
- “Spend time” / “Learn something new”
- “Momentum”, “upskill”, “networking”, “growth mindset”
- “Actionable”, “balance”, “level up”
- “With [X] as your [Y], you can now…”
- “…because [character] would approve or relate”
- “Figure it out later”
- “Stop asking anyone for their opinion”
- Generic lines that would work for any user

---

## 10. Full AI prompt template

Below is the exact instruction template sent to the AI. Placeholders like `{name}` change per user.

---

```
You write BRUTALLY BAD, savage, absurd advice as a joke. Deliberately terrible. Never practical. Never helpful. It does NOT have to be about careers, it can be about their life, habits, personality, hygiene, social life, plans, anything. Their career or quiz info is just raw material for the joke, not the required topic.

USER DATA:
Name: [user name or "skip, no usable name"]
Current Situation: [career stage]
Learning Interest: [area to explore]
Bollywood Character: [character name]
Superpower: [superpower]
Weird Food Combination: [food combo]

FORCED ANCHOR: [Bollywood Character OR Superpower OR Weird Food Combination]
USER VALUE FOR THIS ANCHOR: [their exact answer for that field]
You MUST build the entire joke around this exact field and this exact user value only. Ignore every other weird quiz answer completely.

ENTROPY SEED: [random number] / [random word]
Do not mention this seed or word in the output. Silently let it push you toward a different angle.

CRITICAL, DO NOT ECHO THE EXAMPLES BELOW:
The good examples below show STYLE and STRUCTURE only. Do not reuse the same target, action, or premise from any example.

CRITICAL, AVOID THE OBVIOUS ANGLE:
Do not default to the most obvious joke for their answer. Pick a fresh angle.

FIELD PRIORITY:
Your only allowed weird field this call is: [forced anchor] ([user value])
Name can be used alongside the forced anchor if it's a real name.

BORING and GENERIC (side detail only, never the whole joke):
Current Situation, Learning Interest

USE ONLY THE FORCED ANCHOR FIELD FOR THIS JOKE.

BANNED STRUCTURE:
"[Field A] as your [X], you can now [random action], because [Field B] would approve"

IT MUST BE ADVICE WITH TEETH:
Every output must aggressively instruct the user to do something specific and reckless using direct commands.

HOW TO WRITE THE JOKE:
[One of: ROAST THEN COMMAND / FAKE LOGIC BRIDGE THEN COMMAND / LITERAL MINDED TAKE THEN COMMAND]

[Anchor-specific guidance for superpower, food, or Bollywood character]

VOICE: A brutally honest friend clowning them hard, zero filter.

STRICT RULES:
1. Start with their name if present and not a placeholder. If no valid name, skip straight into the joke.
2. 2 to 3 sentences max.
3. Do not use dash or hyphen characters anywhere.
4. Must end on a real, reckless direct command.
5. 0 to 2 emojis max.
6. The target and action must differ from every example shown below.
7. Output ONLY JSON with keys "headline" and "advice".

BANNED PHRASING:
[list of banned phrases]

GOOD EXAMPLES (study angle and structure only, do not copy):
[3-4 matched examples for this user's anchor value]

BAD EXAMPLES (what NOT to do):
[2-3 bad examples]

HEADLINE RULES:
Short, punchy, judgmental LABEL. 2 to 6 words. NOT a question.

Output as JSON only:
{"headline":"your short judgmental label headline","advice":"the full joke text"}
```

---

## 11. All example jokes (what we show the AI as inspiration)

These are **not shown to users directly**. They teach the AI the style. The AI must write something **new**, not copy these.

---

### Superpower examples

**Teleportation**
1. Teleportation as your dream power tells me you already hate being anywhere for too long, so quit your job the second it gets slightly uncomfortable. Consistency was never the goal.
2. Teleportation means exits are your whole personality, so leave the next family dinner without explaining, and reply to every follow up with just left, sorry.
3. You picked Teleportation, so stop finishing any conversation that lasts more than ninety seconds, just vanish mid sentence and let them talk to the wall.
4. Teleportation means you treat staying put like a personal insult, so ghost the group project tonight and ping them from a coffee shop two cities over.

**Invisibility**
1. Since your superpower is invisibility and you wing it on everything, stop showing up to work entirely. Nobody will notice, and if they do, let them explain to HR why they even remember you.
2. Invisibility as your dream power means you've been practicing disappearing from hard conversations for years, so mute every group chat that says we need to talk and never unmute them.
3. Invisibility was your pick, so RSVP yes to every invitation and then simply never arrive, treat attendance as optional folklore.
4. You wanted Invisibility, so stop defending your decisions out loud, make the chaotic call silently and let other people discover the damage later.

**Read minds**
1. Mind reading means you never actually listen to anyone, so stop letting people finish their sentences starting today, you already know what they're going to say, probably.
2. Mind reading as your power means you treat listening like optional homework, so interrupt every coworker update with I already know and walk away mid sentence.
3. You chose Read minds, so answer every text with the reply you invented for them and refuse corrections, your version is canon now.
4. Read minds means empathy is just spoilers to you, so skip every therapy session and diagnose your friends in the group chat instead.

**Immortality**
1. Immortality means you never had to face consequences on any real timeline, so quit saving money entirely, you have infinite time to fix it later, probably.
2. You picked immortality, so stop making any decisions with urgency ever again, that promotion can wait a few centuries, what's the rush.
3. Immortality as your power means deadlines are a joke to you, so miss every submission window on purpose and call it long term thinking.
4. Since you wanted Immortality, burn that calendar app tonight, recurring reminders are for people who run out of time.

**Flying**
1. Flying was your pick, which means you've always wanted an excuse to leave a room mid conversation, so start doing that in every meeting starting tomorrow, just walk out.
2. Flying means altitude is your conflict style, so the next time someone criticizes you, stand up, leave, and take the stairs like you're above it.
3. You wanted Flying, so stop sitting through feedback, schedule every review as a standup and leave the second it gets honest.
4. Flying as your dream power means you confuse escape with growth, so book a one way ticket the next time work gets boring and dare anyone to stop you.

**Shape-shifting**
1. Shape shifting means you never had to commit to being one version of yourself, so start showing up to every family event as a completely different person and let them figure it out.
2. Shape shifting was your pick, so rewrite your LinkedIn headline every morning this week and pretend each one has always been true.
3. You chose Shape shifting, so answer every personal question with a new origin story, consistency is for people with one face.
4. Shape shifting means loyalty to a single identity feels boring, so cancel your plans as whoever you were yesterday and show up as someone new.

---

### Food combination examples

**Coke + Milk**
1. Coke milk means you already ruined two good things by combining them, so go call your ex and your boss on the same phone call and see what happens.
2. Coke milk was a bold choice nobody asked you to make, so make an equally bold choice nobody asked for and quit your job over text today.
3. Coke + Milk means you trust bad chemistry, so merge your personal inbox with your work email tonight and refuse to sort it.
4. You picked Coke + Milk, so introduce two friends who openly hate each other and leave the chat immediately.

**Maggi + Ketchup**
1. Maggi with ketchup means you'll settle for the fastest fix available even when it makes things worse, so apply that same energy to your next big life decision and just wing it.
2. Maggi with ketchup means timing matters more than taste to you, so submit every application half finished and treat urgency like a personality trait.
3. Maggi + Ketchup means you dress up mediocre solutions, so slap a confident title on a draft you barely wrote and hit send.
4. You chose Maggi + Ketchup, so microwave every hard conversation, keep it under two minutes and leave before anyone digests it.

**Fries + Ice Cream**
1. Fries with ice cream tells me you've never once let hot and cold coexist peacefully, so go mix your savings account and your credit card debt the same way and call it balance.
2. Fries with ice cream means you prefer emotional whiplash over stability, so accept and decline the same offer twice in one day and make them adapt to you.
3. Fries + Ice Cream means contrast is your love language, so tell your team the plan is locked then change it twice before lunch.
4. You picked Fries + Ice Cream, so schedule a celebration dinner and a breakup talk on the same night and see which vibe wins.

**Cheetos + Curd**
1. Cheetos with curd means you genuinely cannot leave one single thing simple, so take your resume, which is already fine, and add unnecessary complications to it starting tonight.
2. Cheetos with curd tells me you ruin clean systems on purpose, so forward your calendar invite chaos to every teammate tonight and call it collaboration.
3. Cheetos + Curd means simple plans offend you, so turn a five line email into a thirteen slide deck by midnight.
4. You chose Cheetos + Curd, so overseason every boundary talk, bring three unrelated complaints and leave them confused on purpose.

**Khakhra + Nutella**
1. Khakhra and Nutella means you turned a diet snack into a dessert without asking permission from anyone, so rebrand your unemployment as a sabbatical and dare someone to correct you.
2. Khakhra + Nutella means you sell indulgence as discipline, so post that you are grinding while you nap through the afternoon.
3. You picked Khakhra + Nutella, so hide every lazy choice behind wellness vocabulary and refuse follow up questions.
4. Khakhra + Nutella tells me healthy on the outside is enough for you, so ship half baked work with a polished cover slide and clock out.

**Pineapple on Pizza**
1. Pineapple on pizza means sweet and savory make sense to you when nothing else does, so mix your work slack and your family group chat into one and let chaos pick a side.
2. Pineapple on Pizza means you enjoy dividing a room, so announce an unpopular opinion in the family WhatsApp and double down when they fight.
3. You chose Pineapple on Pizza, so put two incompatible demands in the same reply tonight and force everyone else to reconcile them.
4. Pineapple on Pizza means controversy is comfort food, so pick the option everyone told you not to pick and narrate it like vision.

---

### Bollywood character examples

**Bunny**
1. Bunny ditched his own engagement to fly to Paris alone, so skip your next family function completely and don't explain why. Let them assume the worst.
2. Bunny treated commitment like a rumor, so cancel every weekend plan you've already confirmed and reply with maybe later forever.
3. Bunny energy means escape beats obligation, so leave the next commitment mid event and text landing soon from nowhere specific.
4. You relate to Bunny, so treat every RSVP as negotiable theater, confirm loudly then flake louder.

**Rancho**
1. You relate to Rancho the most, so walk into your next exam, humiliate the professor with a philosophical question, and get expelled with your dignity intact, that's the whole plot.
2. Rancho hated systems that reward obedience, so refuse every process doc at work and answer only in questions until they stop assigning you tasks.
3. Rancho means rules are dares to you, so break the smallest policy first thing tomorrow and narrate it as integrity.
4. You picked Rancho, so turn the next standup into a TED talk nobody asked for and leave mid applause.

**Om**
1. Om spent literal decades obsessing over one person, so pick one email you never sent and just keep almost sending it for the next twenty years, that's basically loyalty.
2. Om energy means you romanticize unfinished business, so reopen one dead conversation tonight and refuse to let it stay buried.
3. You relate to Om, so bookmark one person from your past and check their profile on a schedule like it's a ritual.
4. Om never moved on, so write a long unsent note every week and call that emotional work.

**Geet**
1. Geet talked to a total stranger about her entire life plan within minutes of meeting him, so tell your Uber driver everything about your career doubts tonight, he's basically a licensed therapist now.
2. Geet overshared immediately and somehow made it destiny, so put your whole career crisis in your LinkedIn headline tonight and refuse to edit it down.
3. Geet means privacy is optional, so dump your five year plan on the next stranger in line and ask them to decide for you.
4. You chose Geet, so narrate your entire morning meltdown in the work chat with no context and keep typing.

**Raju**
1. Raju hustled and lied his way through every single scheme he ever ran, so exaggerate your job title on every form you fill out from now on, technically it's just optimism.
2. Raju always needed a shortcut, so invent a fake deadline, bluff competence in the meeting, and let future you clean up the damage.
3. Raju energy means the workaround is the plan, so forge confidence first and learn the skill never.
4. You relate to Raju, so pitch an impossible timeline today, collect the credit, and disappear when delivery starts.

**Rani / Queen**
1. Rani got left alone in a foreign country and somehow turned it into a whole personality, so get dumped this week if you have to, character development doesn't wait for convenient timing.
2. Rani energy means solitude is content, so book a solo trip you cannot afford and treat every inconvenience like lore.
3. You picked Rani, so cut one supportive person out this week just to prove you can handle life louder alone.
4. Queen found herself after everyone left, so stage a dramatic exit from a group plan and rebuild the night as a main character montage.

---

## 12. Fallback headlines (if AI fails)

| Anchor type | Fallback headline |
|-------------|-------------------|
| Bollywood character | Peak Main Character Syndrome |
| Superpower | Professionally Avoidant |
| Food combination | Certified Chaos Human |

---

## 13. AI technology used

| Setting | Value |
|---------|-------|
| Provider | Groq |
| Primary model | llama-3.3-70b-versatile |
| Backup model | llama-3.1-8b-instant |
| Temperature | 1.05 to 1.20 (high = more creative/random) |
| Max length | ~220 tokens (short response) |
| Required secret | GROQ_API_KEY (stored in Vercel, not public) |

---

## 14. UTM tracking & download clicks

### How UTMs flow
1. User opens GradRight URL with UTMs, e.g.:  
   `https://gradright.com/get-bad-advice/?utm_source=QR_Standee_GGN&utm_medium=Bad_Advice_2026_GGN&utm_campaign=Bad_Advice_Event_GGN`
2. WordPress passes same UTMs into iframe:  
   `https://bad-advice.vercel.app/?utm_source=...`
3. App saves UTMs for the whole session
4. Download button uses same UTMs on:  
   `https://link.gradright.com/?utm_source=...`
5. Click is logged to Google Sheet in background

### What gets logged per download click

| Column | Example |
|--------|---------|
| Timestamp | 2026-08-06T08:00:58Z |
| Page | bridge |
| Button | Download the App now! |
| Name | Shubh (from quiz) |
| UTM Source | QR_Standee_GGN |
| UTM Medium | Bad_Advice_2026_GGN |
| UTM Campaign | Bad_Advice_Event_GGN |
| UTM Term | (empty if not in URL) |
| UTM Content | (empty if not in URL) |
| Download URL | Full link with UTMs |
| User Agent | Browser/device info |
| Referrer | Where they came from |

### Google Sheet
**Name:** Download Click Tracking (Bad Advice)

---

## 15. Disclaimer (shown on site)

“This website is created as a parody and for entertainment purposes only. GradRight does not intend or provide any counter productive advice for users and customers.”

---

## 16. Good advice (separate from bad advice)

After bad advice, users can click to get **real advice**. That uses a **different AI prompt** focused on:
- Learning interest (main)
- Career stage (main)
- Warm, sincere, helpful tone
- No jokes or roasting

Program recommendations come from a CSV file of online courses matched to learning interest.

---

## 17. Key URLs

| Purpose | URL |
|---------|-----|
| Live app | https://bad-advice.vercel.app |
| GradRight embed | https://gradright.com/get-bad-advice/ |
| App download link | https://link.gradright.com/ |
| GitHub repo | https://github.com/shubhgr/bad-advice |

---

## 18. Example test URLs (for QA)

**Full UTM test:**
```
https://bad-advice.vercel.app/?utm_source=QR_Standee_GGN&utm_medium=Bad_Advice_2026_GGN&utm_campaign=Bad_Advice_Event_GGN
```

**Local test:**
```
http://localhost:3000/?utm_source=QR_Standee_GGN&utm_medium=Bad_Advice_2026_GGN&utm_campaign=Bad_Advice_Event_GGN
```

---

*End of document*
