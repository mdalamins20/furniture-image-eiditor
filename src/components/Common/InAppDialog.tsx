import React from 'react';
import { AlertCircle, AlertTriangle, CheckCircle2, FolderDown, Info, ShieldAlert, X } from 'lucide-react';

export interface InAppDialogProps {
  isOpen: boolean;
  type?: 'warning' | 'error' | 'success' | 'info' | 'folder';
  title: string;
  message: string;
  secondaryMessage?: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
  extraButtonText?: string;
  onExtraButton?: () => void;
}

export const InAppDialog: React.FC<InAppDialogProps> = ({
  isOpen,
  type = 'info',
  title,
  message,
  secondaryMessage,
  confirmText = 'ঠিক আছে',
  cancelText,
  onConfirm,
  onCancel,
  extraButtonText,
  onExtraButton
}) => {
  if (!isOpen) return null;

  const getIcon = () => {
    switch (type) {
      case 'warning':
        return (
          <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200/80 flex items-center justify-center text-amber-600 shadow-xs">
            <AlertTriangle className="w-6 h-6 animate-pulse" />
          </div>
        );
      case 'error':
        return (
          <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-200/80 flex items-center justify-center text-rose-600 shadow-xs">
            <AlertCircle className="w-6 h-6" />
          </div>
        );
      case 'success':
        return (
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200/80 flex items-center justify-center text-emerald-600 shadow-xs">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        );
      case 'folder':
        return (
          <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-200/80 flex items-center justify-center text-blue-600 shadow-xs">
            <FolderDown className="w-6 h-6 animate-bounce duration-1000" />
          </div>
        );
      default:
        return (
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-200/80 flex items-center justify-center text-indigo-600 shadow-xs">
            <Info className="w-6 h-6" />
          </div>
        );
    }
  };

  return (
    <div 
      className="fixed inset-0 z-[120] bg-slate-900/40 backdrop-blur-md flex items-center justify-center p-4 select-none animate-in fade-in duration-200"
      onClick={onCancel || onConfirm}
    >
      <div 
        className="relative w-full max-w-md bg-white/98 backdrop-blur-2xl rounded-3xl border border-gray-200/90 shadow-[0_25px_70px_rgba(0,0,0,0.18)] p-6 sm:p-7 flex flex-col items-center text-center overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top colored accent line */}
        <div className={`absolute top-0 left-0 right-0 h-1.5 ${
          type === 'error' ? 'bg-rose-500' :
          type === 'warning' ? 'bg-amber-500' :
          type === 'success' ? 'bg-emerald-500' :
          type === 'folder' ? 'bg-blue-600' : 'bg-indigo-600'
        }`} />

        {/* Close Button */}
        {onCancel && (
          <button
            onClick={onCancel}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-1.5 rounded-full hover:bg-gray-100 transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        {/* Icon */}
        <div className="mb-3.5">
          {getIcon()}
        </div>

        {/* Title */}
        <h3 className="text-base sm:text-lg font-bold text-gray-900 tracking-tight mb-2">
          {title}
        </h3>

        {/* Message */}
        <p className="text-xs sm:text-[13px] text-gray-600 leading-relaxed mb-3 whitespace-pre-line">
          {message}
        </p>

        {/* Secondary Info Box */}
        {secondaryMessage && (
          <div className="w-full bg-blue-50/70 border border-blue-200/60 rounded-2xl p-3 text-left mb-4">
            <div className="flex items-start gap-2">
              <ShieldAlert className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <p className="text-[11px] text-blue-900/90 leading-relaxed font-medium">
                {secondaryMessage}
              </p>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="w-full flex flex-col sm:flex-row items-center gap-2 pt-2">
          {onExtraButton && extraButtonText && (
            <button
              type="button"
              onClick={onExtraButton}
              className="w-full sm:flex-1 py-2.5 px-3.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl transition-all shadow-xs hover:shadow-md cursor-pointer flex items-center justify-center gap-1.5"
            >
              <FolderDown className="w-4 h-4" />
              <span>{extraButtonText}</span>
            </button>
          )}

          {onConfirm && (
            <button
              type="button"
              onClick={onConfirm}
              className={`w-full sm:flex-1 py-2.5 px-3.5 text-xs font-semibold text-white rounded-xl transition-all shadow-xs hover:shadow-md cursor-pointer ${
                type === 'error' ? 'bg-rose-600 hover:bg-rose-500' :
                type === 'warning' ? 'bg-blue-600 hover:bg-blue-500' :
                'bg-blue-600 hover:bg-blue-500'
              }`}
            >
              {confirmText}
            </button>
          )}

          {onCancel && cancelText && (
            <button
              type="button"
              onClick={onCancel}
              className="w-full sm:w-auto py-2.5 px-4 text-xs font-semibold text-gray-600 hover:text-gray-800 bg-gray-100 hover:bg-gray-200/80 rounded-xl transition-all cursor-pointer"
            >
              {cancelText}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default InAppDialog;

