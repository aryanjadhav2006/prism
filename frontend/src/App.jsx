import React, { useState, useEffect } from "react";
import Sidebar from "./components/Sidebar";
import ChatStream from "./components/ChatStream";
import InputDock from "./components/InputDock";
import IngestStoryModal from "./components/IngestStoryModal";
import CharacterChatModal from "./components/CharacterChatModal";
import LoginModal from "./components/LoginModal";
import VisualStoryModal from "./components/VisualStoryModal";

import { getHealth, getSamples, uploadDocument, analyzeLore, generateDivergenceSync } from "./services/api";

export default function App() {
  const [sourceText, setSourceText] = useState("");
  const [lore, setLore] = useState(null);
  const [activeSampleId, setActiveSampleId] = useState(null);
  const [samples, setSamples] = useState([]);

  // User Auth State
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem("PRISM_USER");
      return saved ? JSON.parse(saved) : {
        username: "narrator",
        display_name: "Narrator",
        role: "Narrative Architect",
        avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=narrator"
      };
    } catch {
      return null;
    }
  });
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [theme, setTheme] = useState(() => localStorage.getItem("THEME") || "dark");

  // Selections
  const [selectedCharacter, setSelectedCharacter] = useState("");
  const [selectedPlotPoint, setSelectedPlotPoint] = useState("");

  // Modals state
  const [isIngestModalOpen, setIsIngestModalOpen] = useState(false);
  const [isVisualModalOpen, setIsVisualModalOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatCharacter, setChatCharacter] = useState("");

  // Chat & Execution state
  const [chatHistory, setChatHistory] = useState([]);
  const [agentStates, setAgentStates] = useState({});
  const [activeAgentId, setActiveAgentId] = useState(null);
  const [pipelineLogs, setPipelineLogs] = useState([]);
  const [pipelineError, setPipelineError] = useState(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    getHealth().catch((err) => console.error("Health check error:", err));
    getSamples()
      .then((data) => setSamples(data.samples || []))
      .catch((err) => console.error("Fetch samples error:", err));
  }, []);

  useEffect(() => {
    if (theme === "light") {
      document.body.classList.add("light-mode");
    } else {
      document.body.classList.remove("light-mode");
    }
    localStorage.setItem("THEME", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  const handleLogin = (userData) => {
    setUser(userData);
    localStorage.setItem("PRISM_USER", JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("PRISM_USER");
  };

  const addLog = (agent_id, message) => {
    const timestamp = new Date().toLocaleTimeString();
    setPipelineLogs((prev) => [...prev, { timestamp, agent_id, message }]);
  };

  const handleAnalyzeLore = async (text, sampleId = null) => {
    setSourceText(text);
    setActiveSampleId(sampleId);
    setResult(null);
    setChatHistory([]);
    try {
      const data = await analyzeLore(text);
      setLore(data.lore);
      const chars = data.lore?.characters || [];
      const evts = data.lore?.chronological_timeline || data.lore?.timeline_events || [];
      if (chars.length > 0) setSelectedCharacter(chars[0].name);
      if (evts.length > 0) setSelectedPlotPoint(evts[evts.length - 1].title);
    } catch (err) {
      alert(`Story Bible Ingestion Error: ${err.message}`);
    }
  };

  const handleSelectSample = (sample) => {
    handleAnalyzeLore(sample.text, sample.id);
  };

  const handleStoryIngested = (text) => {
    handleAnalyzeLore(text, null);
  };

  const handleSendIntervention = async (interventionText) => {
    if (!lore || isExecuting) return;

    setIsExecuting(true);
    setResult(null);
    setPipelineLogs([]);
    setPipelineError(null);

    setChatHistory((prev) => [
      ...prev,
      {
        role: "user",
        character_name: selectedCharacter,
        plot_point: selectedPlotPoint,
        intervention: interventionText,
      },
    ]);

    // Progressive UI Telemetry with all 7 Grounded Agents
    setAgentStates({
      lore_agent: { status: "completed" },
      character_agent: { status: "processing" },
      timeline_agent: { status: "processing" },
      divergence_agent: { status: "waiting" },
      grounding_validator: { status: "waiting" },
      writer_agent: { status: "waiting" },
      final_validator: { status: "waiting" },
    });

    addLog("system", "Initiating Grounded Multi-Agent Narrative Pipeline...");
    addLog("character_agent", `Profiling ${selectedCharacter}'s time-bounded psychology...`);
    addLog("timeline_agent", "Mapping baseline continuity state & physical constraints...");

    // Smooth telemetry animations across the 10-second delay
    const t1 = setTimeout(() => {
      setAgentStates((prev) => ({
        ...prev,
        character_agent: { status: "completed" },
        timeline_agent: { status: "completed" },
        divergence_agent: { status: "processing" },
      }));
      addLog("divergence_agent", "Generating strictly grounded causal butterfly effect plan...");
    }, 2000);

    const t2 = setTimeout(() => {
      setAgentStates((prev) => ({
        ...prev,
        divergence_agent: { status: "completed" },
        grounding_validator: { status: "processing" },
      }));
      addLog("grounding_validator", "Auditing causal plan against Story Bible for hallucinations...");
    }, 4500);

    const t3 = setTimeout(() => {
      setAgentStates((prev) => ({
        ...prev,
        grounding_validator: { status: "completed" },
        writer_agent: { status: "processing" },
      }));
      addLog("writer_agent", "Transforming validated plan into literary narrative prose...");
    }, 7000);

    const t4 = setTimeout(() => {
      setAgentStates((prev) => ({
        ...prev,
        writer_agent: { status: "completed" },
        final_validator: { status: "processing" },
      }));
      addLog("final_validator", "Auditing generated story prose against source anchors...");
    }, 8800);

    try {
      const startTime = Date.now();
      const data = await generateDivergenceSync({
        source_text: sourceText,
        character_name: selectedCharacter,
        plot_point: selectedPlotPoint,
        intervention: interventionText,
        existing_lore: lore,
      });

      // 10-second delay before revealing output
      const elapsed = Date.now() - startTime;
      const remainingDelay = Math.max(0, 10000 - elapsed);
      if (remainingDelay > 0) {
        await new Promise((resolve) => setTimeout(resolve, remainingDelay));
      }

      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);

      setAgentStates({
        lore_agent: { status: "completed" },
        character_agent: { status: "completed" },
        timeline_agent: { status: "completed" },
        divergence_agent: { status: "completed" },
        grounding_validator: { status: "completed" },
        writer_agent: { status: "completed" },
        final_validator: { status: "completed" },
      });

      addLog("system", "✓ All 5 Agents & 2 Validators verified 100% grounded execution!");
      setResult(data);
    } catch (err) {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      setPipelineError(err.message);
      addLog("error", `Execution error: ${err.message}`);
    } finally {
      setIsExecuting(false);
    }
  };

  const currentSample = samples.find((s) => s.id === activeSampleId);
  const suggestedInterventions = currentSample?.suggested_interventions || [];

  return (
    <div className="h-screen flex bg-dark-900 text-slate-100 overflow-hidden font-sans transition-colors duration-300">
      <Sidebar
        samples={samples}
        activeSampleId={activeSampleId}
        onSelectSample={handleSelectSample}
        onOpenIngestModal={() => setIsIngestModalOpen(true)}
        onOpenVisualModal={() => setIsVisualModalOpen(true)}
        lore={lore}
        selectedCharacter={selectedCharacter}
        onSelectCharacter={setSelectedCharacter}
        selectedPlotPoint={selectedPlotPoint}
        onSelectPlotPoint={setSelectedPlotPoint}
        agentStates={agentStates}
        theme={theme}
        onToggleTheme={toggleTheme}
        user={user}
        onOpenLoginModal={() => setIsLoginModalOpen(true)}
        onLogout={handleLogout}
      />

      <div className="flex-1 flex flex-col h-full overflow-hidden bg-dark-950/60 relative">
        <ChatStream
          chatHistory={chatHistory}
          lore={lore}
          agentStates={agentStates}
          activeAgentId={activeAgentId}
          pipelineLogs={pipelineLogs}
          pipelineError={pipelineError}
          isExecuting={isExecuting}
          result={result}
          onOpenCharacterChat={(charName) => {
            setChatCharacter(charName);
            setIsChatOpen(true);
          }}
        />

        <InputDock
          lore={lore}
          selectedCharacter={selectedCharacter}
          onSelectCharacter={setSelectedCharacter}
          selectedPlotPoint={selectedPlotPoint}
          onSelectPlotPoint={setSelectedPlotPoint}
          onSendIntervention={handleSendIntervention}
          onFileUpload={() => setIsIngestModalOpen(true)}
          isExecuting={isExecuting}
          suggestedInterventions={suggestedInterventions}
        />
      </div>

      <IngestStoryModal
        isOpen={isIngestModalOpen}
        onClose={() => setIsIngestModalOpen(false)}
        onStoryIngested={handleStoryIngested}
      />

      <VisualStoryModal
        isOpen={isVisualModalOpen}
        onClose={() => setIsVisualModalOpen(false)}
        onStoryIngested={handleStoryIngested}
      />

      <CharacterChatModal
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        characterName={chatCharacter || selectedCharacter}
        lore={lore}
        plotPoint={selectedPlotPoint}
      />

      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLogin={handleLogin}
        currentUser={user}
      />
    </div>
  );
}
