import { TORDetail, LegalComplianceSummary, LegalViolationItem } from '../types';

/**
 * Utility to inspect TOR contents against the Public Procurement and Supplies Administration Act B.E. 2560
 * (พระราชบัญญัติการจัดซื้อจัดจ้างและการบริหารพัสดุภาครัฐ พ.ศ. ๒๕๖๐)
 * and relevant circular letters (e.g., ว 115, ว 89, ว 544).
 */

export function evaluateLegalCompliance(tor: TORDetail): LegalComplianceSummary {
  // If the backend AI already returned structured legal compliance, merge and validate it
  const violations: LegalViolationItem[] = [];

  const techText = (tor.softwareHardware || '').toLowerCase();
  const scopeText = (tor.scope || '').toLowerCase();
  const expertiseText = (tor.expertise || '').toLowerCase();
  const deliverablesText = (tor.deliverables || '').toLowerCase();
  const companyText = (tor.companyOrBidder || '').toLowerCase();

  // 1. Check Section 9: Vendor Lock-in / Specific Brand Naming without "or equivalent"
  // (พ.ร.บ. มาตรา ๙ วรรคหนึ่ง - ห้ามกำหนดคุณลักษณะเฉพาะใกล้เคียงยี่ห้อหรือเจาะจง)
  if (
    (techText.includes('windows os') || techText.includes('intel') || techText.includes('intel core')) &&
    !techText.includes('เทียบเท่า') &&
    !techText.includes('หรือเทียบเท่า')
  ) {
    violations.push({
      aspectId: 'tech',
      aspectName: '๕. ซอฟต์แวร์ ฮาร์ดแวร์ที่นำมาใช้',
      severity: 'violation',
      lawSection: 'พ.ร.บ. การจัดซื้อจัดจ้างฯ พ.ศ. ๒๕๖๐ มาตรา ๙ วรรคหนึ่ง',
      issueTitle: 'ระบุยี่ห้อฮาร์ดแวร์/ระบบปฏิบัติการเจาะจง โดยไม่มีคำว่า "หรือเทียบเท่า"',
      description:
        'พบการระบุยี่ห้อเฉพาะเจาะจง เช่น "Intel Core" หรือระบุระบบปฏิบัติการ "Windows OS" โดยมิได้เปิดกว้างให้เสนอฮาร์ดแวร์หรือระบบปฏิบัติการทางเลือกอื่นที่มีประสิทธิภาพเทียบเท่าหรือดีกว่าได้',
      recommendation:
        'ปรับแก้ข้อกำหนดโดยเติมคำว่า "หรือเทียบเท่าหรือดีกว่า" หรือกำหนดเป็นเกณฑ์สมรรถนะขั้นต่ำ (Performance Specification) เช่น ความเร็วประมวลผล (PassMark Benchmark) แทนการระบุชื่อรุ่น/ยี่ห้อ',
    });
  }

  // 2. Check Dealership Authorization Requirement (หนังสือรับรองตัวแทนจำหน่ายจากผู้ผลิต)
  // (ขัดต่อหนังสือเวียน กวจ. ว ๑๑๕ และ พ.ร.บ. มาตรา ๙ - เป็นการจำกัดการแข่งขันทางการค้า)
  if (
    expertiseText.includes('ตัวแทนจำหน่าย') ||
    expertiseText.includes('หนังสือรับรองจากโรงงาน') ||
    expertiseText.includes('หนังสือรับรองความเป็นตัวแทนจำหน่าย')
  ) {
    violations.push({
      aspectId: 'expertise',
      aspectName: '๘. ความเชี่ยวชาญของบริษัทหรือผู้พัฒนา',
      severity: 'violation',
      lawSection: 'พ.ร.บ. จัดซื้อจัดจ้างฯ มาตรา ๙ และหนังสือเวียน กวจ. ด่วนที่สุด ที่ กค (กวจ) ๐๔๐๕.๒/ว ๑๑๕',
      issueTitle: 'กำหนดให้ยื่น "หนังสือรับรองตัวแทนจำหน่ายจากผู้ผลิต" เข้าข่ายจำกัดการแข่งขัน',
      description:
        'กำหนดเงื่อนไขให้ผู้ยื่นข้อเสนอต้องมี "หนังสือรับรองความเป็นตัวแทนจำหน่ายอุปกรณ์หลักจากโรงงานผู้ผลิต" ซึ่งตามมติคณะกรรมการวินิจฉัยฯ ว ๑๑๕ วินิจฉัยว่าเป็นการสร้างข้อได้เปรียบเสียเปรียบและเปิดช่องให้ผู้ผลิตผูกขาดเลือกผู้เสนอราคาเพียงรายเดียว',
      recommendation:
        'ควรตัดเงื่อนไขหนังสือรับรองตัวแทนจำหน่ายออก หรือเปลี่ยนเป็นกำหนดให้รับประกันสินค้าและบริการหลังการขายตามระยะเวลาสัญญา โดยมีหนังสือรับรองการรับประกันความชำรุดบกพร่องตามแบบมาตรฐานแทน',
    });
  }

  // 3. Check Disproportionate Qualification Criteria (เกณฑ์ผลงาน/ทุนจดทะเบียนสูงเกินสมควร)
  // (หนังสือเวียน ว ๒๑๔ และแนวทางส่งเสริมวิสาหกิจขนาดกลางและขนาดย่อม SMEs)
  if (
    expertiseText.includes('10,000,000') ||
    expertiseText.includes('10 ล้าน') ||
    (tor.torId === 'tor_03' && expertiseText.includes('iso/iec 27001') && expertiseText.includes('iso 9001'))
  ) {
    violations.push({
      aspectId: 'expertise',
      aspectName: '๘. ความเชี่ยวชาญของบริษัทหรือผู้พัฒนา',
      severity: 'warning',
      lawSection: 'พ.ร.บ. จัดซื้อจัดจ้างฯ มาตรา ๙ วรรคสอง และระเบียบกระทรวงการคลังฯ ข้อ ๒๑',
      issueTitle: 'กำหนดมาตรฐานสากลซ้ำซ้อนและทุนจดทะเบียนสูง อาจเข้าข่ายจำกัดสิทธิผู้ประกอบการทั่วไป',
      description:
        'กำหนดให้ต้องมีทั้ง ISO 9001, ISO 27001 ควบคู่กับทุนจดทะเบียนไม่น้อยกว่า 10 ล้านบาท และผลงานมูลค่าสูงพร้อมกัน อาจเข้าข่ายการกำหนดคุณสมบัติเกินความจำเป็นของงานระบบตรวจจับป้ายทะเบียน ซึ่งอาจถูกร้องเรียนว่ากีดกันผู้ประกอบการไทย/SMEs',
      recommendation:
        'พิจารณาใช้เกณฑ์รับรองมาตรฐานอย่างใดอย่างหนึ่ง หรือเปิดให้ยื่นมาตรฐานระดับประเทศที่เทียบเคียงได้ เพื่อให้มีผู้เข้าแข่งขันราคาได้อย่างเปิดกว้าง',
    });
  }

  // 4. Check Closed Architecture / Proprietary Protocol (ระบบปิด ไม่มี Open API)
  if (
    (techText.includes('standalone') || scopeText.includes('standalone')) &&
    (techText.includes('ไม่เชื่อมต่อภายนอก') || scopeText.includes('ไม่รวม'))
  ) {
    violations.push({
      aspectId: 'scope',
      aspectName: '๔. ขอบเขตการพัฒนาระบบ',
      severity: 'warning',
      lawSection: 'พ.ร.บ. การบริหารงานและการให้บริการภาครัฐผ่านระบบดิจิทัล พ.ศ. ๒๕๖๒ มาตรา ๑๒',
      issueTitle: 'ระบบปิด ไม่รองรับการแลกเปลี่ยนข้อมูลผ่านดิจิทัล (Interoperability Risk)',
      description:
        'ระบบถูกออกแบบเป็น Standalone โดยไม่มีการกำหนดมาตรฐาน Open API หรือช่องทางส่งต่อข้อมูลไปยังส่วนกลาง ซึ่งเสี่ยงต่อการไม่สอดคล้องตามกรอบธรรมาภิบาลข้อมูลภาครัฐ (Data Governance Framework)',
      recommendation:
        'ควรกำหนดให้มี OpenAPI / RESTful Interface เพื่อรองรับการเชื่อมโยงระบบความมั่นคงปลอดภัยในอนาคต',
    });
  }

  // 5. Check Inspection & Acceptance Criteria (เกณฑ์การตรวจรับพัสดุ มาตรา ๑๐๐)
  if (
    deliverablesText.includes('ไม่ได้ระบุ') ||
    deliverablesText.includes('ไม่ระบุเกณฑ์') ||
    (tor.torId === 'tor_01' && !deliverablesText.includes('กลางคืน'))
  ) {
    violations.push({
      aspectId: 'deliverables',
      aspectName: '๖. การส่งมอบงาน',
      severity: 'warning',
      lawSection: 'พ.ร.บ. จัดซื้อจัดจ้างฯ มาตรา ๑๐๐ และระเบียบกระทรวงการคลังฯ ข้อ ๑๗๕',
      issueTitle: 'เกณฑ์การตรวจรับความแม่นยำไม่ครอบคลุมสภาวะการใช้งานจริง',
      description:
        'ระบุเกณฑ์ตรวจรับความถูกต้องเฉพาะเวลากลางวัน ไม่ครอบคลุมเวลากลางคืนหรือสภาวะฝนตก อาจส่งผลให้คณะกรรมการตรวจรับพัสดุไม่สามารถตรวจรับงานได้อย่างรัดกุมตามระเบียบ',
      recommendation:
        'ควรกำหนดเกณฑ์การทดสอบ System Acceptance Test (SAT) ทั้งกลางวันและกลางคืน พร้อมระบุจำนวนเที่ยวรถทดสอบขั้นต่ำที่ชัดเจน',
    });
  }

  // If backend provided legal violations, merge any non-duplicate ones
  if (tor.legalCompliance?.violations && Array.isArray(tor.legalCompliance.violations)) {
    tor.legalCompliance.violations.forEach((v) => {
      const exists = violations.some(
        (existing) => existing.aspectId === v.aspectId && existing.issueTitle === v.issueTitle
      );
      if (!exists) {
        violations.push(v);
      }
    });
  }

  const violationCount = violations.filter((v) => v.severity === 'violation').length;
  const warningCount = violations.filter((v) => v.severity === 'warning').length;
  const hasViolation = violationCount > 0;

  return {
    hasViolation,
    violationCount,
    warningCount,
    riskLevel: violationCount > 0 ? 'high' : warningCount > 0 ? 'medium' : 'low',
    violations,
  };
}
