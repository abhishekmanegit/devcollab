import { useState } from "react";
import { FolderOpen, Users, Loader2 } from "lucide-react";
import { api } from "../api/api";

const PALETTES = [
  ["#EEF2FF", "#3730A3"],
  ["#F0FDF4", "#15803D"],
  ["#FFF7ED", "#C2410C"],
  ["#FDF4FF", "#86198F"],
  ["#F0FDFA", "#0F766E"],
];

function creatorName(project) {
  return project.creatorName || project.createdBy?.name || project.owner?.username || "Unknown";
}

export default function ProjectCard({ project, token, onOpen, onJoin }) {
  const [joining, setJoining] = useState(false);
  const joined = project.joined;
  const isOwner = project.owner;

  const [bg, fg] = PALETTES[(project.id || 0) % PALETTES.length];
  const name = project.title || project.name || "Untitled";
  const creator = creatorName(project);
  const memberCount = project.memberCount ?? 0;

  async function handleJoin(e) {
    e.stopPropagation();
    if (joined || isOwner || joining) return;

    setJoining(true);
    try {
      const res = await api(`/projects/${project.id}/join`, { method: "POST" }, token);
      const message = res?.message || res;

      if (typeof message === "string" && message.toLowerCase().includes("success")) {
        onJoin?.({ type: "success", msg: `You joined ${name}!` });
      } else if (typeof message === "string" && message.toLowerCase().includes("already")) {
        onJoin?.({ type: "info", msg: message });
      } else {
        onJoin?.({ type: "info", msg: message || "Request completed" });
      }
    } catch {
      onJoin?.({ type: "error", msg: "Could not join project. Please try again." });
    } finally {
      setJoining(false);
    }
  }

  return (
    <div
      onClick={onOpen}
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: "var(--r-lg)",
        padding: 20,
        cursor: "pointer",
        display: "flex",
        flexDirection: "column",
        gap: 14,
        transition: "all 0.18s",
      }}
      onMouseEnter={e => {
        e.currentTarget.style.boxShadow = "var(--sh-md)";
        e.currentTarget.style.transform = "translateY(-2px)";
        e.currentTarget.style.borderColor = "var(--border-2)";
      }}
      onMouseLeave={e => {
        e.currentTarget.style.boxShadow = "none";
        e.currentTarget.style.transform = "none";
        e.currentTarget.style.borderColor = "var(--border)";
      }}
    >
      {/* Top row */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
        <div
          style={{
            width: 38, height: 38, borderRadius: 9,
            background: bg, display: "flex", alignItems: "center", justifyContent: "center",
          }}
        >
          <FolderOpen size={17} color={fg} />
        </div>
        <span
          style={{
            fontSize: 11, padding: "3px 9px", borderRadius: 20,
            background: joined ? "var(--accent-bg)" : "var(--green-bg)",
            color: joined ? "var(--accent)" : "var(--green)",
            fontWeight: 500,
          }}
        >
          {isOwner ? "Owner" : joined ? "Joined" : "Open"}
        </span>
      </div>

      {/* Title + description */}
      <div>
        <h3
          style={{
            fontFamily: "'Bricolage Grotesque', sans-serif",
            fontSize: 15, fontWeight: 600, color: "var(--t1)",
            marginBottom: 6, lineHeight: 1.35,
          }}
        >
          {name}
        </h3>
        <p
          style={{
            fontSize: 13, color: "var(--t2)", lineHeight: 1.65,
            display: "-webkit-box", WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical", overflow: "hidden",
          }}
        >
          {project.description || "No description provided."}
        </p>
      </div>

      {/* Footer */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "auto" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div
              style={{
                width: 20, height: 20, borderRadius: "50%",
                background: "var(--accent-bg)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 9, fontWeight: 700, color: "var(--accent)",
              }}
            >
              {creator[0]?.toUpperCase()}
            </div>
            <span style={{ fontSize: 12, color: "var(--t2)" }}>{creator}</span>
          </div>
          {memberCount > 0 && (
            <span style={{ fontSize: 11, color: "var(--t3)", display: "flex", alignItems: "center", gap: 3 }}>
              <Users size={11} /> {memberCount}
            </span>
          )}
        </div>

        {isOwner ? (
          <span style={{ fontSize: 11, fontWeight: 600, color: "var(--t3)", padding: "5px 0" }}>
            Your project
          </span>
        ) : (
          <button
            onClick={handleJoin}
            disabled={joined || joining}
            style={{
              padding: "5px 12px", fontSize: 12, fontWeight: 600,
              background: joined ? "var(--green-bg)" : joining ? "#94A3B8" : "var(--accent)",
              color: joined ? "var(--green)" : "#fff",
              borderRadius: "var(--r-sm)",
              display: "flex", alignItems: "center", gap: 4,
              opacity: joining ? 0.8 : 1,
            }}
          >
            {joining ? <Loader2 size={11} className="spin" /> : <Users size={11} />}
            {joined ? "Joined" : "Join"}
          </button>
        )}
      </div>
    </div>
  );
}
