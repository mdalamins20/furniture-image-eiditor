import React from 'react';
import { Keyboard, X } from 'lucide-react';

interface BoostShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BoostShortcutsModal: React.FC<BoostShortcutsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-md bg-white rounded-2xl p-6 shadow-2xl border border-gray-200/80 space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
              <Keyboard className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900">কিবোর্ড শর্টকাট গাইড</h3>
              <p className="text-[11px] text-gray-400 font-medium">বুস্ট ও অ্যাড ক্রিয়েটিভের সুপারফাস্ট কমান্ডসমূহ</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-2 text-xs">
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-gray-50 border border-gray-100">
            <span className="font-medium text-gray-700">উপাদান মুভ / স্থান পরিবর্তন</span>
            <kbd className="px-2 py-1 bg-white rounded-lg border border-gray-200 font-mono text-[11px] font-bold text-gray-800 shadow-sm">
              ↑ / ↓ / ← / →
            </kbd>
          </div>

          <div className="flex items-center justify-between p-2.5 rounded-xl bg-gray-50 border border-gray-100">
            <span className="font-medium text-gray-700">দ্রুত ৫% মুভ</span>
            <kbd className="px-2 py-1 bg-white rounded-lg border border-gray-200 font-mono text-[11px] font-bold text-gray-800 shadow-sm">
              Shift + Arrows
            </kbd>
          </div>

          <div className="flex items-center justify-between p-2.5 rounded-xl bg-gray-50 border border-gray-100">
            <span className="font-medium text-gray-700">আকার বড় / ছোট করা (Resize)</span>
            <kbd className="px-2 py-1 bg-white rounded-lg border border-gray-200 font-mono text-[11px] font-bold text-gray-800 shadow-sm">
              + অথবা -
            </kbd>
          </div>

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
            <span className="font-medium text-gray-700">তথ্য কার্ড সিলেক্ট করা</span>
            <kbd className="px-2 py-1 bg-white rounded-lg border border-gray-200 font-mono text-[11px] font-bold text-gray-800 shadow-sm">
              1 অথবা C
            </kbd>
          </div>

          <div className="flex items-center justify-between p-2.5 rounded-xl bg-gray-50 border border-gray-100">
            <span className="font-medium text-gray-700">লোগো সিলেক্ট করা</span>
            <kbd className="px-2 py-1 bg-white rounded-lg border border-gray-200 font-mono text-[11px] font-bold text-gray-800 shadow-sm">
              2 অথবা L
            </kbd>
          </div>

          <div className="flex items-center justify-between p-2.5 rounded-xl bg-gray-50 border border-gray-100">
            <span className="font-medium text-gray-700">আলাদা আসল দাম ট্যাগ সিলেক্ট করা</span>
            <kbd className="px-2 py-1 bg-white rounded-lg border border-gray-200 font-mono text-[11px] font-bold text-gray-800 shadow-sm">
              3 অথবা P
            </kbd>
          </div>

          <div className="flex items-center justify-between p-2.5 rounded-xl bg-gray-50 border border-gray-100">
            <span className="font-medium text-gray-700">পরবর্তী / পূর্ববর্তী ছবি নেভিগেশন</span>
            <kbd className="px-2 py-1 bg-white rounded-lg border border-gray-200 font-mono text-[11px] font-bold text-gray-800 shadow-sm">
              [ অথবা ]
            </kbd>
          </div>
        </div>

        <div className="pt-2">
          <button
            onClick={onClose}
            className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-md transition-all active:scale-98"
          >
            ঠিক আছে, বুঝেছি
          </button>
        </div>
      </div>
    </div>
  );
};
export default BoostShortcutsModal;
