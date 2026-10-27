import React, { useState, useEffect } from 'react';
import { soundEngine } from '../utils/audioEngine';
import { Volume2, VolumeX, Play, Square, Headphones, Sparkles, Bell } from 'lucide-react';

interface AmbientPlayerProps {
  isOpen: boolean;
  onClose?: () => void;
}

export const AmbientPlayer: React.FC<AmbientPlayerProps> = ({ isOpen, onClose }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [beatHz, setBeatHz] = useState(6); // Theta default
  const [tuningHz, setTuningHz] = useState(432);
  const [volume, setVolume] = useState(0.35);

  const togglePlay = () => {
    if (isPlaying) {
      soundEngine.stop();
      setIsPlaying(false);
    } else {
      soundEngine.start(tuningHz / 2, beatHz, tuningHz);
      soundEngine.setVolume(volume);
      setIsPlaying(true);
    }
  };

  const handleBeatChange = (hz: number) => {
    setBeatHz(hz);
    if (isPlaying) {
      soundEngine.updateBeat(hz);
    }
  };

  const handleTuningChange = (base: number) => {
    setTuningHz(base);
    if (isPlaying) {
      soundEngine.updateTuning(base);
    }
  };

  const handleVolumeChange = (newVol: number) => {
    setVolume(newVol);
    soundEngine.setVolume(newVol);
  };

  const playChime = () => {
    soundEngine.playSingingBowlChime();
  };

  return (
    <div className="bg-[#0D0F22] border border-[#242A5C] rounded-2xl p-5 sm:p-6 shadow-2xl relative overflow-hidden">
      {/* Glow */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-[#C4B5FD]/15 via-[#2DD4BF]/15 to-transparent rounded-full blur-3xl pointer-events-none" />

      {/* Headphone Advisory Note as requested */}
      <div className="flex items-center gap-2 p-2.5 rounded-xl bg-[#141738] border border-[#242A5C] text-xs text-[#C4B5FD] mb-5">
        <Headphones className="w-4 h-4 shrink-0 text-[#2DD4BF]" />
        <span>Stereo headphones required: true binaural beats rely on discrete left/right phase interference in the brainstem.</span>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <span className="text-[11px] font-mono-code uppercase tracking-widest text-[#787EA8] block mb-1">
            Continuous Ambient AI Radio
          </span>
          <h3 className="font-display text-lg sm:text-xl font-bold text-white flex items-center gap-2">
            <span>Binaural Meditation Stream</span>
            {isPlaying && (
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            )}
          </h3>
        </div>

        {/* Play / Stop CTA */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={playChime}
            title="Singing Bowl Chime"
            className="p-2.5 rounded-xl border border-[#242A5C] bg-[#141733] text-[#2DD4BF] hover:text-white hover:border-[#2DD4BF] transition-all"
          >
            <Bell className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={togglePlay}
            className={`px-5 py-2.5 rounded-xl font-semibold text-xs uppercase tracking-wider font-display flex items-center gap-2 shadow-lg transition-all ${
              isPlaying
                ? 'bg-rose-900/60 border border-rose-500 text-rose-200 hover:bg-rose-900'
                : 'bg-gradient-to-r from-[#C4B5FD] via-[#A78BFA] to-[#2DD4BF] text-[#080914] shadow-[#2DD4BF]/25 hover:from-white hover:to-[#5EEAD4] hover:scale-[1.02]'
            }`}
          >
            {isPlaying ? (
              <>
                <Square className="w-3.5 h-3.5 fill-current" />
                <span>Pause Engine</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Start Soundscape</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Frequency Tuning & Brainwave Mode Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6 text-xs">
        {/* Brainwave entrainment mode */}
        <div className="p-4 rounded-xl bg-[#080914] border border-[#242A5C]">
          <div className="text-[#E0E2EC] font-semibold mb-1 font-display">
            Brainwave Frequency Offset
          </div>
          <p className="text-[11px] text-[#71779E] mb-3">
            Target brainwave octave for non-local sensory reception:
          </p>

          <div className="grid grid-cols-2 gap-2">
            {[
              { hz: 6, label: 'Theta (6 Hz)', desc: 'Astral & Stage 1 Trance' },
              { hz: 10, label: 'Alpha (10 Hz)', desc: 'Relaxed CRV Focus' },
              { hz: 2.5, label: 'Delta (2.5 Hz)', desc: 'Deep Somatic Rest' },
              { hz: 40, label: 'Gamma (40 Hz)', desc: 'Peak Clarity / Hologram' },
            ].map(item => (
              <button
                key={item.hz}
                type="button"
                onClick={() => handleBeatChange(item.hz)}
                className={`p-2.5 rounded-lg border text-left transition-all ${
                  beatHz === item.hz
                    ? 'bg-[#152538] border-[#2DD4BF] text-white'
                    : 'bg-[#141733]/60 border-[#242A5C] text-[#8A90B8] hover:text-white'
                }`}
              >
                <div className="font-semibold text-[#5EEAD4]">{item.label}</div>
                <div className="text-[10px] text-[#71779E]">{item.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Carrier Tuning Bed */}
        <div className="p-4 rounded-xl bg-[#080914] border border-[#242A5C]">
          <div className="text-[#E0E2EC] font-semibold mb-1 font-display">
            Acoustic Drone Harmonic Bed
          </div>
          <p className="text-[11px] text-[#71779E] mb-3">
            Sub-harmonic foundation synthesized in real time:
          </p>

          <div className="grid grid-cols-2 gap-2 mb-4">
            <button
              type="button"
              onClick={() => handleTuningChange(432)}
              className={`p-2.5 rounded-lg border text-left transition-all ${
                tuningHz === 432
                  ? 'bg-[#1D1730] border-[#C4B5FD] text-white'
                  : 'bg-[#141733]/60 border-[#242A5C] text-[#8A90B8] hover:text-white'
              }`}
            >
              <div className="font-semibold text-[#C4B5FD]">432 Hz Verdi</div>
              <div className="text-[10px] text-[#71779E]">Natural octave balance</div>
            </button>

            <button
              type="button"
              onClick={() => handleTuningChange(528)}
              className={`p-2.5 rounded-lg border text-left transition-all ${
                tuningHz === 528
                  ? 'bg-[#152538] border-[#2DD4BF] text-white'
                  : 'bg-[#141733]/60 border-[#242A5C] text-[#8A90B8] hover:text-white'
              }`}
            >
              <div className="font-semibold text-[#5EEAD4]">528 Hz Solfeggio</div>
              <div className="text-[10px] text-[#71779E]">Harmonic transformation</div>
            </button>
          </div>

          {/* Volume Control */}
          <div>
            <div className="flex items-center justify-between text-[11px] text-[#8A90B8] mb-1">
              <span>Master Volume</span>
              <span className="font-mono-code">{Math.round(volume * 100)}%</span>
            </div>
            <input
              type="range"
              min={0}
              max={1}
              step={0.02}
              value={volume}
              onChange={e => handleVolumeChange(parseFloat(e.target.value))}
              className="w-full accent-[#2DD4BF] bg-[#141733] h-1.5 rounded-lg cursor-pointer"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
