import React from 'react';
import {
  FileCheck2,
  ShieldAlert,
  HelpCircle,
  Wrench,
  CheckCircle,
  FileSignature,
  Download,
  Printer
} from 'lucide-react';
import { ProcurementRecommendations as RecsType } from '../types';

interface ProcurementRecommendationsProps {
  recommendations: RecsType;
  onPrintReport: () => void;
  onOpenPdfReport?: () => void;
}

export const ProcurementRecommendations: React.FC<ProcurementRecommendationsProps> = ({
  recommendations,
  onPrintReport,
  onOpenPdfReport,
}) => {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-4 sm:p-6 mb-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-5 border-b border-slate-200 gap-3">
        <div>
          <div className="flex items-center gap-2">
            <FileSignature className="w-5 h-5 text-emerald-600" />
            <h2 className="text-base sm:text-lg font-bold text-slate-900 font-['Prompt',sans-serif]">
              ข้อเสนอแนะสำหรับเจ้าหน้าที่พัสดุและคณะกรรมการตรวจรับพัสดุ
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            สรุปประเด็นกฎระเบียบ ความเสี่ยง และคำแนะนำเชิงปฏิบัติการเพื่อความโปร่งใสและคุ้มค่าของทางราชการ
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
          {onOpenPdfReport && (
            <button
              type="button"
              onClick={onOpenPdfReport}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200 transition-colors shadow-2xs"
              title="ส่งออกรายงานผลการวิเคราะห์เปรียบเทียบ TOR เป็นไฟล์ PDF สำหรับเสนอคณะกรรมการตรวจรับพัสดุ"
            >
              <Download className="w-3.5 h-3.5 text-blue-600" />
              <span>ส่งออกรายงาน PDF เสนอ กก.</span>
            </button>
          )}

          <button
            type="button"
            onClick={onPrintReport}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg border border-slate-200 transition-colors shadow-2xs"
          >
            <Printer className="w-3.5 h-3.5 text-slate-600" />
            <span>พิมพ์บันทึกข้อความสรุป</span>
          </button>
        </div>
      </div>

      {/* Grid: 4 Recommendation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {/* 1. Procurement Standards & Legal Frame */}
        <div className="p-4 rounded-xl border border-blue-100 bg-blue-50/30">
          <div className="flex items-center gap-2 text-blue-900 font-bold text-xs sm:text-sm font-['Prompt',sans-serif] mb-2.5">
            <FileCheck2 className="w-4 h-4 text-blue-600 shrink-0" />
            <span>ความสอดคล้องตาม พ.ร.บ. จัดซื้อจัดจ้างฯ ๒๕๖๐</span>
          </div>
          <ul className="space-y-2 text-xs text-slate-700">
            {recommendations.procurementStandards?.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2 leading-relaxed">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* 2. Anti-Vendor Lock-in Warnings */}
        <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/40">
          <div className="flex items-center gap-2 text-amber-950 font-bold text-xs sm:text-sm font-['Prompt',sans-serif] mb-2.5">
            <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
            <span>ข้อควรระวังเรื่องการกีดกันทางการค้าและการล็อกสเปก</span>
          </div>
          <ul className="space-y-2 text-xs text-slate-700">
            {recommendations.vendorLockInWarnings?.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2 leading-relaxed">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* 3. Committee Inquiry Questions */}
        <div className="p-4 rounded-xl border border-indigo-100 bg-indigo-50/30">
          <div className="flex items-center gap-2 text-indigo-950 font-bold text-xs sm:text-sm font-['Prompt',sans-serif] mb-2.5">
            <HelpCircle className="w-4 h-4 text-indigo-600 shrink-0" />
            <span>ประเด็นคำถามสำคัญที่คณะกรรมการควรซักถามผู้ยื่นข้อเสนอ</span>
          </div>
          <ul className="space-y-2 text-xs text-slate-700">
            {recommendations.committeeInquiryQuestions?.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2 leading-relaxed">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* 4. Maintenance & SLA */}
        <div className="p-4 rounded-xl border border-teal-100 bg-teal-50/30">
          <div className="flex items-center gap-2 text-teal-950 font-bold text-xs sm:text-sm font-['Prompt',sans-serif] mb-2.5">
            <Wrench className="w-4 h-4 text-teal-600 shrink-0" />
            <span>เงื่อนไขการรับประกัน บำรุงรักษา และ SLA</span>
          </div>
          <ul className="space-y-2 text-xs text-slate-700">
            {recommendations.maintenanceAndSla?.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2 leading-relaxed">
                <span className="w-1.5 h-1.5 rounded-full bg-teal-500 mt-1.5 shrink-0" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Official Conclusion Box */}
      <div className="p-4 sm:p-5 rounded-xl border-2 border-emerald-200 bg-emerald-50/40 relative overflow-hidden flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
            <CheckCircle className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 block mb-1">
              บทสรุปความเห็นของเจ้าหน้าที่พัสดุ (Formal Executive Verdict)
            </span>
            <p className="text-xs sm:text-sm text-slate-800 leading-relaxed font-['Sarabun',sans-serif]">
              {recommendations.overallConclusion}
            </p>
          </div>
        </div>

        {onOpenPdfReport && (
          <button
            type="button"
            onClick={onOpenPdfReport}
            className="shrink-0 inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-all active:scale-98"
          >
            <Download className="w-4 h-4" />
            <span>ส่งออกรายงาน PDF เสนอ กก.</span>
          </button>
        )}
      </div>
    </div>
  );
};
