import { useState, useEffect } from "react";
import { X, MessageSquare, Send, Loader2 } from "lucide-react";
import { api } from "../api/api";

export default function ProjectDetailPanel({ project, token, onClose }) {
  const [comments, setComments] = useState([]);
  const [text, setText]         = useState("");
  const [sending, setSending]   = useState(false);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    api(`/projects/${project.id}/comments`, {}, token)
      .then(data => setComments(Array.isArray(data) ? data : []))
      .catch(() => setComments([]))
      .finally(() => setLoading(false));
  }, [project.id, token]);

  async function sendComment() {
    if (!text.trim()) return;
    setSending(true);
    try {
      const newComment = await api(
        `/projects/${project.id}/comments`,
        { method: "POST", body: JSON.stringify({ content: text }) },
        token
      );
      setComments(prev => [...prev, newComment]);
      setText("");
    } catch (err) {
      console.error("Comment failed:", err);
    } finally {
      setSending(false);
    }
  }

  const creator = project.owner?.username || project.creator?.username || "Unknown";

  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 1000,
        background: "rgba(0,0,0,.35)", backdropFilter: "blur(3px)",
        display: "flex", justifyContent: "flex-end",
      }}
      onClick={onClose}
    >
      <div
        onClick={e => e.stopPropagation()}
        className="anim-slidein"
        style={{
          width: "100%", maxWidth: 520, height: "100vh",
          background: "var(--surface)", display: "flex", flexDirection: "column",
          boxShadow: "-8px 0 40px rgba(0,0,0,.12)",
        }}
      >
        {/* ── Header ── */}
        <div
          style={{
            padding: "18px 22px", borderBottom: "1px solid var(--border)",
            display: "flex", justifyContent: "space-between", alignItems: "center",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--green)" }} />
            <span style={{ fontSize: 12, fontWeight: 600, color: "var(--t2)", textTransform: "uppercase", letterSpacing: ".06em" }}>
              Project
            </span>
          </div>
          <button onClick={onClose} style={{ background: "none", color: "var(--t2)", display: "flex", padding: 4, borderRadius: 6 }}>
            <X size={17} />
          </button>
        </div>

        {/* ── Scrollable body ── */}
        <div style={{ flex: 1, overflow: "auto", padding: 24 }}>
          <h2
            style={{
              fontFamily: "'Bricolage Grotesque', sans-serif",
              fontSize: 21, fontWeight: 700, color: "var(--t1)",
              marginBottom: 10, lineHeight: 1.3,
            }}
          >
            {project.title || project.name}
          </h2>

          {/* Creator */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
            <div
              style={{
                width: 24, height: 24, borderRadius: "50%", background: "var(--accent-bg)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 10, fontWeight: 700, color: "var(--accent)",
              }}
            >
              {creator[0]?.toUpperCase()}
            </div>
            <span style={{ fontSize: 13, color: "var(--t2)" }}>
              by <strong style={{ color: "var(--t1)" }}>{creator}</strong>
            </span>
          </div>

          {/* Description */}
          <p style={{ fontSize: 14, color: "var(--t2)", lineHeight: 1.78, marginBottom: 22 }}>
            {project.description || "No description provided."}
          </p>

          {/* Skills */}
          {project.skills?.length > 0 && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 7, marginBottom: 26 }}>
              {project.skills.map((s, i) => (
                <span
                  key={i}
                  style={{
                    padding: "4px 12px", fontSize: 12, fontWeight: 500,
                    background: "var(--accent-bg)", color: "var(--accent)", borderRadius: 20,
                  }}
                >
                  {s}
                </span>
              ))}
            </div>
          )}

          <div style={{ height: 1, background: "var(--border)", marginBottom: 22 }} />

          {/* Comments heading */}
          <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 16 }}>
            <MessageSquare size={14} color="var(--t2)" />
            <span style={{ fontWeight: 600, fontSize: 14, color: "var(--t1)" }}>
              Comments{" "}
              {comments.length > 0 && (
                <span style={{ color: "var(--t3)", fontWeight: 400 }}>({comments.length})</span>
              )}
            </span>
          </div>

          {/* Comments list */}
          {loading ? (
            <div style={{ display: "flex", justifyContent: "center", padding: 32 }}>
              <Loader2 size={20} className="spin" color="var(--t3)" />
            </div>
          ) : comments.length === 0 ? (
            <div style={{ textAlign: "center", padding: "28px 0", color: "var(--t3)", fontSize: 13 }}>
              No comments yet — be the first!
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {comments.map((c, i) => {
                const author = c.user?.username || c.author || "Anonymous";
                return (
                  <div key={i} style={{ display: "flex", gap: 10 }}>
                    <div
                      style={{
                        width: 26, height: 26, borderRadius: "50%",
                        background: "var(--surface-2)", flexShrink: 0,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 10, fontWeight: 700, color: "var(--t2)",
                      }}
                    >
                      {author[0]?.toUpperCase()}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 13, color: "var(--t1)", marginBottom: 3 }}>{author}</div>
                      <p style={{ fontSize: 13, color: "var(--t2)", lineHeight: 1.65 }}>{c.content || c.text}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ── Comment input ── */}
        <div style={{ padding: "14px 22px", borderTop: "1px solid var(--border)" }}>
          <div style={{ display: "flex", gap: 8 }}>
            <input
              value={text}
              onChange={e => setText(e.target.value)}
              onKeyDown={e => e.key === "Enter" && sendComment()}
              placeholder="Add a comment…"
              style={{ flex: 1 }}
            />
            <button
              onClick={sendComment}
              disabled={sending || !text.trim()}
              style={{
                padding: "0 16px", background: "var(--accent)", color: "#fff",
                borderRadius: "var(--r-sm)", display: "flex", alignItems: "center",
                opacity: sending || !text.trim() ? 0.45 : 1,
              }}
            >
              {sending ? <Loader2 size={14} className="spin" /> : <Send size={14} />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
