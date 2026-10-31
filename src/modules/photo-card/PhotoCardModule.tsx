import { useState, useRef, useEffect } from 'react';
import { Upload, Download, Image as ImageIcon, ShieldCheck, Phone, Store, Layers, Sliders, Palette } from 'lucide-react';
import { SHOWROOMS } from '../../types';
import ImageProcessingOverlay from '../../components/Common/ImageProcessingOverlay';

interface CardTemplate {
  id: string;
  name: string;
  desc: string;
  themeColor: string;
  badgeBg: string;
  badgeText: string;
  frameStyle: 'luxury' | 'modern' | 'minimal' | 'catalog';
}

const TEMPLATES: CardTemplate[] = [
  {
    id: 'luxury-wood',
    name: 'লাক্সারি সেগুন ফ্রেম',
    desc: 'স্বর্ণালী বর্ডার ও প্রিমিয়াম উড ফিনিশ',
    themeColor: '#B45309',
    badgeBg: '#D97706',
    badgeText: '#FFFFFF',
    frameStyle: 'luxury'
  },
  {
    id: 'modern-dark',
    name: 'রয়্যাল ডার্ক ক্যাটালগ',
    desc: 'আধুনিক কালো ও গোল্ডেন অ্যাকসেন্ট',
    themeColor: '#18181B',
    badgeBg: '#FFD700',
    badgeText: '#18181B',
    frameStyle: 'catalog'
  },
  {
    id: 'clean-minimal',
    name: 'মডার্ন মিনিমালিস্ট',
    desc: 'পরিচ্ছন্ন মার্জিন ও সফ্ট শ্যাডো কার্ড',
    themeColor: '#0071E3',
    badgeBg: '#0071E3',
    badgeText: '#FFFFFF',
    frameStyle: 'modern'
  },
  {
    id: 'royal-navy',
    name: 'রয়্যাল নেভি এক্সক্লুসিভ',
    desc: 'কর্পোরেট ব্লু ও প্রিমিয়াম ব্যাজ',
    themeColor: '#1E3A8A',
    badgeBg: '#3B82F6',
    badgeText: '#FFFFFF',
    frameStyle: 'minimal'
  }
];

