import { useEffect, useState } from "react";
import { Check, Clock, Loader2, Users, X } from "lucide-react";
import { api, githubHandle, timeAgo } from "../api/api";
import Avatar from "../components/Avatar";
import GithubIcon from "../components/GithubIcon";
import DeveloperProfileModal from "../modals/DeveloperProfileModal";

export default function RequestsPage({ token, onToast, onCountChange }) {
  const [tab, setTab] = useState("incoming");
  const [busyId, setBusyId] = useState(null);
  const [selected, setSelected] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);
  // null means the first load has not finished yet, which drives the spinner.
  const [state, setState] = useState(null);

  const loading = state === null;
  const incoming = state?.incoming ?? [];
  const outgoing = state?.outgoing ?? [];
  const connections = state?.connections ?? [];
  const error = state?.error ?? "";

  useEffect(() => {
    let cancelled = false;

    Promise.all([
      api("/collaborations/requests/incoming", {}, token),
      api("/collaborations/requests/outgoing", {}, token),
      api("/collaborations/connections", {}, token),
    ])
      .then(([incomingData, outgoingData, connectionData]) => {
        if (cancelled) return;
        const safeIncoming = Array.isArray(incomingData) ? incomingData : [];
        setState({
          incoming: safeIncoming,
          outgoing: Array.isArray(outgoingData) ? outgoingData : [],
          connections: Array.isArray(connectionData) ? connectionData : [],
          error: "",
        });
        onCountChange?.(safeIncoming.filter(r => r.status === "PENDING").length);
      })
      .catch(err => {
        if (cancelled) return;
        setState({
          incoming: [],
          outgoing: [],
          connections: [],
          error: err?.message || "Could not load your requests.",
        });
      });

    return () => { cancelled = true; };
  }, [token, reloadKey, onCountChange]);

  async function respond(request, action) {
    setBusyId(request.id);
    try {
      await api(`/collaborations/requests/${request.id}/${action}`, { method: "POST" }, token);
      onToast?.(action === "accept"
        ? `You are now connected with ${request.from.name}`
        : "Request declined");
      setReloadKey(k => k + 1);
    } catch (err) {
      onToast?.(err?.message || "That did not work. Try again.", "error");
      setReloadKey(k => k + 1);
    } finally {
      setBusyId(null);
    }
  }

  const tabs = [
    { id: "incoming", label: "Incoming", count: incoming.filter(r => r.status === "PENDING").length },
    { id: "outgoing", label: "Sent", count: outgoing.filter(r => r.status === "PENDING").length },
    { id: "connections", label: "Connections", count: connections.length },
  ];

  const list = tab === "incoming" ? incoming : tab === "outgoing" ? outgoing : connections;

  return (
    <div style={{ flex: 1, overflow: "auto" }}>

      <div style={{
        padding: "16px 28px", borderBottom: "1px solid var(--border)",
        background: "var(--surface)", position: "sticky", top: 0, zIndex: 10,
      }}>
        <h1 style={{ fontFamily: "'Bricolage Grotesque',sans-serif", fontSize: 19, fontWeight: 700 }}>Collaborations</h1>
        <p style={{ fontSize: 13, color: "var(--t2)", marginTop: 2 }}>Respond to requests and see who you work with</p>
      </div>

      <div style={{ padding: 28, maxWidth: 760 }}>

        <div style={{ display: "flex", gap: 6, marginBottom: 22 }}>
          {tabs.map(({ id, label, count }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              style={{
                padding: "6px 13px", fontSize: 13, fontWeight: tab === id ? 600 : 500,
                display: "flex", alignItems: "center", gap: 6,
                background: tab === id ? "var(--accent-bg)" : "var(--surface)",
                color: tab === id ? "var(--accent)" : "var(--t2)",
                border: "1px solid var(--border)", borderRadius: 20,
              }}
            >
              {label}
              {count > 0 && (
                <span style={{
                  padding: "1px 7px", fontSize: 11, fontWeight: 700,
                  background: tab === id ? "var(--accent)" : "var(--surface-2)",
                  color: tab === id ? "#fff" : "var(--t2)", borderRadius: 20,
                }}>
                  {count}
                </span>
              )}
            </button>
          ))}
        </div>

        {error && (
          <p style={{ padding: "9px 12px", fontSize: 13, background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: "var(--r-sm)", color: "var(--red)" }}>
            {error}
          </p>
        )}

        {loading ? (
          <div style={{ display: "flex", justifyContent: "center", padding: 40 }}>
            <Loader2 size={20} className="spin" color="var(--t3)" />
          </div>
        ) : list.length === 0 ? (
          <div style={{ marginTop: 32, textAlign: "center", color: "var(--t3)" }}>
            <Users size={26} />
            <p style={{ fontSize: 13, marginTop: 10 }}>
              {tab === "incoming" && "No collaboration requests yet."}
              {tab === "outgoing" && "You have not asked anyone to collaborate yet."}
              {tab === "connections" && "No connections yet. Send a request from the People page."}
            </p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {list.map(item => {
              const person = tab === "connections" ? item : item.from;
              const handle = githubHandle(person.githubUrl);
              const pending = item.status === "PENDING";
              const accepted = item.status === "ACCEPTED";

              return (
                <div
                  key={item.id ?? person.id}
                  style={{
                    padding: 15, background: "var(--surface)",
                    border: "1px solid var(--border)", borderRadius: "var(--r-lg)",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 13 }}>
                    <Avatar
                      name={person.name}
                      src={person.profilePictureUrl}
                      size={40}
                      style={{ flexShrink: 0, border: "1.5px solid var(--border)" }}
                    />
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                        <button
                          onClick={() => setSelected(person.id)}
                          style={{ fontSize: 14, fontWeight: 600, color: "var(--t1)", textAlign: "left" }}
                        >
                          {person.name}
                        </button>
                        {handle && (
                          <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 12, color: "var(--accent)" }}>
                            <GithubIcon size={12} />@{handle}
                          </span>
                        )}
                        {tab !== "connections" && (
                          <span style={{
                            display: "inline-flex", alignItems: "center", gap: 4,
                            padding: "2px 8px", fontSize: 11, fontWeight: 600, borderRadius: 20,
                            background: pending ? "#FEF3C7" : accepted ? "var(--green-bg)" : "var(--surface-2)",
                            color: pending ? "#B45309" : accepted ? "var(--green)" : "var(--t3)",
                          }}>
                            {pending && <Clock size={10} />}
                            {accepted && <Check size={10} />}
                            {pending ? "Pending" : accepted ? "Connected" : "Declined"}
                          </span>
                        )}
                      </div>
                      {item.message && (
                        <p style={{ fontSize: 12, color: "var(--t2)", marginTop: 6, lineHeight: 1.6 }}>
                          “{item.message}”
                        </p>
                      )}
                      {item.createdAt && (
                        <span style={{ fontSize: 11, color: "var(--t3)" }}>{timeAgo(item.createdAt)}</span>
                      )}
                    </div>

                    {tab === "incoming" && pending && (
                      <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                        <button
                          onClick={() => respond(item, "decline")}
                          disabled={busyId === item.id}
                          title="Decline"
                          style={{
                            width: 32, height: 32, borderRadius: "var(--r-sm)",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            background: "var(--surface)", color: "var(--t2)",
                            border: "1px solid var(--border)",
                          }}
                        >
                          <X size={14} />
                        </button>
                        <button
                          onClick={() => respond(item, "accept")}
                          disabled={busyId === item.id}
                          style={{
                            padding: "0 13px", height: 32, fontSize: 13, fontWeight: 600,
                            display: "flex", alignItems: "center", gap: 6,
                            background: "var(--accent)", color: "#fff",
                            borderRadius: "var(--r-sm)", border: "none",
                          }}
                        >
                          {busyId === item.id ? <Loader2 size={13} className="spin" /> : <Check size={13} />}
                          Accept
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {selected !== null && (
        <DeveloperProfileModal
          key={selected}
          userId={selected}
          token={token}
          onClose={() => setSelected(null)}
          onToast={onToast}
        />
      )}
    </div>
  );
}