import React, { useState, useEffect } from 'react';
import { getDailyTargetInfo } from '../utils/codeGenerator';
import { getSavedSessions } from '../utils/storage';
import { SessionResult } from '../types';
import { Compass, Flame, Clock, Calendar, CheckCircle2, ArrowRight } from 'lucide-react';

interface DailyTargetViewProps {
  onStartDailySession: (code: string, targetId: string) => void;
  onViewCompletedSession: (session: SessionResult) => void;
}

export const DailyTargetView: React.FC<DailyTargetViewProps> = ({
  onStartDailySession,
  onViewCompletedSession,
}) => {
  const [dailyInfo, setDailyInfo] = useState(getDailyTargetInfo());
  const [completedSession, setCompletedSession] = useState<SessionResult | null>(null);
  const [timeLeft, setTimeLeft] = useState<{ hours: number; minutes: number; seconds: number }>({
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const info = getDailyTargetInfo();
    setDailyInfo(info);

    // Check if user already completed today's daily target
    const sessions = getSavedSessions();
    const todayStr = info.dateKey;
    const found = sessions.find(s => {
      const sessionDateStr = new Date(s.date).toISOString().split('T')[0];
      return s.isDailyTarget && sessionDateStr === todayStr;
    });

    setCompletedSession(found || null);
  }, []);

  // Countdown to next midnight
  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      const tomorrow = new Date(now);
      tomorrow.setDate(now.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);

      const diff = tomorrow.getTime() - now.getTime();
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft({ hours, minutes, seconds });
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, []);

  const formattedDate = new Date().toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div className="max-w-3xl mx-auto py-8 px-4 sm:px-6">
      <div className="bg-gradient-to-b from-[#141738] to-[#0D0F22] border border-[#242A5C] rounded-2xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        {/* Subtle decorative glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-[#C4B5FD]/15 via-[#2DD4BF]/15 to-transparent rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#242A5C]/60 pb-5 mb-6">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-mono-code text-[#C4B5FD] mb-1">
              <Calendar className="w-3.5 h-3.5" />
              <span>{formattedDate}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white font-display">
              Universal Daily Target
            </h1>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto bg-[#080914] border border-[#242A5C] px-3.5 py-1.5 rounded-xl text-xs text-[#8A90B8]">
            <Clock className="w-3.5 h-3.5 text-[#2DD4BF]" />
            <span>Next target in:</span>
            <span className="font-mono-code text-white font-semibold">
              {String(timeLeft.hours).padStart(2, '0')}:{String(timeLeft.minutes).padStart(2, '0')}:{String(timeLeft.seconds).padStart(2, '0')}
            </span>
          </div>
        </div>

        <p className="text-sm text-[#9FA6D1] leading-relaxed mb-6">
          Every day at midnight UTC, a single target from the global pool is synchronized for all practitioners worldwide. The blind code is shared globally, allowing remote viewers to calibrate against an identical coordinate vector.
        </p>

        {/* Daily Coordinate Display or Completed State */}
        {completedSession ? (
          <div className="p-6 rounded-xl bg-[#080914] border border-emerald-500/40 text-center mb-6">
            <div className="w-12 h-12 rounded-full bg-emerald-950/60 border border-emerald-400/40 text-emerald-400 flex items-center justify-center mx-auto mb-3">
              <CheckCircle2 className="w-6 h-6" />
            </div>

            <h3 className="text-lg font-bold text-white font-display mb-1">
              Today's Daily Target Completed
            </h3>
            <p className="text-xs text-[#8A90B8] mb-4">
              Coordinate {completedSession.code} · Target: {completedSession.target.name}
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4 text-xs mb-6">
              <div className="px-3 py-1.5 rounded-lg bg-[#141733] border border-[#242A5C]">
                <span className="text-[#787EA8] mr-1.5">Algorithmic Match:</span>
                <span className="font-mono-code text-white font-bold">{completedSession.score.percentage}%</span>
              </div>
              <div className="px-3 py-1.5 rounded-lg bg-[#141733] border border-[#242A5C]">
                <span className="text-[#787EA8] mr-1.5">Your Self-Rating:</span>
                <span className="font-semibold text-[#2DD4BF] capitalize">
                  {completedSession.selfRating ? completedSession.selfRating : 'Unrated'}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => onViewCompletedSession(completedSession)}
              className="px-6 py-2.5 rounded-xl bg-[#242A5C] text-[#5EEAD4] hover:bg-[#2F3775] hover:text-white transition-all text-xs font-semibold uppercase tracking-wider font-display"
            >
              Review Today's Unveiled Record
            </button>
          </div>
        ) : (
          <div className="p-6 rounded-xl bg-[#080914] border border-[#242A5C] text-center mb-6">
            <span className="text-xs font-mono-code uppercase tracking-widest text-[#787EA8] block mb-2">
              Synchronized Blind Vector
            </span>

            <div className="font-mono-code text-4xl sm:text-5xl font-bold tracking-[0.25em] text-[#FFF] my-3">
              {dailyInfo.code}
            </div>

            <p className="text-xs text-[#71779E] max-w-sm mx-auto mb-6">
              The target remains sealed in zero-knowledge state until your session impressions are submitted.
            </p>

            <button
              type="button"
              onClick={() => onStartDailySession(dailyInfo.code, dailyInfo.target.id)}
              className="px-8 py-3.5 bg-gradient-to-r from-[#C4B5FD] via-[#A78BFA] to-[#2DD4BF] text-[#080914] font-semibold text-sm rounded-xl shadow-lg shadow-[#2DD4BF]/25 hover:from-white hover:to-[#5EEAD4] active:scale-95 transition-all inline-flex items-center gap-2 font-display uppercase tracking-wider"
            >
              <span>Begin Daily Viewing Session</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-[#8A90B8]">
          <div className="p-4 rounded-xl bg-[#0E1026] border border-[#242A5C]/60">
            <h4 className="font-semibold text-white mb-1">Double-Blind Integrity</h4>
            <p className="text-[#71779E] leading-relaxed">
              No metadata, category indicators, or geographic cues are transmitted to the interface prior to your submission.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#0E1026] border border-[#242A5C]/60">
            <h4 className="font-semibold text-white mb-1">Consistency Over Performance</h4>
            <p className="text-[#71779E] leading-relaxed">
              Remote viewing is a perceptual discipline. Daily practice trains neural discrimination between genuine signal and mental noise.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
