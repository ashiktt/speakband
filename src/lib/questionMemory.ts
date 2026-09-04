// SpeakBand — Semantic Duplicate Detection & Question Memory Engine

/**
 * Common English stop words to filter out when comparing question intent.
 */
const STOP_WORDS = new Set([
  'a', 'an', 'the', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
  'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'about', 'like',
  'do', 'does', 'did', 'done', 'doing', 'have', 'has', 'had',
  'you', 'your', 'yours', 'i', 'my', 'me', 'we', 'our', 'us', 'they', 'them', 'their',
  'it', 'its', 'he', 'him', 'his', 'she', 'her', 'hers',
  'what', 'which', 'who', 'whom', 'this', 'that', 'these', 'those',
  'can', 'could', 'would', 'should', 'will', 'shall', 'may', 'might', 'must',
  'how', 'when', 'where', 'why', 'often', 'usually', 'normally', 'general',
  'tell', 'describe', 'explain', 'think', 'please', 'currently', 'kind', 'type'
]);

/**
 * Normalizes question string to lowercase tokens with stop words stripped and light stemming.
 */
export function extractKeyTokens(text: string): string[] {
  if (!text) return [];
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter((token) => token.length > 2 && !STOP_WORDS.has(token))
    .map((token) => {
      // Light stemming for common IELTS vocabulary forms
      if (token.endsWith('ies')) return token.slice(0, -3) + 'y';
      if (token.endsWith('ing') && token.length > 5) return token.slice(0, -3);
      if (token.endsWith('ed') && token.length > 4) return token.slice(0, -2);
      if (token.endsWith('s') && !token.endsWith('ss') && token.length > 3) return token.slice(0, -1);
      return token;
    });
}

/**
 * Calculates Jaccard similarity coefficient between two token sets.
 * Returns a value between 0.0 (no overlap) and 1.0 (identical key tokens).
 */
export function calculateTokenSimilarity(textA: string, textB: string): number {
  const tokensA = new Set(extractKeyTokens(textA));
  const tokensB = new Set(extractKeyTokens(textB));

  if (tokensA.size === 0 || tokensB.size === 0) return 0;

  let intersectionCount = 0;
  for (const token of tokensA) {
    if (tokensB.has(token)) {
      intersectionCount++;
    }
  }

  const unionCount = tokensA.size + tokensB.size - intersectionCount;
  return unionCount > 0 ? intersectionCount / unionCount : 0;
}

/**
 * Semantic intent cluster synonyms:
 * If questions share roots from the same intent cluster, they are semantically equivalent.
 */
const INTENT_CLUSTERS: Record<string, string[]> = {
  free_time: ['free time', 'spare time', 'leisure', 'weekends', 'relax', 'day off', 'hobbies'],
  hometown: ['hometown', 'where you live', 'where you grew up', 'home town', 'birthplace', 'native town'],
  work_study: ['work', 'job', 'profession', 'career', 'occupation', 'employed', 'employment', 'study', 'studies', 'student', 'major', 'university', 'college', 'do for a living'],
  accommodation: ['house', 'apartment', 'flat', 'accommodation', 'room', 'home building'],
  weather: ['weather', 'climate', 'rain', 'sunny', 'season', 'temperature'],
  food: ['food', 'eating', 'cook', 'cooking', 'restaurant', 'meal', 'dish', 'cuisine'],
  music: ['music', 'songs', 'instrument', 'concert', 'genres'],
  sports: ['sport', 'sports', 'exercise', 'gym', 'workout', 'fitness', 'football', 'play'],
  travel: ['travel', 'travelling', 'trip', 'holiday', 'vacation', 'journey', 'tourism', 'visit places'],
  transport: ['transport', 'transportation', 'bus', 'train', 'subway', 'metro', 'car', 'commute'],
  technology: ['technology', 'device', 'phone', 'computer', 'internet', 'apps', 'digital'],
  reading: ['books', 'read', 'reading', 'novels', 'articles', 'literature'],
  movies: ['movies', 'films', 'cinema', 'watch'],
  shopping: ['shopping', 'buy', 'clothes', 'stores', 'mall'],
  friends: ['friend', 'friends', 'friendship', 'socialize'],
  family: ['family', 'parents', 'relatives', 'siblings'],
};

