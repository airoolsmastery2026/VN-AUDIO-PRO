
import React, { useState } from 'react';
import { Lang, getT } from '../services/i18n';

const FAQItem: React.FC<{ question: string; answer: string }> = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="border-b border-gray-100 last:border-0">
      <button onClick={() => setIsOpen(!isOpen)} className="w-full py-6 flex items-center justify-between text-left focus:outline-none group">
        <h4 className="text-lg font-bold text-gray-800 group-hover:text-indigo-600 transition-colors">{question}</h4>
        <div className={`transform transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
        </div>
      </button>
      <div className={`overflow-hidden transition-all duration-300 ${isOpen ? 'max-h-96 pb-6' : 'max-h-0'}`}>
        <p className="text-gray-500 leading-relaxed">{answer}</p>
      </div>
    </div>
  );
};

interface DocumentationContentProps {
  lang: Lang;
}

const DocumentationContent: React.FC<DocumentationContentProps> = ({ lang }) => {
  const t = getT(lang);

  const faqs = lang === 'vi' ? [
    { q: "File âm thanh tải về có bản quyền không?", a: "Với gói Pro và Enterprise, bạn sở hữu hoàn toàn bản quyền file âm thanh để sử dụng cho mục đích thương mại." },
    { q: "Tôi có thể dịch văn bản dài bao nhiêu?", a: "Công cụ hỗ trợ tối đa 5.000 ký tự mỗi lần. Bạn có thể thực hiện nhiều lần để dịch tài liệu dài." },
    { q: "Nền tảng hỗ trợ những ngôn ngữ nào?", a: "Chúng tôi hỗ trợ dịch 2 chiều giữa Tiếng Việt và hơn 10 ngôn ngữ: Anh, Trung, Nhật, Hàn..." }
  ] : [
    { q: "Do downloaded files have copyrights?", a: "With Pro and Enterprise plans, you fully own the copyright of audio files for commercial use." },
    { q: "How long can the text be for translation?", a: "The tool supports up to 5,000 characters per request. You can repeat for longer documents." },
    { q: "What languages are supported?", a: "We support two-way translation between Vietnamese and 10+ languages: English, Chinese, Japanese, Korean..." }
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-16 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <div className="space-y-6">
        <h1 className="text-5xl font-black text-gray-900 tracking-tight">{t.docsTitle}</h1>
        <p className="text-xl text-gray-500 leading-relaxed">{t.docsSub}</p>
      </div>

      <div className="space-y-12">
        <section className="space-y-6">
          <h2 className="text-2xl font-black text-gray-900 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center text-lg shadow-lg">1</div>
            {t.step1}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-lg shadow-gray-200/20 space-y-3">
              <div className="text-indigo-600 font-black text-3xl">01</div>
              <h4 className="font-bold">{t.step1_1}</h4>
              <p className="text-sm text-gray-500">{t.step1_1_sub}</p>
            </div>
            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-lg shadow-gray-200/20 space-y-3">
              <div className="text-indigo-600 font-black text-3xl">02</div>
              <h4 className="font-bold">{t.step1_2}</h4>
              <p className="text-sm text-gray-500">{t.step1_2_sub}</p>
            </div>
            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-lg shadow-gray-200/20 space-y-3">
              <div className="text-indigo-600 font-black text-3xl">03</div>
              <h4 className="font-bold">{t.step1_3}</h4>
              <p className="text-sm text-gray-500">{t.step1_3_sub}</p>
            </div>
          </div>
        </section>

        <section className="space-y-6">
          <h2 className="text-2xl font-black text-gray-900 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center text-lg shadow-lg">2</div>
            {t.tipsTitle}
          </h2>
          <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-lg shadow-gray-200/20 space-y-6">
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <li className="flex gap-4">
                <div className="shrink-0 w-6 h-6 rounded bg-green-100 text-green-600 flex items-center justify-center">✓</div>
                <div>
                  <h5 className="font-bold text-gray-900 text-sm">{t.tipComma}</h5>
                  <p className="text-xs text-gray-500">{t.tipCommaSub}</p>
                </div>
              </li>
              <li className="flex gap-4">
                <div className="shrink-0 w-6 h-6 rounded bg-green-100 text-green-600 flex items-center justify-center">✓</div>
                <div>
                  <h5 className="font-bold text-gray-900 text-sm">{t.tipFull}</h5>
                  <p className="text-xs text-gray-500">{t.tipFullSub}</p>
                </div>
              </li>
            </ul>
          </div>
        </section>

        <section className="space-y-6">
          <h2 className="text-2xl font-black text-gray-900 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center text-lg shadow-lg">3</div>
            {t.faq}
          </h2>
          <div className="bg-white rounded-[2rem] px-8 py-4 border border-gray-100 shadow-xl shadow-gray-200/20">
            {faqs.map((f, i) => <FAQItem key={i} question={f.q} answer={f.a} />)}
          </div>
        </section>
      </div>
    </div>
  );
};

export default DocumentationContent;
