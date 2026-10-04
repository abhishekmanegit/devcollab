import { useEffect, useRef } from "react";

const COLORS = {
  success: "#15803D",
  error:   "#DC2626",
  info:    "#1A4ED8",
};

const ICONS = { success: "✓", error: "✕", info: "i" };

export default function Toast({ msg, type = "success", onClose }) {
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    const timer = setTimeout(() => onCloseRef.current(), 3200);
    return () => clearTimeout(timer);
  }, []);

  const color = COLORS[type] || COLORS.info;

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
      <span style={{ color, fontWeight: 700, fontSize: 16 }}>{ICONS[type] || ICONS.info}</span>
      <span style={{ color: "var(--t1)", fontWeight: 500 }}>{msg}</span>
    </div>
  );
}