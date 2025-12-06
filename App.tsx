import React, { useState, useEffect, useCallback } from 'react';
import { WeeklyPlan } from './types';
import { generateWorkoutPlan, getReplacementExercise } from './services/geminiService';
import DaySlide from './components/DaySlide';
import { ChevronLeft, ChevronRight, Loader2, Sparkles, RefreshCw } from 'lucide-react';

const App: React.FC = () => {
  const [plan, setPlan] = useState<WeeklyPlan | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  // Track loading state for individual exercises being swapped: key = "dayIndex-exerciseIndex"
  const [swappingState, setSwappingState] = useState<Record<string, boolean>>({});

  const fetchPlan = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const cached = localStorage.getItem('workout_plan_intermediate_v4');
      if (cached) {
          setPlan(JSON.parse(cached));
          setLoading(false);
          return;
      }

      const data = await generateWorkoutPlan();
      setPlan(data);
      localStorage.setItem('workout_plan_intermediate_v4', JSON.stringify(data));
    } catch (err) {
      setError("Não foi possível gerar o treino. Verifique sua conexão ou tente novamente.");
    } finally {
      setLoading(false);
    }
  }, []);

  const regenerate = async () => {
      localStorage.removeItem('workout_plan_intermediate_v4');
      await fetchPlan();
      setCurrentIndex(0);
  };

  const handleSwapExercise = async (dayIndex: number, exerciseIndex: number) => {
    if (!plan) return;
    
    const swapKey = `${dayIndex}-${exerciseIndex}`;
    setSwappingState(prev => ({ ...prev, [swapKey]: true }));

    try {
        const day = plan.days[dayIndex];
        const currentExercise = day.exercises[exerciseIndex];
        
        const newExercise = await getReplacementExercise(currentExercise.name, day.focus);
        
        const newPlan = { ...plan };
        newPlan.days[dayIndex].exercises[exerciseIndex] = newExercise;
        
        setPlan(newPlan);
        localStorage.setItem('workout_plan_intermediate_v4', JSON.stringify(newPlan));
        
        // Clear completion status for the new exercise if any old key exists conflict
        const oldStorageId = `completed_${day.dayName.replace(/\s/g, '')}_${currentExercise.name.replace(/\s/g, '')}`;
        localStorage.removeItem(oldStorageId);

    } catch (err) {
        console.error("Failed to swap exercise", err);
        alert("Não foi possível substituir o exercício no momento.");
    } finally {
        setSwappingState(prev => {
            const newState = { ...prev };
            delete newState[swapKey];
            return newState;
        });
    }
  };

  useEffect(() => {
    fetchPlan();
  }, [fetchPlan]);

  const handleNext = () => {
    if (plan && currentIndex < plan.days.length - 1) {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center p-6 text-center">
        <div className="relative">
            <div className="absolute inset-0 bg-red-600 blur-xl opacity-20 rounded-full"></div>
            <Loader2 size={48} className="text-red-600 animate-spin relative z-10" />
        </div>
        <h2 className="mt-8 text-3xl font-extrabold text-white tracking-tight uppercase">Construindo Ficha de Treino</h2>
        <p className="mt-2 text-neutral-500 max-w-md text-lg font-medium">
            Montando rotina de hipertrofia intermediária...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center p-6 text-center">
        <div className="bg-red-500/10 p-4 rounded-full mb-4">
            <Sparkles size={48} className="text-red-600" />
        </div>
        <h2 className="text-3xl font-extrabold text-white mb-2 uppercase">Ops! Algo deu errado.</h2>
        <p className="text-neutral-400 mb-6 text-lg">{error}</p>
        <button 
          onClick={fetchPlan}
          className="px-8 py-4 bg-red-600 text-white font-extrabold rounded-lg hover:bg-red-700 transition-colors uppercase tracking-widest text-base border-2 border-red-500"
        >
          Tentar Novamente
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col overflow-hidden relative selection:bg-red-600/30">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-red-900/10 to-transparent pointer-events-none" />
      
      {/* Top Bar */}
      <header className="flex justify-between items-center p-6 z-10">
        <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center text-white font-black text-sm shadow-lg shadow-red-900/40 border-2 border-red-500 tracking-tighter">
                NP
            </div>
            <h1 className="font-black text-2xl tracking-tighter text-white uppercase italic">CREATOR</h1>
        </div>
        <button 
            onClick={regenerate}
            className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-neutral-400 hover:text-white hover:bg-red-600 hover:border-red-600 transition-all bg-neutral-900 px-4 py-2 rounded-lg border-2 border-neutral-800"
        >
            <RefreshCw size={14} />
            Novo Treino
        </button>
      </header>

      {/* Main Content Area - Slide */}
      <main className="flex-1 flex flex-col relative max-w-6xl mx-auto w-full px-4 md:px-8 pb-28">
        {plan && (
          <div className="flex-1 relative">
             {plan.days.map((day, index) => (
               <div 
                key={index} 
                className={`absolute inset-0 transition-all duration-500 ease-in-out transform ${
                    index === currentIndex 
                    ? 'opacity-100 translate-x-0' 
                    : index < currentIndex 
                        ? 'opacity-0 -translate-x-10 pointer-events-none' 
                        : 'opacity-0 translate-x-10 pointer-events-none'
                }`}
               >
                 <DaySlide 
                    day={day} 
                    dayIndex={index}
                    isActive={index === currentIndex} 
                    swappingState={swappingState}
                    onSwapExercise={handleSwapExercise}
                 />
               </div>
             ))}
          </div>
        )}
      </main>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 w-full bg-neutral-950/95 backdrop-blur-xl border-t-2 border-neutral-900 p-4 z-50">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
            
            {/* Day Rectangles (Tabs) */}
            <div className="flex flex-1 gap-2 overflow-x-auto scrollbar-hide mask-fade-right">
                {plan?.days.map((day, idx) => (
                    <button 
                        key={idx}
                        onClick={() => setCurrentIndex(idx)}
                        className={`
                            px-3 py-2 md:px-5 rounded-lg border-2 text-xs md:text-sm font-black transition-all uppercase tracking-wider whitespace-nowrap
                            ${
                                idx === currentIndex 
                                ? 'bg-red-600 border-red-500 text-white shadow-[0_0_15px_rgba(220,38,38,0.4)] scale-105 z-10' 
                                : 'bg-neutral-900 border-neutral-800 text-neutral-500 hover:border-neutral-600 hover:text-neutral-300'
                            }
                        `}
                    >
                        {day.dayName.substring(0, 3)}
                    </button>
                ))}
            </div>

            {/* Navigation Arrows */}
            <div className="flex gap-3 flex-shrink-0">
                <button 
                    onClick={handlePrev}
                    disabled={currentIndex === 0}
                    className="p-3 rounded-xl bg-neutral-900 border-2 border-neutral-800 text-neutral-400 hover:text-white hover:border-red-600 hover:bg-neutral-800 disabled:opacity-50 disabled:hover:border-neutral-800 disabled:cursor-not-allowed transition-all"
                >
                    <ChevronLeft size={24} />
                </button>
                <button 
                    onClick={handleNext}
                    disabled={!plan || currentIndex === plan.days.length - 1}
                    className="p-3 rounded-xl bg-red-600 text-white border-2 border-red-500 hover:bg-red-500 hover:scale-105 disabled:opacity-50 disabled:hover:bg-red-600 disabled:scale-100 disabled:cursor-not-allowed transition-all shadow-[0_0_20px_rgba(220,38,38,0.4)]"
                >
                    <ChevronRight size={24} />
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default App;