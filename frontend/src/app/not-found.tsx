import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center px-4 text-center">
      <h1 className="text-8xl font-black text-brand/20 select-none">404</h1>
      <h2 className="text-2xl font-bold mt-4">صفحه‌ای که دنبال آن بودید پیدا نشد</h2>
      <p className="text-muted mt-2 max-w-sm">
        ممکن است آدرس را اشتباه وارد کرده باشید یا صفحه حذف شده باشد.
      </p>
      <Link href="/" className="btn btn-primary mt-6 inline-flex items-center gap-2">
        بازگشت به صفحه اصلی
        <ArrowRight size={18} />
      </Link>
    </div>
  );
}
