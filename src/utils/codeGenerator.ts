import { TARGET_POOL } from '../data/targets';
import { Target, DifficultyTier } from '../types';

const CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const DIGITS = '23456789';

/**
 * Generates an authentic blind coordinate code in the format: "K7Q-294"
 */
export function generateBlindCode(): string {
  const p1 = 
    CHARS.charAt(Math.floor(Math.random() * CHARS.length)) +
    DIGITS.charAt(Math.floor(Math.random() * DIGITS.length)) +
    CHARS.charAt(Math.floor(Math.random() * CHARS.length));

  const p2 = 
    DIGITS.charAt(Math.floor(Math.random() * DIGITS.length)) +
    DIGITS.charAt(Math.floor(Math.random() * DIGITS.length)) +
    DIGITS.charAt(Math.floor(Math.random() * DIGITS.length));

  return `${p1}-${p2}`;
}

/**
 * Pick a random target from the pool matching selected difficulty tier,
 * avoiding repeating the previous target
 */
export function getRandomTarget(previousId?: string, tier?: DifficultyTier): Target {
  let candidates = TARGET_POOL;

  if (tier) {
    const tierCandidates = TARGET_POOL.filter(t => t.tier === tier);
    if (tierCandidates.length > 0) {
      candidates = tierCandidates;
    }
  }

  if (previousId) {
    const filtered = candidates.filter(t => t.id !== previousId);
    if (filtered.length > 0) {
      candidates = filtered;
    }
  }

  const index = Math.floor(Math.random() * candidates.length);
  return candidates[index];
}

/**
 * Generates 4 options for Judge Mode: 1 real target + 3 decoys, shuffled
 */
export function generateJudgeCandidates(trueTarget: Target): Target[] {
  const decoys = TARGET_POOL
    .filter(t => t.id !== trueTarget.id)
    .sort(() => Math.random() - 0.5)
    .slice(0, 3);

  const combined = [trueTarget, ...decoys];
  // Shuffle array
  return combined.sort(() => Math.random() - 0.5);
}

/**
 * Deterministic daily target and code based on date string (YYYY-MM-DD)
 */
export function getDailyTargetInfo(dateStr?: string): { target: Target; code: string; dateKey: string } {
  const now = dateStr ? new Date(dateStr) : new Date();
  const dateKey = now.toISOString().split('T')[0];

  // Hash the dateKey to a numeric seed
  let hash = 0;
  for (let i = 0; i < dateKey.length; i++) {
    hash = (hash << 5) - hash + dateKey.charCodeAt(i);
    hash |= 0;
  }
  const positiveSeed = Math.abs(hash);

  const targetIndex = positiveSeed % TARGET_POOL.length;
  const target = TARGET_POOL[targetIndex];

  // Deterministic daily code
  const c1 = CHARS.charAt((positiveSeed * 7 + 3) % CHARS.length);
  const c2 = DIGITS.charAt((positiveSeed * 13 + 5) % DIGITS.length);
  const c3 = CHARS.charAt((positiveSeed * 19 + 7) % CHARS.length);
  const c4 = DIGITS.charAt((positiveSeed * 23 + 11) % DIGITS.length);
  const c5 = DIGITS.charAt((positiveSeed * 29 + 13) % DIGITS.length);
  const c6 = DIGITS.charAt((positiveSeed * 31 + 17) % DIGITS.length);

  const code = `${c1}${c2}${c3}-${c4}${c5}${c6}`;

  return { target, code, dateKey };
}
