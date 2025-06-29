import React, { useState, useEffect, useCallback, useMemo } from 'react';
import TextToImage from './components/TextToImage';
import ImageToPrompt from './components/ImageToPrompt';
import SettingsModal from './components/SettingsModal';
import { enhancePrompt, generateImageUrl } from './services/pollinations';
import { generatePromptFromImage } from './services/gemini';
import type { Theme } from './types';

type Tab = 'textToImage' | 'imageToPrompt';

const ASPECT_RATIOS: Record<string, { width: number; height: number }> = {
  'Square (1:1)': { width: 1024, height: 1024 },
  'Portrait (2:3)': { width: 683, height: 1024 },
  'Landscape (3:2)': { width: 1024, height: 683 },
  'Widescreen (16:9)': { width: 1024, height: 576 },
  'Tall (9:16)': { width: 576, height: 1024 },
};

const THEMES: Theme[] = [
    { id: 'gold', name: 'Gold', className: '', color: 'bg-yellow-400' },
    { id: 'purple', name: 'Purple', className: 'theme-purple', color: 'bg-purple-500' },
    { id: 'blue', name: 'Blue', className: 'theme-blue', color: 'bg-blue-500' },
    { id: 'green', name: 'Green', className: 'theme-green', color: 'bg-green-500' },
    { id: 'pink', name: 'Pink', className: 'theme-pink', color: 'bg-pink-500' },
];

