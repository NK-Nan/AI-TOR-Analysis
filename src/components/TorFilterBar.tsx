import React from 'react';
import {
  Search,
  Filter,
  X,
  RotateCcw,
  CheckSquare,
  Square,
  Layers,
  HardDrive,
  UploadCloud,
  FileEdit,
  DollarSign,
  Cpu,
  ShieldCheck
} from 'lucide-react';
import { FilterOptions, TORDocument } from '../types';

interface TorFilterBarProps {
  filter: FilterOptions;
  setFilter: React.Dispatch<React.SetStateAction<FilterOptions>>;
  totalCount: number;
  filteredCount: number;
  selectedCount: number;
  onSelectAllFiltered: () => void;
  onDeselectAllFiltered: () => void;
  onResetFilters: () => void;
}

export const TorFilterBar: React.FC<TorFilterBarProps> = ({
  filter,
  setFilter,
  totalCount,
  filteredCount,
  selectedCount,
  onSelectAllFiltered,
  onDeselectAllFiltered,
  onResetFilters,
}) => {
  const isAnyFilterActive =
    filter.searchQuery.trim() !== '' ||
    filter.source !== 'all' ||
    filter.architecture !== 'all' ||
    filter.budgetRange !== 'all' ||
    filter.hasBarrierGate !== 'all' ||
    filter.lanes !== 'all';

  return (
    <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs p-3.5 mb-4">
      {/* Top Search & Filter Summary */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        {/* Search input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            id="tor-search-input"
            type="text"
            value={filter.searchQuery}
            onChange={(e) => setFilter((prev) => ({ ...prev, searchQuery: e.target.value }))}
            placeholder="ค้นหาชื่อ TOR, บริษัทผู้ยื่น, สเปกฮาร์ดแวร์, หรือคำสำคัญ..."
            className="w-full pl-9 pr-8 py-1.5 text-xs rounded-lg border border-slate-200 bg-slate-50/50 hover:bg-white focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
          />
          {filter.searchQuery && (
            <button
              type="button"
              onClick={() => setFilter((prev) => ({ ...prev, searchQuery: '' }))}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Quick Batch Actions & Counter */}
        <div className="flex items-center gap-2 flex-wrap text-xs">
          <span className="text-[11px] font-medium text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
            แสดง <strong className="text-slate-800 font-bold">{filteredCount}</strong> จาก {totalCount} ฉบับ
            <span className="text-blue-600 font-semibold ml-1.5">
              (เลือกอยู่ {selectedCount} ฉบับ)
            </span>
          </span>

          <button
            type="button"
            onClick={onSelectAllFiltered}
            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors"
            title="เลือกทุกฉบับที่ผ่านตัวกรองเพื่อนำไปวิเคราะห์"
          >
            <CheckSquare className="w-3.5 h-3.5" />
            <span>เลือกผลการกรอง</span>
          </button>

          <button
            type="button"
            onClick={onDeselectAllFiltered}
            className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-slate-600 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors"
            title="ยกเลิกการเลือกฉบับที่ผ่านการกรอง"
          >
            <Square className="w-3.5 h-3.5" />
            <span>ยกเลิก</span>
          </button>

          {isAnyFilterActive && (
            <button
              type="button"
              onClick={onResetFilters}
              className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-md transition-colors"
              title="ล้างตัวกรองทั้งหมด"
            >
              <RotateCcw className="w-3 h-3" />
              <span>ล้างตัวกรอง</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter Dropdown / Selectors */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 pt-2.5 text-xs">
        {/* 1. แหล่งที่มา */}
        <div>
          <label htmlFor="filter-source" className="block text-[11px] font-semibold text-slate-500 mb-1">
            แหล่งที่มาเอกสาร
          </label>
          <select
            id="filter-source"
            value={filter.source}
            onChange={(e) => setFilter((prev) => ({ ...prev, source: e.target.value as any }))}
            className="w-full py-1 px-2 rounded-md border border-slate-200 bg-white text-slate-700 text-xs focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">ทุกแหล่งข้อมูล ({totalCount})</option>
            <option value="drive">Google Drive ของหน่วยงาน</option>
            <option value="upload">ไฟล์ที่อัปโหลดเพิ่ม</option>
            <option value="submission">ยื่นข้อเสนอผ่านหน้าจอ</option>
          </select>
        </div>

        {/* 2. สถาปัตยกรรมระบบ */}
        <div>
          <label htmlFor="filter-architecture" className="block text-[11px] font-semibold text-slate-500 mb-1">
            สถาปัตยกรรม / เทคโนโลยี
          </label>
          <select
            id="filter-architecture"
            value={filter.architecture}
            onChange={(e) => setFilter((prev) => ({ ...prev, architecture: e.target.value as any }))}
            className="w-full py-1 px-2 rounded-md border border-slate-200 bg-white text-slate-700 text-xs focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">ทุกสถาปัตยกรรม</option>
            <option value="edge_ai">Edge AI Camera (ประมวลผลบนกล้อง)</option>
            <option value="server_centric">Server-Centric (ศูนย์กลาง)</option>
            <option value="hybrid">ระบบบูรณาการ (Hybrid)</option>
            <option value="basic">ระบบตรวจจับพื้นฐาน</option>
          </select>
        </div>

        {/* 3. ช่วงงบประมาณ */}
        <div>
          <label htmlFor="filter-budget" className="block text-[11px] font-semibold text-slate-500 mb-1">
            ช่วงงบประมาณ / ราคา
          </label>
          <select
            id="filter-budget"
            value={filter.budgetRange}
            onChange={(e) => setFilter((prev) => ({ ...prev, budgetRange: e.target.value as any }))}
            className="w-full py-1 px-2 rounded-md border border-slate-200 bg-white text-slate-700 text-xs focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">ทุกช่วงราคา</option>
            <option value="under_350k">น้อยกว่า 350,000 บาท</option>
            <option value="350k_600k">350,000 - 600,000 บาท</option>
            <option value="over_600k">มากกว่า 600,000 บาท</option>
          </select>
        </div>

        {/* 4. ไม้กั้นอัตโนมัติ */}
        <div>
          <label htmlFor="filter-barrier" className="block text-[11px] font-semibold text-slate-500 mb-1">
            ไม้กั้นอัตโนมัติ (Barrier Gate)
          </label>
          <select
            id="filter-barrier"
            value={filter.hasBarrierGate}
            onChange={(e) => setFilter((prev) => ({ ...prev, hasBarrierGate: e.target.value as any }))}
            className="w-full py-1 px-2 rounded-md border border-slate-200 bg-white text-slate-700 text-xs focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">มีหรือไม่ก็ได้</option>
            <option value="yes">มีไม้กั้น Barrier Gate</option>
            <option value="no">ไม่มีไม้กั้น</option>
          </select>
        </div>

        {/* 5. จำนวนช่องจราจร */}
        <div>
          <label htmlFor="filter-lanes" className="block text-[11px] font-semibold text-slate-500 mb-1">
            จำนวนช่องทาง (Lanes)
          </label>
          <select
            id="filter-lanes"
            value={filter.lanes}
            onChange={(e) => setFilter((prev) => ({ ...prev, lanes: e.target.value as any }))}
            className="w-full py-1 px-2 rounded-md border border-slate-200 bg-white text-slate-700 text-xs focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">ทุกจำนวนช่องทาง</option>
            <option value="1">1 จุดตรวจ / 1 เลน</option>
            <option value="2">2 ช่องทาง เข้า-ออก</option>
            <option value="multi">หลายจุดตรวจ (Multi-Gate)</option>
          </select>
        </div>
      </div>
    </div>
  );
};
