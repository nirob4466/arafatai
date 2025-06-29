import React from 'react';
import ImageDisplay from './ImageDisplay';
import { Spinner } from './Spinner';

type TtiState = {
    prompt: string;
    enhancedPrompt: string;
    useEnhanced: boolean;
    aspectRatio: string;
    model: string;
    imageUrls: string[];
    isGenerating: boolean;
    isEnhancing: boolean;
    error: string | null;
};

interface TextToImageProps {
    state: TtiState;
    setState: React.Dispatch<React.SetStateAction<TtiState>>;
    finalPrompt: string;
    onEnhance: () => void;
    onGenerate: () => void;
    aspectRatios: Record<string, { width: number; height: number }>;
}

export default function TextToImage({ state, setState, finalPrompt, onEnhance, onGenerate, aspectRatios }: TextToImageProps) {
    
    const { 
        prompt, enhancedPrompt, useEnhanced, aspectRatio,
        imageUrls, isGenerating, isEnhancing, error 
    } = state;
    
    const { width, height } = aspectRatios[aspectRatio];

    const setError = (err: string | null) => setState(s => ({ ...s, error: err }));
    const setIsGenerating = (gen: boolean) => setState(s => ({...s, isGenerating: gen}));

    return (
        <>
            {error && (
                <div className="bg-red-900/50 backdrop-blur-md border border-red-500/50 text-red-200 px-4 py-3 rounded-lg relative mb-6 max-w-4xl mx-auto" role="alert">
                    <strong className="font-bold">Error: </strong>
                    <span className="block sm:inline">{error}</span>
                    <button onClick={() => setError(null)} className="absolute top-0 bottom-0 right-0 px-4 py-3 text-red-200" aria-label="Close error">
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" fillRule="evenodd"></path></svg>
                    </button>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                <div className="lg:col-span-2 flex flex-col space-y-6 bg-black/30 backdrop-blur-xl p-6 rounded-2xl border border-white/10 shadow-2xl">
                    <div>
                        <label htmlFor="prompt" className="block text-sm font-semibold text-gray-300 mb-2">Your Creative Idea</label>
                        <textarea
                            id="prompt"
                            value={prompt}
                            onChange={(e) => setState(s => ({ ...s, prompt: e.target.value }))}
                            placeholder="e.g., A cat wearing a wizard hat"
                            className="w-full h-24 bg-black/40 border border-white/20 rounded-md p-3 focus:ring-2 focus:ring-[var(--color-primary-500)] focus:border-[var(--color-primary-500)] transition"
                        />
                    </div>

                    <div className="bg-black/20 p-4 rounded-lg border border-white/10">
                        <h3 className="font-semibold text-gray-200 mb-3 flex items-center">
                            <span className="text-[var(--color-primary-400)] mr-2 text-xl">✨</span> AI Prompt Generator
                        </h3>
                        <button
                            onClick={onEnhance}
                            disabled={isEnhancing}
                            className="w-full flex justify-center items-center bg-gray-700/50 hover:bg-gray-600/50 disabled:bg-gray-800 disabled:text-gray-400 disabled:cursor-not-allowed text-white font-bold py-2 px-4 rounded-md transition-colors duration-200 border border-white/10"
                        >
                            {isEnhancing ? <><Spinner className="h-5 w-5 mr-2" /> Enhancing...</> : "Enhance My Prompt"}
                        </button>
                        {enhancedPrompt && (
                            <div className="mt-4">
                                <div className="flex items-center justify-between mb-2">
                                    <label className="block text-sm font-medium text-gray-400">Enhanced Result</label>
                                    <div className="flex items-center">
                                        <input
                                            type="checkbox"
                                            id="useEnhanced"
                                            checked={useEnhanced}
                                            onChange={(e) => setState(s => ({ ...s, useEnhanced: e.target.checked }))}
                                            className="h-4 w-4 rounded border-gray-500 bg-gray-700 text-[var(--color-primary-600)] focus:ring-[var(--color-primary-500)]"
                                        />
                                        <label htmlFor="useEnhanced" className="ml-2 text-sm text-gray-300">Use this</label>
                                    </div>
                                </div>
                                <p className="text-sm bg-black/30 p-3 rounded-md border border-white/20 text-gray-300">{enhancedPrompt}</p>
                            </div>
                        )}
                    </div>
                    
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="ratio" className="block text-sm font-semibold text-gray-300 mb-2">Aspect Ratio</label>
                            <select id="ratio" value={aspectRatio} onChange={e => setState(s => ({ ...s, aspectRatio: e.target.value }))} className="w-full bg-black/40 border border-white/20 rounded-md p-2.5 focus:ring-2 focus:ring-[var(--color-primary-500)] focus:border-[var(--color-primary-500)] transition">
                                {Object.keys(aspectRatios).map(ratio => <option key={ratio} value={ratio} className="bg-slate-900 text-white">{ratio}</option>)}
                            </select>
                        </div>
                    </div>
                    
                    <div className="pt-4 mt-auto">
                       <button
                            onClick={onGenerate}
                            disabled={isGenerating || !finalPrompt}
                            className="w-full bg-[var(--color-primary-600)] hover:bg-[var(--color-primary-700)] disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-extrabold py-3 px-4 rounded-md transition-all duration-200 text-lg flex justify-center items-center shadow-lg hover:shadow-xl"
                       >
                           {isGenerating ? <><Spinner className="h-6 w-6 mr-3" /> Generating...</> : "Generate Images"}
                       </button>
                       <p className="text-xs text-gray-500 mt-3 text-center">
                           নোট! আরাফাত এআই-তে স্বাগতম। আমার এআই, অন্যান্য এআই-এর মতো শক্তিশালী না, তাই মাঝে মাঝে ইমেজ তৈরি হতে সমস্যা হতে পারে। ধৈর্য ধরে অপেক্ষা করুন আর আবার চেষ্টা করুন। ধন্যবাদ।
                       </p>
                    </div>
                </div>

                <div className="lg:col-span-3">
                    <ImageDisplay
                        imageUrls={imageUrls}
                        isGenerating={isGenerating}
                        setIsGenerating={setIsGenerating}
                        setError={setError}
                        prompt={finalPrompt}
                        width={width}
                        height={height}
                    />
                </div>
            </div>
        </>
    );
}