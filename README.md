# Bad Advice

A GradRight parody quiz: answer a few cheeky questions, get deliberately terrible AI advice, then flip to real encouraging advice and online program picks.

Built with Next.js and Groq.

## What it does

1. **Quiz** — name, career stage, Bollywood character, superpower, weird food combo, learning interest  
2. **Bad advice** — brutal, absurd joke advice from Groq (one forced quiz anchor per call for variety)  
3. **Good advice** — sincere career encouragement plus matching online programs from CSV data  
4. **CTA** — paths users toward GradRight signup

The joke screen is entertainment-only (see the in-app disclaimer). GradRight does not give counterproductive advice to real customers.

## Stack

- **Next.js 16** (App Router) + React 19 + TypeScript  
- **Tailwind CSS 4**  
- **Groq** (`llama-3.3-70b-versatile` / `llama-3.1-8b-instant`) for advice generation  
- Program recommendations from `src/data/online_programs.csv`

## Setup

```bash
npm install
```

Create `.env.local` in the project root:

```bash
GROQ_API_KEY=your_groq_api_key
```

Without a key, the app still runs but uses local fallback joke / good-advice text.

## Develop

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

```bash
npm run build
npm start
```

## Project layout

| Path | Purpose |
|------|---------|
| `src/components/` | Quiz UI, bad/good advice screens, loading states |
| `src/app/api/advice/` | Bad advice generation (Groq + variety / anchor logic) |
| `src/app/api/good-advice/` | Real advice generation |
| `src/app/api/recommendations/` | Programs matched to learning interest |
| `src/data/questionnaire.ts` | Questions and options |
| `src/data/online_programs.csv` | Program catalog |
| `src/lib/groq.ts` | Groq client |

## Notes

- Advice API routes are dynamic (`force-dynamic`) so per-request randomness is not cached.  
- Bad advice pins one weird quiz field (Bollywood / superpower / food) per generation and value-scopes few-shot examples for variety.
