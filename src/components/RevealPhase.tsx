import React, { useState } from 'react';
import { SessionResult, SelfRating, Target } from '../types';
import { 
  Check, 
  X, 
  Sparkles, 
  MapPin, 
  Compass, 
  ArrowRight, 
  Award, 
  Clock, 
  Sliders, 
  ShieldCheck, 
  HelpCircle,
  Eye
} from 'lucide-react';
import { soundEngine } from '../utils/audioEngine';

interface RevealPhaseProps {
  session: SessionResult;
  onUpdateSelfRating: (rating: SelfRating, notes?: string) => void;
  onJudgeSelect: (selectedTargetId: string) => void;
  onNextSession: () => void;
  onViewStats: () => void;
}

export const RevealPhase: React.FC<RevealPhaseProps> = ({
  session,
  onUpdateSelfRating,
  onJudgeSelect,
  onNextSession,
  onViewStats,
}) => {
  const [selectedRating, setSelectedRating] = useState<SelfRating | null>(session.selfRating);
  const [reflectionNotes, setReflectionNotes] = useState<string>(session.reflectionNotes || '');
  const [imgError, setImgError] = useState(false);
  const [activeJudgeCandidate, setActiveJudgeCandidate] = useState<string | null>(
    session.judge?.selectedTargetId || null
  );

  const { target, impressions, score, code, method, judge } = session;
  const isJudged = Boolean(judge && judge.selectedTargetId);

  const handleRatingSelect = (rating: SelfRating) => {
    setSelectedRating(rating);
    onUpdateSelfRating(rating, reflectionNotes);
  };

  const handleNotesBlur = () => {
    if (selectedRating) {
      onUpdateSelfRating(selectedRating, reflectionNotes);
    }
  };

  const handleConfirmJudge = (candidateId: string) => {
    setActiveJudgeCandidate(candidateId);
    onJudgeSelect(candidateId);
    soundEngine.playSingingBowlChime();
  };

  const getVerdictStyle = (verdict: string) => {
    switch (verdict) {
      case 'Strong match':
        return 'text-emerald-400 border-emerald-500/40 bg-emerald-950/40';
      case 'Partial match':
        return 'text-[#5EEAD4] border-[#2DD4BF]/40 bg-[#0E242B]/60';
      case 'No match':
      default:
        return 'text-[#8A90B8] border-[#384078]/40 bg-[#141733]/40';
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-6 px-4 sm:px-6">
      {/* Target Unveiling Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#141733] border border-[#242A5C] text-xs text-[#2DD4BF] mb-3">
          <Sparkles className="w-3.5 h-3.5 text-[#C4B5FD]" />
          <span>Coordinate Vector Decrypted · 3-Way Scoring Protocol</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white font-display tracking-wide">
          Verification & Evaluation Phase
        </h1>
        <p className="mt-2 text-sm text-[#9FA6D1] max-w-lg mx-auto">
          Evaluate impressions via blind Judge Mode, automated descriptor correlation, and canonical self-rating.
        </p>
      </div>

      {/* STEP 1: JUDGE MODE (BLIND 4-WAY SELECTION) */}
      {judge && !isJudged && (
        <div className="bg-gradient-to-b from-[#141738] to-[#0D0F22] border-2 border-[#2DD4BF]/60 rounded-2xl p-6 sm:p-8 shadow-2xl mb-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-72 h-72 bg-gradient-to-br from-[#C4B5FD]/10 via-[#2DD4BF]/10 to-transparent rounded-full blur-3xl pointer-events-none" />
          <div className="text-center max-w-xl mx-auto mb-6 relative z-10">
            <span className="text-xs font-mono-code uppercase tracking-widest text-[#C4B5FD] block mb-1">
              Method (B): Blind Evaluation
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-white font-display">
              Judge Mode — 4-Choice Blind Match
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-[#B4BADF] leading-relaxed">
              Based on your recorded impressions below, which of these 4 potential targets best corresponds to what you perceived?
              Random guessing yields a <strong>25% chance baseline</strong>.
            </p>
          </div>

          {/* User Perceptions Quick Review Box */}
          <div className="p-4 rounded-xl bg-[#080914] border border-[#242A5C] mb-6 relative z-10">
            <div className="text-xs font-mono-code text-[#787EA8] uppercase mb-2">
              Your Recorded Perceptions for Vector {code}:
            </div>
            {impressions.freeText && (
              <p className="text-xs sm:text-sm text-[#E0E2EC] italic mb-3">
                "{impressions.freeText}"
              </p>
            )}
            {impressions.sketchDataUrl && (
              <div className="mb-3 max-h-24 overflow-hidden rounded border border-[#242A5C] bg-[#0B0D1F] p-1 inline-block">
                <img src={impressions.sketchDataUrl} alt="Sketch" className="max-h-20 object-contain" />
              </div>
            )}
            <div className="flex flex-wrap gap-1.5">
              {impressions.selectedDescriptors.map(d => (
                <span key={d} className="text-[11px] px-2 py-0.5 rounded bg-[#141E38] text-[#5EEAD4] border border-[#2D3A6C]">
                  {d.replace(/_/g, ' ')}
                </span>
              ))}
            </div>
          </div>

          {/* 4 Candidate Target Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 relative z-10">
            {judge.options.map(candidate => (
              <div
                key={candidate.id}
                onClick={() => setActiveJudgeCandidate(candidate.id)}
                className={`p-3 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                  activeJudgeCandidate === candidate.id
                    ? 'bg-[#17203F] border-[#2DD4BF] ring-2 ring-[#2DD4BF]/40 shadow-lg scale-[1.02]'
                    : 'bg-[#080914] border-[#242A5C] hover:border-[#384078]'
                }`}
              >
                <div>
                  <div className="aspect-video w-full rounded-lg bg-[#141733] overflow-hidden mb-2 relative">
                    <img
                      src={candidate.photo}
                      alt={candidate.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <h3 className="font-display text-sm font-bold text-white mb-1">
                    {candidate.name}
                  </h3>
                  <p className="text-[11px] text-[#8A90B8] mb-2">{candidate.location}</p>
                  <p className="text-[11px] text-[#A2A9D4] line-clamp-3 leading-relaxed mb-3">
                    {candidate.description}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleConfirmJudge(candidate.id);
                  }}
                  className={`w-full py-2 rounded-lg text-xs font-semibold uppercase tracking-wider font-display transition-all ${
                    activeJudgeCandidate === candidate.id
                      ? 'bg-gradient-to-r from-[#C4B5FD] to-[#2DD4BF] text-[#080914] shadow font-bold'
                      : 'bg-[#141733] text-[#8A90B8] hover:text-white'
                  }`}
                >
                  {activeJudgeCandidate === candidate.id ? 'Confirm As Best Fit' : 'Select Target'}
                </button>
              </div>
            ))}
          </div>

          <div className="text-center text-xs text-[#71779E] relative z-10">
            A judging friend can also inspect your notes and make this pick on your behalf.
          </div>
        </div>
      )}

      {/* JUDGE RESULT BANNER (ONCE DECISION IS LOCKED) */}
      {judge && isJudged && (
        <div className={`p-5 rounded-2xl border mb-8 flex flex-col sm:flex-row items-center justify-between gap-4 ${
          judge.isHit
            ? 'bg-emerald-950/50 border-emerald-500/50 text-emerald-200'
            : 'bg-[#1E172E] border-[#A78BFA]/40 text-[#E0E2EC]'
        }`}>
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${
              judge.isHit ? 'bg-emerald-900 text-emerald-300' : 'bg-[#261E3F] text-[#D8B4FE]'
            }`}>
              {judge.isHit ? '✓' : '—'}
            </div>
            <div>
              <div className="text-xs font-mono-code uppercase tracking-wider">
                Judge Mode (Blind 4-Way Match): {judge.isHit ? 'HIT (Target Correctly Identified)' : 'DECOY SELECTED'}
              </div>
              <div className="text-xs text-[#A2A9D4] mt-0.5">
                {judge.isHit
                  ? 'Your impressions provided sufficient signal for the blind judge to identify the true target out of 4 candidates.'
                  : 'The judge chose a decoy candidate. This trial logged against the 25% random guessing baseline.'}
              </div>
            </div>
          </div>

          <div className="text-right text-xs shrink-0 font-mono-code px-3 py-1.5 rounded-lg bg-[#080914] border border-[#242A5C]">
            <span className="text-[#787EA8] mr-1">Chance Baseline:</span>
            <span className="text-white font-bold">25.0%</span>
          </div>
        </div>
      )}

      {/* SIDE-BY-SIDE COMPARISON */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Left Column: Target Reality */}
        <div className="bg-[#0E1026] border border-[#242A5C] rounded-2xl overflow-hidden shadow-xl flex flex-col">
          <div className="relative aspect-video w-full bg-[#141733] overflow-hidden">
            {!imgError ? (
              <img
                src={target.photo}
                alt={target.name}
                referrerPolicy="no-referrer"
                onError={() => setImgError(true)}
                className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
              />
            ) : (
              <div 
                className="w-full h-full flex flex-col items-center justify-center p-6 text-center"
                style={{
                  background: `radial-gradient(circle at 50% 50%, ${target.dominantColor}33, #0E1026 90%)`,
                }}
              >
                <Compass className="w-12 h-12 text-[#2DD4BF] mb-2 stroke-1" />
                <h3 className="font-display text-lg text-white font-semibold">{target.name}</h3>
                <p className="text-xs text-[#9FA6D1]">{target.location}</p>
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-[#0E1026] via-transparent to-transparent pointer-events-none" />
            
            <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between">
              <div>
                <span className="text-[11px] font-mono-code text-[#C4B5FD] uppercase tracking-wider">
                  Target Identity · Tier {target.tier}
                </span>
                <h2 className="text-xl sm:text-2xl font-bold text-white font-display leading-tight">
                  {target.name}
                </h2>
              </div>
            </div>
          </div>

          {/* Target Metadata & Description */}
          <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-3 text-xs text-[#8A90B8] mb-3">
                <span className="flex items-center gap-1 text-[#C0C5E5]">
                  <MapPin className="w-3.5 h-3.5 text-[#2DD4BF]" />
                  <span>{target.location}</span>
                </span>
                <span aria-hidden="true">·</span>
                <span className="font-mono-code text-[#787EA8]">{target.coordinates}</span>
              </div>

              <p className="text-sm text-[#C0C5E5] leading-relaxed mb-5">
                {target.description}
              </p>
            </div>

            {/* Target Catalog Attributes */}
            <div>
              <div className="text-xs uppercase tracking-wider text-[#787EA8] font-mono-code mb-2">
                Documented Physical Attributes
              </div>
              <div className="flex flex-wrap gap-1.5">
                {target.hiddenTags.map(tag => {
                  const wasMatched = score.matchedTags.includes(tag);
                  return (
                    <span
                      key={tag}
                      className={`text-xs px-2.5 py-1 rounded-md border transition-all ${
                        wasMatched
                          ? 'bg-[#152538] border-[#2DD4BF] text-[#FFF] font-medium shadow-sm shadow-[#2DD4BF]/20'
                          : 'bg-[#141733]/50 border-[#242A5C] text-[#71779E]'
                      }`}
                    >
                      {wasMatched && <span className="text-[#2DD4BF] mr-1">✓</span>}
                      <span>{tag.replace(/_/g, ' ')}</span>
                    </span>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Perceiver's Record */}
        <div className="bg-[#0E1026] border border-[#242A5C] rounded-2xl p-5 sm:p-6 shadow-xl flex flex-col justify-between">
          <div>
            {/* Header: Blind Code & Session Duration */}
            <div className="flex items-center justify-between border-b border-[#242A5C]/60 pb-3 mb-4">
              <div>
                <span className="text-[11px] font-mono-code text-[#787EA8] uppercase tracking-wider">
                  Blind Vector
                </span>
                <div className="font-mono-code text-xl font-bold text-[#2DD4BF] tracking-wider">
                  {code}
                </div>
              </div>

              <div className="text-right text-xs text-[#8A90B8]">
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-[#C4B5FD]" />
                  <span className="font-mono-code">{Math.floor(impressions.focusDurationSeconds / 60)}m {impressions.focusDurationSeconds % 60}s focus</span>
                </span>
                <span className="text-[11px] text-[#787EA8]">
                  {new Date(session.date).toLocaleDateString()}
                </span>
              </div>
            </div>

            {/* Method Telemetry Badge */}
            {method && (
              <div className="mb-4 p-2.5 rounded-xl bg-[#080914] border border-[#242A5C] flex flex-wrap items-center justify-between gap-2 text-xs text-[#8A90B8]">
                <span>
                  <strong className="text-white">Method:</strong> {method.technique}
                </span>
                <span className="font-mono-code text-[11px]">
                  {method.meditationLengthMinutes}m centering · {method.timeOfDay}
                </span>
              </div>
            )}

            {/* User Free Text Impressions */}
            <div className="mb-4">
              <div className="text-xs uppercase tracking-wider text-[#787EA8] font-mono-code mb-1.5">
                Perception Stream
              </div>
              <div className="p-3.5 rounded-xl bg-[#080914] border border-[#242A5C] text-sm text-[#E0E2EC] leading-relaxed italic min-h-[60px]">
                {impressions.freeText ? (
                  `"${impressions.freeText}"`
                ) : (
                  <span className="text-[#565C83] not-italic">No free text notes recorded.</span>
                )}
              </div>
            </div>

            {/* User Sketch */}
            {impressions.sketchDataUrl && (
              <div className="mb-4">
                <div className="text-xs uppercase tracking-wider text-[#787EA8] font-mono-code mb-1.5">
                  Ideogram Sketch
                </div>
                <div className="rounded-xl border border-[#242A5C] bg-[#080914] p-2 flex items-center justify-center max-h-[160px] overflow-hidden">
                  <img
                    src={impressions.sketchDataUrl}
                    alt="User Ideogram Sketch"
                    className="max-h-[150px] object-contain rounded"
                  />
                </div>
              </div>
            )}

            {/* Selected Descriptors */}
            <div>
              <div className="text-xs uppercase tracking-wider text-[#787EA8] font-mono-code mb-2">
                Selected Descriptors ({impressions.selectedDescriptors.length})
              </div>
              {impressions.selectedDescriptors.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {impressions.selectedDescriptors.map(desc => {
                    const isHit = score.matchedTags.includes(desc);
                    return (
                      <span
                        key={desc}
                        className={`text-xs px-2.5 py-1 rounded-md border flex items-center gap-1 ${
                          isHit
                            ? 'bg-[#1A2558] border-emerald-500/50 text-emerald-300'
                            : 'bg-[#141733]/50 border-[#242A5C] text-[#8A90B8]'
                        }`}
                      >
                        {isHit ? (
                          <Check className="w-3 h-3 text-emerald-400 stroke-[3]" />
                        ) : (
                          <X className="w-3 h-3 text-[#5A608B]" />
                        )}
                        <span>{desc.replace(/_/g, ' ')}</span>
                      </span>
                    );
                  })}
                </div>
              ) : (
                <p className="text-xs text-[#565C83] italic">No descriptors selected.</p>
              )}
            </div>
          </div>

          {/* Quick Score Summary Strip */}
          <div className="mt-5 pt-4 border-t border-[#242A5C]/60 flex items-center justify-between">
            <div className="text-xs text-[#8A90B8]">
              Automated Descriptor Match:
            </div>
            <div className="flex items-center gap-2">
              <span className="font-mono-code text-lg font-bold text-white">
                {score.percentage}%
              </span>
              <span className={`text-xs px-2.5 py-0.5 rounded-full border ${getVerdictStyle(score.verdict)}`}>
                {score.verdict}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* METHOD (A): AUTOMATED DESCRIPTOR OVERLAP SCORE */}
      <div className="bg-[#0E1026] border border-[#242A5C] rounded-2xl p-5 sm:p-6 mb-8 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-[#2DD4BF]" />
            <h3 className="font-display text-base font-semibold text-white">
              Method (A): Physical Descriptor Overlap: {score.percentage}% ({score.verdict})
            </h3>
          </div>
          <span className="text-xs text-[#787EA8] font-mono-code">
            {score.matchedTags.length} harmonized / {impressions.selectedDescriptors.length} selected
          </span>
        </div>

        <p className="text-xs sm:text-sm text-[#9FA6D1] leading-relaxed mb-4">
          {score.explanation} Controlled remote viewing data often mirrors structural gestalt, emotional valence, and environmental topology that automated word matching cannot fully quantify.
        </p>

        {/* Matched vs Unmatched Pills */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
          <div className="p-3 rounded-xl bg-[#080914] border border-[#242A5C]">
            <span className="font-semibold text-emerald-400 block mb-1">
              ✓ Correlating Signatures ({score.matchedTags.length})
            </span>
            <span className="text-[#A2A9D4]">
              {score.matchedTags.length > 0
                ? score.matchedTags.map(t => t.replace(/_/g, ' ')).join(', ')
                : 'None directly matched in this session.'}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-[#080914] border border-[#242A5C]">
            <span className="font-semibold text-[#8A90B8] block mb-1">
              Divergent Impressions ({score.unmatchedSelected.length})
            </span>
            <span className="text-[#6C729E]">
              {score.unmatchedSelected.length > 0
                ? score.unmatchedSelected.map(t => t.replace(/_/g, ' ')).join(', ')
                : 'All selected descriptors aligned with target tags.'}
            </span>
          </div>
        </div>
      </div>

      {/* METHOD (C): CANONICAL SELF-RATING (WHAT COUNTS IN HISTORY) */}
      <div className="bg-gradient-to-b from-[#141738] to-[#0E1026] border-2 border-[#A78BFA]/50 rounded-2xl p-6 sm:p-8 shadow-2xl mb-8 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-64 h-64 bg-gradient-to-br from-[#C4B5FD]/10 via-[#2DD4BF]/10 to-transparent rounded-full blur-3xl pointer-events-none" />
        <div className="text-center max-w-xl mx-auto mb-6 relative z-10">
          <span className="text-xs font-mono-code uppercase tracking-widest text-[#C4B5FD] block mb-1">
            Method (C): Canonical History Benchmark
          </span>
          <h2 className="text-xl sm:text-2xl font-bold text-white font-display">
            Self-Rated Resonance Confirmation
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-[#B4BADF] leading-relaxed">
            Because sensory impressions are subjective, metaphorical, and personal, <strong>your self-assessment is what records as the true accuracy metric in your training history</strong>.
          </p>
        </div>

        {/* 3 Rating Choices */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6 max-w-2xl mx-auto relative z-10">
          <button
            type="button"
            onClick={() => handleRatingSelect('yes')}
            className={`p-4 rounded-xl border text-center transition-all ${
              selectedRating === 'yes'
                ? 'bg-emerald-950/70 border-emerald-400 ring-2 ring-emerald-400/30 text-white shadow-lg'
                : 'bg-[#0E1026] border-[#242A5C] text-[#9FA6D1] hover:border-emerald-500/50 hover:text-white'
            }`}
          >
            <div className="text-base font-semibold mb-1 text-emerald-400 font-display">
              Yes
            </div>
            <div className="text-xs text-[#B4BADF]">
              Strong Match
            </div>
            <div className="text-[11px] text-[#71779E] mt-1">
              Clear gestalt or structural resonance
            </div>
          </button>

          <button
            type="button"
            onClick={() => handleRatingSelect('partially')}
            className={`p-4 rounded-xl border text-center transition-all ${
              selectedRating === 'partially'
                ? 'bg-[#152538] border-[#2DD4BF] ring-2 ring-[#2DD4BF]/30 text-white shadow-lg'
                : 'bg-[#0E1026] border-[#242A5C] text-[#9FA6D1] hover:border-[#2DD4BF]/50 hover:text-white'
            }`}
          >
            <div className="text-base font-semibold mb-1 text-[#2DD4BF] font-display">
              Partially
            </div>
            <div className="text-xs text-[#B4BADF]">
              Subtle Resonance
            </div>
            <div className="text-[11px] text-[#71779E] mt-1">
              Some elements matched amidst noise
            </div>
          </button>

          <button
            type="button"
            onClick={() => handleRatingSelect('no')}
            className={`p-4 rounded-xl border text-center transition-all ${
              selectedRating === 'no'
                ? 'bg-[#24171E] border-rose-400 ring-2 ring-rose-400/30 text-white shadow-lg'
                : 'bg-[#0E1026] border-[#242A5C] text-[#9FA6D1] hover:border-rose-500/50 hover:text-white'
            }`}
          >
            <div className="text-base font-semibold mb-1 text-rose-300 font-display">
              No
            </div>
            <div className="text-xs text-[#B4BADF]">
              Divergence / Miss
            </div>
            <div className="text-[11px] text-[#71779E] mt-1">
              No apparent correlation observed
            </div>
          </button>
        </div>

        {/* Reflection Notes */}
        <div className="max-w-xl mx-auto relative z-10">
          <label htmlFor="reflection-notes" className="text-xs text-[#8A90B8] mb-1.5 block">
            Post-Session Reflection & Analytical Overlay (AOL) notes (optional):
          </label>
          <input
            id="reflection-notes"
            type="text"
            value={reflectionNotes}
            onChange={e => setReflectionNotes(e.target.value)}
            onBlur={handleNotesBlur}
            placeholder="e.g. Mistook the bridge spans for high-voltage towers, felt strong fog moisture..."
            className="w-full bg-[#080914] border border-[#242A5C] rounded-lg px-3.5 py-2.5 text-xs sm:text-sm text-[#E0E2EC] placeholder-[#4F5478] focus:outline-none focus:border-[#2DD4BF]"
          />
        </div>
      </div>

      {/* Action Footer */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <button
          type="button"
          onClick={onViewStats}
          className="text-xs sm:text-sm text-[#8A90B8] hover:text-[#2DD4BF] transition-colors"
        >
          ← View Logbook & Chance Baseline Stats
        </button>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            type="button"
            onClick={onNextSession}
            className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-[#C4B5FD] via-[#A78BFA] to-[#2DD4BF] text-[#080914] font-semibold text-xs sm:text-sm rounded-xl shadow-lg shadow-[#2DD4BF]/25 hover:from-white hover:to-[#5EEAD4] active:scale-95 transition-all flex items-center justify-center gap-2 font-display uppercase tracking-wider"
          >
            <span>Begin Next Session</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
