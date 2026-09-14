import React, { useState, useRef } from 'react';
import {
  X,
  Printer,
  Download,
  FileText,
  CheckCircle2,
  AlertCircle,
  Building2,
  Calendar,
  PenTool,
  Sparkles,
  Layers,
  Award,
  ShieldCheck,
  RotateCcw
} from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { FullAnalysisResponse, TORDocument, MemorandumData } from '../types';

interface CommitteePdfReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  analysisData: FullAnalysisResponse | null;
  selectedDocuments: TORDocument[];
}

const DEFAULT_MEMO_DATA: MemorandumData = {
  govAgency: 'สำนักงานการบริหารพัสดุและเทคโนโลยีสารสนเทศ ส่วนงานจัดซื้อจัดจ้างภาครัฐ',
  docNumber: 'ที่ พศ ๐๒๐๔/๒๕๖๙',
  docDate: '๑๓ กันยายน ๒๕๖๙',
  subject:
    'รายงานผลการวิเคราะห์และเปรียบเทียบข้อกำหนดขอบเขตของงาน (TOR) โครงการจัดหาระบบตรวจจับป้ายทะเบียนรถยนต์ (LPR) เพื่อเสนอคณะกรรมการตรวจรับพัสดุ',
  salutation: 'เรียน ประธานกรรมการและคณะกรรมการตรวจรับพัสดุ / หัวหน้าเจ้าหน้าที่พัสดุ',
  chairpersonName: 'นายสมศักดิ์ มั่นคง',
  committeeMember1: 'นางสาวพัชรี สุขสมบูรณ์',
  committeeMember2: 'นายกิตติศักดิ์ ศรีวิชัย',
  procurementOfficer: 'นางสาวนงนุช เกตุจุ้ย',
  officerPosition: 'เจ้าหน้าที่พัสดุชำนาญการ',
};

