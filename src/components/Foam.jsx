// Soap-foam edge: overlapping circles over a base strip, all one fill so they read as a single shape.
const suds = [
  [0, 150, 70], [90, 140, 45], [170, 132, 40], [250, 150, 68], [338, 122, 38], [402, 140, 50],
  [482, 126, 42], [562, 146, 60], [652, 112, 62], [742, 140, 48], [812, 122, 40], [884, 150, 70],
  [964, 130, 44], [1034, 142, 50], [1104, 116, 55], [1184, 146, 60], [1262, 126, 46], [1334, 142, 52],
  [1412, 130, 58],
];
const looseBubbles = [[118, 62, 13], [1338, 48, 17], [1386, 64, 7], [610, 30, 6]];

export default function Foam({ className = '' }) {
  return (
    <svg
      className={`foam ${className}`.trim()}
      viewBox="0 0 1440 140"
      preserveAspectRatio="xMidYMax slice"
      aria-hidden="true"
      focusable="false"
    >
      <rect x="0" y="122" width="1440" height="18" />
      {suds.map(([cx, cy, r]) => <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r={r} />)}
      {looseBubbles.map(([cx, cy, r]) => <circle key={`b-${cx}`} cx={cx} cy={cy} r={r} />)}
    </svg>
  );
}

/** Drifting bubbles layered over a photo section. Positions are percentages of the parent. */
export function Bubbles({ items }) {
  return (
    <div className="bubbles" aria-hidden="true">
      {items.map(([left, top, size, delay], i) => (
        <span
          key={i}
          style={{ left: `${left}%`, top: `${top}%`, width: size, height: size, animationDelay: `${delay}s` }}
        />
      ))}
    </div>
  );
}
