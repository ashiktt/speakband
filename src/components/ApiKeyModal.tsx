'use client';

import React, { useState, useEffect } from 'react';
import { Key, Eye, EyeOff, Check, X, Sparkles, ExternalLink, CheckCircle2 } from 'lucide-react';
import { StorageService } from '@/lib/storage';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onKeySaved?: () => void;
}

export function ApiKeyModal({ isOpen, onClose, onKeySaved }: ApiKeyModalProps) {
  const [apiKey, setApiKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setApiKey(StorageService.getStoredApiKey());
      setIsSaved(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    StorageService.setStoredApiKey(apiKey.trim());
    setIsSaved(true);
    if (onKeySaved) onKeySaved();
    setTimeout(() => {
      onClose();
    }, 600);
  };

  const handleClear = () => {
    StorageService.setStoredApiKey('');
    setApiKey('');
    setIsSaved(false);
    if (onKeySaved) onKeySaved();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md p-5 sm:p-6 bg-white dark:bg-slate-900 border-t sm:border border-slate-200 dark:border-slate-800 rounded-t-3xl sm:rounded-3xl shadow-2xl space-y-4 sm:space-y-5 text-slate-800 dark:text-slate-100 max-h-[90vh] overflow-y-auto pb-safe">
        {/* Mobile Drag Indicator */}
        <div className="sm:hidden w-12 h-1 bg-slate-300 dark:bg-slate-700 rounded-full mx-auto" />

        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3">
          <div className="p-2.5 sm:p-3 bg-gradient-to-tr from-[#7C3AED] to-[#EC4899] rounded-2xl text-white shadow-md shrink-0">
            <Key className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-bold">Google Gemini API Key</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Power IELTS Speaking evaluation & coaching</p>
          </div>
        </div>

        {/* Server Status Indicator */}
        <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-2xl text-xs space-y-1.5 text-emerald-900 dark:text-emerald-200">
          <div className="flex items-center gap-1.5 font-bold text-emerald-700 dark:text-emerald-300">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Server Gemini Engine Active & Connected</span>
          </div>
          <p className="opacity-90 leading-relaxed text-[11px]">
            SpeakBand includes a server-level Gemini API integration. You can optionally paste your personal Gemini API key below to override server defaults with your own quota.
          </p>
        </div>

        <div className="p-3.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 rounded-2xl text-xs space-y-2">
          <div className="flex items-center gap-1.5 text-[#7C3AED] dark:text-purple-400 font-semibold">
            <Sparkles className="w-4 h-4" />
            <span>Powered by Gemini 3.6 Flash</span>
          </div>
          <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
            Personal keys are stored privately inside your browser&apos;s localStorage and are transmitted securely for real-time speech evaluation.
          </p>
          <a
            href="https://aistudio.google.com/app/apikey"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-[#7C3AED] dark:text-purple-400 hover:underline font-medium pt-1"
          >
            Get a free Gemini API key from Google AI Studio <ExternalLink className="w-3 h-3" />
          </a>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
            Personal API Key (Optional)
          </label>
          <div className="relative">
            <input
              type={showKey ? 'text' : 'password'}
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Paste your Gemini API key (AQ... or AIzaSy...)"
              className="w-full px-4 py-3 pr-12 text-sm bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#7C3AED] dark:focus:ring-purple-400 transition"
            />
            <button
              type="button"
              onClick={() => setShowKey(!showKey)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 cursor-pointer"
              title={showKey ? 'Hide key' : 'Show key'}
            >
              {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3 pt-2">
          {apiKey && (
            <button
              type="button"
              onClick={handleClear}
              className="px-4 py-3 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-2xl transition cursor-pointer"
            >
              Remove
            </button>
          )}

          <button
            type="button"
            onClick={handleSave}
            className="flex-1 py-3 px-4 bg-gradient-to-r from-[#7C3AED] to-[#EC4899] hover:opacity-95 text-white font-bold text-sm rounded-2xl shadow-md shadow-purple-500/25 flex items-center justify-center gap-2 transition cursor-pointer"
          >
            {isSaved ? (
              <>
                <Check className="w-4 h-4 stroke-[3]" />
                <span>Saved!</span>
              </>
            ) : (
              <span>Save Key</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
