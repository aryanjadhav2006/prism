import React, { useState } from "react";
import { X, Upload, FileText, Sparkles, ArrowRight, AlertCircle, FileCheck } from "lucide-react";
import { uploadDocument } from "../services/api";

export default function IngestStoryModal({ isOpen, onClose, onStoryIngested }) {
  const [activeTab, setActiveTab] = useState("text"); // "text" | "file"
  const [rawText, setRawText] = useState("");
  const [file, setFile] = useState(null);
  const [parsedData, setParsedData] = useState(null);
  const [isParsing, setIsParsing] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const handleFileChange = async (selectedFile) => {
    setFile(selectedFile);
    setError(null);
    setIsParsing(true);
    try {
      const res = await uploadDocument(selectedFile, null);
      setParsedData(res);
      setRawText(res.text);
    } catch (err) {
      setError(err.message || "Failed to parse file");
    } finally {
      setIsParsing(false);
    }
  };

  const handleFileDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    const textToSubmit = parsedData?.text || rawText.trim();
    if (!textToSubmit) {
      setError("Please paste story text or upload a file first.");
      return;
    }

    if (parsedData?.text) {
      onStoryIngested(parsedData.text);
      onClose();
      return;
    }

    setIsParsing(true);
    try {
      const res = await uploadDocument(null, textToSubmit);
      onStoryIngested(res.text);
      onClose();
    } catch (err) {
      setError(err.message || "Failed to parse text");
    } finally {
      setIsParsing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="glass-panel w-full max-w-2xl p-6 shadow-2xl relative border-slate-700">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-cyber-cyan/10 border border-cyber-cyan/30 rounded-xl text-cyber-cyan">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Ingest Narrative Source</h2>
            <p className="text-xs text-slate-400">
              Paste raw text or upload a PDF/DOCX/TXT file to initialize world lore.
            </p>
          </div>
        </div>

        {/* Tab Toggle */}
        <div className="flex items-center gap-2 border-b border-slate-800 pb-3 mb-4">
          <button
            type="button"
            onClick={() => setActiveTab("text")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition ${
              activeTab === "text"
                ? "bg-cyber-cyan/20 border border-cyber-cyan/40 text-cyber-cyan"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <FileText className="w-4 h-4" />
            Paste Raw Text
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("file")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition ${
              activeTab === "file"
                ? "bg-cyber-purple/20 border border-cyber-purple/40 text-cyber-purple"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Upload className="w-4 h-4" />
            Upload File (PDF / DOCX / TXT)
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {activeTab === "text" && (
            <div className="space-y-2">
              <textarea
                rows={8}
                value={rawText}
                onChange={(e) => {
                  setRawText(e.target.value);
                  setParsedData(null);
                }}
                placeholder="Paste your story excerpt, script scene, or novel chapter here..."
                className="w-full p-4 bg-dark-900 border border-slate-700 rounded-2xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyber-cyan focus:ring-1 focus:ring-cyber-cyan transition font-mono leading-relaxed"
              />
              <div className="flex justify-between text-[11px] text-slate-500 font-mono px-1">
                <span>{rawText.split(/\s+/).filter(Boolean).length} Words</span>
                <span>{rawText.length} Chars</span>
              </div>
            </div>
          )}

          {activeTab === "file" && (
            <div className="space-y-3">
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleFileDrop}
                className="border-2 border-dashed border-slate-700 hover:border-cyber-purple rounded-2xl p-8 text-center transition cursor-pointer bg-dark-900/40 hover:bg-dark-900/80 group"
              >
                <input
                  type="file"
                  id="modal-file-upload"
                  accept=".pdf,.docx,.doc,.txt,.md"
                  className="hidden"
                  onChange={(e) => e.target.files && handleFileChange(e.target.files[0])}
                />
                <label htmlFor="modal-file-upload" className="cursor-pointer block space-y-2">
                  <Upload className="w-8 h-8 mx-auto text-slate-400 group-hover:text-cyber-purple transition" />
                  <p className="text-xs font-semibold text-slate-200 group-hover:text-cyber-purple transition">
                    Drag & drop file or <span className="text-cyber-purple underline">browse</span>
                  </p>
                  <p className="text-[11px] text-slate-500">PDF, DOCX, TXT supported</p>
                </label>
              </div>

              {parsedData && (
                <div className="p-3 bg-emerald-950/20 border border-emerald-500/40 rounded-xl flex items-center gap-3 text-xs text-emerald-300">
                  <FileCheck className="w-5 h-5 text-emerald-400 shrink-0" />
                  <div>
                    <span className="font-bold text-white block">{parsedData.filename}</span>
                    <span className="font-mono text-[11px]">{parsedData.stats?.word_count || 0} words extracted</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Animated Loading Progress Bar */}
          {isParsing && (
            <div className="p-4 bg-dark-900/90 border border-cyber-cyan/40 rounded-xl space-y-2.5 animate-fade-in shadow-lg">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-cyber-cyan font-bold flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-cyber-cyan animate-ping" />
                  Processing Story File & Ingesting Lore...
                </span>
                <span className="text-slate-400 animate-pulse">Extracting Characters & Rules</span>
              </div>
              <div className="w-full bg-dark-800 rounded-full h-2.5 overflow-hidden border border-slate-700/80">
                <div className="h-full bg-gradient-to-r from-cyber-cyan via-cyber-purple to-cyber-pink rounded-full animate-pulse w-full" />
              </div>
              <p className="text-[11px] text-slate-400">
                Building authoritative Story Bible and chronological checkpoints...
              </p>
            </div>
          )}

          {error && (
            <div className="p-3 bg-red-950/40 border border-red-500/40 rounded-xl flex items-center gap-2 text-xs text-red-300">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isParsing || (!rawText.trim() && !parsedData)}
              className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-cyber-cyan via-cyber-purple to-cyber-pink text-white text-xs font-bold rounded-xl hover:opacity-90 transition disabled:opacity-50 shadow-lg shadow-cyber-purple/20"
            >
              {isParsing ? (
                <span>Parsing...</span>
              ) : (
                <>
                  <span>Ingest & Analyze Lore</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
