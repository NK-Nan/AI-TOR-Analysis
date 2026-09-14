import React from 'react';
import { ShieldCheck, FileSpreadsheet, ExternalLink, Printer, Sparkles, RefreshCw, FileText } from 'lucide-react';

interface HeaderProps {
  onReanalyze: () => void;
  isAnalyzing: boolean;
  onPrint: () => void;
  onOpenPdfReport: () => void;
  selectedCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  onReanalyze,
  isAnalyzing,
  onPrint,
  onOpenPdfReport,
  selectedCount,
}) => {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          {/* Logo & Title */}
          <div className="flex items-start gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-700 to-indigo-800 flex items-center justify-center text-white shadow-sm shrink-0 mt-0.5">
              <ShieldCheck className="w-6 h-6 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-800 border border-blue-200">
                  ระบบงานพัสดุภาครัฐ
                </span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-800 border border-emerald-200">
                  พ.ร.บ. จัดซื้อจัดจ้างฯ 2560
                </span>
                <span className="text-xs text-slate-500 hidden sm:inline">
                  Strict Grounding AI Engine
                </span>
              </div>
              <h1 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight font-['Prompt',sans-serif] mt-0.5">
                ระบบวิเคราะห์และเปรียบเทียบ TOR ระบบตรวจจับทะเบียนรถ (LPR)
              </h1>
              <p className="text-xs text-slate-600">
                เครื่องมือช่วยตัดสินใจสำหรับเจ้าหน้าที่พัสดุและคณะกรรมการกำหนดร่าง / คณะกรรมการตรวจรับพัสดุ
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 shrink-0 flex-wrap">
            <a
              href="https://drive.google.com/drive/folders/1A2n1s6XmydX_6v4EFyM1K2ZsVHwd_sLi?usp=sharing"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg border border-slate-200 transition-colors"
              title="เปิดโฟลเดอร์ Google Drive แหล่งเอกสารต้นทาง"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
              <span>Drive ต้นทาง</span>
              <ExternalLink className="w-3 h-3 text-slate-400" />
            </a>

            {/* Export Formatted PDF for Committee */}
            <button
              type="button"
              onClick={onOpenPdfReport}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-800 bg-amber-100/80 hover:bg-amber-200 rounded-lg border border-amber-300 transition-colors shadow-xs"
              title="ส่งออกรายงานผลการวิเคราะห์เปรียบเทียบ TOR เป็นไฟล์ PDF สำหรับเสนอคณะกรรมการตรวจรับพัสดุ"
            >
              <FileText className="w-3.5 h-3.5 text-amber-700" />
              <span>ส่งออกรายงาน PDF เสนอ กก.</span>
            </button>

            <button
              type="button"
              onClick={onPrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 rounded-lg border border-slate-300 transition-colors shadow-xs"
              title="สั่งพิมพ์หน้าปัจจุบัน"
            >
              <Printer className="w-3.5 h-3.5 text-slate-600" />
              <span className="hidden sm:inline">พิมพ์หน้า</span>
            </button>

            <button
              type="button"
              onClick={onReanalyze}
              disabled={isAnalyzing || selectedCount === 0}
              className={`inline-flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-lg shadow-xs transition-all ${
                isAnalyzing
                  ? 'bg-blue-300 text-white cursor-wait'
                  : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-600/20 active:scale-98'
              }`}
            >
              {isAnalyzing ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>กำลังวิเคราะห์ ({selectedCount} ฉบับ)...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  <span>วิเคราะห์ด้วย AI ใหม่</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
