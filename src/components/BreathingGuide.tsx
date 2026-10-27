import React, { useState, useEffect } from 'react';
import { Play, Square, Wind, Sparkles, CheckCircle2 } from 'lucide-react';
import { soundEngine } from '../utils/audioEngine';

export const BreathingGuide: React.FC = () => {
  const [exercise, setExercise] = useState<'box' | '478' | 'bodyscan'>('box');
  const [isActive, setIsActive] = useState(false);
  const [phase, setPhase] = useState<string>('Ready');
  const [countdown, setCountdown] = useState<number>(4);
  const [cycleCount, setCycleCount] = useState<number>(0);

  // Exercise definitions
  const routines = {
    box: [
      { name: 'Inhale', duration: 4, action: 'Breathe in slowly through the nose' },
      { name: 'Hold', duration: 4, action: 'Hold gently with relaxed shoulders' },
      { name: 'Exhale', duration: 4, action: 'Slow, steady release through the mouth' },
      { name: 'Hold Empty', duration: 4, action: 'Rest in the quiet stillness' },
    ],
    '478': [
      { name: 'Inhale', duration: 4, action: 'Inhale quietly through the nose' },
      { name: 'Hold', duration: 7, action: 'Retain the breath with peaceful awareness' },
      { name: 'Exhale', duration: 8, action: 'Whoosh exhale completely through mouth' },
    ],
    bodyscan: [
      { name: 'Crown & Brow', duration: 6, action: 'Release tension in forehead, eyes, and jaw' },
      { name: 'Throat & Shoulders', duration: 6, action: 'Let shoulders drop away from ears' },
      { name: 'Chest & Core', duration: 6, action: 'Soften belly, feel heart cadence slow' },
      { name: 'Hands & Feet', duration: 6, action: 'Feel warmth tingling at your extremities' },
      { name: 'Non-Local Horizon', duration: 8, action: 'Expand awareness beyond the physical room' },
    ],
  };

  useEffect(() => {
    let timer: any = null;
    if (isActive) {
      const activeRoutine = routines[exercise];
      let stepIdx = 0;
      let remaining = activeRoutine[0].duration;
      setPhase(activeRoutine[0].name);
      setCountdown(remaining);

      timer = setInterval(() => {
        remaining -= 1;
        if (remaining <= 0) {
          stepIdx = (stepIdx + 1) % activeRoutine.length;
          if (stepIdx === 0) {
            setCycleCount(c => c + 1);
            soundEngine.playSingingBowlChime();
          }
          remaining = activeRoutine[stepIdx].duration;
          setPhase(activeRoutine[stepIdx].name);
        }
        setCountdown(remaining);
      }, 1000);
    } else {
      setPhase('Ready');
      setCountdown(exercise === '478' ? 4 : exercise === 'box' ? 4 : 6);
    }
    return () => clearInterval(timer);
  }, [isActive, exercise]);

  const handleToggle = () => {
    if (!isActive) {
      setIsActive(true);
      setCycleCount(0);
    } else {
      setIsActive(false);
    }
  };

  const getPacerScale = () => {
    if (!isActive) return 'scale-90';
    if (phase.includes('Inhale')) return 'scale-125 transition-transform duration-1000 ease-out';
    if (phase.includes('Exhale')) return 'scale-75 transition-transform duration-1000 ease-in';
    return 'scale-110';
  };

  return (
    <div className="max-w-2xl mx-auto bg-[#0D0F22] border border-[#242A5C] rounded-2xl p-6 sm:p-8 shadow-2xl text-center">
      <div className="inline-flex items-center gap-1.5 text-xs font-mono-code text-[#C4B5FD] mb-2">
        <Wind className="w-3.5 h-3.5" />
        <span>Pre-Session Centering & Neurological Quieting</span>
      </div>
      <h2 className="text-xl sm:text-2xl font-bold text-white font-display mb-4">
        Breathwork & Somatic Calibration
      </h2>

      {/* Routine Selector Tabs */}
      <div className="flex items-center justify-center gap-1.5 p-1 bg-[#141733] rounded-xl border border-[#242A5C] mb-8 max-w-md mx-auto">
        <button
          type="button"
          onClick={() => { setExercise('box'); setIsActive(false); }}
          className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-medium transition-all ${
            exercise === 'box' ? 'bg-[#242A5C] text-[#5EEAD4]' : 'text-[#8A90B8] hover:text-white'
          }`}
        >
          Box (4-4-4-4)
        </button>
        <button
          type="button"
          onClick={() => { setExercise('478'); setIsActive(false); }}
          className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-medium transition-all ${
            exercise === '478' ? 'bg-[#242A5C] text-[#5EEAD4]' : 'text-[#8A90B8] hover:text-white'
          }`}
        >
          4-7-8 Relax
        </button>
        <button
          type="button"
          onClick={() => { setExercise('bodyscan'); setIsActive(false); }}
          className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-medium transition-all ${
            exercise === 'bodyscan' ? 'bg-[#242A5C] text-[#5EEAD4]' : 'text-[#8A90B8] hover:text-white'
          }`}
        >
          Body Scan
        </button>
      </div>

      {/* Breathing Ring Pacer */}
      <div className="relative w-48 h-48 sm:w-56 sm:h-56 mx-auto my-6 flex items-center justify-center">
        {/* Outer glowing pulsing halo */}
        <div 
          className={`absolute inset-0 rounded-full bg-gradient-to-tr from-[#C4B5FD]/25 via-[#2DD4BF]/20 to-[#818CF8]/25 blur-xl ${getPacerScale()}`}
        />
        {/* Circular stroke container */}
        <div 
          className={`relative z-10 w-40 h-40 sm:w-48 sm:h-48 rounded-full border-2 border-[#2DD4BF] bg-[#080914]/80 flex flex-col items-center justify-center shadow-[0_0_30px_rgba(45,212,191,0.2)] ${getPacerScale()}`}
        >
          <span className="font-display text-lg sm:text-xl font-bold text-white tracking-wide">
            {phase}
          </span>
          <span className="font-mono-code text-3xl sm:text-4xl font-bold text-[#5EEAD4] my-1">
            {countdown}s
          </span>
          {isActive && (
            <span className="text-[10px] text-[#71779E] font-mono-code">
              Cycle {cycleCount + 1}
            </span>
          )}
        </div>
      </div>

      {/* Routine instruction notes */}
      <p className="text-xs sm:text-sm text-[#9FA6D1] max-w-md mx-auto mb-6 min-h-[36px]">
        {exercise === 'box' && 'Regulates the vagus nerve and anchors autonomic stillness before viewing.'}
        {exercise === '478' && 'Drives rapid parasympathetic takeover, suppressing Beta chatter.'}
        {exercise === 'bodyscan' && 'Systematically releases muscle tension to prepare for non-local aperture opening.'}
      </p>

      {/* Start / Stop Trigger */}
      <div className="flex items-center justify-center gap-3">
        <button
          type="button"
          onClick={handleToggle}
          className={`px-8 py-3 rounded-xl font-semibold text-xs uppercase tracking-wider font-display flex items-center gap-2 shadow-lg transition-all ${
            isActive
              ? 'bg-rose-900/60 border border-rose-500 text-rose-200 hover:bg-rose-900'
              : 'bg-gradient-to-r from-[#C4B5FD] via-[#A78BFA] to-[#2DD4BF] text-[#080914] shadow-[#2DD4BF]/25 hover:from-white hover:to-[#5EEAD4] hover:scale-[1.02]'
          }`}
        >
          {isActive ? (
            <>
              <Square className="w-4 h-4 fill-current" />
              <span>Conclude Breathing</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4 fill-current" />
              <span>Begin Guided Cadence</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
