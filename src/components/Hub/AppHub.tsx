import { Sparkles, Layers, Image as ImageIcon, Flame, ArrowRight } from 'lucide-react';
import type { AppModuleType } from '../../types';

interface AppHubProps {
  onSelectModule: (module: AppModuleType) => void;
}

export default function AppHub({ onSelectModule }: AppHubProps) {
  return (
    <div className="w-full h-full flex flex-col items-center justify-between py-6 px-4 sm:px-8 max-w-7xl mx-auto overflow-y-auto custom-scrollbar">
      
      {/* Top Hero Section */}
      <div className="text-center space-y-3 max-w-3xl pt-2 pb-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-700 text-xs font-bold tracking-wide shadow-xs animate-in fade-in duration-300">
          <Sparkles className="w-3.5 h-3.5 text-blue-600 animate-pulse" />
          <span>ফার্নিচার ক্রিয়েটিভ স্যুট • অল-ইন-ওয়ান স্টুডিও</span>
        </div>

        <h1 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 tracking-tight leading-tight">
          কোন ধরণের ডিজাইন নিয়ে <br className="hidden sm:inline" />
          <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-amber-600 bg-clip-text text-transparent">
            কাজ করতে চান?
          </span>
        </h1>

        <p className="text-xs sm:text-sm text-gray-500 font-medium max-w-2xl mx-auto leading-relaxed">
          আপনার কাজের চাহিদা অনুযায়ী নির্দিষ্ট স্টুডিও বেছে নিন — প্রতিদিনের অর্গানিক সোশ্যাল পোস্ট, ক্যাটালগ ফটো কার্ড কিংবা ফেসবুক বুস্টিংয়ের হাই-কনভার্টিং বিজ্ঞাপন।
        </p>
      </div>

      {/* 3 Interactive Luxury Module Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 lg:gap-6 w-full py-4 items-stretch">
        
        {/* Module 1: Daily Post Editor */}
        <div 
          onClick={() => onSelectModule('daily-post')}
          className="group relative bg-white/80 hover:bg-white rounded-3xl p-6 sm:p-7 border border-gray-200/80 hover:border-blue-400 shadow-[0_12px_32px_-12px_rgba(0,0,0,0.06)] hover:shadow-[0_20px_48px_-12px_rgba(0,113,227,0.18)] transition-all duration-300 hover:-translate-y-1.5 flex flex-col justify-between cursor-pointer select-none overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl group-hover:scale-150 transition-transform pointer-events-none" />

          <div>
            <div className="flex items-center justify-between mb-5">
              <div className="w-13 h-13 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/30 group-hover:scale-110 transition-transform">
                <Layers className="w-6.5 h-6.5" />
              </div>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-50 text-blue-600 border border-blue-200/80">
                অর্গানিক ব্র্যান্ডিং
              </span>
            </div>

            <h3 className="text-lg sm:text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors mb-2">
              ডেইলি পোস্ট এডিটর
            </h3>
            
            <p className="text-xs text-gray-500 leading-relaxed font-normal mb-5">
              দৈনন্দিন সোশ্যাল মিডিয়া পোস্টের জন্য আদর্শ। অটোমেটিক এআই ব্যাকগ্রাউন্ড স্পেস ডিটেকশন, ব্র্যান্ড লোগো অ্যাঙ্করিং, কাস্টম নম্বর ব্যাজ ও বাল্ক ডাউনলোড।
            </p>

            {/* Feature Pills */}
            <div className="space-y-2 pt-2 border-t border-gray-100">
              <div className="text-[11px] font-semibold text-gray-700 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                <span>অটো এআই ও লোকাল ভিশন ডিটেকশন</span>
              </div>
              <div className="text-[11px] font-semibold text-gray-700 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                <span>শোরুম ও মোবাইল নম্বর ১-ক্লিকে</span>
              </div>
              <div className="text-[11px] font-semibold text-gray-700 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                <span>ছবি থেকে স্মার্ট কালার প্যালেট তৈরি</span>
              </div>
              <div className="text-[11px] font-semibold text-gray-700 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                <span>ফুল রেজোলিউশন বাল্ক জিপ/ডাউনলোড</span>
              </div>
            </div>
          </div>

          <div className="pt-6 mt-4">
            <button className="w-full py-3 bg-blue-600 group-hover:bg-blue-500 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md shadow-blue-600/25 flex items-center justify-center gap-2 transition-all">
              <span>ডেইলি পোস্ট স্টুডিও খুলুন</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>

        {/* Module 2: Photo Card & Template Studio */}
        <div 
          onClick={() => onSelectModule('photo-card')}
          className="group relative bg-white/80 hover:bg-white rounded-3xl p-6 sm:p-7 border border-gray-200/80 hover:border-amber-400 shadow-[0_12px_32px_-12px_rgba(0,0,0,0.06)] hover:shadow-[0_20px_48px_-12px_rgba(217,119,6,0.18)] transition-all duration-300 hover:-translate-y-1.5 flex flex-col justify-between cursor-pointer select-none overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl group-hover:scale-150 transition-transform pointer-events-none" />

          <div>
            <div className="flex items-center justify-between mb-5">
              <div className="w-13 h-13 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-white shadow-lg shadow-amber-500/30 group-hover:scale-110 transition-transform">
                <ImageIcon className="w-6.5 h-6.5" />
              </div>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200/80">
                ক্যাটালগ ফ্রেম
              </span>
            </div>

            <h3 className="text-lg sm:text-xl font-bold text-gray-900 group-hover:text-amber-700 transition-colors mb-2">
              ফটো কার্ড ও টেমপ্লেট স্টুডিও
            </h3>
            
            <p className="text-xs text-gray-500 leading-relaxed font-normal mb-5">
              আকর্ষণীয় ফটো ফ্রেম এবং প্রোডাক্ট স্পেসিফিকেশন কার্ড ডিজাইন। কাঠের ধরণ, ওয়ারেন্টি সিল, মডেল কোড ও অফার মূল্য সম্বলিত এক্সক্লুসিভ ক্যাটালগ কার্ড।
            </p>

            {/* Feature Pills */}
            <div className="space-y-2 pt-2 border-t border-gray-100">
              <div className="text-[11px] font-semibold text-gray-700 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-600" />
                <span>লাক্সারি সেগুন ও রয়্যাল উড বর্ডার</span>
              </div>
              <div className="text-[11px] font-semibold text-gray-700 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-600" />
                <span>ওয়ারেন্টি ও গ্যারান্টি গোল্ডেন ব্যাজ</span>
              </div>
              <div className="text-[11px] font-semibold text-gray-700 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-600" />
                <span>কাঠের ধরণ ও মডেল কোড প্লাক</span>
              </div>
              <div className="text-[11px] font-semibold text-gray-700 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-600" />
                <span>হাই-রেজোলিউশন ফটো কার্ড ডাউনলোড</span>
              </div>
            </div>
          </div>

          <div className="pt-6 mt-4">
            <button className="w-full py-3 bg-gradient-to-r from-amber-600 to-amber-700 group-hover:from-amber-500 group-hover:to-amber-600 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md shadow-amber-600/25 flex items-center justify-center gap-2 transition-all">
              <span>ফটো কার্ড স্টুডিও খুলুন</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>

        {/* Module 3: Boost & Ads Creative */}
        <div 
          onClick={() => onSelectModule('boost-ads')}
          className="group relative bg-white/80 hover:bg-white rounded-3xl p-6 sm:p-7 border border-gray-200/80 hover:border-red-400 shadow-[0_12px_32px_-12px_rgba(0,0,0,0.06)] hover:shadow-[0_20px_48px_-12px_rgba(220,38,38,0.18)] transition-all duration-300 hover:-translate-y-1.5 flex flex-col justify-between cursor-pointer select-none overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 rounded-full blur-2xl group-hover:scale-150 transition-transform pointer-events-none" />

          <div>
            <div className="flex items-center justify-between mb-5">
              <div className="w-13 h-13 rounded-2xl bg-gradient-to-br from-red-500 to-rose-700 flex items-center justify-center text-white shadow-lg shadow-red-500/30 group-hover:scale-110 transition-transform">
                <Flame className="w-6.5 h-6.5" />
              </div>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-red-50 text-red-600 border border-red-200/80">
                বিজ্ঞাপন স্পেশাল
              </span>
            </div>

            <h3 className="text-lg sm:text-xl font-bold text-gray-900 group-hover:text-red-600 transition-colors mb-2">
              বুস্ট ও অ্যাড ক্রিয়েটিভ
            </h3>
            
            <p className="text-xs text-gray-500 leading-relaxed font-normal mb-5">
              ফেসবুক ও ইনস্টাগ্রাম বুস্টিংয়ের জন্য হাই-কনভার্টিং বিজ্ঞাপন ব্যানার। আকর্ষণীয় ছাড় রিবন, ধামাকা অফার ব্যাজ, ইএমআই সুবিধা এবং স্পষ্ট কল-টু-অ্যাকশন (CTA)।
            </p>

            {/* Feature Pills */}
            <div className="space-y-2 pt-2 border-t border-gray-100">
              <div className="text-[11px] font-semibold text-gray-700 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                <span>টপ আই-ক্যাচিং অফার রিবন ব্যানার</span>
              </div>
              <div className="text-[11px] font-semibold text-gray-700 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                <span>৫০% পর্যন্ত বিশেষ ছাড় ও স্টারবার্স্ট ব্যাজ</span>
              </div>
              <div className="text-[11px] font-semibold text-gray-700 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                <span>কল-টু-অ্যাকশন ও ইনবক্স মেসেজ কলআউট</span>
              </div>
              <div className="text-[11px] font-semibold text-gray-700 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                <span>ক্যাশ অন ডেলিভারি ও ফ্রি শিপিং হাইলাইট</span>
              </div>
            </div>
          </div>

          <div className="pt-6 mt-4">
            <button className="w-full py-3 bg-gradient-to-r from-red-600 to-rose-700 group-hover:from-red-500 group-hover:to-rose-600 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md shadow-red-600/25 flex items-center justify-center gap-2 transition-all">
              <span>বুস্ট অ্যাড স্টুডিও খুলুন</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>

      </div>

      {/* Footer Info */}
      <div className="pt-4 pb-2 text-center text-xs text-gray-400 font-medium">
        <span>ফার্নিচার ব্র্যান্ড স্টুডিও প্রো ২.০ • ডিজাইন ও ডেভেলপ করেছেন </span>
        <a 
          href="https://mdalamin.web.app/" 
          target="_blank" 
          rel="noopener noreferrer" 
          className="text-blue-600 font-bold hover:underline"
        >
          মুহাম্মদ আল-আলামিন
        </a>
      </div>

    </div>
  );
}
