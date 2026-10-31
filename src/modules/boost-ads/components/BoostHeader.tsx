import React, { type RefObject } from 'react';
import { 
  Store, RefreshCw, Keyboard, Plus, Download, FolderDown 
} from 'lucide-react';
import type { ShowroomItem } from '../../../types';

interface BoostHeaderProps {
  selectedShowroomName: string;
  onSelectShowroom: (name: string) => void;
  activeShowroom: ShowroomItem;
  showrooms: ShowroomItem[];
  onOpenShowroomManager?: () => void;
  startModelInput: string;
  onStartModelInputChange: (val: string) => void;
  onReapplyModelSeries: () => void;
  hasImages: boolean;
  isProcessing: boolean;
  onOpenShortcuts: () => void;
  onDownloadSingle: () => void;
  onDownloadAllZip: () => void;
  fileInputRef: RefObject<HTMLInputElement | null>;
  appendFileInputRef: RefObject<HTMLInputElement | null>;
  onFileUpload: (e: React.ChangeEvent<HTMLInputElement>, isAppend: boolean) => void;
}

export const BoostHeader: React.FC<BoostHeaderProps> = ({
  selectedShowroomName,
  onSelectShowroom,
  activeShowroom,
  showrooms,
  startModelInput,
  onStartModelInputChange,
  onReapplyModelSeries,
  hasImages,
  isProcessing,
  onOpenShortcuts,
  onDownloadSingle,
  onDownloadAllZip,
  fileInputRef,
  appendFileInputRef,
  onFileUpload,
}) => {
  return (
    <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-3 sm:p-4 border border-gray-200/80 shadow-xs flex flex-wrap items-center justify-between gap-3 shrink-0">
      
      {/* Left: Showroom Selector with Logo Preview */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-600">
            <Store className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider block">শোরুম নির্বাচন</span>
              <button
                type="button"
                onClick={() => window.dispatchEvent(new CustomEvent('navigate-module', { detail: 'profile' }))}
                className="text-[9px] font-bold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 px-1.5 py-0.2 rounded border border-red-200 transition-colors cursor-pointer"
                title="কাস্টম শোরুম ও লোগো ম্যানেজ করুন (প্রোফাইল)"
              >
                + ম্যানেজ
              </button>
            </div>
            <select
              value={selectedShowroomName}
              onChange={(e) => onSelectShowroom(e.target.value)}
              className="bg-transparent text-xs sm:text-sm font-bold text-gray-900 outline-none cursor-pointer hover:text-red-600 transition-colors"
            >
              {showrooms.map(s => (
                <option key={s.id || s.name} value={s.name}>{s.name}</option>
              ))}
            </select>
          </div>
        </div>

        {(activeShowroom.logoUrl || activeShowroom.file) && (
          <div className="hidden md:flex items-center gap-2 pl-3 border-l border-gray-200">
            <div className="w-8 h-8 rounded-lg bg-gray-50 border border-gray-200 p-0.5 overflow-hidden flex items-center justify-center">
              <img 
                src={activeShowroom.logoUrl || `/logos/${activeShowroom.file}`} 
                alt="Showroom Logo" 
                className="max-w-full max-h-full object-contain" 
              />
            </div>
            <span className="text-[11px] font-semibold text-gray-600">লোগো সংযুক্ত</span>
          </div>
        )}
      </div>

      {/* Center: Model Auto-Series & Bulk Edit */}
      <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
        <div className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-xl border border-gray-200">
          <span className="text-[11px] font-bold text-gray-500">শুরুর মডেল:</span>
          <input
            type="text"
            value={startModelInput}
            onChange={(e) => onStartModelInputChange(e.target.value)}
            placeholder="e.g. B-100"
            className="w-20 px-2 py-0.5 text-xs font-mono font-bold text-blue-600 bg-white border border-gray-300 rounded-md outline-none focus:border-blue-500 uppercase"
          />
          <button
            onClick={onReapplyModelSeries}
            disabled={!hasImages}
            className="px-2 py-0.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white text-[11px] font-bold rounded-md transition-all flex items-center gap-1"
            title="সব ছবিতে মডেল নম্বর সিরিয়াল করে দিন"
          >
            <RefreshCw className="w-3 h-3" />
            <span>প্রয়োগ</span>
          </button>
        </div>
      </div>

      {/* Right: Upload & Bulk Download Buttons */}
      <div className="flex items-center gap-2">
        {/* Shortcuts Guide Button */}
        <button
          onClick={onOpenShortcuts}
          className="px-2.5 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
          title="শর্টকাট গাইড দেখুন"
        >
          <Keyboard className="w-3.5 h-3.5 text-gray-600" />
          <span className="hidden xl:inline">শর্টকাট</span>
        </button>

        {hasImages && (
          <>
            <button
              onClick={() => appendFileInputRef.current?.click()}
              className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
              title="আরও ছবি যোগ করুন"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden md:inline">আরও ছবি</span>
            </button>

            <button
              onClick={onDownloadSingle}
              disabled={isProcessing}
              className="px-3 py-1.5 bg-white hover:bg-gray-50 border border-gray-200 text-gray-800 rounded-xl text-xs font-bold shadow-xs transition-all flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5 text-blue-600" />
              <span className="hidden sm:inline">বর্তমান ছবি</span>
            </button>

            <button
              onClick={onDownloadAllZip}
              disabled={isProcessing}
              className="px-4 py-1.5 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md shadow-red-600/25 transition-all flex items-center gap-1.5 active:scale-98"
              title={`${activeShowroom.name} ফোল্ডারে সব ছবি মডেল নম্বর দিয়ে সেভ হবে`}
            >
              <FolderDown className="w-4 h-4" />
              <span>সব ছবি সেভ ({activeShowroom.name})</span>
            </button>
          </>
        )}

        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={(e) => onFileUpload(e, false)}
          className="hidden"
        />
        <input
          ref={appendFileInputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={(e) => onFileUpload(e, true)}
          className="hidden"
        />
      </div>

    </div>
  );
};
export default BoostHeader;
