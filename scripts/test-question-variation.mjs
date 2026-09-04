// SpeakBand — Question Variation & Conversational Flow Verification Suite
// Tests Full Test topic/question variation, Practice Mode adaptive progression,
// cross-session deduplication, and semantic duplicate detection.

import {
  PART_1_TOPICS,
  PART_1_QUESTIONS,
  PART_2_CUE_CARDS,
  PART_3_QUESTIONS,
  getPart1TestCurriculum,
  getPart2AndPart3Curriculum,
  getUnusedPracticeQuestion,
} from '../src/lib/questionBank.ts';

import {
  calculateTokenSimilarity,
  isSemanticDuplicate,
} from '../src/lib/questionMemory.ts';

import {
  initializePracticeSessionMemory,
  getNextPracticeQuestion,
} from '../src/lib/practiceCoach.ts';

let passedTests = 0;
let totalTests = 0;

function assert(condition, message) {
  totalTests++;
  if (!condition) {
    console.error(`❌ FAIL: ${message}`);
    throw new Error(`Assertion failed: ${message}`);
  }
  passedTests++;
  console.log(`✅ PASS: ${message}`);
}

console.log('====================================================');
console.log('SPEAKBAND QUESTION VARIATION & ADAPTIVE COACH TEST');
console.log('====================================================\n');

// ----------------------------------------------------
// TEST 1: Question Bank Coverage & Integrity
// ----------------------------------------------------
console.log('--- TEST 1: Question Bank Coverage & Integrity ---');
{
  assert(PART_1_TOPICS.length >= 25, `PART_1_TOPICS has ${PART_1_TOPICS.length} topics (expected >= 25)`);
  assert(PART_1_QUESTIONS.length >= 75, `PART_1_QUESTIONS has ${PART_1_QUESTIONS.length} questions (expected >= 75)`);
  assert(PART_2_CUE_CARDS.length >= 10, `PART_2_CUE_CARDS has ${PART_2_CUE_CARDS.length} cue cards (expected >= 10)`);

  // Ensure unique question IDs
  const allIds = new Set();
  let duplicates = 0;
  for (const q of PART_1_QUESTIONS) {
    if (allIds.has(q.id)) duplicates++;
    allIds.add(q.id);
  }
  for (const c of PART_2_CUE_CARDS) {
    if (allIds.has(c.id)) duplicates++;
    allIds.add(c.id);
  }
  const allP3Questions = Object.values(PART_3_QUESTIONS).flat();
  for (const q of allP3Questions) {
    if (allIds.has(q.id)) duplicates++;
    allIds.add(q.id);
  }
  assert(duplicates === 0, `All ${allIds.size} question IDs in questionBank are strictly unique`);

  // Ensure every cue card has linked Part 3 questions
  for (const card of PART_2_CUE_CARDS) {
    const linkedP3 = PART_3_QUESTIONS[card.id] || [];
    assert(
      linkedP3.length >= 3,
      `Cue card "${card.topic}" (${card.id}) has ${linkedP3.length} linked Part 3 questions (expected >= 3)`
    );
  }
}

// ----------------------------------------------------
// TEST 2: Semantic Duplicate Detection
// ----------------------------------------------------
console.log('\n--- TEST 2: Semantic Duplicate Detection ---');
{
  const asked = [
    'Do you currently work, or are you a student?',
    'What do you like to do in your free time?',
    'Describe the city or town where you grew up.',
  ];

  // Identical question
  assert(
    isSemanticDuplicate('Do you currently work, or are you a student?', asked) === true,
    'Identical question correctly detected as duplicate'
  );

  // Intent cluster duplicate (work/studies)
  assert(
    isSemanticDuplicate('What is your current occupation or what do you study?', asked) === true,
    'Intent cluster match (work/occupation) detected as duplicate'
  );

  // Intent cluster duplicate (free time / hobbies)
  assert(
    isSemanticDuplicate('What activities do you enjoy during your spare time and weekends?', asked) === true,
    'Intent cluster match (free time / spare time) detected as duplicate'
  );

  // Intent cluster duplicate (hometown)
  assert(
    isSemanticDuplicate('Could you tell me a little bit about your hometown?', asked) === true,
    'Intent cluster match (hometown) detected as duplicate'
  );

  // High token similarity paraphrase
  assert(
    isSemanticDuplicate('What do you enjoy doing during your free time?', asked) === true,
    'Paraphrased question detected as duplicate via token similarity'
  );

  // Completely novel questions should NOT be duplicates
  assert(
    isSemanticDuplicate('How has modern artificial intelligence affected traditional classrooms?', asked) === false,
    'Novel education question correctly accepted as non-duplicate'
  );

  assert(
    isSemanticDuplicate('Do you prefer reading physical books or reading on digital tablets?', asked) === false,
    'Novel reading question correctly accepted as non-duplicate'
  );

  assert(
    isSemanticDuplicate('What kind of weather do you enjoy the most throughout the year?', asked) === false,
    'Novel weather question correctly accepted as non-duplicate'
  );
}

