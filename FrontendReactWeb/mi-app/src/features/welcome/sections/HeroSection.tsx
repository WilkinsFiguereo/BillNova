import { featurePills } from "../data/constants";

export function HeroSection() {
  return (
    <div className="hero-section">
      <h1 className="hero-title">
        Gestión empresarial<br />
        para <em>facturar y crecer</em>
      </h1>

      <p className="hero-desc">
        Facturación electrónica, reportes, impuestos, inventario y nómina.
        Todo lo que tu empresa necesita en un solo lugar.
      </p>

      <div className="feature-pills">
        {featurePills.map(({ label }) => (
          <div key={label} className="fpill">
            <div className="fpill-dot" />
            {label}
          </div>
        ))}
      </div>

      <div className="divider">
        <div className="dline" />
        <span className="dtxt">¿Qué deseas hacer?</span>
        <div className="dline" />
      </div>
    </div>
  );
}