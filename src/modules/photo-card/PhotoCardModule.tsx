import { Sparkles, ArrowLeft, Layers, Clock, CheckCircle2 } from 'lucide-react';
import type { AppModuleType } from '../../types';

export default function PhotoCardModule() {
  const handleBackToHub = () => {
    window.dispatchEvent(new CustomEvent<AppModuleType>('navigate-module', { detail: 'hub' }));
  };

  return (
    <div className="w-full flex-1 flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8 select-none">
      <div className="relative w-full max-w-2xl bg-white/95 backdrop-blur-2xl rounded-3xl border border-gray-200/80 shadow-[0_24px_70px_rgba(0,0,0,0.08)] p-8 sm:p-12 flex flex-col items-center text-center overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Decorative background glow */}
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-amber-400/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-blue-400/15 rounded-full blur-3xl pointer-events-none" />

        {/* Floating Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-50 border border-amber-200/80 text-amber-700 text-xs font-bold uppercase tracking-wider mb-6 shadow-2xs">
          <Clock className="w-3.5 h-3.5 animate-pulse" />
          <span>শীঘ্রই আসছে • UPCOMING STUDIO</span>
        </div>

        {/* Icon Illustration */}
        <div className="relative mb-6">
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-gradient-to-tr from-amber-500 via-orange-500 to-amber-600 flex items-center justify-center text-white shadow-[0_12px_32px_rgba(217,119,6,0.35)]">
            <Layers className="w-10 h-10 sm:w-12 sm:h-12" />
          </div>
          <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-md">
            <Sparkles className="w-4 h-4" />
          </div>
        </div>

        {/* Main Title */}
        <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight mb-3">
          ফটো কার্ড ও ক্যাটালগ স্টুডিও
        </h2>

        {/* Subtitle / Description */}
        <p className="text-xs sm:text-sm text-gray-600 max-w-lg leading-relaxed mb-8">
          এই স্টুডিওতে প্রিমিয়াম উড বর্ডার, এক্সক্লুসিভ ফ্রেম এবং স্বয়ংক্রিয় প্রোডাক্ট স্পেসিফিকেশন কার্ড তৈরির নতুন ও আধুনিক ইঞ্জিন ডেভেলপ করা হচ্ছে। খুব শীঘ্রই এটি সবার জন্য উন্মুক্ত করা হবে!
        </p>

        {/* Feature Highlights Grid */}
        <div className="w-full grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8 text-left">
          <div className="bg-amber-50/50 border border-amber-100 rounded-2xl p-3.5 flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold text-gray-900">লাক্সারি ফ্রেম</h4>
              <p className="text-[11px] text-gray-500">সেগুন ও রয়্যাল উড বর্ডার</p>
            </div>
          </div>
          <div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-3.5 flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold text-gray-900">স্পেসিফিকেশন কার্ড</h4>
              <p className="text-[11px] text-gray-500">কাঠের ধরণ ও মডেল কোড</p>
            </div>
          </div>
          <div className="bg-emerald-50/50 border border-emerald-100 rounded-2xl p-3.5 flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold text-gray-900">ওয়ারেন্টি সিল</h4>
              <p className="text-[11px] text-gray-500">অফিসিয়াল অথেনটিক স্ট্যাম্প</p>
            </div>
          </div>
        </div>

        {/* Back to Hub Action Button */}
        <button
          type="button"
          onClick={handleBackToHub}
          className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs sm:text-sm rounded-xl shadow-[0_6px_20px_rgba(0,113,227,0.35)] hover:shadow-[0_8px_24px_rgba(0,113,227,0.45)] hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer select-none"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>স্টুডিও হাবে ফিরে যান</span>
        </button>
      </div>
    </div>
  );
}
