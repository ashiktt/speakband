// SpeakBand — Controlled Question Bank & IELTS Topic Engine

import { Part1Question, Part2CueCard, Part3Question } from '@/types/ielts';

// PART 1 CONTROLLED QUESTION BANK
export const PART_1_TOPICS = [
  'studies',
  'work',
  'hometown',
  'home',
  'free_time',
  'technology',
  'food',
  'travel',
  'music',
  'sports',
  'weather',
  'daily_routine',
  'shopping',
  'friends',
  'family',
  'hobbies',
] as const;

export const PART_1_QUESTIONS: Part1Question[] = [
  // Studies
  { id: 'p1_std_01', part: 1, topic: 'studies', difficulty: 'standard', question: 'Do you currently work, or are you a student?' },
  { id: 'p1_std_02', part: 1, topic: 'studies', difficulty: 'standard', question: 'What subject are you studying?' },
  { id: 'p1_std_03', part: 1, topic: 'studies', difficulty: 'standard', question: 'What do you enjoy most about your studies?' },
  { id: 'p1_std_04', part: 1, topic: 'studies', difficulty: 'standard', question: 'Do you prefer studying in the morning or in the evening?' },
  { id: 'p1_std_05', part: 1, topic: 'studies', difficulty: 'standard', question: 'Would you like to study any other subject in the future?' },

  // Work
  { id: 'p1_wrk_01', part: 1, topic: 'work', difficulty: 'standard', question: 'What kind of work do you do?' },
  { id: 'p1_wrk_02', part: 1, topic: 'work', difficulty: 'standard', question: 'What responsibilities do you have in your day-to-day work?' },
  { id: 'p1_wrk_03', part: 1, topic: 'work', difficulty: 'standard', question: 'What do you like most about your job?' },
  { id: 'p1_wrk_04', part: 1, topic: 'work', difficulty: 'standard', question: 'Do you get along well with your colleagues?' },
  { id: 'p1_wrk_05', part: 1, topic: 'work', difficulty: 'standard', question: 'What career aspirations do you have for the future?' },

  // Hometown
  { id: 'p1_htn_01', part: 1, topic: 'hometown', difficulty: 'standard', question: 'Where is your hometown located?' },
  { id: 'p1_htn_02', part: 1, topic: 'hometown', difficulty: 'standard', question: 'What do you like most about living there?' },
  { id: 'p1_htn_03', part: 1, topic: 'hometown', difficulty: 'standard', question: 'Has your hometown changed much over recent years?' },
  { id: 'p1_htn_04', part: 1, topic: 'hometown', difficulty: 'standard', question: 'Is there anything you dislike about your hometown?' },
  { id: 'p1_htn_05', part: 1, topic: 'hometown', difficulty: 'standard', question: 'Would you recommend your hometown to visitors?' },

  // Home / Accommodation
  { id: 'p1_hom_01', part: 1, topic: 'home', difficulty: 'standard', question: 'Do you live in a house or an apartment?' },
  { id: 'p1_hom_02', part: 1, topic: 'home', difficulty: 'standard', question: 'Which room in your home do you spend the most time in?' },
  { id: 'p1_hom_03', part: 1, topic: 'home', difficulty: 'standard', question: 'What is your favorite feature of your home?' },
  { id: 'p1_hom_04', part: 1, topic: 'home', difficulty: 'standard', question: 'Would you like to make any changes to your home in the future?' },

  // Free Time
  { id: 'p1_frt_01', part: 1, topic: 'free_time', difficulty: 'standard', question: 'How do you usually like to spend your weekends?' },
  { id: 'p1_frt_02', part: 1, topic: 'free_time', difficulty: 'standard', question: 'Do you prefer relaxing at home or going out with friends?' },
  { id: 'p1_frt_03', part: 1, topic: 'free_time', difficulty: 'standard', question: 'Do you feel you have enough free time nowadays?' },
  { id: 'p1_frt_04', part: 1, topic: 'free_time', difficulty: 'standard', question: 'What new hobby would you like to take up if you had more time?' },

  // Technology
  { id: 'p1_tch_01', part: 1, topic: 'technology', difficulty: 'standard', question: 'What electronic device do you use most frequently?' },
  { id: 'p1_tch_02', part: 1, topic: 'technology', difficulty: 'standard', question: 'How has the internet influenced your daily routine?' },
  { id: 'p1_tch_03', part: 1, topic: 'technology', difficulty: 'standard', question: 'Do you prefer reading physical books or digital articles?' },
  { id: 'p1_tch_04', part: 1, topic: 'technology', difficulty: 'standard', question: 'Do you find it easy or difficult to adapt to new technologies?' },

  // Food
  { id: 'p1_fod_01', part: 1, topic: 'food', difficulty: 'standard', question: 'What is your favorite type of food?' },
  { id: 'p1_fod_02', part: 1, topic: 'food', difficulty: 'standard', question: 'Do you enjoy cooking for yourself or for others?' },
  { id: 'p1_fod_03', part: 1, topic: 'food', difficulty: 'standard', question: 'Do you prefer eating at home or dining in restaurants?' },
  { id: 'p1_fod_04', part: 1, topic: 'food', difficulty: 'standard', question: 'Has your taste in food changed since you were a child?' },

  // Travel
  { id: 'p1_trv_01', part: 1, topic: 'travel', difficulty: 'standard', question: 'Do you enjoy travelling to new places?' },
  { id: 'p1_trv_02', part: 1, topic: 'travel', difficulty: 'standard', question: 'What was the most memorable place you have visited?' },
  { id: 'p1_trv_03', part: 1, topic: 'travel', difficulty: 'standard', question: 'Do you prefer travelling alone or with other people?' },
  { id: 'p1_trv_04', part: 1, topic: 'travel', difficulty: 'standard', question: 'Which country would you most like to travel to in the future?' },

  // Weather
  { id: 'p1_wth_01', part: 1, topic: 'weather', difficulty: 'standard', question: 'What kind of weather do you prefer?' },
  { id: 'p1_wth_02', part: 1, topic: 'weather', difficulty: 'standard', question: 'Does the weather ever affect your mood or daily plans?' },
  { id: 'p1_wth_03', part: 1, topic: 'weather', difficulty: 'standard', question: 'Do you usually check the weather forecast before leaving home?' },
  { id: 'p1_wth_04', part: 1, topic: 'weather', difficulty: 'standard', question: 'Is the climate changing in your region?' },

  // Music
  { id: 'p1_mus_01', part: 1, topic: 'music', difficulty: 'standard', question: 'What genres of music do you like listening to?' },
  { id: 'p1_mus_02', part: 1, topic: 'music', difficulty: 'standard', question: 'When do you normally listen to music?' },
  { id: 'p1_mus_03', part: 1, topic: 'music', difficulty: 'standard', question: 'Can you play any musical instruments?' },
  { id: 'p1_mus_04', part: 1, topic: 'music', difficulty: 'standard', question: 'Have you ever attended a live music concert?' },
];

