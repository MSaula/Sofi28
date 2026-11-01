import { useState } from "react";

export default function Picture({
  src,
  remote,
  alt,
  className = "",
  conceptual = true,
  eager = false,
  ...props
}) {
  const [failed, setFailed] = useState(false);
  const fallback =
    import.meta.env.VITE_STANDALONE === "true" || !remote || failed;
  return (
    <div className={`picture ${className}`} {...props}>
      <img
        src={fallback ? src : remote}
        alt={fallback && conceptual ? `Ilustración conceptual: ${alt}` : alt}
        loading={eager ? "eager" : "lazy"}
        decoding="async"
        onError={() => setFailed(true)}
      />
      {fallback && conceptual && (
        <span className="image-note">Ilustración</span>
      )}
    </div>
  );
}
