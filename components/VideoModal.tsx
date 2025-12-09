import React from 'react';
import { X } from 'lucide-react';

interface VideoModalProps {
  videoQuery: string;
  onClose: () => void;
}

const VideoModal: React.FC<VideoModalProps> = ({ videoQuery, onClose }) => {
  // We use the embed endpoint with listType=search to play the first result for the query
  const searchUrl = `https://www.youtube.com/embed?listType=search&list=${encodeURIComponent(videoQuery)}&autoplay=1`;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-fade-in">
      {/* Backdrop with Blur */}
      <div 
        className="absolute inset-0 bg-black/95 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />

      {/* Video Container (16:9 for compatibility, responsive) */}
      <div className="relative w-full max-w-4xl aspect-video bg-black border-2 border-neutral-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        
        {/* Header Overlay */}
        <div className="absolute top-0 right-0 z-20 p-4">
             <button 
                onClick={onClose}
                className="w-10 h-10 flex items-center justify-center bg-black/60 backdrop-blur-md rounded-full text-white hover:bg-white/20 transition-all border border-white/10"
            >
                <X size={20} />
            </button>
        </div>

        {/* Iframe Embed */}
        <div className="w-full h-full bg-black flex items-center justify-center">
            <iframe
                width="100%"
                height="100%"
                src={searchUrl}
                title="Vídeo de Execução"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full"
            ></iframe>
        </div>
      </div>
    </div>
  );
};

export default VideoModal;