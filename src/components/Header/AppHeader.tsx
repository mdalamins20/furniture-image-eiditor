import { useState, useEffect } from 'react';
import { Maximize2, Minimize2, BadgeCheck, Cloud } from 'lucide-react';
import type { AppModuleType } from '../../types';
import { useAuth } from '../../context/AuthContext';

interface AppHeaderProps {
  currentModule?: AppModuleType;
  onSelectModule?: (module: AppModuleType) => void;
  onOpenAuthModal?: () => void;
}

export default function AppHeader({ 
  currentModule = 'hub', 
  onSelectModule,
}: AppHeaderProps) {
  const { user } = useAuth();
  const [isFullscreen, setIsFullscreen] = useState(false);

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

  return (
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

            {/* Muhammad Al-amin - Pro Developer Card */}
            <a
              href="https://mdalamin.web.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2.5 bg-white/90 hover:bg-white px-2.5 py-1.5 rounded-2xl border border-gray-200/80 hover:border-blue-400/80 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_16px_rgba(0,113,227,0.12)] transition-all duration-200 group shrink-0 active:scale-[0.98]"
              title="মুহাম্মদ আল-আলামিনের পোর্টফোলিও দেখুন"
            >
              {/* High-Clarity Squircle Avatar with Pro Gradient Ring */}
              <div className="relative w-9 h-9 p-[1.5px] rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-500 to-sky-400 shadow-xs shrink-0 group-hover:scale-105 transition-transform">
                <div className="w-full h-full rounded-[10px] overflow-hidden bg-white">
                  <img 
                    src="/alamin.png" 
                    alt="Muhammad Al-amin" 
                    className="w-full h-full object-cover object-top select-none"
                    style={{ imageRendering: '-webkit-optimize-contrast' }}
                    loading="eager"
                  />
                </div>
                {/* Active Status Beacon */}
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white shadow-xs" />
              </div>

              {/* Developer Info */}
              <div className="hidden sm:flex flex-col text-left justify-center">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs sm:text-[13px] font-bold text-gray-900 leading-tight group-hover:text-blue-600 transition-colors tracking-tight">
                    মুহাম্মদ আল-আলামিন
                  </span>
                  <BadgeCheck className="w-4 h-4 text-blue-500 fill-blue-50 shrink-0" />
                </div>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="text-[10px] font-semibold text-gray-400 group-hover:text-gray-500 leading-none">
                    Lead Developer
                  </span>
                </div>
              </div>
            </a>
          </div>

        </div>
      </header>
  );
}
