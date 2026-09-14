import React, { useState } from 'react';
import {
  X,
  Send,
  Sparkles,
  Building2,
  DollarSign,
  Calendar,
  Layers,
  Cpu,
  CheckCircle2,
  FileText,
  ShieldCheck,
  HelpCircle,
  AlertCircle
} from 'lucide-react';
import { ProposalFormData } from '../types';

interface ProposalSubmissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: ProposalFormData) => Promise<void>;
}

const SAMPLE_PROPOSAL_1: ProposalFormData = {
  title: 'ข้อเสนอพัฒนาระบบตรวจจับป้ายทะเบียนรถยนต์อัจฉริยะ (Edge AI LPR) พร้อมไม้กั้นความเร็วสูง',
  company: 'บริษัท ไทยสมาร์ทวิชั่น โซลูชั่นส์ จำกัด',
  taxId: '0105562019874 / ทุนจดทะเบียน 20,000,000 บาท',
  contactPerson: 'นายวรวิทย์ พัฒนกิจ (ผู้จัดการฝ่ายวิศวกรรมระบบ)',
  phone: '02-543-9800, 089-123-4567',
  email: 'voravit@thaismartvision.co.th',
  price: '485,000 บาท (รวมภาษีมูลค่าเพิ่ม 7% แล้ว)',
  budgetNumber: 485000,
  durationDays: '60 วันทำการ',
  lanesCount: 2,
  architecture: 'edge_ai',
  hasBarrierGate: true,
  hasVisitorSystem: true,
  scope:
    'ติดตั้งและพัฒนาระบบอ่านป้ายทะเบียนยานพาหนะอัตโนมัติ 2 ช่องทาง (เข้า 1 ช่อง, ออก 1 ช่อง) พร้อมบูรณาการเปิด-ปิดไม้กั้นอัตโนมัติ เชื่อมโยงบัญชีรายชื่อยานพาหนะบุคลากร (Whitelist) ทะเบียนเฝ้าระวัง (Watchlist) และระบบลงทะเบียนยานพาหนะผู้มาติดต่อผ่าน QR Code',
  hardwareSoftware:
    '1) กล้อง Edge AI LPR ความละเอียด 4MP พร้อมชิปประมวลผล Deep Learning NPU ในตัว จำนวน 2 ชุด\n2) ไม้กั้นอัตโนมัติความเร็วสูง (High-speed Barrier Gate 1.5 วินาที) มอเตอร์ Brushless DC จำนวน 2 ชุด พร้อม Loop Detector และ Infrared Safety Sensor ป้องกันไม้ตีรถ\n3) ซอฟต์แวร์ Smart LPR Management ทำงานผ่าน Web Application (HTTPS) รองรับ Dashboard, Search, Export และ Audit Log\n4) Industrial PoE Switch 8 Port และเครื่องสำรองไฟฟ้า UPS ขนาด 1500VA สำรองไฟได้ไม่น้อยกว่า 30 นาที',
  deliverables:
    'แบ่งส่งมอบ 2 งวดงาน:\nงวดที่ 1 (40%): แผนการติดตั้ง, Shop Drawing, ส่งมอบอุปกรณ์ฮาร์ดแวร์ทั้งหมด ณ สถานที่ติดตั้ง\nงวดที่ 2 (60%): ติดตั้งระบบเสร็จสมบูรณ์, ผลทดสอบความถูกต้องอ่านป้ายทะเบียนไม่น้อยกว่า 96% ในเวลากลางวัน และไม่น้อยกว่า 92% ในเวลากลางคืน (ทดสอบ 100 เที่ยวรถ), เอกสารคู่มือการใช้งานภาษาไทย และการฝึกอบรมเจ้าหน้าที่ 6 ชั่วโมง',
  companyExpertise:
    'ได้รับการแต่งตั้งเป็น Authorized Distributor และ System Integrator อย่างเป็นทางการ, ได้รับมาตรฐาน ISO 9001:2015 ด้านการติดตั้งและบำรุงรักษาระบบคอมพิวเตอร์, มีผลงานติดตั้งระบบ LPR ให้แก่หน่วยงานภาครัฐและรัฐวิสาหกิจย้อนหลัง 3 ปี ไม่น้อยกว่า 5 สัญญา รวมมูลค่ากว่า 15 ล้านบาท',
  expertNames:
    'ดร.ชาญชัย ธีระวิทยา (วศ.ด. วิศวกรรมคอมพิวเตอร์และระบบปัญญาประดิษฐ์ - ผู้เชี่ยวชาญ Edge AI ประจำโครงการ), นายวีระชัย เจริญผล (วิศวกรวิชาชีพควบคุมงาน กว. ภก. 28941)',
  warrantyAndSla:
    'รับประกันอุปกรณ์และระบบซอฟต์แวร์ 2 ปีเต็ม (ฟรีค่าแรงและอะไหล่แบบ On-site Service), รองรับแจ้งเหตุขัดข้อง 24 ชั่วโมง 7 วัน, เวลาเข้าถึงหน้างานภายใน 2 ชั่วโมงสำหรับเหตุกรณีฉุกเฉิน และมีกล้องสำรองสับเปลี่ยน (Spare Part) ภายใน 24 ชั่วโมง',
  additionalNotes:
    'ระบบไม่มีการผูกขาดเทคโนโลยี (Open Architecture) รองรับการเชื่อมต่อ REST API เข้ากับระบบสารสนเทศส่วนกลางของหน่วยงานในอนาคตได้ทันที',
};

