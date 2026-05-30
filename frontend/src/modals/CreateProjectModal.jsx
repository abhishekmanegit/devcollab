import { useState } from "react";
import { X, Loader2 } from "lucide-react";
import { api } from "../api/api";

export default function CreateProjectModal({ token, onClose, onCreated }) {
  const [form, setForm]     = useState({ title: "", description: "", skills: "" });
  const [loading, setLoading] = useState(false);
  const [err, setErr]       = useState("");

  const handleField = key => e => setForm(prev => ({ ...prev, [key]: e.target.value }));

  async function create() {
    if (!form.title.trim()) return;
    setLoading(true); setErr("");
    try {
      await api("/projects", {
        method: "POST",
        body: JSON.stringify({
          title:       form.title.trim(),
          description: form.description.trim(),
          skills:      form.skills.split(",").map(s => s.trim()).filter(Boolean),
        }),
      }, token);
      onCreated();
      onClose();
    } catch {
      setErr("Failed to create project. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 1000,
        background: "rgba(0,0,0,.35)", backdropFilter: "blur(3px)",
        display: "flex", alignItems: "center", justifyContent: "center", padding: 24,
      }}
      onClick={onClose}
    >
      <div
        onClick={e => e.stopPropagation()}
        className="anim-scalein"
        style={{
          background: "var(--surface)", borderRadius: "var(--r-lg)",
          width: "100%", maxWidth: 480, padding: 28,
          boxShadow: "var(--sh-lg)",
        }}
      >
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 22 }}>
          <div>
            <h2 style={{ fontFamily: "'Bricolage Grotesque',sans-serif", fontSize: 19, fontWeight: 700 }}>
              New Project
            </h2>
            <p style={{ fontSize: 13, color: "var(--t2)", marginTop: 3 }}>Share what you're building</p>
          </div>
          <button onClick={onClose} style={{ background: "none", color: "var(--t2)", display: "flex", padding: 4, borderRadius: 6 }}>
            <X size={17} />
          </button>
        </div>

        {/* Form */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <label style={{ fontSize: 13, fontWeight: 500, color: "var(--t2)", display: "block", marginBottom: 6 }}>
              Project Title <span style={{ color: "var(--red)" }}>*</span>
            </label>
            <input placeholder="e.g. Open-source Kanban Board" value={form.title} onChange={handleField("title")} />
          </div>

          <div>
            <label style={{ fontSize: 13, fontWeight: 500, color: "var(--t2)", display: "block", marginBottom: 6 }}>Description</label>
            <textarea
              rows={3}
              placeholder="What are you building? What problem does it solve?"
              value={form.description}
              onChange={handleField("description")}
              style={{ resize: "vertical" }}
            />
          </div>

          <div>
            <label style={{ fontSize: 13, fontWeight: 500, color: "var(--t2)", display: "block", marginBottom: 6 }}>Skills Needed</label>
            <input placeholder="React, Java, PostgreSQL (comma-separated)" value={form.skills} onChange={handleField("skills")} />
            <p style={{ fontSize: 12, color: "var(--t3)", marginTop: 5 }}>Separate multiple skills with commas</p>
          </div>

          {err && (
            <div style={{ padding: "9px 12px", background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: "var(--r-sm)", fontSize: 13, color: "var(--red)" }}>
              {err}
            </div>
          )}

          <div style={{ display: "flex", gap: 10, paddingTop: 4 }}>
            <button
              onClick={onClose}
              style={{
                flex: 1, padding: "10px 0", fontSize: 14, fontWeight: 500,
                background: "var(--surface-2)", color: "var(--t2)",
                borderRadius: "var(--r-sm)", border: "1px solid var(--border)",
              }}
            >
              Cancel
            </button>
            <button
              onClick={create}
              disabled={loading || !form.title.trim()}
              style={{
                flex: 2, padding: "10px 0", fontSize: 14, fontWeight: 600,
                background: loading || !form.title.trim() ? "#94A3B8" : "var(--accent)",
                color: "#fff", borderRadius: "var(--r-sm)",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
              }}
            >
              {loading && <Loader2 size={14} className="spin" />}
              Create Project
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
