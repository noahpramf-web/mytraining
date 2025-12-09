import React from 'react';
import { X, Play, Pause, RotateCcw, Timer } from 'lucide-react';

interface TimerModalProps {
  seconds: number;
  isRunning: boolean;
  onToggle: () => void;
  onReset: () => void;
  onClose: () => void;
}

const TimerModal: React.FC<TimerModalProps> = ({ seconds, isRunning, onToggle, onReset, onClose }) => {
  
  const formatTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    
    if (hours > 0) {
        return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-fade-in">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/95 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative w-full max-w-sm bg-neutral-900 border-2 border-neutral-800 rounded-2xl shadow-[0_0_50px_rgba(220,38,38,0.2)] p-8 flex flex-col items-center gap-8">
        
        {/* Header */}
        <div className="absolute top-4 right-4">
             <button 
                onClick={onClose}
                className="w-10 h-10 flex items-center justify-center bg-neutral-800 rounded-full text-neutral-400 hover:text-white hover:bg-neutral-700 transition-all"
            >
                <X size={20} />
            </button>
        </div>

        <div className="flex items-center gap-3 text-red-500 mb-2">
            <Timer size={24} />
            <h2 className="text-xl font-bold uppercase tracking-widest">Tempo Total</h2>
        </div>

        {/* Display */}
        <div className="text-7xl md:text-8xl font-black text-white tabular-nums tracking-tighter drop-shadow-2xl">
            {formatTime(seconds)}
        </div>

        {/* Controls */}
        <div className="flex items-center gap-6 w-full justify-center">
            <button 
                onClick={onReset}
                className="w-16 h-16 flex items-center justify-center rounded-full bg-neutral-800 text-neutral-400 border-2 border-transparent hover:border-neutral-600 transition-all active:scale-95"
                title="Reiniciar Treino"
            >
                <RotateCcw size={24} />
            </button>

            <button 
                onClick={onToggle}
                className={`
                    w-24 h-24 flex items-center justify-center rounded-full border-4 transition-all active:scale-95 shadow-xl
                    ${isRunning 
                        ? 'bg-neutral-900 border-red-600 text-red-500 hover:bg-red-900/20' 
                        : 'bg-red-600 border-red-500 text-white hover:bg-red-500'
                    }
                `}
            >
                {isRunning ? <Pause size={40} fill="currentColor" /> : <Play size={40} fill="currentColor" className="ml-1" />}
            </button>
        </div>
      </div>
    </div>
  );
};

export default TimerModal;