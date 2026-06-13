import { useState } from "react";
import { Loader2 } from "lucide-react";
import { api } from "../api/api";

export default function ProfilePage({ token, user, setUser }) {
  const [editing, setEditing] = useState(false);
  const [form, setForm]       = useState({ bio: user?.bio || "", skills: Array.isArray(user?.skills)
  ? user.skills.join(", ")
  : user?.skills || "" });
  const [saving, setSaving]   = useState(false);
  const [msg, setMsg]         = useState("");
  const skillsArray = Array.isArray(user?.skills)
  ? user.skills
  : typeof user?.skills === "string"
    ? user.skills.split(",").map(s => s.trim()).filter(Boolean)
    : [];

  async function save() {
    setSaving(true); setMsg("");
    try {
      const updated = await api("/users/update", {
        method: "PUT",
        body: JSON.stringify({
          bio:    form.bio,
          skills: form.skills.split(",").map(s => s.trim()).filter(Boolean),
        }),
      }, token);
      setUser(updated);
      setEditing(false);
      setMsg("Profile updated successfully!");
    } catch {
      setMsg("Failed to save. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div style={{ flex: 1, overflow: "auto" }}>

      {/* ── Topbar ── */}
      <div style={{
        padding: "16px 28px", borderBottom: "1px solid var(--border)",
        background: "var(--surface)", position: "sticky", top: 0, zIndex: 10,
      }}>
        <h1 style={{ fontFamily: "'Bricolage Grotesque',sans-serif", fontSize: 19, fontWeight: 700 }}>My Profile</h1>
        <p style={{ fontSize: 13, color: "var(--t2)", marginTop: 2 }}>Manage your developer identity</p>
      </div>

      <div style={{ padding: "28px", maxWidth: 620 }}>

        {/* ── Profile card ── */}
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--r-lg)", overflow: "hidden", marginBottom: 20 }}>
          {/* Cover */}
          <div style={{ height: 80, background: "linear-gradient(135deg, #EEF2FF 0%, #E0E7FF 100%)" }} />

          {/* Avatar + actions */}
          <div style={{ padding: "0 24px 24px" }}>
            <div style={{ marginTop: -32, marginBottom: 16, display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
              <div style={{
                width: 64, height: 64, borderRadius: "50%",
                background: "var(--accent)", border: "3px solid var(--surface)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 22, fontWeight: 700, color: "#fff",
              }}>
                {user?.username?.[0]?.toUpperCase() || "U"}
              </div>
              {!editing && (
                <button
                  onClick={() => setEditing(true)}
                  style={{
                    padding: "6px 14px", fontSize: 13, fontWeight: 600,
                    background: "var(--surface-2)", color: "var(--t1)",
                    borderRadius: "var(--r-sm)", border: "1px solid var(--border)",
                  }}
                >
                  Edit Profile
                </button>
              )}
            </div>

            <h2 style={{ fontFamily: "'Bricolage Grotesque',sans-serif", fontSize: 20, fontWeight: 700, color: "var(--t1)" }}>
              {user?.username}
            </h2>
            <p style={{ fontSize: 13, color: "var(--t2)", marginTop: 2 }}>{user?.email || "Developer"}</p>
          </div>
        </div>

        {/* ── Bio + Skills card ── */}
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--r-lg)", padding: 24 }}>

          {/* Success / error message */}
          {msg && (
            <div style={{
              padding: "9px 12px", marginBottom: 18, borderRadius: "var(--r-sm)", fontSize: 13,
              background: msg.includes("success") ? "var(--green-bg)" : "#FEF2F2",
              border: `1px solid ${msg.includes("success") ? "#BBF7D0" : "#FECACA"}`,
              color: msg.includes("success") ? "var(--green)" : "var(--red)",
            }}>
              {msg}
            </div>
          )}

          {!editing ? (
            <>
              {/* Bio */}
              <div style={{ marginBottom: 22 }}>
                <p style={{ fontSize: 11, fontWeight: 600, color: "var(--t3)", textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 8 }}>About</p>
                <p style={{ fontSize: 14, color: user?.bio ? "var(--t1)" : "var(--t3)", lineHeight: 1.75 }}>
                  {user?.bio || "No bio yet. Click Edit Profile to add one."}
                </p>
              </div>

              {/* Skills */}
              <div>
                <p style={{ fontSize: 11, fontWeight: 600, color: "var(--t3)", textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 10 }}>Skills</p>
                {skillsArray.length > 0 ? (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {skillsArray.map((s, i) => (
                      <span key={i} style={{ padding: "5px 13px", fontSize: 13, fontWeight: 500, background: "var(--accent-bg)", color: "var(--accent)", borderRadius: 20 }}>
                        {s}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p style={{ fontSize: 13, color: "var(--t3)" }}>No skills added yet.</p>
                )}
              </div>
            </>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              <div>
                <label style={{ fontSize: 13, fontWeight: 500, color: "var(--t2)", display: "block", marginBottom: 6 }}>Bio</label>
                <textarea
                  rows={4}
                  value={form.bio}
                  onChange={e => setForm(p => ({ ...p, bio: e.target.value }))}
                  placeholder="Tell other devs about yourself…"
                  style={{ resize: "vertical" }}
                />
              </div>
              <div>
                <label style={{ fontSize: 13, fontWeight: 500, color: "var(--t2)", display: "block", marginBottom: 6 }}>Skills</label>
                <input
                  value={form.skills}
                  onChange={e => setForm(p => ({ ...p, skills: e.target.value }))}
                  placeholder="React, Java, Spring Boot… (comma-separated)"
                />
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <button
                  onClick={() => { setEditing(false); setMsg(""); }}
                  style={{ flex: 1, padding: "9px 0", fontSize: 14, fontWeight: 500, background: "var(--surface-2)", color: "var(--t2)", borderRadius: "var(--r-sm)", border: "1px solid var(--border)" }}
                >
                  Cancel
                </button>
                <button
                  onClick={save}
                  disabled={saving}
                  style={{
                    flex: 2, padding: "9px 0", fontSize: 14, fontWeight: 600,
                    background: saving ? "#94A3B8" : "var(--accent)", color: "#fff",
                    borderRadius: "var(--r-sm)",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
                  }}
                >
                  {saving && <Loader2 size={13} className="spin" />}
                  Save Changes
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
