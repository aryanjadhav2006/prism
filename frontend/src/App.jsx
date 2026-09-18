import React, { useState, useEffect } from "react";
import Sidebar from "./components/Sidebar";
import ChatStream from "./components/ChatStream";
import InputDock from "./components/InputDock";
import IngestStoryModal from "./components/IngestStoryModal";
import CharacterChatModal from "./components/CharacterChatModal";

import { getHealth, getSamples, uploadDocument, analyzeLore, generateDivergenceSync } from "./services/api";

export default function App() {
  const [sourceText, setSourceText] = useState("");
  const [lore, setLore] = useState(null);
  const [activeSampleId, setActiveSampleId] = useState(null);
  const [samples, setSamples] = useState([]);

  // Theme state
  const [theme, setTheme] = useState(localStorage.getItem("THEME") || "dark");

  // Selections
  const [selectedCharacter, setSelectedCharacter] = useState("");
  const [selectedPlotPoint, setSelectedPlotPoint] = useState("");

  // Modals state
  const [isIngestModalOpen, setIsIngestModalOpen] = useState(false);
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
      const evts = data.lore?.timeline_events || [];
      if (chars.length > 0) setSelectedCharacter(chars[0].name);
      if (evts.length > 0) setSelectedPlotPoint(evts[evts.length - 1].title);
    } catch (err) {
      alert(`Lore Analysis Error: ${err.message}`);
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

    // Progressive UI Telemetry Animations
    setAgentStates({
      lore_agent: { status: "completed" },
      character_agent: { status: "processing" },
      timeline_agent: { status: "processing" },
      divergence_agent: { status: "waiting" },
      writer_agent: { status: "waiting" },
    });

    addLog("system", "Executing Multi-Agent Narrative Divergence Pipeline...");
    addLog("character_agent", `Profiling ${selectedCharacter}'s motivations...`);
    addLog("timeline_agent", "Mapping pre-intervention continuity state...");

    // Fast UI animation step for Agent 4
    setTimeout(() => {
      setAgentStates((prev) => ({
        ...prev,
        character_agent: { status: "completed" },
        timeline_agent: { status: "completed" },
        divergence_agent: { status: "processing" },
      }));
      addLog("divergence_agent", "Calculating butterfly effect 1st & 2nd order consequences...");
    }, 1200);

    setTimeout(() => {
      setAgentStates((prev) => ({
        ...prev,
        divergence_agent: { status: "completed" },
        writer_agent: { status: "processing" },
      }));
      addLog("writer_agent", "Writing alternate reality narrative story...");
    }, 2500);

    try {
      const data = await generateDivergenceSync({
        source_text: sourceText,
        character_name: selectedCharacter,
        plot_point: selectedPlotPoint,
        intervention: interventionText,
        existing_lore: lore,
      });

      setAgentStates({
        lore_agent: { status: "completed" },
        character_agent: { status: "completed" },
        timeline_agent: { status: "completed" },
        divergence_agent: { status: "completed" },
        writer_agent: { status: "completed" },
      });

      addLog("system", "✓ All 5 Agents completed execution successfully!");
      setResult(data);
    } catch (err) {
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
        lore={lore}
        selectedCharacter={selectedCharacter}
        onSelectCharacter={setSelectedCharacter}
        selectedPlotPoint={selectedPlotPoint}
        onSelectPlotPoint={setSelectedPlotPoint}
        agentStates={agentStates}
        theme={theme}
        onToggleTheme={toggleTheme}
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

      <CharacterChatModal
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        characterName={chatCharacter || selectedCharacter}
        lore={lore}
        plotPoint={selectedPlotPoint}
      />
    </div>
  );
}
