import React, { useRef, useState } from 'react';
import { AdConfig, AspectRatio } from '../types';
import { Download, Share2, Move, Trash2, Code, X, Copy, Check } from 'lucide-react';
import html2canvas from 'html2canvas';
import { getPythonCode } from '../services/geminiService';

interface AdPreviewProps {
  imageUrl: string;
  config: AdConfig;
  onDelete?: () => void;
}

export const AdPreview: React.FC<AdPreviewProps> = ({ imageUrl, config, onDelete }) => {
  const adRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [showCode, setShowCode] = useState(false);
  const [copied, setCopied] = useState(false);

  const codeSnippet = getPythonCode(config.description, config.aspectRatio);

  // Calculate container aspect ratio styles
  const getAspectRatioStyle = (ratio: AspectRatio) => {
    switch (ratio) {
      case AspectRatio.SQUARE: return { paddingBottom: '100%' };
      case AspectRatio.LANDSCAPE_16_9: return { paddingBottom: '56.25%' };
      case AspectRatio.LANDSCAPE_4_3: return { paddingBottom: '75%' };
      case AspectRatio.PORTRAIT_3_4: return { paddingBottom: '133.33%' };
      case AspectRatio.PORTRAIT_9_16: return { paddingBottom: '177.77%' };
      default: return { paddingBottom: '56.25%' };
    }
  };

  const handleDownload = async () => {
    if (!adRef.current) return;
    setIsDownloading(true);
    try {
      const canvas = await html2canvas(adRef.current, {
        useCORS: true,
        scale: 2, // Higher res download
        backgroundColor: null,
      });
      
      const link = document.createElement('a');
      link.download = `ad-genius-${config.productName.replace(/\s+/g, '-').toLowerCase()}-${Date.now()}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (err) {
      console.error("Download failed", err);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(codeSnippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="group relative bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      {/* Code Overlay */}
      {showCode && (
        <div className="absolute inset-0 z-30 bg-slate-900/95 p-4 flex flex-col text-left backdrop-blur-sm animate-in fade-in duration-200">
          <div className="flex justify-between items-center mb-3">
            <div className="flex items-center gap-2">
              <span className="text-indigo-400 text-xs font-bold tracking-wider font-mono">PYTHON SDK</span>
            </div>
            <div className="flex gap-1">
              <button 
                onClick={handleCopyCode}
                className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded transition-colors"
                title="Copy Code"
              >
                {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
              </button>
              <button 
                onClick={() => setShowCode(false)} 
                className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded transition-colors"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
          <pre className="flex-1 overflow-auto text-[10px] sm:text-xs font-mono text-indigo-200 p-3 bg-black/30 rounded-lg border border-white/5 whitespace-pre-wrap leading-relaxed">
            {codeSnippet}
          </pre>
        </div>
      )}

      <div className="absolute top-3 right-3 z-20 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
         <button 
            onClick={() => setShowCode(true)}
            className="p-2 bg-white/90 backdrop-blur rounded-full text-slate-700 hover:text-indigo-600 shadow-sm border border-slate-100"
            title="View Python Code"
          >
            <Code className="w-4 h-4" />
          </button>
         {onDelete && (
          <button 
            onClick={onDelete}
            className="p-2 bg-white/90 backdrop-blur rounded-full text-red-500 hover:text-red-600 shadow-sm border border-slate-100"
            title="Delete"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
        <button 
          onClick={handleDownload}
          disabled={isDownloading}
          className="p-2 bg-white/90 backdrop-blur rounded-full text-slate-700 hover:text-indigo-600 shadow-sm border border-slate-100"
          title="Download PNG"
        >
          {isDownloading ? (
             <div className="w-4 h-4 border-2 border-indigo-600/30 border-t-indigo-600 rounded-full animate-spin"></div>
          ) : (
            <Download className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* Ad Canvas Container */}
      <div className="relative w-full bg-slate-100" style={getAspectRatioStyle(config.aspectRatio)}>
        <div 
          ref={adRef}
          className="absolute inset-0 overflow-hidden bg-slate-900 text-white"
        >
          {/* Background Image */}
          <img 
            src={imageUrl} 
            alt="Ad Background" 
            className="w-full h-full object-cover opacity-90"
          />
          
          {/* Dark Overlay Gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />

          {/* Text Overlay Content */}
          <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8 flex flex-col gap-3 items-start">
            {config.productName && (
              <span className="text-xs md:text-sm font-bold tracking-wider uppercase text-indigo-400 bg-black/30 backdrop-blur-sm px-2 py-1 rounded">
                {config.productName}
              </span>
            )}
            
            {config.headline && (
              <h2 className="text-2xl md:text-4xl font-bold leading-tight max-w-[90%] drop-shadow-lg">
                {config.headline}
              </h2>
            )}

            {config.ctaText && (
              <div className="mt-2 bg-white text-black px-6 py-2.5 rounded-full font-semibold text-sm md:text-base shadow-lg transform transition hover:scale-105 cursor-pointer">
                {config.ctaText}
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div className="p-3 bg-slate-50 border-t border-slate-100 flex justify-between items-center text-xs text-slate-500">
        <span>{config.aspectRatio} • Generated with Imagen 4.0</span>
        <span className="font-mono text-[10px] bg-slate-200 px-1.5 py-0.5 rounded text-slate-600">PRO</span>
      </div>
    </div>
  );
};