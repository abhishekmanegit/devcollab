import { useCallback, useEffect, useState } from "react";
import { Loader2, Send, UserPlus, Check, Clock } from "lucide-react";
import { api, githubHandle } from "../api/api";
import Avatar from "../components/Avatar";
import GithubIcon from "../components/GithubIcon";

const RELATION_COPY = {
  NONE: { label: "Let's collaborate on projects", icon: Send, variant: "primary", disabled: false },
  PENDING_OUT: { label: "Request sent", icon: Clock, variant: "muted", disabled: true },
  PENDING_IN: { label: "Awaiting your response", icon: Clock, variant: "muted", disabled: true },
  CONNECTED: { label: "Connected", icon: Check, variant: "connected", disabled: true },
  SELF: { label: "This is you", icon: UserPlus, variant: "muted", disabled: true },
};

/**
 * Public profile of another developer, with the collaboration request action.
 */
export default function DeveloperProfileModal({ userId, token, onClose, onToast, onRequestSent }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const profile = await api(`/users/${userId}`, {}, token);
      setData(profile);
    } catch (err) {
      setError(err?.message || "Could not load this profile.");
    } finally {
      setLoading(false);
    }
  }, [userId, token]);

  useEffect(() => {
    let cancelled = false;

    api(`/users/${userId}`, {}, token)
      .then(profile => { if (!cancelled) setData(profile); })
      .catch(err => { if (!cancelled) setError(err?.message || "Could not load this profile."); })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [userId, token]);

  async function sendRequest() {
    setSending(true);
    try {
      await api("/collaborations/requests", {
        method: "POST",
        body: JSON.stringify({ userId, message: message.trim() || null }),
      }, token);
      onRequestSent?.();
      const refreshed = await api(`/users/${userId}`, {}, token);
      setData(refreshed);
      onToast?.("Collaboration request sent!");
    } catch (err) {
      onToast?.(err?.message || "Could not send the request.", "error");
      load();
    } finally {
      setSending(false);
    }
  }

  const handle = githubHandle(data?.profile?.githubUrl);
  const relation = RELATION_COPY[data?.relation] || RELATION_COPY.NONE;
  const RelationIcon = relation.icon;

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, background: "rgba(15,23,42,.45)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: 20, zIndex: 60,
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: "100%", maxWidth: 480, maxHeight: "88vh", overflow: "auto",
          background: "var(--surface)", borderRadius: "var(--r-lg)",
          border: "1px solid var(--border)", boxShadow: "0 18px 48px rgba(15,23,42,.18)",
        }}
      >
        {loading && !data ? (
          <div style={{ display: "flex", justifyContent: "center", padding: 44 }}>
            <Loader2 size={20} className="spin" color="var(--t3)" />
          </div>
        ) : error && !data ? (
          <div style={{ padding: 26, textAlign: "center" }}>
            <p style={{ fontSize: 13, color: "var(--red)", marginBottom: 16 }}>{error}</p>
            <button className="btn-primary" onClick={onClose}>Close</button>
          </div>
        ) : data ? (
          <>
            <div style={{ padding: 24, borderBottom: "1px solid var(--border)" }}>
              <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
                <Avatar
                  name={data.profile.name}
                  src={data.profile.profilePictureUrl}
                  size={56}
                  style={{ border: "2px solid var(--border)" }}
                />
                <div style={{ minWidth: 0 }}>
                  <h2 style={{ fontFamily: "'Bricolage Grotesque',sans-serif", fontSize: 18, fontWeight: 700, color: "var(--t1)" }}>
                    {data.profile.name}
                  </h2>
                  {handle ? (
                    <a
                      href={data.profile.githubUrl}
                      target="_blank"
                      rel="noreferrer"
                      style={{
                        display: "inline-flex", alignItems: "center", gap: 5,
                        marginTop: 4, fontSize: 12, fontWeight: 500,
                        color: "var(--accent)", textDecoration: "none",
                      }}
                    >
                      <GithubIcon size={12} />@{handle}
                    </a>
                  ) : (
                    <p style={{ fontSize: 12, color: "var(--t3)", marginTop: 4 }}>No GitHub profile added</p>
                  )}
                </div>
              </div>

              <p style={{ fontSize: 13, color: data.profile.bio ? "var(--t1)" : "var(--t3)", lineHeight: 1.7, marginTop: 16 }}>
                {data.profile.bio || "This developer has not added a bio yet."}
              </p>

              {data.profile.skills?.length > 0 && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 7, marginTop: 14 }}>
                  {data.profile.skills.map((s, i) => (
                    <span key={i} style={{ padding: "4px 11px", fontSize: 12, fontWeight: 500, background: "var(--accent-bg)", color: "var(--accent)", borderRadius: 20 }}>
                      {s}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div style={{ padding: 24 }}>
              <p style={{ fontSize: 11, fontWeight: 600, color: "var(--t3)", textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 10 }}>
                Projects ({data.projects.length})
              </p>
              {data.projects.length === 0 ? (
                <p style={{ fontSize: 13, color: "var(--t3)" }}>No projects yet.</p>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {data.projects.map(project => (
                    <div key={project.id} style={{ padding: 12, border: "1px solid var(--border)", borderRadius: "var(--r-sm)", background: "var(--surface-2)" }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: "var(--t1)" }}>{project.title}</div>
                      {project.description && (
                        <div style={{ fontSize: 12, color: "var(--t2)", marginTop: 3 }}>{project.description}</div>
                      )}
                      <div style={{ fontSize: 11, color: "var(--t3)", marginTop: 5 }}>
                        {project.memberCount} member{project.memberCount === 1 ? "" : "s"}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {data.relation === "NONE" && (
                <div style={{ marginTop: 20 }}>
                  <label style={{ fontSize: 13, fontWeight: 500, color: "var(--t2)", display: "block", marginBottom: 6 }}>
                    Add a note (optional)
                  </label>
                  <input
                    value={message}
                    onChange={e => setMessage(e.target.value.slice(0, 500))}
                    placeholder={`Hey ${data.profile.name}, let's build something together`}
                  />
                </div>
              )}

              <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
                <button
                  onClick={onClose}
                  style={{ flex: 1, padding: "9px 0", fontSize: 14, fontWeight: 500, background: "var(--surface-2)", color: "var(--t2)", borderRadius: "var(--r-sm)", border: "1px solid var(--border)" }}
                >
                  Close
                </button>
                <button
                  onClick={relation.disabled ? undefined : sendRequest}
                  disabled={relation.disabled || sending}
                  style={{
                    flex: 2, padding: "9px 0", fontSize: 14, fontWeight: 600,
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
                    background: relation.disabled ? "var(--surface-2)" : "var(--accent)",
                    color: relation.disabled ? "var(--t3)" : "#fff",
                    borderRadius: "var(--r-sm)",
                    border: relation.variant === "connected" ? "1px solid #BBF7D0" : "none",
                  }}
                >
                  {sending ? <Loader2 size={14} className="spin" /> : <RelationIcon size={14} />}
                  {relation.label}
                </button>
              </div>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}