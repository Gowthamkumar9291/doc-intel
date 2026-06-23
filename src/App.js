import { useState, useRef, useCallback, useEffect } from "react";

const COLORS = {
  bg: "#0F1117", surface: "#161B27", surfaceHover: "#1C2333",
  border: "#232B3E", accent: "#3B82F6", accentDim: "#1D4ED8",
  accentGlow: "rgba(59,130,246,0.15)", risk: "#EF4444",
  riskBg: "rgba(239,68,68,0.08)", warn: "#F59E0B",
  warnBg: "rgba(245,158,11,0.08)", ok: "#10B981",
  okBg: "rgba(16,185,129,0.08)", text: "#F1F5F9",
  textMuted: "#64748B", textSub: "#94A3B8",
};

const TABS = ["Summary", "Key Points", "Risk Flags", "Chat"];

const s = {
  app: { minHeight: "100vh", background: COLORS.bg, color: COLORS.text, fontFamily: "'Inter', system-ui, sans-serif" },
  header: { borderBottom: `1px solid ${COLORS.border}`, padding: "18px 24px", display: "flex", alignItems: "center", gap: "10px", background: COLORS.surface },
  logoIcon: { width: 32, height: 32, borderRadius: 8, background: "linear-gradient(135deg, #3B82F6, #6366F1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 },
  logoText: { fontSize: 18, fontWeight: 700, color: COLORS.text },
  logoSub: { fontSize: 11, color: COLORS.textMuted, marginLeft: "auto", textTransform: "uppercase", letterSpacing: "0.08em" },
  main: { maxWidth: 860, margin: "0 auto", padding: "48px 24px 80px" },
  hero: { textAlign: "center", marginBottom: 40 },
  heroTitle: { fontSize: 36, fontWeight: 800, letterSpacing: "-0.03em", margin: "0 0 12px", background: `linear-gradient(135deg, ${COLORS.text} 60%, ${COLORS.accent})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" },
  heroSub: { fontSize: 16, color: COLORS.textSub, margin: 0, lineHeight: 1.6 },
  uploadZone: (d) => ({ border: `2px dashed ${d ? COLORS.accent : COLORS.border}`, borderRadius: 16, padding: "56px 32px", textAlign: "center", cursor: "pointer", background: d ? COLORS.accentGlow : COLORS.surface, transition: "all 0.2s", position: "relative", overflow: "hidden" }),
  scanLine: { position: "absolute", left: 0, right: 0, height: 2, background: `linear-gradient(90deg, transparent, ${COLORS.accent}, transparent)`, opacity: 0.6, animation: "scanline 2.5s ease-in-out infinite" },
  uploadBtn: { display: "inline-block", padding: "10px 24px", background: COLORS.accent, color: "#fff", borderRadius: 8, fontSize: 14, fontWeight: 600, border: "none", cursor: "pointer" },
  fileInfo: { marginTop: 24, padding: "12px 16px", background: COLORS.surfaceHover, borderRadius: 10, display: "flex", alignItems: "center", gap: 10, border: `1px solid ${COLORS.border}` },
  analyzeBtn: (l) => ({ width: "100%", marginTop: 16, padding: "14px", background: l ? COLORS.accentDim : "linear-gradient(135deg, #3B82F6, #6366F1)", color: "#fff", border: "none", borderRadius: 10, fontSize: 15, fontWeight: 700, cursor: l ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }),
  spinner: { width: 18, height: 18, border: "2px solid rgba(255,255,255,0.3)", borderTop: "2px solid #fff", borderRadius: "50%", animation: "spin 0.8s linear infinite" },
  panel: { background: COLORS.surface, borderRadius: 12, padding: "24px", border: `1px solid ${COLORS.border}`, minHeight: 200, animation: "fadeIn 0.3s ease" },
  tabs: { display: "flex", gap: 4, marginBottom: 20, borderBottom: `1px solid ${COLORS.border}` },
  tab: (a) => ({ padding: "10px 20px", background: "transparent", border: "none", borderBottom: a ? `2px solid ${COLORS.accent}` : "2px solid transparent", color: a ? COLORS.accent : COLORS.textMuted, cursor: "pointer", fontSize: 14, fontWeight: a ? 600 : 400, marginBottom: -1 }),
  keyPoint: { display: "flex", gap: 12, alignItems: "flex-start", padding: "12px 14px", background: COLORS.surfaceHover, borderRadius: 8, fontSize: 14, lineHeight: 1.6, color: COLORS.textSub },
  dot: { width: 6, height: 6, borderRadius: "50%", background: COLORS.accent, marginTop: 7, flexShrink: 0 },
  riskItem: (l) => ({ padding: "14px 16px", borderRadius: 8, border: `1px solid ${l === "high" ? "rgba(239,68,68,0.3)" : l === "medium" ? "rgba(245,158,11,0.3)" : "rgba(16,185,129,0.3)"}`, background: l === "high" ? COLORS.riskBg : l === "medium" ? COLORS.warnBg : COLORS.okBg, display: "flex", gap: 12, marginBottom: 10 }),
  riskLabel: (l) => ({ fontSize: 10, fontWeight: 700, textTransform: "uppercase", color: l === "high" ? COLORS.risk : l === "medium" ? COLORS.warn : COLORS.ok, marginBottom: 4 }),
  chatBubble: (r) => ({ maxWidth: "78%", padding: "10px 14px", borderRadius: r === "user" ? "12px 12px 4px 12px" : "12px 12px 12px 4px", background: r === "user" ? COLORS.accent : COLORS.surfaceHover, color: COLORS.text, fontSize: 14, lineHeight: 1.6, border: r === "user" ? "none" : `1px solid ${COLORS.border}` }),
  chatInput: { flex: 1, padding: "10px 14px", background: COLORS.surfaceHover, border: `1px solid ${COLORS.border}`, borderRadius: 8, color: COLORS.text, fontSize: 14, outline: "none", fontFamily: "inherit" },
  chatSendBtn: (d) => ({ padding: "10px 20px", background: d ? COLORS.border : COLORS.accent, border: "none", borderRadius: 8, color: d ? COLORS.textMuted : "#fff", fontSize: 14, fontWeight: 600, cursor: d ? "not-allowed" : "pointer" }),
  error: { padding: "14px 16px", background: COLORS.riskBg, border: "1px solid rgba(239,68,68,0.3)", borderRadius: 8, color: "#FCA5A5", fontSize: 14, marginTop: 12 },
  emptyState: { textAlign: "center", color: COLORS.textMuted, fontSize: 14, padding: "32px 0" },
  docHeader: { display: "flex", alignItems: "center", gap: 12, marginBottom: 24, padding: "16px 20px", background: COLORS.surface, borderRadius: 12, border: `1px solid ${COLORS.border}` },
  resetBtn: { marginLeft: "auto", padding: "6px 14px", background: "transparent", border: `1px solid ${COLORS.border}`, color: COLORS.textSub, borderRadius: 6, fontSize: 12, cursor: "pointer" },
};
const API_KEY = process.env.REACT_APP_GEMINI_API_KEY;
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${API_KEY}`;

async function callGemini(prompt, base64, mimeType) {
  const resp = await fetch(GEMINI_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{
        parts: [
          { inline_data: { mime_type: mimeType, data: base64 } },
          { text: prompt }
        ]
      }]
    }),
  });
  const data = await resp.json();
  if (data.error) throw new Error(data.error.message);
  return data.candidates?.[0]?.content?.parts?.[0]?.text || "";
}

