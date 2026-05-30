import { useEffect } from "react";

export default function Toast({ msg, type = "success", onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3200);
    return () => clearTimeout(timer);
  }, [onClose]);

  const colors = {
    success: "#15803D",
    error:   "#DC2626",
    info:    "#1A4ED8",
  };

  const icons = { success: "✓", error: "✕", info: "i" };
  const color = colors[type];

  return (
    <div
      className="anim-slidein"
      style={{
        position: "fixed",
        bottom: 24,
        right: 24,
        zIndex: 9999,
        background: "#fff",
        border: `1px solid ${color}25`,
        borderLeft: `3px solid ${color}`,
        padding: "12px 16px",
        borderRadius: "var(--r-sm)",
        boxShadow: "var(--sh-md)",
        display: "flex",
        gap: 10,
        alignItems: "center",
        fontSize: 14,
        maxWidth: 320,
      }}
    >
      <span style={{ color, fontWeight: 700, fontSize: 16 }}>{icons[type]}</span>
      <span style={{ color: "var(--t1)", fontWeight: 500 }}>{msg}</span>
    </div>
  );
}
