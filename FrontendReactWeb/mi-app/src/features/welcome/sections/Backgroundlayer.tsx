export function BackgroundLayer() {
  return (
    <div className="bg-layer">
      {/* Grid lines */}
      <div className="bg-grid" />
      <div className="bg-grid-accent" />

      {/* Ambient orbs */}
      <div className="bg-orb-a" />
      <div className="bg-orb-b" />
      <div className="bg-orb-c" />

      {/* Corner accent marks */}
      <div className="corner-mark cm-tl" />
      <div className="corner-mark cm-tr" />
      <div className="corner-mark cm-bl" />
      <div className="corner-mark cm-br" />

      {/* Floating mini dashboard cards */}
      <div className="deco-cards">
        <div className="deco-card deco-card-1">
          <div className="dc-label">Ventas del mes</div>
          <div className="dc-value">RD$128K</div>
          <div className="dc-sub">↑ 12% vs anterior</div>
          <div className="dc-bar">
            <div className="dc-fill" style={{ width: "72%" }} />
          </div>
        </div>

        <div className="deco-card deco-card-2">
          <div className="dc-label">Facturas emitidas</div>
          <div className="dc-value">247</div>
          <div className="dc-sub">Este mes</div>
          <div className="dc-dots">
            <div className="dc-dot"    style={{ height: "40%" }} />
            <div className="dc-dot md" style={{ height: "55%" }} />
            <div className="dc-dot"    style={{ height: "35%" }} />
            <div className="dc-dot hi" style={{ height: "75%" }} />
            <div className="dc-dot md" style={{ height: "60%" }} />
            <div className="dc-dot hi" style={{ height: "90%" }} />
            <div className="dc-dot hi" style={{ height: "80%" }} />
          </div>
        </div>

        <div className="deco-card deco-card-3">
          <div className="dc-label">ITBIS cobrado</div>
          <div className="dc-value">RD$23K</div>
          <div className="dc-sub">Pendiente DGII</div>
          <div className="dc-bar">
            <div className="dc-fill" style={{ width: "45%", background: "#10B981" }} />
          </div>
        </div>

        <div className="deco-card deco-card-4">
          <div className="dc-label">Empleados</div>
          <div className="dc-value">18</div>
          <div className="dc-sub">Nómina al día</div>
          <div className="dc-bar">
            <div className="dc-fill" style={{ width: "100%", background: "#10B981" }} />
          </div>
        </div>
      </div>

      <div className="bg-tagline">
        BillNova · Sistema de Gestión Empresarial · RD
      </div>
    </div>
  );
}