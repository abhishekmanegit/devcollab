import { mediaUrl } from "../api/api";

export default function Avatar({ user, name, src, size = 28, style }) {
  const photo = mediaUrl(src || user?.profilePictureUrl);
  const label = name || user?.name || user?.username || "U";
  const initial = label[0]?.toUpperCase() || "U";

  if (photo) {
    return (
      <img
        src={photo}
        alt={label}
        style={{
          width: size,
          height: size,
          borderRadius: "50%",
          objectFit: "cover",
          flexShrink: 0,
          display: "block",
          ...style,
        }}
      />
    );
  }

  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: "var(--accent)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: Math.max(10, Math.round(size * 0.34)),
        fontWeight: 700,
        color: "#fff",
        flexShrink: 0,
        ...style,
      }}
    >
      {initial}
    </div>
  );
}
