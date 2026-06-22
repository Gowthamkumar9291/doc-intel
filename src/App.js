import { useState, useRef, useCallback, useEffect } from "react";

const COLORS = {
  bg: "#0F1117",
  surface: "#161B27",
  surfaceHover: "#1C2333",
  border: "#232B3E",
  accent: "#3B82F6",
  accentDim: "#1D4ED8",
  accentGlow: "rgba(59,130,246,0.15)",
  risk: "#EF4444",
  riskBg: "rgba(239,68,68,0.08)",
  warn: "#F59E0B",
  warnBg: "rgba(245,158,11,0.08)",
  ok: "#10B981",
  okBg: "rgba(16,185,129,0.08)",
  text: "#F1F5F9",
  textMuted: "#64748B",
  textSub: "#94A3B8",
};

const styles = {
  app: { minHeight: "100vh", background: COLORS.bg, color: COLORS.text, fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif", padding: "0", margin: "0" },
  header: { borderBottom: `1px solid ${COLORS.border}`, padding: "18px 40px", display: "flex", alignItems: "center", gap: "12px", background: COLORS.surface },
  logo: { display: "flex", alignItems: "center", gap: "10px" },
  logoIcon: { width: 32, height: 32, borderRadius: 8, background: `linear-gradient(135deg, ${COLORS.accent}, #6366F1)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 },
  logoText: { fontSize: 18, fontWeight: 700, letterSpacing: "-0.02em", color: COLORS.text },
  logoSub: { fontSize: 11, color: COLORS.textMuted, letterSpacing: "0.08em", textTransform: "uppercase", marginLeft: "auto" },
  main: { maxWidth: 860, margin: "0 auto", padding: "48px 24px 80px" },
  hero: { textAlign: "center", marginBottom: 40 },
  heroTitle: { fontSize: 38, fontWeight: 800, letterSpacing: "-0.03em", margin: "0 0 12px", background: `linear-gradient(135deg, ${COLORS.text} 60%, ${COLORS.accent})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" },
  heroSub: { fontSize: 16, color: COLORS.textSub, margin: 0, lineHeight: 1.6 },
  uploadZone: (dragging) => ({ border: `2px dashed ${dragging ? COLORS.accent : COLORS.border}`, borderRadius: 16, padding: "56px 32px", textAlign: "center", cursor: "pointer", background: dragging ? COLORS.accentGlow : COLORS.surface, transition: "all 0.2s ease", position: "relative", overflow: "hidden" }),
  scanLine: { position: "absolute", left: 0, right: 0, height: 2, background: `linear-gradient(90deg, transparent, ${COLORS.accent}, transparent)`, opacity: 0.6, animation: "scanline 2.5s ease-in-out infinite" },
  uploadIcon: { fontSize: 40, marginBottom: 16, display: "block" },
  uploadTitle: { fontSize: 18, fontWeight: 600, marginBottom: 8, color: COLORS.text },
  uploadSub: { fontSize: 14, color: COLORS.textMuted, marginBottom: 20 },
  uploadBtn: { display: "inline-block", padding: "10px 24px", background: COLORS.accent, color: "#fff", borderRadius: 8, fontSize: 14, fontWeight: 600, border: "none", cursor: "pointer" },
  fileInfo: { marginTop: 24, padding: "12px 16px", background: COLORS.surfaceHover, borderRadius: 10, display: "flex", alignItems: "center", gap: 10, border: `1px solid ${COLORS.border}` },
  fileName: { fontSize: 13, fontWeight: 500, color: COLORS.text, flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },
  fileSize: { fontSize: 12, color: COLORS.textMuted },
  analyzeBtn: (loading) => ({ width: "100%", marginTop: 16, padding: "14px", background: loading ? COLORS.accentDim : `linear-gradient(135deg, ${COLORS.accent}, #6366F1)`, color: "#fff", border: "none", borderRadius: 10, fontSize: 15, fontWeight: 700, cursor: loading ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }),
  spinner: { width: 18, height: 18, border: `2px solid rgba(255,255,255,0.3)`, borderTop: "2px solid #fff", borderRadius: "50%", animation: "spin 0.8s linear infinite", display: "inline-block" },
  statusText: { fontSize: 13, color: COLORS.textMuted, textAlign: "center", marginTop: 10, minHeight: 20 },
  results: { marginTop: 40, animation: "fadeIn 0.4s ease" },
  docHeader: { display: "flex", alignItems: "center", gap: 12, marginBottom: 24, padding: "16px 20px", background: COLORS.surface, borderRadius: 12, border: `1px solid ${COLORS.border}` },
  docIcon: { fontSize: 24 },
  docName: { fontSize: 14, fontWeight: 600, color: COLORS.text },
  docMeta: { fontSize: 12, color: COLORS.textMuted },
  resetBtn: { marginLeft: "auto", padding: "6px 14px", background: "transparent", border: `1px solid ${COLORS.border}`, color: COLORS.textSub, borderRadius: 6, fontSize: 12, cursor: "pointer" },
  tabs: { display: "flex", gap: 4, marginBottom: 20, borderBottom: `1px solid ${COLORS.border}` },
  tab: (active) => ({ padding: "10px 20px", background: "transparent", border: "none", borderBottom: active ? `2px solid ${COLORS.accent}` : "2px solid transparent", color: active ? COLORS.accent : COLORS.textMuted, cursor: "pointer", fontSize: 14, fontWeight: active ? 600 : 400, marginBottom: -1 }),
  panel: { background: COLORS.surface, borderRadius: 12, padding: "24px", border: `1px solid ${COLORS.border}`, minHeight: 200, animation: "fadeIn 0.3s ease" },
  summaryText: { fontSize: 15, lineHeight: 1.8, color: COLORS.textSub, margin: 0 },
  keyPointsList: { listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 10 },
  keyPoint: { display: "flex", gap: 12, alignItems: "flex-start", padding: "12px 14px", background: COLORS.surfaceHover, borderRadius: 8, fontSize: 14, lineHeight: 1.6, color: COLORS.textSub },
  keyPointDot: { width: 6, height: 6, borderRadius: "50%", background: COLORS.accent, marginTop: 7, flexShrink: 0 },
  riskItem: (level) => ({ padding: "14px 16px", borderRadius: 8, border: `1px solid ${level === "high" ? "rgba(239,68,68,0.3)" : level === "medium" ? "rgba(245,158,11,0.3)" : "rgba(16,185,129,0.3)"}`, background: level === "high" ? COLORS.riskBg : level === "medium" ? COLORS.warnBg : COLORS.okBg, display: "flex", gap: 12, alignItems: "flex-start", marginBottom: 10 }),
  riskText: { fontSize: 14, lineHeight: 1.6, color: COLORS.textSub, flex: 1 },
  riskLabel: (level) => ({ fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: level === "high" ? COLORS.risk : level === "medium" ? COLORS.warn : COLORS.ok, marginBottom: 4 }),
  chatContainer: { display: "flex", flexDirection: "column", gap: 0 },
  chatMessages: { display: "flex", flexDirection: "column", gap: 12, maxHeight: 340, overflowY: "auto", paddingBottom: 16, marginBottom: 16 },
  chatMsg: (role) => ({ display: "flex", justifyContent: role === "user" ? "flex-end" : "flex-start" }),
  chatBubble: (role) => ({ maxWidth: "78%", padding: "10px 14px", borderRadius: role === "user" ? "12px 12px 4px 12px" : "12px 12px 12px 4px", background: role === "user" ? COLORS.accent : COLORS.surfaceHover, color: COLORS.text, fontSize: 14, lineHeight: 1.6, border: role === "user" ? "none" : `1px solid ${COLORS.border}` }),
  chatInputRow: { display: "flex", gap: 10, borderTop: `1px solid ${COLORS.border}`, paddingTop: 16 },
  chatInput: { flex: 1, padding: "10px 14px", background: COLORS.surfaceHover, border: `1px solid ${COLORS.border}`, borderRadius: 8, color: COLORS.text, fontSize: 14, outline: "none", fontFamily: "inherit" },
  chatSendBtn: (disabled) => ({ padding: "10px 20px", background: disabled ? COLORS.border : COLORS.accent, border: "none", borderRadius: 8, color: disabled ? COLORS.textMuted : "#fff", fontSize: 14, fontWeight: 600, cursor: disabled ? "not-allowed" : "pointer", flexShrink: 0 }),
  emptyState: { textAlign: "center", color: COLORS.textMuted, fontSize: 14, padding: "32px 0" },
  error: { padding: "14px 16px", background: COLORS.riskBg, border: `1px solid rgba(239,68,68,0.3)`, borderRadius: 8, color: "#FCA5A5", fontSize: 14, marginTop: 12 },
};

const TABS = ["Summary", "Key Points", "Risk Flags", "Chat"];

function parseRiskFlags(text) {
  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
  return lines.map((line) => {
    const lc = line.toLowerCase();
    let level = "low";
    if (lc.includes("high risk") || lc.includes("critical") || lc.includes("severe") || lc.startsWith("[high]")) level = "high";
    else if (lc.includes("medium risk") || lc.includes("caution") || lc.includes("unusual") || lc.startsWith("[medium]")) level = "medium";
    const clean = line.replace(/^\[?(high|medium|low)\]?:?\s*/i, "").replace(/^[🔴🟡🟢]\s*/, "");
    return { level, text: clean };
  });
}

function parseKeyPoints(text) {
  return text.split("\n").map((l) => l.replace(/^[-•*\d.]+\s*/, "").trim()).filter((l) => l.length > 4);
                             }export default function App() {
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

  const onDragOver = (e) => { e.preventDefault(); setDragging(true); };
  const onDragLeave = () => setDragging(false);

  const buildDocContent = () => ({
    type: file.type === "application/pdf" ? "document" : "image",
    source: { type: "base64", media_type: file.type, data: base64 },
  });

  const callClaude = async (messages, system) => {
    const resp = await fetch("/api/v1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-api-key": process.env.REACT_APP_ANTHROPIC_API_KEY, "anthropic-version": "2023-06-01" },
      body: JSON.stringify({ model: "claude-sonnet-4-6", max_tokens: 1000, system, messages }),
    });
    const data = await resp.json();
    if (data.error) throw new Error(data.error.message || "API error");
    return data.content.map((b) => b.text || "").join("");
  };

  const analyze = async () => {
    if (!file || !base64) return;
    setLoading(true); setError(""); setAnalysis(null); setChatMessages([]);
    try {
      setStatusMsg("Reading document...");
      const docContent = buildDocContent();
      setStatusMsg("Extracting insights...");
      const [summary, keyPoints, riskFlags] = await Promise.all([
        callClaude([{ role: "user", content: [docContent, { type: "text", text: "Write a 3-5 sentence plain-English overview of this document." }] }], "You are a professional document analyst. Respond with plain prose only."),
        callClaude([{ role: "user", content: [docContent, { type: "text", text: "List the most important facts, dates, names, numbers in this document. One item per line starting with a dash." }] }], "You are a professional document analyst. Output a plain bullet list."),
        callClaude([{ role: "user", content: [docContent, { type: "text", text: "Identify risks, unusual clauses, or red flags. Prefix each line with [HIGH], [MEDIUM], or [LOW]. One item per line." }] }], "You are a legal and risk analyst. Be direct and specific."),
      ]);
      setStatusMsg("Done!");
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
      const docContent = buildDocContent();
      const apiMessages = [
        { role: "user", content: [docContent, { type: "text", text: "I will ask you questions about this document." }] },
        { role: "assistant", content: "Understood. I've reviewed the document and I'm ready to answer your questions." },
        ...newMessages.map((m) => ({ role: m.role, content: m.content })),
      ];
      const reply = await callClaude(apiMessages, "You are a helpful document assistant. Answer questions accurately and concisely.");
      setChatMessages([...newMessages, { role: "assistant", content: reply }]);
    } catch (e) {
      setChatMessages([...newMessages, { role: "assistant", content: "Sorry, error: " + e.message }]);
    } finally {
      setChatLoading(false);
    }
  };

  const reset = () => { setFile(null); setBase64(null); setAnalysis(null); setChatMessages([]); setError(""); setStatusMsg(""); };
  const formatSize = (bytes) => { if (bytes < 1024) return bytes + " B"; if (bytes < 1024*1024) return (bytes/1024).toFixed(1)+" KB"; return (bytes/(1024*1024)).toFixed(1)+" MB"; };return (
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
      <div style={styles.app}>
        <header style={styles.header}>
          <div style={styles.logo}>
            <div style={styles.logoIcon}>📄</div>
            <span style={styles.logoText}>DocIntel</span>
          </div>
          <span style={styles.logoSub}>AI Document Intelligence</span>
        </header>
        <main style={styles.main}>
          {!analysis && (
            <div style={styles.hero}>
              <h1 style={styles.heroTitle}>Understand any document instantly</h1>
              <p style={styles.heroSub}>Upload a PDF or image — get a plain-English summary, key facts, risk flags, and live chat.</p>
            </div>
          )}
          {!analysis && (
            <>
              <div style={styles.uploadZone(dragging)} onDrop={onDrop} onDragOver={onDragOver} onDragLeave={onDragLeave} onClick={() => !file && fileInputRef.current?.click()}>
                <div style={styles.scanLine} />
                <input ref={fileInputRef} type="file" accept=".pdf,image/*" style={{ display: "none" }} onChange={(e) => handleFile(e.target.files?.[0])} />
                <span style={styles.uploadIcon}>{dragging ? "📂" : "📁"}</span>
                <div style={styles.uploadTitle}>{dragging ? "Drop to upload" : "Drop your document here"}</div>
                <div style={styles.uploadSub}>Supports PDF, PNG, JPG, WEBP · Up to 20MB</div>
                {!file && <button style={styles.uploadBtn} onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}>Browse files</button>}
                {file && (
                  <div style={styles.fileInfo} onClick={(e) => e.stopPropagation()}>
                    <span style={{ fontSize: 20 }}>{file.type === "application/pdf" ? "📄" : "🖼️"}</span>
                    <span style={styles.fileName}>{file.name}</span>
                    <span style={styles.fileSize}>{formatSize(file.size)}</span>
                    <button style={{ background: "none", border: "none", color: "#64748B", cursor: "pointer", fontSize: 18 }} onClick={() => { setFile(null); setBase64(null); setError(""); }}>×</button>
                  </div>
                )}
              </div>
              {file && (
                <>
                  <button style={styles.analyzeBtn(loading)} onClick={analyze} disabled={loading}>
                    {loading ? <><span style={styles.spinner} />Analyzing...</> : "Analyze Document →"}
                  </button>
                  {statusMsg && <div style={styles.statusText}>{statusMsg}</div>}
                </>
              )}
              {error && <div style={styles.error}>⚠️ {error}</div>}
            </>
          )}
          {analysis && (
            <div style={styles.results}>
              <div style={styles.docHeader}>
                <span style={styles.docIcon}>{file.type === "application/pdf" ? "📄" : "🖼️"}</span>
                <div>
                  <div style={styles.docName}>{file.name}</div>
                  <div style={styles.docMeta}>{formatSize(file.size)} · Analyzed</div>
                </div>
                <button style={styles.resetBtn} onClick={reset}>↩ New document</button>
              </div>
              <div style={styles.tabs}>
                {TABS.map((tab) => (
                  <button key={tab} style={styles.tab(activeTab === tab)} onClick={() => setActiveTab(tab)}>
                    {tab === "Summary" && "📝 "}{tab === "Key Points" && "🔑 "}{tab === "Risk Flags" && "⚠️ "}{tab === "Chat" && "💬 "}{tab}
                  </button>
                ))}
              </div>
              <div style={styles.panel}>
                {activeTab === "Summary" && <p style={styles.summaryText}>{analysis.summary}</p>}
                {activeTab === "Key Points" && (
                  analysis.keyPoints.length > 0
                    ? <ul style={styles.keyPointsList}>{analysis.keyPoints.map((pt, i) => <li key={i} style={styles.keyPoint}><span style={styles.keyPointDot} />{pt}</li>)}</ul>
                    : <div style={styles.emptyState}>No key points extracted.</div>
                )}
                {activeTab === "Risk Flags" && (
                  analysis.riskFlags.length > 0
                    ? <div>{analysis.riskFlags.map((risk, i) => <div key={i} style={styles.riskItem(risk.level)}><span>{risk.level === "high" ? "🔴" : risk.level === "medium" ? "🟡" : "🟢"}</span><div><div style={styles.riskLabel(risk.level)}>{risk.level} risk</div><div style={styles.riskText}>{risk.text}</div></div></div>)}</div>
                    : <div style={styles.emptyState}>✅ No significant risks identified.</div>
                )}
                {activeTab === "Chat" && (
                  <div style={styles.chatContainer}>
                    <div style={styles.chatMessages}>
                      {chatMessages.length === 0 && <div style={styles.emptyState}>Ask anything about your document...</div>}
                      {chatMessages.map((msg, i) => (
                        <div key={i} style={styles.chatMsg(msg.role)}>
                          <div style={styles.chatBubble(msg.role)}>{msg.content}</div>
                        </div>
                      ))}
                      {chatLoading && <div style={styles.chatMsg("assistant")}><div style={{ ...styles.chatBubble("assistant"), color: "#64748B" }}>Thinking...</div></div>}
                      <div ref={chatEndRef} />
                    </div>
                    <div style={styles.chatInputRow}>
                      <input style={styles.chatInput} type="text" placeholder="Ask about this document..." value={chatInput} onChange={(e) => setChatInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && sendChat()} disabled={chatLoading} />
                      <button style={styles.chatSendBtn(!chatInput.trim() || chatLoading)} onClick={sendChat} disabled={!chatInput.trim() || chatLoading}>Send</button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </main>
      </div>
    </>
  );
  }
