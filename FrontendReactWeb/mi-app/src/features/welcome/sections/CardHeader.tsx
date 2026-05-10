import { BrandLogo } from "@/components/BrandLogo";

export function CardHeader() {
  return (
    <div className="top-bar">
      <div className="brand">
        <BrandLogo size={38} priority className="welcome-brand-logo" />
        <span className="brand-name">
          Bill<span>Nova</span>
        </span>
      </div>

      <div className="live-badge">
        <div className="live-dot" />
        <span className="live-txt">En línea</span>
      </div>
    </div>
  );
}
