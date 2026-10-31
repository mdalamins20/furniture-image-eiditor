import React, { useState, useRef } from 'react';
import { 
  X, Store, Plus, Trash2, Edit2, Upload, Check, 
  Cloud, HardDrive, Phone, Image as ImageIcon, CheckCircle2 
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { 
  saveCustomShowroom, 
  updateCustomShowroom, 
  deleteCustomShowroom, 
  fileToBase64 
} from '../../services/showroomService';
import type { ShowroomItem } from '../../types';

interface ShowroomManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  showrooms: ShowroomItem[];
  currentShowroomName: string;
  onSelectShowroom: (showroom: ShowroomItem) => void;
  onShowroomsUpdated: () => void;
}

export const ShowroomManagerModal: React.FC<ShowroomManagerModalProps> = ({
  isOpen,
  onClose,
  showrooms,
  currentShowroomName,
  onSelectShowroom,
  onShowroomsUpdated
}) => {
  const { user, isConfigured } = useAuth();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [numbers, setNumbers] = useState('');
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleLogoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      const preview = await fileToBase64(file);
      setLogoPreview(preview);
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setName('');
    setNumbers('');
    setLogoFile(null);
    setLogoPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleStartEdit = (item: ShowroomItem) => {
    setEditingId(item.id);
    setName(item.name);
    setNumbers(item.numbers);
    setLogoPreview(item.logoUrl || (item.file ? `/logos/${item.file}` : null));
    setLogoFile(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    try {
      if (editingId) {
        await updateCustomShowroom(
          editingId, 
          { name, numbers }, 
          logoFile || undefined, 
          user?.uid
        );
      } else {
        const created = await saveCustomShowroom(
          { name, numbers }, 
          logoFile || undefined, 
          user?.uid
        );
        onSelectShowroom(created);
      }
      resetForm();
      onShowroomsUpdated();
    } catch (err) {
      console.error('Failed to save showroom:', err);
      alert('শোরুম সেভ করতে সমস্যা হয়েছে');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('আপনি কি নিশ্চিতভাবে এই শোরুমটি মুছে ফেলতে চান?')) {
      try {
        await deleteCustomShowroom(id, user?.uid);
        if (editingId === id) resetForm();
        onShowroomsUpdated();
      } catch (err) {
        console.error('Failed to delete showroom:', err);
      }
    }
  };

  const customShowrooms = showrooms.filter(s => !s.isDefault);
  const defaultShowrooms = showrooms.filter(s => s.isDefault);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-red-50 via-rose-50 to-orange-50 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-red-600 text-white flex items-center justify-center shadow-md shadow-red-600/30">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-gray-900">শোরুম ও ব্র্যান্ড ম্যানেজার</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 bg-white border border-gray-200 text-gray-700 shadow-xs">
                  {user && isConfigured ? (
                    <>
                      <Cloud className="w-3 h-3 text-blue-600" />
                      <span>ক্লাউড সিঙ্কড ({user.email?.split('@')[0]})</span>
                    </>
                  ) : (
                    <>
                      <HardDrive className="w-3 h-3 text-emerald-600" />
                      <span>লোকাল স্টোরেজ মোড</span>
                    </>
                  )}
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-0.5">
                আপনার নিজস্ব শোরুমের নাম, মোবাইল নম্বর এবং লোগো যুক্ত বা এডিট করুন
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Main Content: Left Form + Right List */}
        <div className="flex-1 overflow-hidden grid grid-cols-1 lg:grid-cols-12">
          
          {/* Left Form: Add / Edit */}
          <div className="lg:col-span-5 p-5 border-b lg:border-b-0 lg:border-r border-gray-200 bg-gray-50/70 overflow-y-auto custom-scrollbar space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wider flex items-center gap-1.5">
                {editingId ? <Edit2 className="w-3.5 h-3.5 text-blue-600" /> : <Plus className="w-3.5 h-3.5 text-red-600" />}
                {editingId ? 'শোরুম তথ্য এডিট করুন' : 'নতুন শোরুম যোগ করুন'}
              </h4>
              {editingId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="text-[11px] text-gray-500 hover:text-red-600 font-bold"
                >
                  বাতিল
                </button>
              )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">
                  শোরুম বা ব্র্যান্ডের নাম <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="উদাঃ রয়েল ফার্নিচার গ্যালারি"
                  className="w-full px-3 py-2 text-xs bg-white border border-gray-200 rounded-xl outline-none focus:border-red-500 transition-all font-medium"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">
                  মোবাইল নম্বরসমূহ (প্রতি লাইনে ১টি)
                </label>
                <textarea
                  rows={3}
                  value={numbers}
                  onChange={(e) => setNumbers(e.target.value)}
                  placeholder="01873-728219&#10;01322-631984"
                  className="w-full px-3 py-2 text-xs bg-white border border-gray-200 rounded-xl outline-none focus:border-red-500 transition-all font-mono resize-none leading-relaxed"
                />
              </div>

              {/* Logo Upload Box */}
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">
                  ব্র্যান্ডের লোগো (PNG বা স্বচ্ছ ব্যাকগ্রাউন্ড)
                </label>
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-gray-300 hover:border-red-400 bg-white rounded-2xl p-3.5 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2 group"
                >
                  {logoPreview ? (
                    <div className="relative group/logo">
                      <img 
                        src={logoPreview} 
                        alt="Logo preview" 
                        className="max-h-16 max-w-full object-contain mx-auto rounded-lg"
                      />
                      <span className="text-[10px] text-blue-600 font-bold block mt-1">লোগো পরিবর্তন করতে ক্লিক করুন</span>
                    </div>
                  ) : (
                    <>
                      <div className="w-10 h-10 rounded-xl bg-gray-100 group-hover:bg-red-50 text-gray-500 group-hover:text-red-600 flex items-center justify-center transition-colors">
                        <Upload className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-gray-700">লোগো ফাইল নির্বাচন করুন</p>
                        <p className="text-[10px] text-gray-400 mt-0.5">ড্র্যাগ করুন অথবা ক্লিক করুন</p>
                      </div>
                    </>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleLogoSelect}
                    className="hidden"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting || !name.trim()}
                className="w-full py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md shadow-red-600/25 transition-all flex items-center justify-center gap-1.5 disabled:opacity-50 active:scale-98 cursor-pointer"
              >
                {editingId ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                <span>{editingId ? 'পরিবর্তন সেভ করুন' : 'শোরুম তৈরি ও যুক্ত করুন'}</span>
              </button>
            </form>
          </div>

          {/* Right List: Custom Showrooms + System Defaults */}
          <div className="lg:col-span-7 p-5 overflow-y-auto custom-scrollbar space-y-5 bg-white">
            
            {/* Custom Showrooms Section */}
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Store className="w-3.5 h-3.5 text-blue-600" />
                  আপনার তৈরি করা শোরুমসমূহ ({customShowrooms.length})
                </h4>
              </div>

              {customShowrooms.length === 0 ? (
                <div className="p-6 text-center border border-dashed border-gray-200 rounded-2xl bg-gray-50/50 space-y-1.5">
                  <Store className="w-7 h-7 text-gray-300 mx-auto" />
                  <p className="text-xs font-bold text-gray-600">এখনও কোনো কাস্টম শোরুম তৈরি করা হয়নি</p>
                  <p className="text-[11px] text-gray-400">বাম পাশের ফর্ম থেকে আপনার নিজস্ব ফার্নিচার শোরুম যোগ করুন</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {customShowrooms.map(item => {
                    const isSelected = item.name === currentShowroomName;
                    return (
                      <div
                        key={item.id}
                        onClick={() => {
                          onSelectShowroom(item);
                        }}
                        className={`p-3 rounded-2xl border transition-all cursor-pointer relative group flex flex-col justify-between ${
                          isSelected 
                            ? 'border-red-500 bg-red-50/40 shadow-xs ring-1 ring-red-500' 
                            : 'border-gray-200 hover:border-gray-300 bg-white hover:bg-gray-50/60'
                        }`}
                      >
                        <div className="flex items-start gap-2.5">
                          <div className="w-10 h-10 rounded-xl bg-gray-100 border border-gray-200 flex items-center justify-center shrink-0 overflow-hidden p-1">
                            {item.logoUrl ? (
                              <img src={item.logoUrl} alt={item.name} className="w-full h-full object-contain" />
                            ) : (
                              <ImageIcon className="w-4 h-4 text-gray-400" />
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1">
                              <h5 className="text-xs font-bold text-gray-900 truncate">{item.name}</h5>
                              {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-red-600 shrink-0" />}
                            </div>
                            <p className="text-[10px] text-gray-500 font-mono truncate mt-0.5 flex items-center gap-1">
                              <Phone className="w-2.5 h-2.5" />
                              {item.numbers.split('\n')[0] || 'নম্বর দেওয়া নেই'}
                            </p>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center justify-end gap-1.5 mt-2.5 pt-2 border-t border-gray-100">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleStartEdit(item);
                            }}
                            className="p-1 px-2 rounded-lg text-[10px] font-bold text-blue-600 hover:bg-blue-50 transition-colors flex items-center gap-1"
                          >
                            <Edit2 className="w-3 h-3" /> এডিট
                          </button>
                          <button
                            type="button"
                            onClick={(e) => handleDelete(item.id, e)}
                            className="p-1 px-2 rounded-lg text-[10px] font-bold text-rose-600 hover:bg-rose-50 transition-colors flex items-center gap-1"
                          >
                            <Trash2 className="w-3 h-3" /> ডিলিট
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Default System Showrooms Section */}
            <div className="pt-2 border-t border-gray-100">
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                <span>সিস্টেম ডিফল্ট শোরুমসমূহ ({defaultShowrooms.length})</span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {defaultShowrooms.slice(0, 6).map(item => {
                  const isSelected = item.name === currentShowroomName;
                  return (
                    <div
                      key={item.id}
                      onClick={() => onSelectShowroom(item)}
                      className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                        isSelected 
                          ? 'border-red-400 bg-red-50/30' 
                          : 'border-gray-100 hover:border-gray-200 bg-gray-50/50'
                      }`}
                    >
                      <div className="min-w-0 pr-2">
                        <span className="text-xs font-bold text-gray-700 block truncate">{item.name}</span>
                        <span className="text-[10px] text-gray-400 font-mono block truncate">
                          {item.numbers.split('\n')[0]}
                        </span>
                      </div>
                      {isSelected ? (
                        <CheckCircle2 className="w-4 h-4 text-red-600 shrink-0" />
                      ) : (
                        <span className="text-[9px] font-bold text-gray-400 bg-white px-1.5 py-0.5 rounded border border-gray-200 shrink-0">
                          ডিফল্ট
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

