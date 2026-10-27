import { SessionResult, AchievementBadge, AchievementCategory, AchievementRarity } from '../types';

const ACHIEVEMENTS_STORAGE_KEY = 'scry_unlocked_achievements_v1';
const DREAMS_STORAGE_KEY = 'scry_dreams_v1';
const LEGACY_DREAMS_KEY = 'farsight_dreams_v1';

// Calculate historical maximum consecutive streak and current streak
export function calculateStreaks(sessions: SessionResult[]): { currentStreak: number; maxStreak: number } {
  if (sessions.length === 0) return { currentStreak: 0, maxStreak: 0 };

  const daySet = new Set(
    sessions.map(s => {
      const d = new Date(s.date);
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    })
  );

  const sortedDays = Array.from(daySet).sort();
  if (sortedDays.length === 0) return { currentStreak: 0, maxStreak: 0 };

  // Calculate maximum historical consecutive streak
  let maxStreak = 1;
  let currentRun = 1;

  for (let i = 1; i < sortedDays.length; i++) {
    const prev = new Date(sortedDays[i - 1]);
    const curr = new Date(sortedDays[i]);
    const diffTime = curr.getTime() - prev.getTime();
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      currentRun++;
      if (currentRun > maxStreak) {
        maxStreak = currentRun;
      }
    } else if (diffDays > 1) {
      currentRun = 1;
    }
  }

  // Calculate current streak relative to today
  let currentStreak = 0;
  const today = new Date();
  
  for (let i = 0; i < 365; i++) {
    const checkDate = new Date(today);
    checkDate.setDate(today.getDate() - i);
    const dayKey = `${checkDate.getFullYear()}-${String(checkDate.getMonth() + 1).padStart(2, '0')}-${String(checkDate.getDate()).padStart(2, '0')}`;
    
    if (daySet.has(dayKey)) {
      currentStreak++;
    } else if (i > 0) {
      break;
    }
  }

  return {
    currentStreak,
    maxStreak: Math.max(maxStreak, currentStreak),
  };
}

