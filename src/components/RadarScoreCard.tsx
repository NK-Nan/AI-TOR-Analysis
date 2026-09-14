import React from 'react';
import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
  Tooltip,
} from 'recharts';
import { Award, CheckCircle2, TrendingUp, HelpCircle, ShieldCheck, Clock, Briefcase, Maximize2, Cpu, DollarSign } from 'lucide-react';
import { TORScore, RadarDataPoint } from '../types';

interface RadarScoreCardProps {
  scores: TORScore[];
  radarData: RadarDataPoint[];
}

const COLOR_PALETTE = [
  { stroke: '#2563eb', fill: '#3b82f6', fillOpacity: 0.25, name: 'สีน้ำเงิน' },
  { stroke: '#10b981', fill: '#10b981', fillOpacity: 0.25, name: 'สีเขียว' },
  { stroke: '#8b5cf6', fill: '#8b5cf6', fillOpacity: 0.25, name: 'สีม่วง' },
  { stroke: '#f59e0b', fill: '#f59e0b', fillOpacity: 0.25, name: 'สีส้ม' },
  { stroke: '#ef4444', fill: '#ef4444', fillOpacity: 0.25, name: 'สีแดง' },
];

export const RadarScoreCard: React.FC<RadarScoreCardProps> = ({ scores, radarData }) => {
  // Sort scores to determine rank
  const sortedScores = [...scores].sort((a, b) => b.totalScore - a.totalScore);

  const getRankBadge = (torId: string) => {
    const rank = sortedScores.findIndex((s) => s.torId === torId) + 1;
    if (rank === 1) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300 shadow-2xs">
          <Award className="w-3.5 h-3.5 text-amber-600" />
          <span>อันดับที่ 1 (คะแนนสูงสุด)</span>
        </span>
      );
    }
    if (rank === 2) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
          <span>อันดับที่ 2</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
        <span>อันดับที่ {rank}</span>
      </span>
    );
  };

  const getCriterionIcon = (criterion: string) => {
    switch (criterion) {
      case 'ระยะเวลา':
        return <Clock className="w-4 h-4 text-blue-600" />;
      case 'ความเชี่ยวชาญ':
        return <Briefcase className="w-4 h-4 text-indigo-600" />;
      case 'ขอบเขต':
        return <Maximize2 className="w-4 h-4 text-emerald-600" />;
      case 'เทคนิค':
        return <Cpu className="w-4 h-4 text-purple-600" />;
      case 'ราคา':
        return <DollarSign className="w-4 h-4 text-amber-600" />;
      default:
        return <TrendingUp className="w-4 h-4 text-slate-600" />;
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-4 sm:p-6 mb-6">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-5 border-b border-slate-200 gap-2">
        <div>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            <h2 className="text-base sm:text-lg font-bold text-slate-900 font-['Prompt',sans-serif]">
              การประเมินคะแนน 5 มิติ (เกณฑ์ข้อละ 10 คะแนน รวมเต็ม 50 คะแนน)
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            ประเมินตามกรอบ พ.ร.บ. การจัดซื้อจัดจ้างฯ พ.ศ. 2560 (ระยะเวลา, ความเชี่ยวชาญ, ขอบเขต, เทคนิค, ราคา)
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs bg-slate-100 text-slate-700 px-2.5 py-1 rounded-md font-medium border border-slate-200">
            เกณฑ์ Price-Performance
          </span>
        </div>
      </div>

      {/* Main Grid: Radar Chart + Score Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Radar Chart (5 Cols) */}
        <div className="lg:col-span-5 bg-slate-50/70 p-4 rounded-xl border border-slate-200/80 flex flex-col items-center">
          <div className="w-full flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-700 font-['Prompt',sans-serif]">
              แผนภูมิเรดาร์เปรียบเทียบมิติ (Radar Chart)
            </span>
            <span className="text-[11px] text-slate-400">มาตราส่วน 0 - 10</span>
          </div>

          <div className="w-full h-72 sm:h-80">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData} outerRadius="75%">
                <PolarGrid stroke="#cbd5e1" strokeDasharray="3 3" />
                <PolarAngleAxis
                  dataKey="criterion"
                  tick={{ fill: '#334155', fontSize: 12, fontWeight: 600 }}
                />
                <PolarRadiusAxis
                  angle={90}
                  domain={[0, 10]}
                  tick={{ fill: '#64748b', fontSize: 10 }}
                />
                {scores.map((s, idx) => {
                  const color = COLOR_PALETTE[idx % COLOR_PALETTE.length];
                  return (
                    <Radar
                      key={s.torId}
                      name={s.torName}
                      dataKey={s.torId}
                      stroke={color.stroke}
                      fill={color.fill}
                      fillOpacity={color.fillOpacity}
                      strokeWidth={2}
                    />
                  );
                })}
                <Tooltip
                  formatter={(val: any, name: any) => [`${val} / 10 คะแนน`, name]}
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderRadius: '8px',
                    borderColor: '#e2e8f0',
                    fontSize: '12px',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                  }}
                />
                <Legend
                  wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          <p className="text-[11px] text-slate-500 text-center mt-2">
            * คลิกที่ชื่อใน Legend เพื่อดูมิติความได้เปรียบ-เสียเปรียบของแต่ละข้อกำหนด
          </p>
        </div>

        {/* Score Cards Breakdown (7 Cols) */}
        <div className="lg:col-span-7 space-y-3.5">
          {scores.map((score, idx) => {
            const color = COLOR_PALETTE[idx % COLOR_PALETTE.length];
            const isTopRank = sortedScores[0]?.torId === score.torId;

            return (
              <div
                key={score.torId}
                className={`p-4 rounded-xl border transition-all ${
                  isTopRank
                    ? 'border-blue-400 bg-blue-50/20 shadow-xs'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                {/* Card Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2.5">
                    <span
                      className="w-3.5 h-3.5 rounded-full shrink-0"
                      style={{ backgroundColor: color.stroke }}
                    />
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 font-['Prompt',sans-serif]">
                        {score.torName}
                      </h3>
                      <span className="text-[11px] text-slate-500 font-mono">
                        รหัส: {score.torId}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {getRankBadge(score.torId)}
                    <div className="text-right">
                      <span className="text-xl font-extrabold text-blue-700 font-['Prompt',sans-serif]">
                        {score.totalScore.toFixed(1)}
                      </span>
                      <span className="text-xs text-slate-400 font-medium"> / 50</span>
                    </div>
                  </div>
                </div>

                {/* 5-Criteria Mini Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mb-3 text-xs">
                  <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                    <div className="flex items-center gap-1 text-slate-500 mb-0.5 text-[11px]">
                      {getCriterionIcon('ระยะเวลา')}
                      <span>ระยะเวลา</span>
                    </div>
                    <div className="font-bold text-slate-800 text-sm">
                      {score.durationScore} <span className="text-[10px] text-slate-400 font-normal">/10</span>
                    </div>
                  </div>

                  <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                    <div className="flex items-center gap-1 text-slate-500 mb-0.5 text-[11px]">
                      {getCriterionIcon('ความเชี่ยวชาญ')}
                      <span>ความเชี่ยวชาญ</span>
                    </div>
                    <div className="font-bold text-slate-800 text-sm">
                      {score.expertiseScore} <span className="text-[10px] text-slate-400 font-normal">/10</span>
                    </div>
                  </div>

                  <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                    <div className="flex items-center gap-1 text-slate-500 mb-0.5 text-[11px]">
                      {getCriterionIcon('ขอบเขต')}
                      <span>ขอบเขต</span>
                    </div>
                    <div className="font-bold text-slate-800 text-sm">
                      {score.scopeScore} <span className="text-[10px] text-slate-400 font-normal">/10</span>
                    </div>
                  </div>

                  <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                    <div className="flex items-center gap-1 text-slate-500 mb-0.5 text-[11px]">
                      {getCriterionIcon('เทคนิค')}
                      <span>เทคนิค</span>
                    </div>
                    <div className="font-bold text-slate-800 text-sm">
                      {score.technicalScore} <span className="text-[10px] text-slate-400 font-normal">/10</span>
                    </div>
                  </div>

                  <div className="p-2 rounded-lg bg-slate-50 border border-slate-100 col-span-2 sm:col-span-1">
                    <div className="flex items-center gap-1 text-slate-500 mb-0.5 text-[11px]">
                      {getCriterionIcon('ราคา')}
                      <span>ราคา</span>
                    </div>
                    <div className="font-bold text-slate-800 text-sm">
                      {score.priceScore} <span className="text-[10px] text-slate-400 font-normal">/10</span>
                    </div>
                  </div>
                </div>

                {/* Verdict text */}
                <div className="text-xs bg-slate-50/80 rounded-lg p-2.5 border border-slate-200/70 text-slate-700">
                  <span className="font-semibold text-slate-900 mr-1">ความเห็นเจ้าหน้าที่พัสดุ:</span>
                  <span>{score.summaryVerdict}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
