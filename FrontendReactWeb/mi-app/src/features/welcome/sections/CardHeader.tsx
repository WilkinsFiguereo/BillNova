export function CardHeader() {
  return (
    <div className="top-bar">
      <div className="brand">
        <div className="logo-box">
          <div className="logo-sq">
            <div className="logo-dot" />
          </div>
        </div>
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