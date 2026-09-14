import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { DocumentSelector } from './components/DocumentSelector';
import { RadarScoreCard } from './components/RadarScoreCard';
import { EightAspectsTable } from './components/EightAspectsTable';
import { HighlightsAndDifferences } from './components/HighlightsAndDifferences';
import { ProcurementRecommendations } from './components/ProcurementRecommendations';
import { TorClarificationChat } from './components/TorClarificationChat';
import { OriginalDocumentModal } from './components/OriginalDocumentModal';
import { ProposalSubmissionModal } from './components/ProposalSubmissionModal';
import { CommitteePdfReportModal } from './components/CommitteePdfReportModal';
import { TORDocument, FullAnalysisResponse, FilterOptions, ProposalFormData } from './types';
import {
  TrendingUp,
  Table as TableIcon,
  GitCompare,
  FileSignature,
  MessageSquare,
  AlertCircle,
  RefreshCw,
  Sparkles,
  Award,
  Layers,
  CheckCircle2,
  FileText,
  Download
} from 'lucide-react';

export default function App() {
  const [documents, setDocuments] = useState<TORDocument[]>([]);
  const [analysisData, setAnalysisData] = useState<FullAnalysisResponse | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [customPrompt, setCustomPrompt] = useState('');
  const [modalDocument, setModalDocument] = useState<TORDocument | null>(null);
  const [isProposalModalOpen, setIsProposalModalOpen] = useState(false);
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'eight_aspects' | 'comparison' | 'recommendations' | 'qa'>('overview');
  const [warningNotice, setWarningNotice] = useState<string | null>(null);

  // Filter state for TOR filtering
  const [filter, setFilter] = useState<FilterOptions>({
    searchQuery: '',
    source: 'all',
    architecture: 'all',
    budgetRange: 'all',
    hasBarrierGate: 'all',
    lanes: 'all',
  });

  // 1. Initial fetch of Drive documents and default analysis
  useEffect(() => {
    async function initData() {
      try {
        setIsAnalyzing(true);
        // Fetch drive tors list
        const resDocs = await fetch('/api/drive-tors');
        const dataDocs = await resDocs.json();

        const docsList = dataDocs.documents || dataDocs.tors || [];
        if (dataDocs.success && Array.isArray(docsList) && docsList.length > 0) {
          const mappedDocs: TORDocument[] = docsList.map((t: any, idx: number) => ({
            id: t.id,
            title: t.title,
            filename: t.filename,
            content: t.fullText || t.content || '',
            source: 'drive' as const,
            budgetNumber: t.budgetNumber,
            architecture: t.architecture,
            hasBarrierGate: t.hasBarrierGate,
            hasVisitorSystem: t.hasVisitorSystem,
            lanesCount: t.lanesCount,
            companyName: t.companyName,
            isSelected: idx < 3, // Default select first 3 (TOR 01, TOR 02, TOR 03)
          }));
          setDocuments(mappedDocs);

          // Trigger initial analysis on the first 3
          const selectedTors = mappedDocs.filter((d) => d.isSelected);
          const resAnalyze = await fetch('/api/analyze-tors', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ tors: selectedTors }),
          });
          const dataAnalyze = await resAnalyze.json();
          if (dataAnalyze.success && dataAnalyze.data) {
            setAnalysisData(dataAnalyze.data);
            if (dataAnalyze.warning) setWarningNotice(dataAnalyze.warning);
          } else {
            setError(dataAnalyze.error || 'ไม่สามารถโหลดข้อมูลวิเคราะห์เริ่มต้นได้');
          }
        }
      } catch (err: any) {
        setError(err?.message || 'เกิดข้อผิดพลาดในการโหลดข้อมูล');
      } finally {
        setIsAnalyzing(false);
      }
    }

    initData();
  }, []);

  // 2. Handle Document Selection Toggles
  const handleToggleSelect = (id: string) => {
    setDocuments((prev) =>
      prev.map((doc) => (doc.id === id ? { ...doc, isSelected: !doc.isSelected } : doc))
    );
  };

  // 3. Handle Preset Switch
  const handleSelectPreset = (presetKey: 'preset_3_proposals' | 'preset_3_specs' | 'select_all') => {
    setDocuments((prev) =>
      prev.map((doc) => {
        if (presetKey === 'preset_3_proposals') {
          return { ...doc, isSelected: ['tor_01', 'tor_02', 'tor_03'].includes(doc.id) };
        } else if (presetKey === 'preset_3_specs') {
          return { ...doc, isSelected: ['tor_alt_1', 'tor_alt_2', 'tor_alt_3'].includes(doc.id) };
        } else {
          return { ...doc, isSelected: true };
        }
      })
    );
  };

  // 4. Handle File Upload (supports PDF, Word, Text)
  const handleUploadFile = async (file: File) => {
    const base64Content = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        const base64 = result.includes(',') ? result.split(',')[1] : result;
        resolve(base64);
      };
      reader.onerror = (e) => reject(e);
      reader.readAsDataURL(file);
    });

    const res = await fetch('/api/parse-file', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        filename: file.name,
        fileType: file.type,
        base64Content,
      }),
    });

    const data = await res.json();
    if (!data.success) {
      throw new Error(data.error || 'ไม่สามารถอ่านไฟล์ได้');
    }

    const newDoc: TORDocument = {
      id: `upload_${Date.now()}`,
      title: data.filename.replace(/\.[^/.]+$/, ''),
      filename: data.filename,
      content: data.extractedText,
      source: 'upload',
      sizeBytes: file.size,
      isSelected: true,
      architecture: 'basic',
      lanesCount: 2,
    };

    setDocuments((prev) => [newDoc, ...prev]);
  };

  // 5. Handle Project Proposal Submission via Screen
  const handleSubmitProposal = async (formData: ProposalFormData) => {
    const res = await fetch('/api/submit-proposal', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });

    const data = await res.json();
    if (!data.success || !data.document) {
      throw new Error(data.error || 'ไม่สามารถบันทึกข้อเสนอโครงการได้');
    }

    const newDoc: TORDocument = data.document;
    setDocuments((prev) => [newDoc, ...prev]);

    // Automatically trigger analysis with the newly added proposal
    setTimeout(() => {
      handleTriggerAnalysis(true);
    }, 150);
  };

  // 6. Remove Uploaded / Submitted Document
  const handleRemoveUploadedDoc = (id: string) => {
    setDocuments((prev) => prev.filter((d) => d.id !== id));
  };

  // 7. Trigger AI Analysis
  const handleTriggerAnalysis = async (forceAi = true) => {
    const selected = documents.filter((d) => d.isSelected);
    if (selected.length === 0) {
      alert('กรุณาเลือกเอกสาร TOR อย่างน้อย 1 ฉบับเพื่อวิเคราะห์');
      return;
    }

    setIsAnalyzing(true);
    setError(null);
    setWarningNotice(null);

    try {
      const res = await fetch('/api/analyze-tors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tors: selected,
          customPrompt: customPrompt.trim() || undefined,
          forceAi,
        }),
      });

      const data = await res.json();
      if (data.success && data.data) {
        setAnalysisData(data.data);
        if (data.warning) setWarningNotice(data.warning);
      } else {
        setError(data.error || 'การประมวลผลล้มเหลว กรุณาลองใหม่อีกครั้ง');
      }
    } catch (err: any) {
      setError(err?.message || 'เกิดข้อผิดพลาดในการติดต่อระบบ AI');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // 8. Print Report
  const handlePrint = () => {
    window.print();
  };

  const selectedDocs = documents.filter((d) => d.isSelected);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-['Sarabun',sans-serif]">
      {/* Header with Export Committee PDF button */}
      <Header
        onReanalyze={() => handleTriggerAnalysis(true)}
        isAnalyzing={isAnalyzing}
        onPrint={handlePrint}
        onOpenPdfReport={() => setIsPdfModalOpen(true)}
        selectedCount={selectedDocs.length}
      />

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1 w-full">
        {/* Document Selector & Manager Bar with TOR Filter & Proposal Submission */}
        <DocumentSelector
          documents={documents}
          filter={filter}
          setFilter={setFilter}
          onToggleSelect={handleToggleSelect}
          onSelectPreset={handleSelectPreset}
          onUploadFile={handleUploadFile}
          onRemoveUploadedDoc={handleRemoveUploadedDoc}
          onViewRawDocument={(doc) => setModalDocument(doc)}
          onOpenProposalModal={() => setIsProposalModalOpen(true)}
          customPrompt={customPrompt}
          setCustomPrompt={setCustomPrompt}
          onTriggerAnalysis={() => handleTriggerAnalysis(true)}
          isAnalyzing={isAnalyzing}
        />

        {/* Warning Notification Banner if any */}
        {warningNotice && (
          <div className="mb-6 p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center justify-between gap-3 shadow-2xs">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
              <span>{warningNotice}</span>
            </div>
            <button
              type="button"
              onClick={() => setWarningNotice(null)}
              className="text-amber-700 hover:text-amber-900 font-bold text-xs"
            >
              ปิด
            </button>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-start gap-3 shadow-xs">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-bold text-red-900 mb-1">เกิดข้อผิดพลาดในการประเมิน</h4>
              <p>{error}</p>
              <button
                type="button"
                onClick={() => handleTriggerAnalysis(false)}
                className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded-md font-medium text-xs transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>ลองประมวลผลใหม่อีกครั้ง</span>
              </button>
            </div>
          </div>
        )}

        {/* Navigation Tabs for Analysis Views */}
        <div className="border-b border-slate-200 mb-6 bg-white rounded-xl shadow-xs px-2 pt-2 flex items-center justify-between gap-2 overflow-x-auto">
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setActiveTab('overview')}
              className={`px-3.5 py-2.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-2 shrink-0 ${
                activeTab === 'overview'
                  ? 'bg-blue-50 text-blue-700 border border-blue-200 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <TrendingUp className="w-4 h-4 text-blue-600" />
              <span>ภาพรวม & คะแนนเรดาร์ 5 มิติ</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('eight_aspects')}
              className={`px-3.5 py-2.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-2 shrink-0 ${
                activeTab === 'eight_aspects'
                  ? 'bg-blue-50 text-blue-700 border border-blue-200 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <TableIcon className="w-4 h-4 text-indigo-600" />
              <span>ตารางสกัดข้อมูล 8 ประเด็นสำคัญ</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('comparison')}
              className={`px-3.5 py-2.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-2 shrink-0 ${
                activeTab === 'comparison'
                  ? 'bg-blue-50 text-blue-700 border border-blue-200 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <GitCompare className="w-4 h-4 text-emerald-600" />
              <span>ความเหมือน-ความต่าง & ไฮไลท์จุดเด่น</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('recommendations')}
              className={`px-3.5 py-2.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-2 shrink-0 ${
                activeTab === 'recommendations'
                  ? 'bg-blue-50 text-blue-700 border border-blue-200 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <FileSignature className="w-4 h-4 text-amber-600" />
              <span>ข้อเสนอแนะเจ้าหน้าที่พัสดุ & SLA</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('qa')}
              className={`px-3.5 py-2.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-2 shrink-0 ${
                activeTab === 'qa'
                  ? 'bg-blue-50 text-blue-700 border border-blue-200 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <MessageSquare className="w-4 h-4 text-purple-600" />
              <span>ถาม-ตอบข้อกำหนดพัสดุ (AI Q&A)</span>
            </button>
          </div>

          {/* Quick PDF Export Button on tab bar */}
          <button
            type="button"
            onClick={() => setIsPdfModalOpen(true)}
            className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1.5 mb-1.5 text-xs font-bold rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 transition-colors shadow-2xs shrink-0"
          >
            <Download className="w-3.5 h-3.5 text-amber-600" />
            <span>ส่งออก PDF เสนอคณะกรรมการ</span>
          </button>
        </div>

        {/* View Content based on activeTab or all combined in overview */}
        {analysisData ? (
          <div>
            {activeTab === 'overview' && (
              <>
                <RadarScoreCard
                  scores={analysisData.scores}
                  radarData={analysisData.radarData}
                />
                <EightAspectsTable torDetails={analysisData.torDetails} />
                <HighlightsAndDifferences
                  torDetails={analysisData.torDetails}
                  similarities={analysisData.similarities}
                  differences={analysisData.differences}
                />
                <ProcurementRecommendations
                  recommendations={analysisData.recommendations}
                  onPrintReport={handlePrint}
                  onOpenPdfReport={() => setIsPdfModalOpen(true)}
                />
                <TorClarificationChat activeDocuments={selectedDocs} />
              </>
            )}

            {activeTab === 'eight_aspects' && (
              <EightAspectsTable torDetails={analysisData.torDetails} />
            )}

            {activeTab === 'comparison' && (
              <HighlightsAndDifferences
                torDetails={analysisData.torDetails}
                similarities={analysisData.similarities}
                differences={analysisData.differences}
              />
            )}

            {activeTab === 'recommendations' && (
              <ProcurementRecommendations
                recommendations={analysisData.recommendations}
                onPrintReport={handlePrint}
                onOpenPdfReport={() => setIsPdfModalOpen(true)}
              />
            )}

            {activeTab === 'qa' && (
              <TorClarificationChat activeDocuments={selectedDocs} />
            )}
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-12 text-center">
            <RefreshCw className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800 font-['Prompt',sans-serif]">
              กำลังเตรียมข้อมูลการวิเคราะห์และเปรียบเทียบ TOR...
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              ระบบกำลังเชื่อมโยงข้อมูลจาก Google Drive และสกัดประเด็นตามระเบียบพัสดุ
            </p>
          </div>
        )}
      </main>

      {/* Raw Document View Modal */}
      <OriginalDocumentModal
        document={modalDocument}
        onClose={() => setModalDocument(null)}
      />

      {/* Proposal Submission Modal via screen */}
      <ProposalSubmissionModal
        isOpen={isProposalModalOpen}
        onClose={() => setIsProposalModalOpen(false)}
        onSubmit={handleSubmitProposal}
      />

      {/* Formatted Committee PDF Report Export Modal */}
      <CommitteePdfReportModal
        isOpen={isPdfModalOpen}
        onClose={() => setIsPdfModalOpen(false)}
        analysisData={analysisData}
        selectedDocuments={selectedDocs}
      />

      {/* Official Footer */}
      <footer className="bg-white border-t border-slate-200 py-4 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span>ระบบสนับสนุนงานพัสดุภาครัฐ (e-Procurement TOR Analysis Assistant)</span>
            <span>•</span>
            <span>ขับเคลื่อนด้วย Google Gemini API</span>
          </div>
          <div className="text-slate-400 text-[11px]">
            อ้างอิงพระราชบัญญัติการจัดซื้อจัดจ้างและการบริหารพัสดุภาครัฐ พ.ศ. ๒๕๖๐
          </div>
        </div>
      </footer>
    </div>
  );
}
