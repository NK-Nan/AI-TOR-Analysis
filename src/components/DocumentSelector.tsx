import React, { useState, useRef } from 'react';
import {
  FolderArchive,
  UploadCloud,
  FileText,
  CheckCircle2,
  Circle,
  Eye,
  Trash2,
  Layers,
  Sparkles,
  HelpCircle,
  AlertCircle,
  Clock,
  Coins,
  Cpu,
  PlusCircle,
  Search,
  Filter,
  ShieldCheck,
  Building2,
  FileSpreadsheet
} from 'lucide-react';
import { TORDocument, FilterOptions } from '../types';
import { TorFilterBar } from './TorFilterBar';

interface DocumentSelectorProps {
  documents: TORDocument[];
  filter: FilterOptions;
  setFilter: React.Dispatch<React.SetStateAction<FilterOptions>>;
  onToggleSelect: (id: string) => void;
  onSelectPreset: (presetKey: 'preset_3_proposals' | 'preset_3_specs' | 'select_all') => void;
  onUploadFile: (file: File) => Promise<void>;
  onRemoveUploadedDoc: (id: string) => void;
  onViewRawDocument: (doc: TORDocument) => void;
  onOpenProposalModal: () => void;
  customPrompt: string;
  setCustomPrompt: (val: string) => void;
  onTriggerAnalysis: () => void;
  isAnalyzing: boolean;
}

