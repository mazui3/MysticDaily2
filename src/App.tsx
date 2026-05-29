/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useMemo } from "react";
import { 
  Sparkles, 
  Compass, 
  MapPin, 
  Gift, 
  RotateCcw, 
  Moon
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { dailyGuidances, luckyItems, luckyColours } from "./data";
import { getDeterministicIndex, getFallbackVisitorId, maskIpAddress } from "./utils";

export default function App() {
  const [ip, setIp] = useState<string>("");
  const [loadingIp, setLoadingIp] = useState<boolean>(true);

  // Clean date representation
  const today = useMemo(() => new Date(), []);
  
  const dateStr = useMemo(() => {
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }, [today]);

  const formattedDate = useMemo(() => {
    return today.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }, [today]);

  // Fetch true public IP address on mount
  useEffect(() => {
    let active = true;
    const fetchIp = async () => {
      try {
        const response = await fetch("https://api.ipify.org?format=json");
        if (!response.ok) throw new Error("Failed to fetch public IP");
        const data = await response.json();
        if (active) {
          setIp(data.ip || getFallbackVisitorId());
          setLoadingIp(false);
        }
      } catch (err) {
        console.warn("Could not fetch standard IP, using local fallback device ID", err);
        if (active) {
          setIp(getFallbackVisitorId());
          setLoadingIp(false);
        }
      }
    };
    fetchIp();
    return () => {
      active = false;
    };
  }, []);

  // Revealed persistence key for today's date
  const storageKey = `drawn_fortune_${dateStr}`;
  const [hasRevealed, setHasRevealed] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem(storageKey) === "true";
    }
    return false;
  });

  const handleReveal = () => {
    setHasRevealed(true);
    localStorage.setItem(storageKey, "true");
  };

  const handleReset = () => {
    setHasRevealed(false);
    localStorage.removeItem(storageKey);
  };

  // Determine static deterministic daily results based on Date and IP address
  const finalGuidance = useMemo(() => {
    if (!ip) return null;
    const seed = `${dateStr}_${ip}_guidance`;
    const index = getDeterministicIndex(seed, dailyGuidances.length);
    return dailyGuidances[index];
  }, [ip, dateStr]);

  const finalItem = useMemo(() => {
    if (!ip) return null;
    const seed = `${dateStr}_${ip}_item`;
    const index = getDeterministicIndex(seed, luckyItems.length);
    return luckyItems[index];
  }, [ip, dateStr]);

  const finalColour = useMemo(() => {
    if (!ip) return null;
    const seed = `${dateStr}_${ip}_colour`;
    const index = getDeterministicIndex(seed, luckyColours.length);
    return luckyColours[index];
  }, [ip, dateStr]);

  return (
    <div id="app_root" className="min-h-screen flex flex-col justify-between py-6 px-4 md:py-12 bg-[#FAF9F6]">
      {/* Header section */}
      <header id="app_header" className="w-full max-w-lg mx-auto text-center mb-6">
        <div className="inline-flex items-center gap-2 mb-1">
          <Moon className="w-4 h-4 text-stone-400" />
          <span className="text-xs tracking-widest font-semibold uppercase text-stone-400">
            Digital Divination
          </span>
        </div>
        <h1 className="text-3xl md:text-4xl font-serif font-light text-stone-800 tracking-tight mb-2">
          Daily Fortune
        </h1>
        <p className="text-sm font-sans font-light text-stone-500 tracking-wide">
          {formattedDate}
        </p>
      </header>

      {/* Main card or content viewport */}
      <main id="app_main" className="flex-grow flex items-center justify-center w-full max-w-lg mx-auto mb-6">
        <AnimatePresence mode="wait">
          {!hasRevealed ? (
            /* Unrevealed alignment tarot back-card container */
            <motion.div
              key="unrevealed_card"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.4 }}
              id="unrevealed_canvas"
              className="w-full bg-[#FCFAF6] border border-stone-200/80 rounded-2xl p-8 shadow-[0_4px_24px_-4px_rgba(28,27,25,0.04)] hover:shadow-[0_8px_30px_-4px_rgba(28,27,25,0.06)] transition-all duration-500 flex flex-col justify-between text-center min-h-[460px] relative overflow-hidden"
            >
              {/* Decorative borders to match minimal japanese oracle theme */}
              <div className="absolute inset-2 border border-dashed border-stone-200/50 rounded-xl pointer-events-none" />
              
              <div className="flex flex-col items-center justify-center pt-8">
                {/* Mystical centering motif */}
                <div className="relative mb-6">
                  <div className="absolute -inset-2 bg-amber-50 rounded-full blur-xl opacity-70 animate-pulse" />
                  <div className="relative w-16 h-16 rounded-full border border-stone-200 bg-white flex items-center justify-center">
                    <Compass className="w-8 h-8 text-stone-600 animate-[spin_20s_linear_infinite]" />
                  </div>
                </div>
                
                <h2 className="text-xl font-serif text-stone-800 font-light mb-3">
                  Discover Your Focus Today
                </h2>
                <p className="text-sm text-stone-500 max-w-xs font-light leading-relaxed">
                  Reveal the unique celestial alignment calculated for you based on today's date and your current network connection parameters.
                </p>
              </div>

              {/* Status footer with action button */}
              <div className="flex flex-col items-center gap-4 z-10">
                <button
                  id="reveal_button"
                  onClick={handleReveal}
                  disabled={loadingIp}
                  className="w-full py-3 px-6 bg-stone-800 hover:bg-stone-700 disabled:bg-stone-300 disabled:cursor-not-allowed text-[#F5F4F0] text-sm tracking-widest font-medium rounded-lg shadow-sm hover:shadow transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer"
                >
                  {loadingIp ? (
                    <>
                      <div className="w-4 h-4 border-2 border-stone-400 border-t-transparent rounded-full animate-spin" />
                      <span>CONNECTING NETWORK...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>REVEAL TODAY'S ALIGNMENT</span>
                    </>
                  )}
                </button>

                <div className="text-stone-400 text-[11px] font-mono tracking-wide flex items-center gap-1.5 justify-center">
                  <MapPin className="w-3.5 h-3.5 text-stone-400" />
                  <span>
                    {loadingIp ? "Aligning connection channel..." : `Network ID: ${maskIpAddress(ip)}`}
                  </span>
                </div>
              </div>
            </motion.div>
          ) : (
            /* Revealed Alignment details Card container */
            <motion.div
              key="revealed_card"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.4 }}
              id="revealed_canvas"
              className="w-full bg-white border border-stone-200/80 rounded-2xl p-8 shadow-[0_8px_32px_rgba(28,27,25,0.06)] relative overflow-hidden"
            >
              {/* Inner decorative fine dashed border */}
              <div className="absolute inset-2 border border-dashed border-stone-100 rounded-xl pointer-events-none" />

              {/* Main guidance statement */}
              <div id="guidance_section" className="text-center pt-4 pb-8 border-b border-stone-100">
                <div className="inline-flex items-center gap-1.5 mb-3">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span className="text-[10px] tracking-widest font-semibold uppercase text-stone-400">
                    Daily Guidance
                  </span>
                </div>
                
                <h3 className="text-xl md:text-2xl font-serif italic text-stone-800 leading-relaxed font-light px-2">
                  "{finalGuidance?.text || "Embrace this day with complete harmony."}"
                </h3>
              </div>

              {/* Grid with Lucky items & Lucky colors */}
              <div id="assets_grid" className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-6">
                
                {/* Lucky Item Card */}
                <div className="bg-[#FAF9F6] border border-stone-200/40 rounded-xl p-5 flex flex-col justify-between min-h-[140px] shadow-[0_1px_4px_rgba(0,0,0,0.01)]">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] tracking-widest font-semibold uppercase text-stone-400">
                      Lucky Item
                    </span>
                    <Gift className="w-4 h-4 text-stone-500" />
                  </div>
                  <div className="text-stone-800 font-serif text-lg leading-snug font-light">
                    {finalItem?.name || "A comforting note"}
                  </div>
                  <div className="text-[10px] text-stone-400 mt-2 font-light leading-relaxed">
                    Carry or look for this object to anchor your daily focus.
                  </div>
                </div>

                {/* Lucky Color Card */}
                <div className="bg-[#FAF9F6] border border-stone-200/40 rounded-xl p-5 flex flex-col justify-between min-h-[140px] shadow-[0_1px_4px_rgba(0,0,0,0.01)]">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] tracking-widest font-semibold uppercase text-stone-400">
                      Lucky Colour
                    </span>
                    <div 
                      className="w-5 h-5 rounded-full border border-stone-200/80 shadow-sm transition-transform duration-300 hover:scale-110"
                      style={{ backgroundColor: finalColour?.hex || "#93c5fd" }}
                    />
                  </div>
                  <div>
                    <span className="text-stone-800 font-serif text-lg leading-none font-light block">
                      {finalColour?.name || "Celestial Blue"}
                    </span>
                    <span className="text-[10px] font-mono font-medium text-stone-400 block mt-1">
                      {finalColour?.hex || "#3B82F6"}
                    </span>
                  </div>
                  <div className="text-[10px] text-stone-400 mt-2 font-light leading-relaxed">
                    {finalColour?.description || "An enabling and harmonious color shade."}
                  </div>
                </div>

              </div>

              {/* Action bar inside cards */}
              <div className="flex items-center justify-center pt-4 border-t border-stone-100">
                <button
                  id="reset_button"
                  onClick={handleReset}
                  className="py-2.5 px-5 bg-[#FAF9F6] border border-stone-200 hover:bg-stone-50 text-stone-600 text-[11px] tracking-widest font-semibold uppercase rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>RESET TODAY'S FORTUNE</span>
                </button>
              </div>

            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer statistics clock and info */}
      <footer id="app_footer" className="w-full max-w-lg mx-auto text-center mt-4">
        {/* Informative text */}
        <p className="mt-6 text-[10px] text-stone-400 tracking-wider leading-relaxed max-w-xs mx-auto font-light uppercase">
          Client-Side Secure · No browser user-tracking data stored
        </p>
      </footer>
    </div>
  );
}
