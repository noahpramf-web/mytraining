import React from 'react';
import { X, ExternalLink, Youtube } from 'lucide-react';

interface VideoModalProps {
  term: string;
  onClose: () => void;
}

const VideoModal: React.FC<VideoModalProps> = ({ term, onClose }) => {
  // Construímos a URL de embed do YouTube usando o modo de lista de pesquisa.
  // Isso toca automaticamente o resultado mais relevante ou mostra a lista.
  const embedUrl = `https://www.youtube.com/embed?listType=search&list=${encodeURIComponent(term)}`;
  const externalUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(term)}`;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-fade-in">
      {/* Backdrop com Blur */}
      <div 
        className="absolute inset-0 bg-neutral-950/90 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative w-full max-w-3xl bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-neutral-800 bg-neutral-900/50">
          <div className="flex items-center gap-2">
            <Youtube className="text-red-600" size={24} />
            <h3 className="font-bold text-white truncate max-w-[200px] sm:max-w-md capitalize">
              {term}
            </h3>
          </div>
          <button 
            onClick={onClose}
            className="p-2 bg-neutral-800 hover:bg-neutral-700 rounded-full text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Video Container (Aspect Ratio 16:9) */}
        <div className="relative w-full pb-[56.25%] bg-black">
          <iframe 
            src={embedUrl}
            title={`Vídeo de ${term}`}
            className="absolute top-0 left-0 w-full h-full"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-neutral-900 border-t border-neutral-800 flex flex-col sm:flex-row gap-3 justify-between items-center text-center sm:text-left">
          <p className="text-xs text-neutral-500">
            Mostrando resultados para "{term}"
          </p>
          
          <a 
            href={externalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 bg-neutral-800 hover:bg-red-600 text-white rounded-lg text-xs font-bold uppercase tracking-wider transition-colors w-full sm:w-auto justify-center"
          >
            <ExternalLink size={14} />
            Abrir no App YouTube
          </a>
        </div>
      </div>
    </div>
  );
};

export default VideoModal;