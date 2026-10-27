/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Target, SessionResult, UserImpressions, SelfRating, DifficultyTier, ViewingMethodInfo } from './types';
import { TARGET_POOL } from './data/targets';
import { generateBlindCode, getRandomTarget, generateJudgeCandidates } from './utils/codeGenerator';
import { calculateScore } from './utils/scoring';
import { 
  getSavedSessions, 
  saveSession, 
  updateSessionRating, 
  updateSessionJudge,
  calculateStats 
} from './utils/storage';
import { Header, ActiveView } from './components/Header';
import { ViewingPhase } from './components/ViewingPhase';
import { RevealPhase } from './components/RevealPhase';
import { DailyTargetView } from './components/DailyTargetView';
import { StatsView } from './components/StatsView';
import { ProtocolGuideModal } from './components/ProtocolGuideModal';
import { AmbientPlayer } from './components/AmbientPlayer';
import { BreathingGuide } from './components/BreathingGuide';
import { DreamJournal } from './components/DreamJournal';
import { CircleSessions } from './components/CircleSessions';
import { MalychiteBlog } from './components/MalychiteBlog';
import { soundEngine } from './utils/audioEngine';

export default function App() {
  const [activeView, setActiveView] = useState<ActiveView>('session');
  const [sessionPhase, setSessionPhase] = useState<'viewing' | 'revealed'>('viewing');
  const [selectedTier, setSelectedTier] = useState<DifficultyTier>(1);
  
  // Active session data
  const [currentTarget, setCurrentTarget] = useState<Target>(() => getRandomTarget(undefined, 1));
  const [currentBlindCode, setCurrentBlindCode] = useState<string>(() => generateBlindCode());
  const [isDailyTarget, setIsDailyTarget] = useState<boolean>(false);
  const [currentSessionResult, setCurrentSessionResult] = useState<SessionResult | null>(null);

  // Persistence and history
  const [savedSessions, setSavedSessions] = useState<SessionResult[]>([]);
  const [isProtocolModalOpen, setIsProtocolModalOpen] = useState<boolean>(false);
  const [isRadioOpen, setIsRadioOpen] = useState<boolean>(false);
  const [isRadioPlaying, setIsRadioPlaying] = useState<boolean>(false);

  // Load saved history on mount
  const refreshSessions = useCallback(() => {
    const list = getSavedSessions();
    setSavedSessions(list);
  }, []);

  useEffect(() => {
    refreshSessions();
  }, [refreshSessions]);

  // Keep radio playing state synchronized
  useEffect(() => {
    const checkRadio = () => {
      setIsRadioPlaying(soundEngine.getStatus().isPlaying);
    };
    const interval = setInterval(checkRadio, 1000);
    return () => clearInterval(interval);
  }, []);

  const stats = calculateStats(savedSessions);

  // Start fresh practice session
  const handleStartNewSession = useCallback((
    daily = false, 
    specificTarget?: Target, 
    specificCode?: string,
    tierOverride?: DifficultyTier
  ) => {
    const tier = tierOverride || selectedTier;
    const target = specificTarget || getRandomTarget(currentTarget.id, tier);
    const code = specificCode || generateBlindCode();
    
    setCurrentTarget(target);
    setCurrentBlindCode(code);
    setIsDailyTarget(daily);
    setCurrentSessionResult(null);
    setSessionPhase('viewing');
    setActiveView('session');
  }, [currentTarget.id, selectedTier]);

  // Change difficulty tier
  const handleChangeTier = (tier: DifficultyTier) => {
    setSelectedTier(tier);
    handleStartNewSession(false, undefined, undefined, tier);
  };

  // Submit impressions and unveil 3-way evaluation with Judge Mode
  const handleSubmitImpressions = (impressions: UserImpressions, method: ViewingMethodInfo) => {
    const score = calculateScore(impressions.selectedDescriptors, currentTarget);
    
    // Generate 4 candidate options (1 real + 3 decoys) for Judge Mode
    const judgeCandidates = generateJudgeCandidates(currentTarget);

    const newSession: SessionResult = {
      id: `session_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      date: new Date().toISOString(),
      code: currentBlindCode,
      targetId: currentTarget.id,
      target: currentTarget,
      difficultyTier: currentTarget.tier,
      impressions,
      method,
      score,
      judge: {
        options: judgeCandidates,
        selectedTargetId: null,
        isHit: null,
      },
      selfRating: null, // user will assign in reveal phase
      isDailyTarget,
    };

    saveSession(newSession);
    setCurrentSessionResult(newSession);
    setSessionPhase('revealed');
    refreshSessions();
  };

  // Handle blind judge selection
  const handleJudgeSelect = (selectedTargetId: string) => {
    if (!currentSessionResult) return;
    const updated = updateSessionJudge(currentSessionResult.id, selectedTargetId);
    if (updated) {
      setCurrentSessionResult(updated);
      refreshSessions();
    }
  };

  // Update canonical self-rating
  const handleUpdateSelfRating = (rating: SelfRating, notes?: string) => {
    if (!currentSessionResult) return;
    const updated = updateSessionRating(currentSessionResult.id, rating, notes);
    if (updated) {
      setCurrentSessionResult(updated);
      refreshSessions();
    }
  };

  // Launch daily session from DailyTargetView
  const handleStartDailyTarget = (code: string, targetId: string) => {
    const target = TARGET_POOL.find(t => t.id === targetId) || TARGET_POOL[0];
    handleStartNewSession(true, target, code);
  };

  // Review an already completed session from history
  const handleReviewSession = (session: SessionResult) => {
    setCurrentSessionResult(session);
    setCurrentTarget(session.target);
    setCurrentBlindCode(session.code);
    setIsDailyTarget(Boolean(session.isDailyTarget));
    setSessionPhase('revealed');
    setActiveView('session');
  };

  return (
    <div className="min-h-screen bg-[#080914] text-[#E0E2EC] cosmic-bg flex flex-col selection:bg-[#2DD4BF]/25 selection:text-[#F3E8FF]">
      {/* Top Bar Header adhering strictly to Top Bar Contract */}
      <Header
        activeView={activeView}
        onSelectView={view => {
          if (view === 'protocol') {
            setIsProtocolModalOpen(true);
          } else {
            setActiveView(view);
          }
        }}
        onNewSession={() => handleStartNewSession(false)}
        onToggleRadio={() => setIsRadioOpen(!isRadioOpen)}
        isRadioPlaying={isRadioPlaying}
        streakCount={stats.dailyStreak}
      />

      {/* Collapsible Meditation Ambient Radio Bar */}
      {isRadioOpen && (
        <div className="border-b border-[#242A5C] bg-[#0A0C1C] py-4 px-4 sm:px-6">
          <div className="max-w-5xl mx-auto">
            <AmbientPlayer isOpen={isRadioOpen} onClose={() => setIsRadioOpen(false)} />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 pb-16">
        {activeView === 'session' && (
          <>
            {sessionPhase === 'viewing' ? (
              <ViewingPhase
                blindCode={currentBlindCode}
                isDailyTarget={isDailyTarget}
                selectedTier={selectedTier}
                onChangeTier={handleChangeTier}
                onSubmit={handleSubmitImpressions}
                onOpenProtocol={() => setIsProtocolModalOpen(true)}
                onOpenAmbientRadio={() => setIsRadioOpen(true)}
              />
            ) : currentSessionResult ? (
              <RevealPhase
                session={currentSessionResult}
                onUpdateSelfRating={handleUpdateSelfRating}
                onJudgeSelect={handleJudgeSelect}
                onNextSession={() => handleStartNewSession(false)}
                onViewStats={() => setActiveView('stats')}
              />
            ) : null}
          </>
        )}

        {activeView === 'daily' && (
          <DailyTargetView
            onStartDailySession={handleStartDailyTarget}
            onViewCompletedSession={handleReviewSession}
          />
        )}

        {activeView === 'circles' && (
          <CircleSessions />
        )}

        {activeView === 'breathing' && (
          <div className="py-8 px-4">
            <BreathingGuide />
          </div>
        )}

        {activeView === 'dreams' && (
          <DreamJournal
            sessions={savedSessions}
            onSelectSessionToReview={handleReviewSession}
          />
        )}

        {activeView === 'guides' && (
          <MalychiteBlog />
        )}

        {activeView === 'stats' && (
          <StatsView
            sessions={savedSessions}
            stats={stats}
            onSelectSession={handleReviewSession}
            onRefreshData={refreshSessions}
            onStartNewSession={() => handleStartNewSession(false)}
          />
        )}
      </main>

      {/* Quiet, Anti-Slop Footer */}
      <footer className="border-t border-[#242A5C]/40 py-6 px-4 text-center text-xs text-[#71779E]">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-display font-semibold text-transparent bg-clip-text bg-gradient-to-r from-[#D8B4FE] to-[#2DD4BF] tracking-wider">SCRY</span>
            <span aria-hidden="true">·</span>
            <span>Blind Remote Viewing & Sensory Calibration</span>
            <span aria-hidden="true">·</span>
            <span className="text-[#8B9BFF]">Malychite / Poshunz Lane</span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 text-[11px] text-[#8A90B8]">
            <span>Local Browser Storage</span>
            <span aria-hidden="true">·</span>
            <button
              type="button"
              onClick={() => setIsProtocolModalOpen(true)}
              className="hover:text-[#2DD4BF] transition-colors"
            >
              CRV Protocol
            </button>
            <span aria-hidden="true">·</span>
            <button
              type="button"
              onClick={() => setActiveView('guides')}
              className="hover:text-[#2DD4BF] transition-colors"
            >
              Malychite Guides
            </button>
            <span aria-hidden="true">·</span>
            <span>Chance Baseline 25%</span>
          </div>
        </div>
      </footer>

      {/* Protocol Guide Modal */}
      <ProtocolGuideModal
        isOpen={isProtocolModalOpen}
        onClose={() => setIsProtocolModalOpen(false)}
      />
    </div>
  );
}
