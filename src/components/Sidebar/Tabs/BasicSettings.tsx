import React, { useCallback, useState } from 'react';
import { ImageIcon, Upload, Store } from 'lucide-react';
import { useEditorContext } from '../../../context/EditorContext';
import type { ShowroomItem } from '../../../types';

export default function BasicSettings() {
  const {
    showrooms,
    mainImages,
    handleUpload,
    imageSettings, setImageSettings,
    setSelectedShowroom,
    previewIndex, selectedIndices
  } = useEditorContext();

  const [isDragging, setIsDragging] = useState(false);

  const handleMainImagesUpload = useCallback((e: React.ChangeEvent<HTMLInputElement> | { target: { files: FileList } }) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      if (files.length > 0) {
        handleUpload(files);
      }
    }
    if ('value' in e.target) {
      e.target.value = '';
    }
  }, [handleUpload]);

  const handleShowroomChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    const showroom = showrooms.find((s: ShowroomItem) => s.name === value);
    if (!showroom) return;

    const isAllSelected = selectedIndices.size > 0 && selectedIndices.size === mainImages.length;

    if (isAllSelected) {
      setSelectedShowroom(value);
      const newSettings = imageSettings.map(setting => {
        if (!setting) return setting;
        return {
          ...setting,
          assignedShowroom: showroom,
          numberText: showroom.numbers,
          logoUrl: showroom.logoUrl || (showroom.file ? `/logos/${showroom.file}` : '')
        };
      });
      setImageSettings(newSettings);
    } else {
      if (selectedIndices.size === 0) return;
      const newSettings = [...imageSettings];
      selectedIndices.forEach(idx => {
        if (!newSettings[idx]) newSettings[idx] = {} as any;
        newSettings[idx] = {
          ...newSettings[idx],
          assignedShowroom: showroom,
          numberText: showroom.numbers,
          logoUrl: showroom.logoUrl || (showroom.file ? `/logos/${showroom.file}` : '')
        };
      });
      setImageSettings(newSettings);
      setSelectedShowroom(value);
    }
  }, [selectedIndices, mainImages.length, setSelectedShowroom, imageSettings, setImageSettings, showrooms]);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
      {/* Main Images Upload */}
      <div className="bg-white/60 backdrop-blur-2xl p-6 rounded-xl shadow-[0_4px_24px_rgba(0,0,0,0.04)] border border-white/40 transition-all hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)]">
        <h2 className="text-lg font-medium mb-4 flex items-center gap-3 text-[#1d1d1f]">
          <div className="p-2.5 bg-blue-600 text-white rounded-xl shadow-sm shadow-black/5"><ImageIcon className="w-5 h-5" /></div>
          ফার্নিচারের ছবি আপলোড
        </h2>
        <label 
          className={`flex flex-col items-center justify-center w-full h-40 border-2 border-dashed ${isDragging ? 'border-blue-500 bg-blue-50/90 scale-[1.02]' : 'border-gray-300 bg-[#F5F5F7]/80 hover:border-blue-500 hover:bg-blue-50/50'} rounded-2xl cursor-pointer transition-all group overflow-hidden relative`}
          onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); setIsDragging(true); }}
          onDragLeave={(e) => { e.preventDefault(); e.stopPropagation(); setIsDragging(false); }}
          onDrop={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsDragging(false);
            if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
              handleMainImagesUpload({ target: { files: e.dataTransfer.files } });
            }
          }}
        >
          <div className="absolute inset-0 bg-blue-500/5 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out"></div>
          <div className="flex flex-col items-center justify-center pt-5 pb-6 relative z-10">
            <Upload className="w-10 h-10 text-gray-400 mb-3 group-hover:text-blue-600 transition-colors group-hover:scale-110 duration-300" />
            <p className="text-sm text-gray-700 font-semibold group-hover:text-blue-600 transition-colors">ক্লিক করুন বা ছবি ড্র্যাগ করুন</p>
            <p className="text-xs text-gray-400 mt-2 font-medium">একাধিক ছবি (Multiple images)</p>
          </div>
          <input type="file" multiple accept="image/*" className="hidden" onChange={handleMainImagesUpload} />
        </label>
        {mainImages.length > 0 && <p className="text-sm text-emerald-700 mt-4 font-semibold flex items-center gap-2 bg-emerald-50 px-4 py-3 rounded-xl border border-emerald-100/50 shadow-sm shadow-black/5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span> {mainImages.length} টি ছবি আপলোড করা হয়েছে</p>}
      </div>

      {/* Showroom Selection Dropdown */}
      <div className="bg-white/60 backdrop-blur-2xl p-6 rounded-xl shadow-[0_4px_24px_rgba(0,0,0,0.04)] border border-white/40 transition-all hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] relative overflow-hidden group">
        <div className="absolute top-0 left-0 w-1.5 h-full bg-blue-500 transition-all opacity-80 group-hover:opacity-100"></div>
        <h2 className="text-lg font-medium mb-1 flex items-center gap-3 text-[#1d1d1f] ml-1">
          <div className="p-2.5 bg-blue-600 text-white rounded-xl shadow-sm shadow-black/5"><Store className="w-5 h-5" /></div>
          শোরুম প্রিসেট
        </h2>
        <p className="text-xs text-[#86868b] mb-5 ml-14 font-medium">নাম সিলেক্ট করলে লোগো ও নাম্বার অটো-সেট হবে।</p>
        <div className="flex justify-end mb-2">
          <button
            type="button"
            onClick={() => window.dispatchEvent(new CustomEvent('navigate-module', { detail: 'profile' }))}
            className="text-xs font-bold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 px-2.5 py-1 rounded-lg border border-red-200 transition-colors flex items-center gap-1 cursor-pointer"
          >
            <Store className="w-3.5 h-3.5" />
            <span>+ শোরুম ম্যানেজার (প্রোফাইল)</span>
          </button>
        </div>
        <div className="relative">
          <select
            value={imageSettings[previewIndex]?.assignedShowroom?.name || ""}
            onChange={handleShowroomChange}
            className="w-full px-5 py-4 bg-white border border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none font-semibold cursor-pointer text-gray-700 transition-all appearance-none shadow-sm shadow-black/5 hover:border-blue-400"
            style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'%2364748b\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\'%3E%3C/path%3E%3C/svg%3E")', backgroundPosition: 'right 1rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.2em' }}
          >
            <option value="">-- শোরুম সিলেক্ট করুন --</option>
            {showrooms.map((showroom: ShowroomItem) => (
              <option key={showroom.name} value={showroom.name}>{showroom.name}</option>
            ))}
          </select>
        </div>

      </div>
    </div>
  );
}
