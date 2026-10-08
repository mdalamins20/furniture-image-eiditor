import { Store, Phone, Image, Droplet } from 'lucide-react';
import { useEditorContext } from '../../context/EditorContext';
import SetupInspector from './Tabs/SetupInspector';
import NumberInspector from './Tabs/NumberInspector';
import LogoInspector from './Tabs/LogoInspector';
import WatermarkInspector from './Tabs/WatermarkInspector';

export default function Sidebar() {
  const { activeTab, setActiveTab } = useEditorContext();

  const tabs = [
    { id: 'setup', label: 'শোরুম', icon: Store },
    { id: 'number', label: 'নম্বর', icon: Phone },
    { id: 'logo', label: 'লোগো', icon: Image },
    { id: 'watermark', label: 'জলছাপ', icon: Droplet },
  ];

  // Resolve current active tab
  const resolvedTab = (activeTab === 'basic' ? 'setup' : activeTab === 'design' ? 'number' : activeTab);

  return (
    <div className="w-full lg:w-[340px] xl:w-[370px] 2xl:w-[390px] flex-shrink-0 flex flex-col h-full bg-[#F5F5F7] lg:bg-white/60 lg:backdrop-blur-xl lg:border lg:border-white/50 lg:rounded-[36px] lg:shadow-[0_24px_64px_-12px_rgba(0,0,0,0.05)] lg:p-4 mt-6 lg:mt-0">
      {/* Sticky Tab Header */}
      <div className="sticky top-0 z-20 bg-[#F5F5F7]/95 lg:bg-transparent pt-1 pb-4 px-1 lg:px-0">
        <div className="flex bg-white/90 p-1.5 rounded-2xl shadow-sm border border-gray-200/80 backdrop-blur-xl gap-1.5">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = resolvedTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 px-2 text-xs font-bold rounded-xl transition-all duration-300 ${
                  isActive
                    ? 'bg-gradient-to-b from-blue-500 to-blue-600 text-white shadow-[0_4px_12px_rgba(0,113,227,0.3)] scale-[1.02]'
                    : 'text-gray-500 hover:text-gray-800 hover:bg-gray-100/80 hover:scale-100'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-white' : 'text-gray-400'}`} />
                <span className="truncate tracking-wide">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Inspector Content */}
      <div className="flex-1 overflow-y-auto px-1 pb-20 lg:pb-2 custom-scrollbar">
        {resolvedTab === 'setup' && <SetupInspector />}
        {resolvedTab === 'number' && <NumberInspector />}
        {resolvedTab === 'logo' && <LogoInspector />}
        {resolvedTab === 'watermark' && <WatermarkInspector />}
      </div>
    </div>
  );
}
