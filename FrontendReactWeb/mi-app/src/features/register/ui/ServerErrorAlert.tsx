interface ServerErrorAlertProps {
  message: string;
}

export function ServerErrorAlert({ message }: ServerErrorAlertProps) {
  return (
    <div role="alert" className="alert show">
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
        <circle cx="8" cy="8" r="7" stroke="#EF4444" strokeWidth="1.3" />
        <path d="M8 5v4M8 10.5v.5" stroke="#EF4444" strokeWidth="1.3" strokeLinecap="round" />
      </svg>
      <p className="alert-msg">{message}</p>
    </div>
  );
}