// Load saved unlock timestamps
function getStoredUnlocks(): Record<string, string> {
  try {
    const raw = localStorage.getItem(ACHIEVEMENTS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    return {};
  }
}

function saveStoredUnlocks(unlocks: Record<string, string>): void {
  try {
    localStorage.setItem(ACHIEVEMENTS_STORAGE_KEY, JSON.stringify(unlocks));
  } catch (e) {
    console.error('Failed to save achievements', e);
  }
}

export function calculateAchievements(sessions: SessionResult[]): {
  badges: AchievementBadge[];
  unlockedCount: number;
  totalCount: number;
  completionPercentage: number;
} {
  const storedUnlocks = getStoredUnlocks();
  const newUnlocks: Record<string, string> = { ...storedUnlocks };
  const nowIso = new Date().toISOString();

  // Metrics
  const totalSessions = sessions.length;
  const { currentStreak, maxStreak } = calculateStreaks(sessions);
  const bestStreak = Math.max(currentStreak, maxStreak);

  // Highest score in any session
  let highestScore = 0;
  let selfYesCount = 0;
  let judgeHits = 0;
  const tiersPerceived = new Set<number>();
  let sketchCount = 0;
  let dailyTargetCount = 0;
  let linkedDreamCount = 0;

  for (const s of sessions) {
    if (s.score.percentage > highestScore) {
      highestScore = s.score.percentage;
    }
    if (s.selfRating === 'yes') {
      selfYesCount++;
    }
    if (s.judge?.isHit) {
      judgeHits++;
    }
    if (s.target?.tier) {
      tiersPerceived.add(s.target.tier);
    }
    if (s.impressions?.sketchDataUrl) {
      sketchCount++;
    }
    if (s.isDailyTarget) {
      dailyTargetCount++;
    }
    if (s.linkedDreamId) {
      linkedDreamCount++;
    }
  }

  // Check if any dreams exist with linked session
  try {
    const rawDreams = localStorage.getItem(DREAMS_STORAGE_KEY) || localStorage.getItem(LEGACY_DREAMS_KEY);
    if (rawDreams) {
      const parsedDreams = JSON.parse(rawDreams);
      if (Array.isArray(parsedDreams)) {
        const dreamsWithLink = parsedDreams.filter(d => Boolean(d.linkedSessionId));
        linkedDreamCount = Math.max(linkedDreamCount, dreamsWithLink.length);
      }
    }
  } catch (e) {
    // Ignore dream parsing error
  }

  // Helper to resolve unlock
  const checkUnlock = (id: string, condition: boolean, fallbackDate?: string): { isUnlocked: boolean; unlockedAt?: string } => {
    if (condition) {
      if (!newUnlocks[id]) {
        newUnlocks[id] = fallbackDate || nowIso;
      }
      return { isUnlocked: true, unlockedAt: newUnlocks[id] };
    }
    if (newUnlocks[id]) {
      return { isUnlocked: true, unlockedAt: newUnlocks[id] };
    }
    return { isUnlocked: false };
  };

  const badgeTemplates: Array<Omit<AchievementBadge, 'isUnlocked' | 'unlockedAt' | 'currentProgress'> & {
    evalProgress: number;
    condition: boolean;
  }> = [
    // --- MILESTONES ---
    {
      id: 'first_light',
      title: 'First Light',
      description: 'Initiate your perceptual discipline by completing your 1st blind session.',
      category: 'milestones',
      iconName: 'Sparkles',
      threshold: 1,
      maxProgress: 1,
      rarity: 'initiate',
      rewardQuote: 'The aperture opens with the first deliberate stroke into the unknown.',
      evalProgress: Math.min(1, totalSessions),
      condition: totalSessions >= 1,
    },
    {
      id: 'five_sessions',
      title: 'Signal Attunement',
      description: 'Complete 5 double-blind coordinate trials to establish neural calibration.',
      category: 'milestones',
      iconName: 'Compass',
      threshold: 5,
      maxProgress: 5,
      rarity: 'initiate',
      rewardQuote: 'Repetition begins to separate ambient mental noise from non-local signal.',
      evalProgress: Math.min(5, totalSessions),
      condition: totalSessions >= 5,
    },
    {
      id: 'ten_sessions',
      title: 'Deca-Perceiver',
      description: 'Complete 10 double-blind viewing sessions across historical vectors.',
      category: 'milestones',
      iconName: 'Award',
      threshold: 10,
      maxProgress: 10,
      rarity: 'adept',
      rewardQuote: 'Ten trials completed. Statistical significance begins to crystallize.',
      evalProgress: Math.min(10, totalSessions),
      condition: totalSessions >= 10,
    },
    {
      id: 'twenty_five_sessions',
      title: 'Master Scryer',
      description: 'Achieve 25 documented sessions in your controlled remote viewing logbook.',
      category: 'milestones',
      iconName: 'ShieldCheck',
      threshold: 25,
      maxProgress: 25,
      rarity: 'master',
      rewardQuote: 'A quarter-century of vectors. Your subconscious discernment has stabilized.',
      evalProgress: Math.min(25, totalSessions),
      condition: totalSessions >= 25,
    },
    {
      id: 'fifty_sessions',
      title: 'The Century Horizon',
      description: 'Reach 50 remote viewing sessions, building an elite personal empirical archive.',
      category: 'milestones',
      iconName: 'Crown',
      threshold: 50,
      maxProgress: 50,
      rarity: 'luminary',
      rewardQuote: 'The non-local horizon is no longer distant; it is an accessible state of being.',
      evalProgress: Math.min(50, totalSessions),
      condition: totalSessions >= 50,
    },

    // --- STREAKS ---
    {
      id: 'streak_3',
      title: 'Harmonic Cadence',
      description: 'Establish a consecutive 3-day viewing streak without interruption.',
      category: 'streaks',
      iconName: 'Flame',
      threshold: 3,
      maxProgress: 3,
      rarity: 'initiate',
      rewardQuote: 'Daily practice creates a rhythmic bridge between waking focus and subtle reception.',
      evalProgress: Math.min(3, bestStreak),
      condition: bestStreak >= 3,
    },
    {
      id: 'streak_5',
      title: 'Consecutive 5-Day Streak',
      description: 'Maintain an unbroken 5-day consecutive viewing discipline.',
      category: 'streaks',
      iconName: 'Zap',
      threshold: 5,
      maxProgress: 5,
      rarity: 'adept',
      rewardQuote: 'Five consecutive days. Neural plasticity favors continuous perceptual exposure.',
      evalProgress: Math.min(5, bestStreak),
      condition: bestStreak >= 5,
    },
    {
      id: 'streak_7',
      title: 'Solar Octave',
      description: 'Complete a full consecutive 7-day week of double-blind perceptual practice.',
      category: 'streaks',
      iconName: 'Sun',
      threshold: 7,
      maxProgress: 7,
      rarity: 'master',
      rewardQuote: 'Seven solar cycles. The mind surrenders its analytical skepticism to daily evidence.',
      evalProgress: Math.min(7, bestStreak),
      condition: bestStreak >= 7,
    },
    {
      id: 'streak_14',
      title: 'Fortnight Alignment',
      description: 'Achieve an unbroken 14-day consecutive streak of remote viewing training.',
      category: 'streaks',
      iconName: 'Sparkle',
      threshold: 14,
      maxProgress: 14,
      rarity: 'luminary',
      rewardQuote: 'Two full weeks uninterrupted. Mastery is forged in unbroken persistence.',
      evalProgress: Math.min(14, bestStreak),
      condition: bestStreak >= 14,
    },

    // --- ACCURACY & JUDGING ---
    {
      id: 'score_70',
      title: 'Resonance Surge',
      description: 'Attain a 70%+ automated physical descriptor overlap match in a session.',
      category: 'accuracy',
      iconName: 'Activity',
      threshold: 70,
      maxProgress: 70,
      rarity: 'adept',
      rewardQuote: 'Structural gestalt, textures, and elemental signatures harmonized with high precision.',
      evalProgress: Math.min(70, highestScore),
      condition: highestScore >= 70,
    },
    {
      id: 'score_85',
      title: 'Holographic Fidelity',
      description: 'Achieve an extraordinary 85%+ automated descriptor overlap match.',
      category: 'accuracy',
      iconName: 'Eye',
      threshold: 85,
      maxProgress: 85,
      rarity: 'luminary',
      rewardQuote: 'Near-total holographic concordance. The sensory transcript mirrored reality.',
      evalProgress: Math.min(85, highestScore),
      condition: highestScore >= 85,
    },
    {
      id: 'self_yes_5',
      title: 'Canonical Resonance',
      description: 'Confirm 5 self-rated "Yes" (Strong Match) target breakthroughs.',
      category: 'accuracy',
      iconName: 'CheckCircle2',
      threshold: 5,
      maxProgress: 5,
      rarity: 'adept',
      rewardQuote: 'Your subjective discernment recognized undeniable structural correspondence.',
      evalProgress: Math.min(5, selfYesCount),
      condition: selfYesCount >= 5,
    },
    {
      id: 'judge_hit_1',
      title: 'Decoy Breaker',
      description: 'Score your first blind 4-way match in Judge Mode, overcoming the 25% baseline.',
      category: 'accuracy',
      iconName: 'Target',
      threshold: 1,
      maxProgress: 1,
      rarity: 'initiate',
      rewardQuote: 'Signal survived the decoy test. Out of 4 targets, the true vector was identified.',
      evalProgress: Math.min(1, judgeHits),
      condition: judgeHits >= 1,
    },
    {
      id: 'judge_hit_3',
      title: 'Tri-Judge Superiority',
      description: 'Score 3 Judge Mode blind hits, demonstrating repeated statistical significance.',
      category: 'accuracy',
      iconName: 'Layers',
      threshold: 3,
      maxProgress: 3,
      rarity: 'master',
      rewardQuote: 'Three blind judge hits elevate the session record far above chance expectation.',
      evalProgress: Math.min(3, judgeHits),
      condition: judgeHits >= 3,
    },

    // --- PROTOCOL MASTERY ---
    {
      id: 'all_tiers',
      title: 'Dimensional Cartographer',
      description: 'Perceive targets across all 3 Difficulty Tiers (Famous, Obscure, Coordinates).',
      category: 'protocol',
      iconName: 'Map',
      threshold: 3,
      maxProgress: 3,
      rarity: 'adept',
      rewardQuote: 'From iconic monuments to raw coordinate vectors without hints.',
      evalProgress: Math.min(3, tiersPerceived.size),
      condition: tiersPerceived.size >= 3,
    },
    {
      id: 'sketchpad_artisan',
      title: 'Ideogram Kinematics',
      description: 'Draw spontaneous ideogram sketches on the canvas across 3 sessions.',
      category: 'protocol',
      iconName: 'Edit3',
      threshold: 3,
      maxProgress: 3,
      rarity: 'initiate',
      rewardQuote: 'Stage 1 kinesthetic reflex. Hand movements translate non-local physical structure.',
      evalProgress: Math.min(3, sketchCount),
      condition: sketchCount >= 3,
    },
    {
      id: 'dream_linked',
      title: 'Oneiric Precognition',
      description: 'Link a recorded dream entry with a subsequent remote viewing session.',
      category: 'protocol',
      iconName: 'Moon',
      threshold: 1,
      maxProgress: 1,
      rarity: 'adept',
      rewardQuote: 'Bridging hypnagogic dream motifs with waking double-blind targets.',
      evalProgress: Math.min(1, linkedDreamCount),
      condition: linkedDreamCount >= 1,
    },
    {
      id: 'daily_universal',
      title: 'Synchronized Mind',
      description: 'Complete a Universal Daily Target synchronized with viewers worldwide.',
      category: 'protocol',
      iconName: 'Globe',
      threshold: 1,
      maxProgress: 1,
      rarity: 'initiate',
      rewardQuote: 'Tuning into the globally shared coordinate vector at midnight UTC.',
      evalProgress: Math.min(1, dailyTargetCount),
      condition: dailyTargetCount >= 1,
    },
  ];

  const badges: AchievementBadge[] = badgeTemplates.map(b => {
    const unlockStatus = checkUnlock(b.id, b.condition);
    return {
      id: b.id,
      title: b.title,
      description: b.description,
      category: b.category,
      iconName: b.iconName,
      threshold: b.threshold,
      currentProgress: b.evalProgress,
      maxProgress: b.maxProgress,
      isUnlocked: unlockStatus.isUnlocked,
      unlockedAt: unlockStatus.unlockedAt,
      rarity: b.rarity,
      rewardQuote: b.rewardQuote,
    };
  });

  // Save any new unlocks
  if (Object.keys(newUnlocks).length > Object.keys(storedUnlocks).length) {
    saveStoredUnlocks(newUnlocks);
  }

  const unlockedCount = badges.filter(b => b.isUnlocked).length;
  const totalCount = badges.length;
  const completionPercentage = Math.round((unlockedCount / totalCount) * 100);

  return {
    badges,
    unlockedCount,
    totalCount,
    completionPercentage,
  };
}
