import React from 'react';
import { X, BookOpen, ShieldCheck, Eye, Sparkles, Brain, Compass } from 'lucide-react';

interface ProtocolGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProtocolGuideModal: React.FC<ProtocolGuideModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-3xl my-8 bg-[#0D0F22] border border-[#242A5C] rounded-2xl shadow-2xl p-6 sm:p-8 text-[#E0E2EC]">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-lg text-[#787EA8] hover:text-white hover:bg-[#141733] transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-2.5 text-xs font-mono-code text-[#C4B5FD] mb-2">
          <BookOpen className="w-4 h-4 text-[#2DD4BF]" />
          <span>SCRY PRACTICE HANDBOOK</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-white font-display mb-4">
          The Controlled Remote Viewing (CRV) Protocol
        </h2>

        <p className="text-sm text-[#9FA6D1] leading-relaxed mb-6">
          Controlled Remote Viewing is a structured protocol developed to perceive distant, shielded, or non-local targets without sensory transmission. It is not guessing; it is a systematic perceptual discipline focused on signal discrimination.
        </p>

        {/* Steps Grid */}
        <div className="space-y-4 mb-6 text-xs sm:text-sm">
          <div className="p-4 rounded-xl bg-[#080914] border border-[#242A5C]">
            <div className="flex items-center gap-2 text-[#5EEAD4] font-semibold mb-1 font-display">
              <ShieldCheck className="w-4 h-4 text-[#2DD4BF]" />
              <span>1. The Double-Blind Mandate</span>
            </div>
            <p className="text-[#9FA6D1] leading-relaxed">
              In a true blind protocol, the coordinate code (e.g., <code className="font-mono-code text-white bg-[#141733] px-1 py-0.5 rounded">K7Q-294</code>) has no cryptographic meaning to the rational mind. It serves solely as an address vector in non-local awareness. No hints, target categories, or geographic clues exist until after submission.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#080914] border border-[#242A5C]">
            <div className="flex items-center gap-2 text-[#C4B5FD] font-semibold mb-1 font-display">
              <Sparkles className="w-4 h-4 text-[#A78BFA]" />
              <span>2. Stage 1: Spontaneous Ideograms</span>
            </div>
            <p className="text-[#9FA6D1] leading-relaxed">
              Upon viewing the coordinate, your pen touches the sketchpad. Allow an instant reflex movement (within 1–2 seconds) to draw a single line or curve. This spontaneous mark captures the physical gestalt of the target—whether it is rigid/manmade, fluid/water, or undulating/mountainous.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#080914] border border-[#242A5C]">
            <div className="flex items-center gap-2 text-[#5EEAD4] font-semibold mb-1 font-display">
              <Eye className="w-4 h-4 text-[#2DD4BF]" />
              <span>3. Stage 2: Raw Sensory Qualities</span>
            </div>
            <p className="text-[#9FA6D1] leading-relaxed">
              Do not ask yourself <em>"What is it?"</em>. Instead ask: <em>"What does it feel like?"</em> Record physical sensations: temperature (cold/warm), textures (rough stone, smooth glass, fluid spray), sound (humming, quiet wind, roaring water), luminosity, and dominant color tones.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#080914] border border-[#242A5C]">
            <div className="flex items-center gap-2 text-[#C4B5FD] font-semibold mb-1 font-display">
              <Brain className="w-4 h-4 text-[#A78BFA]" />
              <span>4. Quenching Analytical Overlay (AOL)</span>
            </div>
            <p className="text-[#9FA6D1] leading-relaxed">
              The analytical left-hemisphere hates ambiguity. When it receives a feeling of "cold air and red metal," it immediately screams <em>"It's the Golden Gate Bridge!"</em>. This is Analytical Overlay (AOL). Write it down, recognize it as an analytical conclusion, and set it aside to return to pure sensory reception.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#080914] border border-[#242A5C]">
            <div className="flex items-center gap-2 text-[#5EEAD4] font-semibold mb-1 font-display">
              <Compass className="w-4 h-4 text-[#2DD4BF]" />
              <span>5. Unveiling & Canonical Self-Calibration</span>
            </div>
            <p className="text-[#9FA6D1] leading-relaxed">
              Feedback is the neurological engine of remote viewing. When the target is unveiled, observe how your sensory notes correlated with the target reality. Your self-rating is the canonical metric, because metaphors and structural echoes are deeply personal and cannot be judged solely by an automated algorithm.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-[#242A5C]/60">
          <span className="text-[11px] text-[#71779E] italic">
            Lane: Malychite / Poshunz · Metaphysical Calibration Suite
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#C4B5FD] via-[#A78BFA] to-[#2DD4BF] text-[#080914] font-semibold text-xs tracking-wider uppercase font-display hover:from-white hover:to-[#5EEAD4] transition-all"
          >
            I Understand · Return to Practice
          </button>
        </div>
      </div>
    </div>
  );
};
