import React, { useState, useEffect, useRef } from 'react';
import { DESCRIPTOR_GROUPS } from '../data/descriptors';
import { UserImpressions, ViewingMethodInfo, TimeOfDay, DifficultyTier } from '../types';
import { Sketchpad } from './Sketchpad';
import { 
  Timer, 
  Copy, 
  Check, 
  PenTool, 
  Sparkles, 
  ChevronRight, 
  HelpCircle, 
  Mic, 
  MicOff, 
  Headphones, 
  Volume2, 
  Sliders,
  Layers
} from 'lucide-react';
import { soundEngine } from '../utils/audioEngine';

interface ViewingPhaseProps {
  blindCode: string;
  isDailyTarget?: boolean;
  selectedTier: DifficultyTier;
  onChangeTier: (tier: DifficultyTier) => void;
  onSubmit: (impressions: UserImpressions, method: ViewingMethodInfo) => void;
  onOpenProtocol: () => void;
  onOpenAmbientRadio: () => void;
}

export const ViewingPhase: React.FC<ViewingPhaseProps> = ({
  blindCode,
  isDailyTarget,
  selectedTier,
  onChangeTier,
  onSubmit,
  onOpenProtocol,
  onOpenAmbientRadio,
}) => {
  const [seconds, setSeconds] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(true);
  const [copied, setCopied] = useState(false);
  const [freeText, setFreeText] = useState('');
  const [selectedDescriptors, setSelectedDescriptors] = useState<string[]>([]);
  const [sketchDataUrl, setSketchDataUrl] = useState<string | undefined>(undefined);
  const [activeTab, setActiveTab] = useState<'descriptors' | 'sketch'>('descriptors');
  const [activeCategory, setActiveCategory] = useState<string>('water_presence');
  const [submitting, setSubmitting] = useState(false);

  // Method Tracking
  const [technique, setTechnique] = useState('CRV (Controlled Remote Viewing)');
  const [meditationLengthMinutes, setMeditationLengthMinutes] = useState(5);
  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>(() => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 8) return 'dawn';
    if (hour >= 8 && hour < 17) return 'day';
    if (hour >= 17 && hour < 21) return 'dusk';
    return 'night';
  });

  // Voice Input (SpeechRecognition)
  const [isListening, setIsListening] = useState(false);
  const [voiceSupported, setVoiceSupported] = useState(true);
  const recognitionRef = useRef<any>(null);

  // Setup Web Speech API
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event: any) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            transcript += event.results[i][0].transcript + ' ';
          }
        }
        if (transcript) {
          setFreeText(prev => (prev ? prev + ' ' + transcript.trim() : transcript.trim()));
        }
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    } else {
      setVoiceSupported(false);
    }
  }, []);

  const toggleVoice = () => {
    if (!recognitionRef.current) return;
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (err) {
        console.error('Speech recognition error', err);
      }
    }
  };

  // Timer tick
  useEffect(() => {
    let interval: any = null;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setSeconds(s => s + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  const formatTimer = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(blindCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const toggleDescriptor = (id: string) => {
    setSelectedDescriptors(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setSubmitting(true);

    const impressions: UserImpressions = {
      freeText,
      sketchDataUrl,
      selectedDescriptors,
      focusDurationSeconds: seconds,
      timestamp: Date.now(),
    };

    const method: ViewingMethodInfo = {
      technique,
      meditationLengthMinutes,
      timeOfDay,
    };

    onSubmit(impressions, method);
  };

  const currentGroup = DESCRIPTOR_GROUPS.find(g => g.id === activeCategory) || DESCRIPTOR_GROUPS[0];

  return (
    <div className="max-w-4xl mx-auto py-6 px-4 sm:px-6">
      {/* Session Coordinate Banner */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#141733] border border-[#242A5C] text-xs text-[#2DD4BF] mb-3">
          <Sparkles className="w-3.5 h-3.5 text-[#D8B4FE]" />
          <span>{isDailyTarget ? 'Daily Blind Coordinate Challenge' : 'Standard Double-Blind Protocol'}</span>
          <span aria-hidden="true">·</span>
          <span>Target Encrypted</span>
        </div>

        {/* Difficulty Tier Selector (Tier 1, 2, 3) */}
        {!isDailyTarget && (
          <div className="flex items-center justify-center gap-1.5 p-1 bg-[#0E1026] rounded-xl border border-[#242A5C] max-w-sm mx-auto mb-4 text-xs">
            <span className="text-[#787EA8] px-2 flex items-center gap-1 font-mono-code text-[11px]">
              <Layers className="w-3 h-3 text-[#D8B4FE]" /> Tier:
            </span>
            <button
              type="button"
              onClick={() => onChangeTier(1)}
              className={`flex-1 py-1 px-2.5 rounded-lg font-medium transition-all ${
                selectedTier === 1
                  ? 'bg-[#1A2548] text-[#2DD4BF] border border-[#2DD4BF]/40 shadow-sm'
                  : 'text-[#8A90B8] hover:text-white'
              }`}
            >
              T1 Famous
            </button>
            <button
              type="button"
              onClick={() => onChangeTier(2)}
              className={`flex-1 py-1 px-2.5 rounded-lg font-medium transition-all ${
                selectedTier === 2
                  ? 'bg-[#1A2548] text-[#2DD4BF] border border-[#2DD4BF]/40 shadow-sm'
                  : 'text-[#8A90B8] hover:text-white'
              }`}
            >
              T2 Obscure
            </button>
            <button
              type="button"
              onClick={() => onChangeTier(3)}
              className={`flex-1 py-1 px-2.5 rounded-lg font-medium transition-all ${
                selectedTier === 3
                  ? 'bg-[#1A2548] text-[#2DD4BF] border border-[#2DD4BF]/40 shadow-sm'
                  : 'text-[#8A90B8] hover:text-white'
              }`}
            >
              T3 Vectors
            </button>
          </div>
        )}

        <h1 className="text-xs uppercase tracking-widest text-[#787EA8] mb-1 font-mono-code">
          Coordinate Vector
        </h1>

        {/* The Blind Code Display */}
        <div className="relative inline-block my-2 group">
          <div className="absolute -inset-2 bg-gradient-to-r from-[#C4B5FD]/25 via-[#2DD4BF]/25 to-[#818CF8]/25 rounded-2xl blur-lg opacity-70 group-hover:opacity-100 transition-opacity" />
          <div className="relative px-8 py-5 bg-[#0D0F22] border border-[#2DD4BF]/40 rounded-2xl shadow-2xl flex items-center justify-center gap-4">
            <span className="font-mono-code text-4xl sm:text-5xl font-bold tracking-[0.25em] text-[#FFF] select-all">
              {blindCode}
            </span>
            <button
              type="button"
              onClick={handleCopyCode}
              title="Copy Coordinate"
              className="p-2 text-[#787EA8] hover:text-[#2DD4BF] transition-colors"
            >
              {copied ? <Check className="w-5 h-5 text-emerald-400" /> : <Copy className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Instructions */}
        <p className="mt-4 max-w-xl mx-auto text-sm sm:text-base text-[#9FA6D1] leading-relaxed">
          Focus on this coordinate. Remote view / astral project to the place it represents. Record raw sensations, textures, and geometry before analytical naming occurs.
        </p>

        {/* Focus Timer, Ambient Sound & Protocol Quick Access */}
        <div className="mt-4 flex flex-wrap items-center justify-center gap-3 text-xs text-[#71779E]">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-[#0E1026] border border-[#242A5C]">
            <Timer className="w-3.5 h-3.5 text-[#D8B4FE]" />
            <span className="font-mono-code text-[#E0E2EC]">{formatTimer(seconds)}</span>
            <button
              type="button"
              onClick={() => setIsTimerRunning(!isTimerRunning)}
              className="text-[11px] ml-1 text-[#8A90B8] hover:text-white"
            >
              {isTimerRunning ? 'Pause' : 'Resume'}
            </button>
          </div>

          <button
            type="button"
            onClick={() => soundEngine.playSingingBowlChime()}
            title="Focus Chime"
            className="flex items-center gap-1 px-3 py-1 rounded-md bg-[#0E1026] border border-[#242A5C] hover:text-[#2DD4BF] transition-colors"
          >
            <Volume2 className="w-3.5 h-3.5 text-[#2DD4BF]" />
            <span>Bowl Chime</span>
          </button>

          <button
            type="button"
            onClick={onOpenAmbientRadio}
            className="flex items-center gap-1 px-3 py-1 rounded-md bg-[#0E1026] border border-[#242A5C] hover:text-[#D8B4FE] transition-colors"
          >
            <Headphones className="w-3.5 h-3.5 text-[#2DD4BF]" />
            <span>Binaural Soundscape</span>
          </button>

          <button
            type="button"
            onClick={onOpenProtocol}
            className="flex items-center gap-1 hover:text-[#2DD4BF] transition-colors"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Protocol Guide</span>
          </button>
        </div>
      </div>

      {/* Main Viewing Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Method Telemetry Tracking Bar */}
        <div className="bg-[#0D0F22] border border-[#242A5C] rounded-xl p-3.5 sm:p-4 text-xs">
          <div className="flex items-center gap-1.5 text-[#D8B4FE] font-semibold mb-2.5 font-display">
            <Sliders className="w-3.5 h-3.5 text-[#2DD4BF]" />
            <span>Session Method & Neurological Baseline Tracking</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-[11px] text-[#71779E] block mb-1">Technique Used</label>
              <select
                value={technique}
                onChange={e => setTechnique(e.target.value)}
                className="w-full bg-[#080914] border border-[#242A5C] rounded-lg p-2 text-xs text-white focus:outline-none focus:border-[#2DD4BF]"
              >
                <option value="CRV (Controlled Remote Viewing)">CRV (Controlled Remote Viewing)</option>
                <option value="Astral Projection / OBE">Astral Projection / OBE</option>
                <option value="Meditation / Quiet Float">Meditation / Quiet Float</option>
                <option value="Ideogram First Reflex">Ideogram First Reflex</option>
                <option value="Hypnagogic State">Hypnagogic State</option>
                <option value="Binaural Beat Entrainment">Binaural Beat Entrainment</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] text-[#71779E] block mb-1">Meditation Prior (Minutes)</label>
              <input
                type="number"
                min={0}
                max={120}
                value={meditationLengthMinutes}
                onChange={e => setMeditationLengthMinutes(parseInt(e.target.value) || 0)}
                className="w-full bg-[#080914] border border-[#242A5C] rounded-lg p-2 text-xs text-white font-mono-code focus:outline-none focus:border-[#2DD4BF]"
              />
            </div>

            <div>
              <label className="text-[11px] text-[#71779E] block mb-1">Time of Day</label>
              <select
                value={timeOfDay}
                onChange={e => setTimeOfDay(e.target.value as any)}
                className="w-full bg-[#080914] border border-[#242A5C] rounded-lg p-2 text-xs text-white capitalize focus:outline-none focus:border-[#2DD4BF]"
              >
                <option value="dawn">Dawn (05:00 - 08:00)</option>
                <option value="day">Day (08:00 - 17:00)</option>
                <option value="dusk">Dusk (17:00 - 21:00)</option>
                <option value="night">Night (21:00 - 05:00)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Sensory Stream (Free Text) + Voice Input */}
        <div className="bg-[#0E1026] border border-[#242A5C] rounded-2xl p-5 sm:p-6 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <label htmlFor="sensory-notes" className="text-sm font-semibold tracking-wide text-[#D8B4FE] uppercase font-display">
              Stage 1 & 2: Free Sensory Perceptions
            </label>

            {/* Voice Input Button */}
            {voiceSupported && (
              <button
                type="button"
                onClick={toggleVoice}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs transition-all ${
                  isListening
                    ? 'bg-rose-950 border-rose-500 text-rose-300 animate-pulse'
                    : 'bg-[#141733] border-[#242A5C] text-[#8A90B8] hover:text-[#2DD4BF]'
                }`}
              >
                {isListening ? <Mic className="w-3.5 h-3.5 text-rose-400" /> : <MicOff className="w-3.5 h-3.5" />}
                <span>{isListening ? 'Recording voice...' : 'Voice Input'}</span>
              </button>
            )}
          </div>

          <p className="text-xs text-[#8A90B8] mb-3">
            Record raw sensations: temperatures, textures, sounds, light intensity, smells, spatial feelings, or spontaneous ideograms before analytical naming kicks in.
          </p>

          <textarea
            id="sensory-notes"
            value={freeText}
            onChange={e => setFreeText(e.target.value)}
            rows={3}
            placeholder="e.g. Cold air, high elevation, harsh stone textures, roaring sound of fluid, sharp triangular rise into the sky, feeling of wind and isolation..."
            className="w-full bg-[#080914] border border-[#242A5C] rounded-xl p-3.5 text-sm text-[#E0E2EC] placeholder-[#4F5478] focus:outline-none focus:border-[#2DD4BF] transition-colors resize-y min-h-[90px]"
          />
        </div>

        {/* Stage 3: Structured Descriptors & Ideogram Sketchpad (Tabs) */}
        <div className="bg-[#0E1026] border border-[#242A5C] rounded-2xl p-5 sm:p-6 shadow-lg">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 border-b border-[#242A5C]/60 pb-3">
            <div>
              <h2 className="text-sm font-semibold tracking-wide text-[#D8B4FE] uppercase font-display">
                Stage 3: Dimensional Descriptors & Sketches
              </h2>
              <p className="text-xs text-[#8A90B8]">
                Select perceived physical characteristics and sketch ideogram contours.
              </p>
            </div>

            {/* Sub-view toggle */}
            <div className="flex items-center gap-1 p-1 bg-[#141733] rounded-lg border border-[#242A5C] self-start sm:self-auto">
              <button
                type="button"
                onClick={() => setActiveTab('descriptors')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all whitespace-nowrap ${
                  activeTab === 'descriptors'
                    ? 'bg-[#1A2548] text-[#2DD4BF] border border-[#2DD4BF]/30 shadow-sm'
                    : 'text-[#8A90B8] hover:text-white'
                }`}
              >
                Descriptors ({selectedDescriptors.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('sketch')}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-all whitespace-nowrap ${
                  activeTab === 'sketch'
                    ? 'bg-[#1A2548] text-[#2DD4BF] border border-[#2DD4BF]/30 shadow-sm'
                    : 'text-[#8A90B8] hover:text-white'
                }`}
              >
                <PenTool className="w-3 h-3" />
                <span>Sketchpad</span>
                {sketchDataUrl && <span className="w-1.5 h-1.5 rounded-full bg-[#2DD4BF]" />}
              </button>
            </div>
          </div>

          {activeTab === 'descriptors' ? (
            <div>
              {/* Category selector chips */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-3 mb-4 scrollbar-none border-b border-[#242A5C]/40">
                {DESCRIPTOR_GROUPS.map(group => {
                  const countInGroup = group.options.filter(o => selectedDescriptors.includes(o.id)).length;
                  return (
                    <button
                      key={group.id}
                      type="button"
                      onClick={() => setActiveCategory(group.id)}
                      className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-all flex items-center gap-1.5 ${
                        activeCategory === group.id
                          ? 'bg-[#2DD4BF]/15 text-[#2DD4BF] border border-[#2DD4BF]/40'
                          : 'bg-[#141733]/60 text-[#8A90B8] hover:text-white border border-transparent'
                      }`}
                    >
                      <span>{group.title.split(' ')[0]}</span>
                      {countInGroup > 0 && (
                        <span className="w-4 h-4 rounded-full bg-gradient-to-r from-[#D8B4FE] to-[#2DD4BF] text-[#080914] text-[10px] font-bold flex items-center justify-center">
                          {countInGroup}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Active Category Options Grid */}
              <div className="mb-2">
                <div className="flex items-center justify-between text-xs text-[#71779E] mb-2">
                  <span className="font-medium text-[#C0C5E5]">{currentGroup.title}</span>
                  <span>{currentGroup.description}</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {currentGroup.options.map(option => {
                    const isSelected = selectedDescriptors.includes(option.id);
                    return (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() => toggleDescriptor(option.id)}
                        className={`p-3 rounded-xl text-left text-xs sm:text-sm font-medium transition-all flex items-center justify-between border ${
                          isSelected
                            ? 'bg-[#132238] border-[#2DD4BF] text-[#FFF] shadow-md shadow-[#2DD4BF]/15'
                            : 'bg-[#141733]/50 border-[#242A5C] text-[#9FA6D1] hover:border-[#384078] hover:text-white'
                        }`}
                      >
                        <span className="truncate pr-2">{option.label}</span>
                        <span
                          className={`w-4 h-4 rounded flex items-center justify-center shrink-0 border transition-colors ${
                            isSelected
                              ? 'bg-[#2DD4BF] border-[#2DD4BF] text-[#080914]'
                              : 'border-[#384078] bg-[#0E1026]'
                          }`}
                        >
                          {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Selected descriptors summary bar */}
              {selectedDescriptors.length > 0 && (
                <div className="mt-4 pt-3 border-t border-[#242A5C]/40 flex flex-wrap items-center gap-2">
                  <span className="text-xs text-[#71779E]">Active Perceptions ({selectedDescriptors.length}):</span>
                  {selectedDescriptors.map(id => (
                    <span
                      key={id}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-[#141E38] border border-[#2D3A6C] text-xs text-[#D8B4FE]"
                    >
                      <span>{id.replace(/_/g, ' ')}</span>
                      <button
                        type="button"
                        onClick={() => toggleDescriptor(id)}
                        className="hover:text-white"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                  <button
                    type="button"
                    onClick={() => setSelectedDescriptors([])}
                    className="text-xs text-[#8A90B8] hover:text-rose-400 ml-auto"
                  >
                    Clear All
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div>
              <p className="text-xs text-[#8A90B8] mb-3">
                Draw spontaneous ideograms, horizon profiles, structural geometry, or visual contours without naming the object.
              </p>
              <Sketchpad
                onSketchChange={dataUrl => setSketchDataUrl(dataUrl)}
                initialDataUrl={sketchDataUrl}
              />
            </div>
          )}
        </div>

        {/* Submit Action Strip */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-[#71779E] text-center sm:text-left">
            <span>Impressions will be submitted to Judge Mode and 3-way scoring verification.</span>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-[#C4B5FD] via-[#A78BFA] to-[#2DD4BF] text-[#080914] font-semibold text-sm rounded-xl shadow-lg shadow-[#2DD4BF]/20 hover:shadow-[#2DD4BF]/40 hover:scale-[1.01] active:scale-[0.98] transition-all flex items-center justify-center gap-2 font-display uppercase tracking-wider"
          >
            <span>Conclude Viewing & Enter Judge Mode</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
};