export const DocumentSelector: React.FC<DocumentSelectorProps> = ({
  documents,
  filter,
  setFilter,
  onToggleSelect,
  onSelectPreset,
  onUploadFile,
  onRemoveUploadedDoc,
  onViewRawDocument,
  onOpenProposalModal,
  customPrompt,
  setCustomPrompt,
  onTriggerAnalysis,
  isAnalyzing,
}) => {
  const [activeTab, setActiveTab] = useState<'all' | 'drive' | 'upload' | 'submission'>('all');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Apply filtering logic
  const filteredDocs = documents.filter((doc) => {
    // Tab filter first
    if (activeTab !== 'all' && doc.source !== activeTab) {
      return false;
    }

    // Source filter from filter bar
    if (filter.source !== 'all' && doc.source !== filter.source) {
      return false;
    }

    // Architecture filter
    if (filter.architecture !== 'all' && doc.architecture !== filter.architecture) {
      return false;
    }

    // Budget range filter
    if (filter.budgetRange !== 'all') {
      const b = doc.budgetNumber || 0;
      if (filter.budgetRange === 'under_350k' && b >= 350000) return false;
      if (filter.budgetRange === '350k_600k' && (b < 350000 || b > 600000)) return false;
      if (filter.budgetRange === 'over_600k' && b <= 600000) return false;
    }

    // Barrier gate filter
    if (filter.hasBarrierGate !== 'all') {
      const hasGate = !!doc.hasBarrierGate;
      if (filter.hasBarrierGate === 'yes' && !hasGate) return false;
      if (filter.hasBarrierGate === 'no' && hasGate) return false;
    }

    // Lanes count filter
    if (filter.lanes !== 'all') {
      const l = doc.lanesCount || 1;
      if (filter.lanes === '1' && l !== 1) return false;
      if (filter.lanes === '2' && l !== 2) return false;
      if (filter.lanes === 'multi' && l <= 2) return false;
    }

    // Text search query
    if (filter.searchQuery.trim()) {
      const q = filter.searchQuery.toLowerCase();
      const matchTitle = (doc.title || '').toLowerCase().includes(q);
      const matchFile = (doc.filename || '').toLowerCase().includes(q);
      const matchCompany = (doc.companyName || '').toLowerCase().includes(q);
      const matchContent = (doc.content || '').toLowerCase().includes(q);
      if (!matchTitle && !matchFile && !matchCompany && !matchContent) return false;
    }

    return true;
  });

  const selectedDocs = documents.filter((d) => d.isSelected);
  const driveDocs = documents.filter((d) => d.source === 'drive');
  const uploadedDocs = documents.filter((d) => d.source === 'upload');
  const submittedDocs = documents.filter((d) => d.source === 'submission');

  const handleSelectAllFiltered = () => {
    const filteredIds = new Set(filteredDocs.map((d) => d.id));
    documents.forEach((doc) => {
      if (filteredIds.has(doc.id) && !doc.isSelected) {
        onToggleSelect(doc.id);
      }
    });
  };

  const handleDeselectAllFiltered = () => {
    const filteredIds = new Set(filteredDocs.map((d) => d.id));
    documents.forEach((doc) => {
      if (filteredIds.has(doc.id) && doc.isSelected) {
        onToggleSelect(doc.id);
      }
    });
  };

  const handleResetFilters = () => {
    setFilter({
      searchQuery: '',
      source: 'all',
      architecture: 'all',
      budgetRange: 'all',
      hasBarrierGate: 'all',
      lanes: 'all',
    });
  };

  const handleFileChange = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploadError(null);
    setIsUploading(true);
    try {
      for (let i = 0; i < files.length; i++) {
        await onUploadFile(files[i]);
      }
    } catch (err: any) {
      setUploadError(err?.message || 'เกิดข้อผิดพลาดในการอ่านไฟล์');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileChange(e.dataTransfer.files);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden mb-6">
      {/* Top Banner / Preset selection */}
      <div className="border-b border-slate-200 px-4 sm:px-6 pt-4 pb-0 bg-slate-50/70">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2 flex-wrap">
            <FolderArchive className="w-5 h-5 text-blue-600" />
            <h2 className="text-base font-bold text-slate-800 font-['Prompt',sans-serif]">
              เอกสาร TOR และข้อเสนอโครงการทั้งหมด ({documents.length} ฉบับ)
            </h2>
            <span className="text-xs bg-blue-100 text-blue-800 font-semibold px-2.5 py-0.5 rounded-full border border-blue-200">
              เลือกนำไปวิเคราะห์ {selectedDocs.length} จาก {documents.length} ฉบับ
            </span>
          </div>

          {/* Action Buttons: Presets + Submit proposal */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* New Proposal Submission Button */}
            <button
              type="button"
              onClick={onOpenProposalModal}
              className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-all active:scale-98"
              title="เปิดแบบฟอร์มกรอกข้อเสนอโครงการใหม่ผ่านหน้าจอ"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>รับข้อเสนอโครงการผ่านหน้าจอ</span>
            </button>

            {/* Presets */}
            <div className="flex items-center gap-1 bg-white p-0.5 rounded-lg border border-slate-200 text-xs">
              <span className="text-[11px] text-slate-500 font-medium px-1.5 hidden md:inline">ชุดวิเคราะห์:</span>
              <button
                type="button"
                onClick={() => onSelectPreset('preset_3_proposals')}
                className="px-2 py-0.5 font-medium rounded hover:bg-slate-100 text-slate-700 transition-colors"
                title="เลือกเปรียบเทียบ 3 ข้อเสนอหลัก (TOR 01-03)"
              >
                3 ข้อเสนอหลัก
              </button>
              <button
                type="button"
                onClick={() => onSelectPreset('preset_3_specs')}
                className="px-2 py-0.5 font-medium rounded hover:bg-slate-100 text-slate-700 transition-colors"
                title="เลือกเปรียบเทียบ 3 ร่างขอบเขตสเปก"
              >
                3 ร่างสเปก
              </button>
              <button
                type="button"
                onClick={() => onSelectPreset('select_all')}
                className="px-2 py-0.5 font-medium rounded hover:bg-slate-100 text-slate-600 transition-colors"
              >
                ทั้งหมด
              </button>
            </div>
          </div>
        </div>

        {/* Tab switchers */}
        <div className="flex gap-2 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('all')}
            className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition-all flex items-center gap-1.5 shrink-0 ${
              activeTab === 'all'
                ? 'border-blue-600 text-blue-700'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>เอกสารทั้งหมด ({documents.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('drive')}
            className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition-all flex items-center gap-1.5 shrink-0 ${
              activeTab === 'drive'
                ? 'border-blue-600 text-blue-700'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            <span>จาก Google Drive ({driveDocs.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('submission')}
            className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition-all flex items-center gap-1.5 shrink-0 ${
              activeTab === 'submission'
                ? 'border-blue-600 text-blue-700'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <Building2 className="w-3.5 h-3.5 text-indigo-600" />
            <span>ข้อเสนอที่ยื่นผ่านหน้าจอ ({submittedDocs.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('upload')}
            className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition-all flex items-center gap-1.5 shrink-0 ${
              activeTab === 'upload'
                ? 'border-blue-600 text-blue-700'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <UploadCloud className="w-3.5 h-3.5 text-blue-600" />
            <span>อัปโหลดเอกสารเพิ่ม ({uploadedDocs.length})</span>
          </button>
        </div>
      </div>

      {/* Tab Body */}
      <div className="p-4 sm:p-6">
        {/* Dedicated TOR Filter Bar Component */}
        <TorFilterBar
          filter={filter}
          setFilter={setFilter}
          totalCount={documents.length}
          filteredCount={filteredDocs.length}
          selectedCount={selectedDocs.length}
          onSelectAllFiltered={handleSelectAllFiltered}
          onDeselectAllFiltered={handleDeselectAllFiltered}
          onResetFilters={handleResetFilters}
        />

        {/* Upload Zone inside 'upload' tab */}
        {activeTab === 'upload' && (
          <div className="mb-5">
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragOver(true);
              }}
              onDragLeave={() => setIsDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
                isDragOver
                  ? 'border-blue-500 bg-blue-50/50'
                  : 'border-slate-300 hover:border-blue-400 bg-slate-50/50'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept=".pdf,.docx,.doc,.txt"
                className="hidden"
                onChange={(e) => handleFileChange(e.target.files)}
              />
              <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                <UploadCloud className="w-6 h-6" />
              </div>
              <p className="text-sm font-semibold text-slate-800 mb-1">
                คลิกเพื่อเลือกไฟล์ หรือลากไฟล์ TOR มาวางที่นี่
              </p>
              <p className="text-xs text-slate-500 mb-2">
                รองรับไฟล์ PDF (.pdf), Microsoft Word (.docx, .doc), Text (.txt)
              </p>
              <span className="inline-flex items-center text-[11px] text-blue-600 font-medium bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200">
                ระบบจะอ่านข้อความและนำเข้าสู่ชุดข้อมูลเปรียบเทียบทันที
              </span>
            </div>

            {uploadError && (
              <div className="mt-3 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                <span>{uploadError}</span>
              </div>
            )}
          </div>
        )}

        {/* Document Cards Grid */}
        {filteredDocs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {filteredDocs.map((doc) => {
              const isSelected = !!doc.isSelected;

              // Determine architectural badge
              let archBadge = 'พื้นฐาน';
              let archColor = 'bg-slate-100 text-slate-700';
              if (doc.architecture === 'edge_ai') {
                archBadge = 'Edge AI Camera';
                archColor = 'bg-emerald-100 text-emerald-800 border-emerald-200';
              } else if (doc.architecture === 'server_centric') {
                archBadge = 'Server-Centric';
                archColor = 'bg-indigo-100 text-indigo-800 border-indigo-200';
              } else if (doc.architecture === 'hybrid') {
                archBadge = 'บูรณาการ (Hybrid)';
                archColor = 'bg-purple-100 text-purple-800 border-purple-200';
              }

              return (
                <div
                  key={doc.id}
                  onClick={() => onToggleSelect(doc.id)}
                  className={`relative p-3.5 rounded-xl border transition-all cursor-pointer select-none flex flex-col justify-between ${
                    isSelected
                      ? 'border-blue-500 bg-blue-50/40 shadow-xs ring-1 ring-blue-400/40'
                      : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/60'
                  }`}
                >
                  <div>
                    {/* Top Row: Checkbox, Source Label, Actions */}
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        {isSelected ? (
                          <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                        ) : (
                          <Circle className="w-4 h-4 text-slate-300 shrink-0" />
                        )}
                        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                          {doc.source === 'drive'
                            ? 'Google Drive'
                            : doc.source === 'submission'
                            ? 'ยื่นผ่านหน้าจอ'
                            : 'ไฟล์อัปโหลด'}
                        </span>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onViewRawDocument(doc);
                          }}
                          className="text-slate-400 hover:text-blue-600 p-1 rounded-md hover:bg-white transition-colors"
                          title="ดูเนื้อหาเอกสารต้นฉบับ"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        {(doc.source === 'upload' || doc.source === 'submission') && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onRemoveUploadedDoc(doc.id);
                            }}
                            className="text-slate-400 hover:text-red-600 p-1 rounded-md hover:bg-white transition-colors"
                            title="ลบรายการนี้"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Title */}
                    <h3 className="text-sm font-semibold text-slate-800 line-clamp-2 mb-1.5 font-['Prompt',sans-serif]">
                      {doc.title}
                    </h3>

                    {/* Company Name if available */}
                    {doc.companyName && (
                      <p className="text-xs text-slate-600 mb-2 flex items-center gap-1">
                        <Building2 className="w-3 h-3 text-slate-400 shrink-0" />
                        <span className="truncate">{doc.companyName}</span>
                      </p>
                    )}

                    {/* Meta tags: Architecture, Price, Barrier */}
                    <div className="flex items-center gap-1.5 flex-wrap mb-2">
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${archColor}`}>
                        {archBadge}
                      </span>
                      {doc.budgetNumber && (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                          {(doc.budgetNumber).toLocaleString()} บ.
                        </span>
                      )}
                      {doc.hasBarrierGate && (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                          มีไม้กั้น
                        </span>
                      )}
                      {doc.lanesCount && doc.lanesCount > 1 && (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-800 border border-blue-200">
                          {doc.lanesCount} ช่องทาง
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Quick badges & Selection Status */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-600">
                    <span className="inline-flex items-center gap-1 text-slate-500">
                      <FileText className="w-3 h-3" />
                      {(doc.content?.length || 0).toLocaleString()} ตัวอักษร
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                        isSelected ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {isSelected ? 'เลือกในการวิเคราะห์' : 'คลิกเพื่อเลือก'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-10 bg-slate-50 rounded-xl border border-dashed border-slate-300">
            <Filter className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-700 mb-1">ไม่พบเอกสาร TOR ที่ตรงตามเงื่อนไขตัวกรอง</p>
            <p className="text-xs text-slate-500 mb-3">ลองปรับคำค้นหา หรือรีเซ็ตตัวกรองเพื่อดูเอกสารทั้งหมด</p>
            <button
              type="button"
              onClick={handleResetFilters}
              className="px-3 py-1 text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
            >
              ล้างตัวกรองทั้งหมด
            </button>
          </div>
        )}

        {/* Custom Procurement Focus Prompt */}
        <div className="mt-5 pt-4 border-t border-slate-200">
          <div className="flex items-center justify-between gap-2 mb-1.5">
            <label htmlFor="procurement-custom-prompt" className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>ประเด็นหรือข้อสังเกตเพิ่มเติมที่เจ้าหน้าที่พัสดุต้องการสั่งการวิเคราะห์ (Optional Prompt):</span>
            </label>
            <span className="text-[11px] text-slate-400">
              วิเคราะห์ตามเอกสารที่เลือกเท่านั้น (Strict Grounding)
            </span>
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <input
              id="procurement-custom-prompt"
              type="text"
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              placeholder="ตัวอย่าง: ตรวจสอบความเสี่ยงล็อกสเปก, เงื่อนไขค่าปรับและส่งมอบงาน, SLA การซ่อมบำรุง 24 ชม."
              className="flex-1 px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  onTriggerAnalysis();
                }
              }}
            />
            <button
              type="button"
              onClick={onTriggerAnalysis}
              disabled={isAnalyzing || selectedDocs.length === 0}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors shrink-0 flex items-center justify-center gap-1.5"
            >
              <span>ประมวลผลการวิเคราะห์ ({selectedDocs.length} ฉบับ)</span>
            </button>
          </div>

          {/* Quick prompt chips */}
          <div className="flex items-center gap-1.5 mt-2 flex-wrap text-[11px] text-slate-500">
            <span className="font-medium">ประเด็นยอดนิยม:</span>
            {[
              'ตรวจสอบความเสี่ยงล็อกสเปกฮาร์ดแวร์และยี่ห้อกล้อง',
              'วิเคราะห์ความคุ้มค่าราคาต่อช่องจราจร',
              'เปรียบเทียบเงื่อนไขการส่งมอบและเกณฑ์ความแม่นยำ',
              'เปรียบเทียบสถาปัตยกรรม Edge AI กับ Server-based'
            ].map((chip, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setCustomPrompt(chip)}
                className="px-2 py-0.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
              >
                {chip}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
