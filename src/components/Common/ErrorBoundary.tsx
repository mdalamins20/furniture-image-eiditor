import React from 'react';

interface Props {
  moduleName: string;
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  message: string;
}

/**
 * One module crashing must not blank the whole studio.
 * This boundary shows a Bengali fallback for that module only.
 */
export default class ErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false, message: '' };

  static getDerivedStateFromError(err: unknown): State {
    return { hasError: true, message: err instanceof Error ? err.message : 'অজানা ত্রুটি' };
  }

  componentDidCatch(err: unknown) {
    console.error(`[${this.props.moduleName}] crashed:`, err);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-white rounded-2xl border border-red-200 p-6 text-center shadow-sm">
            <p className="text-base font-bold text-gray-900 mb-2">এই মডিউলে একটি ত্রুটি হয়েছে</p>
            <p className="text-sm text-gray-600 mb-4">
              {this.props.moduleName} লোড করতে সমস্যা হয়েছে। অন্য মডিউলগুলো ঠিকঠাক কাজ করবে।
            </p>
            <p className="text-xs text-gray-400 break-words mb-4">{this.state.message}</p>
            <button
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold"
              onClick={() => this.setState({ hasError: false, message: '' })}
            >
              আবার চেষ্টা করুন
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
