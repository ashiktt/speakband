// SpeakBand — Controlled Question Bank & IELTS Topic Engine

import type { Part1Question, Part2CueCard, Part3Question } from '../types/ielts';
import { isSemanticDuplicate } from './questionMemory.ts';

// PART 1 CONTROLLED TOPICS (All 28 official IELTS speaking topics)
export const PART_1_TOPICS = [
  'studies',
  'work',
  'hometown',
  'home',
  'free_time',
  'daily_routine',
  'hobbies',
  'sports',
  'food',
  'cooking',
  'music',
  'movies',
  'books',
  'technology',
  'social_media',
  'travel',
  'holidays',
  'weather',
  'shopping',
  'transport',
  'friends',
  'family',
  'education',
  'languages',
  'health',
  'environment',
  'future_plans',
  'festivals',
  'childhood',
] as const;

export type Part1TopicName = typeof PART_1_TOPICS[number];

export const FAMILIAR_FIRST_TOPICS: Part1TopicName[] = [
  'studies',
  'work',
  'hometown',
  'home',
  'daily_routine',
  'free_time',
  'hobbies',
  'family',
  'friends',
  'food',
  'technology',
  'transport',
];

export const PART_1_QUESTIONS: Part1Question[] = [
  // 1. Studies
  { id: 'p1_std_01', part: 1, topic: 'studies', difficulty: 'standard', question: 'Do you currently work, or are you a student?' },
  { id: 'p1_std_02', part: 1, topic: 'studies', difficulty: 'standard', question: 'What subject or major are you studying?' },
  { id: 'p1_std_03', part: 1, topic: 'studies', difficulty: 'standard', question: 'What do you enjoy most about your studies?' },
  { id: 'p1_std_04', part: 1, topic: 'studies', difficulty: 'followup', question: 'Do you prefer studying in the morning or in the evening?' },
  { id: 'p1_std_05', part: 1, topic: 'studies', difficulty: 'followup', question: 'Would you like to study any other subject in the future?' },

  // 2. Work
  { id: 'p1_wrk_01', part: 1, topic: 'work', difficulty: 'standard', question: 'What kind of work or profession do you do?' },
  { id: 'p1_wrk_02', part: 1, topic: 'work', difficulty: 'standard', question: 'What are your primary responsibilities during a typical workday?' },
  { id: 'p1_wrk_03', part: 1, topic: 'work', difficulty: 'standard', question: 'What do you find most rewarding about your job?' },
  { id: 'p1_wrk_04', part: 1, topic: 'work', difficulty: 'followup', question: 'Do you get along well with your coworkers and colleagues?' },
  { id: 'p1_wrk_05', part: 1, topic: 'work', difficulty: 'followup', question: 'What career ambitions or professional goals do you have for the future?' },

  // 3. Hometown
  { id: 'p1_htn_01', part: 1, topic: 'hometown', difficulty: 'standard', question: 'Where is your hometown located?' },
  { id: 'p1_htn_02', part: 1, topic: 'hometown', difficulty: 'standard', question: 'What do you like most about living in your hometown?' },
  { id: 'p1_htn_03', part: 1, topic: 'hometown', difficulty: 'standard', question: 'Has your hometown changed noticeably over recent years?' },
  { id: 'p1_htn_04', part: 1, topic: 'hometown', difficulty: 'followup', question: 'Is there anything you would improve about your hometown?' },
  { id: 'p1_htn_05', part: 1, topic: 'hometown', difficulty: 'followup', question: 'Would you recommend your hometown as an attractive destination for visitors?' },

  // 4. Home & Accommodation
  { id: 'p1_hom_01', part: 1, topic: 'home', difficulty: 'standard', question: 'Do you live in a house or an apartment?' },
  { id: 'p1_hom_02', part: 1, topic: 'home', difficulty: 'standard', question: 'Which room in your home do you spend the majority of your time in?' },
  { id: 'p1_hom_03', part: 1, topic: 'home', difficulty: 'standard', question: 'What is your favorite feature or aspect of your living space?' },
  { id: 'p1_hom_04', part: 1, topic: 'home', difficulty: 'followup', question: 'Would you like to make any renovations or decorative changes to your home in the future?' },
  { id: 'p1_hom_05', part: 1, topic: 'home', difficulty: 'followup', question: 'What kind of accommodation would you like to live in eventually?' },

  // 5. Free Time & Leisure
  { id: 'p1_frt_01', part: 1, topic: 'free_time', difficulty: 'standard', question: 'How do you usually spend your weekends or days off?' },
  { id: 'p1_frt_02', part: 1, topic: 'free_time', difficulty: 'standard', question: 'Do you prefer relaxing at home or engaging in outdoor activities with friends?' },
  { id: 'p1_frt_03', part: 1, topic: 'free_time', difficulty: 'standard', question: 'Do you feel you have adequate leisure time in your current schedule?' },
  { id: 'p1_frt_04', part: 1, topic: 'free_time', difficulty: 'followup', question: 'What new leisure activity or hobby would you like to explore if you had more time?' },
  { id: 'p1_frt_05', part: 1, topic: 'free_time', difficulty: 'followup', question: 'Do you prefer spending your free time alone or with other people?' },

  // 6. Daily Routine
  { id: 'p1_rtn_01', part: 1, topic: 'daily_routine', difficulty: 'standard', question: 'What is your usual morning routine before starting your day?' },
  { id: 'p1_rtn_02', part: 1, topic: 'daily_routine', difficulty: 'standard', question: 'What part of the day do you feel most productive and energized?' },
  { id: 'p1_rtn_03', part: 1, topic: 'daily_routine', difficulty: 'standard', question: 'Has your daily routine changed much compared to when you were younger?' },
  { id: 'p1_rtn_04', part: 1, topic: 'daily_routine', difficulty: 'followup', question: 'Do you prefer having a structured daily routine or spontaneous days?' },
  { id: 'p1_rtn_05', part: 1, topic: 'daily_routine', difficulty: 'followup', question: 'Is there anything you would like to alter about your daily schedule?' },

  // 7. Technology
  { id: 'p1_tch_01', part: 1, topic: 'technology', difficulty: 'standard', question: 'What digital device do you rely on most heavily in your everyday life?' },
  { id: 'p1_tch_02', part: 1, topic: 'technology', difficulty: 'standard', question: 'How has the internet influenced your communication with friends and family?' },
  { id: 'p1_tch_03', part: 1, topic: 'technology', difficulty: 'standard', question: 'Do you prefer reading physical books or reading on digital screens?' },
  { id: 'p1_tch_04', part: 1, topic: 'technology', difficulty: 'followup', question: 'Do you find it straightforward or challenging to learn how to use new technological devices?' },
  { id: 'p1_tch_05', part: 1, topic: 'technology', difficulty: 'followup', question: 'Could you manage your daily responsibilities for a whole week without your smartphone?' },

  // 8. Food & Cuisine
  { id: 'p1_fod_01', part: 1, topic: 'food', difficulty: 'standard', question: 'What is your favorite type of traditional or international cuisine?' },
  { id: 'p1_fod_02', part: 1, topic: 'food', difficulty: 'standard', question: 'Do you prefer preparing meals at home or dining in restaurants?' },
  { id: 'p1_fod_03', part: 1, topic: 'food', difficulty: 'standard', question: 'Has your taste in food evolved since you were a child?' },
  { id: 'p1_fod_04', part: 1, topic: 'food', difficulty: 'followup', question: 'What meal did you most enjoy eating recently?' },
  { id: 'p1_fod_05', part: 1, topic: 'food', difficulty: 'followup', question: 'Is it customary in your country to eat meals together with your family?' },

  // 9. Travel & Destinations
  { id: 'p1_trv_01', part: 1, topic: 'travel', difficulty: 'standard', question: 'Do you enjoy travelling to unfamiliar regions or cities?' },
  { id: 'p1_trv_02', part: 1, topic: 'travel', difficulty: 'standard', question: 'What has been the most memorable destination you have ever visited?' },
  { id: 'p1_trv_03', part: 1, topic: 'travel', difficulty: 'standard', question: 'Do you prefer travelling independently or as part of a tour group?' },
  { id: 'p1_trv_04', part: 1, topic: 'travel', difficulty: 'followup', question: 'Which foreign country would you most like to explore in the future?' },
  { id: 'p1_trv_05', part: 1, topic: 'travel', difficulty: 'followup', question: 'Do you prefer relaxing beach holidays or active city-exploration trips?' },

  // 10. Music
  { id: 'p1_mus_01', part: 1, topic: 'music', difficulty: 'standard', question: 'What genres or musical styles do you most enjoy listening to?' },
  { id: 'p1_mus_02', part: 1, topic: 'music', difficulty: 'standard', question: 'At what moments of the day do you normally listen to music?' },
  { id: 'p1_mus_03', part: 1, topic: 'music', difficulty: 'standard', question: 'Can you play any musical instrument, or would you like to learn one?' },
  { id: 'p1_mus_04', part: 1, topic: 'music', difficulty: 'followup', question: 'Have you ever attended a live music concert or music festival?' },
  { id: 'p1_mus_05', part: 1, topic: 'music', difficulty: 'followup', question: 'Do you think music preferences change as people grow older?' },

  // 11. Weather & Seasons
  { id: 'p1_wth_01', part: 1, topic: 'weather', difficulty: 'standard', question: 'What kind of weather or season do you feel most comfortable in?' },
  { id: 'p1_wth_02', part: 1, topic: 'weather', difficulty: 'standard', question: 'Does rainy or cold weather ever affect your emotional state or productivity?' },
  { id: 'p1_wth_03', part: 1, topic: 'weather', difficulty: 'standard', question: 'Do you regularly check the weather forecast before heading out?' },
  { id: 'p1_wth_04', part: 1, topic: 'weather', difficulty: 'followup', question: 'Has the climate in your home region changed noticeably in recent years?' },
  { id: 'p1_wth_05', part: 1, topic: 'weather', difficulty: 'followup', question: 'What activities do you typically engage in when it is sunny outside?' },

  // 12. Transport & Commuting
  { id: 'p1_trn_01', part: 1, topic: 'transport', difficulty: 'standard', question: 'What form of transportation do you use most frequently for commuting?' },
  { id: 'p1_trn_02', part: 1, topic: 'transport', difficulty: 'standard', question: 'Do you prefer travelling by public transit or by private vehicle?' },
  { id: 'p1_trn_03', part: 1, topic: 'transport', difficulty: 'standard', question: 'Are public transit services reliable and efficient in your city?' },
  { id: 'p1_trn_04', part: 1, topic: 'transport', difficulty: 'followup', question: 'How could public transport in your local area be upgraded or improved?' },
  { id: 'p1_trn_05', part: 1, topic: 'transport', difficulty: 'followup', question: 'Do you enjoy long journeys by train or bus?' },

  // 13. Sports & Exercise
  { id: 'p1_spt_01', part: 1, topic: 'sports', difficulty: 'standard', question: 'What sports or physical activities do you like playing or watching?' },
  { id: 'p1_spt_02', part: 1, topic: 'sports', difficulty: 'standard', question: 'Did you participate in sports when you were at school?' },
  { id: 'p1_spt_03', part: 1, topic: 'sports', difficulty: 'standard', question: 'Do you believe staying physically active is important for mental health?' },
  { id: 'p1_spt_04', part: 1, topic: 'sports', difficulty: 'followup', question: 'What sport would you like to try in the future that you have never played?' },
  { id: 'p1_spt_05', part: 1, topic: 'sports', difficulty: 'followup', question: 'Do you prefer team sports or individual physical exercise?' },

  // 14. Books & Reading
  { id: 'p1_bok_01', part: 1, topic: 'books', difficulty: 'standard', question: 'Do you enjoy reading books in your spare time?' },
  { id: 'p1_bok_02', part: 1, topic: 'books', difficulty: 'standard', question: 'What genre of books or literature do you find most captivating?' },
  { id: 'p1_bok_03', part: 1, topic: 'books', difficulty: 'standard', question: 'Do you prefer reading physical printed books or digital e-books?' },
  { id: 'p1_bok_04', part: 1, topic: 'books', difficulty: 'followup', question: 'Can you remember a book that made a significant impression on you?' },
  { id: 'p1_bok_05', part: 1, topic: 'books', difficulty: 'followup', question: 'Do people in your country read books as often as they did in the past?' },

  // 15. Friends & Socializing
  { id: 'p1_frd_01', part: 1, topic: 'friends', difficulty: 'standard', question: 'How do you usually keep in touch with your close friends?' },
  { id: 'p1_frd_02', part: 1, topic: 'friends', difficulty: 'standard', question: 'What qualities do you value most in a close friend?' },
  { id: 'p1_frd_03', part: 1, topic: 'friends', difficulty: 'standard', question: 'Do you prefer having a wide circle of acquaintances or a few intimate friends?' },
  { id: 'p1_frd_04', part: 1, topic: 'friends', difficulty: 'followup', question: 'What activities do you most enjoy doing when you hang out with friends?' },
  { id: 'p1_frd_05', part: 1, topic: 'friends', difficulty: 'followup', question: 'Is it easy to maintain childhood friendships as an adult?' },

  // 16. Shopping & Consumer Habits
  { id: 'p1_shp_01', part: 1, topic: 'shopping', difficulty: 'standard', question: 'Do you enjoy shopping for clothes or personal items?' },
  { id: 'p1_shp_02', part: 1, topic: 'shopping', difficulty: 'standard', question: 'Do you prefer shopping online or browsing inside physical retail stores?' },
  { id: 'p1_shp_03', part: 1, topic: 'shopping', difficulty: 'standard', question: 'What was the last substantial purchase you made?' },
  { id: 'p1_shp_04', part: 1, topic: 'shopping', difficulty: 'followup', question: 'Do you compare prices carefully before buying something expensive?' },
  { id: 'p1_shp_05', part: 1, topic: 'shopping', difficulty: 'followup', question: 'Are large shopping malls popular recreational destinations in your city?' },

  // 17. Family & Home Life
  { id: 'p1_fam_01', part: 1, topic: 'family', difficulty: 'standard', question: 'How much time do you spend with your family members each week?' },
  { id: 'p1_fam_02', part: 1, topic: 'family', difficulty: 'standard', question: 'What activities do you most enjoy doing together as a family?' },
  { id: 'p1_fam_03', part: 1, topic: 'family', difficulty: 'standard', question: 'Whom in your family do you consider yourself closest to?' },
  { id: 'p1_fam_04', part: 1, topic: 'family', difficulty: 'followup', question: 'Are family dinners an important tradition in your household?' },
  { id: 'p1_fam_05', part: 1, topic: 'family', difficulty: 'followup', question: 'In what ways has family life changed in your country compared to past generations?' },

  // 18. Cooking & Cuisine
  { id: 'p1_ckg_01', part: 1, topic: 'cooking', difficulty: 'standard', question: 'Do you know how to cook, or would you like to learn more recipes?' },
  { id: 'p1_ckg_02', part: 1, topic: 'cooking', difficulty: 'standard', question: 'Who does the majority of the cooking in your home?' },
  { id: 'p1_ckg_03', part: 1, topic: 'cooking', difficulty: 'standard', question: 'What is your signature dish or favorite meal to prepare?' },
  { id: 'p1_ckg_04', part: 1, topic: 'cooking', difficulty: 'followup', question: 'Did you ever learn cooking when you were at school or from parents?' },
  { id: 'p1_ckg_05', part: 1, topic: 'cooking', difficulty: 'followup', question: 'Do you think children should be taught fundamental cooking skills at school?' },

  // 19. Hobbies & Pastimes
  { id: 'p1_hby_01', part: 1, topic: 'hobbies', difficulty: 'standard', question: 'What particular hobbies or pastimes are you currently passionate about?' },
  { id: 'p1_hby_02', part: 1, topic: 'hobbies', difficulty: 'standard', question: 'How long have you been pursuing this hobby?' },
  { id: 'p1_hby_03', part: 1, topic: 'hobbies', difficulty: 'standard', question: 'Did you have distinct hobbies when you were a child?' },
  { id: 'p1_hby_04', part: 1, topic: 'hobbies', difficulty: 'followup', question: 'Is your hobby popular among other people your age?' },
  { id: 'p1_hby_05', part: 1, topic: 'hobbies', difficulty: 'followup', question: 'What is a new pastime or creative activity you would love to take up?' },

  // 20. Movies & Cinema
  { id: 'p1_mov_01', part: 1, topic: 'movies', difficulty: 'standard', question: 'What genres of movies or cinema do you enjoy watching most?' },
  { id: 'p1_mov_02', part: 1, topic: 'movies', difficulty: 'standard', question: 'Do you prefer watching films at a cinema theatre or at home on a streaming service?' },
  { id: 'p1_mov_03', part: 1, topic: 'movies', difficulty: 'standard', question: 'How frequently do you watch movies or series during the week?' },
  { id: 'p1_mov_04', part: 1, topic: 'movies', difficulty: 'followup', question: 'Can you remember a film that left a memorable emotional impression on you?' },
  { id: 'p1_mov_05', part: 1, topic: 'movies', difficulty: 'followup', question: 'Do you prefer domestic films produced in your country or international films?' },

  // 21. Social Media & Digital Communication
  { id: 'p1_smd_01', part: 1, topic: 'social_media', difficulty: 'standard', question: 'What social media applications or platforms do you use on a daily basis?' },
  { id: 'p1_smd_02', part: 1, topic: 'social_media', difficulty: 'standard', question: 'How much time do you estimate you spend browsing social media each day?' },
  { id: 'p1_smd_03', part: 1, topic: 'social_media', difficulty: 'standard', question: 'Do you use social media primarily to communicate with friends or consume news and videos?' },
  { id: 'p1_smd_04', part: 1, topic: 'social_media', difficulty: 'followup', question: 'Have you ever taken a deliberate break or detox from social media platforms?' },
  { id: 'p1_smd_05', part: 1, topic: 'social_media', difficulty: 'followup', question: 'Do you believe social media has a mostly positive or negative effect on interpersonal relationships?' },

  // 22. Holidays & Vacations
  { id: 'p1_hol_01', part: 1, topic: 'holidays', difficulty: 'standard', question: 'What is your favorite public holiday or national celebration of the year?' },
  { id: 'p1_hol_02', part: 1, topic: 'holidays', difficulty: 'standard', question: 'How do people in your country typically celebrate this holiday?' },
  { id: 'p1_hol_03', part: 1, topic: 'holidays', difficulty: 'standard', question: 'Do you prefer taking a series of short weekend getaways or one extended annual holiday?' },
  { id: 'p1_hol_04', part: 1, topic: 'holidays', difficulty: 'followup', question: 'What did you do during your most recent holiday or vacation?' },
  { id: 'p1_hol_05', part: 1, topic: 'holidays', difficulty: 'followup', question: 'Where would you most like to travel for your next upcoming vacation?' },

  // 23. Education & Learning
  { id: 'p1_edu_01', part: 1, topic: 'education', difficulty: 'standard', question: 'What did you enjoy most about attending primary or secondary school?' },
  { id: 'p1_edu_02', part: 1, topic: 'education', difficulty: 'standard', question: 'Did you have a favorite teacher who inspired your academic interests?' },
  { id: 'p1_edu_03', part: 1, topic: 'education', difficulty: 'standard', question: 'Do you prefer studying theoretical academic concepts or practical applied skills?' },
  { id: 'p1_edu_04', part: 1, topic: 'education', difficulty: 'followup', question: 'How has digital technology changed classrooms and schools in your country?' },
  { id: 'p1_edu_05', part: 1, topic: 'education', difficulty: 'followup', question: 'Would you consider pursuing further education or an advanced postgraduate degree?' },

  // 24. Languages & Bilingualism
  { id: 'p1_lng_01', part: 1, topic: 'languages', difficulty: 'standard', question: 'How many languages can you speak or understand?' },
  { id: 'p1_lng_02', part: 1, topic: 'languages', difficulty: 'standard', question: 'How long have you been studying and practicing English?' },
  { id: 'p1_lng_03', part: 1, topic: 'languages', difficulty: 'standard', question: 'What do you find to be the most challenging aspect of learning a foreign language?' },
  { id: 'p1_lng_04', part: 1, topic: 'languages', difficulty: 'followup', question: 'Which additional language would you be interested in learning in the future?' },
  { id: 'p1_lng_05', part: 1, topic: 'languages', difficulty: 'followup', question: 'Do you think it is becoming easier or harder to learn languages with modern AI tools?' },

  // 25. Health & Well-being
  { id: 'p1_hlt_01', part: 1, topic: 'health', difficulty: 'standard', question: 'What habits or routines do you follow to maintain your physical health?' },
  { id: 'p1_hlt_02', part: 1, topic: 'health', difficulty: 'standard', question: 'Do you pay careful attention to maintaining a nutritious and balanced diet?' },
  { id: 'p1_hlt_03', part: 1, topic: 'health', difficulty: 'standard', question: 'How many hours of sleep do you typically get each night?' },
  { id: 'p1_hlt_04', part: 1, topic: 'health', difficulty: 'followup', question: 'What activities do you find most effective for relieving stress after a busy day?' },
  { id: 'p1_hlt_05', part: 1, topic: 'health', difficulty: 'followup', question: 'Is healthy organic food easily accessible and affordable in your area?' },

  // 26. Environment & Nature
  { id: 'p1_env_01', part: 1, topic: 'environment', difficulty: 'standard', question: 'Do you regularly recycle waste materials like plastic, glass, and paper at home?' },
  { id: 'p1_env_02', part: 1, topic: 'environment', difficulty: 'standard', question: 'What environmental issues are most concerning in your local region or city?' },
  { id: 'p1_env_03', part: 1, topic: 'environment', difficulty: 'standard', question: 'What daily actions do you take to conserve energy or reduce water usage?' },
  { id: 'p1_env_04', part: 1, topic: 'environment', difficulty: 'followup', question: 'Did you learn about environmental conservation and ecology when you were at school?' },
  { id: 'p1_env_05', part: 1, topic: 'environment', difficulty: 'followup', question: 'Do you think individual efforts can genuinely make a substantial difference to global climate health?' },

  // 27. Future Plans & Aspirations
  { id: 'p1_fut_01', part: 1, topic: 'future_plans', difficulty: 'standard', question: 'What are your main personal or professional aspirations for the next few years?' },
  { id: 'p1_fut_02', part: 1, topic: 'future_plans', difficulty: 'standard', question: 'Do you prefer planning your future meticulously or taking opportunities spontaneously?' },
  { id: 'p1_fut_03', part: 1, topic: 'future_plans', difficulty: 'standard', question: 'Do you see yourself living in the same city five years from now?' },
  { id: 'p1_fut_04', part: 1, topic: 'future_plans', difficulty: 'followup', question: 'What career milestone would you be most proud to accomplish?' },
  { id: 'p1_fut_05', part: 1, topic: 'future_plans', difficulty: 'followup', question: 'How do you think your lifestyle will differ when you are ten years older?' },

  // 28. Festivals & Celebrations
  { id: 'p1_fst_01', part: 1, topic: 'festivals', difficulty: 'standard', question: 'What is the most widely celebrated festival or traditional event in your country?' },
  { id: 'p1_fst_02', part: 1, topic: 'festivals', difficulty: 'standard', question: 'What special foods, costumes, or rituals are associated with this festival?' },
  { id: 'p1_fst_03', part: 1, topic: 'festivals', difficulty: 'standard', question: 'Do you enjoy participating in large crowded festivals, or do you prefer quiet gatherings?' },
  { id: 'p1_fst_04', part: 1, topic: 'festivals', difficulty: 'followup', question: 'Have you ever experienced a festival celebrated in another culture or foreign country?' },
  { id: 'p1_fst_05', part: 1, topic: 'festivals', difficulty: 'followup', question: 'Why are traditional cultural festivals valuable for preserving national identity?' },

  // 29. Childhood & Memories
  { id: 'p1_cld_01', part: 1, topic: 'childhood', difficulty: 'standard', question: 'Where did you spend most of your early childhood?' },
  { id: 'p1_cld_02', part: 1, topic: 'childhood', difficulty: 'standard', question: 'What games or recreational activities did you enjoy playing most as a child?' },
  { id: 'p1_cld_03', part: 1, topic: 'childhood', difficulty: 'standard', question: 'Can you recall a memorable childhood friend with whom you spent significant time?' },
  { id: 'p1_cld_04', part: 1, topic: 'childhood', difficulty: 'followup', question: 'What was your favorite childhood book, cartoon, or story?' },
  { id: 'p1_cld_05', part: 1, topic: 'childhood', difficulty: 'followup', question: 'In what ways was growing up in your childhood different from how children grow up today?' },
];

