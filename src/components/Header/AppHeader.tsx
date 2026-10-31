import { useState, useEffect } from 'react';
import { 
  Maximize2, Minimize2, Keyboard, Sparkles, X, BadgeCheck, 
  Command, Cloud 
} from 'lucide-react';
import type { AppModuleType } from '../../types';
import { useAuth } from '../../context/AuthContext';

interface AppHeaderProps {
  onOpenShortcuts?: () => void;
  currentModule?: AppModuleType;
  onSelectModule?: (module: AppModuleType) => void;
  onOpenAuthModal?: () => void;
}

export default function AppHeader({ 
  onOpenShortcuts, 
  currentModule = 'hub', 
  onSelectModule,
}: AppHeaderProps) {
  const { user } = useAuth();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showShortcutsModal, setShowShortcutsModal] = useState(false);

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

  const handleShortcutClick = () => {
    if (onOpenShortcuts) {
      onOpenShortcuts();
    } else {
      setShowShortcutsModal(true);
    }
  };

  return (
    <>
      <header className="relative z-40 bg-white/90 backdrop-blur-xl border-b border-gray-200/80 select-none shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
        <div className="w-full px-3 sm:px-6 py-2 flex items-center justify-between gap-3">
          
          {/* LEFT: Branding */}
          <div className="flex items-center gap-3 shrink-0">
            <div 
              onClick={() => onSelectModule && onSelectModule('hub')} 
              className="flex items-center gap-2.5 cursor-pointer group"
              title="হোম ড্যাশবোর্ডে ফিরে যান"
            >
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-white p-0.5 shadow-xs border border-gray-200/80 flex items-center justify-center overflow-hidden transition-all group-hover:scale-105 group-hover:shadow-sm">
                <img src="/logo.jpg" alt="Logo" className="w-full h-full object-cover rounded-[10px]" />
              </div>

              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <h1 className="text-sm sm:text-base font-bold text-gray-900 tracking-tight leading-none">
                    ফার্নিচার <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">ব্র্যান্ড স্টুডিও</span>
                  </h1>
                  <span className="inline-flex items-center px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-blue-50 text-blue-600 border border-blue-200/60">
                    PRO
                  </span>
                </div>
                <span className="text-[10.5px] text-gray-400 font-medium hidden sm:inline-block leading-tight mt-0.5">
                  হাই-স্পিড ক্রিয়েটিভ স্যুট
                </span>
              </div>
            </div>
          </div>

          {/* RIGHT: Quick Utilities & Developer Card */}
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
            {/* Profile & Cloud Account Button -> Opens Dedicated Profile Page */}
            <button
              type="button"
              onClick={() => onSelectModule && onSelectModule(currentModule === 'profile' ? 'hub' : 'profile')}
              className={`flex items-center gap-2 p-1 sm:px-2.5 sm:py-1.5 rounded-2xl text-xs font-bold border transition-all active:scale-95 cursor-pointer shadow-2xs ${
                currentModule === 'profile'
                  ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/25 ring-2 ring-blue-300'
                  : user 
                    ? 'bg-white hover:bg-gray-50 text-gray-800 border-gray-200' 
                    : 'bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 text-blue-700 border-blue-200'
              }`}
              title={user ? `${user.displayName || user.email} (প্রোফাইল ড্যাশবোর্ড)` : 'গুগল প্রোফাইল ও ক্লাউড ড্যাশবোর্ড'}
            >
              {user ? (
                <>
                  <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full overflow-hidden border border-gray-200 bg-blue-100 flex items-center justify-center shrink-0">
                    {user.photoURL ? (
                      <img src={user.photoURL} alt={user.displayName || 'User'} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-[11px] font-bold text-blue-700">{user.displayName?.charAt(0) || 'U'}</span>
                    )}
                  </div>
                  <div className="hidden md:flex flex-col text-left">
                    <span className="text-[11px] font-bold leading-tight max-w-[110px] truncate">
                      {user.displayName || user.email?.split('@')[0]}
                    </span>
                    <span className="text-[9px] text-emerald-600 font-semibold leading-tight flex items-center gap-0.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" /> ক্লাউড প্রোফাইল
                    </span>
                  </div>
                </>
              ) : (
                <>
                  <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center">
                    <Cloud className="w-3.5 h-3.5" />
                  </div>
                  <span className="hidden sm:inline font-bold">প্রোফাইল ও ক্লাউড</span>
                </>
              )}
            </button>

            {/* Keyboard Shortcuts Trigger Button - Desktop & Tablet */}
            <button
              type="button"
              onClick={handleShortcutClick}
              className="hidden md:flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-gray-100/80 hover:bg-gray-200/70 text-gray-700 hover:text-gray-900 border border-gray-200/80 text-xs font-semibold shadow-2xs transition-all active:scale-95 cursor-pointer"
              title="কিবোর্ড শর্টকাট দেখুন (Ctrl+/)"
            >
              <Keyboard className="w-3.5 h-3.5 text-gray-500" />
              <span className="hidden lg:inline">শর্টকাট</span>
              <kbd className="hidden xl:inline-flex items-center gap-0.5 px-1 py-0.2 bg-white rounded text-[10px] font-mono text-gray-400 border border-gray-200">
                <Command className="w-2.5 h-2.5" />/
              </kbd>
            </button>

            {/* Fullscreen Toggle Button - Tablet & Desktop */}
            <button
              type="button"
              onClick={toggleFullscreen}
              className="hidden sm:flex items-center justify-center w-8 h-8 rounded-xl bg-gray-100/80 hover:bg-gray-200/70 text-gray-600 hover:text-gray-900 border border-gray-200/80 shadow-2xs transition-all active:scale-95 cursor-pointer"
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
              className="flex items-center gap-2 bg-white hover:bg-gray-50 p-1 sm:pr-3 rounded-full border border-gray-200/90 shadow-2xs transition-all hover:shadow-xs group shrink-0"
              title="মুহাম্মদ আল-আলামিনের পোর্টফোলিও দেখুন"
            >
              <div className="relative w-7 h-7 rounded-full overflow-hidden border border-gray-200 shadow-inner shrink-0">
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
            className="w-full max-w-md bg-white rounded-2xl p-6 shadow-2xl border border-gray-200/80 space-y-4"
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