// PART 2 AUTHENTIC CUE CARDS
export const PART_2_CUE_CARDS: Part2CueCard[] = [
  {
    id: 'cue_travel_place',
    topic: 'Travel & Destinations',
    cuePrompt: 'Describe a place you would like to visit in the future.',
    bulletPoints: [
      'where this place is located',
      'how you first learned about it',
      'what you would like to do there',
      'and explain why you would like to visit this particular place.',
    ],
    closingQuestions: [
      'Do you think you will visit this place in the near future?',
      'Have any of your friends or family ever been there?',
    ],
  },
  {
    id: 'cue_important_decision',
    topic: 'Life Decisions',
    cuePrompt: 'Describe an important decision you made that influenced your life.',
    bulletPoints: [
      'what the decision was',
      'when and where you made it',
      'who helped you make this decision',
      'and explain why this decision was so significant for your life.',
    ],
    closingQuestions: [
      'Did you feel confident at the time you made that choice?',
      'Do you often consult other people before making big decisions?',
    ],
  },
  {
    id: 'cue_useful_skill',
    topic: 'Learning & Skills',
    cuePrompt: 'Describe a useful skill you learned outside of school or university.',
    bulletPoints: [
      'what skill it is',
      'when and how you learned it',
      'who taught or guided you',
      'and explain why this skill is useful in your life.',
    ],
    closingQuestions: [
      'Do you practice this skill on a regular basis?',
      'Is this skill popular among people of your generation?',
    ],
  },
  {
    id: 'cue_memorable_journey',
    topic: 'Journeys & Transportation',
    cuePrompt: 'Describe a memorable journey you went on by public transport.',
    bulletPoints: [
      'where you went and what form of transport you used',
      'who was travelling with you',
      'what happened during the journey',
      'and explain why this journey was particularly memorable.',
    ],
    closingQuestions: [
      'Do you regularly use public transport in your everyday life?',
      'Would you recommend that particular route to others?',
    ],
  },
  {
    id: 'cue_admired_person',
    topic: 'People & Role Models',
    cuePrompt: 'Describe an older person whom you admire or respect.',
    bulletPoints: [
      'who this person is',
      'how you know them',
      'what qualities or achievements make them special',
      'and explain why you admire them so much.',
    ],
    closingQuestions: [
      'Do you share similar interests with this person?',
      'Do you think younger generations look up to older people as much today?',
    ],
  },
];

