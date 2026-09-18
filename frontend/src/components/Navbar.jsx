import React from "react";
import { Sparkles, BookOpen, Key, RefreshCw, Cpu, Layers } from "lucide-react";

export default function Navbar({ 
  currentStep, 
  onReset, 
  onOpenSamples, 
  onOpenApiKey, 
  hasApiKey 
}) {
  const steps = [
    { id: 1, label: "1. Upload Story" },
    { id: 2, label: "2. Lore Intel" },
    { id: 3, label: "3. Intervention" },
    { id: 4, label: "4. Multi-Agent Pipeline" },
    { id: 5, label: "5. Alternate Reality" },
  ];

  return (
    <header className="sticky top-0 z-40 bg-dark-900/90 backdrop-blur-md border-b border-slate-800/80 px-4 lg:px-8 py-3.5">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-3 cursor-pointer" onClick={onReset}>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyber-cyan to-cyber-purple p-0.5 shadow-lg shadow-cyber-purple/20">
            <div className="w-full h-full bg-dark-900 rounded-[10px] flex items-center justify-center">
              <Cpu className="w-5 h-5 text-cyber-cyan animate-pulse" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg tracking-wide bg-gradient-to-r from-white via-slate-200 to-cyber-cyan bg-clip-text text-transparent">
                CHRONO-AGENT
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyber-purple/20 border border-cyber-purple/40 text-cyber-purple font-semibold">
                MVP
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium">
              Multi-Agent Narrative Framework
            </p>
          </div>
        </div>

        {/* Pipeline Step Progress Bar */}
        <div className="hidden md:flex items-center gap-1.5 bg-dark-800/60 p-1.5 rounded-xl border border-slate-800">
          {steps.map((step) => {
            const isActive = currentStep === step.id;
            const isDone = currentStep > step.id;
            return (
              <div
                key={step.id}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
                  isActive
                    ? "bg-gradient-to-r from-cyber-cyan/20 to-cyber-purple/20 text-cyber-cyan border border-cyber-cyan/40 shadow-sm"
                    : isDone
                    ? "text-slate-300 bg-slate-800/40"
                    : "text-slate-500"
                }`}
              >
                {step.label}
              </div>
            );
          })}
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={onOpenSamples}
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold bg-dark-800 hover:bg-slate-800 text-slate-200 border border-slate-700/80 transition shadow-sm"
          >
            <BookOpen className="w-4 h-4 text-cyber-cyan" />
            <span className="hidden sm:inline">Demo Stories</span>
          </button>

          <button
            onClick={onOpenApiKey}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold border transition shadow-sm ${
              hasApiKey
                ? "bg-emerald-950/40 border-emerald-500/40 text-emerald-400"
                : "bg-amber-950/40 border-amber-500/40 text-amber-300"
            }`}
          >
            <Key className="w-4 h-4" />
            <span className="hidden sm:inline">
              {hasApiKey ? "Gemini Key Set" : "Add API Key"}
            </span>
          </button>

          {currentStep > 1 && (
            <button
              onClick={onReset}
              className="p-2 rounded-xl bg-dark-800 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-700/80 transition"
              title="Start Over"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
