import Link from "next/link";
import {
  Wrench,
  ClipboardCheck,
  Search,
  MessageSquareHeart,
  ArrowLeft,
} from "lucide-react";
import SectionHeading from "@/components/ui/SectionHeading";
import Reveal from "@/components/ui/Reveal";

const services = [
  {
    icon: ClipboardCheck,
    title: "ثبت درخواست",
    desc: "درخواست تعمیر، گارانتی یا نصب را در چند ثانیه ثبت کنید.",
    href: "/services#new",
  },
  {
    icon: Search,
    title: "پیگیری وضعیت",
    desc: "با کد پیگیری، وضعیت درخواست خود را لحظه‌ای دنبال کنید.",
    href: "/services#track",
  },
  {
    icon: Wrench,
    title: "تعمیر و گارانتی",
    desc: "تیم فنی متخصص، آماده‌ی رسیدگی سریع به محصولات شماست.",
    href: "/services",
  },
  {
    icon: MessageSquareHeart,
    title: "نظرسنجی و بازخورد",
    desc: "نظر شما برای ما ارزشمند است و کیفیت ما را بهتر می‌کند.",
    href: "/services#survey",
  },
];

export default function ServicesPreview() {
  return (
    <section className="relative bg-ink text-white overflow-hidden">
      <div className="absolute -top-20 left-1/4 w-96 h-96 bg-brand/20 blur-[120px] rounded-full" />
      <div className="container-x py-24 relative">
        <div className="text-center">
          <SectionHeading
            center
            light
            eyebrow="خدمات پس از فروش"
            title="پشتیبانی که به آن اعتماد دارید"
            subtitle="از ثبت درخواست تا تحویل نهایی، در هر مرحله کنار شما هستیم."
          />
        </div>

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {services.map((s, i) => (
            <Reveal key={s.title} delay={i * 0.08}>
              <Link
                href={s.href}
                className="group block h-full bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 rounded-3xl p-7 transition-colors"
              >
                <span className="grid place-items-center w-14 h-14 rounded-2xl bg-brand text-white mb-5 group-hover:scale-110 transition-transform">
                  <s.icon size={26} />
                </span>
                <h3 className="font-black text-lg mb-2">{s.title}</h3>
                <p className="text-white/55 text-sm leading-7">{s.desc}</p>
                <span className="mt-4 inline-flex items-center gap-1 text-sm font-bold text-brand">
                  بیشتر <ArrowLeft size={15} />
                </span>
              </Link>
            </Reveal>
          ))}
        </div>

        <div className="mt-14 text-center">
          <Link href="/services#new" className="btn btn-primary">
            همین حالا درخواست خود را ثبت کنید
          </Link>
        </div>
      </div>
    </section>
  );
}