// ----------------------------------------------------
// TEST 3: Full Test Part 1 Starting Question Variation (10 Consecutive Tests)
// ----------------------------------------------------
console.log('\n--- TEST 3: Full Test Part 1 Starting Question Variation ---');
{
  const testRuns = 10;
  const startingQuestions = [];
  const startingTopics = [];
  let recentQuestions = [];
  let recentTopics = [];

  for (let i = 0; i < testRuns; i++) {
    const curriculum = getPart1TestCurriculum({
      recentlyUsedQuestionIds: recentQuestions,
      recentlyUsedTopics: recentTopics,
    });

    const questions = curriculum.questions;
    assert(questions.length === 6, `Test ${i + 1} generated 6 Part 1 questions`);

    const q0 = questions[0];
    startingQuestions.push(q0.id);
    startingTopics.push(q0.topic);

    // Assert questions within a single test have no duplicates
    const testIds = new Set(questions.map((q) => q.id));
    assert(testIds.size === 6, `Test ${i + 1} has 6 unique questions (no intra-test duplicates)`);

    // Assert Part 1 has exactly 2 topics (3 questions each)
    const distinctTopics = Array.from(new Set(questions.map((q) => q.topic)));
    assert(
      distinctTopics.length === 2,
      `Test ${i + 1} uses 2 topic clusters: ${distinctTopics.join(' & ')}`
    );

    // Update cross-session memory
    recentQuestions = [...recentQuestions, ...questions.map((q) => q.id)].slice(-20);
    recentTopics = [...recentTopics, ...distinctTopics].slice(-10);
  }

  console.log(`Starting Question IDs across 10 tests: ${startingQuestions.join(', ')}`);
  console.log(`Starting Topics across 10 tests: ${startingTopics.join(', ')}`);

  // Assert starting questions are not all identical (fixes the p1_std_01 bug)
  const uniqueStartingQuestions = new Set(startingQuestions);
  assert(
    uniqueStartingQuestions.size >= 4,
    `At least 4 distinct starting questions across 10 tests (actual: ${uniqueStartingQuestions.size})`
  );

  // Assert consecutive tests do NOT have the same starting question
  let consecutiveSameQ = 0;
  for (let i = 1; i < startingQuestions.length; i++) {
    if (startingQuestions[i] === startingQuestions[i - 1]) consecutiveSameQ++;
  }
  assert(consecutiveSameQ === 0, 'No two consecutive Full Tests had the same starting question');

  // Assert starting topics rotate
  const uniqueStartingTopics = new Set(startingTopics);
  assert(
    uniqueStartingTopics.size >= 4,
    `At least 4 distinct starting topics across 10 tests (actual: ${uniqueStartingTopics.size})`
  );
}

// ----------------------------------------------------
// TEST 4: Full Test Part 2 Cue Cards & Part 3 Variation (10 Consecutive Tests)
// ----------------------------------------------------
console.log('\n--- TEST 4: Full Test Part 2 & Part 3 Variation ---');
{
  const testRuns = 10;
  const selectedCards = [];
  let recentCueCards = [];

  for (let i = 0; i < testRuns; i++) {
    const { cueCard, part3Questions } = getPart2AndPart3Curriculum({
      recentlyUsedCueCardIds: recentCueCards,
    });

    selectedCards.push(cueCard.id);
    assert(Boolean(cueCard.cuePrompt), `Test ${i + 1} Part 2 has a valid prompt`);
    assert(cueCard.bulletPoints.length >= 3, `Test ${i + 1} Part 2 has >= 3 bullet points`);
    assert(part3Questions.length >= 3, `Test ${i + 1} Part 3 has ${part3Questions.length} abstract questions`);

    // Verify all Part 3 questions link to this cue card
    const allLinked = part3Questions.every((q) => q.cueCardTopicId === cueCard.id);
    assert(allLinked, `Test ${i + 1} Part 3 questions all correlate with Part 2 Cue Card "${cueCard.topic}"`);

    recentCueCards = [...recentCueCards, cueCard.id].slice(-8);
  }

  console.log(`Cue Cards across 10 tests: ${selectedCards.join(', ')}`);
  const uniqueCards = new Set(selectedCards);
  assert(
    uniqueCards.size >= 5,
    `At least 5 distinct Part 2 cue cards across 10 tests (actual: ${uniqueCards.size})`
  );

  let consecutiveSameCard = 0;
  for (let i = 1; i < selectedCards.length; i++) {
    if (selectedCards[i] === selectedCards[i - 1]) consecutiveSameCard++;
  }
  assert(consecutiveSameCard === 0, 'No two consecutive Full Tests had the same Part 2 cue card');
}

