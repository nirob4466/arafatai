import React, { useState, useEffect } from 'react';
import type { Theme } from '../types';

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentTheme: Theme;
    themes: Theme[];
    onThemeChange: (theme: Theme) => void;
    geminiApiKey: string;
    onApiKeyChange: (key: string) => void;
}

export default function SettingsModal({ isOpen, onClose, currentTheme, themes, onThemeChange, geminiApiKey, onApiKeyChange }: SettingsModalProps) {
    const [localApiKey, setLocalApiKey] = useState(geminiApiKey);

    useEffect(() => {
        setLocalApiKey(geminiApiKey);
    }, [geminiApiKey]);

    if (!isOpen) return null;

    const handleSave = () => {
        onApiKeyChange(localApiKey);
        onClose();
    };

    return (
        <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4 transition-opacity duration-300"
            onClick={onClose}
        >
            <div 
                className="bg-[#1C1C1E]/80 backdrop-blur-xl border border-white/10 rounded-2xl w-full max-w-md shadow-2xl p-6 sm:p-8"
                onClick={e => e.stopPropagation()}
            >
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-white">Settings</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>

                <div className="space-y-6">
                    {/* Theme Section */}
                    <div>
                        <h3 className="text-sm font-semibold text-gray-400 mb-3">Theme</h3>
                        <div className="bg-black/30 p-4 rounded-xl border border-white/10">
                            <label className="text-base text-white mb-2 block">Accent Color</label>
                            <div className="flex space-x-3">
                                {themes.map(theme => (
                                    <button 
                                        key={theme.id}
                                        onClick={() => onThemeChange(theme)}
                                        className={`w-8 h-8 rounded-full ${theme.color} transition-transform transform hover:scale-110 ${currentTheme.id === theme.id ? 'ring-2 ring-offset-2 ring-offset-black/50 ring-white' : ''}`}
                                        aria-label={`Select ${theme.name} theme`}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* API Keys Section */}
                    <div>
                        <h3 className="text-sm font-semibold text-gray-400 mb-3">API Keys</h3>
                        <div className="bg-black/30 p-4 rounded-xl border border-white/10 space-y-4">
                            <div>
                                <label htmlFor="gemini-key" className="text-base text-white mb-1 block">Gemini API Key</label>
                                <input 
                                    type="password"
                                    id="gemini-key"
                                    value={localApiKey}
                                    onChange={(e) => setLocalApiKey(e.target.value)}
                                    placeholder="Enter your Gemini API key"
                                    className="w-full bg-black/40 border border-white/20 rounded-md p-2.5 focus:ring-2 focus:ring-[var(--color-primary-500)] focus:border-[var(--color-primary-500)] transition"
                                />
                                <p className="text-xs text-gray-500 mt-1.5">Used for the 'Image to Prompt' feature. Your key is saved in your browser's local storage.</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-8 flex justify-end">
                    <button 
                        onClick={handleSave}
                        className="bg-[var(--color-primary-600)] hover:bg-[var(--color-primary-700)] text-white font-bold py-2.5 px-6 rounded-lg transition-colors"
                    >
                        Save & Close
                    </button>
                </div>
            </div>
        </div>
    );
}
