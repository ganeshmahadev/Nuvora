# Onboarding Flow — US-B1/B2/B3 Design Spec
Date: 2026-05-31

## Scope
3-step onboarding wizard: personal details → goals + AI calibration → preferences. All 3 steps built in one pass.

## Routing
```
app/onboarding/layout.tsx       shared header + step indicator
app/onboarding/step-1/page.tsx  personal details
app/onboarding/step-2/page.tsx  goals + activity + AI calibration
app/onboarding/step-3/page.tsx  preferences + privacy + final submit
```

## API Routes
- `POST /api/onboarding/step-1` — upserts full_name, weight_kg, height_cm, age, gender to profiles
- `POST /api/onboarding/step-2` — upserts primary_focus, activity_level, calorie_target, protein_target
- `POST /api/onboarding/complete` — upserts pref_* columns, sets onboarding_complete=true, returns redirect to /app

## Step 1 — Personal Details
Layout: 40/60 split (editorial left, form right). Stacks on mobile.
- Left: lavender bg, headline "Let's personalize your precision health.", body copy, "21 Days" + "15%" emerald stats
- Right: RHF + Zod — Full Name, Weight (kg), Height (cm), Age + Gender side-by-side
- Actions: "Skip for now" text link + "Continue →" primary button

## Step 2 — Goals + AI Calibration
Layout: full-width left content + sticky AI sidebar right.
- Left: 2×2 goal card grid (Weight Loss / Muscle Gain / Maintenance / Athletic Performance), activity slider (5 stops)
- Right: AI Calibration card — live Mifflin-St Jeor BMR computation, Estimated Calories, Protein Target, Metabolic Baseline, rationale quote
- Actions: "← Back" + "Continue →"

## Step 3 — Preferences
Layout: split (editorial left, toggles right). Matches step-1 split aesthetic.
- Left: "QUIET INTELLIGENCE" label, "Configure your visual calm." headline, circular image
- Right: 3 toggles (all default on) — Morning Health Gist, Weekly Trend Analysis, Critical Marker Alerts
- Below toggles: Encrypted Data Privacy card
- Footer badges: GDPR Compliant / E2E Encrypted / Local Processing
- Actions: "← Previous" + "Enter your Gist" (sets onboarding_complete=true → /app)

## Shared Files
- `features/onboarding/schemas/onboarding.schema.ts` — Zod for all 3 steps
- `lib/utils/calories.ts` — Mifflin-St Jeor BMR + activity multipliers + goal modifiers
- `features/onboarding/hooks/useStep1.ts`, `useStep2.ts`, `useStep3.ts`

## Data Flow
Option A: each step writes to profiles on Continue. Step-2 calibration reads step-1 biometrics already in DB. Final step flips onboarding_complete.

## Calorie Formula
BMR (male) = 10w + 6.25h − 5a + 5
BMR (female) = 10w + 6.25h − 5a − 161
Activity multipliers: 1.2 / 1.375 / 1.55 / 1.725 / 1.9
Goal modifiers: Weight Loss −500 / Maintenance 0 / Muscle Gain +300 / Athletic Performance +200
Protein: weight_kg × goal_multiplier (1.6 weight loss, 2.2 muscle gain, 1.8 maintenance, 2.4 athletic)
