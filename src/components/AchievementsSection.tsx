import React, { useState, useMemo } from 'react';
import { SessionResult, AchievementBadge, AchievementCategory, AchievementRarity } from '../types';
import { calculateAchievements } from '../utils/achievements';
import { 
  Award, 
  Sparkles, 
  Compass, 
  ShieldCheck, 
  Crown, 
  Flame, 
  Zap, 
  Sun, 
  Trophy, 
  Activity, 
  Eye, 
  CheckCircle2, 
  Target as TargetIcon, 
  Layers, 
  Map, 
  Edit3, 
  Moon, 
  Globe, 
  Lock, 
  Check, 
  X, 
  ChevronRight, 
  Info,
  Calendar,
  Share2
} from 'lucide-react';

interface AchievementsSectionProps {
  sessions: SessionResult[];
}

export const AchievementsSection: React.FC<AchievementsSectionProps> = ({ sessions }) => {
  const [activeCategory, setActiveCategory] = useState<'all' | 'unlocked' | AchievementCategory>('all');
  const [selectedBadge, setSelectedBadge] = useState<AchievementBadge | null>(null);

  const { badges, unlockedCount, totalCount, completionPercentage } = useMemo(
    () => calculateAchievements(sessions),
    [sessions]
  );

  const filteredBadges = useMemo(() => {
    return badges.filter(badge => {
      if (activeCategory === 'all') return true;
      if (activeCategory === 'unlocked') return badge.isUnlocked;
      return badge.category === activeCategory;
    });
  }, [badges, activeCategory]);

  const renderBadgeIcon = (iconName: string, className = "w-5 h-5") => {
    switch (iconName) {
      case 'Sparkles': return <Sparkles className={className} />;
      case 'Compass': return <Compass className={className} />;
      case 'Award': return <Award className={className} />;
      case 'ShieldCheck': return <ShieldCheck className={className} />;
      case 'Crown': return <Crown className={className} />;
      case 'Flame': return <Flame className={className} />;
      case 'Zap': return <Zap className={className} />;
      case 'Sun': return <Sun className={className} />;
      case 'Trophy': return <Trophy className={className} />;
      case 'Activity': return <Activity className={className} />;
      case 'Eye': return <Eye className={className} />;
      case 'CheckCircle2': return <CheckCircle2 className={className} />;
      case 'Target': return <TargetIcon className={className} />;
      case 'Layers': return <Layers className={className} />;
      case 'Map': return <Map className={className} />;
      case 'Edit3': return <Edit3 className={className} />;
      case 'Moon': return <Moon className={className} />;
      case 'Globe': return <Globe className={className} />;
      default: return <Award className={className} />;
    }
  };

  const getRarityBadgeStyle = (rarity: AchievementRarity) => {
    switch (rarity) {
      case 'luminary':
        return 'bg-gradient-to-r from-[#D8B4FE]/30 to-[#2DD4BF]/30 border-[#2DD4BF] text-[#5EEAD4] font-bold shadow-sm shadow-[#2DD4BF]/20';
      case 'master':
        return 'bg-[#211B3B] border-[#A78BFA]/60 text-[#D8B4FE]';
      case 'adept':
        return 'bg-[#0E242B] border-[#2DD4BF]/50 text-[#5EEAD4]';
      case 'initiate':
      default:
        return 'bg-[#141733] border-[#242A5C] text-[#8A90B8]';
    }
  };

  return (
    <div className="bg-[#0E1026] border border-[#242A5C] rounded-2xl p-5 sm:p-6 mb-8 shadow-xl relative overflow-hidden">
      {/* Decorative ambient aura */}
      <div className="absolute top-0 left-0 w-80 h-80 bg-gradient-to-br from-[#C4B5FD]/10 via-[#2DD4BF]/10 to-transparent rounded-full blur-3xl pointer-events-none" />

      {/* Header with Title and Progress Telemetry */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-[#242A5C]/60 pb-5 mb-6 relative z-10">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-mono-code text-[#C4B5FD] mb-1">
            <Trophy className="w-3.5 h-3.5 text-[#2DD4BF]" />
            <span>Empirical Discipline & Attunement</span>
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-white font-display flex items-center gap-2">
            <span>Aperture Milestones & Achievement Badges</span>
          </h2>
          <p className="text-xs text-[#8A90B8] mt-0.5 max-w-xl">
            Track your journey through double-blind coordinate trials, consecutive practice streaks, holographic descriptor resonance, and protocol mastery.
          </p>
        </div>

        {/* Global Progression Counter Bar */}
        <div className="bg-[#080914] border border-[#242A5C] rounded-xl p-3 sm:px-4 sm:py-2.5 min-w-[240px] shrink-0">
          <div className="flex items-center justify-between text-xs mb-1.5 font-mono-code">
            <span className="text-[#8A90B8]">Decrypted Badges:</span>
            <span className="text-white font-bold">
              <span className="text-[#2DD4BF]">{unlockedCount}</span>
              <span className="text-[#5A608B]"> / </span>
              <span>{totalCount}</span>
              <span className="text-[#C4B5FD] ml-1.5">({completionPercentage}%)</span>
            </span>
          </div>
          
          <div className="w-full h-2 bg-[#141733] rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-[#C4B5FD] via-[#A78BFA] to-[#2DD4BF] rounded-full transition-all duration-700 shadow-sm shadow-[#2DD4BF]/40"
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none mb-6 relative z-10 text-xs">
        {[
          { id: 'all', label: `All (${totalCount})` },
          { id: 'unlocked', label: `Decrypted (${unlockedCount})` },
          { id: 'milestones', label: 'Milestones (5)' },
          { id: 'streaks', label: 'Streaks (4)' },
          { id: 'accuracy', label: 'Accuracy & Judge (5)' },
          { id: 'protocol', label: 'Protocol (4)' },
        ].map(cat => (
          <button
            key={cat.id}
            type="button"
            onClick={() => setActiveCategory(cat.id as any)}
            className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-all ${
              activeCategory === cat.id
                ? 'bg-[#152538] border border-[#2DD4BF]/60 text-[#5EEAD4] shadow-sm shadow-[#2DD4BF]/15 font-semibold'
                : 'bg-[#141733]/60 border border-transparent text-[#8A90B8] hover:text-white'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Badges Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5 relative z-10">
        {filteredBadges.map(badge => {
          const isComplete = badge.isUnlocked;
          const progressPercent = Math.min(100, Math.round((badge.currentProgress / badge.maxProgress) * 100));

          return (
            <div
              key={badge.id}
              onClick={() => setSelectedBadge(badge)}
              className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between group relative overflow-hidden ${
                isComplete
                  ? 'bg-gradient-to-b from-[#131938] to-[#0A0D1F] border-[#2DD4BF]/45 hover:border-[#2DD4BF] shadow-lg shadow-[#2DD4BF]/10 hover:shadow-[#2DD4BF]/20 scale-[1.0] hover:scale-[1.015]'
                  : 'bg-[#080914] border-[#242A5C]/60 hover:border-[#384078] opacity-80 hover:opacity-100'
              }`}
            >
              {/* Top ambient glow for unlocked badge */}
              {isComplete && (
                <div className="absolute top-0 right-0 w-28 h-28 bg-gradient-to-br from-[#C4B5FD]/15 to-[#2DD4BF]/15 rounded-full blur-xl pointer-events-none" />
              )}

              <div>
                {/* Emblem Row */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all ${
                    isComplete
                      ? 'bg-gradient-to-tr from-[#C4B5FD] via-[#A78BFA] to-[#2DD4BF] text-[#080914] shadow-md shadow-[#2DD4BF]/30 group-hover:scale-105'
                      : 'bg-[#141733] border border-[#242A5C] text-[#636A96]'
                  }`}>
                    {isComplete ? (
                      renderBadgeIcon(badge.iconName, "w-5 h-5")
                    ) : (
                      <Lock className="w-4 h-4 text-[#50567C]" />
                    )}
                  </div>

                  {/* Rarity Chip */}
                  <span className={`text-[10px] uppercase font-mono-code px-2 py-0.5 rounded-full border ${getRarityBadgeStyle(badge.rarity)}`}>
                    {badge.rarity}
                  </span>
                </div>

                {/* Badge Title & Description */}
                <h3 className={`font-display text-sm font-bold mb-1 line-clamp-1 transition-colors ${
                  isComplete ? 'text-white group-hover:text-[#2DD4BF]' : 'text-[#8A90B8]'
                }`}>
                  {badge.title}
                </h3>

                <p className="text-xs text-[#8A90B8] leading-relaxed line-clamp-2 mb-3">
                  {badge.description}
                </p>
              </div>

              {/* Bottom Status / Progress Section */}
              <div className="pt-2 border-t border-[#242A5C]/40 text-xs">
                {isComplete ? (
                  <div className="flex items-center justify-between text-[11px] font-mono-code">
                    <span className="text-[#2DD4BF] flex items-center gap-1 font-semibold">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                      <span>Decrypted</span>
                    </span>
                    <span className="text-[#787EA8]">
                      {badge.unlockedAt ? new Date(badge.unlockedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : 'Unlocked'}
                    </span>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-center justify-between text-[10px] font-mono-code text-[#787EA8] mb-1">
                      <span>Progress:</span>
                      <span>{badge.currentProgress} / {badge.maxProgress} ({progressPercent}%)</span>
                    </div>
                    <div className="w-full h-1.5 bg-[#141733] rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-[#384078] rounded-full transition-all"
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* MODAL: BADGE INSPECTION & TEACHING APHORISM */}
      {selectedBadge && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          onClick={() => setSelectedBadge(null)}
        >
          <div 
            className="relative w-full max-w-md bg-[#0D0F22] border-2 border-[#2DD4BF]/60 rounded-2xl shadow-2xl p-6 sm:p-7 text-[#E0E2EC] overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            {/* Modal ambient background glow */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-[#C4B5FD]/15 via-[#2DD4BF]/15 to-transparent rounded-full blur-3xl pointer-events-none" />

            {/* Close button */}
            <button
              type="button"
              onClick={() => setSelectedBadge(null)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-[#787EA8] hover:text-white hover:bg-[#141733] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Emblem and Rarity */}
            <div className="text-center mb-4">
              <div className={`w-16 h-16 rounded-2xl mx-auto flex items-center justify-center mb-3 shadow-xl ${
                selectedBadge.isUnlocked
                  ? 'bg-gradient-to-tr from-[#C4B5FD] via-[#A78BFA] to-[#2DD4BF] text-[#080914] shadow-[#2DD4BF]/30'
                  : 'bg-[#141733] border border-[#242A5C] text-[#636A96]'
              }`}>
                {selectedBadge.isUnlocked ? (
                  renderBadgeIcon(selectedBadge.iconName, "w-8 h-8")
                ) : (
                  <Lock className="w-7 h-7 text-[#636A96]" />
                )}
              </div>

              <span className={`inline-block text-[11px] uppercase font-mono-code px-2.5 py-0.5 rounded-full border mb-2 ${getRarityBadgeStyle(selectedBadge.rarity)}`}>
                {selectedBadge.rarity} Badge
              </span>

              <h3 className="font-display text-xl font-bold text-white mb-1">
                {selectedBadge.title}
              </h3>

              <div className="text-xs font-mono-code text-[#C4B5FD] uppercase tracking-wider">
                Category: {selectedBadge.category}
              </div>
            </div>

            {/* Description & Criteria */}
            <div className="bg-[#080914] border border-[#242A5C] rounded-xl p-3.5 mb-4 text-xs">
              <div className="text-[#8A90B8] mb-1 font-semibold uppercase tracking-wider text-[10px]">
                Milestone Requirement
              </div>
              <p className="text-white leading-relaxed">
                {selectedBadge.description}
              </p>

              {/* Progress if locked */}
              {!selectedBadge.isUnlocked && (
                <div className="mt-3 pt-2.5 border-t border-[#242A5C]/60">
                  <div className="flex items-center justify-between text-[11px] font-mono-code text-[#787EA8] mb-1">
                    <span>Current Progress:</span>
                    <span className="text-[#2DD4BF] font-bold">
                      {selectedBadge.currentProgress} / {selectedBadge.maxProgress}
                    </span>
                  </div>
                  <div className="w-full h-2 bg-[#141733] rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-[#C4B5FD] to-[#2DD4BF] rounded-full"
                      style={{ width: `${Math.min(100, Math.round((selectedBadge.currentProgress / selectedBadge.maxProgress) * 100))}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Malychite Aphorism / Lore Quote */}
            {selectedBadge.rewardQuote && (
              <div className="p-3.5 rounded-xl bg-[#141738] border border-[#2DD4BF]/30 text-xs sm:text-sm text-[#5EEAD4] italic mb-5 leading-relaxed">
                "{selectedBadge.rewardQuote}"
              </div>
            )}

            {/* Status Footer */}
            <div className="flex items-center justify-between pt-3 border-t border-[#242A5C]/60 text-xs font-mono-code">
              <span className="text-[#787EA8]">Status:</span>
              <span className={selectedBadge.isUnlocked ? 'text-[#2DD4BF] font-semibold flex items-center gap-1' : 'text-[#8A90B8]'}>
                {selectedBadge.isUnlocked ? (
                  <>
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                    <span>Decrypted {selectedBadge.unlockedAt ? `(${new Date(selectedBadge.unlockedAt).toLocaleDateString()})` : ''}</span>
                  </>
                ) : (
                  'Locked · Awaiting Protocol Completion'
                )}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
