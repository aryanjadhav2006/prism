import React, { useRef, useEffect } from "react";
import { Cpu, User, BookOpen, GitFork, Sparkles, Copy, Download, RefreshCw, MessageSquare, Check, Terminal, Zap, Shield, Clock } from "lucide-react";

export default function ChatStream({
  chatHistory,
  lore,
  agentStates,
  activeAgentId,
  pipelineLogs,
  pipelineError,
  isExecuting,
  result,
  onOpenCharacterChat
}) {
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory, pipelineLogs, result]);

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
      {/* Welcome / Ingestion Banner */}
      {!lore ? (
        <div className="max-w-2xl mx-auto text-center space-y-4 py-16">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-tr from-cyber-cyan via-cyber-purple to-cyber-pink p-0.5 shadow-2xl shadow-cyber-purple/30">
            <div className="w-full h-full bg-dark-900 rounded-[14px] flex items-center justify-center text-cyber-cyan">
              <Cpu className="w-8 h-8 animate-pulse" />
            </div>
          </div>
          <h2 className="text-2xl font-extrabold text-white">
            Welcome to PRISM
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto leading-relaxed">
            Upload a story file (PDF/TXT) or select a demo story from the left sidebar to initialize the 5-Agent Narrative Framework.
          </p>
        </div>
      ) : (
        <>
          {/* System Lore Card */}
          <div className="flex gap-3 max-w-4xl">
            <div className="w-8 h-8 rounded-xl bg-cyber-purple/20 border border-cyber-purple/40 text-cyber-purple flex items-center justify-center shrink-0">
              <BookOpen className="w-4 h-4" />
            </div>
            <div className="glass-panel p-5 space-y-3 border-cyber-purple/30 text-xs sm:text-sm flex-1">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="font-mono text-[11px] font-bold text-cyber-cyan uppercase">
                  ✓ Lore & World Ingestion Agent Initialized
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyber-purple/20 text-cyber-purple font-semibold">
                  {lore.genre || "Fiction"}
                </span>
              </div>
              <h3 className="text-base font-bold text-white">
                {lore.title || "Narrative World Lore"}
              </h3>
              <p className="text-slate-300 text-xs leading-relaxed">
                <strong className="text-white">Tone:</strong> {lore.narrative_tone || "Dramatic"}
              </p>

              {/* Characters Badges */}
              {lore.characters && lore.characters.length > 0 && (
                <div className="pt-2">
                  <span className="text-[11px] font-mono font-semibold text-slate-400 uppercase block mb-1.5">
                    Extracted Characters ({lore.characters.length}):
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {lore.characters.map((c, i) => (
                      <span key={i} className="text-xs px-2.5 py-1 bg-dark-900 border border-slate-800 rounded-lg text-slate-200">
                        👤 {c.name} <span className="text-[10px] text-slate-500">({c.archetype || c.role})</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Render Chat Messages Feed */}
          {chatHistory.map((item, idx) => {
            if (item.role === "user") {
              return (
                <div key={idx} className="flex flex-row-reverse gap-3 max-w-4xl ml-auto">
                  <div className="w-8 h-8 rounded-xl bg-cyber-cyan text-dark-900 font-bold text-xs flex items-center justify-center shrink-0">
                    YOU
                  </div>
                  <div className="glass-panel p-4 bg-cyber-cyan/15 border-cyber-cyan/40 text-white rounded-tr-none text-xs sm:text-sm space-y-1">
                    <div className="text-[10px] font-mono text-cyber-cyan font-bold uppercase">
                      Intervention Request • {item.character_name} @ "{item.plot_point}"
                    </div>
                    <p className="font-mono leading-relaxed">
                      "{item.intervention}"
                    </p>
                  </div>
                </div>
              );
            }

            if (item.role === "assistant_chat") {
              return (
                <div key={idx} className="flex gap-3 max-w-4xl">
                  <div className="w-8 h-8 rounded-xl bg-cyber-pink/20 border border-cyber-pink/40 text-cyber-pink font-bold text-xs flex items-center justify-center shrink-0">
                    {item.character_name[0]}
                  </div>
                  <div className="glass-panel p-4 bg-dark-900 border-slate-800 text-slate-200 rounded-tl-none text-xs sm:text-sm space-y-1">
                    <div className="text-[10px] font-mono text-cyber-pink font-bold uppercase">
                      In-Character Interrogation • {item.character_name}
                    </div>
                    <p className="leading-relaxed">{item.content}</p>
                  </div>
                </div>
              );
            }

            return null;
          })}

          {/* Live Agent Execution Box (while executing or after result) */}
          {(isExecuting || result) && (
            <div className="flex gap-3 max-w-4xl">
              <div className="w-8 h-8 rounded-xl bg-cyber-purple/20 border border-cyber-purple/40 text-cyber-purple flex items-center justify-center shrink-0">
                <Cpu className="w-4 h-4 animate-spin" />
              </div>
              <div className="glass-panel p-5 space-y-4 border-cyber-purple/40 text-xs sm:text-sm flex-1">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="font-mono text-xs font-bold text-cyber-purple flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-cyber-cyan animate-pulse" />
                    Multi-Agent Pipeline Telemetry
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/30">
                    {isExecuting ? "REASONING..." : "COMPLETED"}
                  </span>
                </div>

                {/* 5-Agent Status Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {[
                    { id: "lore_agent", name: "1. Lore" },
                    { id: "character_agent", name: "2. Character" },
                    { id: "timeline_agent", name: "3. Timeline" },
                    { id: "divergence_agent", name: "4. Divergence" },
                    { id: "writer_agent", name: "5. Writer" },
                  ].map((a) => {
                    const st = agentStates[a.id] || { status: "waiting" };
                    const isDone = st.status === "completed";
                    const isRun = st.status === "processing";
                    return (
                      <div
                        key={a.id}
                        className={`p-2 rounded-lg border text-center transition ${
                          isDone
                            ? "bg-emerald-950/30 border-emerald-500/50 text-emerald-300"
                            : isRun
                            ? "bg-cyber-cyan/20 border-cyber-cyan text-cyber-cyan animate-pulse"
                            : "bg-dark-900 border-slate-800 text-slate-500"
                        }`}
                      >
                        <span className="text-[11px] font-bold block">{a.name}</span>
                        <span className="text-[9px] font-mono uppercase">
                          {isDone ? "✓ Done" : isRun ? "Running" : "Waiting"}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Live Logs */}
                {pipelineLogs.length > 0 && (
                  <div className="bg-dark-900/90 border border-slate-800/80 rounded-xl p-3 font-mono text-[11px] max-h-36 overflow-y-auto space-y-1">
                    {pipelineLogs.map((l, i) => (
                      <div key={i} className="flex gap-2">
                        <span className="text-slate-500">[{l.timestamp}]</span>
                        <span className="text-cyber-cyan">[{l.agent_id}]:</span>
                        <span className="text-slate-300">{l.message}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Results Output Card */}
          {result && (
            <div className="flex gap-3 max-w-4xl">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyber-cyan to-cyber-purple text-dark-900 font-bold text-xs flex items-center justify-center shrink-0">
                <GitFork className="w-4 h-4 text-white" />
              </div>

              <div className="glass-panel p-6 space-y-6 border-cyber-cyan/40 text-xs sm:text-sm flex-1">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
                  <div>
                    <span className="text-[11px] font-mono text-cyber-cyan font-semibold block">
                      ALTERNATE REALITY BRANCH
                    </span>
                    <h2 className="text-xl font-extrabold text-white">
                      {result.divergence?.divergence_title || "The Divergent Branch"}
                    </h2>
                  </div>
                  <button
                    onClick={() => onOpenCharacterChat(result.character_profile?.character_name || "Character")}
                    className="flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-cyber-pink to-cyber-purple text-white text-xs font-bold rounded-xl hover:opacity-90 transition shadow-md"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Interrogate {result.character_profile?.character_name || "Character"}</span>
                  </button>
                </div>

                {/* Ripple Effect Summary Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3.5 bg-dark-900/80 border border-slate-800 rounded-xl space-y-1">
                    <span className="text-[10px] font-mono text-cyber-cyan font-bold block uppercase">
                      ⚡ Immediate (1st Order) Effect
                    </span>
                    <p className="text-xs text-slate-200">
                      {result.divergence?.immediate_consequences?.[0]?.description || result.divergence?.immediate_consequences?.[0]}
                    </p>
                  </div>
                  <div className="p-3.5 bg-dark-900/80 border border-slate-800 rounded-xl space-y-1">
                    <span className="text-[10px] font-mono text-cyber-purple font-bold block uppercase">
                      🌊 Secondary Cascading Ripple
                    </span>
                    <p className="text-xs text-slate-200">
                      {result.divergence?.secondary_consequences?.[0]?.description || result.divergence?.secondary_consequences?.[0]}
                    </p>
                  </div>
                </div>

                {/* Long-Form Narrative Story */}
                <div className="space-y-3 pt-2">
                  <span className="text-xs font-bold text-white uppercase tracking-wider block">
                    Generated Alternate Narrative (Agent 5)
                  </span>
                  <div className="p-5 bg-dark-900/90 border border-slate-800 rounded-2xl leading-relaxed font-sans text-slate-200 whitespace-pre-line text-xs sm:text-sm">
                    {result.story}
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
      <div ref={endRef} />
    </div>
  );
}
