import React from "react";
import { Cpu, Upload, BookOpen, Users, Clock, Shield, ChevronRight, CheckCircle2, CircleDashed, Sun, Moon } from "lucide-react";

export default function Sidebar({
  samples,
  activeSampleId,
  onSelectSample,
  onOpenIngestModal,
  lore,
  selectedCharacter,
  onSelectCharacter,
  selectedPlotPoint,
  onSelectPlotPoint,
  agentStates,
  theme,
  onToggleTheme
}) {
  const characters = lore?.characters || [];
  const events = lore?.timeline_events || [];
  const rules = lore?.world_rules || [];

  const agentList = [
    { id: "lore_agent", label: "Agent 1: Ingestion & Lore" },
    { id: "character_agent", label: "Agent 2: Character Profile" },
    { id: "timeline_agent", label: "Agent 3: Timeline & Continuity" },
    { id: "divergence_agent", label: "Agent 4: Butterfly Effect" },
    { id: "writer_agent", label: "Agent 5: Narrative Writer" },
  ];

  return (
    <aside className="w-80 border-r border-slate-800 bg-dark-900/95 flex flex-col h-full overflow-hidden shrink-0 select-none">
      {/* Brand Header */}
      <div className="p-4 border-b border-slate-800/80 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyber-cyan via-cyber-purple to-cyber-pink p-0.5 shadow-lg shadow-cyber-purple/20">
            <div className="w-full h-full bg-dark-900 rounded-[10px] flex items-center justify-center">
              <Cpu className="w-5 h-5 text-cyber-cyan animate-pulse" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-sm tracking-wide text-white">
                PRISM
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-cyber-purple/20 text-cyber-purple font-semibold border border-cyber-purple/30">
                LAB
              </span>
            </div>
            <p className="text-[11px] text-slate-400">Multi-Agent Narrative AI</p>
          </div>
        </div>

        {/* Theme Toggle Button */}
        <button
          onClick={onToggleTheme}
          className="p-2 rounded-xl bg-dark-800 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-700/80 transition"
          title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
        >
          {theme === "dark" ? <Sun className="w-4 h-4 text-cyber-amber" /> : <Moon className="w-4 h-4 text-cyber-purple" />}
        </button>
      </div>

      {/* Main Sidebar Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Upload / Paste Action */}
        <button
          onClick={onOpenIngestModal}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-gradient-to-r from-cyber-cyan/15 to-cyber-purple/15 hover:from-cyber-cyan/25 hover:to-cyber-purple/25 border border-cyber-cyan/30 text-cyber-cyan text-xs font-bold transition shadow-sm"
        >
          <Upload className="w-4 h-4" />
          <span>Upload File or Paste Raw Text</span>
        </button>

        {/* Demo Datasets */}
        <div className="space-y-2">
          <span className="text-[11px] uppercase tracking-wider font-mono text-slate-500 font-semibold block px-1">
            Demo Story Datasets
          </span>
          <div className="space-y-1.5">
            {samples.map((s) => {
              const isActive = activeSampleId === s.id;
              return (
                <div
                  key={s.id}
                  onClick={() => onSelectSample(s)}
                  className={`p-2.5 rounded-xl border text-xs cursor-pointer transition flex items-center justify-between group ${
                    isActive
                      ? "bg-cyber-purple/20 border-cyber-purple/50 text-white font-semibold"
                      : "bg-dark-800/40 border-slate-800/80 text-slate-300 hover:border-slate-700 hover:bg-dark-800/80"
                  }`}
                >
                  <div className="flex items-center gap-2 overflow-hidden">
                    <BookOpen className={`w-3.5 h-3.5 flex-shrink-0 ${isActive ? "text-cyber-cyan" : "text-slate-500"}`} />
                    <span className="truncate">{s.title.split(":")[0]}</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-white transition" />
                </div>
              );
            })}
          </div>
        </div>

        {/* Active Lore Memory */}
        {lore && (
          <div className="space-y-4 pt-2 border-t border-slate-800">
            {/* Characters */}
            <div className="space-y-2">
              <span className="text-[11px] uppercase tracking-wider font-mono text-slate-500 font-semibold flex items-center justify-between px-1">
                <span>Discovered Characters</span>
                <Users className="w-3.5 h-3.5 text-cyber-cyan" />
              </span>
              <div className="flex flex-wrap gap-1.5">
                {characters.map((c, i) => {
                  const isSelected = selectedCharacter === c.name;
                  return (
                    <button
                      key={i}
                      onClick={() => onSelectCharacter(c.name)}
                      className={`text-[11px] px-2.5 py-1 rounded-lg border font-medium transition ${
                        isSelected
                          ? "bg-cyber-cyan/20 border-cyber-cyan text-cyber-cyan font-bold"
                          : "bg-dark-800 text-slate-300 border-slate-800 hover:border-slate-700"
                      }`}
                    >
                      {c.name}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Checkpoints */}
            <div className="space-y-2">
              <span className="text-[11px] uppercase tracking-wider font-mono text-slate-500 font-semibold flex items-center justify-between px-1">
                <span>Timeline Checkpoints</span>
                <Clock className="w-3.5 h-3.5 text-cyber-purple" />
              </span>
              <select
                value={selectedPlotPoint}
                onChange={(e) => onSelectPlotPoint(e.target.value)}
                className="w-full p-2 bg-dark-800 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-cyber-purple transition"
              >
                {events.map((e, idx) => (
                  <option key={idx} value={e.title}>
                    #{idx + 1}: {e.title}
                  </option>
                ))}
              </select>
            </div>

            {/* World Rules */}
            {rules.length > 0 && (
              <div className="space-y-2">
                <span className="text-[11px] uppercase tracking-wider font-mono text-slate-500 font-semibold flex items-center justify-between px-1">
                  <span>World Rules</span>
                  <Shield className="w-3.5 h-3.5 text-cyber-amber" />
                </span>
                <div className="space-y-1">
                  {rules.slice(0, 3).map((r, idx) => (
                    <p key={idx} className="text-[11px] text-slate-400 leading-snug bg-dark-800/40 p-2 rounded-lg border border-slate-800/60">
                      • {r}
                    </p>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Live Multi-Agent Status */}
        <div className="pt-2 border-t border-slate-800 space-y-2">
          <span className="text-[11px] uppercase tracking-wider font-mono text-slate-500 font-semibold block px-1">
            Agent Execution Network
          </span>
          <div className="space-y-1.5">
            {agentList.map((a) => {
              const state = agentStates[a.id] || { status: "waiting" };
              const isComp = state.status === "completed";
              const isProc = state.status === "processing";

              return (
                <div key={a.id} className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-dark-800/30 border border-slate-800/50 text-[11px]">
                  <span className={`font-medium ${isComp ? "text-emerald-400" : isProc ? "text-cyber-cyan font-bold" : "text-slate-500"}`}>
                    {a.label}
                  </span>
                  {isComp && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                  {isProc && <div className="w-2.5 h-2.5 rounded-full bg-cyber-cyan animate-ping" />}
                  {!isComp && !isProc && <CircleDashed className="w-3.5 h-3.5 text-slate-600" />}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </aside>
  );
}