// PART 3 THEMATIC ABSTRACT QUESTIONS (Linked strictly to Part 2 topics)
export const PART_3_QUESTIONS: Record<string, Part3Question[]> = {
  cue_travel_place: [
    {
      id: 'p3_trv_01',
      part: 3,
      cueCardTopicId: 'cue_travel_place',
      subTopic: 'Motivation for travel',
      question: 'Why do you think people are often drawn to visiting unfamiliar places?',
      promptType: 'reason',
    },
    {
      id: 'p3_trv_02',
      part: 3,
      cueCardTopicId: 'cue_travel_place',
      subTopic: 'Cultural understanding',
      question: 'Do you believe international tourism helps people understand other cultures better, or does it sometimes reinforce stereotypes?',
      promptType: 'comparison',
    },
    {
      id: 'p3_trv_03',
      part: 3,
      cueCardTopicId: 'cue_travel_place',
      subTopic: 'Mass tourism challenges',
      question: 'What environmental and economic problems can mass tourism cause for local communities?',
      promptType: 'opinion',
    },
    {
      id: 'p3_trv_04',
      part: 3,
      cueCardTopicId: 'cue_travel_place',
      subTopic: 'Future of tourism',
      question: 'How might technological advancements, such as virtual reality, change the way people experience travel in the coming decades?',
      promptType: 'prediction',
    },
  ],
  cue_important_decision: [
    {
      id: 'p3_dec_01',
      part: 3,
      cueCardTopicId: 'cue_important_decision',
      subTopic: 'Decision making styles',
      question: 'Why do some individuals prefer making decisions independently, while others rely heavily on advice from others?',
      promptType: 'comparison',
    },
    {
      id: 'p3_dec_02',
      part: 3,
      cueCardTopicId: 'cue_important_decision',
      subTopic: 'Parental influence',
      question: 'To what extent should parents influence their children’s career and educational choices?',
      promptType: 'evaluation',
    },
    {
      id: 'p3_dec_03',
      part: 3,
      cueCardTopicId: 'cue_important_decision',
      subTopic: 'Societal pressure',
      question: 'Do you think young people today face more pressure when making major life decisions than previous generations did?',
      promptType: 'opinion',
    },
    {
      id: 'p3_dec_04',
      part: 3,
      cueCardTopicId: 'cue_important_decision',
      subTopic: 'Role of AI in decisions',
      question: 'How might artificial intelligence influence the decisions governments and organizations make in the future?',
      promptType: 'prediction',
    },
  ],
  cue_useful_skill: [
    {
      id: 'p3_skl_01',
      part: 3,
      cueCardTopicId: 'cue_useful_skill',
      subTopic: 'Informal vs formal learning',
      question: 'What are the main differences between learning a skill through practical experience compared to formal education?',
      promptType: 'comparison',
    },
    {
      id: 'p3_skl_02',
      part: 3,
      cueCardTopicId: 'cue_useful_skill',
      subTopic: 'Future employment skills',
      question: 'Which skills do you believe will become indispensable for young professionals over the next twenty years?',
      promptType: 'prediction',
    },
    {
      id: 'p3_skl_03',
      part: 3,
      cueCardTopicId: 'cue_useful_skill',
      subTopic: 'Online self-directed education',
      question: 'How has the internet altered people’s capacity to acquire specialized knowledge without attending school?',
      promptType: 'evaluation',
    },
    {
      id: 'p3_skl_04',
      part: 3,
      cueCardTopicId: 'cue_useful_skill',
      subTopic: 'Lifelong education',
      question: 'Do you agree that modern economic changes necessitate continuous lifelong learning rather than completing education once in youth?',
      promptType: 'opinion',
    },
  ],
  cue_memorable_journey: [
    {
      id: 'p3_jrn_01',
      part: 3,
      cueCardTopicId: 'cue_memorable_journey',
      subTopic: 'Public transport vs private vehicles',
      question: 'Why do some individuals continue to use private cars even in cities with extensive public transportation networks?',
      promptType: 'reason',
    },
    {
      id: 'p3_jrn_02',
      part: 3,
      cueCardTopicId: 'cue_memorable_journey',
      subTopic: 'Government investment',
      question: 'Should governments prioritize funding high-speed intercity trains or improving local suburban bus and commuter routes?',
      promptType: 'evaluation',
    },
    {
      id: 'p3_jrn_03',
      part: 3,
      cueCardTopicId: 'cue_memorable_journey',
      subTopic: 'Environmental impacts',
      question: 'How effective are eco-friendly transportation initiatives, such as electric buses, in reducing urban pollution?',
      promptType: 'opinion',
    },
    {
      id: 'p3_jrn_04',
      part: 3,
      cueCardTopicId: 'cue_memorable_journey',
      subTopic: 'Future mobility',
      question: 'In what ways might autonomous vehicles reshape transportation systems over the next two decades?',
      promptType: 'prediction',
    },
  ],
  cue_admired_person: [
    {
      id: 'p3_adm_01',
      part: 3,
      cueCardTopicId: 'cue_admired_person',
      subTopic: 'Role models in modern society',
      question: 'What qualities make someone a genuine role model in today’s media-driven society?',
      promptType: 'opinion',
    },
    {
      id: 'p3_adm_02',
      part: 3,
      cueCardTopicId: 'cue_admired_person',
      subTopic: 'Celebrity influence',
      question: 'Do you think celebrities and internet influencers have too much influence on the moral values of young people?',
      promptType: 'evaluation',
    },
    {
      id: 'p3_adm_03',
      part: 3,
      cueCardTopicId: 'cue_admired_person',
      subTopic: 'Intergenerational communication',
      question: 'How can society bridge communication gaps that sometimes emerge between older generations and youth?',
      promptType: 'reason',
    },
    {
      id: 'p3_adm_04',
      part: 3,
      cueCardTopicId: 'cue_admired_person',
      subTopic: 'Leadership qualities',
      question: 'How have expectations of political and community leaders changed compared to fifty years ago?',
      promptType: 'comparison',
    },
  ],
};

