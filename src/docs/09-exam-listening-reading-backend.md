# IELTS Nexus — Exam Listening & Reading Backend Specification

This document is a **complete, standalone specification** for implementing the Listening and Reading sections of the Full Exam Simulation on the backend. It covers Supabase storage, database schema changes, API endpoints, AI-powered grading, answer keys, and testing.

> [!IMPORTANT]
> The frontend currently uses hardcoded passages and questions. This spec replaces those with real content served from the backend, using audio files stored in Supabase Storage and structured question/answer data stored in the database.

---

## Table of Contents

1. [Supabase Storage Setup](#1-supabase-storage-setup)
2. [Database Schema](#2-database-schema)
3. [Seed Data — Listening](#3-seed-data--listening)
4. [Seed Data — Reading](#4-seed-data--reading)
5. [Answer Keys](#5-answer-keys)
6. [Backend API Endpoints](#6-backend-api-endpoints)
7. [AI-Powered Grading](#7-ai-powered-grading)
8. [Service Architecture](#8-service-architecture)
9. [Testing Instructions](#9-testing-instructions)

---

## 1. Supabase Storage Setup

### 1.1 Listening Audio Bucket

A bucket named `listening-audio` already exists in Supabase Storage with 4 MP3 files:

| File | Maps To | Duration (approx) |
|---|---|---|
| `audio1.mp3` | Section 1 (Q1–Q10) | ~6 min |
| `audio2.mp3` | Section 2 (Q11–Q20) | ~7 min |
| `audio3.mp3` | Section 3 (Q21–Q30) | ~7 min |
| `audio4.mp3` | Section 4 (Q31–Q40) | ~8 min |

### 1.2 Bucket Policies

```sql
-- Allow authenticated users to read listening audio
CREATE POLICY "Authenticated users can read listening audio"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'listening-audio'
  AND auth.role() = 'authenticated'
);
```

### 1.3 Public URL Pattern

```
https://<SUPABASE_PROJECT_REF>.supabase.co/storage/v1/object/public/listening-audio/audio1.mp3
```

> [!NOTE]
> If the bucket is **not** public, use signed URLs via the backend:
> ```typescript
> const { data } = await supabase.storage
>   .from('listening-audio')
>   .createSignedUrl('audio1.mp3', 3600); // 1 hour expiry
> ```

---

## 2. Database Schema

### 2.1 Listening Questions Table

```sql
CREATE TABLE exam_listening_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section_number INTEGER NOT NULL,        -- 1, 2, 3, or 4
  question_number INTEGER NOT NULL,       -- 1–40 (global numbering)
  question_type TEXT NOT NULL,            -- 'mcq' | 'fill_blank' | 'form_completion'
  question_text TEXT NOT NULL,
  options JSONB,                          -- ["A. option", "B. option", "C. option"] or null for fill-in
  correct_answer TEXT NOT NULL,           -- "A" | "B" | "C" or free-text answer
  audio_file TEXT NOT NULL,               -- 'audio1.mp3', 'audio2.mp3', etc.
  instruction_text TEXT,                  -- e.g. "Choose the correct letter (A-C)"
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_listening_q_section ON exam_listening_questions(section_number);
CREATE UNIQUE INDEX idx_listening_q_number ON exam_listening_questions(question_number);
```

### 2.2 Reading Questions Table

```sql
CREATE TABLE exam_reading_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  passage_number INTEGER NOT NULL,        -- 1 or 2 (Passage 1: Electroreception, Passage 2: Time Travel)
  passage_title TEXT NOT NULL,
  passage_text TEXT NOT NULL,              -- full passage content
  question_number INTEGER NOT NULL,       -- 1–26 (global numbering)
  question_type TEXT NOT NULL,            -- 'paragraph_match' | 'short_answer' | 'true_false_ng' | 'summary_completion' | 'table_completion' | 'mcq'
  question_text TEXT NOT NULL,
  options JSONB,                          -- options array or null
  correct_answer TEXT NOT NULL,
  instruction_text TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_reading_q_passage ON exam_reading_questions(passage_number);
CREATE UNIQUE INDEX idx_reading_q_number ON exam_reading_questions(question_number);
```

### 2.3 Updated Answer Tables

The existing `exam_listening_answers` and `exam_reading_answers` tables (from `02-database-schema.md`) are reused. Update the question range:

```sql
-- exam_listening_answers.question_number range: 1–40 (was 1–10)
-- exam_reading_answers.question_number range: 1–26 (was 1–10)
```

---

## 3. Seed Data — Listening

### Section 1 (audio1.mp3) — Questions 1–10

```sql
INSERT INTO exam_listening_questions (section_number, question_number, question_type, question_text, options, correct_answer, audio_file, instruction_text) VALUES
(1, 1, 'mcq', 'How are they going to the main hall?',
  '["A. to apply for a course", "B. to hand out some forms", "C. to register for the coming year"]',
  'C', 'audio1.mp3', 'Choose the correct letter (A-C)'),
(1, 2, 'mcq', 'Where is the Administration Office?',
  '["A. on ground level", "B. on the first floor", "C. on the second floor"]',
  'B', 'audio1.mp3', 'Choose the correct letter (A-C)'),
(1, 3, 'mcq', 'What do they agree to do?',
  '["A. to separate and meet later", "B. to go to the main hall together", "C. to go to the canteen together"]',
  'A', 'audio1.mp3', 'Choose the correct letter (A-C)'),
(1, 4, 'mcq', 'What does Phoebe want to drink?',
  '["A. Coke", "B. Orange Juice", "C. Water"]',
  'B', 'audio1.mp3', 'Choose the correct letter (A-C)'),
(1, 5, 'mcq', 'How much money does Phoebe give to Mick?',
  '["A. twenty pounds", "B. five pounds", "C. two pounds"]',
  'C', 'audio1.mp3', 'Choose the correct letter (A-C)'),
(1, 6, 'form_completion', 'Name of the Student:', NULL,
  'Phoebe', 'audio1.mp3', 'Complete the form below (Write no more than two words)'),
(1, 7, 'form_completion', 'Town:', NULL,
  'Brighton', 'audio1.mp3', 'Complete the form below (Write no more than two words)'),
(1, 8, 'form_completion', 'Course First Year:', NULL,
  'English', 'audio1.mp3', 'Complete the form below (Write no more than two words)'),
(1, 9, 'mcq', 'What did Mike buy her to eat?',
  '["A. a chicken and tomato sandwich", "B. a ham and cheese sandwich", "C. a cheese and tomato sandwich"]',
  'C', 'audio1.mp3', 'Choose the correct letter (A-C)'),
(1, 10, 'mcq', 'What must the students do as part of registration at the university?',
  '["A. pay their fees", "B. find out about lectures", "C. check the noticeboard"]',
  'C', 'audio1.mp3', 'Choose the correct letter (A-C)');
```

### Section 2 (audio2.mp3) — Questions 11–20

```sql
INSERT INTO exam_listening_questions (section_number, question_number, question_type, question_text, options, correct_answer, audio_file, instruction_text) VALUES
(2, 11, 'mcq', 'What does Mark think about time management?',
  '["A. It is a subject he would like to talk about.", "B. It is something he does not know much about.", "C. It is something he is not good at.", "D. It is a subject he does not like talking about."]',
  'C', 'audio2.mp3', 'Choose the correct letter (A-D)'),
(2, 12, 'mcq', 'What does Mark say about the presentation?',
  '["A. He has planned the outline", "B. He has not started planning it yet", "C. He has thought about which ideas to include", "D. He needs to change some parts of it"]',
  'A', 'audio2.mp3', 'Choose the correct letter (A-D)'),
(2, 13, 'fill_blank', 'When is Mark giving the presentation?', NULL,
  'next Monday', 'audio2.mp3', 'Complete the information below (Write no more than three words)'),
(2, 14, 'fill_blank', '_______ things, for example, last minute holiday shopping', NULL,
  'Putting off', 'audio2.mp3', 'Complete the information below (Write no more than three words)'),
(2, 15, 'fill_blank', 'Relying too much on _______', NULL,
  'memory', 'audio2.mp3', 'Complete the information below (Write no more than three words)'),
(2, 16, 'fill_blank', 'Improving time management skills: Make to-do lists, _______', NULL,
  'Prioritise tasks', 'audio2.mp3', 'Complete the information below (Write no more than three words)'),
(2, 17, 'fill_blank', 'Breakdown projects into _______', NULL,
  'smaller tasks', 'audio2.mp3', 'Complete the information below (Write no more than three words)'),
(2, 18, 'fill_blank', 'Setting _______', NULL,
  'deadlines', 'audio2.mp3', 'Complete the information below (Write no more than three words)'),
(2, 19, 'fill_blank', 'Dealing with _______', NULL,
  'interruptions', 'audio2.mp3', 'Complete the information below (Write no more than three words)'),
(2, 20, 'fill_blank', 'Using the word _______', NULL,
  'no', 'audio2.mp3', 'Complete the information below (Write no more than three words)');
```

### Section 3 (audio3.mp3) — Questions 21–30

```sql
INSERT INTO exam_listening_questions (section_number, question_number, question_type, question_text, options, correct_answer, audio_file, instruction_text) VALUES
(3, 21, 'fill_blank', 'Colombia: Made aviation history by establishing the first _______', NULL,
  'commercial airline', 'audio3.mp3', 'Complete the table (Write no more than two words or a number)'),
(3, 22, 'fill_blank', 'Colombia: Over _______ airports.', NULL,
  '100', 'audio3.mp3', 'Complete the table (Write no more than two words or a number)'),
(3, 23, 'fill_blank', 'Venezuela: Iron ore mines can be found in _______', NULL,
  'Ciudad Guayana', 'audio3.mp3', 'Complete the table (Write no more than two words or a number)'),
(3, 24, 'fill_blank', 'United Kingdom: About _______ of inland waterways.', NULL,
  '3500 kilometres', 'audio3.mp3', 'Complete the table (Write no more than two words or a number)'),
(3, 25, 'fill_blank', 'United Kingdom: Proportion of road travellers is around _______', NULL,
  '85 percent', 'audio3.mp3', 'Complete the table (Write no more than two words or a number)'),
(3, 26, 'fill_blank', 'Transport development in China has been affected by its _______', NULL,
  'huge


 population', 'audio3.mp3', 'Complete the summary (Write no more than two words or a number)'),
(3, 27, 'fill_blank', 'The Yangtse bridge has two _______ one for cars and people and one for...', NULL,
  'levels', 'audio3.mp3', 'Complete the summary (Write no more than two words or a number)'),
(3, 28, 'fill_blank', '...one for cars and people and one for _______', NULL,
  'trains', 'audio3.mp3', 'Complete the summary (Write no more than two words or a number)'),
(3, 29, 'fill_blank', 'Japan: trains can travel up to _______ per hour', NULL,
  '300 kilometres', 'audio3.mp3', 'Complete the summary (Write no more than two words or a number)'),
(3, 30, 'fill_blank', 'Ships are used for both international and _______ transport', NULL,
  '


domestic', 'audio3.mp3', 'Complete the summary (Write no more than two words or a number)');
```

### Section 4 (audio4.mp3) — Questions 31–40

```sql
INSERT INTO exam_listening_questions (section_number, question_number, question_type, question_text, options, correct_answer, audio_file, instruction_text) VALUES
(4, 31, 'fill_blank', 'Exposure to target language determines _______', NULL,
  'level of proficiency', 'audio4.mp3', 'Complete the notes (Write no more than three words)'),
(4, 32, 'fill_blank', '_______ motivation', NULL,
  'Instrumental', 'audio4.mp3', 'Complete the notes (Write no more than three words)'),
(4, 33, 'fill_blank', 'Practical goals for example getting a job or _______', NULL,
  'passing an exam', 'audio4.mp3', 'Complete the notes (Write no more than three words)'),
(4, 34, 'fill_blank', 'Tool for socialising & integrating for example _______ or people married to speakers of another language', NULL,
  'immigrants', 'audio4.mp3', 'Complete the notes (Write no more than three words)'),
(4, 35, 'fill_blank', 'According to researchers integrative motivation produces _______', NULL,
  'better results', 'audio4.mp3', 'Complete the notes (Write no more than three words)'),
(4, 36, 'fill_blank', 'Good language learners are willing to take _______', NULL,
  'risks', 'audio4.mp3', 'Complete the notes (Write no more than three words)'),
(4, 37, 'fill_blank', '...not afraid of making mistakes and try to _______ with the language', NULL,
  'experiment', 'audio4.mp3', 'Complete the notes (Write no more than three words)'),
(4, 38, 'fill_blank', 'Efficient _______', NULL,
  'study habits', 'audio4.mp3', 'Complete the notes (Write no more than three words)'),
(4, 39, 'fill_blank', 'Adult learners: are independent of _______', NULL,
  'the teacher', 'audio4.mp3', 'Complete the notes (Write no more than three words)'),
(4, 40, 'fill_blank', 'Adult learners: take _______ for learning', NULL,
  'responsibility', 'audio4.mp3', 'Complete the notes (Write no more than three words)');
```

---

## 4. Seed Data — Reading

### Passage 1 — Electroreception (Questions 1–13)

```sql
-- Store full passage text in a variable or insert inline
INSERT INTO exam_reading_questions (passage_number, passage_title, passage_text, question_number, question_type, question_text, options, correct_answer, instruction_text) VALUES
-- Paragraph matching (Q1–6)
(1, 'Electroreception', '<FULL_PASSAGE_TEXT_FROM_READING_MD_PARAGRAPHS_A_TO_H>', 1,
  'paragraph_match', 'How electroreception can be used to help fish reproduce', '["A","B","C","D","E","F","G","H"]', 'C', 'Which paragraph contains the following information? Write the correct letter, A–H.'),
(1, 'Electroreception', '', 2, 'paragraph_match', 'A possible use for electroreception that will benefit humans', '["A","B","C","D","E","F","G","H"]', 'G', 'Which paragraph contains the following information?'),
(1, 'Electroreception', '', 3, 'paragraph_match', 'The term for the capacity which enables an animal to pick up but not send out electrical signals', '["A","B","C","D","E","F","G","H"]', 'B', 'Which paragraph contains the following information?'),
(1, 'Electroreception', '', 4, 'paragraph_match', 'Why only creatures that live in or near water have electroreceptive abilities', '["A","B","C","D","E","F","G","H"]', 'A', 'Which paragraph contains the following information?'),
(1, 'Electroreception', '', 5, 'paragraph_match', 'How electroreception might help creatures find their way over long distances', '["A","B","C","D","E","F","G","H"]', 'H', 'Which paragraph contains the following information?'),
(1, 'Electroreception', '', 6, 'paragraph_match', 'A description of how some fish can avoid disrupting each others electric signals', '["A","B","C","D","E","F","G","H"]', 'D', 'Which paragraph contains the following information?'),
-- Short answer (Q7–9)
(1, 'Electroreception', '', 7, 'short_answer', 'Sharks _______ alert the young ray to its presence', NULL, 'respiratory movements', 'Choose NO MORE THAN TWO WORDS from the passage.'),
(1, 'Electroreception', '', 8, 'short_answer', 'Embryo moves its _______ in order to breathe', NULL, 'tails', 'Choose NO MORE THAN TWO WORDS from the passage.'),
(1, 'Electroreception', '', 9, 'short_answer', 'Embryo stops sending _______ when predator close by', NULL, 'electric currents', 'Choose NO MORE THAN TWO WORDS from the passage.'),
-- Summary completion (Q10–13)
(1, 'Electroreception', '', 10, 'summary_completion', 'Firstly, it uses its _______ to smell its target', NULL, 'olfactory organs', 'Choose NO MORE THAN THREE words from the passage.'),
(1, 'Electroreception', '', 11, 'summary_completion', 'When the shark gets close, it uses _______ to guide it', NULL, 'electric signals', 'Choose NO MORE THAN THREE words from the passage.'),
(1, 'Electroreception', '', 12, 'summary_completion', 'Humans are not popular food sources due to their _______', NULL, 'sinewy muscle', 'Choose NO MORE THAN THREE words from the passage.'),
(1, 'Electroreception', '', 13, 'summary_completion', 'Salt from the blood increases the intensity of the _______', NULL, 'electric field', 'Choose NO MORE THAN THREE words from the passage.');
```

### Passage 2 — Time Travel (Questions 14–26)

```sql
INSERT INTO exam_reading_questions (passage_number, passage_title, passage_text, question_number, question_type, question_text, options, correct_answer, instruction_text) VALUES
-- True/False/Not Given (Q14–19)
(2, 'Time Travel', '<FULL_PASSAGE_TEXT_FROM_READING_MD_TIME_TRAVEL>', 14,
  'true_false_ng', 'It is unclear where neutrinos come from.', '["True","False","Not Given"]', 'False', 'Do the following statements agree with the information given?'),
(2, 'Time Travel', '', 15, 'true_false_ng', 'Neutrinos can pass through a persons body without causing harm.', '["True","False","Not Given"]', 'True', NULL),
(2, 'Time Travel', '', 16, 'true_false_ng', 'It took scientists between 50-70 nanoseconds to send the neutrinos from Geneva to Italy.', '["True","False","Not Given"]', 'Not Given', NULL),
(2, 'Time Travel', '', 17, 'true_false_ng', 'Researchers accounted for effects the moon might have had on the experiment.', '["True","False","Not Given"]', 'True', NULL),
(2, 'Time Travel', '', 18, 'true_false_ng', 'The theory of relativity has often been called into question unsuccessfully.', '["True","False","Not Given"]', 'True', NULL),
(2, 'Time Travel', '', 19, 'true_false_ng', 'This experiment could soon lead to some practical uses for time travel.', '["True","False","Not Given"]', 'False', NULL),
-- Table completion (Q20–25)
(2, 'Time Travel', '', 20, 'table_completion', 'Grandfather paradox: Time travel would allow for _______ that would actually make time travel impossible.', NULL, 'past actions', NULL),
(2, 'Time Travel', '', 21, 'table_completion', 'Self-consistency principle: It is only possible to alter history in ways that result in no _______', NULL, 'inconsistencies', NULL),
(2, 'Time Travel', '', 22, 'table_completion', 'Many-worlds interpretation original theorist: _______', NULL, 'Bryce Seligman DeWitt', NULL),
(2, 'Time Travel', '', 23, 'table_completion', 'Each possible event has an _______', NULL, 'alternative pathway', NULL),
(2, 'Time Travel', '', 24, 'table_completion', 'Unknown theorist theory name: _______', NULL, 'Non-existence theory', NULL),
(2, 'Time Travel', '', 25, 'table_completion', 'If a time traveller changed the past he would not have a _______', NULL, 'historical identity', NULL),
-- MCQ (Q26)
(2, 'Time Travel', '', 26, 'mcq', 'Stephen Hawking has stated that:',
  '["A. Human time travel is theoretically possible, but is unlikely to ever actually occur.", "B. Human time travel might be possible, but only moving backward in time.", "C. Human time travel might be possible, but only moving forward in time.", "D. All time travel is impossible."]',
  'C', 'Choose the correct letter, A, B, C or D.');
```

> [!NOTE]
> Replace `<FULL_PASSAGE_TEXT_FROM_READING_MD_...>` with the actual paragraph text from `Reading.md`. Only the first row per passage needs the full `passage_text`; subsequent rows for the same passage can have an empty string since the frontend groups questions by `passage_number`.

---

## 5. Answer Keys

### 5.1 Listening Answer Key

| Q# | Answer | Q# | Answer | Q# | Answer | Q# | Answer |
|----|--------|----|--------|----|--------|----|--------|
| 1 | C | 11 | C | 21 | commercial airline | 31 | level of proficiency |
| 2 | B | 12 | A | 22 | 100 | 32 | Instrumental |
| 3 | A | 13 | next Monday | 23 | Ciudad Guayana | 33 | passing an exam |
| 4 | B | 14 | Putting off | 24 | 3500 kilometres | 34 | immigrants |
| 5 | C | 15 | memory | 25 | 85 percent | 35 | better results |
| 6 | Phoebe | 16 | Prioritise tasks | 26 | huge population | 36 | risks |
| 7 | Brighton | 17 | smaller tasks | 27 | levels | 37 | experiment |
| 8 | English | 18 | deadlines | 28 | trains | 38 | study habits |
| 9 | C | 19 | interruptions | 29 | 300 kilometres | 39 | the teacher |
| 10 | C | 20 | no | 30 | domestic | 40 | responsibility |

### 5.2 Reading Answer Key

| Q# | Answer | Q# | Answer |
|----|--------|----|--------|
| 1 | C | 14 | False |
| 2 | G | 15 | True |
| 3 | B | 16 | Not Given |
| 4 | A | 17 | True |
| 5 | H | 18 | True |
| 6 | D | 19 | False |
| 7 | respiratory movements | 20 | past actions |
| 8 | tails | 21 | inconsistencies |
| 9 | electric currents | 22 | Bryce Seligman DeWitt |
| 10 | olfactory organs | 23 | alternative pathway |
| 11 | electric signals | 24 | Non-existence theory |
| 12 | sinewy muscle | 25 | historical identity |
| 13 | electric field | 26 | C |

---

## 6. Backend API Endpoints

### 6.1 `POST /api/exam/start` (Updated)

**Logic** (updated from `03-backend-api.md`):

1. Create `exam_simulations` record
2. Fetch all listening questions from `exam_listening_questions` grouped by section
3. Generate signed URLs for each audio file from `listening-audio` bucket
4. Return the exam shell with listening data

**Response `201`:**

```json
{
  "exam_id": "uuid",
  "phases": ["listening", "reading", "writing", "speaking"],
  "listening": {
    "sections": [
      {
        "section_number": 1,
        "audio_url": "https://<ref>.supabase.co/storage/v1/object/public/listening-audio/audio1.mp3",
        "questions": [
          {
            "number": 1,
            "type": "mcq",
            "text": "How are they going to the main hall?",
            "options": ["A. to apply for a course", "B. to hand out some forms", "C. to register for the coming year"],
            "instruction": "Choose the correct letter (A-C)"
          }
        ]
      }
    ]
  }
}
```

**Implementation:**

```typescript
// routes/exam.ts
router.post('/start', authMiddleware, async (req: AuthRequest, res) => {
  const userId = req.userId!;

  // 1. Create exam simulation
  const { data: exam, error: examError } = await supabase
    .from('exam_simulations')
    .insert({ user_id: userId })
    .select()
    .single();

  if (examError) return res.status(500).json({ error: examError.message });

  // 2. Fetch listening questions
  const { data: listeningQs } = await supabase
    .from('exam_listening_questions')
    .select('*')
    .order('question_number', { ascending: true });

  // 3. Group by section and build audio URLs
  const sections = [1, 2, 3, 4].map(sectionNum => {
    const sectionQs = (listeningQs || []).filter(q => q.section_number === sectionNum);
    return {
      section_number: sectionNum,
      audio_url: `${process.env.SUPABASE_URL}/storage/v1/object/public/listening-audio/audio${sectionNum}.mp3`,
      questions: sectionQs.map(q => ({
        number: q.question_number,
        type: q.question_type,
        text: q.question_text,
        options: q.options,
        instruction: q.instruction_text,
      })),
    };
  });

  res.status(201).json({
    exam_id: exam.id,
    phases: ['listening', 'reading', 'writing', 'speaking'],
    listening: { sections },
  });
});
```

### 6.2 `GET /api/exam/:examId/reading`

Fetch the reading passages and questions.

**Response `200`:**

```json
{
  "passages": [
    {
      "passage_number": 1,
      "title": "Electroreception",
      "text": "A. Open your eyes in sea water...",
      "questions": [
        {
          "number": 1,
          "type": "paragraph_match",
          "text": "How electroreception can be used to help fish reproduce",
          "options": ["A","B","C","D","E","F","G","H"],
          "instruction": "Which paragraph contains the following information?"
        }
      ]
    }
  ]
}
```

**Implementation:**

```typescript
router.get('/:examId/reading', authMiddleware, async (req: AuthRequest, res) => {
  const { data: readingQs } = await supabase
    .from('exam_reading_questions')
    .select('*')
    .order('question_number', { ascending: true });

  // Group by passage_number
  const passageMap = new Map<number, any>();
  for (const q of readingQs || []) {
    if (!passageMap.has(q.passage_number)) {
      passageMap.set(q.passage_number, {
        passage_number: q.passage_number,
        title: q.passage_title,
        text: q.passage_text || '',
        questions: [],
      });
    }
    passageMap.get(q.passage_number)!.questions.push({
      number: q.question_number,
      type: q.question_type,
      text: q.question_text,
      options: q.options,
      instruction: q.instruction_text,
    });
  }

  res.json({ passages: Array.from(passageMap.values()) });
});
```

### 6.3 `POST /api/exam/:examId/listening/submit`

**Request Body:**

```json
{
  "answers": [
    { "question_number": 1, "selected_answer": "C" },
    { "question_number": 6, "selected_answer": "Phoebe" }
  ]
}
```

**Implementation:**

```typescript
router.post('/:examId/listening/submit', authMiddleware, async (req: AuthRequest, res) => {
  const { examId } = req.params;
  const { answers } = req.body;

  // Fetch correct answers
  const { data: correctAnswers } = await supabase
    .from('exam_listening_questions')
    .select('question_number, correct_answer, question_type');

  const answerMap = new Map(correctAnswers?.map(a => [a.question_number, a]) || []);

  const records = answers.map((a: any) => {
    const correct = answerMap.get(a.question_number);
    const isCorrect = correct
      ? gradeAnswer(a.selected_answer, correct.correct_answer, correct.question_type)
      : false;

    return {
      exam_id: examId,
      question_number: a.question_number,
      selected_answer: a.selected_answer,
      correct_answer: correct?.correct_answer || '',
      is_correct: isCorrect,
    };
  });

  await supabase.from('exam_listening_answers').insert(records);
  await supabase.from('exam_simulations').update({ listening_completed: true }).eq('id', examId);

  const score = records.filter((r: any) => r.is_correct).length;
  res.json({ submitted: records.length, correct: score, total: 40 });
});
```

### 6.4 `POST /api/exam/:examId/reading/submit`

Same pattern as listening submit. Uses `exam_reading_answers` table.

### 6.5 `POST /api/exam/:examId/complete` (Updated)

**Updated logic:**

1. Mark `exam_simulations.status = 'completed'`, set `completed_at`
2. Calculate listening band score from `exam_listening_answers`
3. Calculate reading band score from `exam_reading_answers`
4. Fetch linked writing + speaking AI feedback (if exists)
5. Calculate overall band score
6. Store in `ai_feedback` with `feedback_type = 'exam'`
7. Store in `score_history`
8. Return all scores

---

## 7. AI-Powered Grading

### 7.1 Listening & Reading Band Score Calculation

MCQ and exact-match questions are graded automatically. Fill-in-the-blank answers use fuzzy matching via AI.

**Fuzzy Grading for Fill-in-the-Blank:**

```typescript
export function gradeAnswer(
  userAnswer: string,
  correctAnswer: string,
  questionType: string
): boolean {
  if (questionType === 'mcq') {
    return userAnswer.trim().toUpperCase() === correctAnswer.trim().toUpperCase();
  }

  // For fill-in-the-blank: case-insensitive, trim whitespace, allow minor variations
  const normalize = (s: string) => s.trim().toLowerCase().replace(/[^a-z0-9\s]/g, '');
  const user = normalize(userAnswer);
  const correct = normalize(correctAnswer);

  // Exact match
  if (user === correct) return true;

  // Allow singular/plural and minor spelling (Levenshtein distance <= 2)
  if (levenshteinDistance(user, correct) <= 2) return true;

  return false;
}
```

**Raw Score → Band Score Conversion (official IELTS scale):**

```typescript
export function rawScoreToBand(correct: number, total: number): number {
  const percentage = (correct / total) * 100;

  if (percentage >= 95) return 9.0;
  if (percentage >= 87.5) return 8.5;
  if (percentage >= 80) return 8.0;
  if (percentage >= 72.5) return 7.5;
  if (percentage >= 65) return 7.0;
  if (percentage >= 57.5) return 6.5;
  if (percentage >= 50) return 6.0;
  if (percentage >= 42.5) return 5.5;
  if (percentage >= 35) return 5.0;
  if (percentage >= 27.5) return 4.5;
  if (percentage >= 20) return 4.0;
  if (percentage >= 12.5) return 3.5;
  return 3.0;
}
```

### 7.2 AI Review for Ambiguous Answers (Optional Enhancement)

For fill-in-the-blank answers that fail fuzzy matching, use Groq to determine if the answer is semantically correct:

```typescript
export async function aiGradeAnswer(
  question: string,
  userAnswer: string,
  correctAnswer: string
): Promise<boolean> {
  const response = await groq.chat.completions.create({
    model: MODELS.CHAT,
    temperature: 0,
    response_format: { type: 'json_object' },
    messages: [
      {
        role: 'system',
        content: `You are an IELTS Listening/Reading answer grader. Determine if the student's answer is acceptable.
Rules:
- Minor spelling mistakes are acceptable if meaning is clear
- Synonyms are NOT acceptable (must match passage/audio)
- Extra words beyond the word limit make the answer WRONG
- Case does not matter

Respond: { "is_correct": true/false, "reason": "brief explanation" }`,
      },
      {
        role: 'user',
        content: `Question: ${question}\nCorrect answer: ${correctAnswer}\nStudent answer: ${userAnswer}`,
      },
    ],
  });

  const result = JSON.parse(response.choices[0].message.content!);
  return result.is_correct;
}
```

---

## 8. Service Architecture

```
src/
├── routes/
│   └── exam.ts              # All exam endpoints (updated)
├── services/
│   ├── examGradingService.ts # gradeAnswer(), rawScoreToBand(), aiGradeAnswer()
│   └── aiService.ts          # Existing; add exam-specific AI calls
├── data/
│   ├── listeningQuestions.ts  # Optional: hardcoded fallback if DB is empty
│   └── readingQuestions.ts    # Optional: hardcoded fallback if DB is empty
└── scripts/
    └── seedExamData.ts        # Run once to seed listening/reading questions
```

**Seed Script (`scripts/seedExamData.ts`):**

```typescript
import { supabase } from '../config/supabase';

async function seed() {
  // Insert listening questions (copy SQL from Section 3 above)
  // Insert reading questions (copy SQL from Section 4 above)
  console.log('Exam data seeded successfully');
}

seed().catch(console.error);
```

Run: `npx ts-node src/scripts/seedExamData.ts`

---

## 9. Testing Instructions

### 9.1 Supabase Verification

```bash
# Verify audio files are accessible
curl -I "https://<PROJECT_REF>.supabase.co/storage/v1/object/public/listening-audio/audio1.mp3"
# Expected: HTTP 200

# Verify questions are seeded
# In Supabase SQL Editor:
SELECT COUNT(*) FROM exam_listening_questions;  -- Should return 40
SELECT COUNT(*) FROM exam_reading_questions;    -- Should return 26
```

### 9.2 API Testing (cURL)

```bash
# 1. Start exam
curl -X POST http://localhost:3000/api/exam/start \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json"
# Verify: response includes listening.sections with audio_url and questions

# 2. Get reading
curl http://localhost:3000/api/exam/<EXAM_ID>/reading \
  -H "Authorization: Bearer <TOKEN>"
# Verify: response includes passages with questions

# 3. Submit listening answers
curl -X POST http://localhost:3000/api/exam/<EXAM_ID>/listening/submit \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"answers":[{"question_number":1,"selected_answer":"C"},{"question_number":2,"selected_answer":"B"}]}'
# Verify: response includes correct count

# 4. Submit reading answers
curl -X POST http://localhost:3000/api/exam/<EXAM_ID>/reading/submit \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"answers":[{"question_number":1,"selected_answer":"C"},{"question_number":14,"selected_answer":"False"}]}'

# 5. Complete exam
curl -X POST http://localhost:3000/api/exam/<EXAM_ID>/complete \
  -H "Authorization: Bearer <TOKEN>"
# Verify: response includes band scores for all sections
```

### 9.3 Grading Accuracy Tests

```typescript
// Unit tests for gradeAnswer()
import { gradeAnswer, rawScoreToBand } from '../services/examGradingService';

// MCQ
assert(gradeAnswer('C', 'C', 'mcq') === true);
assert(gradeAnswer('c', 'C', 'mcq') === true);
assert(gradeAnswer('A', 'C', 'mcq') === false);

// Fill-in-blank exact
assert(gradeAnswer('Phoebe', 'Phoebe', 'fill_blank') === true);
assert(gradeAnswer('phoebe', 'Phoebe', 'fill_blank') === true);

// Fill-in-blank fuzzy (minor typo)
assert(gradeAnswer('Phobe', 'Phoebe', 'fill_blank') === true);  // Levenshtein = 1
assert(gradeAnswer('something completely wrong', 'Phoebe', 'fill_blank') === false);

// Band score conversion
assert(rawScoreToBand(39, 40) === 9.0);
assert(rawScoreToBand(30, 40) === 7.5);
assert(rawScoreToBand(20, 40) === 5.0);
```

### 9.4 End-to-End Frontend Test

1. Start the app, log in, tap "Start Simulation"
2. **Listening**: Audio player should load `audio1.mp3` from Supabase. Answer questions 1–40 across 4 sections.
3. **Reading**: Passage text (Electroreception, Time Travel) should appear with their specific question types.
4. **Writing**: Write Task 1 and Task 2 essays.
5. **Speaking**: Record audio for each question.
6. Click "End Exam" → AI Review → verify band scores for all 4 sections appear on the results screen.

### 9.5 Edge Cases to Test

| Scenario | Expected Behaviour |
|---|---|
| User submits empty answers | All marked incorrect, low band score |
| User submits partial answers (only 5 of 40) | Score based on 5/40 |
| Fill-in-blank with extra spaces | Trimmed, accepted |
| Fill-in-blank with wrong capitalisation | Case-insensitive, accepted |
| Audio file missing from Supabase | Frontend shows error state, exam still navigable |
| User ends exam early via "End Exam" | Partial data submitted, graded on what's available |
