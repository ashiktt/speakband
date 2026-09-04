# SpeakBand — Your AI IELTS Speaking Coach 🎓🎙️

SpeakBand is an AI-powered IELTS Speaking examination and coaching platform designed to simulate the official IELTS Speaking test under authentic exam conditions, assess candidates according to the four official published IELTS assessment criteria, and provide data-driven personalized coaching drills.

---

## 🏛️ System Architecture

```
                    SPEAKBAND
                       │
                       ▼
              IELTS TEST ENGINE
          (Deterministic Client State Machine)
                       │
        ┌──────────────┼──────────────┐
        ▼              ▼              ▼
      Part 1         Part 2         Part 3
  (Familiar 4-5m)  (Cue Card 3-4m)  (Analytical 4-5m)
        │              │              │
        └──────────────┼──────────────┘
                       ▼
                 AUDIO RECORDING
          (Web Audio API + MediaRecorder)
                       │
              ┌────────┴────────┐
              ▼                 ▼
         TRANSCRIPTION      AUDIO ANALYSIS
       (Web Speech STT)    (Gemini Multimodal)
              │                 │
              └────────┬────────┘
                       ▼
                  AI EVALUATOR
              (Google Gemini 3.6 Flash)
                       │
        ┌──────────────┼──────────────┐
        ▼              ▼              ▼
     Fluency        Lexical        Grammar
  & Coherence      Resource      & Accuracy
                       │
                       ▼
                 Pronunciation
          (Acoustic Audio Analysis)
                       │
                       ▼
            AI ESTIMATED IELTS BAND
           (Official IELTS Rounding)
                       │
        ┌──────────────┼──────────────┐
        ▼              ▼              ▼
      Results       Coaching       Progress
     Dashboard     Drill Engine    Tracking
```

---

## ✨ Key Features & IELTS Fidelity

### 1. Deterministic Examination Engine (Non-Negotiable)
- The AI **never** controls state, time, or part progression.
- Test states are controlled by a deterministic client-side finite state machine:
  `IDLE` → `INTRODUCTION` → `PART_1` → `PART_2_INSTRUCTIONS` → `PART_2_PREPARATION` → `PART_2_LONG_TURN` → `PART_2_CLOSING` → `PART_3` → `TEST_COMPLETE` → `EVALUATION` → `RESULTS` → `COACHING`
- Timers run in application code using high-precision epoch timestamps (`Date.now()`) to prevent timer drift and survive UI re-renders.
- Total examination duration: 11–14 minutes.

### 2. Controlled Question Bank & Authentic Topics
- **Part 1 (4–5 mins):** Short, natural questions across familiar topics (Studies, Work, Hometown, Home, Free Time, Technology, Food, Travel, Weather, Music). Prevents repetition and nonsensical jumps.
- **Part 2 (3–4 mins):** Authentic Task Card (Cue Card) with 3–4 bullet prompts. Includes an **exact 60-second preparation countdown** with digital scratchpad note-taking, followed by an uninterrupted **120-second (2-minute) speaking timer** and 1–2 short rounding-off questions.
- **Part 3 (4–5 mins):** Thematically connected to the Part 2 topic, advancing into analytical and abstract societal discussion (reasons, causes & effects, cultural comparisons, future predictions).

### 3. Examiner Demeanor vs Practice Mode
- **Test Mode:** The AI acts strictly as an IELTS Examiner. It remains formal, neutral, and asks the next question. It never says *"Good job"*, *"Great answer"*, or corrects grammar during the test.
- **Practice Mode:** Completely isolated from Test Mode. The AI acts as a friendly, supportive IELTS tutor providing instant pedagogical feedback, grammatical corrections, and Band 8.5+ model answers.

### 4. Acoustic Audio Analysis & 4 Criteria Assessment
- Evaluates using the four official IELTS Speaking assessment criteria (0.0 to 9.0 in 0.5 increments):
  1. **Fluency and Coherence**
  2. **Lexical Resource**
  3. **Grammatical Range and Accuracy**
  4. **Pronunciation** (evaluated directly from recorded audio waveforms; if audio is degraded, explicitly indicates quality rather than fabricating issues).
- **Official IELTS Band Calculation:** Mean of the 4 scores, rounded to the nearest half or whole band according to official British Council / Cambridge conventions (e.g. .25 rounds up to .5, .75 rounds up to next whole band).
- **No Fabricated Errors:** Only mistakes that the candidate actually spoke are highlighted (`"I am study"` → `"I am studying"`).

### 5. Personalized Practice & Progress Tracking
- Automatically identifies the student's weakest criterion after every test and generates customized drills:
  - *Fluency Weakest:* **2-Minute Fluency Challenge**
  - *Vocabulary Weakest:* **Topic Vocabulary & Collocation Challenge**
  - *Grammar Weakest:* **Complex Sentence Speaking Practice**
  - *Pronunciation Weakest:* **Pronunciation & Stress Practice**
  - *Part 2 Weakest:* **IELTS Cue Card Long-Turn Practice**
- Dual-tier persistence with **Supabase PostgreSQL** cloud sync and resilient **LocalStorage** fallback for guest candidates and offline use.

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ (tested on Node v22.13.1)
- Google Gemini API Key
- Supabase Project (configured in `supabase_ielts_schema.sql`)

### Environment Variables
Configure `.env.local`:
```bash
# Google Gemini API Key
GEMINI_API_KEY=your_gemini_api_key

# Supabase Cloud Database Configuration
NEXT_PUBLIC_SUPABASE_URL=https://lrszgoijicnweqwbsspr.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_publishable_key
SUPABASE_URL=https://lrszgoijicnweqwbsspr.supabase.co
SUPABASE_ANON_KEY=your_publishable_key
```

### Database Schema Setup
Execute `supabase_ielts_schema.sql` in your Supabase SQL Editor:
- Creates `profiles`, `ielts_tests`, `ielts_transcripts`, `ielts_practice_sessions`
- Configures Row Level Security (RLS) policies for complete user data isolation.

### Running Locally
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Or build and start production server
npm run build
npm run start
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## ⚖️ Official IELTS Disclaimer

> **Official Disclaimer:**
> SpeakBand is an independent IELTS Speaking practice and AI assessment tool. It is not affiliated with, endorsed by, or officially connected to the British Council, IDP: IELTS Australia, or Cambridge University Press & Assessment. Band scores shown by SpeakBand are AI-generated estimates based on the published IELTS Speaking assessment criteria and do not constitute official IELTS results.
