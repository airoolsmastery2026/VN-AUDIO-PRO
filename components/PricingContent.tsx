
import React, { useState } from 'react';
import { Lang, getT } from '../services/i18n';

interface PricingContentProps {
  onSelectPlan: (plan: any) => void;
  lang: Lang;
}

const PricingContent: React.FC<PricingContentProps> = ({ onSelectPlan, lang }) => {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const t = getT(lang);

  const plans = [
    {
      name: t.freePlan,
      price: 0,
      description: t.freePlanSub,
      features: lang === 'vi' ? [
        "15 lượt sử dụng thử",
        "Tất cả giọng đọc cơ bản",
        "Dịch thuật 5 ngôn ngữ",
        "Chất lượng 24kHz Standard"
      ] : [
        "15 trial uses",
        "All basic voices",
        "5 language translation",
        "24kHz Standard quality"
      ],
      cta: t.currentPlan,
      featured: false
    },
    {
      name: t.proPlan,
      price: billingCycle === 'monthly' ? 199000 : 159000,
      description: t.proPlanSub,
      features: lang === 'vi' ? [
        "Không giới hạn ký tự",
        "Dịch thuật đa ngôn ngữ PRO",
        "Xuất file WAV không nén",
        "Nhân bản giọng nói (Clone)",
        "Hỗ trợ ưu tiên 24/7"
      ] : [
        "Unlimited characters",
        "PRO multilingual translation",
        "Uncompressed WAV export",
        "Voice Cloning",
        "Priority 24/7 support"
      ],
      cta: t.buyPro,
      featured: true
    },
    {
      name: t.entPlan,
      price: 499000,
      description: t.entPlanSub,
      features: lang === 'vi' ? [
        "API truy cập tốc độ cao",
        "Băng thông ưu tiên",
        "Tùy chỉnh giọng đọc riêng",
        "Quản lý máy chủ riêng",
        "Thanh toán linh hoạt"
      ] : [
        "High-speed API access",
        "Priority bandwidth",
        "Custom private voices",
        "Private server management",
        "Flexible payment"
      ],
      cta: t.contactNow,
      featured: false
    }
  ];

  return (
    <div className="space-y-16 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
      <div className="text-center space-y-6">
        <h1 className="text-5xl font-black text-gray-900 tracking-tight">{t.pricingTitle}</h1>
        <p className="text-xl text-gray-500 max-w-2xl mx-auto leading-relaxed">{t.pricingSub}</p>
        
        <div className="flex items-center justify-center gap-4 pt-4">
          <span className={`text-sm font-bold ${billingCycle === 'monthly' ? 'text-gray-900' : 'text-gray-400'}`}>{t.monthly}</span>
          <button 
            onClick={() => setBillingCycle(prev => prev === 'monthly' ? 'yearly' : 'monthly')}
            className="w-16 h-8 bg-gray-200 rounded-full relative transition-colors duration-300 focus:outline-none"
          >
            <div className={`absolute top-1 w-6 h-6 bg-indigo-600 rounded-full transition-all duration-300 ${billingCycle === 'yearly' ? 'left-9' : 'left-1'}`}></div>
          </button>
          <div className="flex items-center gap-2">
            <span className={`text-sm font-bold ${billingCycle === 'yearly' ? 'text-gray-900' : 'text-gray-400'}`}>{t.yearly}</span>
            <span className="bg-green-100 text-green-700 text-[10px] font-black px-2 py-0.5 rounded-full">{t.save20}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto items-stretch">
        {plans.map((plan, idx) => (
          <div key={idx} className={`rounded-[2.5rem] p-10 flex flex-col transition-all duration-500 hover:translate-y-[-8px] ${plan.featured ? 'bg-indigo-600 text-white shadow-2xl shadow-indigo-200 relative ring-8 ring-indigo-50 scale-105 z-10' : 'bg-white text-gray-900 border border-gray-100 shadow-xl shadow-gray-200/40'}`}>
            {plan.featured && <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-amber-400 text-amber-900 text-[10px] font-black px-6 py-2 rounded-full uppercase tracking-widest shadow-lg">{t.mostPopular}</div>}
            <div className="mb-10">
              <h3 className={`text-2xl font-bold mb-2 ${plan.featured ? 'text-white' : 'text-gray-900'}`}>{plan.name}</h3>
              <p className={`text-sm ${plan.featured ? 'text-indigo-100' : 'text-gray-400'}`}>{plan.description}</p>
            </div>
            <div className="mb-10 flex items-baseline gap-2">
              <span className="text-5xl font-black">{plan.price > 0 ? plan.price.toLocaleString(lang === 'vi' ? 'vi-VN' : 'en-US') + (lang === 'vi' ? 'đ' : '$') : '0'}</span>
              {plan.price > 0 && <span className={plan.featured ? 'text-indigo-200' : 'text-gray-400'}>{t.perMonth}</span>}
            </div>
            <ul className="space-y-5 mb-12 flex-1">
              {plan.features.map((feature, fIdx) => (
                <li key={fIdx} className="flex items-start gap-3 text-sm font-medium">
                  <div className={`mt-0.5 w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${plan.featured ? 'bg-indigo-500 text-white' : 'bg-green-50 text-green-600'}`}>
                    <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20"><path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/></svg>
                  </div>
                  <span className={plan.featured ? 'text-indigo-50' : 'text-gray-600'}>{feature}</span>
                </li>
              ))}
            </ul>
            <button disabled={plan.name === t.freePlan} onClick={() => onSelectPlan(plan)} className={`w-full py-5 rounded-2xl font-black uppercase tracking-widest transition-all ${plan.featured ? 'bg-white text-indigo-600 hover:bg-indigo-50 shadow-xl shadow-black/10' : plan.name === t.freePlan ? 'bg-gray-100 text-gray-400' : 'bg-gray-50 text-gray-900 border border-gray-200 hover:bg-gray-100'}`}>
              {plan.cta}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PricingContent;
