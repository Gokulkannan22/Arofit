"use client";
import { useState, useEffect } from "react";

export default function SplashIntro() {
  const [stage, setStage] = useState(0); 
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Check if we've already shown the splash screen in this session
    const hasShown = sessionStorage.getItem("arofit_splash");
    if (!hasShown) {
      setShow(true);
      sessionStorage.setItem("arofit_splash", "true");
      
      // Stage 1: Logo scales in (brief delay for smooth start)
      setTimeout(() => setStage(1), 100);
      
      // Stage 2: Text emerges from the logo
      setTimeout(() => setStage(2), 800);
      
      // Stage 3: Hold the logo, then fade the entire screen out
      setTimeout(() => setStage(3), 2200);
      
      // Stage 4: Unmount completely and destroy the node
      setTimeout(() => setShow(false), 2800);
    }
  }, []);

  if (!show) return null;

  return (
    <div className={`fixed inset-0 z-[100] bg-zinc-950 flex flex-col items-center justify-center transition-opacity duration-500 ease-in-out ${stage === 3 ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
      <div className="flex items-center overflow-hidden px-4">
         
         {/* The Graphic Logo */}
         <img 
            src="/symbol_transparent.png" 
            alt="AroFit Icon" 
            className={`h-20 w-auto object-contain transition-all duration-700 ease-out transform relative z-10 ${stage >= 1 ? 'translate-x-0 opacity-100 scale-100' : 'translate-x-8 opacity-0 scale-50'}`}
         />
         
         {/* The Emerging Text */}
         <div className={`transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] overflow-hidden flex items-center h-24 ${stage >= 2 ? 'max-w-[300px] opacity-100 ml-5' : 'max-w-0 opacity-0 ml-0'}`}>
           <span className="font-extrabold text-6xl tracking-tighter uppercase whitespace-nowrap">
               <span className="text-white">ARO</span><span className="text-emerald-500">FIT</span>
           </span>
         </div>

      </div>
    </div>
  );
}
