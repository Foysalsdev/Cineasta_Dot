import { useState } from 'react';

// Renders the Cineasta Dot logo from /cineasta-logo.png.
// Until that file is added to /public, it falls back to a green monogram chip
// so nothing ever looks broken.
export function Logo({ size = 28, onLight = false }: { size?: number; onLight?: boolean }) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div
        className="flex items-center justify-center shrink-0"
        style={{ width: size, height: size, borderRadius: size * 0.22, background: 'var(--brand)' }}
      >
        <span style={{ color: '#fff', fontWeight: 700, fontSize: size * 0.5, lineHeight: 1 }}>C</span>
      </div>
    );
  }

  return (
    <img
      src="/cineasta-logo.png"
      alt="Cineasta Dot"
      onError={() => setFailed(true)}
      style={{
        width: size,
        height: size,
        objectFit: 'contain',
        borderRadius: size * 0.22,
        // white plate so the logo reads on dark backgrounds; transparent on light surfaces
        background: onLight ? 'transparent' : '#fff',
      }}
    />
  );
}