export const CommitteePdfReportModal: React.FC<CommitteePdfReportModalProps> = ({
  isOpen,
  onClose,
  analysisData,
  selectedDocuments,
}) => {
  const [memo, setMemo] = useState<MemorandumData>(DEFAULT_MEMO_DATA);
  const [isEditingMemo, setIsEditingMemo] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [generationProgress, setGenerationProgress] = useState<string | null>(null);

  const printAreaRef = useRef<HTMLDivElement>(null);

  if (!isOpen || !analysisData) return null;

  // Ranked scores
  const sortedScores = [...(analysisData.scores || [])].sort((a, b) => b.totalScore - a.totalScore);

  // 1. Direct PDF Download with jsPDF and html2canvas
  const handleDownloadPdf = async () => {
    if (!printAreaRef.current) return;
    setIsGeneratingPdf(true);
    setGenerationProgress('กำลังแปลงเนื้อหารายงานเป็นภาพความละเอียดสูง (Rendering Document)...');

    try {
      const element = printAreaRef.current;

      // Temporary hide elements with data-no-pdf if needed
      const canvas = await html2canvas(element, {
        scale: 2, // High resolution for crisp Thai fonts
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        windowWidth: element.scrollWidth,
      });

      setGenerationProgress('กำลังจัดหน้ากระดาษ A4 มาตรฐานราชการ (Compiling PDF)...');

      const imgData = canvas.toDataURL('image/jpeg', 0.95);
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      const imgWidth = pdfWidth;
      const imgHeight = (canvas.height * pdfWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = 0;

      // First Page
      pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
      heightLeft -= pdfHeight;

      // Add subsequent pages if content exceeds 1 page
      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
        heightLeft -= pdfHeight;
      }

      pdf.save('รายงานวิเคราะห์เปรียบเทียบ_TOR_เสนอคณะกรรมการตรวจรับพัสดุ.pdf');
    } catch (err: any) {
      console.error('PDF Generation error:', err);
      alert('เกิดข้อผิดพลาดในการสร้างไฟล์ PDF: ' + (err?.message || err));
    } finally {
      setIsGeneratingPdf(false);
      setGenerationProgress(null);
    }
  };

  // 2. Direct Browser Print to PDF
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 print:p-0 print:bg-white print:static">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-5xl w-full max-h-[95vh] flex flex-col overflow-hidden animate-in fade-in duration-200 print:max-w-none print:w-full print:max-h-none print:shadow-none print:border-none print:rounded-none">
        {/* Top Control Bar (Hidden when printing) */}
        <div className="px-5 py-3.5 bg-slate-900 text-white flex items-center justify-between shrink-0 print:hidden">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold font-['Prompt',sans-serif]">
                ส่งออกรายงานผลการวิเคราะห์เปรียบเทียบ TOR สำหรับเสนอคณะกรรมการตรวจรับพัสดุ
              </h3>
              <p className="text-[11px] text-slate-300">
                จัดรูปแบบตามระเบียบสารบรรณราชการและ พ.ร.บ. การจัดซื้อจัดจ้างฯ พ.ศ. ๒๕๖๐
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsEditingMemo(!isEditingMemo)}
              className="px-2.5 py-1.5 text-xs rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors flex items-center gap-1.5"
            >
              <PenTool className="w-3.5 h-3.5 text-amber-400" />
              <span>{isEditingMemo ? 'ดูตัวอย่างเอกสาร' : 'แก้ไขหัวหนังสือ/ชื่อกรรมการ'}</span>
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="px-3 py-1.5 text-xs rounded-lg bg-slate-700 hover:bg-slate-600 text-white font-medium transition-colors flex items-center gap-1.5"
              title="พิมพ์เอกสาร หรือบันทึกเป็น PDF ผ่านระบบ Print Preview ของเบราว์เซอร์"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>พิมพ์ / บันทึกเป็น PDF</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadPdf}
              disabled={isGeneratingPdf}
              className="px-4 py-1.5 text-xs rounded-lg bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white font-bold shadow-xs transition-colors flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{isGeneratingPdf ? 'กำลังดาวน์โหลด...' : 'ดาวน์โหลดไฟล์ PDF ทันที (.pdf)'}</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Progress Alert */}
        {generationProgress && (
          <div className="bg-blue-50 border-b border-blue-200 px-6 py-2 text-xs text-blue-800 flex items-center gap-2 print:hidden">
            <div className="w-3.5 h-3.5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
            <span>{generationProgress}</span>
          </div>
        )}

        {/* Optional Metadata Editor Drawer */}
        {isEditingMemo && (
          <div className="p-4 bg-slate-50 border-b border-slate-200 text-xs print:hidden">
            <div className="font-bold text-slate-800 mb-2 font-['Prompt',sans-serif] flex items-center justify-between">
              <span>ข้อมูลบันทึกข้อความราชการและรายนามผู้ลงนาม:</span>
              <button
                type="button"
                onClick={() => setMemo(DEFAULT_MEMO_DATA)}
                className="text-[11px] text-blue-600 hover:underline flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" />
                <span>คืนค่าเริ่มต้น</span>
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <div className="sm:col-span-2">
                <label className="block text-[11px] text-slate-500 font-semibold mb-0.5">ส่วนราชการ</label>
                <input
                  type="text"
                  value={memo.govAgency}
                  onChange={(e) => setMemo({ ...memo, govAgency: e.target.value })}
                  className="w-full px-2 py-1 border border-slate-300 rounded bg-white text-xs"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-500 font-semibold mb-0.5">ที่ (เลขที่บันทึก)</label>
                <input
                  type="text"
                  value={memo.docNumber}
                  onChange={(e) => setMemo({ ...memo, docNumber: e.target.value })}
                  className="w-full px-2 py-1 border border-slate-300 rounded bg-white text-xs"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-500 font-semibold mb-0.5">วันที่</label>
                <input
                  type="text"
                  value={memo.docDate}
                  onChange={(e) => setMemo({ ...memo, docDate: e.target.value })}
                  className="w-full px-2 py-1 border border-slate-300 rounded bg-white text-xs"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-500 font-semibold mb-0.5">ประธานกรรมการตรวจรับพัสดุ</label>
                <input
                  type="text"
                  value={memo.chairpersonName}
                  onChange={(e) => setMemo({ ...memo, chairpersonName: e.target.value })}
                  className="w-full px-2 py-1 border border-slate-300 rounded bg-white text-xs"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-500 font-semibold mb-0.5">เจ้าหน้าที่พัสดุผู้จัดทำ</label>
                <input
                  type="text"
                  value={memo.procurementOfficer}
                  onChange={(e) => setMemo({ ...memo, procurementOfficer: e.target.value })}
                  className="w-full px-2 py-1 border border-slate-300 rounded bg-white text-xs"
                />
              </div>
            </div>
          </div>
        )}

        {/* Scrollable Container with the Printable Government Document */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-slate-100/70 print:p-0 print:bg-white print:overflow-visible">
          {/* A4 Paper Canvas */}
          <div
            ref={printAreaRef}
            id="committee-report-print-sheet"
            className="max-w-[210mm] mx-auto bg-white p-8 sm:p-12 shadow-md print:shadow-none border border-slate-200 print:border-none text-slate-900 font-['Sarabun',sans-serif] leading-relaxed text-[13px] print:text-[12px]"
          >
            {/* 1. Official Thai Memorandum Header */}
            <div className="border-b-2 border-slate-900 pb-4 mb-6">
              {/* Garuda Emblem */}
              <div className="flex justify-center mb-3">
                <svg
                  className="w-16 h-16 text-slate-900"
                  viewBox="0 0 100 100"
                  fill="currentColor"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M50 5 C55 12 65 15 75 10 C70 20 75 30 85 35 C75 40 70 50 72 65 C65 60 58 63 50 70 C42 63 35 60 28 65 C30 50 25 40 15 35 C25 30 30 20 25 10 C35 15 45 12 50 5 Z M50 22 C47 22 45 25 45 28 C45 31 47 34 50 34 C53 34 55 31 55 28 C55 25 53 22 50 22 Z M42 42 C40 45 42 50 50 52 C58 50 60 45 58 42 C54 44 46 44 42 42 Z" />
                </svg>
              </div>

              <h1 className="text-center text-2xl font-bold font-['Prompt',sans-serif] tracking-wide mb-4">
                บันทึกข้อความ
              </h1>

              <div className="grid grid-cols-2 gap-y-1.5 text-sm font-medium mb-2">
                <div>
                  <span className="font-bold">ส่วนราชการ:</span> {memo.govAgency}
                </div>
                <div className="text-right">
                  <span className="font-bold">ที่:</span> {memo.docNumber}
                </div>
                <div>
                  <span className="font-bold">วันที่:</span> {memo.docDate}
                </div>
                <div className="text-right">
                  <span className="font-bold">เวลาจัดทำ:</span> {new Date().toLocaleDateString('th-TH')}
                </div>
              </div>

              <div className="mt-2 text-sm">
                <p className="font-bold mb-1">
                  เรื่อง:{' '}
                  <span className="font-normal font-['Prompt',sans-serif]">
                    {memo.subject}
                  </span>
                </p>
                <p className="font-bold">
                  เรียน:{' '}
                  <span className="font-normal">
                    {memo.salutation}
                  </span>
                </p>
              </div>
            </div>

            {/* Content Body */}
            <div className="space-y-6">
              {/* ข้อ ๑: ความเป็นมาและวัตถุประสงค์ */}
              <section>
                <h2 className="font-bold text-sm text-slate-900 mb-2 font-['Prompt',sans-serif]">
                  ๑. ความเป็นมาและหลักการตามระเบียบพัสดุภาครัฐ
                </h2>
                <p className="text-justify indent-8 text-slate-800 leading-relaxed">
                  ตามที่หน่วยงานได้มีแผนงานจัดซื้อจัดจ้างโครงการพัฒนาระบบตรวจจับและอ่านป้ายทะเบียนรถยนต์ (License Plate Recognition: LPR) เพื่อเพิ่มประสิทธิภาพในการรักษาความปลอดภัย บริหารจัดการยานพาหนะเข้า-ออก และอำนวยความสะดวกแก่ผู้มาติดต่อ นั้น ฝ่ายพัสดุได้ดำเนินการรวบรวมข้อกำหนดขอบเขตของงาน (Terms of Reference: TOR) และข้อเสนอโครงการจากแหล่งข้อมูลเพื่อนำมาศึกษาวิเคราะห์เปรียบเทียบความคุ้มค่า ความเหมาะสมทางเทคนิค วงเงินงบประมาณ และเงื่อนไขการส่งมอบ โดยยึดมั่นตามหลักการ <strong>พระราชบัญญัติการจัดซื้อจัดจ้างและการบริหารพัสดุภาครัฐ พ.ศ. ๒๕๖๐ มาตรา ๘</strong> ซึ่งกำหนดให้การจัดซื้อจัดจ้างต้องมีความคุ้มค่า โปร่งใส มีประสิทธิภาพและประสิทธิผล และสามารถตรวจสอบได้
                </p>
              </section>

              {/* ข้อ ๒: รายชื่อข้อกำหนด TOR ที่นำมาวิเคราะห์ */}
              <section>
                <h2 className="font-bold text-sm text-slate-900 mb-2 font-['Prompt',sans-serif]">
                  ๒. สรุปรายชื่อเอกสาร TOR / ข้อเสนอโครงการที่นำมาเปรียบเทียบ (จำนวน {selectedDocuments.length} ฉบับ)
                </h2>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-slate-300 text-xs">
                    <thead>
                      <tr className="bg-slate-100 text-slate-800">
                        <th className="border border-slate-300 p-2 text-center w-12">ลำดับ</th>
                        <th className="border border-slate-300 p-2 text-left">ชื่อเอกสาร / โครงการ</th>
                        <th className="border border-slate-300 p-2 text-left">บริษัท / ผู้ยื่นข้อเสนอ</th>
                        <th className="border border-slate-300 p-2 text-center">วงเงิน (บาท)</th>
                        <th className="border border-slate-300 p-2 text-center">ระยะเวลา</th>
                        <th className="border border-slate-300 p-2 text-left">สถาปัตยกรรม</th>
                      </tr>
                    </thead>
                    <tbody>
                      {analysisData.torDetails.map((td, idx) => (
                        <tr key={td.torId} className="hover:bg-slate-50">
                          <td className="border border-slate-300 p-2 text-center font-bold">{idx + 1}</td>
                          <td className="border border-slate-300 p-2 font-medium">
                            {td.torName}
                            <div className="text-[11px] text-slate-500 font-mono">ID: {td.torId}</div>
                          </td>
                          <td className="border border-slate-300 p-2">{td.companyOrBidder || '-'}</td>
                          <td className="border border-slate-300 p-2 text-center font-mono font-semibold">
                            {td.price || '-'}
                          </td>
                          <td className="border border-slate-300 p-2 text-center">{td.duration || '-'}</td>
                          <td className="border border-slate-300 p-2 text-[11px]">
                            {td.softwareHardware.length > 80
                              ? td.softwareHardware.substring(0, 80) + '...'
                              : td.softwareHardware}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>

              {/* ข้อ ๓: ผลการประเมินคะแนน ๕ มิติ และการจัดลำดับ */}
              <section className="break-inside-avoid">
                <h2 className="font-bold text-sm text-slate-900 mb-2 font-['Prompt',sans-serif]">
                  ๓. ผลการประเมินคะแนน ๕ มิติ (เกณฑ์มาตรฐานข้อละ ๑๐ คะแนน รวม ๕๐ คะแนนเต็ม) และการจัดลำดับ
                </h2>
                <div className="overflow-x-auto mb-3">
                  <table className="w-full border-collapse border border-slate-300 text-xs">
                    <thead>
                      <tr className="bg-slate-100 text-slate-800">
                        <th className="border border-slate-300 p-2 text-center">อันดับ</th>
                        <th className="border border-slate-300 p-2 text-left">ชื่อ TOR / ผู้ยื่นข้อเสนอ</th>
                        <th className="border border-slate-300 p-2 text-center">ระยะเวลา<br/>(๑๐)</th>
                        <th className="border border-slate-300 p-2 text-center">ความเชี่ยวชาญ<br/>(๑๐)</th>
                        <th className="border border-slate-300 p-2 text-center">ขอบเขตงาน<br/>(๑๐)</th>
                        <th className="border border-slate-300 p-2 text-center">เทคนิค<br/>(๑๐)</th>
                        <th className="border border-slate-300 p-2 text-center">ราคา<br/>(๑๐)</th>
                        <th className="border border-slate-300 p-2 text-center bg-blue-50 font-bold">รวม<br/>(๕๐)</th>
                        <th className="border border-slate-300 p-2 text-left">บทสรุปประเมินภาพรวม</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sortedScores.map((sc, rank) => (
                        <tr key={sc.torId} className={rank === 0 ? 'bg-amber-50/40 font-medium' : ''}>
                          <td className="border border-slate-300 p-2 text-center font-bold">
                            {rank === 0 ? (
                              <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-amber-500 text-white text-[11px]">
                                ๑
                              </span>
                            ) : (
                              rank + 1
                            )}
                          </td>
                          <td className="border border-slate-300 p-2">
                            <span className="font-bold">{sc.torName}</span>
                          </td>
                          <td className="border border-slate-300 p-2 text-center font-mono">{sc.durationScore}</td>
                          <td className="border border-slate-300 p-2 text-center font-mono">{sc.expertiseScore}</td>
                          <td className="border border-slate-300 p-2 text-center font-mono">{sc.scopeScore}</td>
                          <td className="border border-slate-300 p-2 text-center font-mono">{sc.technicalScore}</td>
                          <td className="border border-slate-300 p-2 text-center font-mono">{sc.priceScore}</td>
                          <td className="border border-slate-300 p-2 text-center font-bold font-mono text-blue-800 bg-blue-50/70 text-sm">
                            {sc.totalScore.toFixed(1)}
                          </td>
                          <td className="border border-slate-300 p-2 text-[11px] text-slate-700">
                            {sc.summaryVerdict}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Detailed reasons for top scoring */}
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs space-y-1.5">
                  <div className="font-bold text-slate-800 font-['Prompt',sans-serif]">
                    ข้อวิเคราะห์เหตุผลการให้คะแนน (Score Rationales):
                  </div>
                  {sortedScores.map((sc) => (
                    <div key={sc.torId} className="text-slate-700 pl-2 border-l-2 border-blue-500 my-1">
                      <strong>{sc.torName} ({sc.totalScore} คะแนน):</strong>
                      <span className="ml-1 text-[12px]">
                        ด้านระยะเวลา: {sc.durationReason} | ด้านความเชี่ยวชาญ: {sc.expertiseReason} | ด้านขอบเขต: {sc.scopeReason} | ด้านเทคนิค: {sc.technicalReason} | ด้านราคา: {sc.priceReason}
                      </span>
                    </div>
                  ))}
                </div>
              </section>

              {/* ข้อ ๔: ตารางเปรียบเทียบสาระสำคัญ ๘ ประเด็น */}
              <section className="break-inside-avoid">
                <h2 className="font-bold text-sm text-slate-900 mb-2 font-['Prompt',sans-serif]">
                  ๔. ตารางเปรียบเทียบสาระสำคัญ ๘ ประเด็นตามข้อกำหนด TOR
                </h2>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-slate-300 text-xs">
                    <thead>
                      <tr className="bg-slate-100 text-slate-800">
                        <th className="border border-slate-300 p-2 text-left w-28">ประเด็นการวิเคราะห์</th>
                        {analysisData.torDetails.map((td) => (
                          <th key={td.torId} className="border border-slate-300 p-2 text-left">
                            {td.torName}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="border border-slate-300 p-2 font-bold bg-slate-50">๑. ชื่อ TOR</td>
                        {analysisData.torDetails.map((td) => (
                          <td key={td.torId} className="border border-slate-300 p-2 font-semibold">
                            {td.torName}
                          </td>
                        ))}
                      </tr>
                      <tr>
                        <td className="border border-slate-300 p-2 font-bold bg-slate-50">๒. ผู้ยื่น / บริษัท</td>
                        {analysisData.torDetails.map((td) => (
                          <td key={td.torId} className="border border-slate-300 p-2">
                            {td.companyOrBidder}
                          </td>
                        ))}
                      </tr>
                      <tr>
                        <td className="border border-slate-300 p-2 font-bold bg-slate-50">๓. ระยะเวลา</td>
                        {analysisData.torDetails.map((td) => (
                          <td key={td.torId} className="border border-slate-300 p-2">
                            {td.duration}
                          </td>
                        ))}
                      </tr>
                      <tr>
                        <td className="border border-slate-300 p-2 font-bold bg-slate-50">๔. ขอบเขตงาน</td>
                        {analysisData.torDetails.map((td) => (
                          <td key={td.torId} className="border border-slate-300 p-2 text-justify">
                            {td.scope}
                          </td>
                        ))}
                      </tr>
                      <tr>
                        <td className="border border-slate-300 p-2 font-bold bg-slate-50">๕. ซอฟต์แวร์/ฮาร์ดแวร์</td>
                        {analysisData.torDetails.map((td) => (
                          <td key={td.torId} className="border border-slate-300 p-2 whitespace-pre-line">
                            {td.softwareHardware}
                          </td>
                        ))}
                      </tr>
                      <tr>
                        <td className="border border-slate-300 p-2 font-bold bg-slate-50">๖. การส่งมอบงาน</td>
                        {analysisData.torDetails.map((td) => (
                          <td key={td.torId} className="border border-slate-300 p-2 whitespace-pre-line">
                            {td.deliverables}
                          </td>
                        ))}
                      </tr>
                      <tr>
                        <td className="border border-slate-300 p-2 font-bold bg-slate-50">๗. ราคา / งบประมาณ</td>
                        {analysisData.torDetails.map((td) => (
                          <td key={td.torId} className="border border-slate-300 p-2 font-mono font-bold text-blue-900">
                            {td.price}
                          </td>
                        ))}
                      </tr>
                      <tr>
                        <td className="border border-slate-300 p-2 font-bold bg-slate-50 align-top">
                          ๘. ความเชี่ยวชาญของบริษัทหรือผู้พัฒนา
                        </td>
                        {analysisData.torDetails.map((td) => (
                          <td key={td.torId} className="border border-slate-300 p-2 align-top">
                            {td.expertNames ? (
                              <div className="mb-1.5 p-1.5 bg-blue-50 border border-blue-200 rounded text-[11px] text-blue-950 font-medium">
                                <span className="font-bold text-blue-900 block mb-0.5">
                                  ชื่อผู้เชี่ยวชาญ / บุคลากรหลัก:
                                </span>
                                <span>{td.expertNames}</span>
                              </div>
                            ) : (
                              <div className="mb-1 text-[10px] text-slate-500 italic">
                                (ไม่ปรากฏชื่อผู้เชี่ยวชาญในเอกสาร)
                              </div>
                            )}
                            <div className="text-slate-700">
                              <span className="font-semibold text-[11px] block text-slate-800 mb-0.5">
                                คุณสมบัตินิติบุคคลและผลงาน:
                              </span>
                              <span>{td.expertise}</span>
                            </div>
                          </td>
                        ))}
                      </tr>
                    </tbody>
                  </table>
                </div>
              </section>

              {/* ข้อ ๕: การวิเคราะห์ความเหมือน ความต่าง และไฮไลท์ */}
              <section className="break-inside-avoid">
                <h2 className="font-bold text-sm text-slate-900 mb-2 font-['Prompt',sans-serif]">
                  ๕. การวิเคราะห์ความเหมือน ความต่าง และไฮไลท์จุดเด่น-จุดด้อย
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                  <div className="p-3 rounded-lg border border-emerald-200 bg-emerald-50/30 text-xs">
                    <h3 className="font-bold text-emerald-900 mb-1.5 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>ประเด็นความเหมือนที่สำคัญ (Key Similarities):</span>
                    </h3>
                    <ul className="space-y-1 list-disc list-inside text-emerald-950">
                      {analysisData.similarities.map((sim, i) => (
                        <li key={i}>
                          <strong>{sim.aspect}:</strong> {sim.detail} ({sim.significance})
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-3 rounded-lg border border-amber-200 bg-amber-50/30 text-xs">
                    <h3 className="font-bold text-amber-900 mb-1.5 flex items-center gap-1.5">
                      <AlertCircle className="w-4 h-4 text-amber-600" />
                      <span>ประเด็นความต่างและผลกระทบ (Key Differences):</span>
                    </h3>
                    <ul className="space-y-1 list-disc list-inside text-amber-950">
                      {analysisData.differences.map((diff, i) => (
                        <li key={i}>
                          <strong>{diff.aspect}:</strong> {diff.impact}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Strengths and Weaknesses */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                  {analysisData.torDetails.map((td) => (
                    <div key={td.torId} className="p-3 rounded-lg border border-slate-200 bg-slate-50 text-xs">
                      <div className="font-bold text-slate-800 mb-1 font-['Prompt',sans-serif]">{td.torName}</div>
                      <div className="text-[11px] text-emerald-700 font-semibold mb-0.5">จุดเด่น (Strengths):</div>
                      <ul className="list-disc list-inside text-[11px] text-slate-700 mb-1.5">
                        {td.strengths.map((s, idx) => (
                          <li key={idx}>{s}</li>
                        ))}
                      </ul>
                      <div className="text-[11px] text-rose-700 font-semibold mb-0.5">ข้อจำกัด (Weaknesses):</div>
                      <ul className="list-disc list-inside text-[11px] text-slate-700">
                        {td.weaknesses.map((w, idx) => (
                          <li key={idx}>{w}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </section>

              {/* ข้อ ๖: ข้อสังเกตและข้อเสนอแนะเจ้าหน้าที่พัสดุ */}
              <section className="break-inside-avoid">
                <h2 className="font-bold text-sm text-slate-900 mb-2 font-['Prompt',sans-serif]">
                  ๖. ข้อสังเกตและข้อเสนอแนะของเจ้าหน้าที่พัสดุ
                </h2>
                <div className="space-y-2 text-xs text-slate-800">
                  <div className="p-3 bg-blue-50/50 rounded-lg border border-blue-200">
                    <strong className="text-blue-900">๑) ความสอดคล้องตามมาตรฐานและระเบียบพัสดุ:</strong>
                    <ul className="list-disc list-inside mt-1 text-slate-700">
                      {analysisData.recommendations.procurementStandards.map((item, idx) => (
                        <li key={idx}>{item}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-3 bg-rose-50/40 rounded-lg border border-rose-200">
                    <strong className="text-rose-900">๒) ข้อควรระวังเรื่องการล็อกสเปก (Vendor Lock-in):</strong>
                    <ul className="list-disc list-inside mt-1 text-slate-700">
                      {analysisData.recommendations.vendorLockInWarnings.map((item, idx) => (
                        <li key={idx}>{item}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-3 bg-indigo-50/40 rounded-lg border border-indigo-200">
                    <strong className="text-indigo-900">๓) คำถามสำคัญสำหรับคณะกรรมการใช้ซักถามผู้ยื่นข้อเสนอ:</strong>
                    <ul className="list-disc list-inside mt-1 text-slate-700">
                      {analysisData.recommendations.committeeInquiryQuestions.map((item, idx) => (
                        <li key={idx}>{item}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <strong className="text-slate-900">๔) การรับประกันและการบริหาร SLA:</strong>
                    <ul className="list-disc list-inside mt-1 text-slate-700">
                      {analysisData.recommendations.maintenanceAndSla.map((item, idx) => (
                        <li key={idx}>{item}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </section>

              {/* ข้อ ๗: บทสรุปและข้อเสนอเพื่อโปรดพิจารณา */}
              <section className="break-inside-avoid">
                <h2 className="font-bold text-sm text-slate-900 mb-2 font-['Prompt',sans-serif]">
                  ๗. บทสรุปและข้อเสนอเพื่อโปรดพิจารณา
                </h2>
                <div className="p-3.5 bg-slate-100 rounded-lg border border-slate-300 text-xs text-justify leading-relaxed font-medium">
                  {analysisData.recommendations.overallConclusion}
                </div>
                <p className="mt-2 text-justify indent-8 text-xs text-slate-800">
                  จึงเรียนมาเพื่อโปรดพิจารณาผลการวิเคราะห์เปรียบเทียบข้อกำหนด TOR ข้างต้น เพื่อใช้ประกอบการพิจารณากำหนดร่างขอบเขตของงาน และการตรวจรับพัสดุให้เกิดประโยชน์สูงสุดแก่ทางราชการต่อไป
                </p>
              </section>

              {/* ข้อ ๘: ส่วนลงนามคณะกรรมการตรวจรับพัสดุและเจ้าหน้าที่ */}
              <section className="pt-6 border-t border-slate-300 break-inside-avoid">
                <div className="grid grid-cols-2 gap-8 text-center text-xs">
                  {/* Officer signature */}
                  <div className="space-y-1">
                    <p className="text-slate-500 mb-6">(ลงชื่อ)............................................................</p>
                    <p className="font-bold">({memo.procurementOfficer})</p>
                    <p className="text-slate-600">{memo.officerPosition}</p>
                    <p className="text-slate-500 text-[11px]">ผู้จัดทำรายงาน / เจ้าหน้าที่พัสดุ</p>
                  </div>

                  {/* Committee Chairperson signature */}
                  <div className="space-y-1">
                    <p className="text-slate-500 mb-6">(ลงชื่อ)............................................................</p>
                    <p className="font-bold">({memo.chairpersonName})</p>
                    <p className="text-slate-600">ประธานกรรมการตรวจรับพัสดุ</p>
                    <p className="text-slate-500 text-[11px]">ผู้พิจารณาผลการตรวจรับ</p>
                  </div>

                  {/* Committee Member 1 */}
                  <div className="space-y-1 pt-4">
                    <p className="text-slate-500 mb-6">(ลงชื่อ)............................................................</p>
                    <p className="font-bold">({memo.committeeMember1})</p>
                    <p className="text-slate-600">กรรมการตรวจรับพัสดุ</p>
                  </div>

                  {/* Committee Member 2 / Secretary */}
                  <div className="space-y-1 pt-4">
                    <p className="text-slate-500 mb-6">(ลงชื่อ)............................................................</p>
                    <p className="font-bold">({memo.committeeMember2})</p>
                    <p className="text-slate-600">กรรมการและเลขานุการ</p>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
