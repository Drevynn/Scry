import React, { useState, useEffect } from 'react';
import { DreamEntry, SessionResult } from '../types';
import { Moon, Sparkles, Plus, Search, Trash2, Link as LinkIcon, Calendar, Check } from 'lucide-react';

interface DreamJournalProps {
  sessions: SessionResult[];
  onSelectSessionToReview?: (session: SessionResult) => void;
}

const DREAMS_STORAGE_KEY = 'scry_dreams_v1';
const LEGACY_DREAMS_KEY = 'farsight_dreams_v1';

export const DreamJournal: React.FC<DreamJournalProps> = ({ sessions, onSelectSessionToReview }) => {
  const [dreams, setDreams] = useState<DreamEntry[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  // New dream form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [symbols, setSymbols] = useState('');
  const [lucidity, setLucidity] = useState<'low' | 'medium' | 'high' | 'lucid'>('medium');
  const [mood, setMood] = useState('Mystical & Calm');
  const [linkedSessionId, setLinkedSessionId] = useState<string>('');

  useEffect(() => {
    try {
      const raw = localStorage.getItem(DREAMS_STORAGE_KEY) || localStorage.getItem(LEGACY_DREAMS_KEY);
      if (raw) {
        setDreams(JSON.parse(raw));
      }
    } catch (e) {
      console.error('Failed to load dreams', e);
    }
  }, []);

  const saveDreamsList = (list: DreamEntry[]) => {
    setDreams(list);
    localStorage.setItem(DREAMS_STORAGE_KEY, JSON.stringify(list));
  };

  const handleAddDream = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    const newEntry: DreamEntry = {
      id: `dream_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      date: new Date().toISOString(),
      title,
      description,
      symbols: symbols.split(',').map(s => s.trim()).filter(Boolean),
      lucidity,
      mood,
      linkedSessionId: linkedSessionId || undefined,
    };

    saveDreamsList([newEntry, ...dreams]);
    setIsAdding(false);
    setTitle('');
    setDescription('');
    setSymbols('');
    setLinkedSessionId('');
  };

  const handleDelete = (id: string) => {
    saveDreamsList(dreams.filter(d => d.id !== id));
  };

  const filteredDreams = dreams.filter(d => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const titleMatch = d.title.toLowerCase().includes(q);
    const descMatch = d.description.toLowerCase().includes(q);
    const symbolMatch = d.symbols.some(s => s.toLowerCase().includes(q));
    return titleMatch || descMatch || symbolMatch;
  });

  return (
    <div className="max-w-4xl mx-auto py-6 px-4 sm:px-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#242A5C]/60 pb-5 mb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-mono-code text-[#C4B5FD] mb-1">
            <Moon className="w-3.5 h-3.5" />
            <span>Precognitive Night Log & Hypnagogic Archive</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white font-display">
            Dream Journal
          </h1>
        </div>

        <button
          type="button"
          onClick={() => setIsAdding(!isAdding)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#C4B5FD] via-[#A78BFA] to-[#2DD4BF] text-[#080914] font-semibold text-xs uppercase tracking-wider font-display shadow-md shadow-[#2DD4BF]/25 hover:from-white hover:to-[#5EEAD4] hover:scale-[1.02] transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>{isAdding ? 'Close Form' : 'Log New Dream'}</span>
        </button>
      </div>

      {/* Add New Dream Form */}
      {isAdding && (
        <form onSubmit={handleAddDream} className="bg-[#0D0F22] border border-[#A78BFA]/40 shadow-[0_0_20px_rgba(167,139,250,0.15)] rounded-2xl p-6 mb-8 space-y-4">
          <h3 className="text-sm font-bold text-[#C4B5FD] uppercase tracking-wider font-display">
            Record Dream Experience
          </h3>

          <div>
            <label className="text-xs text-[#8A90B8] block mb-1">Dream Title</label>
            <input
              type="text"
              required
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g. Tower on the Black Sea, Emerald Sky Ribbons..."
              className="w-full bg-[#080914] border border-[#242A5C] rounded-lg px-3.5 py-2 text-sm text-white focus:outline-none focus:border-[#2DD4BF]"
            />
          </div>

          <div>
            <label className="text-xs text-[#8A90B8] block mb-1">Dream Narrative & Sensory Imprints</label>
            <textarea
              required
              rows={4}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Describe the landscape, architecture, water, feelings of flight, strange symbols, or voices..."
              className="w-full bg-[#080914] border border-[#242A5C] rounded-lg p-3 text-sm text-white focus:outline-none focus:border-[#2DD4BF]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs text-[#8A90B8] block mb-1">Perceived Symbols (comma-separated)</label>
              <input
                type="text"
                value={symbols}
                onChange={e => setSymbols(e.target.value)}
                placeholder="water, pyramid, iron, spiral"
                className="w-full bg-[#080914] border border-[#242A5C] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#2DD4BF]"
              />
            </div>

            <div>
              <label className="text-xs text-[#8A90B8] block mb-1">Lucidity Level</label>
              <select
                value={lucidity}
                onChange={e => setLucidity(e.target.value as any)}
                className="w-full bg-[#080914] border border-[#242A5C] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#2DD4BF]"
              >
                <option value="low">Low (Faint Recall)</option>
                <option value="medium">Medium (Vivid Storyline)</option>
                <option value="high">High (Sensory Hyper-Realism)</option>
                <option value="lucid">Fully Lucid / OBE</option>
              </select>
            </div>

            <div>
              <label className="text-xs text-[#8A90B8] block mb-1">Link to Viewing Session</label>
              <select
                value={linkedSessionId}
                onChange={e => setLinkedSessionId(e.target.value)}
                className="w-full bg-[#080914] border border-[#242A5C] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#2DD4BF]"
              >
                <option value="">None (Independent Dream)</option>
                {sessions.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.code} · {s.target.name} ({new Date(s.date).toLocaleDateString()})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="px-4 py-2 text-xs text-[#8A90B8] hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-gradient-to-r from-[#C4B5FD] to-[#2DD4BF] text-[#080914] rounded-lg text-xs font-bold uppercase tracking-wider font-display hover:from-white hover:to-[#5EEAD4] transition-all"
            >
              Save to Journal
            </button>
          </div>
        </form>
      )}

      {/* Search Filter */}
      <div className="mb-6 flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-[#5A608B]" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search dream motifs, symbols, narratives..."
            className="w-full pl-9 pr-3.5 py-2 bg-[#0E1026] border border-[#242A5C] rounded-xl text-xs text-white placeholder-[#5A608B] focus:outline-none focus:border-[#2DD4BF]"
          />
        </div>
        <span className="text-xs text-[#71779E] font-mono-code">
          {dreams.length} recorded
        </span>
      </div>

      {/* Dreams Stream */}
      {filteredDreams.length > 0 ? (
        <div className="space-y-4">
          {filteredDreams.map(dream => {
            const linkedSession = sessions.find(s => s.id === dream.linkedSessionId);

            return (
              <div
                key={dream.id}
                className="bg-[#0E1026] border border-[#242A5C] rounded-2xl p-5 sm:p-6 shadow-lg relative group hover:border-[#384078] transition-all"
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div>
                    <span className="text-[11px] font-mono-code text-[#787EA8] flex items-center gap-1.5 mb-1">
                      <Calendar className="w-3 h-3" />
                      <span>{new Date(dream.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</span>
                      <span aria-hidden="true">·</span>
                      <span className="capitalize text-[#5EEAD4]">{dream.lucidity} lucidity</span>
                    </span>
                    <h3 className="font-display text-lg font-bold text-white">
                      {dream.title}
                    </h3>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleDelete(dream.id)}
                    className="p-1.5 text-[#5A608B] hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Delete dream"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <p className="text-sm text-[#C0C5E5] leading-relaxed mb-4 whitespace-pre-line">
                  {dream.description}
                </p>

                {/* Symbols tags */}
                {dream.symbols.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1.5 mb-4">
                    <span className="text-[11px] text-[#71779E] mr-1">Symbols:</span>
                    {dream.symbols.map(sym => (
                      <span
                        key={sym}
                        className="text-xs px-2 py-0.5 rounded bg-[#141733] border border-[#242A5C] text-[#C4B5FD]"
                      >
                        #{sym}
                      </span>
                    ))}
                  </div>
                )}

                {/* Linked Session Badge */}
                {linkedSession && (
                  <div className="p-3 rounded-xl bg-[#080914] border border-[#2DD4BF]/40 flex items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2 text-[#C0C5E5]">
                      <LinkIcon className="w-3.5 h-3.5 text-[#2DD4BF]" />
                      <span>Linked Precognitive Session:</span>
                      <span className="font-mono-code font-bold text-white">{linkedSession.code}</span>
                      <span>({linkedSession.target.name})</span>
                    </div>

                    {onSelectSessionToReview && (
                      <button
                        type="button"
                        onClick={() => onSelectSessionToReview(linkedSession)}
                        className="text-[#2DD4BF] hover:text-white underline text-[11px]"
                      >
                        Inspect
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="p-12 text-center bg-[#0E1026] border border-[#242A5C] rounded-2xl">
          <Moon className="w-8 h-8 text-[#2DD4BF]/40 mx-auto mb-3" />
          <h3 className="font-display text-base font-semibold text-white mb-1">
            No Dreams Recorded Yet
          </h3>
          <p className="text-xs text-[#8A90B8] max-w-sm mx-auto mb-4">
            Record hypnagogic imagery upon waking to test precognitive alignment with subsequent blind target reveals.
          </p>
          <button
            type="button"
            onClick={() => setIsAdding(true)}
            className="px-4 py-2 bg-gradient-to-r from-[#C4B5FD] to-[#2DD4BF] text-[#080914] rounded-xl text-xs font-semibold uppercase tracking-wider font-display hover:from-white hover:to-[#5EEAD4] transition-all"
          >
            Log First Dream
          </button>
        </div>
      )}
    </div>
  );
};