export default function PhotoCardModule() {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<CardTemplate>(TEMPLATES[0]);
  const [productTitle, setProductTitle] = useState('রয়েল ডাইনিং সেট (৬ সিটার)');
  const [material, setMaterial] = useState('১০০% খাঁটি চিটাগাং সেগুন কাঠ');
  const [warranty, setWarranty] = useState('১৫ বছরের সার্ভিস গ্যারান্টি');
  const [productCode, setProductCode] = useState('CODE: RDS-2026');
  const [price, setPrice] = useState('৳ ১,২৫,০০০');
  const [contactNumber, setContactNumber] = useState('');
  const [selectedShowroom, setSelectedShowroom] = useState(SHOWROOMS[0]?.name ?? '');
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStepText, setUploadStepText] = useState('');
  const [uploadFileName, setUploadFileName] = useState('');

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto update contact number when showroom changes
  useEffect(() => {
    const s = SHOWROOMS.find(sh => sh.name === selectedShowroom);
    if (s) {
      setContactNumber(s.numbers.split('\n')[0]);
    }
  }, [selectedShowroom]);

  const processSingleFile = (file: File) => {
    setUploadFileName(file.name);
    setIsProcessing(true);
    setUploadProgress(40);
    setUploadStepText('ফার্নিচারের ছবি লোড ও বিশ্লেষণ হচ্ছে...');
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      setUploadProgress(100);
      setUploadStepText('সব প্রস্তুত! ক্যানভাস সাজানো হচ্ছে...');
      setImageSrc(url);
      setTimeout(() => {
        setIsProcessing(false);
      }, 150);
    };
    img.onerror = () => {
      // Do not keep a broken image: a broken URL used to produce a blank card.
      URL.revokeObjectURL(url);
      setIsProcessing(false);
    };
    img.src = url;
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processSingleFile(file);
    }
  };

  const handleDownload = () => {
    if (!canvasRef.current) return;
    setIsProcessing(true);
    try {
      const canvas = canvasRef.current;
      const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = `PhotoCard_${productCode || 'Furniture'}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } finally {
      setIsProcessing(false);
    }
  };

  // Render high-resolution Photo Card onto canvas
  useEffect(() => {
    if (!canvasRef.current || !imageSrc) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      // Create high-res canvas (1080x1080 standard photo card)
      const W = 1080;
      const H = 1080;
      canvas.width = W;
      canvas.height = H;

      // 1. Background Fill
      ctx.fillStyle = selectedTemplate.themeColor === '#18181B' ? '#121214' : '#F8FAFC';
      ctx.fillRect(0, 0, W, H);

      // 2. Draw Furniture Image with Card Margin
      const margin = 48;
      const cardW = W - margin * 2;
      const cardH = H - 240; // Leave space for bottom card banner
      const cardRadius = 24;

      ctx.save();
      ctx.beginPath();
      ctx.roundRect(margin, margin, cardW, cardH, cardRadius);
      ctx.clip();

      // Cover scaling for image inside card
      const imgRatio = img.width / img.height;
      const targetRatio = cardW / cardH;
      let drawW = cardW;
      let drawH = cardH;
      let offsetX = margin;
      let offsetY = margin;

      if (imgRatio > targetRatio) {
        drawW = cardH * imgRatio;
        offsetX = margin - (drawW - cardW) / 2;
      } else {
        drawH = cardW / imgRatio;
        offsetY = margin - (drawH - cardH) / 2;
      }

      ctx.drawImage(img, offsetX, offsetY, drawW, drawH);
      ctx.restore();

      // 3. Elegant Card Border
      ctx.save();
      ctx.lineWidth = 4;
      ctx.strokeStyle = selectedTemplate.themeColor;
      ctx.beginPath();
      ctx.roundRect(margin, margin, cardW, cardH, cardRadius);
      ctx.stroke();
      ctx.restore();

      // 4. Top-Right Warranty Floating Badge
      if (warranty) {
        ctx.save();
        const badgeX = W - margin - 24;
        const badgeY = margin + 36;
        ctx.font = 'bold 24px "Hind Siliguri", sans-serif';
        const txtWidth = ctx.measureText(warranty).width;
        const bW = txtWidth + 48;
        const bH = 46;

        ctx.fillStyle = selectedTemplate.badgeBg;
        ctx.shadowColor = 'rgba(0,0,0,0.3)';
        ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.roundRect(badgeX - bW, badgeY, bW, bH, 23);
        ctx.fill();

        ctx.shadowColor = 'transparent';
        ctx.fillStyle = selectedTemplate.badgeText;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(warranty, badgeX - bW / 2, badgeY + bH / 2);
        ctx.restore();
      }

      // 5. Bottom Specification Card Plaque
      const plaqueY = H - 210;
      const plaqueH = 170;

      ctx.save();
      ctx.fillStyle = '#FFFFFF';
      ctx.shadowColor = 'rgba(0,0,0,0.12)';
      ctx.shadowBlur = 24;
      ctx.shadowOffsetY = 6;
      ctx.beginPath();
      ctx.roundRect(margin, plaqueY, cardW, plaqueH, 20);
      ctx.fill();
      ctx.restore();

      // Border on plaque
      ctx.save();
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = '#E2E8F0';
      ctx.beginPath();
      ctx.roundRect(margin, plaqueY, cardW, plaqueH, 20);
      ctx.stroke();
      ctx.restore();

      // Plaque Content
      ctx.save();
      // Product Title
      ctx.fillStyle = '#0F172A';
      ctx.font = 'bold 36px "Hind Siliguri", sans-serif';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      ctx.fillText(productTitle, margin + 32, plaqueY + 28);

      // Material & Subtitle
      ctx.fillStyle = '#64748B';
      ctx.font = '500 24px "Hind Siliguri", sans-serif';
      ctx.fillText(material, margin + 32, plaqueY + 80);

      // Code Pill
      ctx.fillStyle = '#F1F5F9';
      const codeW = ctx.measureText(productCode).width + 24;
      ctx.beginPath();
      ctx.roundRect(margin + 32, plaqueY + 120, codeW, 30, 8);
      ctx.fill();
      ctx.fillStyle = '#475569';
      ctx.font = 'bold 16px monospace';
      ctx.fillText(productCode, margin + 44, plaqueY + 126);

      // Price Display (Right aligned)
      if (price) {
        ctx.textAlign = 'right';
        ctx.fillStyle = selectedTemplate.themeColor;
        ctx.font = 'bold 42px "Hind Siliguri", sans-serif';
        ctx.fillText(price, W - margin - 32, plaqueY + 24);
      }

      // Contact & Showroom Pill (Right bottom)
      const hotlineText = `📞 ${contactNumber}`;
      ctx.textAlign = 'right';
      ctx.fillStyle = '#0F172A';
      ctx.font = 'bold 26px "Hind Siliguri", sans-serif';
      ctx.fillText(hotlineText, W - margin - 32, plaqueY + 82);

      // Showroom Name Tag
      ctx.fillStyle = '#64748B';
      ctx.font = '600 20px "Hind Siliguri", sans-serif';
      ctx.fillText(`📍 ${selectedShowroom}`, W - margin - 32, plaqueY + 124);

      ctx.restore();
    };
    img.src = imageSrc;
  }, [imageSrc, selectedTemplate, productTitle, material, warranty, productCode, price, contactNumber, selectedShowroom]);

  return (
    <div className="w-full h-auto lg:h-full bg-[#F5F5F7]/80 flex flex-col lg:flex-row p-1.5 sm:p-3 lg:p-4 gap-3 lg:gap-5 min-h-0">
      {/* LEFT: Controls Sidebar */}
      <div className="w-full lg:w-[380px] xl:w-[420px] bg-white/70 backdrop-blur-2xl rounded-2xl border border-white/60 shadow-[0_12px_36px_-10px_rgba(0,0,0,0.06)] p-3 sm:p-5 flex flex-col gap-3 sm:gap-4 shrink-0 lg:overflow-y-auto custom-scrollbar">
        
        {/* Module Header */}
        <div className="flex items-center gap-3 border-b border-gray-100 pb-3">
          <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-600">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-gray-900 leading-tight">ফটো কার্ড ও টেমপ্লেট স্টুডিও</h2>
            <p className="text-xs text-gray-400 font-medium">ক্যাটালগ ও স্পেসিফিকেশন ফটো কার্ড ডিজাইন</p>
          </div>
        </div>

        {/* 1. Upload Photo */}
        <div className="bg-white/80 p-3.5 rounded-xl border border-gray-200/70 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
              <ImageIcon className="w-3.5 h-3.5 text-blue-600" /> ফার্নিচারের ছবি
            </span>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-2.5 py-1 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg text-xs font-semibold transition-all flex items-center gap-1"
            >
              <Upload className="w-3 h-3" /> আপলোড
            </button>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />
        </div>

        {/* 2. Choose Template */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
            <Palette className="w-3.5 h-3.5 text-amber-600" /> কার্ড টেমপ্লেট স্টাইল
          </label>
          <div className="grid grid-cols-2 gap-2">
            {TEMPLATES.map(tmpl => {
              const isActive = selectedTemplate.id === tmpl.id;
              return (
                <button
                  key={tmpl.id}
                  onClick={() => setSelectedTemplate(tmpl)}
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    isActive
                      ? 'bg-amber-50/70 border-amber-400 ring-2 ring-amber-400/30'
                      : 'bg-white/80 border-gray-200/80 hover:bg-white'
                  }`}
                >
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: tmpl.themeColor }} />
                    <span className="text-xs font-bold text-gray-800 truncate">{tmpl.name}</span>
                  </div>
                  <p className="text-[10px] text-gray-400 leading-tight">{tmpl.desc}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* 3. Product Info Form */}
        <div className="bg-white/80 p-3.5 rounded-xl border border-gray-200/70 space-y-3">
          <label className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
            <Sliders className="w-3.5 h-3.5 text-blue-600" /> কার্ডের তথ্য ও বিবরণী
          </label>

          <div>
            <label className="text-[11px] font-medium text-gray-500">ফার্নিচারের নাম</label>
            <input
              type="text"
              value={productTitle}
              onChange={(e) => setProductTitle(e.target.value)}
              className="w-full mt-1 px-3 py-1.5 text-xs font-semibold bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="text-[11px] font-medium text-gray-500">কাঠের ধরণ / উপাদান</label>
            <input
              type="text"
              value={material}
              onChange={(e) => setMaterial(e.target.value)}
              className="w-full mt-1 px-3 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[11px] font-medium text-gray-500">মূল্য (Price)</label>
              <input
                type="text"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full mt-1 px-3 py-1.5 text-xs font-bold text-amber-700 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="text-[11px] font-medium text-gray-500">মডেল কোড</label>
              <input
                type="text"
                value={productCode}
                onChange={(e) => setProductCode(e.target.value)}
                className="w-full mt-1 px-3 py-1.5 text-xs font-mono bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] font-medium text-gray-500 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-emerald-600" /> ওয়ারেন্টি / গ্যারান্টি ব্যাজ
            </label>
            <input
              type="text"
              value={warranty}
              onChange={(e) => setWarranty(e.target.value)}
              className="w-full mt-1 px-3 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[11px] font-medium text-gray-500 flex items-center gap-1">
                <Store className="w-3 h-3 text-blue-600" /> শোরুম
              </label>
              <select
                value={selectedShowroom}
                onChange={(e) => setSelectedShowroom(e.target.value)}
                className="w-full mt-1 px-2.5 py-1.5 text-xs font-semibold bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-blue-500 cursor-pointer"
              >
                {SHOWROOMS.length === 0 && (
                  <option value="">শোরুম নেই — প্রোফাইলে যোগ করুন</option>
                )}
                {SHOWROOMS.map(s => (
                  <option key={s.name} value={s.name}>{s.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-[11px] font-medium text-gray-500 flex items-center gap-1">
                <Phone className="w-3 h-3 text-emerald-600" /> হটলাইন
              </label>
              <input
                type="text"
                value={contactNumber}
                onChange={(e) => setContactNumber(e.target.value)}
                className="w-full mt-1 px-3 py-1.5 text-xs font-mono bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Download Button */}
        <button
          onClick={handleDownload}
          disabled={isProcessing}
          className="w-full py-3 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white font-bold text-sm rounded-xl shadow-lg shadow-amber-600/25 flex items-center justify-center gap-2 transition-all active:scale-98"
        >
          <Download className="w-4 h-4" />
          {isProcessing ? 'তৈরি হচ্ছে...' : 'ফটো কার্ড ডাউনলোড করুন'}
        </button>
      </div>

      {/* RIGHT: Live Interactive Card Canvas Preview */}
      <div 
        onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
        onDrop={(e) => {
          e.preventDefault();
          e.stopPropagation();
          if (e.dataTransfer.files?.[0]) {
            processSingleFile(e.dataTransfer.files[0]);
          }
        }}
        className="flex-1 min-h-[440px] sm:min-h-[520px] lg:min-h-0 bg-white/60 backdrop-blur-2xl rounded-2xl border border-white/60 shadow-[0_16px_48px_-12px_rgba(0,0,0,0.06)] p-3 sm:p-6 flex flex-col items-center justify-center overflow-hidden"
      >
        <div className="relative max-h-full max-w-full flex items-center justify-center shadow-2xl rounded-2xl overflow-hidden border border-gray-200/80">
          <canvas
            ref={canvasRef}
            className="max-h-[60vh] sm:max-h-[70vh] lg:max-h-[82vh] max-w-full w-auto h-auto object-contain block"
          />
        </div>
      </div>

      {/* Dynamic Image Import & Arranging Animation Overlay */}
      <ImageProcessingOverlay
        isVisible={isProcessing}
        title="ফটো কার্ডের ছবি প্রস্তুত করা হচ্ছে..."
        subtitle={uploadStepText || "ফ্রেম, ব্যানার ও ইনফরমেশন নিখুঁতভাবে সাজানো হচ্ছে"}
        progress={uploadProgress}
        totalImages={1}
        processedCount={uploadProgress >= 100 ? 1 : 0}
        remainingCount={uploadProgress >= 100 ? 0 : 1}
        estimatedSeconds={uploadProgress >= 100 ? 0 : 1}
        currentFileName={uploadFileName || 'ফার্নিচারের ছবি'}
      />
    </div>
  );
}