const SAMPLE_PROPOSAL_2: ProposalFormData = {
  title: 'ข้อเสนอติดตั้งระบบตรวจจับทะเบียนรถยนต์ความมั่นคงสูงแบบหลายจุดตรวจ (Multi-Gate LPR Server-Centric)',
  company: 'บริษัท แอดวานซ์ ดิจิทัล ซิสเต็มส์ (ไทยแลนด์) จำกัด',
  taxId: '0105558045612 / ทุนจดทะเบียน 50,000,000 บาท',
  contactPerson: 'นางสาวจารุวรรณ สินธุสาร (ผู้อำนวยการโครงการ)',
  phone: '02-987-6543, 081-888-9999',
  email: 'jaruwan@advancedigital.co.th',
  price: '890,000 บาท (รวมภาษีมูลค่าเพิ่ม 7% แล้ว)',
  budgetNumber: 890000,
  durationDays: '75 วันทำการ',
  lanesCount: 4,
  architecture: 'server_centric',
  hasBarrierGate: true,
  hasVisitorSystem: true,
  scope:
    'พัฒนาระบบตรวจจับและอ่านป้ายทะเบียนรถยนต์สำหรับ 4 ช่องจราจร (2 ประตูทางเข้า-ออก) ใช้เซิร์ฟเวอร์ส่วนกลางประมวลผลวิดีโอสตรีมสด AI Analytics ตรวจจับยี่ห้อ สี และประเภทรถยนต์ พร้อมระบบรักษาความปลอดภัยระดับสูงและแจ้งเตือน Line Notify/Webhook ทันทีเมื่อพบรถในบัญชีเฝ้าระวัง',
  hardwareSoftware:
    '1) กล้องวงจรปิด LPR ความเร็วชัตเตอร์สูงระดับ 1/100,000 วินาที พร้อมไฟอินฟราเรดระยะ 30 เมตร จำนวน 4 ชุด\n2) กล้องมุมกว้างบันทึกภาพรวมตัวรถ (Context Camera) ความละเอียด 4K จำนวน 4 ชุด\n3) เซิร์ฟเวอร์ประมวลผลกลาง AI GPU Server Rackmount 2U พร้อมฮาร์ดดิสก์ Enterprise RAID 5 เก็บภาพและข้อมูลได้ 180 วัน\n4) ไม้กั้นทางเข้า-ออกอัตโนมัติพร้อมระบบ Safety Sensor จำนวน 4 ชุด\n5) ระบบ Centralized Web Console พร้อมระบบจัดการผู้ใช้แบบ Role-Based Access Control',
  deliverables:
    'ส่งมอบ 3 งวดงาน:\nงวดที่ 1 (30%): ออกแบบระบบ Network Architecture และจัดส่งฮาร์ดแวร์ทั้งหมด\nงวดที่ 2 (40%): ติดตั้งกล้อง เซิร์ฟเวอร์ และเดินสายไฟเบอร์ออปติกเสร็จสมบูรณ์\nงวดที่ 3 (30%): ทำสอบระบบรวม (End-to-End Test) ความแม่นยำเฉลี่ย ≥ 97%, ส่งมอบ As-built Drawing, แผนผังระบบ, คู่มือการใช้งาน และจัดอบรมบุคลากร',
  companyExpertise:
    'มีใบรับรองมาตรฐานสากล ISO/IEC 27001 (ความมั่นคงปลอดภัยสารสนเทศ) และ ISO 9001:2015, มีผลงานติดตั้งระบบ LPR และกล้องตรวจจับความปลอดภัยสนามบินและนิคมอุตสาหกรรมกว่า 10 โครงการ มูลค่ารวมเกิน 50 ล้านบาท',
  expertNames:
    'รศ.ดร.วรเชษฐ์ นวรัตน์ (ที่ปรึกษาอาวุโสด้าน Computer Vision & Machine Learning), นางสาวทิพย์วรรณ บูรพา (Lead AI Architect & Infrastructure Specialist, CISSP)',
  warrantyAndSla:
    'รับประกันระบบ 3 ปีเต็ม, Preventive Maintenance (PM) ทุก 3 เดือน รวม 12 ครั้ง, ให้บริการสายด่วน Helpdesk ตลอด 24 ชม., เข้าแก้ไขหน้างานภายใน 4 ชม.',
  additionalNotes:
    'เซิร์ฟเวอร์ติดตั้งภายในศูนย์คอมพิวเตอร์ของหน่วยงาน ข้อมูลทั้งหมดเป็นความลับภายใต้ พ.ร.บ. คุ้มครองข้อมูลส่วนบุคคล (PDPA)',
};

