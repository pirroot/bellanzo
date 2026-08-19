'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, HelpCircle } from 'lucide-react';
import Reveal from '@/components/ui/Reveal';

interface FaqItem {
  id: number;
  question: string;
  answer: string;
  order: number;
}

export default function FaqClient({ faqs = [] }: { faqs: FaqItem[] }) {
  const [openId, setOpenId] = useState<number | null>(null);

  if (!faqs || faqs.length === 0) {
    return (
      <div className="text-center py-16">
        <HelpCircle size={48} className="mx-auto text-line mb-4" />
        <p className="text-muted">هنوز سوالی ثبت نشده است.</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-3">
      {faqs.map((faq, i) => {
        const isOpen = openId === faq.id;
        return (
          <Reveal key={faq.id} delay={i * 0.05}>
            <motion.div
              className={`bg-white border rounded-2xl overflow-hidden transition-all ${
                isOpen ? 'border-brand shadow-md' : 'border-line hover:border-brand/30'
              }`}
              layout
            >
              <button
                onClick={() => setOpenId(isOpen ? null : faq.id)}
                className="w-full flex items-center justify-between gap-4 p-5 text-right hover:bg-surface/50 transition-colors"
              >
                <span className="font-bold text-ink text-sm md:text-base">{faq.question}</span>
                <span
                  className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                    isOpen ? 'bg-brand text-white' : 'bg-brand-soft text-brand'
                  }`}
                >
                  {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </span>
              </button>
              <AnimatePresence>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                  >
                    <div className="px-5 pb-5 pt-2 border-t border-line/50 text-muted leading-8 text-sm">
                      {faq.answer}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </Reveal>
        );
      })}
    </div>
  );
}
