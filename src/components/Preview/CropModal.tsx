import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import ReactCrop, { type Crop, type PixelCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { X, Check, Monitor, Smartphone, Square, Move } from 'lucide-react';

interface CropModalProps {
  imageUrl: string;
  onClose: () => void;
  onSave: (croppedBlob: Blob) => void;
}

export default function CropModal({ imageUrl, onClose, onSave }: CropModalProps) {
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [aspect, setAspect] = useState<number | undefined>(undefined);
  const imageRef = useRef<HTMLImageElement>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  const handleSave = async () => {
    if (!completedCrop || !imageRef.current || completedCrop.width === 0 || completedCrop.height === 0) {
      onClose();
      return;
    }

    setIsProcessing(true);
    try {
      const image = imageRef.current;
      const canvas = document.createElement('canvas');
      const scaleX = image.naturalWidth / image.width;
      const scaleY = image.naturalHeight / image.height;
      
      canvas.width = completedCrop.width * scaleX;
      canvas.height = completedCrop.height * scaleY;
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        throw new Error('No 2d context');
      }

      ctx.imageSmoothingQuality = 'high';

      const cropX = completedCrop.x * scaleX;
      const cropY = completedCrop.y * scaleY;
      const cropWidth = completedCrop.width * scaleX;
      const cropHeight = completedCrop.height * scaleY;

      ctx.drawImage(
        image,
        cropX,
        cropY,
        cropWidth,
        cropHeight,
        0,
        0,
        canvas.width,
        canvas.height
      );

      canvas.toBlob((blob) => {
        if (blob) {
          onSave(blob);
        }
        setIsProcessing(false);
      }, 'image/jpeg', 1); // Use jpeg with high quality
    } catch (e) {
      console.error('Crop error', e);
      setIsProcessing(false);
      onClose();
    }
  };

  const handleAspectChange = (newAspect: number | undefined) => {
    setAspect(newAspect);
    
    if (newAspect && imageRef.current) {
      const { width, height } = imageRef.current;
      // Auto generate a centered crop based on the new aspect
      let cropWidth, cropHeight;
      if (width / height > newAspect) {
        cropHeight = height * 0.9;
        cropWidth = cropHeight * newAspect;
      } else {
        cropWidth = width * 0.9;
        cropHeight = cropWidth / newAspect;
      }
      
      const newCrop: PixelCrop = {
        unit: 'px',
        width: cropWidth,
        height: cropHeight,
        x: (width - cropWidth) / 2,
        y: (height - cropHeight) / 2,
      };
      setCrop(newCrop);
      setCompletedCrop(newCrop);
    } else if (!newAspect && imageRef.current) {
      const { width, height } = imageRef.current;
      const newCrop: PixelCrop = { unit: 'px', width, height, x: 0, y: 0 };
      setCrop(newCrop);
      setCompletedCrop(newCrop);
    }
  };

  if (!mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-8 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-neutral-900 flex flex-col rounded-2xl overflow-hidden w-full max-w-6xl max-h-[95vh] shadow-2xl ring-1 ring-white/10">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-neutral-800/50 shrink-0">
          <h3 className="text-lg font-medium text-white tracking-tight">ছবি ক্রপ করুন</h3>
          <button 
            onClick={onClose}
            className="p-2 text-neutral-400 hover:text-white hover:bg-white/10 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Editor Area */}
        <div className="flex-1 overflow-hidden p-4 sm:p-6 flex items-center justify-center min-h-0 bg-neutral-950/30">
          <div className="w-full h-full flex items-center justify-center overflow-hidden">
          <ReactCrop
            crop={crop}
            aspect={aspect}
            onChange={(_, percentCrop) => setCrop(percentCrop)}
            onComplete={(c) => setCompletedCrop(c)}
            className="flex items-center justify-center max-w-full max-h-full"
            ruleOfThirds
          >
            <img 
              ref={imageRef} 
              src={imageUrl} 
              alt="Crop preview" 
              className="object-contain shadow-2xl rounded-sm"
              style={{ maxHeight: 'calc(95vh - 150px)', maxWidth: '100%' }}
              onLoad={(e) => {
                 // Auto initialize full crop
                 const { width, height } = e.currentTarget;
                 const initialCrop: PixelCrop = { unit: 'px', width, height, x: 0, y: 0 };
                 setCrop(initialCrop);
                 setCompletedCrop(initialCrop);
              }}
            />
          </ReactCrop>
        </div>
      </div>

      {/* Footer / Controls */}
      <div className="shrink-0 flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 border-t border-white/10 bg-neutral-950/80">
        
        {/* Presets */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0 hide-scrollbar w-full sm:w-auto">
          <button
            onClick={() => handleAspectChange(undefined)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${!aspect ? 'bg-blue-600 text-white' : 'bg-white/5 text-neutral-300 hover:bg-white/10 hover:text-white'}`}
          >
            <Move className="w-4 h-4" /> ফ্রি
          </button>
          <button
            onClick={() => handleAspectChange(1)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${aspect === 1 ? 'bg-blue-600 text-white' : 'bg-white/5 text-neutral-300 hover:bg-white/10 hover:text-white'}`}
          >
            <Square className="w-4 h-4" /> ১:১ (স্কয়ার)
          </button>
          <button
            onClick={() => handleAspectChange(4/3)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${aspect === 4/3 ? 'bg-blue-600 text-white' : 'bg-white/5 text-neutral-300 hover:bg-white/10 hover:text-white'}`}
          >
            <Monitor className="w-4 h-4" /> ৪:৩
          </button>
          <button
            onClick={() => handleAspectChange(16/9)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${aspect === 16/9 ? 'bg-blue-600 text-white' : 'bg-white/5 text-neutral-300 hover:bg-white/10 hover:text-white'}`}
          >
            <Monitor className="w-4 h-4" /> ১৬:৯ (ওয়াইড)
          </button>
          <button
            onClick={() => handleAspectChange(9/16)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${aspect === 9/16 ? 'bg-blue-600 text-white' : 'bg-white/5 text-neutral-300 hover:bg-white/10 hover:text-white'}`}
          >
            <Smartphone className="w-4 h-4" /> ৯:১৬ (স্টোরি)
          </button>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 w-full sm:w-auto shrink-0 justify-end mt-2 sm:mt-0">
          <button
            onClick={onClose}
            className="px-6 py-2.5 text-sm font-semibold text-neutral-300 hover:text-white bg-transparent hover:bg-white/10 rounded-xl transition-colors"
          >
            বাতিল
          </button>
          <button
            onClick={handleSave}
            disabled={isProcessing || !completedCrop?.width}
            className="flex items-center justify-center gap-2 px-8 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-xl shadow-lg transition-all active:scale-95 disabled:opacity-50 disabled:active:scale-100"
          >
            {isProcessing ? 'ক্রপ হচ্ছে...' : (
              <>
                <Check className="w-4 h-4" strokeWidth={3} />
                সেভ করুন
              </>
            )}
          </button>
        </div>
      </div>
      
    </div>
    </div>,
    document.body
  );
}
