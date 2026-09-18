import React, { useState, useRef, useEffect } from "react";
import { X, Send, User, MessageSquare, Loader2, Sparkles, ShieldAlert } from "lucide-react";
import { sendCharacterChat } from "../services/api";

export default function CharacterChatModal({ 
  isOpen, 
  onClose, 
  characterName, 
  lore, 
  plotPoint, 
  apiKey 
}) {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: `Greetings. I am ${characterName}. Ask me anything about my thoughts or choices up to this point.`,
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (!isOpen) return null;

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg = input.trim();
    const updatedHistory = [...messages, { role: "user", content: userMsg }];
    setMessages(updatedHistory);
    setInput("");
    setLoading(true);

    try {
      const res = await sendCharacterChat({
        character_name: characterName,
        user_message: userMsg,
        chat_history: updatedHistory,
        lore_context: lore,
        plot_point: plotPoint,
        apiKey,
      });

      setMessages((prev) => [...prev, { role: "assistant", content: res.reply }]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: `(Interrogation error: ${err.message})` },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="glass-panel w-full max-w-2xl h-[80vh] flex flex-col border-cyber-pink/40 shadow-2xl relative overflow-hidden">
        {/* Header */}
        <div className="p-4 bg-dark-900/90 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyber-pink to-cyber-purple p-0.5">
              <div className="w-full h-full bg-dark-900 rounded-[10px] flex items-center justify-center text-cyber-pink">
                <User className="w-5 h-5" />
              </div>
            </div>
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                Interrogating: {characterName}
                <Sparkles className="w-3.5 h-3.5 text-cyber-cyan" />
              </h2>
              <p className="text-[11px] text-slate-400 font-mono">
                Knowledge bounded strictly up to: "{plotPoint || 'Current Scene'}"
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Boundary Notice */}
        <div className="px-4 py-2 bg-cyber-pink/10 border-b border-cyber-pink/20 flex items-center gap-2 text-[11px] text-cyber-pink font-mono">
          <ShieldAlert className="w-3.5 h-3.5 flex-shrink-0" />
          <span>Timeline Constraint Active: Character cannot speak of future plot developments.</span>
        </div>

        {/* Messages Body */}
        <div className="flex-1 p-4 overflow-y-auto space-y-4">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex items-start gap-3 ${
                msg.role === "user" ? "flex-row-reverse" : ""
              }`}
            >
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${
                  msg.role === "user"
                    ? "bg-cyber-cyan text-dark-900"
                    : "bg-cyber-purple text-white"
                }`}
              >
                {msg.role === "user" ? "YOU" : characterName[0]}
              </div>

              <div
                className={`max-w-[80%] p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                  msg.role === "user"
                    ? "bg-cyber-cyan/20 border border-cyber-cyan/40 text-white rounded-tr-none"
                    : "bg-dark-900 border border-slate-800 text-slate-200 rounded-tl-none font-sans"
                }`}
              >
                {msg.content}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex items-center gap-2 text-xs text-slate-400 italic">
              <Loader2 className="w-4 h-4 animate-spin text-cyber-pink" />
              <span>{characterName} is contemplating...</span>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Input Footer */}
        <form onSubmit={handleSend} className="p-3 bg-dark-900/90 border-t border-slate-800 flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={`Ask ${characterName} a question...`}
            className="flex-1 px-4 py-2.5 bg-dark-800 border border-slate-700 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyber-pink transition"
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="px-4 py-2.5 bg-gradient-to-r from-cyber-pink to-cyber-purple text-white rounded-xl text-xs font-bold hover:opacity-90 transition disabled:opacity-50 flex items-center gap-1.5"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
