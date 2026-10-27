import React, { useState, useMemo } from 'react';
import { SessionResult, UserStats } from '../types';
import { 
  BarChart3, 
  CheckCircle2, 
  HelpCircle, 
  XCircle, 
  Download, 
  Upload, 
  Trash2, 
  Calendar, 
  Clock, 
  ChevronRight, 
  Sparkles,
  MapPin,
  Flame,
  Target as TargetIcon,
  Layers,
  Sliders,
  TrendingUp,
  Activity,
  LineChart as LineChartIcon,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ReferenceLine 
} from 'recharts';
import { exportBackupJson, importBackupJson, deleteSession, clearAllSessions } from '../utils/storage';
import { AchievementsSection } from './AchievementsSection';

interface StatsViewProps {
  sessions: SessionResult[];
  stats: UserStats;
  onSelectSession: (session: SessionResult) => void;
  onRefreshData: () => void;
  onStartNewSession: () => void;
}

export const StatsView: React.FC<StatsViewProps> = ({
  sessions,
  stats,
  onSelectSession,
  onRefreshData,
  onStartNewSession,
}) => {
  const [filter, setFilter] = useState<'all' | 'yes' | 'partially' | 'no' | 'judge_hit' | 'daily'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [importStatus, setImportStatus] = useState<string | null>(null);

  // Line graph state
  const [showDescriptorScore, setShowDescriptorScore] = useState(true);
  const [showRunningAverage, setShowRunningAverage] = useState(true);
  const [showSelfRating, setShowSelfRating] = useState(true);
  const [chartRange, setChartRange] = useState<'all' | '10' | '20'>('all');

  // Compute chronologically sorted chart data
  const rawChartData = useMemo(() => {
    const chronological = [...sessions].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    let runningScoreSum = 0;
    let runningSelfSum = 0;
    let ratedCount = 0;

    return chronological.map((session, index) => {
      runningScoreSum += session.score.percentage;
      const runningAverage = Math.round(runningScoreSum / (index + 1));

      let selfScore: number | null = null;
      if (session.selfRating === 'yes') {
        selfScore = 100;
        runningSelfSum += 100;
        ratedCount += 1;
      } else if (session.selfRating === 'partially') {
        selfScore = 50;
        runningSelfSum += 50;
        ratedCount += 1;
      } else if (session.selfRating === 'no') {
        selfScore = 0;
        runningSelfSum += 0;
        ratedCount += 1;
      }

      const dateObj = new Date(session.date);
      const formattedDate = dateObj.toLocaleDateString(undefined, { 
        month: 'short', 
        day: 'numeric' 
      });

      return {
        index: index + 1,
        label: `#${index + 1}`,
        fullLabel: `Session ${index + 1} (${session.code})`,
        shortCode: session.code,
        date: formattedDate,
        targetName: session.target.name,
        targetLocation: session.target.location,
        descriptorScore: session.score.percentage,
        selfScore,
        selfRating: session.selfRating,
        runningAverage,
        verdict: session.score.verdict,
        method: session.method?.technique || 'Standard CRV',
        rawSession: session,
      };
    });
  }, [sessions]);

  // Sliced chart data according to user range selection
  const chartData = useMemo(() => {
    if (chartRange === '10') {
      return rawChartData.slice(-10);
    }
    if (chartRange === '20') {
      return rawChartData.slice(-20);
    }
    return rawChartData;
  }, [rawChartData, chartRange]);

  // Trajectory calculation (first third vs last third)
  const trajectory = useMemo(() => {
    if (rawChartData.length < 2) return null;
    const sampleSize = Math.max(1, Math.min(3, Math.floor(rawChartData.length / 2)));
    const earlySlice = rawChartData.slice(0, sampleSize);
    const recentSlice = rawChartData.slice(-sampleSize);

    const earlyAvg = earlySlice.reduce((acc, d) => acc + d.descriptorScore, 0) / sampleSize;
    const recentAvg = recentSlice.reduce((acc, d) => acc + d.descriptorScore, 0) / sampleSize;
    const delta = Math.round(recentAvg - earlyAvg);

    return {
      delta,
      isPositive: delta >= 0,
      earlyAvg: Math.round(earlyAvg),
      recentAvg: Math.round(recentAvg),
    };
  }, [rawChartData]);

  const filteredSessions = sessions.filter(session => {
    if (filter === 'yes' && session.selfRating !== 'yes') return false;
    if (filter === 'partially' && session.selfRating !== 'partially') return false;
    if (filter === 'no' && session.selfRating !== 'no') return false;
    if (filter === 'judge_hit' && !session.judge?.isHit) return false;
    if (filter === 'daily' && !session.isDailyTarget) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const codeMatch = session.code.toLowerCase().includes(q);
      const targetMatch = session.target.name.toLowerCase().includes(q);
      const locationMatch = session.target.location.toLowerCase().includes(q);
      const notesMatch = session.impressions.freeText?.toLowerCase().includes(q);
      const methodMatch = session.method?.technique?.toLowerCase().includes(q);
      return codeMatch || targetMatch || locationMatch || notesMatch || methodMatch;
    }
    return true;
  });

  const handleExport = () => {
    const jsonStr = exportBackupJson();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `scry-logbook-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = ev => {
      const content = ev.target?.result as string;
      const res = importBackupJson(content);
      if (res.success) {
        setImportStatus(`Successfully restored ${res.count} sessions.`);
        onRefreshData();
      } else {
        setImportStatus(`Import error: ${res.error}`);
      }
      setTimeout(() => setImportStatus(null), 4000);
    };
    reader.readAsText(file);
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    deleteSession(id);
    onRefreshData();
  };

  const handleClearAll = () => {
    clearAllSessions();
    setShowClearConfirm(false);
    onRefreshData();
  };

  return (
    <div className="max-w-5xl mx-auto py-6 px-4 sm:px-6">
      {/* Page Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#242A5C]/60 pb-5 mb-6">
        <div>
          <span className="text-xs font-mono-code uppercase tracking-widest text-[#C4B5FD] block mb-1">
            Controlled Remote Viewing Logbook & Telemetry
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold text-white font-display">
            Practice Archive & Statistical Baseline
          </h1>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={handleExport}
            disabled={sessions.length === 0}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#242A5C] bg-[#141733] text-xs text-[#9FA6D1] hover:text-white disabled:opacity-40 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export JSON</span>
          </button>

          <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#242A5C] bg-[#141733] text-xs text-[#9FA6D1] hover:text-white cursor-pointer transition-colors">
            <Upload className="w-3.5 h-3.5" />
            <span>Import</span>
            <input
              type="file"
              accept=".json"
              onChange={handleImportFile}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {importStatus && (
        <div className="mb-6 p-3 rounded-xl bg-[#0E242B]/60 border border-[#2DD4BF]/50 text-xs text-[#5EEAD4] text-center">
          {importStatus}
        </div>
      )}

      {/* KPI Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-8">
        <div className="bg-[#0E1026] border border-[#242A5C] rounded-2xl p-4 sm:p-5 shadow-lg">
          <div className="text-xs text-[#8A90B8] mb-1">Sessions Completed</div>
          <div className="font-mono-code text-2xl sm:text-3xl font-bold text-white">
            {stats.totalSessions}
          </div>
          <div className="text-[11px] text-[#71779E] mt-1">Double-blind trials</div>
        </div>

        <div className="bg-[#0E1026] border border-[#242A5C] rounded-2xl p-4 sm:p-5 shadow-lg">
          <div className="text-xs text-[#8A90B8] mb-1">Self-Rated Accuracy</div>
          <div className="font-mono-code text-2xl sm:text-3xl font-bold text-[#D8B4FE]">
            {stats.accuracyPercentage}%
          </div>
          <div className="text-[11px] text-[#71779E] mt-1">Yes + 0.5×Partial / Total</div>
        </div>

        {/* CHANCE BASELINE 4-CHOICE STAT (ALWAYS HONEST) */}
        <div className="bg-[#0E1026] border border-[#242A5C] rounded-2xl p-4 sm:p-5 shadow-lg relative overflow-hidden">
          <div className="text-xs text-[#8A90B8] mb-1 flex items-center justify-between">
            <span>Judge 4-Way Hit Rate</span>
            <span className="font-mono-code text-[10px] text-[#71779E]">Base: 25%</span>
          </div>
          <div className="font-mono-code text-2xl sm:text-3xl font-bold flex items-baseline gap-2">
            <span className={stats.judgeStats.pAboveChance ? 'text-emerald-400' : 'text-white'}>
              {stats.judgeStats.hitRate}%
            </span>
            <span className="text-xs text-[#71779E] font-normal">
              ({stats.judgeStats.hits}/{stats.judgeStats.totalJudged})
            </span>
          </div>
          <div className="text-[11px] text-[#71779E] mt-1 flex items-center gap-1">
            <span className={stats.judgeStats.pAboveChance ? 'text-emerald-400 font-medium' : 'text-[#8A90B8]'}>
              {stats.judgeStats.totalJudged === 0 
                ? 'No judge trials yet' 
                : stats.judgeStats.pAboveChance 
                ? '▲ Above chance baseline' 
                : '▼ At / below chance baseline'}
            </span>
          </div>
        </div>

        <div className="bg-[#0E1026] border border-[#242A5C] rounded-2xl p-4 sm:p-5 shadow-lg">
          <div className="text-xs text-[#8A90B8] mb-1">Avg Descriptor Overlap</div>
          <div className="font-mono-code text-2xl sm:text-3xl font-bold text-[#2DD4BF]">
            {stats.averageAlgorithmicScore}%
          </div>
          <div className="text-[11px] text-[#71779E] mt-1">Target tags matched</div>
        </div>
      </div>

      {/* PERFORMANCE SCORE OVER TIME (RECHARTS LINE GRAPH) */}
      <div className="bg-[#0E1026] border border-[#242A5C] rounded-2xl p-5 sm:p-6 mb-8 shadow-xl relative overflow-hidden">
        {/* Subtle ambient decorative glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-[#C4B5FD]/10 via-[#2DD4BF]/10 to-transparent rounded-full blur-3xl pointer-events-none" />

        {/* Header with Title, Trajectory Badge & Range Controls */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-[#242A5C]/60 pb-4 mb-5 relative z-10">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-mono-code text-[#C4B5FD] mb-1">
              <TrendingUp className="w-3.5 h-3.5 text-[#2DD4BF]" />
              <span>Longitudinal Telemetry</span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-white font-display flex items-center gap-2">
              <span>Perceptual Accuracy Trajectory Over Time</span>
            </h2>
            <p className="text-xs text-[#8A90B8] mt-0.5 max-w-xl">
              Chronological trial tracking comparing automated descriptor overlap, subjective resonance, and smoothed rolling average against the 25% chance baseline.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 self-start lg:self-auto">
            {/* Improvement Trajectory Delta Badge */}
            {trajectory && (
              <div className={`px-2.5 py-1.5 rounded-lg border text-xs font-mono-code flex items-center gap-1.5 ${
                trajectory.delta > 0
                  ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300'
                  : trajectory.delta < 0
                  ? 'bg-rose-950/40 border-rose-500/40 text-rose-300'
                  : 'bg-[#141738] border-[#2DD4BF]/40 text-[#5EEAD4]'
              }`}>
                {trajectory.delta > 0 ? (
                  <ArrowUpRight className="w-3.5 h-3.5 text-emerald-400 stroke-[2.5]" />
                ) : trajectory.delta < 0 ? (
                  <ArrowDownRight className="w-3.5 h-3.5 text-rose-400 stroke-[2.5]" />
                ) : (
                  <Activity className="w-3.5 h-3.5 text-[#2DD4BF]" />
                )}
                <span>
                  {trajectory.delta > 0 ? `+${trajectory.delta}% Trajectory Gain` : trajectory.delta < 0 ? `${trajectory.delta}% Trajectory Shift` : '±0% Baseline Stable'}
                </span>
              </div>
            )}

            {/* Time range pills if 5+ sessions */}
            {rawChartData.length >= 5 && (
              <div className="flex items-center gap-1 p-0.5 bg-[#080914] rounded-lg border border-[#242A5C] text-xs">
                <button
                  type="button"
                  onClick={() => setChartRange('all')}
                  className={`px-2.5 py-1 rounded text-[11px] font-mono-code transition-all ${
                    chartRange === 'all'
                      ? 'bg-[#242A5C] text-[#2DD4BF] font-semibold shadow-sm'
                      : 'text-[#8A90B8] hover:text-white'
                  }`}
                >
                  All ({rawChartData.length})
                </button>
                {rawChartData.length > 10 && (
                  <button
                    type="button"
                    onClick={() => setChartRange('10')}
                    className={`px-2.5 py-1 rounded text-[11px] font-mono-code transition-all ${
                      chartRange === '10'
                        ? 'bg-[#242A5C] text-[#2DD4BF] font-semibold shadow-sm'
                        : 'text-[#8A90B8] hover:text-white'
                    }`}
                  >
                    Last 10
                  </button>
                )}
                {rawChartData.length > 20 && (
                  <button
                    type="button"
                    onClick={() => setChartRange('20')}
                    className={`px-2.5 py-1 rounded text-[11px] font-mono-code transition-all ${
                      chartRange === '20'
                        ? 'bg-[#242A5C] text-[#2DD4BF] font-semibold shadow-sm'
                        : 'text-[#8A90B8] hover:text-white'
                    }`}
                  >
                    Last 20
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Interactive Metric Toggle Filters */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4 relative z-10 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] text-[#71779E] font-mono-code uppercase mr-1">Display Series:</span>
            
            <button
              type="button"
              onClick={() => setShowDescriptorScore(!showDescriptorScore)}
              className={`px-2.5 py-1 rounded-lg border flex items-center gap-1.5 transition-all ${
                showDescriptorScore
                  ? 'bg-[#1C1735] border-[#C4B5FD] text-[#C4B5FD] shadow-sm shadow-[#C4B5FD]/10'
                  : 'bg-[#080914] border-[#242A5C] text-[#666B92] hover:text-[#9FA6D1]'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${showDescriptorScore ? 'bg-[#C4B5FD]' : 'bg-[#666B92]'}`} />
              <span className="font-medium">Descriptor Overlap %</span>
            </button>

            <button
              type="button"
              onClick={() => setShowRunningAverage(!showRunningAverage)}
              className={`px-2.5 py-1 rounded-lg border flex items-center gap-1.5 transition-all ${
                showRunningAverage
                  ? 'bg-[#0E242B] border-[#2DD4BF] text-[#2DD4BF] shadow-sm shadow-[#2DD4BF]/10'
                  : 'bg-[#080914] border-[#242A5C] text-[#666B92] hover:text-[#9FA6D1]'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${showRunningAverage ? 'bg-[#2DD4BF]' : 'bg-[#666B92]'}`} />
              <span className="font-medium">Rolling Mean Trend</span>
            </button>

            <button
              type="button"
              onClick={() => setShowSelfRating(!showSelfRating)}
              className={`px-2.5 py-1 rounded-lg border flex items-center gap-1.5 transition-all ${
                showSelfRating
                  ? 'bg-[#122630] border-[#5EEAD4] text-[#5EEAD4] shadow-sm shadow-[#5EEAD4]/10'
                  : 'bg-[#080914] border-[#242A5C] text-[#666B92] hover:text-[#9FA6D1]'
              }`}
            >
              <span className={`w-2 h-2 rounded-full border border-dashed ${showSelfRating ? 'bg-[#5EEAD4] border-[#5EEAD4]' : 'bg-[#666B92] border-[#666B92]'}`} />
              <span className="font-medium">Self-Rating Score</span>
            </button>
          </div>

          <div className="text-[11px] text-[#71779E] font-mono-code flex items-center gap-3">
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-[2px] bg-rose-400" />
              <span className="text-rose-400/90">25% Chance Baseline</span>
            </span>
            <span className="hidden sm:flex items-center gap-1">
              <span className="w-2.5 h-[2px] bg-[#2DD4BF]/50" />
              <span>65% High Resonance</span>
            </span>
          </div>
        </div>

        {/* The Recharts Line Chart Container */}
        {chartData.length > 0 ? (
          <div className="w-full relative z-10">
            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={chartData}
                  margin={{ top: 14, right: 16, left: -20, bottom: 4 }}
                >
                  <CartesianGrid 
                    strokeDasharray="3 3" 
                    stroke="#242A5C" 
                    opacity={0.45} 
                    vertical={false}
                  />

                  <XAxis 
                    dataKey="label" 
                    stroke="#50567E" 
                    tick={{ fill: '#787EA8', fontSize: 11, fontFamily: 'monospace' }} 
                    tickLine={false}
                    axisLine={{ stroke: '#242A5C' }}
                  />

                  <YAxis 
                    domain={[0, 100]} 
                    ticks={[0, 25, 50, 75, 100]}
                    stroke="#50567E" 
                    tick={{ fill: '#787EA8', fontSize: 11, fontFamily: 'monospace' }} 
                    unit="%" 
                    tickLine={false}
                    axisLine={{ stroke: '#242A5C' }}
                  />

                  {/* 25% Parapsychological Chance Baseline */}
                  <ReferenceLine 
                    y={25} 
                    stroke="#FB7185" 
                    strokeDasharray="4 4" 
                    strokeWidth={1.5}
                    opacity={0.8}
                  />

                  {/* 65% Strong Resonance Line */}
                  <ReferenceLine 
                    y={65} 
                    stroke="#2DD4BF" 
                    strokeDasharray="3 3" 
                    strokeWidth={1}
                    opacity={0.35}
                  />

                  {/* Custom Tooltip */}
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-[#0A0D1E]/95 border border-[#2DD4BF]/50 rounded-xl p-3 shadow-2xl backdrop-blur-md text-xs min-w-[220px]">
                            <div className="flex items-center justify-between border-b border-[#242A5C] pb-1.5 mb-2">
                              <div className="flex items-center gap-1.5">
                                <span className="font-mono-code font-bold text-[#2DD4BF] text-xs">
                                  {data.shortCode}
                                </span>
                                <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#141E38] text-[#C4B5FD] font-mono-code">
                                  Trial #{data.index}
                                </span>
                              </div>
                              <span className="text-[#8A90B8] text-[10px]">{data.date}</span>
                            </div>

                            <div className="font-medium text-white mb-2 truncate max-w-[210px]">
                              {data.targetName}
                            </div>

                            <div className="space-y-1.5">
                              <div className="flex items-center justify-between text-[#C4B5FD]">
                                <span className="flex items-center gap-1.5">
                                  <span className="w-2 h-2 rounded-full bg-[#C4B5FD]" />
                                  <span>Descriptor Overlap:</span>
                                </span>
                                <span className="font-mono-code font-bold text-white">{data.descriptorScore}%</span>
                              </div>

                              <div className="flex items-center justify-between text-[#2DD4BF]">
                                <span className="flex items-center gap-1.5">
                                  <span className="w-2 h-2 rounded-full bg-[#2DD4BF]" />
                                  <span>Rolling Mean Trend:</span>
                                </span>
                                <span className="font-mono-code font-bold text-white">{data.runningAverage}%</span>
                              </div>

                              {data.selfScore !== null && (
                                <div className="flex items-center justify-between text-[#5EEAD4]">
                                  <span className="flex items-center gap-1.5">
                                    <span className="w-2 h-2 rounded-full bg-[#5EEAD4]" />
                                    <span>Self-Rating:</span>
                                  </span>
                                  <span className="font-medium capitalize text-white">
                                    {data.selfRating} ({data.selfScore}%)
                                  </span>
                                </div>
                              )}
                            </div>

                            <div className="mt-2.5 pt-1.5 border-t border-[#242A5C]/60 text-[10px] text-[#71779E] text-center flex items-center justify-center gap-1">
                              <span>Click node to review evaluation</span>
                              <ChevronRight className="w-3 h-3 text-[#2DD4BF]" />
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />

                  {/* Series 1: Session Descriptor Score (Lavender) */}
                  {showDescriptorScore && (
                    <Line
                      type="monotone"
                      dataKey="descriptorScore"
                      name="Descriptor Overlap %"
                      stroke="#C4B5FD"
                      strokeWidth={2}
                      dot={{
                        fill: '#12142B',
                        stroke: '#C4B5FD',
                        strokeWidth: 2,
                        r: 4,
                      }}
                      activeDot={{
                        r: 6,
                        fill: '#C4B5FD',
                        stroke: '#FFFFFF',
                        strokeWidth: 2,
                        cursor: 'pointer',
                        onClick: (_e: any, payload: any) => {
                          if (payload?.payload?.rawSession) {
                            onSelectSession(payload.payload.rawSession);
                          }
                        },
                      }}
                    />
                  )}

                  {/* Series 2: Cumulative Rolling Mean Average (Teal) */}
                  {showRunningAverage && (
                    <Line
                      type="monotone"
                      dataKey="runningAverage"
                      name="Rolling Mean Average"
                      stroke="#2DD4BF"
                      strokeWidth={3}
                      dot={false}
                      activeDot={{
                        r: 5,
                        fill: '#2DD4BF',
                        stroke: '#FFFFFF',
                        strokeWidth: 2,
                        cursor: 'pointer',
                        onClick: (_e: any, payload: any) => {
                          if (payload?.payload?.rawSession) {
                            onSelectSession(payload.payload.rawSession);
                          }
                        },
                      }}
                    />
                  )}

                  {/* Series 3: Self-Rated Score (Soft Cyan / Dashed) */}
                  {showSelfRating && (
                    <Line
                      type="monotone"
                      dataKey="selfScore"
                      name="Self-Rating Score"
                      stroke="#5EEAD4"
                      strokeDasharray="4 4"
                      strokeWidth={1.5}
                      dot={{
                        fill: '#080914',
                        stroke: '#5EEAD4',
                        strokeWidth: 1.5,
                        r: 3,
                      }}
                      connectNulls
                      activeDot={{
                        r: 5,
                        fill: '#5EEAD4',
                        stroke: '#FFFFFF',
                        strokeWidth: 1.5,
                      }}
                    />
                  )}
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Micro Caption & Interaction Tip */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mt-2 pt-2 border-t border-[#242A5C]/40 text-[11px] text-[#71779E] font-mono-code">
              <span>{rawChartData.length} sequential sessions plotted · Chronological order (earliest → latest)</span>
              <span className="text-[#8A90B8]">Tip: Click any node on the line to jump directly to that session</span>
            </div>
          </div>
        ) : (
          /* Empty state when 0 sessions */
          <div className="py-8 text-center relative z-10">
            <LineChartIcon className="w-10 h-10 text-[#2DD4BF]/40 mx-auto mb-2" />
            <h3 className="text-white font-display text-sm font-semibold mb-1">
              Performance Trajectory Awaiting Trial Data
            </h3>
            <p className="text-xs text-[#8A90B8] max-w-md mx-auto mb-4">
              Your accuracy progression curve will render here across completed blind sessions, measuring your perceptual signal improvement against the 25% chance baseline.
            </p>
            <button
              type="button"
              onClick={onStartNewSession}
              className="px-4 py-2 bg-gradient-to-r from-[#C4B5FD] to-[#2DD4BF] text-[#080914] font-semibold text-xs rounded-xl font-display uppercase tracking-wider shadow-md hover:from-white hover:to-[#5EEAD4] transition-all"
            >
              Conduct First Trial Session
            </button>
          </div>
        )}
      </div>

      {/* APERTURE MILESTONES & ACHIEVEMENT BADGES */}
      <AchievementsSection sessions={sessions} />

      {/* CHANCE BASELINE VISUAL BENCHMARK STRIP */}
      {stats.judgeStats.totalJudged > 0 && (
        <div className="bg-[#0E1026] border border-[#242A5C] rounded-2xl p-5 mb-8 shadow-lg">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
            <div>
              <h3 className="font-display text-sm font-bold text-white flex items-center gap-2">
                <TargetIcon className="w-4 h-4 text-[#2DD4BF]" />
                <span>Statistical Rigor: Blind 4-Choice vs. 25% Chance Baseline</span>
              </h3>
              <p className="text-xs text-[#8A90B8]">
                In parapsychological testing, random guessing correctly picks 1 out of 4 decoys exactly 25% of the time.
              </p>
            </div>

            <div className="text-right text-xs font-mono-code">
              <span className="text-[#8A90B8]">Performance Delta: </span>
              <span className={stats.judgeStats.hitRate >= 25 ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                {stats.judgeStats.hitRate >= 25 ? `+${stats.judgeStats.hitRate - 25}%` : `${stats.judgeStats.hitRate - 25}%`}
              </span>
            </div>
          </div>

          {/* Visual Benchmark Line */}
          <div className="relative w-full h-4 bg-[#141733] rounded-full overflow-hidden my-2">
            {/* 25% Chance Baseline marker */}
            <div
              className="absolute top-0 bottom-0 w-[2px] bg-rose-400 z-10"
              style={{ left: '25%' }}
            />
            {/* User progress fill */}
            <div
              className={`h-full rounded-full transition-all duration-700 ${
                stats.judgeStats.hitRate >= 25 ? 'bg-gradient-to-r from-[#C4B5FD] via-[#A78BFA] to-[#2DD4BF]' : 'bg-[#A78BFA]'
              }`}
              style={{ width: `${Math.min(100, stats.judgeStats.hitRate)}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] text-[#787EA8] font-mono-code">
            <span>0%</span>
            <span className="text-rose-400 font-semibold">25% (Random Guessing Line)</span>
            <span>50%</span>
            <span>75%</span>
            <span>100%</span>
          </div>
        </div>
      )}

      {/* METHOD TRACKING TELEMETRY BREAKDOWN */}
      {Object.keys(stats.methodBreakdown).length > 0 && (
        <div className="bg-[#0E1026] border border-[#242A5C] rounded-2xl p-5 mb-8 shadow-lg">
          <div className="flex items-center gap-2 text-xs font-mono-code text-[#2DD4BF] uppercase mb-3">
            <Sliders className="w-3.5 h-3.5" />
            <span>Accuracy Breakdown by Method & Technique</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {Object.entries(stats.methodBreakdown).map(([tech, data]) => (
              <div key={tech} className="p-3 rounded-xl bg-[#080914] border border-[#242A5C]">
                <div className="text-xs font-semibold text-white truncate mb-1">
                  {tech}
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#787EA8]">{data.sessions} sessions</span>
                  <span className="font-mono-code text-[#D8B4FE] font-bold">
                    {data.accuracy}% accuracy
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sessions Filter & List */}
      <div className="bg-[#0E1026] border border-[#242A5C] rounded-2xl p-5 sm:p-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 border-b border-[#242A5C]/60 pb-4">
          {/* Filter tabs */}
          <div className="flex items-center gap-1 p-1 bg-[#141733] rounded-lg border border-[#242A5C] overflow-x-auto">
            <button
              type="button"
              onClick={() => setFilter('all')}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-all whitespace-nowrap ${
                filter === 'all'
                  ? 'bg-[#242A5C] text-[#5EEAD4] shadow-sm'
                  : 'text-[#8A90B8] hover:text-white'
              }`}
            >
              All ({sessions.length})
            </button>
            <button
              type="button"
              onClick={() => setFilter('judge_hit')}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-all whitespace-nowrap ${
                filter === 'judge_hit'
                  ? 'bg-[#242A5C] text-emerald-400 shadow-sm border border-emerald-500/30'
                  : 'text-[#8A90B8] hover:text-white'
              }`}
            >
              Judge Hit ({stats.judgeStats.hits})
            </button>
            <button
              type="button"
              onClick={() => setFilter('yes')}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-all whitespace-nowrap ${
                filter === 'yes'
                  ? 'bg-emerald-950 text-emerald-400 shadow-sm border border-emerald-500/30'
                  : 'text-[#8A90B8] hover:text-white'
              }`}
            >
              Self Yes ({stats.selfRatings.yes})
            </button>
            <button
              type="button"
              onClick={() => setFilter('partially')}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-all whitespace-nowrap ${
                filter === 'partially'
                  ? 'bg-[#152538] text-[#5EEAD4] shadow-sm border border-[#2DD4BF]/40'
                  : 'text-[#8A90B8] hover:text-white'
              }`}
            >
              Partial ({stats.selfRatings.partially})
            </button>
            <button
              type="button"
              onClick={() => setFilter('no')}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-all whitespace-nowrap ${
                filter === 'no'
                  ? 'bg-[#24171E] text-rose-300 shadow-sm border border-rose-500/30'
                  : 'text-[#8A90B8] hover:text-white'
              }`}
            >
              Miss ({stats.selfRatings.no})
            </button>
            <button
              type="button"
              onClick={() => setFilter('daily')}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-all whitespace-nowrap ${
                filter === 'daily'
                  ? 'bg-[#242A5C] text-[#C4B5FD] shadow-sm'
                  : 'text-[#8A90B8] hover:text-white'
              }`}
            >
              Daily
            </button>
          </div>

          {/* Search box */}
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search code, target, method, notes..."
            className="bg-[#080914] border border-[#242A5C] rounded-lg px-3 py-1.5 text-xs text-[#E0E2EC] placeholder-[#4F5478] focus:outline-none focus:border-[#2DD4BF] w-full sm:w-56"
          />
        </div>

        {/* Sessions list */}
        {filteredSessions.length > 0 ? (
          <div className="space-y-3">
            {filteredSessions.map(session => {
              const ratingColor =
                session.selfRating === 'yes'
                  ? 'text-emerald-400 bg-emerald-950/50 border-emerald-500/40'
                  : session.selfRating === 'partially'
                  ? 'text-[#5EEAD4] bg-[#0E242B]/60 border-[#2DD4BF]/40'
                  : session.selfRating === 'no'
                  ? 'text-rose-400 bg-[#24171E]/60 border-rose-500/40'
                  : 'text-[#8A90B8] bg-[#141733] border-[#242A5C]';

              return (
                <div
                  key={session.id}
                  onClick={() => onSelectSession(session)}
                  className="p-4 rounded-xl bg-[#080914] border border-[#242A5C] hover:border-[#2DD4BF]/60 hover:bg-[#0D102A] transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
                >
                  <div className="flex items-center gap-3.5">
                    {/* Thumbnail */}
                    <div className="w-14 h-14 rounded-lg bg-[#141733] overflow-hidden shrink-0 border border-[#242A5C] relative">
                      <img
                        src={session.target.photo}
                        alt={session.target.name}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                    </div>

                    {/* Metadata */}
                    <div>
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="font-mono-code text-sm font-bold text-[#2DD4BF] tracking-wider">
                          {session.code}
                        </span>
                        <span className="text-[10px] font-mono-code uppercase px-1.5 py-0.2 rounded bg-[#242A5C] text-[#A2A9D4]">
                          Tier {session.target.tier}
                        </span>
                        {session.isDailyTarget && (
                          <span className="text-[10px] font-mono-code uppercase px-1.5 py-0.2 rounded bg-[#242A5C] text-[#C4B5FD]">
                            Daily
                          </span>
                        )}
                        <span className="text-xs text-white font-medium">
                          {session.target.name}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-xs text-[#787EA8]">
                        <span>{new Date(session.date).toLocaleDateString()}</span>
                        <span aria-hidden="true">·</span>
                        <span className="truncate max-w-[140px] sm:max-w-xs">{session.target.location}</span>
                        {session.method && (
                          <>
                            <span aria-hidden="true">·</span>
                            <span className="text-[#8B9BFF] hidden sm:inline">{session.method.technique.split(' ')[0]}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right side stats & rating */}
                  <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#242A5C]/40">
                    {/* Judge Badge */}
                    {session.judge && session.judge.selectedTargetId && (
                      <div className={`px-2 py-0.5 rounded text-[11px] font-mono-code border ${
                        session.judge.isHit
                          ? 'bg-emerald-950 border-emerald-500/50 text-emerald-300'
                          : 'bg-[#141733] border-[#242A5C] text-[#71779E]'
                      }`}>
                        {session.judge.isHit ? 'Judge: Hit' : 'Judge: Decoy'}
                      </div>
                    )}

                    <div className="text-right">
                      <div className="text-xs text-[#8A90B8]">
                        Auto: <span className="font-mono-code text-white font-semibold">{session.score.percentage}%</span>
                      </div>
                      <div className="text-[11px] text-[#71779E]">
                        {session.score.matchedTags.length} hits
                      </div>
                    </div>

                    <div className={`px-2.5 py-1 rounded-lg border text-xs font-semibold capitalize ${ratingColor}`}>
                      {session.selfRating ? `Self: ${session.selfRating}` : 'Unrated'}
                    </div>

                    <button
                      type="button"
                      onClick={(e) => handleDelete(session.id, e)}
                      title="Delete record"
                      className="p-1.5 text-[#5A608B] hover:text-rose-400 transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>

                    <ChevronRight className="w-4 h-4 text-[#787EA8] group-hover:text-white transition-colors" />
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <Sparkles className="w-8 h-8 text-[#2DD4BF]/40 mx-auto mb-3" />
            <h3 className="font-display text-base text-white font-semibold mb-1">
              No Viewing Sessions Found
            </h3>
            <p className="text-xs text-[#8A90B8] max-w-sm mx-auto mb-5">
              {sessions.length === 0
                ? 'Your logbook is clear. Begin a blind coordinate session to record impressions and build your archive.'
                : 'No sessions matched the active filter or query.'}
            </p>
            {sessions.length === 0 && (
              <button
                type="button"
                onClick={onStartNewSession}
                className="px-5 py-2.5 bg-gradient-to-r from-[#C4B5FD] via-[#A78BFA] to-[#2DD4BF] text-[#080914] font-semibold text-xs rounded-xl shadow-md uppercase tracking-wider font-display hover:from-white hover:to-[#5EEAD4] transition-all"
              >
                Start First Session
              </button>
            )}
          </div>
        )}

        {/* Clear Logbook Button */}
        {sessions.length > 0 && (
          <div className="mt-6 pt-4 border-t border-[#242A5C]/40 flex justify-end">
            {!showClearConfirm ? (
              <button
                type="button"
                onClick={() => setShowClearConfirm(true)}
                className="text-xs text-[#5A608B] hover:text-rose-400 transition-colors"
              >
                Reset Logbook History
              </button>
            ) : (
              <div className="flex items-center gap-2 text-xs">
                <span className="text-rose-400">Clear all records?</span>
                <button
                  type="button"
                  onClick={handleClearAll}
                  className="px-2.5 py-1 bg-rose-900/60 border border-rose-500 text-rose-200 rounded hover:bg-rose-900"
                >
                  Yes, Clear
                </button>
                <button
                  type="button"
                  onClick={() => setShowClearConfirm(false)}
                  className="px-2.5 py-1 bg-[#141733] text-[#8A90B8] rounded hover:text-white"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
