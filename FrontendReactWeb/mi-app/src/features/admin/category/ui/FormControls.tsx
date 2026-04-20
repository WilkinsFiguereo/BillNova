import type {
  InputHTMLAttributes,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
  ReactNode,
} from "react";

// ─── Label ────────────────────────────────────────────────────────────────────
interface LabelProps {
  htmlFor:  string;
  children: ReactNode;
  required?: boolean;
}

export function Label({ htmlFor, children, required }: LabelProps) {
  return (
    <label
      htmlFor={htmlFor}
      className="block text-[0.8125rem] font-medium text-[#1F2937] mb-1.5 font-['IBM_Plex_Sans',sans-serif]"
    >
      {children}
      {required && (
        <span className="text-[#EF4444] ml-1" aria-hidden>*</span>
      )}
    </label>
  );
}

// ─── ErrorMessage ─────────────────────────────────────────────────────────────
export function ErrorMessage({ children }: { children: ReactNode }) {
  if (!children) return null;
  return (
    <p className="mt-1.5 text-[0.75rem] text-[#EF4444] font-['IBM_Plex_Sans',sans-serif]">
      {children}
    </p>
  );
}

// ─── Field (wrapper) ──────────────────────────────────────────────────────────
export function Field({ children }: { children: ReactNode }) {
  return <div className="flex flex-col">{children}</div>;
}

// ─── Estilos base para inputs ─────────────────────────────────────────────────
const inputBase = [
  "w-full rounded-lg border border-[#E5E7EB] bg-white",
  "text-[0.875rem] text-[#1F2937] placeholder:text-[#9CA3AF]",
  "px-3 py-2 h-9",
  "transition-all duration-150",
  "focus:outline-none focus:ring-2 focus:ring-[#1E3A8A] focus:ring-offset-0 focus:border-[#1E3A8A]",
  "disabled:bg-[#F1F5F9] disabled:text-[#9CA3AF] disabled:cursor-not-allowed",
  "font-['IBM_Plex_Sans',sans-serif]",
].join(" ");

const inputError = "border-[#EF4444] focus:ring-[#EF4444] focus:border-[#EF4444]";

// ─── Input ────────────────────────────────────────────────────────────────────
interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  iconLeft?: ReactNode;
}

export function Input({ error, iconLeft, className = "", ...props }: InputProps) {
  if (iconLeft) {
    return (
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF] pointer-events-none">
          {iconLeft}
        </span>
        <input
          {...props}
          className={[
            inputBase,
            "pl-9",
            error ? inputError : "",
            className,
          ]
            .filter(Boolean)
            .join(" ")}
        />
      </div>
    );
  }
  return (
    <input
      {...props}
      className={[inputBase, error ? inputError : "", className]
        .filter(Boolean)
        .join(" ")}
    />
  );
}

// ─── Textarea ─────────────────────────────────────────────────────────────────
interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string;
}

export function Textarea({ error, className = "", ...props }: TextareaProps) {
  return (
    <textarea
      {...props}
      className={[
        inputBase,
        "h-auto min-h-[80px] resize-none py-2.5",
        error ? inputError : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    />
  );
}

// ─── Select ───────────────────────────────────────────────────────────────────
interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  error?: string;
}

export function Select({ error, className = "", children, ...props }: SelectProps) {
  return (
    <select
      {...props}
      className={[
        inputBase,
        "cursor-pointer appearance-none",
        "bg-[url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%239CA3AF' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E\")] bg-no-repeat bg-[right_10px_center]",
        "pr-9",
        error ? inputError : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </select>
  );
}