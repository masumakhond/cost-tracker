'use client';

import React, { useState, useEffect } from 'react';
import { Smartphone, Download, Share, MoreVertical, PlusSquare, X, CheckCircle2 } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export function InstallAppBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showGuideModal, setShowGuideModal] = useState(false);

  useEffect(() => {
    // Detect if already installed/running in standalone mode
    const standaloneMode =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;
    setIsStandalone(standaloneMode);

    // Detect iOS
    const ua = window.navigator.userAgent.toLowerCase();
    const isAppleDevice = /iphone|ipad|ipod/.test(ua);
    setIsIOS(isAppleDevice);

    // Check if dismissed previously in session
    if (sessionStorage.getItem('dismiss_cost_tracker_pwa_banner')) {
      setIsDismissed(true);
    }

    // Capture Android/Chrome install prompt
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setIsStandalone(true);
      setDeferredPrompt(null);
    };

    const handleOpenCustom = () => {
      if (deferredPrompt) {
        deferredPrompt.prompt();
      } else {
        setShowGuideModal(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    window.addEventListener('appinstalled', handleAppInstalled);
    window.addEventListener('open-install-guide', handleOpenCustom);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('appinstalled', handleAppInstalled);
      window.removeEventListener('open-install-guide', handleOpenCustom);
    };
  }, [deferredPrompt]);

  const handleDismiss = () => {
    setIsDismissed(true);
    sessionStorage.setItem('dismiss_cost_tracker_pwa_banner', 'true');
  };

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        setIsDismissed(true);
      }
      setDeferredPrompt(null);
    } else {
      setShowGuideModal(true);
    }
  };

  // If already installed as standalone PWA, don't show prompt
  if (isStandalone) {
    return null;
  }

  return (
    <>
      {/* Sleek Mobile PWA Install Banner */}
      {!isDismissed && (
        <div className="relative overflow-hidden rounded-2xl border border-teal-200 bg-gradient-to-r from-teal-600 via-teal-700 to-emerald-700 p-3 text-white shadow-md">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-white/20 text-white backdrop-blur-xs">
                <Smartphone size={22} />
              </div>
              <div>
                <p className="text-xs font-bold leading-tight tracking-wide">
                  Install Cost Tracker App
                </p>
                <p className="text-[11px] text-teal-100 leading-tight mt-0.5">
                  Add to home screen for fast 1-tap full-screen access
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 flex-shrink-0">
              <button
                type="button"
                onClick={handleInstallClick}
                className="flex items-center gap-1 rounded-xl bg-white px-3 py-1.5 text-xs font-bold text-teal-800 shadow-sm transition hover:bg-teal-50 active:scale-95"
              >
                <Download size={14} className="text-teal-700" />
                <span>Install</span>
              </button>
              <button
                type="button"
                onClick={handleDismiss}
                className="rounded-lg p-1 text-teal-200 hover:bg-white/10 hover:text-white transition active:scale-90"
                title="Dismiss"
              >
                <X size={16} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Installation Instruction Modal (for iOS or browsers without native trigger) */}
      {showGuideModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative w-full max-w-sm rounded-3xl bg-white p-5 shadow-2xl border border-slate-100">
            <button
              type="button"
              onClick={() => setShowGuideModal(false)}
              className="absolute right-4 top-4 rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
            >
              <X size={18} />
            </button>

            <div className="text-center mb-4">
              <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-100 text-teal-700">
                <Smartphone size={26} />
              </div>
              <h3 className="text-base font-bold text-slate-800">
                Install as Mobile App
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Install Cost Tracker directly onto your mobile home screen
              </p>
            </div>

            {isIOS ? (
              /* iOS Safari Instructions */
              <div className="space-y-3 rounded-2xl bg-slate-50 p-3.5 border border-slate-100">
                <p className="text-xs font-bold text-teal-800">Apple iPhone / iPad (Safari):</p>
                <div className="space-y-2 text-xs text-slate-700">
                  <div className="flex items-start gap-2.5">
                    <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-teal-600 text-[10px] font-bold text-white">
                      1
                    </span>
                    <p>
                      Tap the <strong>Share</strong> button <Share size={13} className="inline text-teal-600 mx-0.5" /> at the bottom bar of Safari.
                    </p>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-teal-600 text-[10px] font-bold text-white">
                      2
                    </span>
                    <p>
                      Scroll down and tap <strong>&ldquo;Add to Home Screen&rdquo;</strong> <PlusSquare size={13} className="inline text-teal-600 mx-0.5" /> (হোম স্ক্রিনে যোগ করুন).
                    </p>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-teal-600 text-[10px] font-bold text-white">
                      3
                    </span>
                    <p>
                      Tap <strong>Add</strong> in the top-right corner.
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              /* Android Chrome Instructions */
              <div className="space-y-3 rounded-2xl bg-slate-50 p-3.5 border border-slate-100">
                <p className="text-xs font-bold text-teal-800">Android (Chrome / Brave):</p>
                <div className="space-y-2 text-xs text-slate-700">
                  <div className="flex items-start gap-2.5">
                    <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-teal-600 text-[10px] font-bold text-white">
                      1
                    </span>
                    <p>
                      Tap the <strong>three dots menu (⋮)</strong> <MoreVertical size={13} className="inline text-teal-600 mx-0.5" /> at the top right of Chrome.
                    </p>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-teal-600 text-[10px] font-bold text-white">
                      2
                    </span>
                    <p>
                      Tap <strong>&ldquo;Install App&rdquo;</strong> or <strong>&ldquo;Add to Home screen&rdquo;</strong>.
                    </p>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-teal-600 text-[10px] font-bold text-white">
                      3
                    </span>
                    <p>
                      Tap <strong>Install</strong> to confirm.
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="mt-4 flex items-center justify-center gap-1.5 text-[11px] text-teal-700 font-medium">
              <CheckCircle2 size={14} className="text-teal-600" />
              <span>Full screen app with zero browser URL bars!</span>
            </div>

            <button
              type="button"
              onClick={() => setShowGuideModal(false)}
              className="mt-4 w-full rounded-xl bg-teal-600 py-2.5 text-xs font-bold text-white shadow-md shadow-teal-600/25 transition hover:bg-teal-700 active:scale-98"
            >
              Got It
            </button>
          </div>
        </div>
      )}
    </>
  );
}
