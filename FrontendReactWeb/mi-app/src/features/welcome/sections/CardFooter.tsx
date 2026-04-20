import { trustBadges } from "../data/constants";

export function CardFooter() {
  return (
    <div className="card-foot">
      {trustBadges.map(({ icon, label }) => (
        <div key={label} className="trust-item">
          <div className="trust-icon">{icon}</div>
          <span className="trust-lbl">{label}</span>
        </div>
      ))}
    </div>
  );
}