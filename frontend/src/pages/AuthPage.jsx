import { useState } from "react";
import { Code2, Eye, EyeOff, ArrowRight, Loader2, Users, MessageSquare, Sparkles } from "lucide-react";
import { api } from "../api/api";

export default function AuthPage({ onAuth }) {
  const [tab, setTab]       = useState("login");
  const [form, setForm]     = useState({ username: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [err, setErr]       = useState("");
  const [success, setSuccess] = useState("");
  const [showPw, setShowPw] = useState(false);

  const handleField = key => e => setForm(prev => ({ ...prev, [key]: e.target.value }));

  async function submit() {
    setLoading(true); setErr(""); setSuccess("");
    try {
      if (tab === "register") {
        await api("/auth/register", { method: "POST", body: JSON.stringify(form) });
        setSuccess("Account created! Please sign in.");
        setTab("login");
        setForm(prev => ({ ...prev, email: "" }));
      } else {
        const data = await api("/auth/login", {
          method: "POST",
          body: JSON.stringify({ username: form.username, password: form.password }),
        });
        const token = data.token || data.jwt || data.accessToken;
        onAuth(token);
      }
    } catch {
      setErr(
        tab === "login"
          ? "Invalid credentials. Please try again."
          : "Registration failed. Username may already be taken."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", background: "var(--bg)" }}>

      {/* ── Left brand panel ── */}
      <div
        style={{
          width: "42%", background: "#0D1117", flexShrink: 0,
          display: "flex", flexDirection: "column", justifyContent: "center",
          padding: "60px 56px", position: "relative", overflow: "hidden",
        }}
      >
        {/* Glow blobs */}
        <div style={{ position: "absolute", top: -100, right: -60, width: 280, height: 280, borderRadius: "50%", background: "rgba(26,78,216,.18)", filter: "blur(70px)" }} />
        <div style={{ position: "absolute", bottom: -60, left: -40, width: 220, height: 220, borderRadius: "50%", background: "rgba(21,128,61,.12)", filter: "blur(50px)" }} />

        <div style={{ position: "relative", zIndex: 1 }}>
          {/* Logo */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 52 }}>
            <div style={{ width: 36, height: 36, borderRadius: 9, background: "linear-gradient(135deg,#1A4ED8,#6366F1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Code2 size={18} color="#fff" />
            </div>
            <span className="brand" style={{ fontSize: 19, fontWeight: 700, color: "#fff" }}>DevCollab</span>
          </div>

          <h1 style={{ fontFamily: "'Bricolage Grotesque',sans-serif", fontSize: 38, fontWeight: 700, color: "#fff", lineHeight: 1.18, marginBottom: 18 }}>
            Build together,<br />
            <span style={{ color: "#818CF8" }}>ship faster.</span>
          </h1>

          <p style={{ color: "#64748B", fontSize: 15, lineHeight: 1.75, maxWidth: 320 }}>
            DevCollab connects developers to collaborate on real projects, share expertise, and grow together.
          </p>

          {/* Stats */}
          <div style={{ display: "flex", gap: 28, marginTop: 44 }}>
            {[["200+", "Projects"], ["1.2k+", "Developers"], ["3k+", "Collaborations"]].map(([v, k]) => (
              <div key={k}>
                <div style={{ fontFamily: "'Bricolage Grotesque',sans-serif", fontSize: 22, fontWeight: 700, color: "#fff" }}>{v}</div>
                <div style={{ fontSize: 12, color: "#475569", marginTop: 2 }}>{k}</div>
              </div>
            ))}
          </div>

          {/* Features */}
          <div style={{ marginTop: 52, display: "flex", flexDirection: "column", gap: 12 }}>
            {[
              { icon: <Users size={14} />,        text: "Join open source projects" },
              { icon: <MessageSquare size={14} />, text: "Comment & collaborate" },
              { icon: <Sparkles size={14} />,      text: "Showcase your skills" },
            ].map(({ icon, text }, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, color: "#94A3B8", fontSize: 14 }}>
                <span style={{ color: "#6366F1" }}>{icon}</span>{text}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Right form panel ── */}
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: 40 }}>
        <div style={{ width: "100%", maxWidth: 400 }} className="anim-fadeup">

          {/* Tabs */}
          <div style={{ display: "flex", background: "var(--surface-2)", borderRadius: "var(--r)", padding: 4, marginBottom: 32 }}>
            {["login", "register"].map(t => (
              <button
                key={t}
                onClick={() => { setTab(t); setErr(""); setSuccess(""); }}
                style={{
                  flex: 1, padding: "9px 0", fontSize: 14, fontWeight: 500,
                  borderRadius: "var(--r-sm)",
                  background: tab === t ? "var(--surface)" : "transparent",
                  color: tab === t ? "var(--t1)" : "var(--t2)",
                  boxShadow: tab === t ? "var(--sh)" : "none",
                  textTransform: "capitalize",
                }}
              >
                {t}
              </button>
            ))}
          </div>

          <h2 style={{ fontFamily: "'Bricolage Grotesque',sans-serif", fontSize: 24, fontWeight: 700, marginBottom: 6 }}>
            {tab === "login" ? "Welcome back" : "Create account"}
          </h2>
          <p style={{ color: "var(--t2)", fontSize: 14, marginBottom: 26 }}>
            {tab === "login" ? "Sign in to your DevCollab account" : "Join thousands of developers today"}
          </p>

          {/* Fields */}
          <div style={{ display: "flex", flexDirection: "column", gap: 15 }}>
            {tab === "register" && (
              <div>
                <label style={{ fontSize: 13, fontWeight: 500, color: "var(--t2)", display: "block", marginBottom: 6 }}>Email</label>
                <input type="email" placeholder="you@example.com" value={form.email} onChange={handleField("email")} />
              </div>
            )}

            <div>
              <label style={{ fontSize: 13, fontWeight: 500, color: "var(--t2)", display: "block", marginBottom: 6 }}>Username</label>
              <input placeholder="your_username" value={form.username} onChange={handleField("username")} onKeyDown={e => e.key === "Enter" && submit()} />
            </div>

            <div>
              <label style={{ fontSize: 13, fontWeight: 500, color: "var(--t2)", display: "block", marginBottom: 6 }}>Password</label>
              <div style={{ position: "relative" }}>
                <input
                  type={showPw ? "text" : "password"}
                  placeholder="••••••••"
                  value={form.password}
                  onChange={handleField("password")}
                  onKeyDown={e => e.key === "Enter" && submit()}
                  style={{ paddingRight: 42 }}
                />
                <button
                  onClick={() => setShowPw(p => !p)}
                  style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", color: "var(--t3)", display: "flex", padding: 0 }}
                >
                  {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {err && (
              <div style={{ padding: "10px 14px", background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: "var(--r-sm)", fontSize: 13, color: "var(--red)" }}>
                {err}
              </div>
            )}
            {success && (
              <div style={{ padding: "10px 14px", background: "var(--green-bg)", border: "1px solid #BBF7D0", borderRadius: "var(--r-sm)", fontSize: 13, color: "var(--green)" }}>
                {success}
              </div>
            )}

            <button
              onClick={submit}
              disabled={loading}
              style={{
                width: "100%", padding: "11px 0", marginTop: 2,
                background: loading ? "#94A3B8" : "var(--accent)",
                color: "#fff", fontSize: 15, fontWeight: 600,
                borderRadius: "var(--r-sm)",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              }}
            >
              {loading && <Loader2 size={15} className="spin" />}
              {tab === "login" ? "Sign In" : "Create Account"}
              {!loading && <ArrowRight size={15} />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