// Helper: Select controlled Part 1 questions (e.g. 3 topics, 3 questions each = 9 questions total, 4-5 mins)
export function getPart1Curriculum(workOrStudy: 'work' | 'studies' = 'studies'): { topics: string[]; questions: Part1Question[] } {
  // First topic is always studies or work
  const primaryTopic = workOrStudy;
  // Pick two other distinct familiar topics
  const remaining = PART_1_TOPICS.filter((t) => t !== 'studies' && t !== 'work');
  const shuffled = [...remaining].sort(() => 0.5 - Math.random());
  const selectedTopics = [primaryTopic, shuffled[0], shuffled[1]];

  const questions: Part1Question[] = [];
  selectedTopics.forEach((topic) => {
    const topicQuestions = PART_1_QUESTIONS.filter((q) => q.topic === topic);
    // Take top 3 questions per topic
    questions.push(...topicQuestions.slice(0, 3));
  });

  return { topics: selectedTopics, questions };
}

// Helper: Pick a cue card and its corresponding Part 3 questions
export function getRandomCueCard(): { cueCard: Part2CueCard; part3Questions: Part3Question[] } {
  const cueCard = PART_2_CUE_CARDS[Math.floor(Math.random() * PART_2_CUE_CARDS.length)];
  const part3Questions = PART_3_QUESTIONS[cueCard.id] || PART_3_QUESTIONS['cue_travel_place'];
  return { cueCard, part3Questions };
}
