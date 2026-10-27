import React, { useRef, useState, useEffect } from 'react';
import { RotateCcw, Trash2, PenTool, Eraser, Sparkles } from 'lucide-react';

interface SketchpadProps {
  onSketchChange?: (dataUrl: string | undefined) => void;
  initialDataUrl?: string;
}

export const Sketchpad: React.FC<SketchpadProps> = ({ onSketchChange, initialDataUrl }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState<string>('#C4B5FD'); // Default Luminous Lavender
  const [lineWidth, setLineWidth] = useState<number>(3);
  const [isEraser, setIsEraser] = useState<boolean>(false);
  const [history, setHistory] = useState<ImageData[]>([]);
  const [hasContent, setHasContent] = useState<boolean>(false);

  // Setup canvas size
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const rect = container.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    const width = Math.floor(rect.width);
    const height = 280; // comfortable touch height

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.scale(dpr, dpr);
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      // Load initial image if provided
      if (initialDataUrl) {
        const img = new Image();
        img.onload = () => {
          ctx.drawImage(img, 0, 0, width, height);
          setHasContent(true);
        };
        img.src = initialDataUrl;
      }
    }
  }, []);

  const saveHistory = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const current = ctx.getImageData(0, 0, canvas.width, canvas.height);
    setHistory(prev => [...prev.slice(-15), current]);
  };

  const getCoordinates = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const startDrawing = (e: React.PointerEvent<HTMLCanvasElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    saveHistory();
    setIsDrawing(true);
    const { x, y } = getCoordinates(e);

    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x, y);

    if (isEraser) {
      ctx.strokeStyle = '#0B0D1F';
      ctx.lineWidth = lineWidth * 4;
    } else {
      ctx.strokeStyle = color;
      ctx.lineWidth = lineWidth;
    }
    ctx.stroke();
  };

  const draw = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { x, y } = getCoordinates(e);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    setIsDrawing(false);
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      // ignore
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    setHasContent(true);
    if (onSketchChange) {
      onSketchChange(canvas.toDataURL('image/png'));
    }
  };

  const handleClear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    saveHistory();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasContent(false);
    if (onSketchChange) {
      onSketchChange(undefined);
    }
  };

  const handleUndo = () => {
    if (history.length === 0) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const previous = history[history.length - 1];
    setHistory(prev => prev.slice(0, -1));
    ctx.putImageData(previous, 0, 0);

    if (onSketchChange) {
      onSketchChange(canvas.toDataURL('image/png'));
    }
  };

  return (
    <div className="flex flex-col gap-3" ref={containerRef}>
      {/* Canvas container */}
      <div className="relative rounded-xl border border-[#242A5C] bg-[#0B0D1F] overflow-hidden shadow-inner touch-none">
        {/* Subtle ideological grid watermark */}
        <div 
          className="absolute inset-0 pointer-events-none opacity-20"
          style={{
            backgroundImage: 'radial-gradient(circle, #2DD4BF 0.75px, transparent 0.75px)',
            backgroundSize: '24px 24px',
          }}
        />

        <canvas
          ref={canvasRef}
          onPointerDown={startDrawing}
          onPointerMove={draw}
          onPointerUp={stopDrawing}
          onPointerCancel={stopDrawing}
          className="relative z-10 w-full cursor-crosshair block"
        />

        {!hasContent && (
          <div className="absolute inset-0 z-0 flex flex-col items-center justify-center pointer-events-none text-[#71779E] text-xs">
            <Sparkles className="w-4 h-4 mb-1 text-[#2DD4BF]/60" />
            <span>Draw initial ideograms, contours, or dimensional shapes</span>
          </div>
        )}
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Colors & Eraser */}
        <div className="flex items-center gap-1.5 p-1 bg-[#141733] rounded-lg border border-[#242A5C]">
          <button
            type="button"
            title="Luminous Lavender"
            onClick={() => { setColor('#C4B5FD'); setIsEraser(false); }}
            className={`w-6 h-6 rounded-md transition-all flex items-center justify-center ${
              !isEraser && color === '#C4B5FD' ? 'ring-2 ring-[#C4B5FD] scale-110' : 'opacity-70 hover:opacity-100'
            }`}
            style={{ backgroundColor: '#C4B5FD' }}
          />
          <button
            type="button"
            title="Radiant Teal"
            onClick={() => { setColor('#2DD4BF'); setIsEraser(false); }}
            className={`w-6 h-6 rounded-md transition-all flex items-center justify-center ${
              !isEraser && color === '#2DD4BF' ? 'ring-2 ring-[#2DD4BF] scale-110' : 'opacity-70 hover:opacity-100'
            }`}
            style={{ backgroundColor: '#2DD4BF' }}
          />
          <button
            type="button"
            title="Alabaster White"
            onClick={() => { setColor('#FFFFFF'); setIsEraser(false); }}
            className={`w-6 h-6 rounded-md transition-all flex items-center justify-center ${
              !isEraser && color === '#FFFFFF' ? 'ring-2 ring-white scale-110' : 'opacity-70 hover:opacity-100'
            }`}
            style={{ backgroundColor: '#FFFFFF' }}
          />
          <button
            type="button"
            title="Cosmic Indigo"
            onClick={() => { setColor('#8B5CF6'); setIsEraser(false); }}
            className={`w-6 h-6 rounded-md transition-all flex items-center justify-center ${
              !isEraser && color === '#8B5CF6' ? 'ring-2 ring-[#8B5CF6] scale-110' : 'opacity-70 hover:opacity-100'
            }`}
            style={{ backgroundColor: '#8B5CF6' }}
          />
          <div className="w-[1px] h-4 bg-[#242A5C] mx-1" />
          <button
            type="button"
            title="Eraser"
            onClick={() => setIsEraser(true)}
            className={`p-1.5 rounded-md transition-colors ${
              isEraser ? 'bg-[#1A2548] text-[#2DD4BF]' : 'text-[#8A90B8] hover:text-white'
            }`}
          >
            <Eraser className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Stroke thickness */}
        <div className="flex items-center gap-1 p-1 bg-[#141733] rounded-lg border border-[#242A5C]">
          {[2, 4, 7].map(size => (
            <button
              key={size}
              type="button"
              onClick={() => setLineWidth(size)}
              className={`px-2 py-1 rounded text-[11px] font-medium transition-colors ${
                lineWidth === size ? 'bg-[#1A2548] text-[#2DD4BF]' : 'text-[#8A90B8] hover:text-white'
              }`}
            >
              {size === 2 ? 'Fine' : size === 4 ? 'Med' : 'Bold'}
            </button>
          ))}
        </div>

        {/* Undo and Clear */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={handleUndo}
            disabled={history.length === 0}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-[#242A5C] bg-[#141733] text-[#8A90B8] hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Undo</span>
          </button>
          <button
            type="button"
            onClick={handleClear}
            disabled={!hasContent}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-[#242A5C] bg-[#141733] text-[#8A90B8] hover:text-rose-400 disabled:opacity-30 disabled:pointer-events-none transition-colors"
          >
            <Trash2 className="w-3 h-3" />
            <span>Clear</span>
          </button>
        </div>
      </div>
    </div>
  );
};
