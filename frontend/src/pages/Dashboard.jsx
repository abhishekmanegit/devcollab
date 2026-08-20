import { useState, useEffect } from "react";
import { Plus, Search, FolderOpen, Loader2 } from "lucide-react";
import { api } from "../api/api";
import ProjectCard from "../components/ProjectCard";
import ProjectDetailPanel from "../modals/ProjectDetailPanel";

export default function Dashboard({ token, user, onShowCreate, refreshKey, onToast }) {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [selected, setSelected] = useState(null);
  const [search, setSearch]     = useState("");
  const [filter, setFilter]     = useState("all");

  const loadProjects = () => {
    setLoading(true);
    const path = filter === "mine" ? "/projects/my-projects" : "/projects";
    api(path, {}, token)
      .then(data => setProjects(Array.isArray(data) ? data : data?.content || []))
      .catch(() => setProjects([]))
      .finally(() => setLoading(false));
  };

  useEffect(loadProjects, [filter, token, refreshKey]);

  const filtered = projects.filter(p =>
    (p.title || p.name || "").toLowerCase().includes(search.toLowerCase()) ||
    (p.description || "").toLowerCase().includes(search.toLowerCase())
  );

  const myCount = projects.filter(p => p.joined).length;
  const openCount = filter === "all"
    ? projects.filter(p => !p.joined && !p.owner).length
    : 0;

  function handleJoinResult(toast) {
    onToast?.(toast.msg, toast.type);
    loadProjects();
    if (selected) {
      api(filter === "mine" ? "/projects/my-projects" : "/projects", {}, token)
        .then(data => {
          const list = Array.isArray(data) ? data : [];
          const updated = list.find(p => p.id === selected.id);
          if (updated) setSelected(updated);
        })
        .catch(() => {});
    }
  }

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

        {/* Filter tabs */}
        <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
          {[
            { id: "all", label: "All Projects" },
            { id: "mine", label: "My Projects" },
          ].map(({ id, label }) => (
            <button
              key={id}
              onClick={() => setFilter(id)}
              style={{
                padding: "7px 14px", fontSize: 13, fontWeight: 500,
                borderRadius: "var(--r-sm)",
                background: filter === id ? "var(--accent)" : "var(--surface)",
                color: filter === id ? "#fff" : "var(--t2)",
                border: filter === id ? "none" : "1px solid var(--border)",
              }}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14, marginBottom: 28 }}>
          {[
            { label: filter === "mine" ? "My Projects" : "Total Projects", value: projects.length, color: "var(--accent)", bg: "var(--accent-bg)" },
            { label: "Open to Join", value: filter === "all" ? openCount : "—", color: "var(--green)", bg: "var(--green-bg)" },
            { label: "Joined", value: filter === "all" ? myCount : projects.length, color: "#C2410C", bg: "#FFF7ED" },
          ].map(({ label, value, color }) => (
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
              {search ? "No results found" : filter === "mine" ? "No joined projects yet" : "No projects yet"}
            </h3>
            <p style={{ color: "var(--t2)", fontSize: 14 }}>
              {search ? "Try different keywords" : filter === "mine" ? "Browse all projects and join one!" : "Be the first to create one!"}
            </p>
            {!search && filter === "mine" && (
              <button
                onClick={() => setFilter("all")}
                style={{ marginTop: 6, padding: "8px 18px", background: "var(--accent)", color: "#fff", fontSize: 14, fontWeight: 600, borderRadius: "var(--r-sm)" }}
              >
                Browse Projects
              </button>
            )}
            {!search && filter === "all" && (
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
                onJoin={handleJoinResult}
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
          onJoin={handleJoinResult}
          onRefresh={loadProjects}
        />
      )}
    </div>
  );
}
