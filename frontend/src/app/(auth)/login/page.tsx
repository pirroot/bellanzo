'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Phone, KeyRound, CheckCircle } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(0);

  const sendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch('/api/auth/otp/send/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone }),
      });

      const data = await res.json();

      if (res.ok) {
        setStep('otp');
        setCountdown(120);
        const timer = setInterval(() => {
          setCountdown((prev) => {
            if (prev <= 1) clearInterval(timer);
            return prev - 1;
          });
        }, 1000);
      } else {
        setError(data.detail || 'خطا در ارسال کد');
      }
    } catch {
      setError('خطا در ارتباط با سرور');
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch('/api/auth/otp/verify/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, code: otp }),
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem('access_token', data.access);
        localStorage.setItem('refresh_token', data.refresh);
        router.push('/');
      } else {
        setError(data.detail || 'کد نامعتبر است');
      }
    } catch {
      setError('خطا در ارتباط با سرور');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 pt-20">
      <div className="w-full max-w-md">
        <div className="bg-white border border-line rounded-3xl p-8 shadow-xl">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-black">ورود / ثبت‌نام</h1>
            <p className="text-muted text-sm mt-2">
              {step === 'phone' ? 'شماره موبایل خود را وارد کنید' : 'کد تایید را وارد کنید'}
            </p>
          </div>

          {error && (
            <div className="p-3 bg-red-50 text-red-600 rounded-xl text-sm mb-4">{error}</div>
          )}

          {step === 'phone' ? (
            <form onSubmit={sendOtp} className="space-y-4">
              <div>
                <label className="block text-sm font-bold mb-1">شماره موبایل</label>
                <div className="relative">
                  <Phone
                    size={20}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted"
                  />
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="09123456789"
                    className="w-full pr-10 pl-4 py-3 rounded-xl border border-line focus:border-brand outline-none transition-colors"
                    dir="ltr"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || phone.length < 11}
                className="btn btn-primary w-full text-base disabled:opacity-50"
              >
                {loading ? 'در حال ارسال...' : 'ارسال کد تایید'}
              </button>
            </form>
          ) : (
            <form onSubmit={verifyOtp} className="space-y-4">
              <div>
                <label className="block text-sm font-bold mb-1">کد تایید</label>
                <div className="relative">
                  <KeyRound
                    size={20}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted"
                  />
                  <input
                    type="text"
                    required
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    placeholder="کد ۵ رقمی"
                    maxLength={5}
                    className="w-full pr-10 pl-4 py-3 rounded-xl border border-line focus:border-brand outline-none transition-colors"
                    dir="ltr"
                  />
                </div>
                <div className="flex justify-between mt-2 text-sm">
                  <span className="text-muted">
                    {countdown > 0 ? `${countdown} ثانیه تا ارسال مجدد` : ''}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setStep('phone');
                      setOtp('');
                    }}
                    className="text-brand hover:underline"
                  >
                    تغییر شماره
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || otp.length < 5}
                className="btn btn-primary w-full text-base disabled:opacity-50"
              >
                {loading ? 'در حال بررسی...' : 'تایید و ورود'}
              </button>

              {countdown === 0 && (
                <button
                  type="button"
                  onClick={sendOtp}
                  className="text-sm text-brand hover:underline block mx-auto"
                >
                  ارسال مجدد کد
                </button>
              )}
            </form>
          )}

          <div className="mt-6 text-center text-xs text-muted border-t border-line pt-4">
            <CheckCircle size={14} className="inline text-green-500 ml-1" />
            با ورود، شرایط و قوانین را پذیرفته‌اید
          </div>
        </div>
      </div>
    </div>
  );
}
