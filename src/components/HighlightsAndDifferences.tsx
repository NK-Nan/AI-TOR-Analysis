import React, { useState } from 'react';
import {
  GitCompare,
  Equal,
  Sparkles,
  ThumbsUp,
  ThumbsDown,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import { TORDetail } from '../types';

interface HighlightsAndDifferencesProps {
  torDetails: TORDetail[];
  similarities: Array<{ aspect: string; detail: string; significance: string }>;
  differences: Array<{ aspect: string; impact: string; torBreakdown: Record<string, string> }>;
}

export const HighlightsAndDifferences: React.FC<HighlightsAndDifferencesProps> = ({
  torDetails,
  similarities,
  differences,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'similar_diff' | 'strengths_weaknesses'>('similar_diff');

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-4 sm:p-6 mb-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-4 border-b border-slate-200 gap-3">
        <div>
          <div className="flex items-center gap-2">
            <GitCompare className="w-5 h-5 text-indigo-600" />
            <h2 className="text-base sm:text-lg font-bold text-slate-900 font-['Prompt',sans-serif]">
              การวิเคราะห์ความเหมือน ความต่าง และจุดเด่น-จุดด้อย (Highlights)
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            เปรียบเทียบนัยสำคัญและข้อจำกัดของแต่ละข้อกำหนดเพื่อป้องกันความเสี่ยงในการจัดหาพัสดุ
          </p>
        </div>

        {/* Sub-tab switcher */}
        <div className="inline-flex rounded-lg border border-slate-200 bg-slate-100 p-0.5 text-xs font-medium text-slate-600">
          <button
            type="button"
            onClick={() => setActiveSubTab('similar_diff')}
            className={`px-3 py-1 rounded-md transition-all flex items-center gap-1.5 ${
              activeSubTab === 'similar_diff'
                ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                : 'hover:text-slate-900'
            }`}
          >
            <Equal className="w-3.5 h-3.5 text-blue-600" />
            <span>ความเหมือน & ความต่าง</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab('strengths_weaknesses')}
            className={`px-3 py-1 rounded-md transition-all flex items-center gap-1.5 ${
              activeSubTab === 'strengths_weaknesses'
                ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                : 'hover:text-slate-900'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>จุดเด่น & จุดด้อยรายฉบับ</span>
          </button>
        </div>
      </div>

      {activeSubTab === 'similar_diff' ? (
        <div className="space-y-6">
          {/* Similarities section */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
              <h3 className="text-sm font-bold text-slate-800 font-['Prompt',sans-serif] flex items-center gap-1.5">
                <span>ประเด็นความเหมือนกัน (Commonalities & Similarities)</span>
                <span className="text-xs font-normal text-slate-500">({similarities.length} ประเด็น)</span>
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {similarities.map((item, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl border border-blue-100 bg-blue-50/30 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                      <h4 className="text-xs font-bold text-blue-950 font-['Prompt',sans-serif]">
                        {item.aspect}
                      </h4>
                    </div>
                    <p className="text-xs text-slate-700 leading-relaxed mb-3">
                      {item.detail}
                    </p>
                  </div>
                  <div className="pt-2 border-t border-blue-100 text-[11px] text-blue-800 bg-blue-50/80 -mx-3.5 -mb-3.5 p-2.5 rounded-b-xl">
                    <span className="font-semibold text-blue-900">นัยสำคัญทางพัสดุ: </span>
                    <span>{item.significance}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Differences section */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              <h3 className="text-sm font-bold text-slate-800 font-['Prompt',sans-serif] flex items-center gap-1.5">
                <span>ประเด็นความแตกต่างที่สำคัญ (Key Differences & Variations)</span>
                <span className="text-xs font-normal text-slate-500">({differences.length} ประเด็น)</span>
              </h3>
            </div>

            <div className="space-y-3.5">
              {differences.map((diff, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs hover:border-slate-300 transition-colors"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-2">
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900 font-['Prompt',sans-serif] flex items-center gap-2">
                      <span className="w-5 h-5 rounded-md bg-amber-100 text-amber-800 flex items-center justify-center text-xs font-mono">
                        {idx + 1}
                      </span>
                      <span>{diff.aspect}</span>
                    </h4>
                    <span className="text-[11px] text-amber-800 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full font-medium self-start sm:self-auto">
                      ผลกระทบ: {diff.impact}
                    </span>
                  </div>

                  {/* Breakdown columns */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 mt-3">
                    {Object.entries(diff.torBreakdown).map(([torKey, text]) => {
                      const matchingTor = torDetails.find((t) => t.torId === torKey);
                      return (
                        <div
                          key={torKey}
                          className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/80 text-xs"
                        >
                          <span className="font-bold text-slate-800 text-[11px] block mb-1 font-mono uppercase text-blue-700">
                            {matchingTor ? matchingTor.torName : torKey}
                          </span>
                          <p className="text-slate-600 text-xs leading-relaxed">{text}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* Strengths & Weaknesses Deck */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {torDetails.map((tor) => (
            <div
              key={tor.torId}
              className="rounded-xl border border-slate-200 bg-white shadow-xs overflow-hidden flex flex-col justify-between"
            >
              {/* Header */}
              <div className="p-3.5 bg-slate-50 border-b border-slate-200">
                <span className="text-[11px] font-bold text-blue-700 uppercase tracking-wider block mb-0.5">
                  {tor.torId.toUpperCase()}
                </span>
                <h3 className="text-xs sm:text-sm font-bold text-slate-900 font-['Prompt',sans-serif] line-clamp-2">
                  {tor.torName}
                </h3>
              </div>

              {/* Body */}
              <div className="p-4 space-y-4 text-xs flex-1">
                {/* Strengths */}
                <div>
                  <div className="flex items-center gap-1.5 text-emerald-700 font-bold mb-2">
                    <ThumbsUp className="w-4 h-4 text-emerald-600" />
                    <span>จุดเด่น (Strengths):</span>
                  </div>
                  <ul className="space-y-1.5 pl-1">
                    {tor.strengths && tor.strengths.length > 0 ? (
                      tor.strengths.map((str, i) => (
                        <li key={i} className="flex items-start gap-2 text-slate-700 text-xs leading-relaxed">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                          <span>{str}</span>
                        </li>
                      ))
                    ) : (
                      <li className="text-slate-400 italic">ไม่มีข้อมูลจุดเด่นระบุในเอกสาร</li>
                    )}
                  </ul>
                </div>

                {/* Weaknesses */}
                <div className="pt-3 border-t border-slate-100">
                  <div className="flex items-center gap-1.5 text-rose-700 font-bold mb-2">
                    <ThumbsDown className="w-4 h-4 text-rose-600" />
                    <span>จุดด้อย / ข้อจำกัด (Weaknesses):</span>
                  </div>
                  <ul className="space-y-1.5 pl-1">
                    {tor.weaknesses && tor.weaknesses.length > 0 ? (
                      tor.weaknesses.map((weak, i) => (
                        <li key={i} className="flex items-start gap-2 text-slate-700 text-xs leading-relaxed">
                          <AlertTriangle className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
                          <span>{weak}</span>
                        </li>
                      ))
                    ) : (
                      <li className="text-slate-400 italic">ไม่มีข้อมูลจุดด้อยระบุในเอกสาร</li>
                    )}
                  </ul>
                </div>
              </div>

              {/* Price footer pill */}
              <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-500">วงเงิน:</span>
                <span className="font-bold text-slate-800 text-[11px] truncate max-w-[200px]">{tor.price}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
