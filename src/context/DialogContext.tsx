import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import InAppDialog, { type InAppDialogProps } from '../components/Common/InAppDialog';

export interface DialogOptions {
  type?: 'warning' | 'error' | 'success' | 'info' | 'folder';
  title: string;
  message: string;
  secondaryMessage?: string;
  confirmText?: string;
  cancelText?: string;
  extraButtonText?: string;
  onExtraButton?: () => void;
}

interface DialogContextType {
  showDialog: (options: DialogOptions) => Promise<boolean>;
  confirmDialog: (options: DialogOptions) => Promise<boolean>;
  closeDialog: () => void;
}

const DialogContext = createContext<DialogContextType | undefined>(undefined);

export const DialogProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [dialogConfig, setDialogConfig] = useState<InAppDialogProps>({
    isOpen: false,
    title: '',
    message: ''
  });

  const [resolver, setResolver] = useState<((val: boolean) => void) | null>(null);

  const closeDialog = useCallback(() => {
    setDialogConfig(prev => ({ ...prev, isOpen: false }));
    if (resolver) {
      resolver(false);
      setResolver(null);
    }
  }, [resolver]);

  const showDialog = useCallback((options: DialogOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      setResolver(() => resolve);
      setDialogConfig({
        isOpen: true,
        type: options.type || 'info',
        title: options.title,
        message: options.message,
        secondaryMessage: options.secondaryMessage,
        confirmText: options.confirmText || 'ঠিক আছে',
        cancelText: options.cancelText,
        extraButtonText: options.extraButtonText,
        onExtraButton: () => {
          if (options.onExtraButton) options.onExtraButton();
          setDialogConfig(prev => ({ ...prev, isOpen: false }));
          resolve(true);
        },
        onConfirm: () => {
          setDialogConfig(prev => ({ ...prev, isOpen: false }));
          resolve(true);
        },
        onCancel: options.cancelText ? () => {
          setDialogConfig(prev => ({ ...prev, isOpen: false }));
          resolve(false);
        } : undefined
      });
    });
  }, []);

  const confirmDialog = useCallback((options: DialogOptions): Promise<boolean> => {
    return showDialog({
      ...options,
      type: options.type || 'warning',
      confirmText: options.confirmText || 'হ্যাঁ, নিশ্চিত',
      cancelText: options.cancelText || 'বাতিল'
    });
  }, [showDialog]);

  // Global custom event listener for non-React contexts or services
  useEffect(() => {
    const handleGlobalDialog = (e: Event) => {
      const customEvent = e as CustomEvent<DialogOptions>;
      if (customEvent.detail) {
        showDialog(customEvent.detail);
      }
    };

    window.addEventListener('app-dialog', handleGlobalDialog);
    return () => window.removeEventListener('app-dialog', handleGlobalDialog);
  }, [showDialog]);

  return (
    <DialogContext.Provider value={{ showDialog, confirmDialog, closeDialog }}>
      {children}
      <InAppDialog {...dialogConfig} />
    </DialogContext.Provider>
  );
};

export const useDialog = () => {
  const context = useContext(DialogContext);
  if (!context) {
    throw new Error('useDialog must be used within a DialogProvider');
  }
  return context;
};

// Global helper to trigger in-app dialog from non-React code (e.g. services)
export const triggerInAppDialog = (options: DialogOptions) => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('app-dialog', { detail: options }));
  }
};

