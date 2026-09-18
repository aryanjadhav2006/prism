import React from "react";
import { Users, Shield, Clock, MapPin, Sparkles, ArrowRight, BookOpen } from "lucide-react";

export default function LoreOverview({ lore, onProceed }) {
  if (!lore) return null;

  const characters = lore.characters || [];
  const events = lore.timeline_events || [];
  const rules = lore.world_rules || [];
  const locations = lore.locations || [];

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fadeIn">
      {/* Header Summary Card */}
      <div className="glass-panel p-6 sm:p-8 border-cyber-cyan/30 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[11px] font-mono font-semibold px-2.5 py-1 rounded-full bg-cyber-cyan/15 text-cyber-cyan border border-cyber-cyan/30">
                {lore.genre || "Narrative Universe"}
              </span>
              <span className="text-xs text-slate-400 font-mono">
                Tone: {lore.narrative_tone || "Dramatic"}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
              {lore.title || "Extracted Narrative World Lore"}
            </h1>
          </div>
          <button
            onClick={onProceed}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyber-cyan to-cyber-purple text-white text-xs font-bold rounded-xl hover:opacity-90 transition shadow-lg shadow-cyber-purple/20"
          >
            <span>Proceed to Intervention</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Discovered Characters & World Rules */}
        <div className="lg:col-span-2 space-y-6">
          {/* Discovered Characters */}
          <div className="glass-panel p-6 space-y-4">
            <div className="flex items-center gap-2 text-white font-bold text-base border-b border-slate-800 pb-3">
              <Users className="w-5 h-5 text-cyber-cyan" />
              <span>Extracted Characters ({characters.length})</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {characters.map((char, i) => (
                <div
                  key={i}
                  className="p-4 bg-dark-900/80 border border-slate-800 rounded-xl space-y-2 hover:border-slate-700 transition"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-sm text-white">{char.name}</h3>
                    <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-cyber-purple/20 text-cyber-purple">
                      {char.archetype || char.role || "Character"}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {char.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* World Rules */}
          <div className="glass-panel p-6 space-y-4">
            <div className="flex items-center gap-2 text-white font-bold text-base border-b border-slate-800 pb-3">
              <Shield className="w-5 h-5 text-cyber-amber" />
              <span>Established World Rules & Constraints</span>
            </div>
            <div className="space-y-2">
              {rules.map((rule, i) => (
                <div
                  key={i}
                  className="flex items-start gap-2.5 p-3 bg-dark-900/60 border border-slate-800/80 rounded-xl text-xs text-slate-200"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-cyber-amber mt-1.5 flex-shrink-0" />
                  <span>{rule}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Timeline Events */}
        <div className="glass-panel p-6 space-y-4 h-fit">
          <div className="flex items-center gap-2 text-white font-bold text-base border-b border-slate-800 pb-3">
            <Clock className="w-5 h-5 text-cyber-purple" />
            <span>Chronological Timeline ({events.length})</span>
          </div>

          <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800">
            {events.map((evt, i) => (
              <div key={i} className="relative group">
                <div className="absolute -left-6 top-1 w-3 h-3 rounded-full bg-dark-900 border-2 border-cyber-purple group-hover:border-cyber-cyan transition" />
                <h4 className="text-xs font-bold text-white group-hover:text-cyber-cyan transition">
                  {evt.title}
                </h4>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  {evt.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
