import { useState, useEffect } from "react";
import { Plus, Search, FolderOpen, Loader2 } from "lucide-react";
import { api } from "../api/api";
import ProjectCard from "../components/ProjectCard";
import ProjectDetailPanel from "../modals/ProjectDetailPanel";

export default function Dashboard({ token, user, onShowCreate }) {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [selected, setSelected] = useState(null);
  const [search, setSearch]     = useState("");

  const loadProjects = () => {
    setLoading(true);
    api("/projects", {}, token)
      .then(data => setProjects(Array.isArray(data) ? data : data?.content || []))
      .catch(() => setProjects([]))
      .finally(() => setLoading(false));
  };

  useEffect(loadProjects, []);

  const filtered = projects.filter(p =>
    (p.title || p.name || "").toLowerCase().includes(search.toLowerCase()) ||
    (p.description || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ flex: 1, overflow: "auto" }}>

      {/* ── Topbar ── */}
      <div style={{
        padding: "16px 28px", borderBottom: "1px solid var(--border)",
        background: "var(--surface)", position: "sticky", top: 0, zIndex: 10,
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <div>
          <h1 style={{ fontFamily: "'Bricolage Grotesque',sans-serif", fontSize: 19, fontWeight: 700 }}>Projects</h1>
          <p style={{ fontSize: 13, color: "var(--t2)", marginTop: 2 }}>Discover and join developer projects</p>
        </div>

        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <div style={{ position: "relative" }}>
            <Search size={13} style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)", color: "var(--t3)" }} />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search projects…"
              style={{ paddingLeft: 32, height: 36, width: 210, borderRadius: "var(--r-sm)" }}
            />
          </div>
          <button
            onClick={onShowCreate}
            style={{
              display: "flex", alignItems: "center", gap: 6,
              padding: "8px 16px", background: "var(--accent)", color: "#fff",
              borderRadius: "var(--r-sm)", fontSize: 14, fontWeight: 600,
            }}
          >
            <Plus size={14} /> New Project
          </button>
        </div>
      </div>

      {/* ── Content ── */}
      <div style={{ padding: "24px 28px" }}>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14, marginBottom: 28 }}>
          {[
            { label: "Total Projects", value: projects.length,                       color: "var(--accent)", bg: "var(--accent-bg)" },
            { label: "Open to Join",   value: projects.length,                       color: "var(--green)",  bg: "var(--green-bg)"  },
            { label: "Your Matches",   value: Math.floor(projects.length * 0.6),     color: "#C2410C",       bg: "#FFF7ED"          },
          ].map(({ label, value, color, bg }) => (
            <div key={label} style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--r)", padding: "16px 18px" }}>
              <div style={{ fontSize: 13, color: "var(--t2)", marginBottom: 8 }}>{label}</div>
              <div style={{ fontFamily: "'Bricolage Grotesque',sans-serif", fontSize: 24, fontWeight: 700, color }}>{value}</div>
            </div>
          ))}
        </div>

        {/* Grid */}
        {loading ? (
          <div style={{ display: "flex", justifyContent: "center", padding: 60 }}>
            <Loader2 size={22} className="spin" color="var(--t3)" />
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "56px 0", display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
            <div style={{ width: 52, height: 52, borderRadius: 13, background: "var(--surface-2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <FolderOpen size={22} color="var(--t3)" />
            </div>
            <h3 style={{ fontFamily: "'Bricolage Grotesque',sans-serif", fontSize: 17, fontWeight: 600 }}>
              {search ? "No results found" : "No projects yet"}
            </h3>
            <p style={{ color: "var(--t2)", fontSize: 14 }}>
              {search ? "Try different keywords" : "Be the first to create one!"}
            </p>
            {!search && (
              <button
                onClick={onShowCreate}
                style={{ marginTop: 6, padding: "8px 18px", background: "var(--accent)", color: "#fff", fontSize: 14, fontWeight: 600, borderRadius: "var(--r-sm)", display: "flex", alignItems: "center", gap: 6 }}
              >
                <Plus size={14} /> Create Project
              </button>
            )}
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(275px, 1fr))", gap: 14 }}>
            {filtered.map(p => (
              <ProjectCard
                key={p.id}
                project={p}
                token={token}
                onOpen={() => setSelected(p)}
                onJoin={loadProjects}
              />
            ))}
          </div>
        )}
      </div>

      {/* Detail panel */}
      {selected && (
        <ProjectDetailPanel
          project={selected}
          token={token}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  );
}
