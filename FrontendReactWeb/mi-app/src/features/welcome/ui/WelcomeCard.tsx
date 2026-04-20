import { ReactNode } from "react";
import "../ui/welcome.css";

interface WelcomeCardProps {
  children: ReactNode;
  footer: ReactNode;
}

export function WelcomeCard({ children, footer }: WelcomeCardProps) {
  return (
    <div className="main-card">
      <div className="card-pattern" />
      <div className="orb-tl" />
      <div className="orb-bl" />
      <div className="card-inner">
        {children}
      </div>
      {footer}
    </div>
  );
}