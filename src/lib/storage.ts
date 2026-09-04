// SpeakBand — Resilient Dual-Layer Persistence Engine (Supabase + LocalRepository)

import { IeltsEvaluationResult, TestHistorySummary, UserProfile } from '@/types/ielts';
import { getSupabaseClient, isSupabaseConfigured } from './supabase';

const TESTS_STORAGE_KEY = 'speakband_saved_evaluations';
const PROFILE_STORAGE_KEY = 'speakband_active_profile';

export const StorageService = {
  /**
   * Save a completed IELTS test evaluation result
   */
  async saveTestResult(result: IeltsEvaluationResult, userId?: string): Promise<void> {
    // 1. Immediately persist to LocalStorage for zero-latency, offline resilience
    if (typeof window !== 'undefined') {
      try {
        const existing = StorageService.getLocalTests();
        const updated = [result, ...existing.filter((t) => t.id !== result.id)];
        localStorage.setItem(TESTS_STORAGE_KEY, JSON.stringify(updated));
      } catch (err) {
        console.warn('[SpeakBand Storage] LocalStorage save error:', err);
      }
    }

    // 2. Sync to Supabase Cloud Database if configured and connected
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const user = userId || (await supabase.auth.getUser()).data.user?.id;
        if (user) {
          const { error } = await supabase.from('ielts_tests').upsert({
            id: result.id,
            user_id: user,
            overall_band: result.overallBand,
            fluency_band: result.fluencyBand,
            lexical_band: result.lexicalBand,
            grammar_band: result.grammarBand,
            pronunciation_band: result.pronunciationBand,
            test_duration_seconds: result.testDurationSeconds,
            weakest_skill: result.weakestArea,
            strongest_skill: result.strongestArea,
            summary: result.performanceSummary,
            evaluation_data: result,
          });

          if (error) {
            console.warn('[SpeakBand Storage] Supabase test sync notice:', error.message);
          }
        }
      } catch (cloudErr) {
        console.warn('[SpeakBand Storage] Cloud sync deferred:', cloudErr);
      }
    }
  },

  /**
   * Get single test result by ID
   */
  async getTestResult(id: string): Promise<IeltsEvaluationResult | null> {
    // Check local storage first
    if (typeof window !== 'undefined') {
      const local = StorageService.getLocalTests().find((t) => t.id === id);
      if (local) return local;
    }

    // Check Supabase
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('ielts_tests')
          .select('evaluation_data')
          .eq('id', id)
          .single();
        if (data && data.evaluation_data) {
          return data.evaluation_data as IeltsEvaluationResult;
        }
      } catch (e) {}
    }

    return null;
  },

  /**
   * Retrieve all tests for history and progress tracking
   */
  async getAllTests(userId?: string): Promise<IeltsEvaluationResult[]> {
    const localTests = StorageService.getLocalTests();

    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const user = userId || (await supabase.auth.getUser()).data.user?.id;
        if (user) {
          const { data, error } = await supabase
            .from('ielts_tests')
            .select('evaluation_data')
            .eq('user_id', user)
            .order('created_at', { ascending: false });

          if (data && data.length > 0) {
            const cloudTests = data.map((d: any) => d.evaluation_data as IeltsEvaluationResult);
            // Merge unique tests
            const combinedMap = new Map<string, IeltsEvaluationResult>();
            cloudTests.forEach((t) => combinedMap.set(t.id, t));
            localTests.forEach((t) => combinedMap.set(t.id, t));
            const merged = Array.from(combinedMap.values()).sort(
              (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            );

            // Update local cache
            if (typeof window !== 'undefined') {
              localStorage.setItem(TESTS_STORAGE_KEY, JSON.stringify(merged));
            }
            return merged;
          }
        }
      } catch (e) {
        console.warn('[SpeakBand Storage] Supabase load notice:', e);
      }
    }

    return localTests;
  },

  getLocalTests(): IeltsEvaluationResult[] {
    if (typeof window === 'undefined') return [];
    try {
      const raw = localStorage.getItem(TESTS_STORAGE_KEY);
      if (!raw) return [];
      return JSON.parse(raw) as IeltsEvaluationResult[];
    } catch (e) {
      return [];
    }
  },

  getTestHistorySummaries(): TestHistorySummary[] {
    const tests = StorageService.getLocalTests();
    return tests.map((t) => ({
      id: t.id,
      createdAt: t.createdAt,
      overallBand: t.overallBand,
      fluencyBand: t.fluencyBand,
      lexicalBand: t.lexicalBand,
      grammarBand: t.grammarBand,
      pronunciationBand: t.pronunciationBand,
      testDurationSeconds: t.testDurationSeconds,
      weakestSkill: t.weakestArea,
      strongestSkill: t.strongestArea,
    }));
  },

  getLatestEstimatedBand(): number | null {
    const tests = StorageService.getLocalTests();
    if (tests.length === 0) return null;
    return tests[0].overallBand;
  },

  getWeakestSkill(): string {
    const tests = StorageService.getLocalTests();
    if (tests.length === 0) return 'Lexical Resource';
    return tests[0].weakestArea.split('(')[0].trim() || 'Lexical Resource';
  },

  getTargetBand(): number {
    if (typeof window === 'undefined') return 7.5;
    try {
      const stored = localStorage.getItem('speakband_target_band');
      return stored ? parseFloat(stored) : 7.5;
    } catch (e) {
      return 7.5;
    }
  },

  setTargetBand(band: number): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem('speakband_target_band', band.toString());
    } catch (e) {}
  },
};
