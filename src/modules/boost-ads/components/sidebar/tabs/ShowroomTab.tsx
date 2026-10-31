import React, { type RefObject } from 'react';
import { Flame, Phone } from 'lucide-react';
import { SHOWROOMS } from '../../../../../types';
import type { AdImageItem } from '../../../types/boostTypes';

interface ShowroomTabProps {
  activeImage: AdImageItem | null;
  imagesCount: number;
  currentIndex: number;
  activeShowroom: typeof SHOWROOMS[0];
  onUpdateActiveField: (field: 'modelNumber' | 'price' | 'cutPrice', value: string) => void;
  fileInputRef?: RefObject<HTMLInputElement | null>;
  onShowroomNumbersChange?: (numbers: string) => void;
}

export const ShowroomTab: React.FC<ShowroomTabProps> = ({
  activeImage,
  imagesCount,
  currentIndex,
  activeShowroom,
  onUpdateActiveField,
  onShowroomNumbersChange,
}) => {
  return (
    <div className="space-y-4">
      {/* Active Image Inspector Info */}
      {activeImage && (
        <div className="bg-red-50/60 p-3 rounded-xl border border-red-200/60 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-red-900 flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5 text-red-600" /> বর্তমান ছবি ({currentIndex + 1} / {imagesCount})
            </span>
            <span className="text-[10px] font-mono text-gray-500 truncate max-w-[120px]" title={activeImage.name}>
              {activeImage.name}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-1.5">
            <div>
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wide">মডেল (M:-)</label>
              <input
                type="text"
                value={activeImage.modelNumber}
                onChange={(e) => onUpdateActiveField('modelNumber', e.target.value)}
                className="w-full mt-0.5 px-2 py-1 text-xs font-mono font-bold text-blue-700 bg-white border border-gray-200 rounded-lg outline-none focus:border-blue-500 uppercase"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-rose-600 uppercase tracking-wide">কাটা দাম (লাল)</label>
              <input
                type="text"
                value={activeImage.cutPrice || ''}
                onChange={(e) => onUpdateActiveField('cutPrice', e.target.value)}
                placeholder="23,000"
                className="w-full mt-0.5 px-2 py-1 text-xs font-bold text-rose-600 bg-white border border-rose-200 rounded-lg outline-none focus:border-rose-500 line-through"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-emerald-700 uppercase tracking-wide">আসল দাম</label>
              <input
                type="text"
                value={activeImage.price}
                onChange={(e) => onUpdateActiveField('price', e.target.value)}
                className="w-full mt-0.5 px-2 py-1 text-xs font-bold text-emerald-700 bg-white border border-gray-200 rounded-lg outline-none focus:border-emerald-500"
              />
            </div>
          </div>
        </div>
      )}

      {/* Showroom Contact Numbers Card */}
      <div className="bg-gray-50 p-3 rounded-xl border border-gray-200 space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
            <Phone className="w-3.5 h-3.5 text-blue-600" /> শোরুমের মোবাইল নম্বরসমূহ
          </span>
          <span className="text-[10px] font-medium text-gray-400">প্রতি লাইনে ১টি</span>
        </div>

        {onShowroomNumbersChange ? (
          <textarea
            rows={2}
            value={activeShowroom.numbers}
            onChange={(e) => onShowroomNumbersChange(e.target.value)}
            placeholder="01873-728219&#10;01322-631984"
            className="w-full p-2 text-xs font-mono font-bold bg-white border border-gray-200 rounded-lg outline-none focus:border-blue-500 transition-all text-gray-800 resize-none leading-relaxed"
          />
        ) : (
          <div className="space-y-1">
            {activeShowroom.numbers.split('\n').map((num: string, i: number) => (
              <div key={i} className="px-2.5 py-1 bg-white rounded-lg border border-gray-200 font-mono text-xs font-bold text-gray-800 flex items-center justify-between">
                <span>নম্বর {i + 1}:</span>
                <span className="text-blue-700">{num}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
export default ShowroomTab;
