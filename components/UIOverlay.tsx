import React, { useEffect, useState } from 'react';
import { TreeMorphState } from '../types';
import { generateHolidayFortune } from '../services/geminiService';

interface UIOverlayProps {
  currentState: TreeMorphState;
  onToggle: () => void;
}

export const UIOverlay: React.FC<UIOverlayProps> = ({ currentState, onToggle }) => {
  const [fortune, setFortune] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  // When tree forms, fetch a luxury fortune
  useEffect(() => {
    if (currentState === TreeMorphState.TREE_SHAPE) {
      setIsLoading(true);
      generateHolidayFortune().then(text => {
        setFortune(text);
        setIsLoading(false);
      });
    } else {
      setFortune(""); 
    }
  }, [currentState]);

  const isScattered = currentState === TreeMorphState.SCATTERED;

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-8 md:p-12 z-10">
      
      {/* Header */}
      <header className="flex flex-col items-center md:items-start text-center md:text-left">
        <h1 className="font-display text-4xl md:text-6xl text-[#E8DCC4] tracking-widest uppercase drop-shadow-[0_0_15px_rgba(255,215,0,0.5)]">
          Arix
        </h1>
        <p className="font-body text-[#8C9E95] text-sm tracking-[0.3em] mt-2 uppercase">
          Signature Collection
        </p>
      </header>

      {/* Center Fortune Text */}
      <div className="flex-1 flex items-center justify-center">
        <div className={`transition-opacity duration-1000 ease-in-out max-w-lg text-center ${currentState === TreeMorphState.TREE_SHAPE ? 'opacity-100' : 'opacity-0'}`}>
           {isLoading ? (
             <span className="font-body text-gold-500 animate-pulse text-sm tracking-widest text-[#FFD700]">SUMMONING SPIRIT...</span>
           ) : (
             <p className="font-display text-2xl md:text-3xl text-[#FFD700] leading-relaxed drop-shadow-md">
               "{fortune}"
             </p>
           )}
        </div>
      </div>

      {/* Footer Controls */}
      <footer className="flex flex-col items-center gap-6 pointer-events-auto">
        <button
          onClick={onToggle}
          className="group relative px-8 py-3 overflow-hidden bg-transparent border border-[#FFD700] rounded-full transition-all duration-500 hover:bg-[#FFD700]/10 hover:shadow-[0_0_30px_rgba(255,215,0,0.4)]"
        >
          <span className={`absolute inset-0 w-0 bg-[#FFD700] transition-all duration-[250ms] ease-out group-hover:w-full opacity-10`}></span>
          <span className="relative font-body font-bold text-[#FFD700] tracking-widest text-sm uppercase">
            {isScattered ? "Assemble Tree" : "Release Magic"}
          </span>
        </button>
        
        <p className="text-[#3A4D45] text-xs font-body tracking-wider">
          INTERACTIVE 3D EXPERIENCE • REACT THREE FIBER
        </p>
      </footer>
    </div>
  );
};
