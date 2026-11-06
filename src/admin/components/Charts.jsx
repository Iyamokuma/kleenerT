import { formatNumber } from '../lib/format';

function niceMax(value) {
  if (value <= 4) return 4;
  const magnitude = 10 ** Math.floor(Math.log10(value));
  const step = [1, 2, 2.5, 5, 10].find((s) => s * magnitude * 4 >= value) * magnitude;
  return step * 4;
}

/**
 * Single-series column chart. Each column's full-height slot is the hover target;
 * the tooltip, the axis and a screen-reader table all use the same data.
 */
export function ColumnChart({ data, label, height = 200, formatLabel, tickEvery = 7 }) {
  const max = niceMax(Math.max(...data.map((d) => d.value), 0));
  const ticks = [max, max / 2, 0];
  const total = data.reduce((sum, d) => sum + d.value, 0);

  return (
    <figure className="chart" aria-label={`${label}. ${formatNumber(total)} in total.`}>
      <div className="chart-plot" style={{ height }}>
        <div className="chart-grid" aria-hidden="true">
          {ticks.map((t) => <span key={t} data-tick={formatNumber(t)} />)}
        </div>
        <div className="chart-cols" aria-hidden="true">
          {data.map((d, i) => (
            <div className="chart-col" key={d.key}>
              <span className="chart-bar" style={{ height: `${(d.value / max) * 100}%` }} data-empty={d.value === 0 || undefined} />
              <span className="chart-tip"><strong>{formatNumber(d.value)}</strong> {d.tip}</span>
              {((i % tickEvery === 0 && data.length - 1 - i >= tickEvery / 2) || i === data.length - 1) && <span className="chart-x">{formatLabel(d)}</span>}
            </div>
          ))}
        </div>
      </div>
      <table className="sr-only">
        <caption>{label}</caption>
        <thead><tr><th>Day</th><th>Count</th></tr></thead>
        <tbody>{data.map((d) => <tr key={d.key}><td>{d.tip}</td><td>{d.value}</td></tr>)}</tbody>
      </table>
    </figure>
  );
}

/** Ranked horizontal bars with the value written at the end of each row. */
export function BarList({ data, emptyLabel = 'No data yet' }) {
  if (!data.length) return <p className="muted">{emptyLabel}</p>;
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <ul className="barlist">
      {data.map((d) => (
        <li key={d.label} title={`${d.label}: ${formatNumber(d.value)}`}>
          <span className="barlist-label">{d.label}</span>
          <span className="barlist-track"><span className="barlist-fill" style={{ width: `${(d.value / max) * 100}%` }} /></span>
          <span className="barlist-value">{formatNumber(d.value)}</span>
        </li>
      ))}
    </ul>
  );
}
