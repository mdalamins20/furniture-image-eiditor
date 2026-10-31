import { useState, useEffect, lazy, Suspense } from 'react';
import ErrorBoundary from './components/Common/ErrorBoundary';
import { ToastProvider } from './components/Common/ToastContext';
import AppHeader from './components/Header/AppHeader';
import AppHub from './components/Hub/AppHub';
// Lazy-loaded: previously every module was bundled into one 1.2 MB chunk.
const DailyPostModule = lazy(() => import('./modules/daily-post/DailyPostModule'));
const PhotoCardModule = lazy(() => import('./modules/photo-card/PhotoCardModule'));
const BoostAdsModule = lazy(() => import('./modules/boost-ads/BoostAdsModule'));
const ProfileModule = lazy(() => import('./modules/profile/ProfileModule'));

import { AuthProvider } from './context/AuthContext';
import { AuthModal } from './components/Auth/AuthModal';
import { subscribeShowrooms } from './services/showroomService';
import { SHOWROOMS, type ShowroomItem, type AppModuleType } from './types';

const ModuleFallback = () => (
  <div className="flex-1 flex items-center justify-center p-6 text-sm text-gray-500">মডিউল লোড হচ্ছে…</div>
);

function AppContent() {
  const [currentModule, setCurrentModule] = useState<AppModuleType>('hub');
  const [, setShowrooms] = useState<ShowroomItem[]>(SHOWROOMS);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  useEffect(() => {
    const unsub = subscribeShowrooms(null, (updated) => {
      setShowrooms(updated);
    });
    return () => unsub();
  }, []);

  // Global module navigation event listener
  useEffect(() => {
    const handleNavigate = (e: Event) => {
      const customEvent = e as CustomEvent<AppModuleType>;
      if (customEvent.detail) {
        setCurrentModule(customEvent.detail);
      }
    };
    window.addEventListener('navigate-module', handleNavigate);
    return () => window.removeEventListener('navigate-module', handleNavigate);
  }, []);

  return (
    <div className="h-screen overflow-hidden bg-[#F5F5F7] flex flex-col font-sans selection:bg-blue-200 selection:text-gray-900">
      {/* Native Desktop Pro App Header with Studio Switcher & Cloud Manager */}
      <AppHeader 
        currentModule={currentModule} 
        onSelectModule={setCurrentModule}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 w-full mx-auto flex flex-col overflow-hidden">
        {currentModule === 'hub' && (
          <div className="flex-1 w-full overflow-y-auto custom-scrollbar p-2 sm:p-4">
            <AppHub onSelectModule={setCurrentModule} />
          </div>
        )}

        {currentModule === 'daily-post' && (
          <div className="flex-1 w-full p-1 sm:p-2 lg:p-4 xl:p-6 flex flex-col overflow-y-auto lg:overflow-hidden custom-scrollbar">
            <ErrorBoundary moduleName="daily-post"><Suspense fallback={<ModuleFallback />}><DailyPostModule /></Suspense></ErrorBoundary>
          </div>
        )}

        {currentModule === 'photo-card' && (
          <div className="flex-1 w-full p-1 sm:p-2 lg:p-4 xl:p-6 flex flex-col overflow-y-auto lg:overflow-hidden custom-scrollbar">
            <ErrorBoundary moduleName="photo-card"><Suspense fallback={<ModuleFallback />}><PhotoCardModule /></Suspense></ErrorBoundary>
          </div>
        )}

        {currentModule === 'boost-ads' && (
          <div className="flex-1 w-full p-1 sm:p-2 lg:p-4 xl:p-6 flex flex-col overflow-y-auto lg:overflow-hidden custom-scrollbar">
            <ErrorBoundary moduleName="boost-ads"><Suspense fallback={<ModuleFallback />}><BoostAdsModule /></Suspense></ErrorBoundary>
          </div>
        )}

        {currentModule === 'profile' && (
          <div className="flex-1 w-full overflow-y-auto custom-scrollbar p-2 sm:p-4">
            <ErrorBoundary moduleName="profile"><Suspense fallback={<ModuleFallback />}><ProfileModule onBackToStudio={(mod) => setCurrentModule(mod || 'hub')} /></Suspense></ErrorBoundary>
          </div>
        )}
      </main>

      {/* Cloud Authentication Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ToastProvider>
  );
}
