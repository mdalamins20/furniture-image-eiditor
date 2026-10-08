import { useState, useEffect } from 'react';
import { Maximize2, Minimize2, Keyboard, Sparkles, X, ExternalLink, BadgeCheck, Command } from 'lucide-react';

interface AppHeaderProps {
  onOpenShortcuts?: () => void;
}

export default function AppHeader({ onOpenShortcuts }: AppHeaderProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showShortcutsModal, setShowShortcutsModal] = useState(false);
  const [time, setTime] = useState(new Date());

  // Live Bengali Digital Clock
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Track Fullscreen state
  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  // Toggle Fullscreen
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
    }
  };

  const timeString = time.toLocaleTimeString('bn-BD', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  });

  const dateString = time.toLocaleDateString('bn-BD', {
    weekday: 'short',
    day: 'numeric',
    month: 'short'
  });

  const handleShortcutClick = () => {
    if (onOpenShortcuts) {
      onOpenShortcuts();
    } else {
      setShowShortcutsModal(true);
    }
  };

  return (
    <>
      <header className="relative z-40 bg-white/85 backdrop-blur-2xl border-b border-gray-200/70 select-none shadow-[0_2px_16px_rgba(0,0,0,0.03)]">
        <div className="w-full px-3 sm:px-6 lg:px-8 py-2 sm:py-2.5 flex items-center justify-between gap-3">
          
          {/* LEFT: Native App Controls & Branding */}
          <div className="flex items-center gap-3 sm:gap-4 shrink-0">
            {/* macOS Style Traffic Light Window Dots */}
            <div className="hidden sm:flex items-center gap-1.5 pr-2 border-r border-gray-200/80">
              <span className="w-3 h-3 rounded-full bg-[#FF5F56] border border-[#E0443E]/60 shadow-inner inline-block" title="Close" />
              <span className="w-3 h-3 rounded-full bg-[#FFBD2E] border border-[#DEA123]/60 shadow-inner inline-block" title="Minimize" />
              <span 
                onClick={toggleFullscreen} 
                className="w-3 h-3 rounded-full bg-[#27C93F] border border-[#1AAB29]/60 shadow-inner inline-block cursor-pointer hover:opacity-80 active:scale-90 transition-transform" 
                title="Fullscreen Toggle" 
              />
            </div>

            {/* App Icon & Name */}
            <div className="flex items-center gap-2.5">
              <div className="relative group">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-white p-0.5 shadow-[0_4px_12px_rgba(0,0,0,0.08)] border border-gray-100 flex items-center justify-center overflow-hidden transition-transform group-hover:scale-105">
                  <img src="/logo.jpg" alt="Logo" className="w-full h-full object-cover rounded-[13px]" />
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-blue-600 rounded-full border-2 border-white flex items-center justify-center">
                  <span className="w-1 h-1 bg-white rounded-full"></span>
                </div>
              </div>

              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <h1 className="text-sm sm:text-base font-bold text-gray-900 tracking-tight leading-none flex items-center gap-1.5">
                    ফার্নিচার <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">ব্র্যান্ড স্টুডিও</span>
                  </h1>
                  <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-600 border border-blue-200/60 shadow-[0_1px_2px_rgba(0,113,227,0.1)]">
                    PRO 2.0
                  </span>
                </div>
                <span className="text-[11px] text-gray-400 font-medium hidden sm:inline-block leading-tight mt-0.5">
                  হাই-স্পিড ফার্নিচার ব্র্যান্ডিং প্ল্যাটফর্ম
                </span>
              </div>
            </div>
          </div>

          {/* CENTER: Dynamic Island / Live Studio Status Pill */}
          <div className="hidden lg:flex items-center gap-2.5 bg-gray-100/70 hover:bg-gray-100 px-3.5 py-1.5 rounded-full border border-gray-200/60 shadow-inner backdrop-blur-md transition-all">
            <div className="flex items-center gap-1.5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-[11px] font-semibold text-gray-700 tracking-wide">সক্রিয় স্টুডিও</span>
            </div>

            <span className="w-[1px] h-3.5 bg-gray-300" />

            {/* Time & Day */}
            <div className="flex items-center gap-2 text-xs font-semibold text-gray-800">
              <span className="font-mono text-gray-900 font-bold">{timeString}</span>
              <span className="text-[11px] text-gray-500 font-medium">({dateString})</span>
            </div>
          </div>

          {/* RIGHT: Quick Utilities & Developer Card */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* Keyboard Shortcuts Trigger Button */}
            <button
              type="button"
              onClick={handleShortcutClick}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-gray-100/80 hover:bg-gray-200/70 text-gray-700 hover:text-gray-900 border border-gray-200/80 text-xs font-semibold shadow-sm transition-all active:scale-95 group"
              title="কিবোর্ড শর্টকাট দেখুন (Ctrl+/)"
            >
              <Keyboard className="w-3.5 h-3.5 text-gray-500 group-hover:text-blue-600 transition-colors" />
              <span className="hidden sm:inline">শর্টকাট</span>
              <kbd className="hidden md:inline-flex items-center gap-0.5 px-1 py-0.2 bg-white rounded text-[10px] font-mono text-gray-400 border border-gray-200">
                <Command className="w-2.5 h-2.5" />/
              </kbd>
            </button>

            {/* Fullscreen Toggle Button */}
            <button
              type="button"
              onClick={toggleFullscreen}
              className="flex items-center justify-center w-8 h-8 rounded-xl bg-gray-100/80 hover:bg-gray-200/70 text-gray-600 hover:text-gray-900 border border-gray-200/80 shadow-sm transition-all active:scale-95"
              title={isFullscreen ? 'ফুলস্ক্রিন বন্ধ করুন' : 'ফুলস্ক্রিন মোড'}
            >
              {isFullscreen ? (
                <Minimize2 className="w-4 h-4 text-blue-600" />
              ) : (
                <Maximize2 className="w-4 h-4" />
              )}
            </button>

            {/* Muhammad Al-amin - Pro Developer Pill */}
            <a
              href="https://mdalamin.web.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2.5 bg-white hover:bg-gray-50 p-1 sm:p-1.5 sm:pr-3.5 rounded-full border border-gray-200 shadow-sm transition-all hover:shadow hover:-translate-y-0.5 group shrink-0"
              title="মুহাম্মদ আল-আলামিনের পোর্টফোলিও দেখুন"
            >
              <div className="relative w-7 h-7 sm:w-8 sm:h-8 rounded-full overflow-hidden border border-gray-200 shadow-inner">
                <img src="/alamin.png" alt="Muhammad Al-amin" className="w-full h-full object-cover rounded-full" />
                <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-emerald-500 ring-1 ring-white" />
              </div>

              <div className="hidden sm:flex flex-col text-left">
                <div className="flex items-center gap-1">
                  <span className="text-xs font-bold text-gray-800 leading-tight group-hover:text-blue-600 transition-colors">
                    মুহাম্মদ আল-আলামিন
                  </span>
                  <BadgeCheck className="w-3.5 h-3.5 text-blue-500 fill-blue-50" />
                </div>
                <span className="text-[10px] text-gray-400 font-medium leading-tight">
                  Lead Developer
                </span>
              </div>

              <ExternalLink className="w-3 h-3 text-gray-400 group-hover:text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity hidden sm:block ml-0.5" />
            </a>
          </div>

        </div>
      </header>

      {/* Keyboard Shortcuts Modal */}
      {showShortcutsModal && (
        <div 
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150"
          onClick={() => setShowShortcutsModal(false)}
        >
          <div 
            className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-gray-200/80 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-900">কিবোর্ড শর্টকাট গাইড</h3>
                  <p className="text-[11px] text-gray-400 font-medium">কাজের গতি দ্বিগুণ করার দরকারি কমান্ড</p>
                </div>
              </div>
              <button 
                onClick={() => setShowShortcutsModal(false)}
                className="w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-gray-50 border border-gray-100">
                <span className="font-medium text-gray-700">পূর্বাবস্থায় ফেরা (Undo)</span>
                <kbd className="px-2 py-1 bg-white rounded-lg border border-gray-200 font-mono text-[11px] font-bold text-gray-800 shadow-sm">
                  Ctrl + Z
                </kbd>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-gray-50 border border-gray-100">
                <span className="font-medium text-gray-700">পুনরায় করা (Redo)</span>
                <kbd className="px-2 py-1 bg-white rounded-lg border border-gray-200 font-mono text-[11px] font-bold text-gray-800 shadow-sm">
                  Ctrl + Y
                </kbd>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-gray-50 border border-gray-100">
                <span className="font-medium text-gray-700">১ পিক্সেল নিখুঁত স্থানান্তর</span>
                <kbd className="px-2 py-1 bg-white rounded-lg border border-gray-200 font-mono text-[11px] font-bold text-gray-800 shadow-sm">
                  ↑ / ↓ / ← / →
                </kbd>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-gray-50 border border-gray-100">
                <span className="font-medium text-gray-700">১০ পিক্সেল দ্রুত স্থানান্তর</span>
                <kbd className="px-2 py-1 bg-white rounded-lg border border-gray-200 font-mono text-[11px] font-bold text-gray-800 shadow-sm">
                  Shift + Arrows
                </kbd>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-gray-50 border border-gray-100">
                <span className="font-medium text-gray-700">ক্যানভাস জুম ইন / আউট</span>
                <span className="px-2 py-1 bg-white rounded-lg border border-gray-200 font-semibold text-[11px] text-gray-600 shadow-sm">
                  মাউস স্ক্রল হুইল
                </span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-gray-50 border border-gray-100">
                <span className="font-medium text-gray-700">অটো ইন্সপেক্ট ও এডিট</span>
                <span className="px-2 py-1 bg-white rounded-lg border border-gray-200 font-semibold text-[11px] text-gray-600 shadow-sm">
                  ক্যানভাসে সরাসরি ক্লিক
                </span>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={() => setShowShortcutsModal(false)}
                className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-md transition-all active:scale-98"
              >
                ঠিক আছে, বুঝেছি
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