/**
 * Checks if two questions address the exact same specific sub-intent.
 */
export function hasOverlappingSubIntent(textA: string, textB: string): boolean {
  const cleanA = textA.toLowerCase();
  const cleanB = textB.toLowerCase();

  // Special Check: Classic IELTS "Work vs Study" status question
  const hasWorkA = ['work', 'job', 'occupation', 'profession', 'career', 'employed', 'living'].some((w) => cleanA.includes(w));
  const hasStudyA = ['study', 'studies', 'student', 'course', 'degree', 'university', 'college'].some((w) => cleanA.includes(w));
  const hasWorkB = ['work', 'job', 'occupation', 'profession', 'career', 'employed', 'living'].some((w) => cleanB.includes(w));
  const hasStudyB = ['study', 'studies', 'student', 'course', 'degree', 'university', 'college'].some((w) => cleanB.includes(w));
  if (hasWorkA && hasStudyA && hasWorkB && hasStudyB) {
    return true;
  }

  // Check intent clusters
  for (const [_, keywords] of Object.entries(INTENT_CLUSTERS)) {
    const matchesA = keywords.filter((kw) => cleanA.includes(kw));
    const matchesB = keywords.filter((kw) => cleanB.includes(kw));

    if (matchesA.length > 0 && matchesB.length > 0) {
      // Both match the same broad topic; check specific action/aspect overlap
      const actionAspects = [
        ['enjoy', 'like', 'favorite', 'prefer', 'love'],
        ['often', 'frequency', 'regularly', 'how much time'],
        ['future', 'would you like to', 'plan', 'aspire'],
        ['change', 'different from past', 'childhood', 'younger'],
        ['dislike', 'hate', 'negative', 'drawback', 'problem'],
        ['describe', 'tell me', 'tell', 'what is it like', 'where you live', 'where you grew up'],
        ['work or', 'study or', 'occupation or', 'student or', 'do for a living'],
      ];

      for (const aspectGroup of actionAspects) {
        const aspectA = aspectGroup.some((w) => cleanA.includes(w));
        const aspectB = aspectGroup.some((w) => cleanB.includes(w));
        if (aspectA && aspectB) {
          return true; // Same topic + same question aspect (e.g. "What do you enjoy doing in your free time?" vs "What activities do you like in your leisure time?")
        }
      }
    }
  }

  return false;
}

/**
 * Determines whether candidateQuestion is semantically duplicate or substantially
 * overlapping with any question in askedQuestions.
 */
export function isSemanticDuplicate(
  candidateQuestion: string,
  askedQuestions: string[],
  similarityThreshold: number = 0.50
): boolean {
  if (!candidateQuestion || askedQuestions.length === 0) return false;

  const cleanCandidate = candidateQuestion.trim().toLowerCase().replace(/[?.,!']/g, '');

  for (const asked of askedQuestions) {
    const cleanAsked = asked.trim().toLowerCase().replace(/[?.,!']/g, '');

    // 1. Exact string match
    if (cleanCandidate === cleanAsked) {
      return true;
    }

    // 2. Substring match
    if (cleanCandidate.includes(cleanAsked) || cleanAsked.includes(cleanCandidate)) {
      if (Math.min(cleanCandidate.length, cleanAsked.length) > 15) {
        return true;
      }
    }

    // 3. Jaccard token similarity check
    const tokenSim = calculateTokenSimilarity(candidateQuestion, asked);
    if (tokenSim >= similarityThreshold) {
      return true;
    }

    // 4. Topic + Sub-intent match
    if (hasOverlappingSubIntent(candidateQuestion, asked)) {
      return true;
    }
  }

  return false;
}
