export type TargetCategory = 
  | 'ancient_site' 
  | 'monument' 
  | 'natural_wonder' 
  | 'modern_architecture' 
  | 'sacred_site'
  | 'coastal_wonder'
  | 'obscure_location'
  | 'coordinate_vector';

export type DifficultyTier = 1 | 2 | 3; // Tier 1: Famous, Tier 2: Obscure, Tier 3: Coordinates Only

export interface Target {
  id: string;
  name: string;
  location: string;
  coordinates: string;
  category: TargetCategory;
  tier: DifficultyTier;
  photo: string;
  description: string;
  hiddenTags: string[];
  graphicSvgSeed?: string;
  dominantColor: string;
}

export type SelfRating = 'yes' | 'partially' | 'no';
export type TimeOfDay = 'dawn' | 'day' | 'dusk' | 'night';

export interface ViewingMethodInfo {
  technique: string;
  meditationLengthMinutes: number;
  timeOfDay: TimeOfDay;
}

export interface UserImpressions {
  freeText: string;
  sketchDataUrl?: string;
  selectedDescriptors: string[];
  focusDurationSeconds: number;
  timestamp: number;
  audioTranscript?: string;
}

export interface ScoreBreakdown {
  percentage: number;
  matchedTags: string[];
  unmatchedSelected: string[];
  targetTags: string[];
  verdict: 'Strong match' | 'Partial match' | 'No match';
  explanation: string;
}

export interface JudgeSelection {
  options: Target[]; // 1 real + 3 decoys (4 total)
  selectedTargetId: string | null;
  isHit: boolean | null;
  judgedAt?: string;
}

export interface SessionResult {
  id: string;
  date: string; // ISO
  code: string;
  targetId: string;
  target: Target;
  difficultyTier: DifficultyTier;
  impressions: UserImpressions;
  method: ViewingMethodInfo;
  score: ScoreBreakdown;
  judge?: JudgeSelection;
  selfRating: SelfRating | null;
  reflectionNotes?: string;
  isDailyTarget?: boolean;
  linkedDreamId?: string;
  circleGroupId?: string;
}

export interface UserStats {
  totalSessions: number;
  selfRatings: {
    yes: number;
    partially: number;
    no: number;
    unrated: number;
  };
  accuracyPercentage: number;
  averageAlgorithmicScore: number;
  dailyStreak: number;
  lastSessionDate?: string;
  topPerceivedCategories: { category: string; count: number }[];
  judgeStats: {
    totalJudged: number;
    hits: number;
    hitRate: number; // percentage
    chanceBaseline: number; // 25%
    pAboveChance: boolean;
  };
  methodBreakdown: Record<string, { sessions: number; accuracy: number }>;
}

export interface DreamEntry {
  id: string;
  date: string;
  title: string;
  description: string;
  symbols: string[];
  lucidity: 'low' | 'medium' | 'high' | 'lucid';
  mood: string;
  linkedSessionId?: string;
}

export interface MalychitePost {
  id: string;
  slug: string;
  title: string;
  date: string;
  category: 'Foundations' | 'Sensory Signal' | 'Ideograms & Gestalts' | 'AOL Quenching' | 'Astral & Non-Local' | 'Dream Telepathy';
  readTimeMinutes: number;
  summary: string;
  content: string[];
  tags: string[];
}

export interface GroupCircle {
  id: string;
  code: string;
  createdAt: string;
  title: string;
  targetId: string;
  participants: {
    name: string;
    impressions: string;
    descriptors: string[];
    sketchDataUrl?: string;
    submittedAt: string;
  }[];
}

export interface DescriptorOption {
  id: string;
  label: string;
  category: string;
  iconName?: string;
}

export type AchievementCategory = 'milestones' | 'streaks' | 'accuracy' | 'mastery' | 'protocol';
export type AchievementRarity = 'initiate' | 'adept' | 'master' | 'luminary';

export interface AchievementBadge {
  id: string;
  title: string;
  description: string;
  category: AchievementCategory;
  iconName: string;
  threshold: number;
  currentProgress: number;
  maxProgress: number;
  isUnlocked: boolean;
  unlockedAt?: string;
  rarity: AchievementRarity;
  rewardQuote?: string;
}
