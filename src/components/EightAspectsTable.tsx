import React, { useState } from 'react';
import {
  FileText,
  Building2,
  Clock,
  Maximize2,
  Cpu,
  PackageCheck,
  DollarSign,
  Award,
  Sparkles,
  LayoutGrid,
  Table as TableIcon,
  Search,
  CheckCircle2,
  AlertTriangle,
  UserCheck
} from 'lucide-react';
import { TORDetail } from '../types';

interface EightAspectsTableProps {
  torDetails: TORDetail[];
}

export const EightAspectsTable: React.FC<EightAspectsTableProps> = ({ torDetails }) => {
  const [viewMode, setViewMode] = useState<'matrix' | 'cards'>('matrix');
  const [searchTerm, setSearchTerm] = useState('');

  const aspectsList = [
    {
      id: 'name',
      title: '๑. ชื่อ TOR',
      icon: <FileText className="w-4 h-4 text-blue-600" />,
      getValue: (t: TORDetail) => t.torName,
      badge: 'ชื่อโครงการ',
    },
    {
      id: 'company',
      title: '๒. บริษัทหรือผู้ยื่น TOR',
      icon: <Building2 className="w-4 h-4 text-indigo-600" />,
      getValue: (t: TORDetail) => t.companyOrBidder,
      badge: 'ผู้จัดทำ/ผู้ยื่น',
    },
    {
      id: 'duration',
      title: '๓. ระยะเวลา',
      icon: <Clock className="w-4 h-4 text-sky-600" />,
      getValue: (t: TORDetail) => t.duration,
      badge: 'กรอบเวลาสัญญา',
    },
    {
      id: 'scope',
      title: '๔. ขอบเขตการพัฒนาระบบ',
      icon: <Maximize2 className="w-4 h-4 text-emerald-600" />,
      getValue: (t: TORDetail) => t.scope,
      badge: 'ความครอบคลุม',
    },
    {
      id: 'tech',
      title: '๕. ซอฟต์แวร์ ฮาร์ดแวร์ที่นำมาใช้',
      icon: <Cpu className="w-4 h-4 text-purple-600" />,
      getValue: (t: TORDetail) => t.softwareHardware,
      badge: 'อุปกรณ์และระบบ',
    },
    {
      id: 'deliverables',
      title: '๖. การส่งมอบงาน',
      icon: <PackageCheck className="w-4 h-4 text-teal-600" />,
      getValue: (t: TORDetail) => t.deliverables,
      badge: 'งวดงาน/ตรวจรับ',
    },
    {
      id: 'price',
      title: '๗. ราคา',
      icon: <DollarSign className="w-4 h-4 text-amber-600" />,
      getValue: (t: TORDetail) => t.price,
      badge: 'งบประมาณ',
    },
    {
      id: 'expertise',
      title: '๘. ความเชี่ยวชาญของบริษัทหรือผู้พัฒนา (พร้อมชื่อผู้เชี่ยวชาญ)',
      icon: <Award className="w-4 h-4 text-rose-600" />,
      getValue: (t: TORDetail) => {
        const expertPart = t.expertNames ? `[ผู้เชี่ยวชาญ: ${t.expertNames}]\n` : '';
        return `${expertPart}${t.expertise}`;
      },
      badge: 'ชื่อผู้เชี่ยวชาญ/ผลงาน',
    },
  ];

  const filteredAspects = aspectsList.filter(
    (asp) =>
      asp.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      torDetails.some((td) => {
        const textVal = asp.getValue(td).toLowerCase();
        const expertVal = (td.expertNames || '').toLowerCase();
        return textVal.includes(searchTerm.toLowerCase()) || expertVal.includes(searchTerm.toLowerCase());
      })
  );

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-4 sm:p-6 mb-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-4 border-b border-slate-200 gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-blue-600" />
            <h2 className="text-base sm:text-lg font-bold text-slate-900 font-['Prompt',sans-serif]">
              ตารางสกัดข้อมูล 8 ประเด็นสำคัญตามข้อกำหนดของผู้ว่าจ้าง
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            สกัดข้อมูลวิเคราะห์เปรียบเทียบครบถ้วนทั้ง 8 หัวข้อตามคำสั่งการของเจ้าหน้าที่พัสดุ
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Search bar */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="ค้นหาใน 8 ประเด็น..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="text-xs pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 focus:outline-hidden focus:ring-1 focus:ring-blue-500 w-40 sm:w-48 bg-slate-50"
            />
          </div>

          {/* View toggle */}
          <div className="inline-flex rounded-lg border border-slate-200 bg-slate-100 p-0.5 text-xs font-medium text-slate-600">
            <button
              type="button"
              onClick={() => setViewMode('matrix')}
              className={`px-2.5 py-1 rounded-md transition-all flex items-center gap-1 ${
                viewMode === 'matrix' ? 'bg-white text-slate-900 shadow-2xs font-semibold' : 'hover:text-slate-900'
              }`}
            >
              <TableIcon className="w-3.5 h-3.5" />
              <span>ตารางเปรียบเทียบ</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('cards')}
              className={`px-2.5 py-1 rounded-md transition-all flex items-center gap-1 ${
                viewMode === 'cards' ? 'bg-white text-slate-900 shadow-2xs font-semibold' : 'hover:text-slate-900'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>การ์ดรายฉบับ</span>
            </button>
          </div>
        </div>
      </div>

      {viewMode === 'matrix' ? (
        /* Side-by-side comparison table */
        <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-2xs">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="bg-slate-100/90 text-slate-700 border-b border-slate-200">
                <th className="py-3 px-4 font-bold uppercase tracking-wider text-[11px] w-52 sm:w-60 shrink-0 sticky left-0 bg-slate-100 z-10">
                  ประเด็นพิจารณา (๘ หัวข้อ)
                </th>
                {torDetails.map((tor) => (
                  <th
                    key={tor.torId}
                    className="py-3 px-4 font-bold text-slate-800 text-xs min-w-[280px] max-w-[380px] border-l border-slate-200"
                  >
                    <div className="flex items-center gap-1.5 text-blue-700 font-semibold mb-0.5">
                      <FileText className="w-3.5 h-3.5" />
                      <span>{tor.torId.toUpperCase()}</span>
                    </div>
                    <div className="font-['Prompt',sans-serif] text-slate-900 line-clamp-2">
                      {tor.torName}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredAspects.map((asp, idx) => (
                <tr
                  key={asp.id}
                  className={`hover:bg-blue-50/20 transition-colors ${
                    idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'
                  }`}
                >
                  <td className="py-3.5 px-4 font-semibold text-slate-800 sticky left-0 bg-inherit z-10 border-r border-slate-200">
                    <div className="flex items-center gap-2 mb-1">
                      {asp.icon}
                      <span className="font-['Prompt',sans-serif] text-[13px]">{asp.title}</span>
                    </div>
                    <span className="inline-block text-[10px] text-slate-500 bg-slate-200/60 px-1.5 py-0.5 rounded font-medium">
                      {asp.badge}
                    </span>
                  </td>
                  {torDetails.map((tor) => {
                    const val = asp.getValue(tor);
                    const isNotSpecified =
                      val.includes('ไม่ได้ระบุ') ||
                      val.includes('ไม่ปรากฏ') ||
                      val.includes('ไม่ระบุ');
                    return (
                      <td
                        key={tor.torId}
                        className="py-3.5 px-4 text-slate-700 leading-relaxed border-l border-slate-200 align-top"
                      >
                        {asp.id === 'expertise' ? (
                          <div className="space-y-2.5">
                            {/* Highlighted Expert Name Card */}
                            <div className="p-2.5 rounded-lg bg-blue-50/90 border border-blue-200/90 text-blue-950 shadow-2xs">
                              <div className="flex items-center gap-1.5 text-[11px] font-bold text-blue-800 mb-0.5">
                                <UserCheck className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                                <span>ชื่อผู้เชี่ยวชาญ / บุคลากรหลัก:</span>
                              </div>
                              <p className="text-xs font-semibold text-slate-900 pl-5 leading-relaxed">
                                {tor.expertNames || (
                                  <span className="text-amber-800 italic font-normal text-[11px] bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                                    ไม่ปรากฏชื่อผู้เชี่ยวชาญในเอกสาร
                                  </span>
                                )}
                              </p>
                            </div>

                            {/* Company Qualifications and Track Record */}
                            <div>
                              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">
                                คุณสมบัตินิติบุคคลและผลงาน:
                              </div>
                              <p className="whitespace-pre-line text-slate-700 leading-relaxed text-xs">
                                {tor.expertise}
                              </p>
                            </div>
                          </div>
                        ) : isNotSpecified ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] bg-amber-50 text-amber-800 border border-amber-200">
                            <AlertTriangle className="w-3 h-3 text-amber-600" />
                            <span>{val}</span>
                          </span>
                        ) : (
                          <p className="whitespace-pre-line">{val}</p>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        /* Cards view per TOR */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {torDetails.map((tor) => (
            <div
              key={tor.torId}
              className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden flex flex-col justify-between"
            >
              <div className="p-4 bg-gradient-to-r from-blue-50/80 to-slate-50 border-b border-slate-200">
                <span className="text-[11px] font-bold text-blue-700 uppercase tracking-wider block mb-1">
                  {tor.torId.toUpperCase()}
                </span>
                <h3 className="text-sm font-bold text-slate-900 font-['Prompt',sans-serif] leading-snug">
                  {tor.torName}
                </h3>
              </div>

              <div className="p-4 space-y-3 divide-y divide-slate-100 text-xs flex-1">
                {aspectsList.slice(1).map((asp) => (
                  <div key={asp.id} className="pt-2 first:pt-0">
                    <div className="flex items-center gap-1.5 font-bold text-slate-700 mb-1 text-[11px]">
                      {asp.icon}
                      <span>{asp.title}</span>
                    </div>
                    {asp.id === 'expertise' ? (
                      <div className="pl-5 space-y-1.5 mt-1">
                        <div className="p-2 rounded-lg bg-blue-50/90 border border-blue-200/90 text-blue-950 text-xs">
                          <div className="flex items-center gap-1 font-bold text-blue-800 text-[11px] mb-0.5">
                            <UserCheck className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                            <span>ชื่อผู้เชี่ยวชาญ / บุคลากรหลัก:</span>
                          </div>
                          <p className="font-semibold text-slate-800 text-[11px] leading-relaxed">
                            {tor.expertNames || 'ไม่ปรากฏชื่อผู้เชี่ยวชาญในเอกสาร'}
                          </p>
                        </div>
                        <p className="text-slate-600 leading-relaxed text-xs">
                          <span className="font-semibold text-slate-700">ผลงานและมาตรฐาน: </span>
                          {tor.expertise}
                        </p>
                      </div>
                    ) : (
                      <p className="text-slate-600 leading-relaxed pl-5">
                        {asp.getValue(tor)}
                      </p>
                    )}
                  </div>
                ))}
              </div>

              {/* Highlights at card footer */}
              {tor.highlightPoints && tor.highlightPoints.length > 0 && (
                <div className="p-3 bg-slate-50 border-t border-slate-200 text-[11px]">
                  <span className="font-bold text-slate-700 block mb-1 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    <span>จุดเน้นสำคัญ:</span>
                  </span>
                  <ul className="space-y-0.5 text-slate-600 pl-4 list-disc">
                    {tor.highlightPoints.map((pt, i) => (
                      <li key={i}>{pt}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
