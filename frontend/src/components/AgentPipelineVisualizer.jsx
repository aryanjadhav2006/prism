import React from "react";
import { BookOpen, User, Clock, GitFork, Feather, CheckCircle2, Loader2, Sparkles, Terminal } from "lucide-react";

export default function AgentPipelineVisualizer({ 
  agentStates, 
  activeAgentId, 
  logs, 
  error 
}) {
  const agents = [
    {
      id: "lore_agent",
      name: "Ingestion & Lore Agent",
      role: "Agent 1",
      icon: BookOpen,
      color: "from-blue-500 to-cyan-500",
      description: "Extracts factual rules, characters, and baseline timeline.",
    },
    {
      id: "character_agent",
      name: "Character Agent",
      role: "Agent 2",
      icon: User,
      color: "from-cyan-500 to-purple-500",
      description: "Establishes character profile & time-bounded knowledge state.",
    },
    {
      id: "timeline_agent",
      name: "Timeline & Continuity Agent",
      role: "Agent 3",
      icon: Clock,
      color: "from-purple-500 to-pink-500",
      description: "Maps pre-intervention world state & susceptible branches.",
    },
    {
      id: "divergence_agent",
      name: "Divergence & Butterfly Effect Agent",
      role: "Agent 4",
      icon: GitFork,
      color: "from-pink-500 to-amber-500",
      description: "Simulates 1st & 2nd order cascading consequences.",
    },
    {
      id: "writer_agent",
      name: "Narrative Writer Agent",
      role: "Agent 5",
      icon: Feather,
      color: "from-amber-500 to-emerald-500",
      description: "Transforms alternate plot outline into rich prose.",
    },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyber-purple/10 border border-cyber-purple/30 text-cyber-purple text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5 text-cyber-cyan animate-spin" />
          Real-Time Multi-Agent Reasoning Engine
        </div>
        <h1 className="text-3xl font-extrabold text-white">
          Executing Modular Multi-Agent Pipeline
        </h1>
        <p className="text-sm text-slate-400 max-w-xl mx-auto">
          Watch five specialized autonomous agents reason through lore, continuity constraints, butterfly effect ripples, and narrative generation.
        </p>
      </div>

      {/* Visual DAG Execution Graph */}
      <div className="glass-panel p-6 sm:p-10 border-cyber-purple/30 relative overflow-hidden">
        {/* Node Grid */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 relative z-10">
          {agents.map((agent, index) => {
            const state = agentStates[agent.id] || { status: "waiting" };
            const isProcessing = state.status === "processing";
            const isCompleted = state.status === "completed";
            const Icon = agent.icon;

            return (
              <div key={agent.id} className="relative flex flex-col items-center">
                {/* Node Box */}
                <div
                  className={`w-full p-4 rounded-2xl border transition-all duration-300 flex flex-col items-center text-center space-y-3 ${
                    isCompleted
                      ? "bg-emerald-950/30 border-emerald-500/50 shadow-lg shadow-emerald-500/10"
                      : isProcessing
                      ? "bg-cyber-purple/20 border-cyber-cyan shadow-xl shadow-cyber-cyan/30 animate-pulse-glow scale-105"
                      : "bg-dark-900/60 border-slate-800 opacity-60"
                  }`}
                >
                  {/* Status Badge Icon */}
                  <div className="relative">
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center text-white bg-gradient-to-tr ${agent.color}`}
                    >
                      <Icon className="w-6 h-6" />
                    </div>
                    {isCompleted && (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400 absolute -top-1 -right-1 bg-dark-900 rounded-full" />
                    )}
                    {isProcessing && (
                      <Loader2 className="w-5 h-5 text-cyber-cyan animate-spin absolute -top-1 -right-1 bg-dark-900 rounded-full" />
                    )}
                  </div>

                  {/* Agent Role & Name */}
                  <div>
                    <span className="text-[10px] font-mono font-semibold text-slate-400 uppercase tracking-wider block">
                      {agent.role}
                    </span>
                    <h4 className="text-xs font-bold text-white mt-0.5">
                      {agent.name}
                    </h4>
                  </div>

                  {/* Status Indicator Pill */}
                  <span
                    className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full ${
                      isCompleted
                        ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                        : isProcessing
                        ? "bg-cyber-cyan/20 text-cyber-cyan border border-cyber-cyan/40"
                        : "bg-slate-800 text-slate-500"
                    }`}
                  >
                    {isCompleted ? "COMPLETED" : isProcessing ? "REASONING..." : "WAITING"}
                  </span>
                </div>

                {/* Connector Line for Desktop */}
                {index < agents.length - 1 && (
                  <div className="hidden md:block absolute -right-3 top-1/2 -translate-y-1/2 z-20">
                    <div
                      className={`w-6 h-0.5 transition-all duration-500 ${
                        isCompleted
                          ? "bg-emerald-500"
                          : isProcessing
                          ? "bg-cyber-cyan animate-pulse"
                          : "bg-slate-800"
                      }`}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Error state alert */}
      {error && (
        <div className="p-4 bg-red-950/50 border border-red-500/50 rounded-2xl text-xs text-red-300 flex items-center justify-between">
          <span>{error}</span>
        </div>
      )}

      {/* Live Agent Logs & Thoughts */}
      <div className="glass-panel p-6 space-y-4">
        <div className="flex items-center gap-2 text-white font-bold text-sm border-b border-slate-800 pb-3">
          <Terminal className="w-4 h-4 text-cyber-cyan" />
          <span>Live Multi-Agent Execution Telemetry</span>
        </div>

        <div className="bg-dark-900/90 border border-slate-800 rounded-xl p-4 font-mono text-xs max-h-60 overflow-y-auto space-y-2">
          {logs.length === 0 ? (
            <p className="text-slate-500 italic">Initializing agent network pipeline...</p>
          ) : (
            logs.map((log, i) => (
              <div key={i} className="flex items-start gap-2 leading-relaxed">
                <span className="text-slate-500 text-[10px] whitespace-nowrap">
                  [{log.timestamp}]
                </span>
                <span className="text-cyber-cyan font-semibold whitespace-nowrap">
                  [{log.agent_id}]:
                </span>
                <span className="text-slate-300">{log.message}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
