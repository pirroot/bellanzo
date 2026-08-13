"use client";

import { useEffect, useState } from "react";
import { ClipboardCheck, Search, Star, MessageSquare } from "lucide-react";
import ServiceRequestForm from "./ServiceRequestForm";
import TrackRequest from "./TrackRequest";
import SurveyForm from "./SurveyForm";
import FeedbackForm from "./FeedbackForm";

const tabs = [
  { id: "new", label: "ثبت درخواست", icon: ClipboardCheck },
  { id: "track", label: "پیگیری درخواست", icon: Search },
  { id: "survey", label: "نظرسنجی", icon: Star },
  { id: "feedback", label: "انتقادات و پیشنهادات", icon: MessageSquare },
];

export default function ServicesTabs() {
  const [active, setActive] = useState("new");

  useEffect(() => {
    const hash = window.location.hash.replace("#", "");
    if (tabs.some((t) => t.id === hash)) setActive(hash);
  }, []);

  return (
    <div id="new">
      <div className="flex flex-wrap gap-3 justify-center mb-10">
        {tabs.map((t) => {
          const on = active === t.id;
          return (
            <button
              key={t.id}
              id={t.id}
              onClick={() => setActive(t.id)}
              className={`flex items-center gap-2 px-6 py-3 rounded-full font-bold transition-all ${
                on
                  ? "bg-brand text-white shadow-[0_10px_30px_-10px_rgba(225,29,42,.6)]"
                  : "bg-white border border-line text-ink-soft hover:border-brand"
              }`}
            >
              <t.icon size={18} />
              {t.label}
            </button>
          );
        })}
      </div>

      <div className="max-w-3xl mx-auto">
        {active === "new" && <ServiceRequestForm />}
        {active === "track" && <TrackRequest />}
        {active === "survey" && <SurveyForm />}
        {active === "feedback" && <FeedbackForm />}
      </div>
    </div>
  );
}