export const ProposalSubmissionModal: React.FC<ProposalSubmissionModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [formData, setFormData] = useState<ProposalFormData>(SAMPLE_PROPOSAL_1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleFillSample = (sample: ProposalFormData) => {
    setFormData(sample);
    setErrorMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      setErrorMessage('กรุณาระบุชื่อโครงการ / ชื่อข้อเสนอ TOR');
      return;
    }
    if (!formData.company.trim()) {
      setErrorMessage('กรุณาระบุชื่อบริษัทหรือผู้ยื่นข้อเสนอ');
      return;
    }
    if (!formData.price.trim()) {
      setErrorMessage('กรุณาระบุวงเงินที่เสนอ');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      await onSubmit(formData);
      onClose();
    } catch (err: any) {
      setErrorMessage(err?.message || 'เกิดข้อผิดพลาดในการบันทึกข้อเสนอ');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-800 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center text-white backdrop-blur-xs">
              <FileText className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h3 className="text-base font-bold font-['Prompt',sans-serif] tracking-tight">
                แบบฟอร์มรับข้อเสนอโครงการ / ร่าง TOR ผ่านหน้าจอ
              </h3>
              <p className="text-xs text-blue-100">
                กรอกข้อมูลข้อเสนอโครงการเพื่อนำเข้าสู่ระบบ AI วิเคราะห์และเปรียบเทียบร่วมกับ TOR อื่นทันที
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-white/80 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Sample Selector Bar */}
        <div className="px-6 py-2.5 bg-blue-50/70 border-b border-blue-100 flex items-center justify-between gap-2 flex-wrap text-xs">
          <div className="flex items-center gap-1.5 text-blue-900 font-medium">
            <Sparkles className="w-4 h-4 text-amber-600" />
            <span>ปุ่มอำนวยความสะดวก (โหลดข้อมูลตัวอย่าง):</span>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => handleFillSample(SAMPLE_PROPOSAL_1)}
              className="px-2.5 py-1 rounded-md bg-white hover:bg-blue-100 text-blue-700 border border-blue-200 font-medium transition-colors"
            >
              ตัวอย่าง 1: ข้อเสนอ Edge AI (48.5 หมื่น)
            </button>
            <button
              type="button"
              onClick={() => handleFillSample(SAMPLE_PROPOSAL_2)}
              className="px-2.5 py-1 rounded-md bg-white hover:bg-indigo-100 text-indigo-700 border border-indigo-200 font-medium transition-colors"
            >
              ตัวอย่าง 2: ข้อเสนอ Multi-Gate (89 หมื่น)
            </button>
          </div>
        </div>

        {/* Form Body (Scrollable) */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5 text-xs text-slate-700">
          {errorMessage && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Section 1: ข้อมูลทั่วไปโครงการและผู้ยื่น */}
          <div className="bg-slate-50/80 p-4 rounded-xl border border-slate-200/80 space-y-3">
            <div className="flex items-center gap-1.5 text-slate-900 font-bold text-sm font-['Prompt',sans-serif] border-b border-slate-200/80 pb-2">
              <Building2 className="w-4 h-4 text-blue-600" />
              <span>๑. ข้อมูลโครงการและนิติบุคคลผู้ยื่นข้อเสนอ</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="md:col-span-2">
                <label htmlFor="proposal-title" className="block font-semibold text-slate-700 mb-1">
                  ชื่อโครงการ / ชื่อข้อเสนอ TOR <span className="text-red-500">*</span>
                </label>
                <input
                  id="proposal-title"
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="เช่น โครงการจัดหาระบบตรวจจับป้ายทะเบียนรถยนต์อัจฉริยะ (Edge AI LPR)"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div>
                <label htmlFor="proposal-company" className="block font-semibold text-slate-700 mb-1">
                  ชื่อบริษัท / ผู้ยื่นข้อเสนอ <span className="text-red-500">*</span>
                </label>
                <input
                  id="proposal-company"
                  type="text"
                  required
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  placeholder="เช่น บริษัท สมาร์ท เทคโนโลยี จำกัด"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div>
                <label htmlFor="proposal-taxid" className="block font-semibold text-slate-700 mb-1">
                  เลขประจำตัวผู้เสียภาษี / ทุนจดทะเบียน
                </label>
                <input
                  id="proposal-taxid"
                  type="text"
                  value={formData.taxId}
                  onChange={(e) => setFormData({ ...formData, taxId: e.target.value })}
                  placeholder="เช่น 0105560000000 / ทุนจดทะเบียน 10 ล้านบาท"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div>
                <label htmlFor="proposal-contact" className="block font-semibold text-slate-700 mb-1">
                  ผู้ประสานงาน และเบอร์โทรศัพท์
                </label>
                <input
                  id="proposal-contact"
                  type="text"
                  value={formData.contactPerson}
                  onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                  placeholder="เช่น นายสมชาย สมบูรณ์ / โทร 081-234-5678"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div>
                <label htmlFor="proposal-email" className="block font-semibold text-slate-700 mb-1">
                  อีเมลติดต่อ
                </label>
                <input
                  id="proposal-email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="contact@company.co.th"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Section 2: กรอบงบประมาณและสเปกหลัก */}
          <div className="bg-slate-50/80 p-4 rounded-xl border border-slate-200/80 space-y-3">
            <div className="flex items-center gap-1.5 text-slate-900 font-bold text-sm font-['Prompt',sans-serif] border-b border-slate-200/80 pb-2">
              <DollarSign className="w-4 h-4 text-emerald-600" />
              <span>๒. กรอบวงเงิน ระยะเวลา และสถาปัตยกรรมระบบ</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              <div>
                <label htmlFor="proposal-price" className="block font-semibold text-slate-700 mb-1">
                  วงเงินที่เสนอ (บาท) <span className="text-red-500">*</span>
                </label>
                <input
                  id="proposal-price"
                  type="text"
                  required
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  placeholder="เช่น 485,000 บาท"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-mono font-semibold"
                />
              </div>

              <div>
                <label htmlFor="proposal-duration" className="block font-semibold text-slate-700 mb-1">
                  ระยะเวลาดำเนินการ (วัน)
                </label>
                <input
                  id="proposal-duration"
                  type="text"
                  value={formData.durationDays}
                  onChange={(e) => setFormData({ ...formData, durationDays: e.target.value })}
                  placeholder="เช่น 60 วัน"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div>
                <label htmlFor="proposal-lanes" className="block font-semibold text-slate-700 mb-1">
                  จำนวนช่องทาง (เลน)
                </label>
                <select
                  id="proposal-lanes"
                  value={formData.lanesCount}
                  onChange={(e) => setFormData({ ...formData, lanesCount: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                >
                  <option value={1}>1 จุดตรวจ / 1 เลน</option>
                  <option value={2}>2 ช่องทาง เข้า-ออก</option>
                  <option value={4}>4 ช่องทาง (Multi-Gate)</option>
                  <option value={6}>6 ช่องทางขึ้นไป</option>
                </select>
              </div>

              <div>
                <label htmlFor="proposal-architecture" className="block font-semibold text-slate-700 mb-1">
                  สถาปัตยกรรมระบบ
                </label>
                <select
                  id="proposal-architecture"
                  value={formData.architecture}
                  onChange={(e) => setFormData({ ...formData, architecture: e.target.value as any })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                >
                  <option value="edge_ai">Edge AI Camera (ชิปบนกล้อง)</option>
                  <option value="server_centric">Server-Centric (เซิร์ฟเวอร์กลาง)</option>
                  <option value="hybrid">บูรณาการ (Hybrid)</option>
                  <option value="basic">ระบบตรวจจับพื้นฐาน</option>
                </select>
              </div>
            </div>

            {/* Checkboxes for features */}
            <div className="flex items-center gap-6 pt-1 flex-wrap">
              <label className="inline-flex items-center gap-2 cursor-pointer font-medium">
                <input
                  type="checkbox"
                  checked={formData.hasBarrierGate}
                  onChange={(e) => setFormData({ ...formData, hasBarrierGate: e.target.checked })}
                  className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                />
                <span>มีระบบไม้กั้นอัตโนมัติ (Barrier Gate) พร้อม Safety Sensor</span>
              </label>

              <label className="inline-flex items-center gap-2 cursor-pointer font-medium">
                <input
                  type="checkbox"
                  checked={formData.hasVisitorSystem}
                  onChange={(e) => setFormData({ ...formData, hasVisitorSystem: e.target.checked })}
                  className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                />
                <span>มีระบบบริหารจัดการผู้มาติดต่อ (Visitor Management)</span>
              </label>
            </div>
          </div>

          {/* Section 3: รายละเอียด 8 ประเด็นเชิงลึก */}
          <div className="bg-slate-50/80 p-4 rounded-xl border border-slate-200/80 space-y-3">
            <div className="flex items-center gap-1.5 text-slate-900 font-bold text-sm font-['Prompt',sans-serif] border-b border-slate-200/80 pb-2">
              <Cpu className="w-4 h-4 text-indigo-600" />
              <span>๓. รายละเอียดสาระสำคัญตาม ๘ ประเด็น TOR</span>
            </div>

            <div className="space-y-3">
              <div>
                <label htmlFor="proposal-scope" className="block font-semibold text-slate-700 mb-1">
                  (1) ขอบเขตการพัฒนาระบบ (Scope of Work)
                </label>
                <textarea
                  id="proposal-scope"
                  rows={3}
                  value={formData.scope}
                  onChange={(e) => setFormData({ ...formData, scope: e.target.value })}
                  placeholder="ระบุจุดติดตั้ง วัตถุประสงค์ การเชื่อมต่อเครือข่าย และขั้นตอนการดำเนินงาน"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-mono text-xs"
                />
              </div>

              <div>
                <label htmlFor="proposal-hardware" className="block font-semibold text-slate-700 mb-1">
                  (2) ซอฟต์แวร์ ฮาร์ดแวร์ และคุณลักษณะอุปกรณ์ที่นำมาใช้
                </label>
                <textarea
                  id="proposal-hardware"
                  rows={3}
                  value={formData.hardwareSoftware}
                  onChange={(e) => setFormData({ ...formData, hardwareSoftware: e.target.value })}
                  placeholder="ระบุรุ่น สเปกกล้อง ความละเอียด ชิป NPU สวิตช์ UPS และซอฟต์แวร์บริหารจัดการ"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-mono text-xs"
                />
              </div>

              <div>
                <label htmlFor="proposal-deliverables" className="block font-semibold text-slate-700 mb-1">
                  (3) การส่งมอบงาน งวดงาน และเกณฑ์การตรวจรับ
                </label>
                <textarea
                  id="proposal-deliverables"
                  rows={2}
                  value={formData.deliverables}
                  onChange={(e) => setFormData({ ...formData, deliverables: e.target.value })}
                  placeholder="เช่น งวดงาน เกณฑ์ความแม่นยำ % การทดสอบ เอกสารคู่มือภาษาไทย และการฝึกอบรม"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-mono text-xs"
                />
              </div>

              <div>
                <label htmlFor="proposal-expert-names" className="block font-semibold text-slate-700 mb-1">
                  (4.1) ชื่อผู้เชี่ยวชาญ / บุคลากรหลักประจำโครงการ
                </label>
                <input
                  type="text"
                  id="proposal-expert-names"
                  value={formData.expertNames || ''}
                  onChange={(e) => setFormData({ ...formData, expertNames: e.target.value })}
                  placeholder="เช่น ดร.ชาญชัย ธีระวิทยา (วศ.ด. AI Specialist), นายวีระชัย (วิศวกร กว. ควบคุมงาน)"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-xs font-mono text-slate-800"
                />
              </div>

              <div>
                <label htmlFor="proposal-expertise" className="block font-semibold text-slate-700 mb-1">
                  (4.2) ความเชี่ยวชาญของบริษัทและผลงานที่ผ่านมา
                </label>
                <textarea
                  id="proposal-expertise"
                  rows={2}
                  value={formData.companyExpertise}
                  onChange={(e) => setFormData({ ...formData, companyExpertise: e.target.value })}
                  placeholder="เช่น มาตรฐาน ISO 9001/27001, หนังสือแต่งตั้งตัวแทนจำหน่าย, ผลงานติดตั้งภาครัฐย้อนหลัง"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-mono text-xs"
                />
              </div>

              <div>
                <label htmlFor="proposal-sla" className="block font-semibold text-slate-700 mb-1">
                  (5) การรับประกันและการบริการหลังการขาย (SLA)
                </label>
                <textarea
                  id="proposal-sla"
                  rows={2}
                  value={formData.warrantyAndSla}
                  onChange={(e) => setFormData({ ...formData, warrantyAndSla: e.target.value })}
                  placeholder="เช่น รับประกัน 2 ปี, เวลาเข้าแก้ไขฉุกเฉินภายใน 2 ชั่วโมง, แผนบำรุงรักษา Preventive Maintenance"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-mono text-xs"
                />
              </div>

              <div>
                <label htmlFor="proposal-notes" className="block font-semibold text-slate-700 mb-1">
                  (6) ข้อสังเกตเพิ่มเติม (Optional)
                </label>
                <input
                  id="proposal-notes"
                  type="text"
                  value={formData.additionalNotes}
                  onChange={(e) => setFormData({ ...formData, additionalNotes: e.target.value })}
                  placeholder="เช่น สอดคล้องตามมาตรฐาน พ.ร.บ. จัดซื้อจัดจ้างฯ ไม่มีการล็อกสเปก"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>
            </div>
          </div>
        </form>

        {/* Modal Footer */}
        <div className="px-6 py-3 bg-slate-100 border-t border-slate-200 flex items-center justify-between shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 rounded-lg hover:bg-slate-200/70 transition-colors"
          >
            ยกเลิก
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="inline-flex items-center gap-2 px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 text-white text-xs font-bold rounded-lg shadow-sm transition-all"
          >
            {isSubmitting ? (
              <span>กำลังบันทึกและประมวลผล...</span>
            ) : (
              <>
                <Send className="w-3.5 h-3.5" />
                <span>บันทึกและนำเข้าสู่ระบบเปรียบเทียบ</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
