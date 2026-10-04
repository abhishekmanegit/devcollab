import { useCallback, useEffect, useState } from "react";
import { X, MessageSquare, Send, Loader2, Users, Sparkles, UserPlus } from "lucide-react";
import { api, githubHandle, timeAgo } from "../api/api";
import Avatar from "../components/Avatar";
import GithubIcon from "../components/GithubIcon";

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
  const [error, setError]       = useState("");
  const [invitable, setInvitable] = useState([]);
  const [inviting, setInviting]   = useState(null);
  const [notice, setNotice]       = useState("");

  const joined = project.joined;
  const isOwner = project.owner;
  const name = project.title || project.name;
  const creator = creatorName(project);
  const skills = Array.isArray(project.skills) ? project.skills : [];
  const memberIds = new Set(members.map(m => m.id));
  const addable = project.owner
    ? invitable.filter(person => !memberIds.has(person.id))
    : [];

  const loadDiscussion = useCallback(() => {
    return Promise.all([
      api(`/projects/${project.id}/comments`, {}, token),
      api(`/projects/${project.id}/members`, {}, token),
    ])
      .then(([commentData, memberData]) => {
        setComments(Array.isArray(commentData) ? commentData : []);
        setMembers(Array.isArray(memberData) ? memberData : []);
      })
      .catch(err => {
        setComments([]);
        setMembers([]);
        setError(err?.message || "Could not load discussion for this project.");
      })
      .finally(() => setLoading(false));
  }, [project.id, token]);

  useEffect(() => {
    loadDiscussion();
  }, [loadDiscussion]);

  // Owners can pull in developers they are connected with.
  useEffect(() => {
    if (!project.owner) return;

    let cancelled = false;

    api("/collaborations/connections", {}, token)
      .then(data => { if (!cancelled) setInvitable(Array.isArray(data) ? data : []); })
      .catch(() => { if (!cancelled) setInvitable([]); });

    return () => { cancelled = true; };
  }, [project.owner, token]);

  async function addMember(userId, name) {
    setInviting(userId);
    setError("");
    try {
      const result = await api(
        `/projects/${project.id}/members`,
        { method: "POST", body: JSON.stringify({ userId }) },
        token
      );
      setInvitable(prev => prev.filter(person => person.id !== userId));
      const memberData = await api(`/projects/${project.id}/members`, {}, token);
      setMembers(Array.isArray(memberData) ? memberData : []);
      onRefresh?.();
      if (result?.message) setNotice(result.message);
    } catch (err) {
      setError(err?.message || `Could not add ${name}.`);
    } finally {
      setInviting(null);
    }
  }

  async function sendComment() {
    if (!text.trim()) return;
    setSending(true);
    setError("");
    try {
      const newComment = await api(
        `/projects/${project.id}/comments`,
        { method: "POST", body: JSON.stringify({ content: text }) },
        token
      );
      setComments(prev => [...prev, newComment]);
      setText("");
    } catch (err) {
      setError(err?.message || "Could not post your comment. Please try again.");
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
    } catch (err) {
      onJoin?.({ type: "error", msg: err?.message || "Could not join project. Please try again." });
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

          {/* Skills needed */}
          {skills.length > 0 && (
            <div style={{ marginBottom: 22 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 10 }}>
                <Sparkles size={14} color="var(--t2)" />
                <span style={{ fontWeight: 600, fontSize: 14, color: "var(--t1)" }}>Skills needed</span>
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {skills.map(skill => (
                  <span
                    key={skill}
                    style={{
                      padding: "5px 13px", fontSize: 13, fontWeight: 500,
                      background: "var(--accent-bg)", color: "var(--accent)", borderRadius: 20,
                    }}
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

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

            {notice && (
              <p style={{
                marginTop: 10, padding: "7px 11px", fontSize: 12,
                background: "var(--green-bg)", border: "1px solid #BBF7D0",
                borderRadius: "var(--r-sm)", color: "var(--green)",
              }}>
                {notice}
              </p>
            )}

            {isOwner && addable.length > 0 && (
              <div style={{ marginTop: 14 }}>
                <p style={{ fontSize: 11, fontWeight: 600, color: "var(--t3)", textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 8 }}>
                  Add from your connections
                </p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {addable.map(person => (
                    <button
                      key={person.id}
                      onClick={() => addMember(person.id, person.name)}
                      disabled={inviting === person.id}
                      style={{
                        display: "flex", alignItems: "center", gap: 7,
                        padding: "6px 12px", fontSize: 13, fontWeight: 500,
                        background: "var(--surface)", color: "var(--accent)",
                        border: "1px dashed var(--accent)", borderRadius: 20,
                      }}
                    >
                      {inviting === person.id
                        ? <Loader2 size={12} className="spin" />
                        : <UserPlus size={12} />}
                      {person.name}
                    </button>
                  ))}
                </div>
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
                const author = c.authorName || c.user?.name || "Anonymous";
                const ghUrl = c.authorGithubUrl || c.user?.githubUrl;
                const handle = githubHandle(ghUrl);
                return (
                  <div key={c.id || i} style={{ display: "flex", gap: 10 }}>
                    <Avatar
                      name={author}
                      src={c.authorAvatarUrl}
                      size={26}
                      style={{ background: "var(--surface-2)", color: "var(--t2)" }}
                    />
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 3 }}>
                        <span style={{ fontWeight: 600, fontSize: 13, color: "var(--t1)" }}>{author}</span>
                        {handle && (
                          <a
                            href={ghUrl}
                            target="_blank"
                            rel="noreferrer"
                            style={{
                              display: "inline-flex", alignItems: "center", gap: 4,
                              fontSize: 12, fontWeight: 500, color: "var(--accent)",
                              textDecoration: "none",
                            }}
                          >
                            <GithubIcon size={12} />
                            @{handle}
                          </a>
                        )}
                        {c.createdAt && (
                          <span style={{ fontSize: 11, color: "var(--t3)" }}>{timeAgo(c.createdAt)}</span>
                        )}
                      </div>
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
          {error && (
            <div
              style={{
                marginBottom: 9, padding: "8px 12px", fontSize: 12,
                background: "#FEF2F2", border: "1px solid #FECACA",
                borderRadius: "var(--r-sm)", color: "var(--red)",
              }}
            >
              {error}
            </div>
          )}
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
