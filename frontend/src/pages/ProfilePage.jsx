import { useEffect, useRef, useState } from "react";
import { Camera, Loader2 } from "lucide-react";
import { api, githubHandle, mediaUrl, uploadFile } from "../api/api";
import Avatar from "../components/Avatar";
import GithubIcon from "../components/GithubIcon";

function skillsToString(skills) {
  if (Array.isArray(skills)) return skills.join(", ");
  return skills || "";
}

function formFromUser(user) {
  return {
    bio: user?.bio || "",
    skills: skillsToString(user?.skills),
    githubUrl: user?.githubUrl || "",
  };
}

export default function ProfilePage({ token, user, setUser }) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState(() => formFromUser(user));
  const [syncedUser, setSyncedUser] = useState(user);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const fileInputRef = useRef(null);

  const displayName = user?.name || user?.username || "Developer";
  const skillsArray = Array.isArray(user?.skills)
    ? user.skills
    : typeof user?.skills === "string"
      ? user.skills.split(",").map(s => s.trim()).filter(Boolean)
      : [];
  const handle = githubHandle(user?.githubUrl);

  // Keep the form in step with the saved profile without an extra render pass.
  if (user !== syncedUser) {
    setSyncedUser(user);
    setForm(formFromUser(user));
  }

  useEffect(() => {
    return () => {
      if (avatarPreview) URL.revokeObjectURL(avatarPreview);
    };
  }, [avatarPreview]);

  function startEdit() {
    setForm(formFromUser(user));
    setAvatarFile(null);
    setAvatarPreview(null);
    setMsg("");
    setEditing(true);
  }

  function cancelEdit() {
    setEditing(false);
    setMsg("");
    setAvatarFile(null);
    setAvatarPreview(null);
  }

  function onPickPhoto(e) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setMsg("Please choose an image file.");
      return;
    }
    if (file.size > 3 * 1024 * 1024) {
      setMsg("Image must be 3MB or smaller.");
      return;
    }
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
    setMsg("");
  }

  async function save() {
    setSaving(true); setMsg("");
    try {
      let latest = user;
      if (avatarFile) {
        latest = await uploadFile("/users/me/avatar", avatarFile, token);
      }
      latest = await api("/users/update", {
        method: "PUT",
        body: JSON.stringify({
          bio: form.bio,
          skills: form.skills.split(",").map(s => s.trim()).filter(Boolean),
          githubUrl: form.githubUrl,
        }),
      }, token);
      setUser(latest);
      setEditing(false);
      setAvatarFile(null);
      setAvatarPreview(null);
      setMsg("Profile updated successfully!");
    } catch (err) {
      setMsg(err?.message || "Failed to save. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  const photoSrc = avatarPreview || mediaUrl(user?.profilePictureUrl);

  return (
    <div style={{ flex: 1, overflow: "auto" }}>

      <div style={{
        padding: "16px 28px", borderBottom: "1px solid var(--border)",
        background: "var(--surface)", position: "sticky", top: 0, zIndex: 10,
      }}>
        <h1 style={{ fontFamily: "'Bricolage Grotesque',sans-serif", fontSize: 19, fontWeight: 700 }}>My Profile</h1>
        <p style={{ fontSize: 13, color: "var(--t2)", marginTop: 2 }}>Manage your developer identity</p>
      </div>

      <div style={{ padding: "28px", maxWidth: 620 }}>

        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--r-lg)", overflow: "hidden", marginBottom: 20 }}>
          <div style={{ height: 80, background: "linear-gradient(135deg, #EEF2FF 0%, #E0E7FF 100%)" }} />

          <div style={{ padding: "0 24px 24px" }}>
            <div style={{ marginTop: -32, marginBottom: 16, display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
              <div style={{ position: "relative" }}>
                <Avatar
                  user={user}
                  name={displayName}
                  src={photoSrc}
                  size={64}
                  style={{ border: "3px solid var(--surface)" }}
                />
                {editing && (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    title="Upload profile picture"
                    style={{
                      position: "absolute", right: -2, bottom: -2,
                      width: 26, height: 26, borderRadius: "50%",
                      background: "var(--accent)", color: "#fff",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      border: "2px solid var(--surface)",
                    }}
                  >
                    <Camera size={12} />
                  </button>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  onChange={onPickPhoto}
                  style={{ display: "none" }}
                />
              </div>
              {!editing && (
                <button
                  onClick={startEdit}
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
              {displayName}
            </h2>
            <p style={{ fontSize: 13, color: "var(--t2)", marginTop: 2 }}>{user?.email || "Developer"}</p>
            {handle && (
              <a
                href={user.githubUrl}
                target="_blank"
                rel="noreferrer"
                style={{
                  display: "inline-flex", alignItems: "center", gap: 6,
                  marginTop: 8, fontSize: 13, fontWeight: 500, color: "var(--accent)",
                  textDecoration: "none",
                }}
              >
                <GithubIcon size={14} />
                @{handle}
              </a>
            )}
          </div>
        </div>

        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--r-lg)", padding: 24 }}>

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
              <div style={{ marginBottom: 22 }}>
                <p style={{ fontSize: 11, fontWeight: 600, color: "var(--t3)", textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 8 }}>About</p>
                <p style={{ fontSize: 14, color: user?.bio ? "var(--t1)" : "var(--t3)", lineHeight: 1.75 }}>
                  {user?.bio || "No bio yet. Click Edit Profile to add one."}
                </p>
              </div>

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
                <label style={{ fontSize: 13, fontWeight: 500, color: "var(--t2)", display: "block", marginBottom: 6 }}>Profile picture</label>
                <p style={{ fontSize: 12, color: "var(--t3)", marginBottom: 8 }}>
                  Click the camera icon on your avatar to upload a JPEG, PNG, WebP, or GIF (max 3MB).
                </p>
              </div>
              <div>
                <label style={{ fontSize: 13, fontWeight: 500, color: "var(--t2)", display: "block", marginBottom: 6 }}>GitHub profile</label>
                <input
                  value={form.githubUrl}
                  onChange={e => setForm(p => ({ ...p, githubUrl: e.target.value }))}
                  placeholder="https://github.com/username or username"
                />
              </div>
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
                  onClick={cancelEdit}
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
