import React from "react";
import { X, BookOpen, Sparkles, ArrowRight } from "lucide-react";

export default function SampleStoryPickerModal({ 
  isOpen, 
  onClose, 
  samples, 
  onSelectSample 
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="glass-panel w-full max-w-3xl max-h-[90vh] overflow-y-auto p-6 border-slate-700/80 shadow-2xl relative">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-cyber-cyan/10 border border-cyber-cyan/30 rounded-xl text-cyber-cyan">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              Select Demo Story Dataset
              <Sparkles className="w-4 h-4 text-cyber-amber" />
            </h2>
            <p className="text-sm text-slate-400">
              Pick a rich, pre-parsed narrative source to immediately test multi-agent narrative divergence.
            </p>
          </div>
        </div>

        {/* Samples List */}
        <div className="space-y-4">
          {samples.map((sample) => (
            <div
              key={sample.id}
              onClick={() => onSelectSample(sample)}
              className="group glass-panel p-5 border-slate-800 hover:border-cyber-purple/50 hover:bg-slate-800/60 cursor-pointer transition-all duration-200"
            >
              <div className="flex items-start justify-between gap-4 mb-2">
                <div>
                  <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded bg-cyber-purple/20 text-cyber-purple border border-cyber-purple/30">
                    {sample.genre}
                  </span>
                  <h3 className="text-lg font-bold text-white group-hover:text-cyber-cyan transition mt-1">
                    {sample.title}
                  </h3>
                </div>
                <div className="p-2 rounded-lg bg-dark-900 group-hover:bg-cyber-cyan group-hover:text-dark-900 text-slate-400 transition">
                  <ArrowRight className="w-5 h-5" />
                </div>
              </div>

              <p className="text-xs text-slate-300 mb-4 leading-relaxed">
                {sample.description}
              </p>

              {/* Sample suggested interventions */}
              {sample.suggested_interventions && sample.suggested_interventions.length > 0 && (
                <div className="pt-3 border-t border-slate-800/80">
                  <p className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold mb-1.5">
                    Included Intervention Point:
                  </p>
                  <p className="text-xs text-cyber-cyan font-mono bg-dark-900/60 p-2 rounded-lg border border-slate-800">
                    "{sample.suggested_interventions[0].intervention}"
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
