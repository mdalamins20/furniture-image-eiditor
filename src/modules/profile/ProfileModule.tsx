import React, { useState, useEffect, useRef } from 'react';
import { 
  Store, Plus, Trash2, Edit2, Upload, Check, Cloud, 
  Phone, Image as ImageIcon, CheckCircle2, ShieldCheck, 
  LogOut, ArrowLeft, RefreshCw, Sparkles, Layers
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useDialog } from '../../context/DialogContext';
import { 
  loadShowrooms, 
  saveCustomShowroom, 
  updateCustomShowroom, 
  deleteCustomShowroom, 
  subscribeShowrooms,
  fileToBase64 
} from '../../services/showroomService';
import type { ShowroomItem, AppModuleType } from '../../types';

interface ProfileModuleProps {
  onBackToStudio: (module?: AppModuleType) => void;
}

export const ProfileModule: React.FC<ProfileModuleProps> = ({ onBackToStudio }) => {
  const { user, signInWithGoogle, signOutUser } = useAuth();
  const { showDialog, confirmDialog } = useDialog();
  const [showrooms, setShowrooms] = useState<ShowroomItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Form states
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [numbers, setNumbers] = useState('');
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Real-time Firestore & LocalStorage subscription
  useEffect(() => {
    setIsLoading(true);
    const unsubscribe = subscribeShowrooms(user?.uid || null, (items) => {
      setShowrooms(items);
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, [user]);

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
    // Smooth scroll to form on mobile
    window.scrollTo({ top: 150, behavior: 'smooth' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    setStatusMessage(null);
    try {
      if (editingId) {
        await updateCustomShowroom(
          editingId, 
          { name, numbers }, 
          logoFile || undefined, 
          user?.uid
        );
        setStatusMessage('শোরুম সফলভাবে আপডেট হয়েছে!');
      } else {
        await saveCustomShowroom(
          { name, numbers }, 
          logoFile || undefined, 
          user?.uid
        );
        setStatusMessage('নতুন শোরুম সফলভাবে ক্লাউডে যুক্ত হয়েছে!');
      }
      resetForm();
      const updated = await loadShowrooms(user?.uid);
      setShowrooms(updated);
      setTimeout(() => setStatusMessage(null), 4000);
    } catch (err) {
      console.error('Failed to save showroom:', err);
      showDialog({
        type: 'error',
        title: 'শোরুম সেভ ব্যর্থ',
        message: 'শোরুম সেভ করতে সমস্যা হয়েছে। দয়া করে আবার চেষ্টা করুন।'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    const confirmed = await confirmDialog({
      type: 'warning',
      title: 'শোরুম মুছে ফেলুন',
      message: 'আপনি কি নিশ্চিতভাবে এই শোরুমটি মুছে ফেলতে চান?',
      confirmText: 'হ্যাঁ, মুছুন',
      cancelText: 'বাতিল'
    });
    if (confirmed) {
      try {
        await deleteCustomShowroom(id, user?.uid);
        if (editingId === id) resetForm();
        const updated = await loadShowrooms(user?.uid);
        setShowrooms(updated);
      } catch (err) {
        console.error('Failed to delete showroom:', err);
      }
    }
  };

  const customShowrooms = showrooms.filter(s => !s.isDefault);
  const defaultShowrooms = showrooms.filter(s => s.isDefault);

  return (
    <div className="w-full space-y-6 max-w-7xl mx-auto pb-32">
      
      {/* Top Navigation & Back Button */}
      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => onBackToStudio('hub')}
          className="px-3.5 py-2 bg-white hover:bg-gray-50 border border-gray-200/80 rounded-2xl text-xs sm:text-sm font-bold text-gray-700 shadow-2xs transition-all flex items-center gap-2 active:scale-95 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 text-gray-500" />
          <span>স্টুডিওতে ফিরে যান</span>
        </button>

        <div className="flex items-center gap-2">
          {user && (
            <button
              type="button"
              onClick={signOutUser}
              className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200/80 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>লগআউট</span>
            </button>
          )}
        </div>
      </div>

      {/* Hero Header Card: Google Profile Info */}
      <div className="bg-white/80 backdrop-blur-xl border border-gray-200/80 rounded-3xl p-5 sm:p-7 shadow-xs relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-5 relative z-10">
          
          <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
            {/* Google Profile Photo or Avatar */}
            <div className="relative group">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-rose-500 p-1 shadow-lg shadow-blue-600/20">
                <div className="w-full h-full bg-white rounded-[22px] overflow-hidden flex items-center justify-center">
                  {user?.photoURL ? (
                    <img 
                      src={user.photoURL} 
                      alt={user.displayName || 'User Profile'} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-blue-50 text-blue-600 flex items-center justify-center text-2xl font-black">
                      {user?.displayName?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || 'U'}
                    </div>
                  )}
                </div>
              </div>
              {user && (
                <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-white p-1 rounded-full ring-2 ring-white shadow-xs" title="ভেরিফাইড অ্যাকাউন্ট">
                  <ShieldCheck className="w-4 h-4" />
                </div>
              )}
            </div>

            {/* Profile Meta Details */}
            <div className="space-y-1">
              <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
                <h2 className="text-lg sm:text-xl font-bold text-gray-900">
                  {user?.displayName || (user ? 'সম্মানিত ফার্নিচার পার্টনার' : 'গেস্ট অ্যাকাউন্ট')}
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200/80 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-blue-600" />
                  {user ? 'Google Verified' : 'Local Mode'}
                </span>
              </div>
              <p className="text-xs font-mono text-gray-500">
                {user?.email || 'গুগল সাইন-ইন ছাড়া লোকাল মেমোরিতে সেভ হচ্ছে'}
              </p>
              <p className="text-xs text-gray-400 mt-1 max-w-md">
                আপনার আপলোড করা সমস্ত শোরুম লোগো সরাসরি গুগল ক্লাউড স্টোরেজে আজীবন সংরক্ষিত থাকবে।
              </p>
            </div>
          </div>

          {/* If NOT Logged in: 1-Click Google Sign In CTA */}
          {!user && (
            <div className="w-full sm:w-auto bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200/70 p-4 rounded-2xl text-center sm:text-right shrink-0 space-y-2">
              <p className="text-xs font-bold text-blue-900">ক্লাউড সিঙ্ক চালু করতে চান?</p>
              <button
                type="button"
                onClick={signInWithGoogle}
                className="w-full sm:w-auto px-4 py-2 bg-white hover:bg-gray-50 text-gray-800 border border-gray-300 rounded-xl text-xs font-bold shadow-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <span>গুগল দিয়ে সাইন-ইন করুন</span>
              </button>
            </div>
          )}

        </div>

        {/* Quick Cloud Stats Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-gray-100">
          <div className="p-3 bg-gray-50/80 rounded-2xl border border-gray-100">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">কাস্টম শোরুম</span>
            <span className="text-base sm:text-lg font-black text-gray-800">{customShowrooms.length} টি</span>
          </div>

          <div className="p-3 bg-gray-50/80 rounded-2xl border border-gray-100">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">লোগো স্টোরেজ</span>
            <span className="text-base sm:text-lg font-black text-blue-600 flex items-center gap-1">
              <Cloud className="w-4 h-4" /> Cloudinary CDN
            </span>
          </div>

          <div className="p-3 bg-gray-50/80 rounded-2xl border border-gray-100">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">ডাটাবেজ সিঙ্ক</span>
            <span className="text-base sm:text-lg font-black text-emerald-600 flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4" /> রিয়েল-টাইম
            </span>
          </div>

          <div className="p-3 bg-gray-50/80 rounded-2xl border border-gray-100">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">সিস্টেম টেমপ্লেট</span>
            <span className="text-base sm:text-lg font-black text-gray-700">{defaultShowrooms.length} টি</span>
          </div>
        </div>
      </div>

      {/* Status Alert Notification */}
      {statusMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-xs font-bold flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* MAIN TWO COLUMNS: Left Form + Right Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT COLUMN: Add or Edit Showroom Card */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-5 sm:p-6 border border-gray-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-red-50 text-red-600 flex items-center justify-center font-bold">
                {editingId ? <Edit2 className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              </div>
              <h3 className="text-sm font-bold text-gray-900">
                {editingId ? 'শোরুম তথ্য আপডেট করুন' : 'নতুন শোরুম / ব্র্যান্ড যোগ করুন'}
              </h3>
            </div>
            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="text-xs text-gray-500 hover:text-red-600 font-bold"
              >
                বাতিল
              </button>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
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
                className="w-full px-3.5 py-2.5 text-xs bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-red-500 focus:bg-white transition-all font-medium"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">
                মোবাইল নম্বরসমূহ (প্রতি লাইনে ১টি) <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={3}
                required
                value={numbers}
                onChange={(e) => setNumbers(e.target.value)}
                placeholder="01873-728219&#10;01322-631984"
                className="w-full px-3.5 py-2.5 text-xs bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-red-500 focus:bg-white transition-all font-mono resize-none leading-relaxed"
              />
            </div>

            {/* Cloud Logo Upload Section */}
            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">
                ব্র্যান্ড লোগো (স্বচ্ছ PNG / হাই-রেজুলেশন)
              </label>
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-gray-300 hover:border-red-400 bg-gray-50/70 hover:bg-red-50/20 rounded-2xl p-4 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2 group"
              >
                {logoPreview ? (
                  <div className="relative group/logo w-full">
                    <img 
                      src={logoPreview} 
                      alt="Logo preview" 
                      className="max-h-20 max-w-full object-contain mx-auto rounded-xl p-1 bg-white border border-gray-200 shadow-2xs"
                    />
                    <span className="text-[11px] text-blue-600 font-bold block mt-1.5 group-hover:underline">
                      লোগো পরিবর্তন করতে ক্লিক করুন
                    </span>
                  </div>
                ) : (
                  <>
                    <div className="w-12 h-12 rounded-2xl bg-white border border-gray-200 text-gray-500 group-hover:text-red-600 flex items-center justify-center transition-colors shadow-2xs">
                      <Upload className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-800">লোগো ফাইল আপলোড করুন</p>
                      <p className="text-[10px] text-gray-400 mt-0.5">Cloudinary CDN-এ সরাসরি হোস্ট হবে</p>
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
              className="w-full py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md shadow-red-600/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50 active:scale-98 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>ক্লাউড স্টোরেজে আপলোড হচ্ছে...</span>
                </>
              ) : (
                <>
                  {editingId ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                  <span>{editingId ? 'পরিবর্তন ক্লাউডে সেভ করুন' : 'শোরুম তৈরি ও ক্লাউডে সেভ করুন'}</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* RIGHT COLUMN: Showrooms Management Cards */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Custom Showrooms Section */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-gray-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <Store className="w-4 h-4 text-blue-600" />
                <h3 className="text-sm font-bold text-gray-900">
                  আপনার ক্লাউড শোরুম ও ব্র্যান্ডসমূহ ({customShowrooms.length})
                </h3>
              </div>
            </div>

            {isLoading ? (
              <div className="py-12 text-center text-gray-400 space-y-2">
                <RefreshCw className="w-6 h-6 animate-spin mx-auto text-blue-600" />
                <p className="text-xs font-semibold">ক্লাউড ডেটা লোড হচ্ছে...</p>
              </div>
            ) : customShowrooms.length === 0 ? (
              <div className="py-12 text-center border-2 border-dashed border-gray-200 rounded-2xl bg-gray-50/50 space-y-2">
                <Store className="w-8 h-8 text-gray-300 mx-auto" />
                <p className="text-xs font-bold text-gray-700">এখনও কোনো কাস্টম শোরুম তৈরি করেননি</p>
                <p className="text-[11px] text-gray-400 max-w-sm mx-auto">
                  বাম পাশের ফর্ম ব্যবহার করে আপনার ব্র্যান্ডের নাম, মোবাইল নম্বর এবং লোগো আপলোড করে সংরক্ষণ করুন।
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {customShowrooms.map(item => (
                  <div
                    key={item.id}
                    className="p-4 rounded-2xl border border-gray-200/90 bg-white hover:border-gray-300 hover:shadow-xs transition-all flex flex-col justify-between gap-3 relative group"
                  >
                    <div className="flex items-start gap-3">
                      {/* Logo Box */}
                      <div className="w-12 h-12 rounded-xl bg-gray-50 border border-gray-200 flex items-center justify-center shrink-0 overflow-hidden p-1 shadow-2xs">
                        {item.logoUrl ? (
                          <img src={item.logoUrl} alt={item.name} className="w-full h-full object-contain" />
                        ) : (
                          <ImageIcon className="w-5 h-5 text-gray-400" />
                        )}
                      </div>

                      {/* Info */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <h4 className="text-xs sm:text-sm font-bold text-gray-900 truncate">{item.name}</h4>
                          <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" title="ক্লাউড অ্যাক্টিভ" />
                        </div>
                        <p className="text-[10.5px] text-gray-500 font-mono truncate mt-1 flex items-center gap-1">
                          <Phone className="w-2.5 h-2.5 text-blue-600" />
                          {item.numbers.split('\n')[0] || 'নম্বর নেই'}
                        </p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                      <span className="text-[9.5px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200/60 flex items-center gap-1">
                        <Cloud className="w-2.5 h-2.5" /> ক্লাউড সিঙ্ক
                      </span>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleStartEdit(item)}
                          className="px-2 py-1 rounded-lg text-xs font-bold text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          <Edit2 className="w-3 h-3" /> এডিট
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(item.id)}
                          className="px-2 py-1 rounded-lg text-xs font-bold text-gray-400 hover:text-rose-600 hover:bg-rose-50 transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          <Trash2 className="w-3 h-3" /> ডিলিট
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Built-in System Templates Section (Collapsible Reference - shown only if enabled) */}
          {defaultShowrooms.length > 0 && (
            <div className="bg-white/60 rounded-3xl p-5 border border-gray-200/80 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-gray-500" />
                  <h4 className="text-xs font-bold text-gray-600 uppercase tracking-wider">
                    সিস্টেম ডিফল্ট শোরুমসমূহ ({defaultShowrooms.length} টি)
                  </h4>
                </div>
                <span className="text-[10px] text-gray-400 font-medium">রেফারেন্স প্রিভিউ</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {defaultShowrooms.map(item => (
                  <div key={item.id} className="p-2.5 rounded-xl border border-gray-200/60 bg-white/70 text-xs font-semibold text-gray-700 truncate">
                    {item.name}
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

      </div>

    </div>
  );
};

export default ProfileModule;
