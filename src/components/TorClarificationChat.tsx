import React, { useState } from 'react';
import {
  MessageSquare,
  Send,
  Sparkles,
  Bot,
  User,
  ShieldCheck,
  RefreshCw,
  HelpCircle,
  FileSearch,
  AlertCircle
} from 'lucide-react';
import { TORDocument } from '../types';
import { safeFetchJson, formatFriendlyErrorMessage, isPageNotJsonError } from '../utils/apiClient';

interface TorClarificationChatProps {
  activeDocuments: TORDocument[];
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
}

export const TorClarificationChat: React.FC<TorClarificationChatProps> = ({ activeDocuments }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init',
      sender: 'assistant',
      text: `สวัสดีครับเจ้าหน้าที่พัสดุ ผมคือผู้ช่วยวิเคราะห์เอกสาร TOR ท่านสามารถสอบถามรายละเอียดเฉพาะจุดของเอกสารที่กำลังเลือกอยู่ (${activeDocuments.length} ฉบับ) เช่น มาตรฐานกล้อง, อัตราความเร็วรถยนต์ที่ตรวจจับได้, เงื่อนไขค่าปรับ, หรือการรับประกัน โดยผมจะตอบอ้างอิงจากเนื้อหาในเอกสารเท่านั้น (Strict Grounding) ครับ`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async (questionText?: string) => {
    const q = questionText || input;
    if (!q.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: 'u_' + Date.now(),
      sender: 'user',
      text: q,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      // Build context from active documents
      let docsContext = '';
      activeDocuments.forEach((doc, idx) => {
        docsContext += `\n[เอกสารที่ ${idx + 1}: ${doc.title} (${doc.filename})]\n${doc.content.substring(0, 10000)}\n`;
      });

      const data = await safeFetchJson<any>(
        '/api/ask-tor',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            question: q,
            torsContext: docsContext,
          }),
        },
        1,
        1500
      );

      const botMsg: ChatMessage = {
        id: 'b_' + Date.now(),
        sender: 'assistant',
        text:
          data.answer ||
          (data.error ? `เกิดข้อผิดพลาด: ${data.error}` : 'ไม่พบข้อมูลที่ตรงกับคำถามในเอกสาร'),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch (err: any) {
      const friendlyText = isPageNotJsonError(err)
        ? 'เซิร์ฟเวอร์หรือเครือข่ายตอบกลับด้วยหน้าสถานะชั่วคราว ("The page cannot be loaded" / Proxy Error) แทนข้อมูลตอบคำถาม กรุณารอสักครู่แล้วลองส่งคำถามใหม่อีกครั้ง'
        : 'ไม่สามารถติดต่อระบบตอบคำถามได้: ' + formatFriendlyErrorMessage(err);

      setMessages((prev) => [
        ...prev,
        {
          id: 'err_' + Date.now(),
          sender: 'assistant',
          text: friendlyText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const sampleQuestions = [
    'กล้องของแต่ละ TOR รองรับความเร็วรถยนต์สูงสุดเท่าใด?',
    'แต่ละฉบับมีข้อกำหนดการรับประกันและระยะเวลาบำรุงรักษา (SLA) อย่างไร?',
    'มีฉบับใดบ้างที่รวมไม้กั้นอัตโนมัติ (Barrier Gate)?',
    'อัตราค่าปรับกรณีส่งมอบงานล่าช้าแต่ละฉบับคิดอย่างไร?',
  ];

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-4 sm:p-6 mb-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <FileSearch className="w-5 h-5 text-blue-600" />
          <h2 className="text-base font-bold text-slate-900 font-['Prompt',sans-serif]">
            ผู้ช่วยสืบค้นข้อกำหนดพัสดุเฉพาะประเด็น (Strict Grounding Q&A)
          </h2>
        </div>
        <span className="text-[11px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
          อ้างอิงจาก {activeDocuments.length} เอกสารที่เลือก
        </span>
      </div>

      {/* Chat Messages Window */}
      <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 h-64 overflow-y-auto space-y-3 mb-3 text-xs">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex items-start gap-2.5 ${
              m.sender === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            {m.sender === 'assistant' && (
              <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                <Bot className="w-4 h-4" />
              </div>
            )}
            <div
              className={`max-w-[85%] rounded-xl p-3 leading-relaxed ${
                m.sender === 'user'
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'bg-white text-slate-800 border border-slate-200 shadow-2xs'
              }`}
            >
              <p className="whitespace-pre-line">{m.text}</p>
              <span
                className={`text-[10px] block mt-1 ${
                  m.sender === 'user' ? 'text-blue-200 text-right' : 'text-slate-400'
                }`}
              >
                {m.timestamp}
              </span>
            </div>
            {m.sender === 'user' && (
              <div className="w-7 h-7 rounded-lg bg-slate-700 text-white flex items-center justify-center shrink-0 mt-0.5">
                <User className="w-4 h-4" />
              </div>
            )}
          </div>
        ))}
        {isLoading && (
          <div className="flex items-center gap-2 text-slate-500 text-xs italic pl-9">
            <RefreshCw className="w-3.5 h-3.5 animate-spin text-blue-600" />
            <span>กำลังสืบค้นและตรวจสอบจากเอกสาร TOR...</span>
          </div>
        )}
      </div>

      {/* Suggested Questions */}
      <div className="flex items-center gap-1.5 mb-3 flex-wrap text-[11px] text-slate-500">
        <span className="font-semibold text-slate-700 flex items-center gap-1">
          <HelpCircle className="w-3 h-3 text-amber-500" />
          <span>คำถามที่พบบ่อย:</span>
        </span>
        {sampleQuestions.map((sq, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handleSend(sq)}
            disabled={isLoading}
            className="px-2 py-0.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
          >
            {sq}
          </button>
        ))}
      </div>

      {/* Input box */}
      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="พิมพ์คำถามที่ต้องการตรวจสอบจากเอกสาร TOR เช่น เงื่อนไขหนังสือรับรองผู้ผลิต..."
          className="flex-1 px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSend();
          }}
          disabled={isLoading}
        />
        <button
          type="button"
          onClick={() => handleSend()}
          disabled={isLoading || !input.trim()}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors flex items-center gap-1.5 shrink-0"
        >
          <Send className="w-3.5 h-3.5" />
          <span>ส่งคำถาม</span>
        </button>
      </div>
    </div>
  );
};
