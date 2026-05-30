import { LayoutDashboard, User, LogOut, Code2 } from "lucide-react";

export default function Sidebar({ page, setPage, user, onLogout }) {
  const navItems = [
    { id: "dashboard", label: "Projects",   icon: LayoutDashboard },
    { id: "profile",   label: "My Profile", icon: User },
  ];

  return (
    <div
      style={{
        width: 236,
        height: "100vh",
        background: "var(--surface)",
        borderRight: "1px solid var(--border)",
        display: "flex",
        flexDirection: "column",
        position: "sticky",
        top: 0,
        flexShrink: 0,
      }}
    >
      {/* ── Logo ── */}
      <div style={{ padding: "18px 18px 14px", borderBottom: "1px solid var(--border)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
          <div
            style={{
              width: 30, height: 30, borderRadius: 8,
              background: "linear-gradient(135deg, #1A4ED8, #6366F1)",
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <Code2 size={15} color="#fff" />
          </div>
          <span className="brand" style={{ fontSize: 16, fontWeight: 700, color: "var(--t1)" }}>
            DevCollab
          </span>
        </div>
      </div>

      {/* ── Nav Items ── */}
      <nav style={{ flex: 1, padding: "10px 8px" }}>
        <p
          style={{
            fontSize: 11, fontWeight: 600, color: "var(--t3)",
            textTransform: "uppercase", letterSpacing: ".06em",
            padding: "4px 10px 8px",
          }}
        >
          Navigation
        </p>

        {navItems.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setPage(id)}
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              gap: 9,
              padding: "8px 10px",
              borderRadius: "var(--r-sm)",
              marginBottom: 2,
              background: page === id ? "var(--accent-bg)" : "transparent",
              color: page === id ? "var(--accent)" : "var(--t2)",
              fontWeight: page === id ? 600 : 400,
              fontSize: 14,
              textAlign: "left",
            }}
          >
            <Icon size={15} />
            {label}
          </button>
        ))}
      </nav>

      {/* ── User + Logout ── */}
      <div style={{ padding: "10px 8px", borderTop: "1px solid var(--border)" }}>
        {user && (
          <div
            style={{
              display: "flex", alignItems: "center", gap: 9,
              padding: "8px 10px", marginBottom: 2,
            }}
          >
            <div
              style={{
                width: 28, height: 28, borderRadius: "50%",
                background: "var(--accent-bg)",
                border: "1.5px solid #C7D7F8",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 12, fontWeight: 700, color: "var(--accent)", flexShrink: 0,
              }}
            >
              {user.username?.[0]?.toUpperCase() || "U"}
            </div>
            <div style={{ minWidth: 0 }}>
              <div
                style={{
                  fontSize: 13, fontWeight: 600, color: "var(--t1)",
                  overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                }}
              >
                {user.username}
              </div>
              <div style={{ fontSize: 11, color: "var(--t3)" }}>Developer</div>
            </div>
          </div>
        )}

        <button
          onClick={onLogout}
          style={{
            width: "100%", display: "flex", alignItems: "center", gap: 9,
            padding: "8px 10px", borderRadius: "var(--r-sm)",
            background: "transparent", color: "var(--t2)", fontSize: 14,
          }}
          onMouseEnter={e => { e.currentTarget.style.background = "#FEF2F2"; e.currentTarget.style.color = "#DC2626"; }}
          onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--t2)"; }}
        >
          <LogOut size={14} />
          Sign Out
        </button>
      </div>
    </div>
  );
}
