import { ShieldCheck, Truck, Headphones, BadgeCheck } from "lucide-react";
import SectionHeading from "@/components/ui/SectionHeading";
import Reveal from "@/components/ui/Reveal";

const items = [
  { icon: BadgeCheck, title: "اصالت کالا", desc: "تضمین اصالت و کیفیت تمام محصولات." },
  { icon: ShieldCheck, title: "گارانتی معتبر", desc: "گارانتی رسمی و خدمات پس از فروش سراسری." },
  { icon: Headphones, title: "پشتیبانی ۲۴/۷", desc: "همراهی و پاسخگویی در تمام ساعات شبانه‌روز." },
  { icon: Truck, title: "ارسال مطمئن", desc: "تحویل سریع و ایمن در سراسر کشور." },
];

export default function WhyUs() {
  return (
    <section className="bg-surface">
      <div className="container-x py-20">
        <SectionHeading
          center
          eyebrow="چرا ما؟"
          title="دلایلی برای اعتماد به برند ما"
        />
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((it, i) => (
            <Reveal key={it.title} delay={i * 0.08}>
              <div className="h-full bg-white rounded-3xl p-7 border border-line card-hover">
                <span className="grid place-items-center w-14 h-14 rounded-2xl bg-brand-soft text-brand mb-5">
                  <it.icon size={26} />
                </span>
                <h3 className="font-black text-lg text-ink mb-2">{it.title}</h3>
                <p className="text-muted text-sm leading-7">{it.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
