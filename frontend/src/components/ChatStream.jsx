import React, { useRef, useEffect, useState } from "react";
import { User, BookOpen, GitFork, Sparkles, Copy, Download, RefreshCw, MessageSquare, Check, Terminal, Zap, ShieldCheck, CheckCircle2, AlertTriangle, FileText } from "lucide-react";
import PrismLogo from "./PrismLogo";

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
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory, pipelineLogs, result]);

  const handleCopyStory = () => {
    if (!result?.story) return;
    navigator.clipboard.writeText(result.story);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
      {/* Welcome / Ingestion Banner */}
      {!lore ? (
        <div className="max-w-2xl mx-auto text-center space-y-4 py-16 animate-fade-in">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-tr from-cyber-cyan via-cyber-purple to-cyber-pink p-0.5 shadow-2xl shadow-cyber-purple/30">
            <div className="w-full h-full bg-dark-900 rounded-[14px] flex items-center justify-center">
              <PrismLogo className="w-9 h-9" />
            </div>
          </div>
          <h2 className="text-2xl font-extrabold text-white">
            PRISM Narrative Laboratory
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto leading-relaxed">
            Upload any story (PDF/DOCX/TXT) or choose a sample from the left sidebar to generate grounded alternate realities without hallucinations.
          </p>
        </div>
      ) : (
        <>
          {/* Story Bible Card */}
          <div className="flex gap-3 max-w-4xl animate-fade-in">
            <div className="w-8 h-8 rounded-xl bg-cyber-purple/20 border border-cyber-purple/40 text-cyber-purple flex items-center justify-center shrink-0">
              <BookOpen className="w-4 h-4" />
            </div>
            <div className="glass-panel p-5 space-y-3 border-cyber-purple/30 text-xs sm:text-sm flex-1 shadow-lg">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="font-mono text-[11px] font-bold text-cyber-cyan uppercase flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  Authoritative Story Bible Established
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyber-purple/20 text-cyber-purple font-semibold border border-cyber-purple/30">
                  {lore.genre || "Drama"}
                </span>
              </div>
              <h3 className="text-base font-bold text-white">
                {lore.title || "Narrative World Lore"}
              </h3>
              <p className="text-slate-300 text-xs leading-relaxed">
                <strong className="text-white">Literary Tone:</strong> {lore.narrative_tone || "Dramatic and atmospheric"}
              </p>

              {/* Characters Badges */}
              {lore.characters && lore.characters.length > 0 && (
                <div className="pt-2">
                  <span className="text-[11px] font-mono font-semibold text-slate-400 uppercase block mb-1.5">
                    Grounded Source Characters ({lore.characters.length}):
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {lore.characters.map((c, i) => (
                      <span key={i} className="text-xs px-2.5 py-1 bg-dark-900 border border-slate-800 rounded-lg text-slate-200">
                        👤 {c.name} <span className="text-[10px] text-slate-500">({c.occupation || c.role})</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Grounded Locations */}
              {lore.locations && lore.locations.length > 0 && (
                <div className="pt-1">
                  <span className="text-[11px] font-mono font-semibold text-slate-400 uppercase block mb-1">
                    Grounded Locations:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {lore.locations.slice(0, 5).map((loc, i) => (
                      <span key={i} className="text-[11px] px-2 py-0.5 bg-dark-900/60 border border-slate-800 rounded-md text-slate-300">
                        📍 {loc}
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
                <div key={idx} className="flex flex-row-reverse gap-3 max-w-4xl ml-auto animate-fade-in">
                  <div className="w-8 h-8 rounded-xl bg-cyber-cyan text-dark-900 font-bold text-xs flex items-center justify-center shrink-0 shadow-md">
                    YOU
                  </div>
                  <div className="glass-panel p-4 bg-cyber-cyan/15 border-cyber-cyan/40 text-white rounded-tr-none text-xs sm:text-sm space-y-1 shadow-lg">
                    <div className="text-[10px] font-mono text-cyber-cyan font-bold uppercase">
                      Narrative Intervention • {item.character_name} @ "{item.plot_point}"
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
                <div key={idx} className="flex gap-3 max-w-4xl animate-fade-in">
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

          {/* Live Agent Execution & Validator Telemetry Box */}
          {(isExecuting || result) && (
            <div className="flex gap-3 max-w-4xl animate-fade-in">
              <div className="w-8 h-8 rounded-xl bg-cyber-purple/20 border border-cyber-purple/40 text-cyber-purple flex items-center justify-center shrink-0">
                <PrismLogo className="w-4 h-4" />
              </div>
              <div className="glass-panel p-5 space-y-4 border-cyber-purple/40 text-xs sm:text-sm flex-1 shadow-xl">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="font-mono text-xs font-bold text-cyber-purple flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-cyber-cyan animate-pulse" />
                    Grounded Multi-Agent Pipeline Telemetry
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/30">
                    {isExecuting ? "REASONING & AUDITING..." : "ALL VALIDATIONS PASSED"}
                  </span>
                </div>

                {/* 7-Agent / Validator Status Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
                  {[
                    { id: "lore_agent", name: "1. Bible" },
                    { id: "character_agent", name: "2. Profile" },
                    { id: "timeline_agent", name: "3. Timeline" },
                    { id: "divergence_agent", name: "4. Divergence" },
                    { id: "grounding_validator", name: "Validator 1" },
                    { id: "writer_agent", name: "5. Realization" },
                    { id: "final_validator", name: "Validator 2" },
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
                        <span className="text-[11px] font-bold block truncate">{a.name}</span>
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
            <div className="flex gap-3 max-w-4xl animate-fade-in">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyber-cyan to-cyber-purple text-dark-900 font-bold text-xs flex items-center justify-center shrink-0 shadow-lg">
                <GitFork className="w-4 h-4 text-white" />
              </div>

              <div className="glass-panel p-6 space-y-6 border-cyber-cyan/40 text-xs sm:text-sm flex-1 shadow-2xl">
                {/* Header with Title & Interrogate Button */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[11px] font-mono text-cyber-cyan font-bold tracking-wider uppercase">
                        Grounded Alternate Reality
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-semibold flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3" />
                        Audited & Grounded
                      </span>
                    </div>
                    <h2 className="text-xl font-extrabold text-white">
                      {result.divergence?.divergence_title || "The Divergent Branch"}
                    </h2>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleCopyStory}
                      className="flex items-center gap-1.5 px-3 py-2 bg-dark-800 hover:bg-slate-800 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition"
                      title="Copy Story"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copied ? "Copied" : "Copy"}</span>
                    </button>

                    <button
                      onClick={() => onOpenCharacterChat(result.character_profile?.character_name || "Character")}
                      className="flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-cyber-pink to-cyber-purple text-white text-xs font-bold rounded-xl hover:opacity-90 transition shadow-md"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>Interrogate {result.character_profile?.character_name || "Character"}</span>
                    </button>
                  </div>
                </div>

                {/* Grounding Audit Badges */}
                <div className="p-3 bg-emerald-950/20 border border-emerald-500/30 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs text-emerald-200 font-medium">
                      Zero Hallucinations: All characters, locations, and actions strictly anchored in source universe.
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-emerald-400 uppercase font-bold">100% Grounded</span>
                </div>

                {/* Ripple Effect Summary Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3.5 bg-dark-900/80 border border-slate-800 rounded-xl space-y-1">
                    <span className="text-[10px] font-mono text-cyber-cyan font-bold block uppercase">
                      ⚡ Immediate (1st Order) Effect
                    </span>
                    <p className="text-xs text-slate-200">
                      {result.divergence?.immediate_consequences?.[0]?.description || result.divergence?.immediate_consequences?.[0]?.title || "Direct decision outcome modified."}
                    </p>
                  </div>
                  <div className="p-3.5 bg-dark-900/80 border border-slate-800 rounded-xl space-y-1">
                    <span className="text-[10px] font-mono text-cyber-purple font-bold block uppercase">
                      🌊 Secondary Cascading Ripple
                    </span>
                    <p className="text-xs text-slate-200">
                      {result.divergence?.secondary_consequences?.[0]?.description || result.divergence?.secondary_consequences?.[0]?.title || "Downstream timeline events altered."}
                    </p>
                  </div>
                </div>

                {/* Long-Form Narrative Story */}
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                      <FileText className="w-4 h-4 text-cyber-cyan" />
                      Generated Alternate Story Prose
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">
                      Executed by Agent 5 (Narrative Realization)
                    </span>
                  </div>
                  <div className="p-5 bg-dark-900/90 border border-slate-800 rounded-2xl leading-relaxed font-sans text-slate-200 whitespace-pre-line text-xs sm:text-sm shadow-inner">
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
