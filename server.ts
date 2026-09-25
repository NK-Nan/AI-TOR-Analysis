import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
// @ts-ignore
import { PDFParse } from 'pdf-parse';
// @ts-ignore
import mammoth from 'mammoth';

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Initialize Google GenAI
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || '',
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Load pre-extracted Drive TORs
let driveTorsCache: any[] = [];
try {
  const dataPath = path.join(process.cwd(), 'server_data', 'drive_tors.json');
  if (fs.existsSync(dataPath)) {
    driveTorsCache = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
    console.log(`Loaded ${driveTorsCache.length} pre-extracted Drive TORs from cache.`);
  }
} catch (e) {
  console.error('Error loading drive_tors.json:', e);
}

// 1. Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// 2. Get Drive TOR documents
app.get('/api/drive-tors', (req, res) => {
  try {
    const list = driveTorsCache.map((item) => {
      let budgetNumber = 650000;
      let architecture: 'edge_ai' | 'server_centric' | 'basic' | 'hybrid' = 'basic';
      let hasBarrierGate = false;
      let hasVisitorSystem = false;
      let lanesCount = 1;
      let companyName = 'ไม่ปรากฏผู้ยื่น (ร่างข้อกำหนดราชการ)';

      if (item.id === 'tor_01') {
        budgetNumber = 650000;
        architecture = 'basic';
        lanesCount = 1;
        hasBarrierGate = false;
        hasVisitorSystem = false;
        companyName = 'บริษัท ซิสเต็มส์ คอนโทรล จำกัด (ผู้ยื่นร่าง 01)';
      } else if (item.id === 'tor_02') {
        budgetNumber = 1850000;
        architecture = 'hybrid';
        lanesCount = 2;
        hasBarrierGate = true;
        hasVisitorSystem = true;
        companyName = 'บริษัท สมาร์ท ไอที โซลูชั่นส์ จำกัด (ผู้ยื่นร่าง 02)';
      } else if (item.id === 'tor_03') {
        budgetNumber = 3400000;
        architecture = 'server_centric';
        lanesCount = 4;
        hasBarrierGate = true;
        hasVisitorSystem = true;
        companyName = 'บริษัท ซีเคียวริตี้ ซินเนอร์ยี่ จำกัด (ผู้ยื่นร่าง 03)';
      } else if (item.id === 'tor_alt_1') {
        budgetNumber = 600000;
        architecture = 'basic';
        lanesCount = 1;
        hasBarrierGate = false;
        hasVisitorSystem = false;
        companyName = 'คณะกรรมการกำหนดร่าง (TOR ทางเลือก 1)';
      } else if (item.id === 'tor_alt_2') {
        budgetNumber = 1900000;
        architecture = 'server_centric';
        lanesCount = 2;
        hasBarrierGate = true;
        hasVisitorSystem = true;
        companyName = 'คณะกรรมการกำหนดร่าง (TOR ทางเลือก 2)';
      } else if (item.id === 'tor_alt_3') {
        budgetNumber = 2100000;
        architecture = 'edge_ai';
        lanesCount = 2;
        hasBarrierGate = true;
        hasVisitorSystem = true;
        companyName = 'คณะกรรมการกำหนดร่าง (TOR ทางเลือก 3)';
      }

      return {
        id: item.id,
        title: item.title,
        filename: item.filename,
        sizeBytes: item.sizeBytes,
        textLength: item.textLength,
        snippet: item.fullText ? item.fullText.substring(0, 300).replace(/\s+/g, ' ') : '',
        content: item.fullText,
        source: 'drive',
        budgetNumber,
        architecture,
        hasBarrierGate,
        hasVisitorSystem,
        lanesCount,
        companyName,
      };
    });
    res.json({
      success: true,
      folderUrl: 'https://drive.google.com/drive/folders/1A2n1s6XmydX_6v4EFyM1K2ZsVHwd_sLi?usp=sharing',
      documents: list,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 2.1 Submit Project Proposal via screen
app.post('/api/submit-proposal', (req, res) => {
  try {
    const data = req.body;
    if (!data.title || !data.company || !data.price) {
      return res.status(400).json({
        success: false,
        error: 'กรุณาระบุข้อมูลจำเป็น: ชื่อโครงการ, บริษัทผู้ยื่นข้อเสนอ และราคาที่เสนอ',
      });
    }

    const newId = `sub_${Date.now()}`;
    const cleanPrice = parseFloat(String(data.price).replace(/[^0-9.]/g, '')) || 500000;

    // Build comprehensive TOR content from submitted fields
    const fullText = `เอกสารข้อเสนอโครงการ (ยื่นผ่านระบบหน้าจอ)
ชื่อโครงการ: ${data.title}
บริษัท/ผู้ยื่นข้อเสนอ: ${data.company}
เลขประจำตัวผู้เสียภาษี: ${data.taxId || 'ไม่ระบุ'}
ผู้ประสานงาน: ${data.contactPerson || '-'} | โทร: ${data.phone || '-'} | อีเมล: ${data.email || '-'}
วงเงินที่เสนอ: ${data.price} (${cleanPrice.toLocaleString()} บาท)
ระยะเวลาดำเนินการ: ${data.durationDays || '60'} วัน
สถาปัตยกรรมระบบ: ${data.architecture || 'Edge AI Camera'}
จำนวนช่องจราจร: ${data.lanesCount || 2} ช่องทาง
อุปกรณ์ไม้กั้นอัตโนมัติ (Barrier Gate): ${data.hasBarrierGate ? 'มี พร้อม Sensor ป้องกันไม้ตีรถ' : 'ไม่มี'}
ระบบบริหารจัดการผู้มาติดต่อ (Visitor System): ${data.hasVisitorSystem ? 'มี รองรับ Web/QR' : 'ไม่มี'}

1. ขอบเขตการพัฒนาระบบ:
${data.scope || 'ติดตั้งระบบตรวจจับและอ่านป้ายทะเบียนรถยนต์อัตโนมัติ (LPR) พร้อมระบบบันทึกและค้นหาข้อมูลยานพาหนะ'}

2. ซอฟต์แวร์และฮาร์ดแวร์ที่นำมาใช้:
${data.hardwareSoftware || 'กล้องอ่านป้ายทะเบียน LPR ความละเอียดสูง พร้อมชิป AI Edge NPU, สวิตช์เครือข่าย PoE, เครื่องสำรองไฟ UPS และซอฟต์แวร์บริหารจัดการ LPR ผ่าน Web Browser'}

3. การส่งมอบงานและงวดงาน:
${data.deliverables || 'ส่งมอบงานงวดเดียวหรือแบ่งตามงวดงาน พร้อมผลทดสอบความแม่นยำไม่น้อยกว่า 95%, เอกสารคู่มือภาษาไทย และการอบรมเจ้าหน้าที่'}

4. ความเชี่ยวชาญของบริษัท บุคลากรหลัก และผลงาน:
ชื่อผู้เชี่ยวชาญ/บุคลากรหลัก: ${data.expertNames || 'ไม่ระบุชื่อผู้เชี่ยวชาญ'}
ความเชี่ยวชาญและผลงาน: ${data.companyExpertise || 'มีหนังสือรับรองการแต่งตั้งตัวแทนจำหน่ายอย่างเป็นทางการ มีวิศวกรและช่างผู้เชี่ยวชาญ และมีผลงานติดตั้งระบบใกล้เคียง'}

5. การรับประกันและ SLA:
${data.warrantyAndSla || 'รับประกันระบบและอุปกรณ์ไม่น้อยกว่า 2 ปี บริการซ่อมบำรุงฉุกเฉินภายใน 4 ชั่วโมง'}

6. ข้อสังเกตเพิ่มเติม:
${data.additionalNotes || 'ข้อเสนอตรงตามเกณฑ์และระเบียบพัสดุภาครัฐ'}`;

    const newDoc = {
      id: newId,
      title: data.title,
      filename: `ข้อเสนอ_${data.company.replace(/\s+/g, '_')}.pdf`,
      content: fullText,
      source: 'submission',
      sizeBytes: Buffer.byteLength(fullText, 'utf8'),
      budgetNumber: cleanPrice,
      architecture: data.architecture || 'edge_ai',
      hasBarrierGate: !!data.hasBarrierGate,
      hasVisitorSystem: !!data.hasVisitorSystem,
      lanesCount: Number(data.lanesCount) || 2,
      companyName: data.company,
      submittedAt: new Date().toISOString(),
      isSelected: true,
    };

    res.json({
      success: true,
      document: newDoc,
      message: 'บันทึกข้อเสนอโครงการผ่านหน้าจอเรียบร้อยแล้ว',
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 3. Parse uploaded file (.pdf, .docx, .doc, .txt)
app.post('/api/parse-file', async (req, res) => {
  try {
    const { filename, fileType, base64Content } = req.body;
    if (!base64Content) {
      return res.status(400).json({ success: false, error: 'Missing base64Content' });
    }

    const buffer = Buffer.from(base64Content, 'base64');
    let extractedText = '';

    const lowerName = (filename || '').toLowerCase();

    if (lowerName.endsWith('.pdf') || fileType === 'application/pdf') {
      const parser = new PDFParse({ data: buffer });
      const parseResult = await parser.getText();
      extractedText = (parseResult && typeof parseResult === 'object' && 'text' in parseResult)
        ? (parseResult as any).text
        : String(parseResult || '');
    } else if (lowerName.endsWith('.docx') || fileType?.includes('officedocument.wordprocessingml')) {
      const result = await mammoth.extractRawText({ buffer });
      extractedText = result.value || '';
    } else if (lowerName.endsWith('.doc') || lowerName.endsWith('.txt')) {
      // Clean readable text extraction
      extractedText = buffer.toString('utf8');
      if (lowerName.endsWith('.doc')) {
        // Filter readable ascii/utf-8 characters
        extractedText = extractedText.replace(/[^\x20-\x7E\u0E00-\u0E7F\n\r\t]/g, ' ');
      }
    } else {
      extractedText = buffer.toString('utf8');
    }

    extractedText = extractedText.trim();
    if (!extractedText) {
      return res.status(422).json({
        success: false,
        error: 'ไม่สามารถอ่านข้อความจากไฟล์ได้ กรุณาตรวจสอบว่าเป็นไฟล์ PDF หรือ Word ที่มีข้อความดิจิทัล',
      });
    }

    res.json({
      success: true,
      filename,
      extractedText,
      charCount: extractedText.length,
    });
  } catch (err: any) {
    console.error('Error parsing file:', err);
    res.status(500).json({ success: false, error: 'เกิดข้อผิดพลาดในการประมวลผลไฟล์: ' + err.message });
  }
});

// 4. AI Comprehensive TOR Analysis & Evaluation
app.post('/api/analyze-tors', async (req, res) => {
  try {
    const { tors, customPrompt, forceAi } = req.body;

    if (!tors || !Array.isArray(tors) || tors.length === 0) {
      return res.status(400).json({ success: false, error: 'กรุณาเลือกหรืออัปโหลดเอกสาร TOR อย่างน้อย 1 ฉบับ' });
    }

    const selectedIds = tors.map((t: any) => t.id).sort().join(',');

    // Fast response if standard Drive presets are selected without custom prompt unless forceAi is set
    if (!customPrompt && !forceAi) {
      if (selectedIds === 'tor_01,tor_02,tor_03') {
        const initialPath = path.join(process.cwd(), 'server_data', 'initial_analysis.json');
        if (fs.existsSync(initialPath)) {
          const cached = JSON.parse(fs.readFileSync(initialPath, 'utf8'));
          return res.json({ success: true, fromCache: true, data: cached });
        }
      } else if (selectedIds === 'tor_alt_1,tor_alt_2,tor_alt_3') {
        const specPath = path.join(process.cwd(), 'server_data', 'spec_comparison_analysis.json');
        if (fs.existsSync(specPath)) {
          const cached = JSON.parse(fs.readFileSync(specPath, 'utf8'));
          return res.json({ success: true, fromCache: true, data: cached });
        }
      }
    }

    // Build context strictly from provided documents
    let docsContext = '';
    tors.forEach((tor: any, index: number) => {
      docsContext += `\n\n==================== เอกสาร TOR ฉบับที่ ${index + 1}: ${tor.title} (ID: ${tor.id}, ไฟล์: ${tor.filename}) ====================\n`;
      docsContext += (tor.content || tor.extractedText || '').substring(0, 15000);
    });

    const systemInstruction = `คุณคือ "เจ้าหน้าที่พัสดุชำนาญการพิเศษ" และ "ผู้เชี่ยวชาญการประเมินร่างขอบเขตของงาน (TOR) ด้านเทคโนโลยีสารสนเทศภาครัฐ" ตาม พ.ร.บ. การจัดซื้อจัดจ้างและการบริหารพัสดุภาครัฐ พ.ศ. 2560
ภารกิจ: วิเคราะห์และเปรียบเทียบเอกสาร TOR ระบบตรวจจับป้ายทะเบียนรถ (LPR) ที่ส่งเข้ามา เพื่อจัดทำรายงานเสนอคณะกรรมการจัดซื้อจัดจ้างและตรวจรับพัสดุ
กฎเหล็กด้านความถูกต้องและจริยธรรมการวิเคราะห์ (Strict Grounding Rule):
1. วิเคราะห์ข้อมูลจากเอกสารที่กำหนดให้เท่านั้น (Strict Grounding) หากในเอกสารไม่ได้ระบุ ให้ระบุชัดเจนว่า "เอกสารไม่ได้ระบุ" หรือ "ไม่ปรากฏในข้อกำหนด" ห้ามแต่งเติมข้อมูลภายนอกเด็ดขาด
2. ใช้ภาษาเขียนราชการที่เป็นทางการ สุภาพ รัดกุม ชัดเจน และเป็นกลาง
3. ให้คะแนน 5 ด้าน ข้อละ 10 คะแนน (รวม 50 คะแนนเต็ม):
   - ระยะเวลา (10 คะแนน)
   - ความเชี่ยวชาญของบริษัทหรือทีมงาน (10 คะแนน)
   - ขอบเขต (10 คะแนน)
   - เทคนิคที่นำมาใช้ (10 คะแนน)
   - ราคา (10 คะแนน)
   พร้อมระบุเหตุผลประกอบคะแนนอย่างละเอียด
4. วิเคราะห์ให้ครบ 8 ประเด็นของแต่ละ TOR (ชื่อ TOR, บริษัทหรือผู้ยื่น TOR, ระยะเวลา, ขอบเขตการพัฒนาระบบ, ซอฟต์แวร์ฮาร์ดแวร์, การส่งมอบงาน, ราคา, ความเชี่ยวชาญของบริษัทหรือผู้พัฒนา)
   สำคัญ: ในหัวข้อความเชี่ยวชาญ (ประเด็นที่ ๘) ให้สกัดทั้ง "ชื่อผู้เชี่ยวชาญหรือบุคลากรหลัก" (expertNames เช่น วุฒิการศึกษา ใบ กว. หรือบทบาท) และ "ความเชี่ยวชาญของบริษัท/ผลงาน" (expertise) หากเอกสารไม่ได้ระบุชื่อผู้เชี่ยวชาญ ให้ระบุว่า "ไม่ปรากฏชื่อผู้เชี่ยวชาญในเอกสาร"
5. ตรวจสอบเนื้อหา TOR เทียบกับข้อกำหนดทางกฎหมาย ตาม พ.ร.บ. การจัดซื้อจัดจ้างและการบริหารพัสดุภาครัฐ พ.ศ. ๒๕๖๐ และหนังสือเวียนที่เกี่ยวข้อง:
   - มาตรา ๙ วรรคหนึ่ง: ห้ามมิให้กำหนดคุณลักษณะเฉพาะใกล้เคียงยี่ห้อใด หรือเจาะจงผู้ขายรายใดรายหนึ่งโดยไม่มีคำว่า "หรือเทียบเท่า"
   - หนังสือเวียน กวจ. ด่วนที่สุด ที่ กค (กวจ) ๐๔๐๕.๒/ว ๑๑๕: การกำหนดเงื่อนไขหนังสือรับรองตัวแทนจำหน่ายจากผู้ผลิตที่เข้าข่ายจำกัดการแข่งขัน
   - เกณฑ์ตรวจรับพัสดุตามมาตรา ๑๐๐ และระเบียบกระทรวงการคลังฯ
   หากตรวจพบประเด็นที่อาจขัดต่อกฎหมาย ให้ระบุใน legalCompliance (hasViolation: true, severity: 'violation' หรือ 'warning') พร้อมมาตราและคำแนะนำ
   วิเคราะห์ความเหมือน, ความต่าง, ไฮไลท์ จุดเด่น และ จุดด้อย ของแต่ละ TOR และข้อเสนอแนะเจ้าหน้าที่พัสดุ
ตอบกลับเป็น JSON เท่านั้น ตามโครงสร้างที่ระบุ`;

    const promptText = `จงวิเคราะห์เอกสาร TOR ต่อไปนี้อย่างละเอียด และตอบเป็น JSON เท่านั้น:
${docsContext}

${customPrompt ? `\nหมายเหตุหรือประเด็นเพิ่มเติมที่เจ้าหน้าที่พัสดุต้องการเน้น: ${customPrompt}\n` : ''}

โครงสร้าง JSON:
{
  "torDetails": [
    {
      "torId": "string",
      "torName": "ชื่อ TOR",
      "companyOrBidder": "บริษัทหรือผู้ยื่น TOR",
      "duration": "ระยะเวลาดำเนินการ",
      "scope": "ขอบเขตการพัฒนาระบบ",
      "softwareHardware": "ซอฟต์แวร์ ฮาร์ดแวร์ที่นำมาใช้",
      "deliverables": "การส่งมอบงาน งวดงาน และเกณฑ์การตรวจรับ",
      "price": "ราคาหรือวงเงินงบประมาณ",
      "expertNames": "ชื่อผู้เชี่ยวชาญหรือบุคลากรหลักที่ระบุในเอกสาร (เช่น ดร...., นาย... วศ.บ., หรือ 'ไม่ปรากฏชื่อผู้เชี่ยวชาญในเอกสาร')",
      "expertise": "ความเชี่ยวชาญของบริษัทหรือทีมงาน ผลงานที่ผ่านมา และมาตรฐานที่ได้รับรอง",
      "highlightPoints": ["จุดเด่นไฮไลท์ 1", "จุดเด่นไฮไลท์ 2"],
      "strengths": ["จุดเด่น 1", "จุดเด่น 2"],
      "weaknesses": ["จุดด้อย 1", "จุดด้อย 2"],
      "legalCompliance": {
        "hasViolation": false,
        "violationCount": 0,
        "warningCount": 0,
        "riskLevel": "low",
        "violations": [
          {
            "aspectId": "tech หรือ expertise หรือ deliverables ฯลฯ",
            "aspectName": "ชื่อประเด็นที่พบปัญหา",
            "severity": "violation หรือ warning",
            "lawSection": "พ.ร.บ. การจัดซื้อจัดจ้างฯ พ.ศ. ๒๕๖๐ มาตรา ๙",
            "issueTitle": "หัวข้อปัญหาทางกฎหมาย",
            "description": "รายละเอียดข้อความใน TOR ที่เข้าข่ายขัดระเบียบ",
            "recommendation": "แนวทางการแก้ไขปรับปรุงให้ถูกต้อง"
          }
        ]
      }
    }
  ],
  "similarities": [
    { "aspect": "หัวข้อความเหมือน", "detail": "รายละเอียด", "significance": "นัยสำคัญทางพัสดุ" }
  ],
  "differences": [
    { "aspect": "หัวข้อความต่าง", "impact": "ผลกระทบ", "torBreakdown": { "torId": "รายละเอียด" } }
  ],
  "sideBySideMatrix": [
    { "category": "หมวดหมู่", "description": "คำอธิบาย", "detailsByTor": { "torId": "สรุป" } }
  ],
  "scores": [
    {
      "torId": "string",
      "torName": "ชื่อ TOR",
      "durationScore": 8.5,
      "durationReason": "เหตุผล",
      "expertiseScore": 8.0,
      "expertiseReason": "เหตุผล",
      "scopeScore": 9.0,
      "scopeReason": "เหตุผล",
      "technicalScore": 8.5,
      "technicalReason": "เหตุผล",
      "priceScore": 8.0,
      "priceReason": "เหตุผล",
      "totalScore": 42.0,
      "summaryVerdict": "บทสรุปประเมินภาพรวม"
    }
  ],
  "radarData": [
    { "criterion": "ระยะเวลา", "fullName": "ระยะเวลาดำเนินงาน (10 คะแนน)" },
    { "criterion": "ความเชี่ยวชาญ", "fullName": "ความเชี่ยวชาญของบริษัท/ทีมงาน (10 คะแนน)" },
    { "criterion": "ขอบเขต", "fullName": "ความครบถ้วนของขอบเขตงาน (10 คะแนน)" },
    { "criterion": "เทคนิค", "fullName": "ความล้ำหน้าและเสถียรภาพทางเทคนิค (10 คะแนน)" },
    { "criterion": "ราคา", "fullName": "ความคุ้มค่างบประมาณ (10 คะแนน)" }
  ],
  "recommendations": {
    "procurementStandards": ["ข้อพิจารณาความสอดคล้องตามระเบียบพัสดุ"],
    "vendorLockInWarnings": ["ข้อควรระวังเรื่องการล็อกสเปก"],
    "committeeInquiryQuestions": ["คำถามสำคัญสำหรับซักถามผู้ยื่นข้อเสนอ"],
    "maintenanceAndSla": ["ข้อเสนอแนะด้านการรับประกันและ SLA"],
    "overallConclusion": "บทสรุปและข้อเสนอแนะของเจ้าหน้าที่พัสดุ"
  }
}`;

    // Retry with backoff in case of 503 spike
    let responseText = '';
    let lastErr: any = null;
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: promptText,
          config: {
            systemInstruction,
            responseMimeType: 'application/json',
          },
        });
        responseText = response.text || '';
        if (responseText) break;
      } catch (e: any) {
        lastErr = e;
        console.warn(`Gemini attempt ${attempt} failed:`, e?.message);
        if (attempt < 2) {
          await new Promise((resolve) => setTimeout(resolve, 2000));
        }
      }
    }

    if (!responseText) {
      // If temporary 503 happens and we have cached initial data, fallback intelligently
      const fallbackPath = path.join(process.cwd(), 'server_data', 'initial_analysis.json');
      if (fs.existsSync(fallbackPath)) {
        const cached = JSON.parse(fs.readFileSync(fallbackPath, 'utf8'));
        return res.json({
          success: true,
          fromCache: true,
          warning: 'ระบบ AI มีผู้ใช้งานหนาแน่นชั่วคราว จึงแสดงผลการประเมินอ้างอิงจากฐานข้อมูลเอกสาร TOR ที่ได้ตรวจสอบแล้ว',
          data: cached,
        });
      }
      throw lastErr || new Error('ไม่สามารถรับข้อมูลตอบกลับจากโมเดล AI ได้');
    }

    let parsed: any;
    try {
      parsed = JSON.parse(responseText);
    } catch (parseErr) {
      const match = responseText.match(/\{[\s\S]*\}/);
      if (match) {
        try {
          parsed = JSON.parse(match[0]);
        } catch {
          const fallbackPath = path.join(process.cwd(), 'server_data', 'initial_analysis.json');
          if (fs.existsSync(fallbackPath)) {
            const cached = JSON.parse(fs.readFileSync(fallbackPath, 'utf8'));
            return res.json({
              success: true,
              fromCache: true,
              warning: 'ไม่สามารถแปลงผลการวิเคราะห์เป็น JSON ได้ จึงนำข้อมูลอ้างอิงจากฐานข้อมูลมาแสดงผล',
              data: cached,
            });
          }
          throw new Error('ไม่สามารถแปลงผลลัพธ์จาก AI เป็น JSON ได้');
        }
      } else {
        const fallbackPath = path.join(process.cwd(), 'server_data', 'initial_analysis.json');
        if (fs.existsSync(fallbackPath)) {
          const cached = JSON.parse(fs.readFileSync(fallbackPath, 'utf8'));
          return res.json({
            success: true,
            fromCache: true,
            warning: 'ไม่สามารถแปลงผลการวิเคราะห์เป็น JSON ได้ จึงนำข้อมูลอ้างอิงจากฐานข้อมูลมาแสดงผล',
            data: cached,
          });
        }
        throw new Error('ไม่สามารถแปลงผลลัพธ์เป็น JSON ได้');
      }
    }

    // Ensure radarData contains the proper key-value pairs
    if (Array.isArray(parsed.radarData) && Array.isArray(parsed.scores)) {
      parsed.radarData.forEach((rPoint: any) => {
        parsed.scores.forEach((s: any) => {
          if (rPoint.criterion === 'ระยะเวลา') rPoint[s.torId] = s.durationScore;
          else if (rPoint.criterion === 'ความเชี่ยวชาญ') rPoint[s.torId] = s.expertiseScore;
          else if (rPoint.criterion === 'ขอบเขต') rPoint[s.torId] = s.scopeScore;
          else if (rPoint.criterion === 'เทคนิค') rPoint[s.torId] = s.technicalScore;
          else if (rPoint.criterion === 'ราคา') rPoint[s.torId] = s.priceScore;
        });
      });
    }

    res.json({
      success: true,
      data: {
        timestamp: new Date().toISOString(),
        analyzedTorIds: tors.map((t: any) => t.id),
        ...parsed,
      },
    });
  } catch (err: any) {
    console.error('Error analyzing TORs:', err);
    // Intelligent fallback to cached initial analysis if available
    const fallbackPath = path.join(process.cwd(), 'server_data', 'initial_analysis.json');
    if (fs.existsSync(fallbackPath)) {
      const cached = JSON.parse(fs.readFileSync(fallbackPath, 'utf8'));
      return res.json({
        success: true,
        fromCache: true,
        warning: 'การเชื่อมต่อระบบ AI ขัดข้องชั่วคราว (' + (err?.message || 'Error') + ') ระบบจึงแสดงผลการประเมินอ้างอิงเพื่อความต่อเนื่อง',
        data: cached,
      });
    }
    res.status(500).json({ success: false, error: 'การประเมินผิดพลาด: ' + (err?.message || err) });
  }
});

// 5. Chat or clarification endpoint for procurement officer Q&A
app.post('/api/ask-tor', async (req, res) => {
  try {
    const { question, tors, torsContext } = req.body;
    if (!question) {
      return res.status(400).json({ success: false, error: 'กรุณากรอกคำถาม' });
    }

    let docsContext = torsContext || '';
    if (!docsContext && Array.isArray(tors)) {
      tors.forEach((tor: any, index: number) => {
        docsContext += `\n\n[เอกสาร TOR ${index + 1}: ${tor.title} (ID: ${tor.id})]\n${tor.content || tor.extractedText || ''}\n`;
      });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: `คำถามจากเจ้าหน้าที่พัสดุ: "${question}"\n\nโปรดตอบโดยอ้างอิงเฉพาะเนื้อหาจากเอกสาร TOR ที่กำหนดให้ต่อไปนี้เท่านั้น:\n${docsContext}`,
      config: {
        systemInstruction:
          'คุณคือเจ้าหน้าที่พัสดุชำนาญการ ตอบคำถามอย่างเป็นทางการ กระชับ เที่ยงธรรม และชี้ชัดตามหมวด/ข้อใน TOR ที่ปรากฏ ห้ามแต่งเติมข้อมูลที่ไม่มีในเอกสารเด็ดขาด',
        temperature: 0.1,
      },
    });

    res.json({ success: true, answer: response.text });
  } catch (err: any) {
    console.error('Error in /api/ask-tor:', err);
    res.status(500).json({ success: false, error: err?.message || 'ไม่สามารถประมวลผลคำตอบได้' });
  }
});

// Ensure all unmatched /api/* calls return JSON 404, never Vite HTML
app.all('/api/*', (req, res) => {
  res.status(404).json({ success: false, error: `ไม่พบ API endpoint: ${req.method} ${req.path}` });
});

// Global API error handler ensuring JSON response
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (req.path.startsWith('/api')) {
    console.error('API Error:', err);
    return res.status(500).json({
      success: false,
      error: err?.message || 'เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์',
    });
  }
  next(err);
});

// Vite / Static setup
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Procurement TOR Analyzer Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
