import { useState, useEffect } from "react";
import { X, MessageSquare, Send, Loader2, Users } from "lucide-react";
import { api } from "../api/api";

function creatorName(project) {
  return project.creatorName || project.createdBy?.name || project.owner?.username || "Unknown";
}

export default function ProjectDetailPanel({ project, token, onClose, onJoin, onRefresh }) {
  const [comments, setComments] = useState([]);
  const [members, setMembers]   = useState([]);
  const [text, setText]         = useState("");
  const [sending, setSending]   = useState(false);
  const [joining, setJoining]   = useState(false);
  const [loading, setLoading]   = useState(true);

  const joined = project.joined;
  const isOwner = project.owner;
  const name = project.title || project.name;
  const creator = creatorName(project);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      api(`/projects/${project.id}/comments`, {}, token),
      api(`/projects/${project.id}/members`, {}, token),
    ])
      .then(([commentData, memberData]) => {
        setComments(Array.isArray(commentData) ? commentData : []);
        setMembers(Array.isArray(memberData) ? memberData : []);
      })
      .catch(() => {
        setComments([]);
        setMembers([]);
      })
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

  async function handleJoin() {
    if (joined || isOwner || joining) return;
    setJoining(true);
    try {
      const res = await api(`/projects/${project.id}/join`, { method: "POST" }, token);
      const message = res?.message || res;
      if (typeof message === "string" && message.toLowerCase().includes("success")) {
        onJoin?.({ type: "success", msg: `You joined ${name}!` });
      } else {
        onJoin?.({ type: "info", msg: message || "Request completed" });
      }
      const memberData = await api(`/projects/${project.id}/members`, {}, token);
      setMembers(Array.isArray(memberData) ? memberData : []);
      onRefresh?.();
    } catch {
      onJoin?.({ type: "error", msg: "Could not join project. Please try again." });
    } finally {
      setJoining(false);
    }
  }

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
            <div style={{ width: 7, height: 7, borderRadius: "50%", background: joined ? "var(--accent)" : "var(--green)" }} />
            <span style={{ fontSize: 12, fontWeight: 600, color: "var(--t2)", textTransform: "uppercase", letterSpacing: ".06em" }}>
              {isOwner ? "Your Project" : joined ? "Collaborator" : "Open Project"}
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
            {name}
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

          {/* Join CTA */}
          {!isOwner && !joined && (
            <button
              onClick={handleJoin}
              disabled={joining}
              style={{
                width: "100%", padding: "10px 0", marginBottom: 22,
                background: joining ? "#94A3B8" : "var(--accent)", color: "#fff",
                borderRadius: "var(--r-sm)", fontSize: 14, fontWeight: 600,
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              }}
            >
              {joining ? <Loader2 size={15} className="spin" /> : <Users size={15} />}
              Join this project
            </button>
          )}

          {/* Team */}
          <div style={{ marginBottom: 26 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 12 }}>
              <Users size={14} color="var(--t2)" />
              <span style={{ fontWeight: 600, fontSize: 14, color: "var(--t1)" }}>
                Team {members.length > 0 && <span style={{ color: "var(--t3)", fontWeight: 400 }}>({members.length})</span>}
              </span>
            </div>
            {loading ? (
              <div style={{ display: "flex", justifyContent: "center", padding: 16 }}>
                <Loader2 size={18} className="spin" color="var(--t3)" />
              </div>
            ) : members.length === 0 ? (
              <p style={{ fontSize: 13, color: "var(--t3)" }}>No collaborators yet.</p>
            ) : (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {members.map(m => (
                  <div
                    key={m.id}
                    style={{
                      display: "flex", alignItems: "center", gap: 7,
                      padding: "6px 12px", background: "var(--surface-2)",
                      borderRadius: 20, fontSize: 13,
                    }}
                  >
                    <div
                      style={{
                        width: 22, height: 22, borderRadius: "50%",
                        background: "var(--accent-bg)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 10, fontWeight: 700, color: "var(--accent)",
                      }}
                    >
                      {(m.name || "?")[0]?.toUpperCase()}
                    </div>
                    <span style={{ fontWeight: 500, color: "var(--t1)" }}>{m.name}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div style={{ height: 1, background: "var(--border)", marginBottom: 22 }} />

          {/* Comments heading */}
          <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 16 }}>
            <MessageSquare size={14} color="var(--t2)" />
            <span style={{ fontWeight: 600, fontSize: 14, color: "var(--t1)" }}>
              Discussion{" "}
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
                const author = c.user?.name || c.user?.username || c.author || "Anonymous";
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