// PART 2 AUTHENTIC CUE CARDS (Expanded to 10 authentic Cambridge IELTS topics)
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
  {
    id: 'cue_useful_object',
    topic: 'Technology & Possessions',
    cuePrompt: 'Describe an electronic device or piece of equipment you find indispensable.',
    bulletPoints: [
      'what the item is',
      'how long you have owned it',
      'what you primarily use it for',
      'and explain why it is so important in your day-to-day life.',
    ],
    closingQuestions: [
      'Do other people you know use similar devices?',
      'How would your life be different without this item?',
    ],
  },
  {
    id: 'cue_interesting_event',
    topic: 'Events & Celebrations',
    cuePrompt: 'Describe an exciting or meaningful public event or festival you attended.',
    bulletPoints: [
      'what event it was and where it took place',
      'who attended it with you',
      'what activities took place during the event',
      'and explain why this event was particularly memorable to you.',
    ],
    closingQuestions: [
      'Are festivals like this celebrated every year in your country?',
      'Do many international visitors attend this event?',
    ],
  },
  {
    id: 'cue_favorite_book_movie',
    topic: 'Arts & Media',
    cuePrompt: 'Describe a book or movie that had a profound effect on your perspective.',
    bulletPoints: [
      'what the book or movie was',
      'what the central story or message was about',
      'when you first read or watched it',
      'and explain why it had such a powerful influence on your thinking.',
    ],
    closingQuestions: [
      'Would you recommend this title to other people?',
      'Have you re-read or re-watched it since then?',
    ],
  },
  {
    id: 'cue_challenging_goal',
    topic: 'Goals & Ambitions',
    cuePrompt: 'Describe an ambitious long-term goal you achieved through persistent effort.',
    bulletPoints: [
      'what the goal was',
      'what steps you took to accomplish it',
      'what obstacles you encountered along the way',
      'and explain how you felt when you finally reached this objective.',
    ],
    closingQuestions: [
      'Did anyone assist you while striving toward this goal?',
      'Has achieving this goal motivated you to pursue new ambitions?',
    ],
  },
  {
    id: 'cue_natural_place',
    topic: 'Environment & Nature',
    cuePrompt: 'Describe a scenic natural area or park you enjoy visiting to unwind.',
    bulletPoints: [
      'where this natural area is located',
      'how often you go there',
      'what the environment and landscape look like',
      'and explain why visiting this place makes you feel calm and refreshed.',
    ],
    closingQuestions: [
      'Is this place popular among local residents?',
      'Do you think urban areas need more green natural spaces?',
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
  cue_useful_object: [
    {
      id: 'p3_obj_01',
      part: 3,
      cueCardTopicId: 'cue_useful_object',
      subTopic: 'Technology dependence',
      question: 'Are people today becoming excessively dependent on automated and smart digital gadgets?',
      promptType: 'opinion',
    },
    {
      id: 'p3_obj_02',
      part: 3,
      cueCardTopicId: 'cue_useful_object',
      subTopic: 'Consumerism and durability',
      question: 'Why do modern electronic appliances often have shorter lifespans than machines manufactured decades ago?',
      promptType: 'reason',
    },
    {
      id: 'p3_obj_03',
      part: 3,
      cueCardTopicId: 'cue_useful_object',
      subTopic: 'Technological inequality',
      question: 'Does the rapid pace of gadget innovation create an unfair divide between wealthy and developing communities?',
      promptType: 'evaluation',
    },
    {
      id: 'p3_obj_04',
      part: 3,
      cueCardTopicId: 'cue_useful_object',
      subTopic: 'Future inventions',
      question: 'What household invention or gadget do you foresee becoming ubiquitous in homes over the next thirty years?',
      promptType: 'prediction',
    },
  ],
  cue_interesting_event: [
    {
      id: 'p3_evn_01',
      part: 3,
      cueCardTopicId: 'cue_interesting_event',
      subTopic: 'Community cohesion',
      question: 'In what ways do public festivals and cultural events strengthen solidarity within local communities?',
      promptType: 'reason',
    },
    {
      id: 'p3_evn_02',
      part: 3,
      cueCardTopicId: 'cue_interesting_event',
      subTopic: 'Commercialization of celebrations',
      question: 'Have traditional holidays and cultural celebrations become excessively commercialized in modern times?',
      promptType: 'opinion',
    },
    {
      id: 'p3_evn_03',
      part: 3,
      cueCardTopicId: 'cue_interesting_event',
      subTopic: 'Hosting global events',
      question: 'Do the economic advantages of hosting mega-events like the Olympic Games outweigh the immense public costs?',
      promptType: 'comparison',
    },
    {
      id: 'p3_evn_04',
      part: 3,
      cueCardTopicId: 'cue_interesting_event',
      subTopic: 'Preserving national heritage',
      question: 'How can governments ensure that smaller regional cultural celebrations are not forgotten by future generations?',
      promptType: 'evaluation',
    },
  ],
  cue_favorite_book_movie: [
    {
      id: 'p3_med_01',
      part: 3,
      cueCardTopicId: 'cue_favorite_book_movie',
      subTopic: 'Literature vs cinema',
      question: 'Why do some people argue that reading a novel offers a richer psychological experience than watching a film adaptation?',
      promptType: 'comparison',
    },
    {
      id: 'p3_med_02',
      part: 3,
      cueCardTopicId: 'cue_favorite_book_movie',
      subTopic: 'Educational value of art',
      question: 'Should the arts and humanities receive equal government subsidy compared to STEM subjects in national school curriculums?',
      promptType: 'evaluation',
    },
    {
      id: 'p3_med_03',
      part: 3,
      cueCardTopicId: 'cue_favorite_book_movie',
      subTopic: 'Streaming services impact',
      question: 'How has the emergence of streaming platforms affected the quality and diversity of cinematic storytelling?',
      promptType: 'opinion',
    },
    {
      id: 'p3_med_04',
      part: 3,
      cueCardTopicId: 'cue_favorite_book_movie',
      subTopic: 'Future of reading',
      question: 'Do you anticipate that short-form digital content will eventually replace extended long-form reading for most people?',
      promptType: 'prediction',
    },
  ],
  cue_challenging_goal: [
    {
      id: 'p3_gol_01',
      part: 3,
      cueCardTopicId: 'cue_challenging_goal',
      subTopic: 'Motivation and ambition',
      question: 'Why are some individuals intensely driven to achieve ambitious goals while others are content with a simpler lifestyle?',
      promptType: 'comparison',
    },
    {
      id: 'p3_gol_02',
      part: 3,
      cueCardTopicId: 'cue_challenging_goal',
      subTopic: 'Defining success',
      question: 'How has the societal definition of personal success changed over recent decades?',
      promptType: 'reason',
    },
    {
      id: 'p3_gol_03',
      part: 3,
      cueCardTopicId: 'cue_challenging_goal',
      subTopic: 'Praise and resilience',
      question: 'Is it healthier to praise children for their innate talents or for the effort and persistence they demonstrate?',
      promptType: 'evaluation',
    },
    {
      id: 'p3_gol_04',
      part: 3,
      cueCardTopicId: 'cue_challenging_goal',
      subTopic: 'Work-life balance',
      question: 'Can individuals pursue highly demanding professional ambitions without sacrificing their family relationships and personal health?',
      promptType: 'opinion',
    },
  ],
  cue_natural_place: [
    {
      id: 'p3_nat_01',
      part: 3,
      cueCardTopicId: 'cue_natural_place',
      subTopic: 'Urbanization and green spaces',
      question: 'Why is it critical for urban municipal planners to incorporate parks and green spaces into city infrastructure?',
      promptType: 'reason',
    },
    {
      id: 'p3_nat_02',
      part: 3,
      cueCardTopicId: 'cue_natural_place',
      subTopic: 'Environmental stewardship',
      question: 'Do you believe young people today have a greater sense of environmental responsibility than previous generations did?',
      promptType: 'comparison',
    },
    {
      id: 'p3_nat_03',
      part: 3,
      cueCardTopicId: 'cue_natural_place',
      subTopic: 'Nature tourism vs conservation',
      question: 'How can wildlife sanctuaries balance welcoming ecotourists with the imperative to protect delicate ecosystems from human harm?',
      promptType: 'evaluation',
    },
    {
      id: 'p3_nat_04',
      part: 3,
      cueCardTopicId: 'cue_natural_place',
      subTopic: 'Future urban environment',
      question: 'What architectural innovations might allow future mega-cities to coexist harmoniously with the natural world?',
      promptType: 'prediction',
    },
  ],
};

/**
 * Controlled Part 1 Examination Curriculum Generator.
 * Respects official IELTS test structure:
 * - Cluster 1 (3 questions): Familiar topic (Hometown, Home, Studies, Work, Free Time, Daily Routine, etc.), rotating across sessions.
 * - Cluster 2 (3 questions): Second distinct familiar topic.
 * - Avoids recently asked questions and recently used topics across test sessions.
 * - Varies starting question so session after session is NEVER identical.
 */
export function getPart1TestCurriculum(options: {
  recentlyUsedQuestionIds?: string[];
  recentlyUsedTopics?: string[];
  preferredFirstTopic?: Part1TopicName;
} = {}): { topics: string[]; questions: Part1Question[] } {
  const {
    recentlyUsedQuestionIds = [],
    recentlyUsedTopics = [],
    preferredFirstTopic,
  } = options;

  // 1. Choose First Topic: Pick from familiar first topics, prioritizing ones NOT recently used
  let firstTopic: Part1TopicName;
  if (preferredFirstTopic && PART_1_TOPICS.includes(preferredFirstTopic)) {
    firstTopic = preferredFirstTopic;
  } else {
    const eligibleFirstTopics = FAMILIAR_FIRST_TOPICS.filter(
      (t) => !recentlyUsedTopics.includes(t)
    );
    const pool = eligibleFirstTopics.length > 0 ? eligibleFirstTopics : FAMILIAR_FIRST_TOPICS;
    firstTopic = pool[Math.floor(Math.random() * pool.length)];
  }

  // 2. Choose Second Topic: Pick from all remaining topics, prioritizing ones NOT recently used
  const remainingTopics = PART_1_TOPICS.filter((t) => t !== firstTopic);
  const eligibleSecondTopics = remainingTopics.filter((t) => !recentlyUsedTopics.includes(t));
  const secondPool = eligibleSecondTopics.length > 0 ? eligibleSecondTopics : remainingTopics;
  const secondTopic = secondPool[Math.floor(Math.random() * secondPool.length)];

  const selectedTopics = [firstTopic, secondTopic];
  const selectedQuestions: Part1Question[] = [];

  for (const topic of selectedTopics) {
    const topicPool = PART_1_QUESTIONS.filter((q) => q.topic === topic);

    // Filter out questions that were recently asked
    const unusedQuestions = topicPool.filter(
      (q) => !recentlyUsedQuestionIds.includes(q.id)
    );

    const available = unusedQuestions.length >= 3 ? unusedQuestions : topicPool;

    // Shuffle and pick 3 distinct questions
    const shuffled = [...available].sort(() => 0.5 - Math.random());
    const picked = shuffled.slice(0, 3);

    // Defensive fallback: ensure exactly 3 questions are selected
    if (picked.length < 3) {
      for (const candidate of topicPool) {
        if (!picked.some((p) => p.id === candidate.id)) {
          picked.push(candidate);
          if (picked.length === 3) break;
        }
      }
    }

    selectedQuestions.push(...picked);
  }

  return {
    topics: selectedTopics,
    questions: selectedQuestions,
  };
}

/**
 * Legacy compatibility wrapper for getPart1Curriculum.
 */
export function getPart1Curriculum(workOrStudy: 'work' | 'studies' = 'studies'): { topics: string[]; questions: Part1Question[] } {
  return getPart1TestCurriculum({ preferredFirstTopic: workOrStudy });
}

/**
 * Controlled Part 2 & Part 3 Examination Curriculum Generator.
 * Selects a cue card avoiding recently tested cue card IDs, and returns matching Part 3 questions.
 */
export function getPart2AndPart3Curriculum(options: {
  recentlyUsedCueCardIds?: string[];
} = {}): { cueCard: Part2CueCard; part3Questions: Part3Question[] } {
  const { recentlyUsedCueCardIds = [] } = options;

  // Filter out recently used cue cards
  const eligibleCueCards = PART_2_CUE_CARDS.filter(
    (c) => !recentlyUsedCueCardIds.includes(c.id)
  );

  const pool = eligibleCueCards.length > 0 ? eligibleCueCards : PART_2_CUE_CARDS;
  const cueCard = pool[Math.floor(Math.random() * pool.length)];
  const part3Questions = PART_3_QUESTIONS[cueCard.id] || PART_3_QUESTIONS['cue_travel_place'];

  return { cueCard, part3Questions };
}

/**
 * Helper: Legacy pick cue card wrapper
 */
export function getRandomCueCard(): { cueCard: Part2CueCard; part3Questions: Part3Question[] } {
  return getPart2AndPart3Curriculum();
}

/**
 * Selects an unused, non-duplicate question for Practice Mode fallback or turn progression.
 */
export function getUnusedPracticeQuestion(
  topic: string,
  askedQuestions: string[] = []
): Part1Question {
  const cleanTopic = topic.toLowerCase().replace(/[\s&/]/g, '_');
  const topicPool = PART_1_QUESTIONS.filter(
    (q) => q.topic === cleanTopic || q.topic.includes(cleanTopic) || cleanTopic.includes(q.topic)
  );

  const fallbackPool = topicPool.length > 0 ? topicPool : PART_1_QUESTIONS;

  for (const candidate of fallbackPool) {
    if (!askedQuestions.includes(candidate.question) && !isSemanticDuplicate(candidate.question, askedQuestions)) {
      return candidate;
    }
  }

  // If all in topic are used, pick from anywhere
  for (const candidate of PART_1_QUESTIONS) {
    if (!askedQuestions.includes(candidate.question) && !isSemanticDuplicate(candidate.question, askedQuestions)) {
      return candidate;
    }
  }

  return fallbackPool[Math.floor(Math.random() * fallbackPool.length)];
}
