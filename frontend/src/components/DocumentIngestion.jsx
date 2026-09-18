import React, { useState } from "react";
import { Upload, FileText, Sparkles, ArrowRight, BookOpen, AlertCircle, FileCheck } from "lucide-react";
import { uploadDocument } from "../services/api";

export default function DocumentIngestion({ 
  onLoreAnalyzed, 
  onSelectSample, 
  isAnalyzing, 
  samples 
}) {
  const [file, setFile] = useState(null);
  const [rawText, setRawText] = useState("");
  const [activeTab, setActiveTab] = useState("file"); // "file" | "text"
  const [isParsing, setIsParsing] = useState(false);
  const [error, setError] = useState(null);
  const [parsedData, setParsedData] = useState(null);

  const handleFileDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = async (selectedFile) => {
    setFile(selectedFile);
    setError(null);
    setIsParsing(true);
    try {
      const res = await uploadDocument(selectedFile, null);
      setParsedData(res);
      setRawText(res.text);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsParsing(false);
    }
  };

  const handleAnalyzeClick = () => {
    const textToAnalyze = parsedData?.text || rawText;
    if (!textToAnalyze.trim()) {
      setError("Please upload a file or paste narrative text first.");
      return;
    }
    onLoreAnalyzed(textToAnalyze);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fadeIn">
      {/* Header Banner */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyber-purple/10 border border-cyber-purple/30 text-cyber-purple text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5 text-cyber-cyan" />
          Step 1: Universal Source Ingestion
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
          Ingest Narrative & Establish World Lore
        </h1>
        <p className="text-sm sm:text-base text-slate-400 max-w-2xl mx-auto">
          Upload any text-based media source (PDF, DOCX, script, novel chapter, or raw transcript) to initialize the multi-agent reasoning framework.
        </p>
      </div>

      {/* Quick Demo Dataset Banner */}
      <div className="glass-panel p-5 border-cyber-cyan/30 bg-gradient-to-r from-cyber-cyan/5 via-dark-800 to-cyber-purple/5 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-cyber-cyan/10 border border-cyber-cyan/30 rounded-xl text-cyber-cyan">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                Want a 1-Click Demo?
                <span className="text-[10px] px-2 py-0.5 rounded bg-cyber-cyan/20 text-cyber-cyan font-mono">
                  Instant
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Load pre-parsed stories like Game of Thrones, Cyberpunk 2077, or Hamlet.
              </p>
            </div>
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            {samples && samples.slice(0, 3).map((sample) => (
              <button
                key={sample.id}
                onClick={() => onSelectSample(sample)}
                className="flex-1 sm:flex-none px-3 py-2 bg-dark-900/80 hover:bg-cyber-purple/20 hover:border-cyber-purple/50 border border-slate-700 rounded-xl text-xs font-semibold text-slate-200 transition text-left sm:text-center"
              >
                {sample.title.split(":")[0]}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Ingestion Box */}
      <div className="glass-panel p-6 sm:p-8 space-y-6">
        {/* Toggle Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-800 pb-4">
          <button
            onClick={() => setActiveTab("file")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition ${
              activeTab === "file"
                ? "bg-cyber-cyan/20 border border-cyber-cyan/40 text-cyber-cyan"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Upload className="w-4 h-4" />
            Upload File (PDF / DOCX / TXT)
          </button>
          <button
            onClick={() => setActiveTab("text")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition ${
              activeTab === "text"
                ? "bg-cyber-purple/20 border border-cyber-purple/40 text-cyber-purple"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <FileText className="w-4 h-4" />
            Paste Raw Text
          </button>
        </div>

        {/* Tab 1: File Dropzone */}
        {activeTab === "file" && (
          <div className="space-y-4">
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleFileDrop}
              className="border-2 border-dashed border-slate-700 hover:border-cyber-cyan rounded-2xl p-8 sm:p-12 text-center transition cursor-pointer bg-dark-900/40 hover:bg-dark-900/80 group"
            >
              <input
                type="file"
                id="file-upload"
                accept=".pdf,.docx,.doc,.txt,.md"
                className="hidden"
                onChange={(e) => e.target.files && handleFileChange(e.target.files[0])}
              />
              <label htmlFor="file-upload" className="cursor-pointer block space-y-3">
                <div className="w-14 h-14 mx-auto rounded-2xl bg-dark-800 border border-slate-700 flex items-center justify-center text-slate-400 group-hover:text-cyber-cyan group-hover:border-cyber-cyan transition">
                  <Upload className="w-7 h-7" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-200 group-hover:text-cyber-cyan transition">
                    Drag & drop your story file here, or <span className="text-cyber-cyan underline">browse</span>
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    Supports PDF, DOCX, TXT, or Markdown documents
                  </p>
                </div>
              </label>
            </div>

            {/* Parsed File Card */}
            {parsedData && (
              <div className="p-4 bg-emerald-950/20 border border-emerald-500/40 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FileCheck className="w-6 h-6 text-emerald-400" />
                  <div>
                    <h4 className="text-xs font-bold text-white">{parsedData.filename}</h4>
                    <p className="text-[11px] text-emerald-300 font-mono">
                      {parsedData.stats?.word_count || 0} words extracted | {parsedData.stats?.char_count || 0} chars
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Raw Text Editor */}
        {activeTab === "text" && (
          <div className="space-y-3">
            <textarea
              rows={10}
              value={rawText}
              onChange={(e) => {
                setRawText(e.target.value);
                setParsedData(null);
              }}
              placeholder="Paste your script scene, novel excerpt, or character story here..."
              className="w-full p-4 bg-dark-900 border border-slate-700/80 rounded-2xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyber-purple focus:ring-1 focus:ring-cyber-purple transition font-mono leading-relaxed"
            />
            <div className="flex justify-between items-center text-xs text-slate-500 font-mono px-1">
              <span>{rawText.split(/\s+/).filter(Boolean).length} Words</span>
              <span>{rawText.length} Characters</span>
            </div>
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="p-3.5 bg-red-950/40 border border-red-500/40 rounded-xl flex items-center gap-2.5 text-xs text-red-300">
            <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* CTA Button */}
        <div className="pt-2 flex justify-end">
          <button
            onClick={handleAnalyzeClick}
            disabled={isAnalyzing || isParsing || (!parsedData && !rawText.trim())}
            className="flex items-center gap-2.5 px-6 py-3.5 bg-gradient-to-r from-cyber-cyan via-cyber-purple to-cyber-pink text-white text-xs font-bold rounded-xl hover:opacity-90 transition shadow-xl shadow-cyber-purple/20 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isAnalyzing ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Agent 1 (Lore Agent) Analyzing Story...</span>
              </>
            ) : (
              <>
                <span>Analyze Lore & Establish World State</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
