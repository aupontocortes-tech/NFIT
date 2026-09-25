"use client";

import { cn } from "@/lib/utils";
import { Eye, EyeOff } from "lucide-react";
import { useState, type InputHTMLAttributes, type TextareaHTMLAttributes } from "react";

interface FieldProps {
  label?: string;
  helper?: string;
  error?: string;
  className?: string;
}

export function Input({
  label,
  helper,
  error,
  className,
  id,
  type = "text",
  ...props
}: FieldProps & InputHTMLAttributes<HTMLInputElement>) {
  const [show, setShow] = useState(false);
  const isPassword = type === "password";
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      {label ? (
        <label htmlFor={inputId} className="text-base font-semibold text-text">
          {label}
        </label>
      ) : null}
      <div className="relative">
        <input
          id={inputId}
          type={isPassword && show ? "text" : type}
          className={cn(
            "h-12 w-full rounded-[var(--radius-md)] border bg-surface px-3 text-lg text-text placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-1",
            error ? "border-error" : "border-border",
            isPassword && "pr-11",
          )}
          aria-invalid={!!error}
          {...props}
        />
        {isPassword ? (
          <button
            type="button"
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-2 text-text-muted hover:text-text"
            onClick={() => setShow((s) => !s)}
            aria-label={show ? "Ocultar senha" : "Mostrar senha"}
          >
            {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        ) : null}
      </div>
      {error ? <p className="text-sm font-medium text-error">{error}</p> : null}
      {!error && helper ? <p className="text-caption">{helper}</p> : null}
    </div>
  );
}

export function Textarea({
  label,
  helper,
  error,
  className,
  id,
  ...props
}: FieldProps & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      {label ? (
        <label htmlFor={inputId} className="text-base font-semibold text-text">
          {label}
        </label>
      ) : null}
      <textarea
        id={inputId}
        className={cn(
          "min-h-28 w-full rounded-[var(--radius-md)] border bg-surface px-3 py-2 text-lg text-text placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-1",
          error ? "border-error" : "border-border",
        )}
        {...props}
      />
      {error ? <p className="text-sm font-medium text-error">{error}</p> : null}
      {!error && helper ? <p className="text-caption">{helper}</p> : null}
    </div>
  );
}

export function Select({
  label,
  helper,
  error,
  className,
  id,
  children,
  ...props
}: FieldProps & React.SelectHTMLAttributes<HTMLSelectElement>) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      {label ? (
        <label htmlFor={inputId} className="text-base font-semibold text-text">
          {label}
        </label>
      ) : null}
      <select
        id={inputId}
        className={cn(
          "h-12 w-full rounded-[var(--radius-md)] border bg-surface px-3 text-lg text-text focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-1",
          error ? "border-error" : "border-border",
        )}
        {...props}
      >
        {children}
      </select>
      {error ? <p className="text-sm font-medium text-error">{error}</p> : null}
      {!error && helper ? <p className="text-caption">{helper}</p> : null}
    </div>
  );
}