function parseKeyPoints(text) {
  return text.split("\n").map(l => l.replace(/^[-•*\d.]+\s*/, "").trim()).filter(l => l.length > 4);
}

function parseRiskFlags(text) {
  return text.split("\n").map(l => l.trim()).filter(Boolean).map(line => {
    const lc = line.toLowerCase();
    let level = "low";
    if (lc.includes("[high]") || lc.includes("high risk") || lc.includes("critical")) level = "high";
    else if (lc.includes("[medium]") || lc.includes("medium risk") || lc.includes("caution")) level = "medium";
    return { level, text: line.replace(/^\[?(high|medium|low)\]?:?\s*/i, "") };
  });
}

export default function App() {
  const [dragging, setDragging] = useState(false);
  const [file, setFile] = useState(null);
  const [base64, setBase64] = useState(null);
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState("");
  const [analysis, setAnalysis] = useState(null);
  const [activeTab, setActiveTab] = useState("Summary");
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef();
  const chatEndRef = useRef();

  useEffect(() => {
    if (chatEndRef.current) chatEndRef.current.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  const toBase64 = (f) => new Promise((res, rej) => {
    const reader = new FileReader();
    reader.onload = () => res(reader.result.split(",")[1]);
    reader.onerror = rej;
    reader.readAsDataURL(f);
  });

  const handleFile = async (f) => {
    if (!f) return;
    const allowed = ["application/pdf", "image/png", "image/jpeg", "image/webp", "image/gif"];
    if (!allowed.includes(f.type)) { setError("Please upload a PDF or image file."); return; }
    setError(""); setAnalysis(null); setChatMessages([]); setFile(f);
    const b64 = await toBase64(f);
    setBase64(b64);
  };

  const onDrop = useCallback((e) => {
    e.preventDefault(); setDragging(false);
    const f = e.dataTransfer.files?.[0];
    if (f) handleFile(f);
  }, []);

  const formatSize = (b) => b < 1024 ? b + " B" : b < 1024*1024 ? (b/1024).toFixed(1)+" KB" : (b/(1024*1024)).toFixed(1)+" MB";

  const analyze = async () => {
    if (!file || !base64) return;
    setLoading(true); setError(""); setAnalysis(null); setChatMessages([]);
    try {
      setStatusMsg("Reading document...");
      const mime = file.type;
      setStatusMsg("Extracting insights...");
      const summary = await callGemini("Write a 3-5 sentence plain-English overview of this document.", base64, mime);
      const keyPoints = await callGemini("List the most important facts, dates, names, and numbers. One item per line starting with a dash.", base64, mime);
      const riskFlags = await callGemini("Identify risks or red flags. Prefix each with [HIGH], [MEDIUM], or [LOW]. One per line.", base64, mime);
      setAnalysis({ summary, keyPoints: parseKeyPoints(keyPoints), riskFlags: parseRiskFlags(riskFlags) });
      setActiveTab("Summary");
    } catch (e) {
      setError("Analysis failed: " + e.message);
    } finally {
      setLoading(false); setStatusMsg("");
    }
  };

  const sendChat = async () => {
    if (!chatInput.trim() || chatLoading) return;
    const userMsg = chatInput.trim();
    setChatInput("");
    const newMessages = [...chatMessages, { role: "user", content: userMsg }];
    setChatMessages(newMessages);
    setChatLoading(true);
    try {
      const history = newMessages.map(m => `${m.role === "user" ? "User" : "Assistant"}: ${m.content}`).join("\n");
      const prompt = `You are a document assistant. Answer based on this document only.\n\nConversation:\n${history}\n\nAssistant:`;
      const reply = await callGemini(prompt, base64, file.type);
      setChatMessages([...newMessages, { role: "assistant", content: reply }]);
    } catch (e) {
      setChatMessages([...newMessages, { role: "assistant", content: "Error: " + e.message }]);
    } finally {
      setChatLoading(false);
    }
  };

  const reset = () => { setFile(null); setBase64(null); setAnalysis(null); setChatMessages([]); setError(""); setStatusMsg(""); };
  return (
    <>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #0F1117; }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes scanline { 0% { top: 0%; opacity: 0; } 10% { opacity: 0.6; } 90% { opacity: 0.6; } 100% { top: 100%; opacity: 0; } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-thumb { background: #232B3E; border-radius: 3px; }
      `}</style>
      <div style={s.app}>
        <header style={s.header}>
          <div style={s.logoIcon}>📄</div>
          <span style={s.logoText}>DocIntel</span>
          <span style={s.logoSub}>AI Document Intelligence</span>
        </header>
        <main style={s.main}>
          {!analysis && <div style={s.hero}><h1 style={s.heroTitle}>Understand any document instantly</h1><p style={s.heroSub}>Upload a PDF or image — get a plain-English summary, key facts, risk flags, and live chat.</p></div>}
          {!analysis && <>
            <div style={s.uploadZone(dragging)} onDrop={onDrop} onDragOver={(e) => { e.preventDefault(); setDragging(true); }} onDragLeave={() => setDragging(false)} onClick={() => !file && fileInputRef.current?.click()}>
              <div style={s.scanLine} />
              <input ref={fileInputRef} type="file" accept=".pdf,image/*" style={{ display: "none" }} onChange={(e) => handleFile(e.target.files?.[0])} />
              <div style={{ fontSize: 40, marginBottom: 16 }}>{dragging ? "📂" : "📁"}</div>
              <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 8, color: "#F1F5F9" }}>{dragging ? "Drop to upload" : "Drop your document here"}</div>
              <div style={{ fontSize: 14, color: "#64748B", marginBottom: 20 }}>Supports PDF, PNG, JPG, WEBP · Up to 20MB</div>
              {!file && <button style={s.uploadBtn} onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}>Browse files</button>}
              {file && <div style={s.fileInfo} onClick={(e) => e.stopPropagation()}>
                <span style={{ fontSize: 20 }}>{file.type === "application/pdf" ? "📄" : "🖼️"}</span>
                <span style={{ fontSize: 13, fontWeight: 500, color: "#F1F5F9", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{file.name}</span>
                <span style={{ fontSize: 12, color: "#64748B" }}>{formatSize(file.size)}</span>
                <button style={{ background: "none", border: "none", color: "#64748B", cursor: "pointer", fontSize: 18 }} onClick={() => { setFile(null); setBase64(null); setError(""); }}>×</button>
              </div>}
            </div>
            {file && <><button style={s.analyzeBtn(loading)} onClick={analyze} disabled={loading}>{loading ? <><span style={s.spinner} />Analyzing...</> : "Analyze Document →"}</button>
            {statusMsg && <div style={{ fontSize: 13, color: "#64748B", textAlign: "center", marginTop: 10 }}>{statusMsg}</div>}</>}
            {error && <div style={s.error}>⚠️ {error}</div>}
          </>}
          {analysis && <div style={{ marginTop: 40, animation: "fadeIn 0.4s ease" }}>
            <div style={s.docHeader}>
              <span style={{ fontSize: 24 }}>{file.type === "application/pdf" ? "📄" : "🖼️"}</span>
              <div><div style={{ fontSize: 14, fontWeight: 600, color: "#F1F5F9" }}>{file.name}</div><div style={{ fontSize: 12, color: "#64748B" }}>{formatSize(file.size)} · Analyzed</div></div>
              <button style={s.resetBtn} onClick={reset}>↩ New document</button>
            </div>
            <div style={s.tabs}>{TABS.map(tab => <button key={tab} style={s.tab(activeTab === tab)} onClick={() => setActiveTab(tab)}>{tab === "Summary" ? "📝 " : tab === "Key Points" ? "🔑 " : tab === "Risk Flags" ? "⚠️ " : "💬 "}{tab}</button>)}</div>
            <div style={s.panel}>
              {activeTab === "Summary" && <p style={{ fontSize: 15, lineHeight: 1.8, color: "#94A3B8" }}>{analysis.summary}</p>}
              {activeTab === "Key Points" && (analysis.keyPoints.length > 0
                ? <ul style={{ listStyle: "none", padding: 0, display: "flex", flexDirection: "column", gap: 10 }}>{analysis.keyPoints.map((pt, i) => <li key={i} style={s.keyPoint}><span style={s.dot} />{pt}</li>)}</ul>
                : <div style={s.emptyState}>No key points found.</div>)}
              {activeTab === "Risk Flags" && (analysis.riskFlags.length > 0
                ? <div>{analysis.riskFlags.map((r, i) => <div key={i} style={s.riskItem(r.level)}><span>{r.level === "high" ? "🔴" : r.level === "medium" ? "🟡" : "🟢"}</span><div><div style={s.riskLabel(r.level)}>{r.level} risk</div><div style={{ fontSize: 14, color: "#94A3B8" }}>{r.text}</div></div></div>)}</div>
                : <div style={s.emptyState}>✅ No significant risks found.</div>)}
              {activeTab === "Chat" && <div>
                <div style={{ display: "flex", flexDirection: "column", gap: 12, maxHeight: 340, overflowY: "auto", paddingBottom: 16, marginBottom: 16 }}>
                  {chatMessages.length === 0 && <div style={s.emptyState}>Ask anything about your document...</div>}
                  {chatMessages.map((msg, i) => <div key={i} style={{ display: "flex", justifyContent: msg.role === "user" ? "flex-end" : "flex-start" }}><div style={s.chatBubble(msg.role)}>{msg.content}</div></div>)}
                  {chatLoading && <div style={{ display: "flex" }}><div style={{ ...s.chatBubble("assistant"), color: "#64748B" }}>Thinking...</div></div>}
                  <div ref={chatEndRef} />
                </div>
                <div style={{ display: "flex", gap: 10, borderTop: `1px solid #232B3E`, paddingTop: 16 }}>
                  <input style={s.chatInput} type="text" placeholder="Ask about this document..." value={chatInput} onChange={(e) => setChatInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && sendChat()} disabled={chatLoading} />
                  <button style={s.chatSendBtn(!chatInput.trim() || chatLoading)} onClick={sendChat} disabled={!chatInput.trim() || chatLoading}>Send</button>
                </div>
              </div>}
            </div>
          </div>}
        </main>
      </div>
    </>
  );
}
