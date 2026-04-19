import { stats } from "../data/constants";

export function StatsRow() {
  return (
    <div className="stats-row">
      {stats.map((s) => (
        <div className="stat" key={s.label}>
          <div className="sv">{s.value}</div>
          <div className="sl">{s.label}</div>
        </div>
      ))}
    </div>
  );
}