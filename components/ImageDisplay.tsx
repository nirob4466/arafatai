import React, { useState, useEffect, useRef } from 'react';
import { Spinner } from './Spinner';

interface ImageDisplayProps {
  imageUrls: string[];
  isGenerating: boolean;
  setIsGenerating: (isGenerating: boolean) => void;
  setError: (error: string | null) => void;
  prompt: string;
  width: number;
  height: number;
}

const ImageDisplay: React.FC<ImageDisplayProps> = ({ imageUrls, isGenerating, setIsGenerating, setError, prompt, width, height }) => {
  const completionCounter = useRef(0);

  useEffect(() => {
    if (isGenerating && imageUrls.length > 0) {
      completionCounter.current = 0;
    }
  }, [isGenerating, imageUrls]);

  const handleImageCompleted = () => {
    completionCounter.current++;
    if (completionCounter.current === imageUrls.length) {
      setIsGenerating(false);
    }
  };

  const handleImageError = () => {
    setError('Failed to load an image. One of the models might be offline or the prompt was refused.');
    handleImageCompleted();
  };

  if (imageUrls.length === 0) {
    return (
      <div className="w-full bg-black/20 backdrop-blur-xl rounded-2xl flex items-center justify-center relative overflow-hidden border border-white/20 transition-all duration-300 shadow-lg min-h-[400px] md:min-h-[512px]">
        {isGenerating ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 z-10">
            <Spinner className="h-10 w-10 text-[var(--color-primary-400)]" />
            <p className="mt-4 text-gray-200">Weaving your visions...</p>
          </div>
        ) : (
          <div className="text-center text-gray-400 p-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l-1.586-1.586a2 2 0 00-2.828 0L6 14m6-6l.01.01" />
            </svg>
            <p className="mt-2 font-medium text-lg">Your generated images will appear here</p>
            <p className="text-sm text-gray-500">Let's create something magical! (Generates two images)</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {imageUrls.map((url, index) => (
        <ImageItem
          key={url + index}
          url={url}
          prompt={prompt}
          width={width}
          height={height}
          onLoad={handleImageCompleted}
          onError={handleImageError}
        />
      ))}
    </div>
  );
};

const ImageItem: React.FC<{
  url: string;
  prompt: string;
  width: number;
  height: number;
  onLoad: () => void;
  onError: () => void;
}> = ({ url, prompt, width, height, onLoad, onError }) => {
  const [isItemLoading, setIsItemLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);

  const handleLoad = () => {
    setIsItemLoading(false);
    onLoad();
  };

  const handleError = () => {
    setIsItemLoading(false);
    onError();
  };
  
  const handleDownload = async () => {
    if (isDownloading) return;
    setIsDownloading(true);
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch image: ${response.statusText}`);
      }
      const blob = await response.blob();
      const objectUrl = window.URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = objectUrl;
      const safePrompt = prompt.slice(0, 30).replace(/[^a-z0-9]/gi, '_').toLowerCase();
      link.download = `arafat-imagen-${safePrompt || 'art'}.png`;
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      window.URL.revokeObjectURL(objectUrl);
    } catch (err) {
      console.error("Download failed:", err);
      // You could set an error state here to inform the user
    } finally {
      setIsDownloading(false);
    }
  };
  
  return (
    <div
      className="group w-full bg-black/20 backdrop-blur-xl rounded-2xl flex items-center justify-center relative overflow-hidden border border-white/20 transition-all duration-300 shadow-lg"
      style={{ aspectRatio: `${width} / ${height}` }}
    >
      {isItemLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-20">
          <Spinner className="h-12 w-12 text-[var(--color-primary-400)]" />
        </div>
      )}
      <img
        src={url}
        alt={prompt}
        className={`w-full h-full object-cover transition-opacity duration-500 ${isItemLoading ? 'opacity-30 blur-sm' : 'opacity-100 blur-0'}`}
        onLoad={handleLoad}
        onError={handleError}
      />
      {!isItemLoading && (
        <button
          onClick={handleDownload}
          disabled={isDownloading}
          className="absolute top-3 right-3 bg-black/50 backdrop-blur-md p-2 rounded-full text-white opacity-0 group-hover:opacity-100 focus:opacity-100 transition-all duration-300 hover:bg-black/70 disabled:opacity-50 disabled:cursor-wait"
          aria-label="Download image"
        >
          {isDownloading ? (
            <Spinner className="h-5 w-5" />
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
          )}
        </button>
      )}
    </div>
  );
};

export default ImageDisplay;