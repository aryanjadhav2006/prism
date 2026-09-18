import React, { useState } from "react";
import { User, Clock, Zap, Sparkles, GitFork, MessageSquare } from "lucide-react";

export default function CharacterTimelineSelector({ 
  lore, 
  onStartPipeline,
  suggestedInterventions = [] 
}) {
  const characters = lore?.characters || [];
  const events = lore?.timeline_events || [];

  const [selectedCharacter, setSelectedCharacter] = useState(characters[0]?.name || "");
  const [selectedPlotPoint, setSelectedPlotPoint] = useState(
    events[events.length - 1]?.title || "Climactic Decision Point"
  );
  const [intervention, setIntervention] = useState("");
  const [selectedCapability, setSelectedCapability] = useState("divergence");

  const handlePresetClick = (preset) => {
    if (preset.character) setSelectedCharacter(preset.character);
    if (preset.plot_point) setSelectedPlotPoint(preset.plot_point);
    setIntervention(preset.intervention);
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!selectedCharacter || !intervention.trim()) return;
    onStartPipeline({
      character_name: selectedCharacter,
      plot_point: selectedPlotPoint,
      intervention: intervention.trim(),
      capability: selectedCapability,
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fadeIn">
      {/* Title */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyber-cyan/10 border border-cyber-cyan/30 text-cyber-cyan text-xs font-semibold">
          <GitFork className="w-3.5 h-3.5" />
          Step 3: Narrative Intervention Workshop
        </div>
        <h1 className="text-3xl font-extrabold text-white">
          Alter a Decision & Trigger Narrative Divergence
        </h1>
        <p className="text-sm text-slate-400 max-w-xl mx-auto">
          Choose a protagonist, pinpoint a moment in time, and inject a "What If" intervention. Our multi-agent system will calculate the butterfly effect.
        </p>
      </div>

      <form onSubmit={handleFormSubmit} className="space-y-6">
        {/* Capability Picker */}
        <div className="glass-panel p-5 space-y-3">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">
            Select Narrative Capability
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div
              onClick={() => setSelectedCapability("divergence")}
              className={`p-4 rounded-xl border cursor-pointer transition flex items-start gap-3 ${
                selectedCapability === "divergence"
                  ? "bg-cyber-purple/20 border-cyber-purple text-white"
                  : "bg-dark-900/60 border-slate-800 text-slate-400 hover:border-slate-700"
              }`}
            >
              <GitFork className="w-5 h-5 text-cyber-cyan mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-white">Narrative Divergence (Butterfly Effect)</h4>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Change a decision and simulate direct & secondary cascading consequences.
                </p>
              </div>
            </div>

            <div
              onClick={() => setSelectedCapability("perspective")}
              className={`p-4 rounded-xl border cursor-pointer transition flex items-start gap-3 ${
                selectedCapability === "perspective"
                  ? "bg-cyber-purple/20 border-cyber-purple text-white"
                  : "bg-dark-900/60 border-slate-800 text-slate-400 hover:border-slate-700"
              }`}
            >
              <User className="w-5 h-5 text-cyber-pink mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-white">Perspective Shift / Spin-Off</h4>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Focus strictly on a selected character's internal viewpoint and trajectory.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 1. Character Selection */}
        <div className="glass-panel p-6 space-y-4">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <User className="w-4 h-4 text-cyber-cyan" />
            1. Select Focus Character
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {characters.map((char, i) => {
              const isSelected = selectedCharacter === char.name;
              return (
                <div
                  key={i}
                  onClick={() => setSelectedCharacter(char.name)}
                  className={`p-3.5 rounded-xl border cursor-pointer transition text-left ${
                    isSelected
                      ? "bg-cyber-cyan/20 border-cyber-cyan text-white shadow-lg shadow-cyber-cyan/10"
                      : "bg-dark-900/60 border-slate-800 text-slate-300 hover:border-slate-700"
                  }`}
                >
                  <h4 className="font-bold text-xs">{char.name}</h4>
                  <p className="text-[10px] text-slate-400 truncate mt-0.5">
                    {char.archetype || char.role}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* 2. Timeline Checkpoint Selection */}
        <div className="glass-panel p-6 space-y-4">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <Clock className="w-4 h-4 text-cyber-purple" />
            2. Select Timeline Checkpoint Locus
          </label>
          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
            {events.map((evt, i) => {
              const isSelected = selectedPlotPoint === evt.title;
              return (
                <div
                  key={i}
                  onClick={() => setSelectedPlotPoint(evt.title)}
                  className={`p-3 rounded-xl border cursor-pointer transition flex items-center justify-between text-xs ${
                    isSelected
                      ? "bg-cyber-purple/20 border-cyber-purple text-white"
                      : "bg-dark-900/60 border-slate-800 text-slate-300 hover:border-slate-700"
                  }`}
                >
                  <span className="font-semibold">{evt.title}</span>
                  <span className="text-[10px] font-mono text-slate-500">
                    Checkpoint #{i + 1}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* 3. What-If Intervention Prompt */}
        <div className="glass-panel p-6 space-y-4">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <Zap className="w-4 h-4 text-cyber-amber" />
            3. Enter "What If" Intervention Instruction
          </label>

          {/* Preset Chips */}
          {suggestedInterventions.length > 0 && (
            <div className="space-y-2">
              <span className="text-[11px] text-slate-500 font-medium">Suggested Interventions:</span>
              <div className="flex flex-wrap gap-2">
                {suggestedInterventions.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handlePresetClick(preset)}
                    className="text-xs text-cyber-cyan bg-cyber-cyan/10 hover:bg-cyber-cyan/20 border border-cyber-cyan/30 px-3 py-1.5 rounded-lg transition text-left"
                  >
                    "{preset.intervention}"
                  </button>
                ))}
              </div>
            </div>
          )}

          <textarea
            rows={3}
            value={intervention}
            onChange={(e) => setIntervention(e.target.value)}
            placeholder={`What if ${selectedCharacter || "the character"} made a completely different choice at this exact moment?`}
            className="w-full p-4 bg-dark-900 border border-slate-700 rounded-2xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyber-cyan focus:ring-1 focus:ring-cyber-cyan transition font-mono leading-relaxed"
          />
        </div>

        {/* Submit CTA */}
        <div className="flex justify-center pt-2">
          <button
            type="submit"
            disabled={!selectedCharacter || !intervention.trim()}
            className="w-full sm:w-auto px-10 py-4 bg-gradient-to-r from-cyber-cyan via-cyber-purple to-cyber-pink text-white text-sm font-extrabold rounded-2xl hover:opacity-95 transition shadow-2xl shadow-cyber-purple/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 tracking-wide"
          >
            <Sparkles className="w-5 h-5 text-cyber-amber animate-spin" />
            <span>GENERATE ALTERNATE REALITY</span>
          </button>
        </div>
      </form>
    </div>
  );
}
