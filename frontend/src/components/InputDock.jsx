import React, { useState } from "react";
import { Send, Sparkles, Paperclip, User, Clock, ChevronUp } from "lucide-react";

export default function InputDock({
  lore,
  selectedCharacter,
  onSelectCharacter,
  selectedPlotPoint,
  onSelectPlotPoint,
  onSendIntervention,
  onFileUpload,
  isExecuting,
  suggestedInterventions = []
}) {
  const [prompt, setPrompt] = useState("");
  const characters = lore?.characters || [];
  const events = lore?.timeline_events || [];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!prompt.trim() || isExecuting) return;
    onSendIntervention(prompt.trim());
    setPrompt("");
  };

  const handleChipClick = (preset) => {
    if (preset.character) onSelectCharacter(preset.character);
    if (preset.plot_point) onSelectPlotPoint(preset.plot_point);
    setPrompt(preset.intervention);
  };

  return (
    <div className="border-t border-slate-800 bg-dark-900/95 p-3 sm:p-4 space-y-3 shrink-0">
      {/* Suggested Intervention Preset Chips */}
      {suggestedInterventions.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <span className="text-[10px] font-mono font-bold text-slate-500 uppercase shrink-0">
            Suggested Interventions:
          </span>
          {suggestedInterventions.map((item, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleChipClick(item)}
              className="text-xs text-cyber-cyan bg-cyber-cyan/10 hover:bg-cyber-cyan/20 border border-cyber-cyan/30 px-2.5 py-1 rounded-lg transition whitespace-nowrap shrink-0"
            >
              "{item.intervention}"
            </button>
          ))}
        </div>
      )}

      {/* Selector Pills Row */}
      {lore && (
        <div className="flex items-center gap-2 text-xs">
          {/* Character Chip Dropdown */}
          <div className="relative flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-dark-800 border border-slate-700 text-slate-300">
            <User className="w-3.5 h-3.5 text-cyber-cyan" />
            <select
              value={selectedCharacter}
              onChange={(e) => onSelectCharacter(e.target.value)}
              className="bg-transparent text-white font-semibold focus:outline-none cursor-pointer pr-1"
            >
              {characters.map((c, i) => (
                <option key={i} value={c.name} className="bg-dark-900 text-white">
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Timeline Locus Dropdown */}
          <div className="relative flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-dark-800 border border-slate-700 text-slate-300 max-w-xs truncate">
            <Clock className="w-3.5 h-3.5 text-cyber-purple shrink-0" />
            <select
              value={selectedPlotPoint}
              onChange={(e) => onSelectPlotPoint(e.target.value)}
              className="bg-transparent text-white font-semibold focus:outline-none cursor-pointer truncate"
            >
              {events.map((e, idx) => (
                <option key={idx} value={e.title} className="bg-dark-900 text-white">
                  #{idx + 1}: {e.title}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Conversational Input Bar */}
      <form onSubmit={handleSubmit} className="flex items-center gap-2">
        {/* Hidden File Input */}
        <input
          type="file"
          id="file-dock-upload"
          accept=".pdf,.docx,.doc,.txt,.md"
          className="hidden"
          onChange={(e) => e.target.files && onFileUpload(e.target.files[0])}
        />
        <label
          htmlFor="file-dock-upload"
          className="p-2.5 rounded-xl bg-dark-800 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-700/80 transition cursor-pointer shrink-0"
          title="Upload story file (PDF/TXT)"
        >
          <Paperclip className="w-4 h-4" />
        </label>

        {/* Text Input */}
        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder={
            lore
              ? `What if ${selectedCharacter || "the character"} made a different choice at "${selectedPlotPoint || "this plot point"}"?`
              : "Upload a story file or paste text to start..."
          }
          disabled={!lore || isExecuting}
          className="flex-1 px-4 py-3 bg-dark-800/90 border border-slate-700/80 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyber-cyan focus:ring-1 focus:ring-cyber-cyan transition font-mono disabled:opacity-50"
        />

        {/* Submit Button */}
        <button
          type="submit"
          disabled={!lore || !prompt.trim() || isExecuting}
          className="px-4 py-3 bg-gradient-to-r from-cyber-cyan via-cyber-purple to-cyber-pink text-white rounded-xl text-xs font-bold hover:opacity-90 transition disabled:opacity-50 flex items-center gap-1.5 shadow-lg shadow-cyber-purple/20 shrink-0"
        >
          <Sparkles className="w-4 h-4 text-cyber-amber" />
          <span className="hidden sm:inline">DIVERGE</span>
        </button>
      </form>
    </div>
  );
}