export default function App() {
    // Shared State
    const [activeTab, setActiveTab] = useState<Tab>('textToImage');
    const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
    const [theme, setTheme] = useState<Theme>(THEMES[0]);
    const [geminiApiKey, setGeminiApiKey] = useState<string>('');

    // TextToImage State
    const [ttiState, setTtiState] = useState({
        prompt: 'A majestic lion in a futuristic city, cinematic lighting, ultra detailed',
        enhancedPrompt: '',
        useEnhanced: false,
        aspectRatio: 'Square (1:1)',
        model: 'flux',
        imageUrls: [] as string[],
        isGenerating: false,
        isEnhancing: false,
        error: null as string | null,
    });
    
    // ImageToPrompt State
    const [itpState, setItpState] = useState({
        imageFile: null as File | null,
        imagePreview: null as string | null,
        generatedPrompt: '',
        isLoading: false,
        error: null as string | null,
    });
    
    // --- Effects for settings and theme ---
    useEffect(() => {
        const savedKey = localStorage.getItem('geminiApiKey');
        if (savedKey) {
            setGeminiApiKey(savedKey);
        }
        const savedThemeId = localStorage.getItem('appTheme') || 'gold';
        const savedTheme = THEMES.find(t => t.id === savedThemeId) || THEMES[0];
        setTheme(savedTheme);
    }, []);

    useEffect(() => {
        document.documentElement.className = theme.className;
        localStorage.setItem('appTheme', theme.id);
    }, [theme]);

    const handleSetGeminiKey = useCallback((key: string) => {
        setGeminiApiKey(key);
        localStorage.setItem('geminiApiKey', key);
    }, []);

    // --- Logic and Handlers for TextToImage ---
    const finalPromptForDisplay = useMemo(() => {
        return ttiState.useEnhanced && ttiState.enhancedPrompt ? ttiState.enhancedPrompt : ttiState.prompt;
    }, [ttiState.prompt, ttiState.enhancedPrompt, ttiState.useEnhanced]);

    const handleTtiEnhance = async () => {
        if (!ttiState.prompt) {
            setTtiState(s => ({ ...s, error: 'Please enter a prompt to enhance.' }));
            return;
        }
        setTtiState(s => ({ ...s, isEnhancing: true, error: null }));
        try {
            const result = await enhancePrompt(ttiState.prompt);
            setTtiState(s => ({ ...s, enhancedPrompt: result, useEnhanced: true }));
        } catch (err) {
            const message = err instanceof Error ? `Failed to enhance prompt: ${err.message}` : 'An unknown error occurred during enhancement.';
            setTtiState(s => ({ ...s, error: message }));
        } finally {
            setTtiState(s => ({ ...s, isEnhancing: false }));
        }
    };
    
    const handleTtiGenerate = () => {
        if (!finalPromptForDisplay) {
            setTtiState(s => ({ ...s, error: 'Please enter a prompt to generate an image.' }));
            return;
        }
        
        setTtiState(s => ({ ...s, isGenerating: true, error: null, imageUrls: [] }));

        const { width, height } = ASPECT_RATIOS[ttiState.aspectRatio];
        const activeModel = ttiState.model;
        
        const url1 = generateImageUrl(finalPromptForDisplay, activeModel, width, height);
        const url2 = generateImageUrl(finalPromptForDisplay, activeModel, width, height);
        
        setTtiState(s => ({ ...s, imageUrls: [url1, url2] }));
    };

    // --- Logic and Handlers for ImageToPrompt ---
    const handleItpFileChange = (file: File | null) => {
        if (file) {
            if (file.size > 4 * 1024 * 1024) { // 4MB limit
                setItpState(s => ({...s, error: "Image size cannot exceed 4MB."}));
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => {
                setItpState(s => ({...s, imageFile: file, imagePreview: reader.result as string, error: null, generatedPrompt: '' }));
            };
            reader.readAsDataURL(file);
        }
    };
    
    const handleItpGenerate = async () => {
        if (!itpState.imageFile) {
            setItpState(s => ({...s, error: 'Please upload an image first.'}));
            return;
        }
        if (!geminiApiKey) {
            setItpState(s => ({...s, error: 'Gemini API Key is not set. Please add it in the settings.'}));
            setIsSettingsOpen(true);
            return;
        }
        setItpState(s => ({...s, isLoading: true, error: null, generatedPrompt: ''}));
        try {
            const prompt = await generatePromptFromImage(itpState.imageFile, geminiApiKey);
            setItpState(s => ({...s, generatedPrompt: prompt}));
        } catch (err) {
            const message = err instanceof Error ? err.message : 'An unknown error occurred.';
            setItpState(s => ({...s, error: message}));
        } finally {
            setItpState(s => ({...s, isLoading: false}));
        }
    };

    return (
        <div 
          className="min-h-screen text-gray-200 font-sans bg-cover bg-center bg-fixed"
          style={{ 
            backgroundImage: 'url(https://iili.io/FRZICoN.jpg)',
            backgroundColor: '#1a1a1a' 
          }}
        >
          <div className="bg-black/50 min-h-screen backdrop-blur-sm">
            <header className="absolute top-0 left-0 right-0 p-6 flex justify-end items-center z-20">
                <button 
                  onClick={() => setIsSettingsOpen(true)}
                  className="p-2 rounded-full bg-black/30 backdrop-blur-md border border-white/20 hover:bg-black/50 transition-colors"
                  aria-label="Open settings"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                </button>
            </header>
            
            <main className="max-w-7xl mx-auto pt-28 pb-16 px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-10">
                    <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-wide">Arafat Imagen <span className="text-3xl font-semibold opacity-80">V8.5</span></h1>
                </div>
                
                <div className="flex justify-center mb-8">
                    <div className="bg-black/30 backdrop-blur-lg border border-white/10 p-1.5 rounded-xl flex items-center space-x-2">
                        <button onClick={() => setActiveTab('textToImage')} className={`px-6 py-2.5 text-sm font-semibold rounded-lg transition-colors ${activeTab === 'textToImage' ? 'bg-[var(--color-primary-600)] text-white shadow-lg' : 'text-gray-300 hover:bg-white/10'}`}>
                            Text to Image
                        </button>
                        <button onClick={() => setActiveTab('imageToPrompt')} className={`px-6 py-2.5 text-sm font-semibold rounded-lg transition-colors ${activeTab === 'imageToPrompt' ? 'bg-[var(--color-primary-600)] text-white shadow-lg' : 'text-gray-300 hover:bg-white/10'}`}>
                            Image to Prompt
                        </button>
                    </div>
                </div>

                {activeTab === 'textToImage' && (
                    <TextToImage
                        state={ttiState}
                        setState={setTtiState}
                        finalPrompt={finalPromptForDisplay}
                        onEnhance={handleTtiEnhance}
                        onGenerate={handleTtiGenerate}
                        aspectRatios={ASPECT_RATIOS}
                    />
                )}
                {activeTab === 'imageToPrompt' && (
                    <ImageToPrompt
                        state={itpState}
                        setState={setItpState}
                        onFileChange={handleItpFileChange}
                        onGenerate={handleItpGenerate}
                    />
                )}

            </main>
            
            <footer className="absolute bottom-0 left-0 right-0 p-4 text-center text-gray-400 text-xs">
              <p>Arafat Imagen V8.5 &copy; 2024. Powered by Arafat AI.</p>
            </footer>

            <SettingsModal 
                isOpen={isSettingsOpen}
                onClose={() => setIsSettingsOpen(false)}
                currentTheme={theme}
                themes={THEMES}
                onThemeChange={setTheme}
                geminiApiKey={geminiApiKey}
                onApiKeyChange={handleSetGeminiKey}
            />
          </div>
        </div>
    );
}