// ----------------------------------------------------
// TEST 5: Practice Mode Conversational Multi-Turn Progression
// ----------------------------------------------------
console.log('\n--- TEST 5: Practice Mode Conversational Multi-Turn Progression ---');
{
  let memory = initializePracticeSessionMemory({
    preferredTopic: 'technology',
    recentTopics: ['studies', 'work'],
  });

  assert(memory.currentTopic === 'technology', 'Initial topic initialized to requested preference');
  assert(memory.topicQuestionCount === 0, 'Initial topic question count is 0');
  assert(memory.askedQuestions.length === 0, 'Initial asked questions list is empty');

  const turns = 8;
  const studentAnswers = [
    'I use my smartphone mostly for navigating public transit and keeping in touch with colleagues through messaging applications.',
    'Yes, definitely. Nowadays young children spend an excessive amount of time on tablets, which might hinder their physical coordination.',
    'I believe future artificial intelligence will automate repetitive tasks, allowing people to focus on more creative problem solving.',
    'In my hometown, traffic congestion is quite severe during morning peak hours due to rapid urbanization.',
    'The municipality has constructed elevated highways, though public metro expansion would be far more sustainable.',
    'I usually spend my Saturday mornings cycling around the local park and enjoying a quiet coffee with friends.',
    'Engaging in regular exercise helps me decompress and maintain mental focus for demanding work projects.',
    'Personally, I prefer outdoor activities because being immersed in natural environments significantly alleviates workplace stress.',
  ];

  const topicsSeen = [];
  const questionsAsked = [];

  for (let t = 0; t < turns; t++) {
    // Generate next question via getNextPracticeQuestion (using local fallback / question bank without API key)
    const result = await getNextPracticeQuestion({
      memory,
      focusSkill: 'Fluency & Coherence',
      drillType: 'fluency_challenge',
    });

    topicsSeen.push(result.memory.currentTopic);
    questionsAsked.push(result.drill.prompt);

    assert(Boolean(result.drill.prompt), `Turn ${t + 1} generated a prompt: "${result.drill.prompt.slice(0, 45)}..."`);
    assert(result.drill.targetCollocations.length >= 2, `Turn ${t + 1} generated >= 2 target collocations`);

    // Ensure no duplicate prompt
    assert(
      result.memory.askedQuestions.filter((q) => q === result.drill.prompt).length === 1,
      `Turn ${t + 1} prompt is unique and added to askedQuestions`
    );

    // Simulate student response
    memory = {
      ...result.memory,
      conversationHistory: [
        ...result.memory.conversationHistory,
        { role: 'student', text: studentAnswers[t], timestamp: Date.now() },
      ],
    };
  }

  // Verify topic rotation occurred after 2-4 questions
  const distinctTopicsInPractice = Array.from(new Set(topicsSeen));
  console.log(`Topics transitioned during practice turns: ${topicsSeen.join(' -> ')}`);
  assert(
    distinctTopicsInPractice.length >= 2,
    `Practice coach rotated topics across 8 turns (observed topics: ${distinctTopicsInPractice.join(', ')})`
  );

  // Verify no duplicate question across all practice turns
  const uniqueQuestions = new Set(questionsAsked);
  assert(
    uniqueQuestions.size === turns,
    `All ${turns} practice questions generated were completely distinct`
  );

  // Verify conversation history integrity
  assert(
    memory.conversationHistory.length >= turns * 2,
    `Conversation history contains at least ${turns * 2} turns (coach questions + student answers)`
  );
}

// ----------------------------------------------------
// TEST 6: Resilient Fallback Non-Repetition
// ----------------------------------------------------
console.log('\n--- TEST 6: Resilient Question-Bank Fallbacks ---');
{
  const topic = 'free_time';
  const asked = [];

  for (let i = 0; i < 4; i++) {
    const drill = getUnusedPracticeQuestion(topic, asked);
    assert(
      !asked.includes(drill.question),
      `Fallback question ${i + 1} is not previously asked: "${drill.question.slice(0, 40)}..."`
    );
    asked.push(drill.question);
  }

  assert(asked.length === 4, 'Successfully pulled 4 distinct fallback questions from a single topic');
}

console.log('\n====================================================');
console.log(`ALL VERIFICATION TESTS COMPLETED: ${passedTests} / ${totalTests} PASSED`);
console.log('====================================================');
