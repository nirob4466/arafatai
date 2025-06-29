import React, { useRef, useState } from 'react';
import { Spinner } from './Spinner';

type ItpState = {
    imageFile: File | null;
    imagePreview: string | null;
    generatedPrompt: string;
    isLoading: boolean;
    error: string | null;
};

interface ImageToPromptProps {
    state: ItpState;
    setState: React.Dispatch<React.SetStateAction<ItpState>>;
    onFileChange: (file: File | null) => void;
    onGenerate: () => void;
}

export default function ImageToPrompt({ state, setState, onFileChange, onGenerate }: ImageToPromptProps) {
    const { imagePreview, generatedPrompt, isLoading, error } = state;
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isCopied, setIsCopied] = useState(false);
    const [isDragging, setIsDragging] = useState(false);

    const setError = (err: string | null) => setState(s => ({ ...s, error: err }));

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        onFileChange(file || null);
    };

    const handleCopyPrompt = () => {
        if (!generatedPrompt) return;
        navigator.clipboard.writeText(generatedPrompt).then(() => {
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2000);
        }).catch(err => {
            console.error('Failed to copy text: ', err);
            setError("Could not copy text to clipboard.");
        });
    };

    // --- Drag and Drop Handlers ---
    const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    };
    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    };
    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation(); // Necessary to allow drop
    };
    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        const files = e.dataTransfer.files;
        if (files && files.length > 0) {
            onFileChange(files[0]);
        }
    };

    return (
        <div className="max-w-4xl mx-auto">
            {error && (
                <div className="bg-red-900/50 backdrop-blur-md border border-red-500/50 text-red-200 px-4 py-3 rounded-lg relative mb-6" role="alert">
                    <strong className="font-bold">Error: </strong>
                    <span className="block sm:inline">{error}</span>
                    <button onClick={() => setError(null)} className="absolute top-0 bottom-0 right-0 px-4 py-3 text-red-200" aria-label="Close error">
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" fillRule="evenodd"></path></svg>
                    </button>
                </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div 
                    className="bg-black/30 backdrop-blur-xl p-6 rounded-2xl border border-white/10 shadow-2xl flex flex-col items-center justify-center"
                    onDragEnter={handleDragEnter}
                    onDragLeave={handleDragLeave}
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                >
                    <input type="file" accept="image/png, image/jpeg, image/webp" onChange={handleFileChange} ref={fileInputRef} className="hidden" />
                    
                    {!imagePreview ? (
                        <div 
                            onClick={() => fileInputRef.current?.click()} 
                            className={`w-full h-64 border-2 border-dashed rounded-xl flex flex-col items-center justify-center text-center cursor-pointer transition-colors duration-300 ${isDragging ? 'border-[var(--color-primary-500)] bg-[var(--color-primary-400)]/10' : 'border-gray-600 hover:border-gray-500 hover:bg-white/5'}`}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-500 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                            <p className="font-semibold text-gray-300">Drag & drop an image here</p>
                            <p className="text-gray-400">or click to upload</p>
                            <p className="text-xs text-gray-500 mt-1">PNG, JPG, or WEBP (Max 4MB)</p>
                        </div>
                    ) : (
                        <div className="w-full h-64 relative">
                            <img src={imagePreview} alt="Uploaded preview" className="w-full h-full object-contain rounded-xl" />
                             <button onClick={() => fileInputRef.current?.click()} className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-3 py-1.5 rounded-md hover:bg-black/80 transition-colors">
                                Change Image
                            </button>
                        </div>
                    )}
                </div>
                
                <div className="bg-black/30 backdrop-blur-xl p-6 rounded-2xl border border-white/10 shadow-2xl flex flex-col">
                    <h3 className="text-lg font-semibold text-gray-200 mb-4">Generated Prompt</h3>
                    <div className="flex-grow bg-black/40 border border-white/20 rounded-md p-4 min-h-[150px] flex items-center justify-center">
                        {isLoading ? (
                            <div className="text-center">
                                <Spinner className="h-8 w-8 mx-auto text-[var(--color-primary-400)]" />
                                <p className="text-sm text-gray-400 mt-2">Analyzing image...</p>
                            </div>
                        ) : generatedPrompt ? (
                             <p className="text-gray-300 text-sm leading-relaxed">{generatedPrompt}</p>
                        ) : (
                            <p className="text-gray-500 text-sm text-center">Your generated prompt will appear here.</p>
                        )}
                    </div>
                    {generatedPrompt && (
                        <button onClick={handleCopyPrompt} className={`w-full mt-4 font-bold py-2 px-4 rounded-md transition-all duration-300 border flex items-center justify-center ${
                            isCopied
                            ? 'bg-green-600/50 border-green-500/50 text-white'
                            : 'bg-gray-700/50 hover:bg-gray-600/50 border-white/10 text-white'
                        }`}>
                            {isCopied ? (
                                <>
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                    Copied!
                                </>
                            ) : (
                                <>
                                     <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                                    Copy Prompt
                                </>
                            )}
                        </button>
                    )}
                </div>
            </div>
            
            <div className="mt-8 flex justify-center">
                <button
                    onClick={onGenerate}
                    disabled={isLoading || !state.imageFile}
                    className="w-full max-w-md bg-[var(--color-primary-600)] hover:bg-[var(--color-primary-700)] disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-extrabold py-3 px-4 rounded-md transition-all duration-200 text-lg flex justify-center items-center shadow-lg hover:shadow-xl"
                >
                    {isLoading ? <><Spinner className="h-6 w-6 mr-3" />Generating...</> : 'Generate Prompt from Image'}
                </button>
            </div>
        </div>
    );
}