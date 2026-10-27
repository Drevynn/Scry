import React, { useState, useEffect } from 'react';
import { GroupCircle, Target } from '../types';
import { TARGET_POOL } from '../data/targets';
import { generateBlindCode, getRandomTarget } from '../utils/codeGenerator';
import { Users, Plus, ShieldCheck, Sparkles, ChevronRight, Eye, Check } from 'lucide-react';

const CIRCLES_STORAGE_KEY = 'scry_circles_v1';
const LEGACY_CIRCLES_KEY = 'farsight_circles_v1';

export const CircleSessions: React.FC = () => {
  const [circles, setCircles] = useState<GroupCircle[]>([]);
  const [activeCircle, setActiveCircle] = useState<GroupCircle | null>(null);
  const [isRevealed, setIsRevealed] = useState<boolean>(false);

  // New participant input
  const [participantName, setParticipantName] = useState('');
  const [participantImpressions, setParticipantImpressions] = useState('');
  const [participantDescriptors, setParticipantDescriptors] = useState('');

  useEffect(() => {
    try {
      const raw = localStorage.getItem(CIRCLES_STORAGE_KEY) || localStorage.getItem(LEGACY_CIRCLES_KEY);
      if (raw) {
        setCircles(JSON.parse(raw));
      }
    } catch (e) {
      console.error('Failed to load circles', e);
    }
  }, []);

  const saveCircles = (list: GroupCircle[]) => {
    setCircles(list);
    localStorage.setItem(CIRCLES_STORAGE_KEY, JSON.stringify(list));
  };

  const handleCreateCircle = () => {
    const target = getRandomTarget();
    const code = generateBlindCode();
    const newCircle: GroupCircle = {
      id: `circle_${Date.now()}`,
      code,
      title: `Viewing Circle ${new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}`,
      createdAt: new Date().toISOString(),
      targetId: target.id,
      participants: [],
    };

    const updated = [newCircle, ...circles];
    saveCircles(updated);
    setActiveCircle(newCircle);
    setIsRevealed(false);
  };

  const handleAddParticipant = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeCircle || !participantName.trim()) return;

    const descArray = participantDescriptors
      .split(',')
      .map(d => d.trim().toLowerCase())
      .filter(Boolean);

    const updatedParticipants = [
      ...activeCircle.participants,
      {
        name: participantName.trim(),
        impressions: participantImpressions.trim(),
        descriptors: descArray,
        submittedAt: new Date().toISOString(),
      },
    ];

    const updatedCircle: GroupCircle = {
      ...activeCircle,
      participants: updatedParticipants,
    };

    const updatedList = circles.map(c => c.id === updatedCircle.id ? updatedCircle : c);
    saveCircles(updatedList);
    setActiveCircle(updatedCircle);

    setParticipantName('');
    setParticipantImpressions('');
    setParticipantDescriptors('');
  };

  const activeTarget: Target | undefined = activeCircle
    ? TARGET_POOL.find(t => t.id === activeCircle.targetId) || TARGET_POOL[0]
    : undefined;

  return (
    <div className="max-w-4xl mx-auto py-6 px-4 sm:px-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#242A5C]/60 pb-5 mb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-mono-code text-[#C4B5FD] mb-1">
            <Users className="w-3.5 h-3.5" />
            <span>Multi-Viewer Group Synchronization</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white font-display">
            Viewing Circles
          </h1>
        </div>

        <button
          type="button"
          onClick={handleCreateCircle}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#C4B5FD] via-[#A78BFA] to-[#2DD4BF] text-[#080914] font-semibold text-xs uppercase tracking-wider font-display shadow-md shadow-[#2DD4BF]/25 hover:from-white hover:to-[#5EEAD4] hover:scale-[1.02] transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Generate New Circle Vector</span>
        </button>
      </div>

      <p className="text-sm text-[#9FA6D1] leading-relaxed mb-6">
        Generate a shared blind coordinate vector to distribute to your practice circle or research group. Each practitioner records their perceptions independently without seeing others’ data. Once all entries are logged, unmask the target to analyze consensus resonance.
      </p>

      {activeCircle ? (
        <div className="space-y-6">
          {/* Active Circle Banner */}
          <div className="bg-[#0D0F22] border border-[#242A5C] rounded-2xl p-6 shadow-xl text-center relative overflow-hidden">
            <span className="text-xs font-mono-code uppercase tracking-widest text-[#787EA8] block mb-2">
              Circle Coordinate Vector
            </span>
            <div className="font-mono-code text-4xl sm:text-5xl font-bold tracking-[0.25em] text-[#FFF] my-2 select-all">
              {activeCircle.code}
            </div>
            <p className="text-xs text-[#5EEAD4] mb-4">
              Share this code with your group. Target identity is cryptographically held until unmasked.
            </p>

            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setIsRevealed(!isRevealed)}
                className={`px-5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider font-display transition-all ${
                  isRevealed
                    ? 'bg-[#141733] border border-[#242A5C] text-[#8A90B8]'
                    : 'bg-gradient-to-r from-[#C4B5FD] to-[#2DD4BF] text-[#080914] shadow-md hover:from-white hover:to-[#5EEAD4]'
                }`}
              >
                {isRevealed ? 'Hide Target Details' : 'Unveil Group Target'}
              </button>
            </div>
          </div>

          {/* Unveiled Target Card */}
          {isRevealed && activeTarget && (
            <div className="p-6 rounded-2xl bg-[#080914] border border-[#2DD4BF]/60 shadow-[0_0_20px_rgba(45,212,191,0.15)] flex flex-col sm:flex-row items-center gap-6">
              <div className="w-full sm:w-48 h-36 rounded-xl bg-[#141733] overflow-hidden shrink-0">
                <img
                  src={activeTarget.photo}
                  alt={activeTarget.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              </div>

              <div>
                <span className="text-xs font-mono-code text-[#C4B5FD] uppercase">Unveiled Target</span>
                <h3 className="font-display text-xl font-bold text-white mb-1">{activeTarget.name}</h3>
                <p className="text-xs text-[#8A90B8] mb-2">{activeTarget.location} · {activeTarget.coordinates}</p>
                <p className="text-xs text-[#C0C5E5] leading-relaxed mb-3">{activeTarget.description}</p>
                <div className="flex flex-wrap gap-1.5">
                  {activeTarget.hiddenTags.map(t => (
                    <span key={t} className="text-[11px] px-2 py-0.5 rounded bg-[#141733] text-[#5EEAD4] border border-[#242A5C]">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Add Member Impression Form */}
          <form onSubmit={handleAddParticipant} className="bg-[#0E1026] border border-[#242A5C] rounded-2xl p-5 sm:p-6 shadow-lg">
            <h3 className="text-xs font-bold text-[#C4B5FD] uppercase tracking-wider font-display mb-3">
              Add Practitioner Submission Under Coordinate {activeCircle.code}
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="text-xs text-[#8A90B8] block mb-1">Viewer Name / Moniker</label>
                <input
                  type="text"
                  required
                  value={participantName}
                  onChange={e => setParticipantName(e.target.value)}
                  placeholder="e.g. Malychite, Orion, Viewer 02..."
                  className="w-full bg-[#080914] border border-[#242A5C] rounded-lg px-3.5 py-2 text-xs text-white focus:outline-none focus:border-[#2DD4BF]"
                />
              </div>

              <div>
                <label className="text-xs text-[#8A90B8] block mb-1">Descriptors (comma-separated)</label>
                <input
                  type="text"
                  value={participantDescriptors}
                  onChange={e => setParticipantDescriptors(e.target.value)}
                  placeholder="e.g. water, iron, tower, cold, arched"
                  className="w-full bg-[#080914] border border-[#242A5C] rounded-lg px-3.5 py-2 text-xs text-white focus:outline-none focus:border-[#2DD4BF]"
                />
              </div>
            </div>

            <div className="mb-4">
              <label className="text-xs text-[#8A90B8] block mb-1">Sensory Stream Impressions</label>
              <textarea
                rows={2}
                value={participantImpressions}
                onChange={e => setParticipantImpressions(e.target.value)}
                placeholder="Perceptions of temperature, materials, physical gestures, surrounding geography..."
                className="w-full bg-[#080914] border border-[#242A5C] rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-[#2DD4BF]"
              />
            </div>

            <button
              type="submit"
              className="px-5 py-2 bg-gradient-to-r from-[#C4B5FD] to-[#2DD4BF] text-[#080914] rounded-lg text-xs font-semibold uppercase tracking-wider font-display hover:from-white hover:to-[#5EEAD4] transition-all"
            >
              Add Participant Record
            </button>
          </form>

          {/* Circle Members Consensus Grid */}
          <div className="bg-[#0E1026] border border-[#242A5C] rounded-2xl p-5 sm:p-6 shadow-lg">
            <h3 className="text-xs font-bold text-[#2DD4BF] uppercase tracking-wider font-display mb-4">
              Circle Submissions ({activeCircle.participants.length})
            </h3>

            {activeCircle.participants.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {activeCircle.participants.map((p, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-[#080914] border border-[#242A5C]">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-white text-xs">{p.name}</span>
                      <span className="text-[10px] text-[#787EA8] font-mono-code">
                        {new Date(p.submittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <p className="text-xs text-[#C0C5E5] italic mb-3">"{p.impressions || 'No text recorded'}"</p>

                    <div className="flex flex-wrap gap-1">
                      {p.descriptors.map(d => {
                        const isHit = activeTarget?.hiddenTags.includes(d);
                        return (
                          <span
                            key={d}
                            className={`text-[10px] px-2 py-0.5 rounded border ${
                              isRevealed && isHit
                                ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-300 font-medium'
                                : 'bg-[#141733] border-[#242A5C] text-[#8A90B8]'
                            }`}
                          >
                            {isRevealed && isHit && '✓ '}
                            {d}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-[#565C83] italic">
                No participants have submitted impressions for this circle vector yet.
              </p>
            )}
          </div>
        </div>
      ) : (
        <div className="p-12 text-center bg-[#0E1026] border border-[#242A5C] rounded-2xl">
          <Users className="w-8 h-8 text-[#2DD4BF]/40 mx-auto mb-3" />
          <h3 className="font-display text-base font-semibold text-white mb-1">
            No Active Circle Vector
          </h3>
          <p className="text-xs text-[#8A90B8] max-w-sm mx-auto mb-4">
            Initialize a new coordinate session to conduct double-blind trials with fellow remote viewing practitioners.
          </p>
          <button
            type="button"
            onClick={handleCreateCircle}
            className="px-5 py-2.5 bg-gradient-to-r from-[#C4B5FD] via-[#A78BFA] to-[#2DD4BF] text-[#080914] rounded-xl text-xs font-semibold uppercase tracking-wider font-display shadow-md hover:from-white hover:to-[#5EEAD4] transition-all"
          >
            Create New Circle
          </button>
        </div>
      )}
    </div>
  );
};
