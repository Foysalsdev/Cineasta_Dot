// Cineasta emblem — recreated as inline SVG (two stacked arches forming the mark).
// Vector, so it stays crisp at any size and needs no image file.
export function Logo({ size = 28, color = '#1A6B3C' }: { size?: number; color?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      role="img"
      aria-label="Cineasta"
      style={{ display: 'block', flexShrink: 0 }}
    >
      <g fill={color}>
        <path fillRule="evenodd" d="M8 80 A42 42 0 0 0 92 80 Z M32 80 A18 18 0 0 0 68 80 Z" />
        <path fillRule="evenodd" d="M23 35 A27 27 0 0 0 77 35 Z M38 35 A12 12 0 0 0 62 35 Z" />
      </g>
    </svg>
  );
}
