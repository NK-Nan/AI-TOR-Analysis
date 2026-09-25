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
  UserCheck,
  ShieldAlert,
  AlertOctagon,
  Info,
  X,
  Scale,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { TORDetail, LegalViolationItem } from '../types';
import { evaluateLegalCompliance } from '../utils/legalComplianceChecker';

interface EightAspectsTableProps {
  torDetails: TORDetail[];
}

export const EightAspectsTable: React.FC<EightAspectsTableProps> = ({ torDetails }) => {
  const [viewMode, setViewMode] = useState<'matrix' | 'cards'>('matrix');
  const [searchTerm, setSearchTerm] = useState('');
  const [showOnlyLegalIssues, setShowOnlyLegalIssues] = useState(false);
  const [selectedLegalTor, setSelectedLegalTor] = useState<TORDetail | null>(null);
  const [selectedViolationItem, setSelectedViolationItem] = useState<LegalViolationItem | null>(null);

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

  // Pre-calculate legal evaluations for all TORs
  const legalEvaluations = React.useMemo(() => {
    const map = new Map<string, ReturnType<typeof evaluateLegalCompliance>>();
    torDetails.forEach((tor) => {
      map.set(tor.torId, evaluateLegalCompliance(tor));
    });
    return map;
  }, [torDetails]);

  // Overall count of TORs with legal violations
  const totalTorsWithViolations = React.useMemo(() => {
    let count = 0;
    legalEvaluations.forEach((evalData) => {
      if (evalData.hasViolation) count++;
    });
    return count;
  }, [legalEvaluations]);

  const filteredAspects = aspectsList.filter((asp) => {
    const matchesSearch =
      asp.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      torDetails.some((td) => {
        const textVal = asp.getValue(td).toLowerCase();
        const expertVal = (td.expertNames || '').toLowerCase();
        return textVal.includes(searchTerm.toLowerCase()) || expertVal.includes(searchTerm.toLowerCase());
      });

    if (!matchesSearch) return false;

    if (showOnlyLegalIssues) {
      // Check if any TOR has a legal violation or warning in this aspect
      return torDetails.some((td) => {
        const evalData = legalEvaluations.get(td.torId);
        return evalData?.violations.some(
          (v) => v.aspectId === asp.id || (asp.id === 'tech' && v.aspectId === 'softwareHardware')
        );
      });
    }

    return true;
  });

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-4 sm:p-6 mb-6">
      {/* Header bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between pb-4 mb-4 border-b border-slate-200 gap-3">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <Sparkles className="w-5 h-5 text-blue-600" />
            <h2 className="text-base sm:text-lg font-bold text-slate-900 font-['Prompt',sans-serif]">
              ตารางสกัดข้อมูล 8 ประเด็นสำคัญตามข้อกำหนดของผู้ว่าจ้าง
            </h2>
            {totalTorsWithViolations > 0 && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700 border border-red-200 shadow-2xs">
                <ShieldAlert className="w-3.5 h-3.5 text-red-600 animate-pulse" />
                <span>พบ {totalTorsWithViolations} ฉบับที่อาจขัดต่อ พ.ร.บ. จัดซื้อจัดจ้างฯ</span>
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            สกัดข้อมูลวิเคราะห์เปรียบเทียบครบถ้วนทั้ง 8 หัวข้อ พร้อมระบบตรวจสอบเนื้อหาเทียบกับ พ.ร.บ. การจัดซื้อจัดจ้างภาครัฐ พ.ศ. ๒๕๖๐
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Legal issues quick toggle filter */}
          <button
            type="button"
            onClick={() => setShowOnlyLegalIssues(!showOnlyLegalIssues)}
            className={`text-xs px-3 py-1.5 rounded-lg border font-semibold inline-flex items-center gap-1.5 transition-all ${
              showOnlyLegalIssues
                ? 'bg-red-600 text-white border-red-700 shadow-xs'
                : 'bg-red-50 text-red-700 hover:bg-red-100 border-red-200'
            }`}
          >
            <AlertOctagon className="w-3.5 h-3.5" />
            <span>{showOnlyLegalIssues ? 'แสดงทั้งหมด' : 'กรองเฉพาะประเด็นเสี่ยงขัด พ.ร.บ.'}</span>
          </button>

          {/* Search bar */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="ค้นหาใน 8 ประเด็น..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="text-xs pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 focus:outline-hidden focus:ring-1 focus:ring-blue-500 w-36 sm:w-44 bg-slate-50"
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
                <th className="py-3.5 px-4 font-bold uppercase tracking-wider text-[11px] w-52 sm:w-60 shrink-0 sticky left-0 bg-slate-100 z-10">
                  ประเด็นพิจารณา (๘ หัวข้อ)
                </th>
                {torDetails.map((tor) => {
                  const legal = legalEvaluations.get(tor.torId);
                  return (
                    <th
                      key={tor.torId}
                      className={`py-3 px-4 font-bold text-slate-800 text-xs min-w-[280px] max-w-[380px] border-l border-slate-200 align-top transition-colors ${
                        legal?.hasViolation ? 'bg-red-50/40' : ''
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <div className="flex items-center gap-1.5 text-blue-700 font-semibold">
                          <FileText className="w-3.5 h-3.5" />
                          <span>{tor.torId.toUpperCase()}</span>
                        </div>

                        {/* RED WARNING ICON FOR POTENTIAL PROCUREMENT LAW VIOLATION */}
                        {legal?.hasViolation ? (
                          <button
                            type="button"
                            onClick={() => setSelectedLegalTor(tor)}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-red-600 hover:bg-red-700 text-white font-bold text-[10px] shadow-2xs transition-all cursor-pointer animate-pulse"
                            title="คลิกเพื่อดูรายละเอียดข้อกำหนดที่อาจขัดต่อ พ.ร.บ. จัดซื้อจัดจ้างฯ"
                          >
                            <ShieldAlert className="w-3 h-3 text-white shrink-0" />
                            <span>อาจขัด พ.ร.บ. ({legal.violationCount})</span>
                          </button>
                        ) : legal && legal.warningCount > 0 ? (
                          <button
                            type="button"
                            onClick={() => setSelectedLegalTor(tor)}
                            className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-amber-100 hover:bg-amber-200 text-amber-800 font-bold text-[10px] border border-amber-300 transition-colors"
                            title="มีข้อพึงระวังตามระเบียบพัสดุ"
                          >
                            <AlertTriangle className="w-3 h-3 text-amber-600 shrink-0" />
                            <span>ข้อพึงระวัง ({legal.warningCount})</span>
                          </button>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] text-emerald-700 font-medium">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>สอดคล้องระเบียบ</span>
                          </span>
                        )}
                      </div>

                      <div className="font-['Prompt',sans-serif] text-slate-900 line-clamp-2">
                        {tor.torName}
                      </div>
                    </th>
                  );
                })}
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

                    const legal = legalEvaluations.get(tor.torId);
                    const aspectViolations = (legal?.violations || []).filter(
                      (v) =>
                        v.aspectId === asp.id ||
                        (asp.id === 'tech' && v.aspectId === 'softwareHardware')
                    );
                    const hasAspectViolation = aspectViolations.some((v) => v.severity === 'violation');

                    return (
                      <td
                        key={tor.torId}
                        className={`py-3.5 px-4 text-slate-700 leading-relaxed border-l border-slate-200 align-top transition-colors ${
                          hasAspectViolation ? 'bg-red-50/30' : ''
                        }`}
                      >
                        {/* Aspect Content */}
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

                        {/* RED WARNING ICON & CARD FOR DETECTED LEGAL VIOLATIONS */}
                        {aspectViolations.length > 0 && (
                          <div className="mt-2.5 space-y-1.5">
                            {aspectViolations.map((v, vIdx) => (
                              <div
                                key={vIdx}
                                onClick={() => {
                                  setSelectedLegalTor(tor);
                                  setSelectedViolationItem(v);
                                }}
                                className={`p-2 rounded-lg border text-left cursor-pointer transition-all hover:shadow-2xs ${
                                  v.severity === 'violation'
                                    ? 'bg-red-50/95 hover:bg-red-100/90 border-red-300 text-red-950'
                                    : 'bg-amber-50/95 hover:bg-amber-100/90 border-amber-300 text-amber-950'
                                }`}
                              >
                                <div className="flex items-center justify-between gap-1.5 mb-1">
                                  <div className="flex items-center gap-1.5 font-bold text-[11px]">
                                    {v.severity === 'violation' ? (
                                      <ShieldAlert className="w-3.5 h-3.5 text-red-600 shrink-0 animate-pulse" />
                                    ) : (
                                      <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                                    )}
                                    <span
                                      className={
                                        v.severity === 'violation'
                                          ? 'text-red-700 font-extrabold'
                                          : 'text-amber-800 font-bold'
                                      }
                                    >
                                      {v.severity === 'violation'
                                        ? '⚠️ เสี่ยงขัด พ.ร.บ. จัดซื้อจัดจ้าง'
                                        : 'ข้อควรระวังตามระเบียบ'}
                                    </span>
                                  </div>
                                  <span className="text-[10px] text-blue-600 underline font-semibold flex items-center gap-0.5">
                                    <span>ดูข้อกฎหมาย</span>
                                    <ChevronRight className="w-3 h-3" />
                                  </span>
                                </div>
                                <p className="text-[11px] font-semibold text-slate-800 line-clamp-2">
                                  {v.issueTitle}
                                </p>
                                <div className="text-[10px] text-slate-500 mt-1 font-medium">
                                  {v.lawSection}
                                </div>
                              </div>
                            ))}
                          </div>
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
          {torDetails.map((tor) => {
            const legal = legalEvaluations.get(tor.torId);
            return (
              <div
                key={tor.torId}
                className={`bg-white rounded-xl border shadow-xs overflow-hidden flex flex-col justify-between transition-all ${
                  legal?.hasViolation ? 'border-red-300 ring-1 ring-red-200' : 'border-slate-200'
                }`}
              >
                <div
                  className={`p-4 border-b ${
                    legal?.hasViolation
                      ? 'bg-gradient-to-r from-red-50/80 to-amber-50/40 border-red-200'
                      : 'bg-gradient-to-r from-blue-50/80 to-slate-50 border-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="text-[11px] font-bold text-blue-700 uppercase tracking-wider block">
                      {tor.torId.toUpperCase()}
                    </span>

                    {legal?.hasViolation ? (
                      <button
                        type="button"
                        onClick={() => setSelectedLegalTor(tor)}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-red-600 text-white font-bold text-[10px] shadow-2xs animate-pulse cursor-pointer"
                      >
                        <ShieldAlert className="w-3 h-3 text-white" />
                        <span>เสี่ยงขัด พ.ร.บ. ({legal.violationCount})</span>
                      </button>
                    ) : legal && legal.warningCount > 0 ? (
                      <button
                        type="button"
                        onClick={() => setSelectedLegalTor(tor)}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-100 text-amber-800 font-bold text-[10px] border border-amber-300"
                      >
                        <AlertTriangle className="w-3 h-3 text-amber-600" />
                        <span>ข้อพึงระวัง ({legal.warningCount})</span>
                      </button>
                    ) : null}
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 font-['Prompt',sans-serif] leading-snug">
                    {tor.torName}
                  </h3>
                </div>

                <div className="p-4 space-y-3 divide-y divide-slate-100 text-xs flex-1">
                  {aspectsList.slice(1).map((asp) => {
                    const aspectViolations = (legal?.violations || []).filter(
                      (v) =>
                        v.aspectId === asp.id ||
                        (asp.id === 'tech' && v.aspectId === 'softwareHardware')
                    );
                    const hasViolation = aspectViolations.some((v) => v.severity === 'violation');

                    return (
                      <div key={asp.id} className="pt-2 first:pt-0">
                        <div className="flex items-center justify-between gap-1 font-bold text-slate-700 mb-1 text-[11px]">
                          <div className="flex items-center gap-1.5">
                            {asp.icon}
                            <span>{asp.title}</span>
                          </div>
                          {hasViolation && (
                            <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-red-600 bg-red-50 px-1.5 py-0.5 rounded border border-red-200">
                              <ShieldAlert className="w-3 h-3 text-red-600" />
                              <span>เสี่ยงขัด พ.ร.บ.</span>
                            </span>
                          )}
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

                        {aspectViolations.length > 0 && (
                          <div className="pl-5 mt-1.5 space-y-1">
                            {aspectViolations.map((v, i) => (
                              <div
                                key={i}
                                onClick={() => {
                                  setSelectedLegalTor(tor);
                                  setSelectedViolationItem(v);
                                }}
                                className={`p-1.5 rounded text-[10px] border cursor-pointer ${
                                  v.severity === 'violation'
                                    ? 'bg-red-50 text-red-800 border-red-200'
                                    : 'bg-amber-50 text-amber-800 border-amber-200'
                                }`}
                              >
                                <span className="font-bold">{v.issueTitle}: </span>
                                <span>{v.lawSection}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
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
            );
          })}
        </div>
      )}

      {/* ========================================================================= */}
      {/* DETAILED LEGAL COMPLIANCE AUDIT MODAL */}
      {/* ========================================================================= */}
      {selectedLegalTor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden font-['Sarabun',sans-serif]">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-200 bg-gradient-to-r from-red-600 via-rose-600 to-red-700 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0 border border-white/30">
                  <ShieldAlert className="w-6 h-6 text-white animate-bounce" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold font-['Prompt',sans-serif] leading-snug">
                    รายงานผลตรวจสอบข้อกำหนดเทียบกับ พ.ร.บ. จัดซื้อจัดจ้างฯ
                  </h3>
                  <p className="text-xs text-red-100">
                    {selectedLegalTor.torName} ({selectedLegalTor.torId.toUpperCase()})
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setSelectedLegalTor(null);
                  setSelectedViolationItem(null);
                }}
                className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 overflow-y-auto space-y-4 text-xs">
              {/* Overview Notice */}
              <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-950 flex items-start gap-2.5 shadow-2xs">
                <Scale className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                <div className="leading-relaxed">
                  <p className="font-bold text-red-900 text-[13px] mb-0.5">
                    ข้อพิจารณาทางกฎหมายและระเบียบสำหรับเจ้าหน้าที่พัสดุ
                  </p>
                  <p className="text-slate-700">
                    ระบบ AI ได้ทำการเทียบเคียงข้อกำหนดในร่าง TOR ฉบับนี้กับ <strong>พระราชบัญญัติการจัดซื้อจัดจ้างและการบริหารพัสดุภาครัฐ พ.ศ. ๒๕๖๐</strong> และหนังสือเวียนคณะกรรมการวินิจฉัยปัญหาการจัดซื้อจัดจ้างและการบริหารพัสดุภาครัฐ (กวจ.) หากมีข้อกำหนดที่เสี่ยงขัดต่อกฎหมาย เจ้าหน้าที่พัสดุควรปรับปรุงแก้ไขก่อนนำเสนอคณะกรรมการพิจารณาให้ความเห็นชอบ
                  </p>
                </div>
              </div>

              {/* List of Detected Issues */}
              {(() => {
                const evalData = legalEvaluations.get(selectedLegalTor.torId);
                const violations = evalData?.violations || [];

                if (violations.length === 0) {
                  return (
                    <div className="p-6 text-center text-slate-500 bg-slate-50 rounded-xl border border-slate-200">
                      <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
                      <p className="font-bold text-slate-800 text-sm">ไม่พบข้อกำหนดที่ขัดต่อ พ.ร.บ. จัดซื้อจัดจ้างฯ</p>
                      <p className="text-xs text-slate-500 mt-1">ข้อกำหนดของ TOR ฉบับนี้เปิดกว้าง เป็นธรรม และสอดคล้องตามระเบียบพัสดุภาครัฐ</p>
                    </div>
                  );
                }

                return (
                  <div className="space-y-3">
                    <h4 className="font-bold text-slate-800 text-sm flex items-center gap-1.5 font-['Prompt',sans-serif]">
                      <span>รายการข้อตรวจพบ ({violations.length} รายการ):</span>
                    </h4>

                    {violations.map((item, idx) => (
                      <div
                        key={idx}
                        className={`p-4 rounded-xl border text-slate-800 shadow-2xs transition-all ${
                          item.severity === 'violation'
                            ? 'bg-red-50/70 border-red-300'
                            : 'bg-amber-50/70 border-amber-300'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="flex items-center gap-2">
                            {item.severity === 'violation' ? (
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-600 text-white shadow-2xs">
                                เสี่ยงขัด พ.ร.บ. (ระดับสูง)
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500 text-white shadow-2xs">
                                ข้อพึงระวัง (ระดับกลาง)
                              </span>
                            )}
                            <span className="text-[11px] font-bold text-slate-600">
                              {item.aspectName}
                            </span>
                          </div>
                        </div>

                        <h5 className="font-bold text-slate-900 text-xs sm:text-sm mb-1 font-['Prompt',sans-serif]">
                          {item.issueTitle}
                        </h5>

                        <div className="mb-2 p-2 rounded bg-white/80 border border-slate-200 text-slate-700 leading-relaxed">
                          <span className="font-semibold text-slate-900 block mb-0.5">
                            รายละเอียดข้อตรวจพบในเนื้อหา:
                          </span>
                          <p>{item.description}</p>
                        </div>

                        <div className="mb-2 p-2 rounded bg-red-100/50 border border-red-200 text-red-900 text-[11px]">
                          <span className="font-bold block mb-0.5">ข้อกฎหมาย/หนังสือเวียนที่เกี่ยวข้อง:</span>
                          <p className="font-semibold">{item.lawSection}</p>
                        </div>

                        <div className="p-2.5 rounded bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs">
                          <span className="font-bold text-emerald-950 block mb-0.5 flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>แนวทางแก้ไขปรับปรุงสำหรับเจ้าหน้าที่พัสดุ:</span>
                          </span>
                          <p className="leading-relaxed">{item.recommendation}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
              <span className="text-[11px] text-slate-500">
                ข้อมูลอ้างอิง: พ.ร.บ. การจัดซื้อจัดจ้างและการบริหารพัสดุภาครัฐ พ.ศ. ๒๕๖๐
              </span>
              <button
                type="button"
                onClick={() => {
                  setSelectedLegalTor(null);
                  setSelectedViolationItem(null);
                }}
                className="px-4 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-semibold transition-colors"
              >
                ปิดหน้าต่าง
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
