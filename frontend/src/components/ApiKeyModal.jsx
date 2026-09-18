import React, { useState } from "react";
import { X, Key, CheckCircle, ExternalLink } from "lucide-react";

export default function ApiKeyModal({ isOpen, onClose, currentKey, onSaveKey }) {
  const [keyInput, setKeyInput] = useState(currentKey || "");

  if (!isOpen) return null;

  const handleSave = (e) => {
    e.preventDefault();
    onSaveKey(keyInput.trim());
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="glass-panel w-full max-w-md p-6 border-slate-700/80 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="p-3 bg-cyber-purple/10 border border-cyber-purple/30 rounded-xl text-cyber-purple">
            <Key className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Google Gemini API Key</h2>
            <p className="text-xs text-slate-400">
              Provide your API key to power multi-agent narrative reasoning.
            </p>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Gemini API Key
            </label>
            <input
              type="password"
              value={keyInput}
              onChange={(e) => setKeyInput(e.target.value)}
              placeholder="AIzaSy..."
              className="w-full px-3.5 py-2.5 bg-dark-900 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyber-purple focus:ring-1 focus:ring-cyber-purple transition font-mono"
            />
          </div>

          <div className="text-xs text-slate-400 leading-relaxed bg-dark-900/50 p-3 rounded-xl border border-slate-800">
            <p className="mb-1">
              • Keys are held strictly in local memory/headers and never saved to a database.
            </p>
            <a
              href="https://aistudio.google.com/app/apikey"
              target="_blank"
              rel="noreferrer"
              className="text-cyber-cyan hover:underline inline-flex items-center gap-1 font-medium"
            >
              Get a free API key from Google AI Studio <ExternalLink className="w-3 h-3" />
            </a>
          </div>

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
              className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-cyber-cyan to-cyber-purple text-white text-xs font-semibold rounded-xl hover:opacity-90 transition shadow-lg shadow-cyber-purple/20"
            >
              <CheckCircle className="w-4 h-4" />
              Save Key
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
