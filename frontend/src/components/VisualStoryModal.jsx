import React, { useState } from "react";
import {
  X,
  Image as ImageIcon,
  Sparkles,
  Wand2,
  Copy,
  Check,
  ArrowRight,
  UploadCloud,
  RefreshCw,
  BookOpen
} from "lucide-react";
import { generateImageStory } from "../services/api";

const GENRES = [
  { id: "Sci-Fi", label: "Sci-Fi", emoji: "🚀", desc: "Cosmic voids, telemetry, quantum anomalies" },
  { id: "Cyberpunk", label: "Cyberpunk", emoji: "🏙️", desc: "Neon rain, optical implants, street syndicate" },
  { id: "Gothic Horror", label: "Gothic Horror", emoji: "🕯️", desc: "Atlantic mist, iron lanterns, ancient dread" },
  { id: "Noir Mystery", label: "Noir Mystery", emoji: "🕵️", desc: "Cigarette smoke, rainy docks, hardboiled cynicism" },
  { id: "High Fantasy", label: "High Fantasy", emoji: "⚔️", desc: "Runic stone, elder pines, ancient covenants" },
  { id: "Dystopian", label: "Dystopian", emoji: "🏜️", desc: "Sun-scorched rust, Geiger clicks, fragile grit" },
];

export default function VisualStoryModal({ isOpen, onClose, onStoryIngested }) {
  const [imagePreview, setImagePreview] = useState(null);
  const [details, setDetails] = useState("");
  const [selectedGenre, setSelectedGenre] = useState("Sci-Fi");
  const [isGenerating, setIsGenerating] = useState(false);
  const [telemetryStep, setTelemetryStep] = useState("");
  const [generatedResult, setGeneratedResult] = useState(null);
  const [isCopied, setIsCopied] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!details.trim()) {
      setError("Please provide a short description or visual anchors of your image.");
      return;
    }

    setError(null);
    setIsGenerating(true);
    setGeneratedResult(null);

    // Progressive visual telemetry
    setTelemetryStep("Scanning visual color palette & focal geometry...");
    const t1 = setTimeout(() => {
      setTelemetryStep("Extracting setting parameters & psychological anchors...");
    }, 1200);

    const t2 = setTimeout(() => {
      setTelemetryStep(`Synthesizing 3-Act ${selectedGenre} narrative prose...`);
    }, 2400);

    try {
      const data = await generateImageStory({
        details: details.trim(),
        genre: selectedGenre,
        image_data: imagePreview,
      });

      clearTimeout(t1);
      clearTimeout(t2);
      setGeneratedResult(data);
    } catch (err) {
      clearTimeout(t1);
      clearTimeout(t2);
      setError(err.message || "Failed to generate story from visual input.");
    } finally {
      setIsGenerating(false);
      setTelemetryStep("");
    }
  };

  const handleCopy = () => {
    if (!generatedResult?.story) return;
    navigator.clipboard.writeText(generatedResult.story);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleLoadIntoPrism = () => {
    if (!generatedResult?.story) return;
    onStoryIngested(generatedResult.story);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="glass-panel w-full max-w-3xl max-h-[92vh] flex flex-col p-6 shadow-2xl relative border-slate-700 overflow-hidden">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-5 border-b border-slate-800 pb-4">
          <div className="p-2.5 bg-gradient-to-tr from-cyber-cyan/20 to-cyber-purple/20 border border-cyber-cyan/40 rounded-xl text-cyber-cyan">
            <ImageIcon className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-white tracking-wide">
                Visual Story Inception
              </h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyber-cyan/15 text-cyber-cyan font-semibold border border-cyber-cyan/30">
                IMAGE TO STORY
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Provide an image and key visual details to synthesize a rich, genre-tailored short story.
            </p>
          </div>
        </div>

        {/* Modal Content Scroll Area */}
        <div className="flex-1 overflow-y-auto space-y-5 pr-1">
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-400 text-xs rounded-xl flex items-center gap-2">
              <span>{error}</span>
            </div>
          )}

          {/* Top Grid: Image Dropzone + Description Field */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Image Upload Box */}
            <div>
              <label className="text-xs uppercase tracking-wider font-mono font-bold text-slate-800 dark:text-slate-300 block mb-1.5">
                1. Upload Image / Snapshot
              </label>
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                className={`relative h-44 rounded-2xl border-2 border-dashed transition flex flex-col items-center justify-center p-3 text-center overflow-hidden ${
                  imagePreview
                    ? "border-cyber-purple/50 bg-slate-100 dark:bg-dark-900"
                    : "border-slate-300 dark:border-slate-700 hover:border-cyber-purple/60 bg-slate-50 dark:bg-dark-900/60"
                }`}
              >
                {imagePreview ? (
                  <div className="relative w-full h-full group">
                    <img
                      src={imagePreview}
                      alt="Uploaded preview"
                      className="w-full h-full object-cover rounded-xl"
                    />
                    <button
                      type="button"
                      onClick={() => setImagePreview(null)}
                      className="absolute top-2 right-2 p-1.5 bg-black/70 hover:bg-black text-white rounded-lg opacity-0 group-hover:opacity-100 transition text-xs"
                      title="Remove Image"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <label className="cursor-pointer flex flex-col items-center gap-2">
                    <div className="p-3 bg-cyber-purple/10 dark:bg-slate-800/60 rounded-full text-cyber-purple">
                      <UploadCloud className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        Click to upload or drag & drop
                      </p>
                      <p className="text-[10px] text-slate-500 mt-0.5">
                        PNG, JPG, WEBP (Supports artwork, photos, concept art)
                      </p>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
            </div>

            {/* Visual Anchors / Details Field */}
            <div className="flex flex-col">
              <label className="text-xs uppercase tracking-wider font-mono font-bold text-slate-800 dark:text-slate-300 block mb-1.5">
                2. Key Visual Details & Anchors
              </label>
              <textarea
                rows={6}
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder="E.g., A solitary astronaut holding a cracked helmet in a red sand desert, with twin moons rising above the horizon..."
                className="flex-1 w-full p-3.5 bg-slate-50 dark:bg-dark-900 border border-slate-300 dark:border-slate-700 rounded-2xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-cyber-purple focus:ring-1 focus:ring-cyber-purple transition font-mono leading-relaxed resize-none"
              />
              <p className="text-[10px] text-slate-500 mt-1">
                Mention key subjects, environment, lighting, or actions shown in the image.
              </p>
            </div>
          </div>

          {/* Genre Selection */}
          <div>
            <label className="text-xs uppercase tracking-wider font-mono font-bold text-slate-800 dark:text-slate-300 block mb-2.5">
              3. Select Narrative Genre
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {GENRES.map((g) => {
                const isSel = selectedGenre === g.id;
                return (
                  <button
                    key={g.id}
                    type="button"
                    onClick={() => setSelectedGenre(g.id)}
                    className={`py-3 px-3.5 rounded-xl border-2 text-left transition-all duration-150 flex items-center gap-2.5 ${
                      isSel
                        ? "bg-gradient-to-r from-cyber-purple to-cyber-pink text-white border-cyber-purple shadow-md shadow-cyber-purple/20 scale-[1.02]"
                        : "bg-white dark:bg-dark-800/80 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white hover:border-cyber-purple/50 hover:bg-slate-50 dark:hover:bg-dark-700"
                    }`}
                  >
                    <span className="text-xl">{g.emoji}</span>
                    <span className="text-xs font-bold tracking-wide">
                      {g.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Action / Progress Area */}
          {isGenerating && (
            <div className="p-4 bg-cyber-purple/10 border border-cyber-purple/30 rounded-2xl space-y-2 animate-pulse">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-cyber-cyan flex items-center gap-2">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  {telemetryStep}
                </span>
                <span className="text-slate-400">Processing...</span>
              </div>
              <div className="w-full bg-dark-900 h-1.5 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-cyber-cyan to-cyber-purple animate-pulse w-3/4 rounded-full" />
              </div>
            </div>
          )}

          {/* Generated Result Card */}
          {generatedResult && (
            <div className="p-5 bg-dark-900/90 border border-cyber-cyan/30 rounded-2xl space-y-4 animate-fadeIn">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-cyber-cyan" />
                  <h3 className="text-sm font-bold text-white tracking-wide">
                    {generatedResult.title}
                  </h3>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyber-purple/20 text-cyber-purple font-semibold border border-cyber-purple/30">
                  {generatedResult.genre}
                </span>
              </div>

              {/* Story Body */}
              <div className="text-xs leading-relaxed text-slate-200 whitespace-pre-line font-sans space-y-3 max-h-64 overflow-y-auto pr-2">
                {generatedResult.story}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800/80">
                <button
                  type="button"
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-dark-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold transition"
                >
                  {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{isCopied ? "Copied!" : "Copy Story"}</span>
                </button>

                <button
                  type="button"
                  onClick={handleLoadIntoPrism}
                  className="flex items-center gap-2 px-4 py-1.5 rounded-xl bg-gradient-to-r from-cyber-cyan to-cyber-purple hover:brightness-110 text-white text-xs font-bold transition shadow-md"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Load as Canon in Prism</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        {!generatedResult && (
          <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleGenerate}
              disabled={isGenerating || !details.trim()}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyber-cyan to-cyber-purple hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold transition shadow-lg shadow-cyber-purple/20"
            >
              <Wand2 className="w-4 h-4" />
              <span>{isGenerating ? "Synthesizing..." : "Synthesize Story"}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
