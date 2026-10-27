import { SessionResult, UserStats, SelfRating, JudgeSelection } from '../types';

const STORAGE_KEY = 'scry_sessions_v1';
const LEGACY_STORAGE_KEY = 'farsight_sessions_v1';

export function getSavedSessions(): SessionResult[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY) || localStorage.getItem(LEGACY_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }
    return [];
  } catch (err) {
    console.error('Failed to read sessions from localStorage', err);
    return [];
  }
}

export function saveSession(session: SessionResult): void {
  try {
    const sessions = getSavedSessions();
    const existingIndex = sessions.findIndex(s => s.id === session.id);
    if (existingIndex >= 0) {
      sessions[existingIndex] = session;
    } else {
      sessions.unshift(session);
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
  } catch (err) {
    console.error('Failed to save session to localStorage', err);
  }
}

export function updateSessionRating(
  sessionId: string,
  selfRating: SelfRating,
  notes?: string
): SessionResult | null {
  try {
    const sessions = getSavedSessions();
    const session = sessions.find(s => s.id === sessionId);
    if (!session) return null;

    session.selfRating = selfRating;
    if (notes !== undefined) {
      session.reflectionNotes = notes;
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
    return session;
  } catch (err) {
    console.error('Failed to update session rating', err);
    return null;
  }
}

export function updateSessionJudge(
  sessionId: string,
  selectedTargetId: string
): SessionResult | null {
  try {
    const sessions = getSavedSessions();
    const session = sessions.find(s => s.id === sessionId);
    if (!session || !session.judge) return null;

    const isHit = selectedTargetId === session.targetId;
    session.judge = {
      ...session.judge,
      selectedTargetId,
      isHit,
      judgedAt: new Date().toISOString(),
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
    return session;
  } catch (err) {
    console.error('Failed to update session judge', err);
    return null;
  }
}

export function deleteSession(sessionId: string): void {
  try {
    const sessions = getSavedSessions().filter(s => s.id !== sessionId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
  } catch (err) {
    console.error('Failed to delete session', err);
  }
}

export function clearAllSessions(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (err) {
    console.error('Failed to clear sessions', err);
  }
}

export function calculateStats(sessions: SessionResult[]): UserStats {
  const totalSessions = sessions.length;
  const selfRatings = {
    yes: 0,
    partially: 0,
    no: 0,
    unrated: 0,
  };

  let totalScoreSum = 0;
  const categoryCounts: Record<string, number> = {};

  // Judge Stats
  let totalJudged = 0;
  let judgeHits = 0;

  // Method Breakdown
  const methodAcc: Record<string, { total: number; scoreSum: number }> = {};

  for (const s of sessions) {
    totalScoreSum += s.score.percentage;

    if (s.selfRating === 'yes') selfRatings.yes++;
    else if (s.selfRating === 'partially') selfRatings.partially++;
    else if (s.selfRating === 'no') selfRatings.no++;
    else selfRatings.unrated++;

    // Track judge results
    if (s.judge && s.judge.selectedTargetId) {
      totalJudged++;
      if (s.judge.isHit) {
        judgeHits++;
      }
    }

    // Method breakdown
    const tech = s.method?.technique || 'Standard CRV';
    if (!methodAcc[tech]) {
      methodAcc[tech] = { total: 0, scoreSum: 0 };
    }
    methodAcc[tech].total++;
    const ratingWeight = s.selfRating === 'yes' ? 100 : s.selfRating === 'partially' ? 50 : 0;
    methodAcc[tech].scoreSum += ratingWeight;

    // Track successfully perceived categories
    for (const tag of s.score.matchedTags) {
      categoryCounts[tag] = (categoryCounts[tag] || 0) + 1;
    }
  }

  const ratedSessions = selfRatings.yes + selfRatings.partially + selfRatings.no;
  const accuracyPercentage = ratedSessions > 0
    ? Math.round(((selfRatings.yes * 1 + selfRatings.partially * 0.5) / ratedSessions) * 100)
    : 0;

  const averageAlgorithmicScore = totalSessions > 0
    ? Math.round(totalScoreSum / totalSessions)
    : 0;

  // Judge hit rate vs 25% baseline
  const judgeHitRate = totalJudged > 0 ? Math.round((judgeHits / totalJudged) * 100) : 0;

  // Compute daily streak
  let dailyStreak = 0;
  const uniqueDays = new Set(
    sessions.map(s => new Date(s.date).toISOString().split('T')[0])
  );
  const today = new Date();
  
  for (let i = 0; i < 365; i++) {
    const checkDate = new Date(today);
    checkDate.setDate(today.getDate() - i);
    const dayKey = checkDate.toISOString().split('T')[0];
    if (uniqueDays.has(dayKey)) {
      dailyStreak++;
    } else if (i > 0) {
      break;
    }
  }

  const sortedCategories = Object.entries(categoryCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([category, count]) => ({ category, count }));

  const methodBreakdown: Record<string, { sessions: number; accuracy: number }> = {};
  for (const [tech, data] of Object.entries(methodAcc)) {
    methodBreakdown[tech] = {
      sessions: data.total,
      accuracy: Math.round(data.scoreSum / data.total),
    };
  }

  return {
    totalSessions,
    selfRatings,
    accuracyPercentage,
    averageAlgorithmicScore,
    dailyStreak,
    lastSessionDate: sessions[0]?.date,
    topPerceivedCategories: sortedCategories,
    judgeStats: {
      totalJudged,
      hits: judgeHits,
      hitRate: judgeHitRate,
      chanceBaseline: 25,
      pAboveChance: judgeHitRate > 25,
    },
    methodBreakdown,
  };
}

export function exportBackupJson(): string {
  const sessions = getSavedSessions();
  return JSON.stringify({
    version: '2.0',
    app: 'Scry',
    exportedAt: new Date().toISOString(),
    sessions,
  }, null, 2);
}

export function importBackupJson(rawJson: string): { success: boolean; count?: number; error?: string } {
  try {
    const data = JSON.parse(rawJson);
    if (!data || !Array.isArray(data.sessions)) {
      return { success: false, error: 'Invalid backup format' };
    }
    const current = getSavedSessions();
    const currentMap = new Map(current.map(s => [s.id, s]));
    
    for (const session of data.sessions) {
      if (session.id && session.code && session.target) {
        currentMap.set(session.id, session);
      }
    }

    const merged = Array.from(currentMap.values());
    localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
    return { success: true, count: merged.length };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to parse JSON' };
  }
}
