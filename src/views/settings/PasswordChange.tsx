"use client";

import { useState } from "react";
import { Loader2, ChevronDown, ChevronUp } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface PasswordChangeProps {
  labels: {
    password: string;
    passwordDesc: string;
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
    passwordMismatch: string;
    passwordTooShort: string;
    passwordChanged: string;
    passwordError: string;
    changePassword: string;
    changingPassword: string;
  };
  /** When true, renders without card wrapper (for embedding in Security card) */
  inline?: boolean;
}

export default function PasswordChange({ labels, inline }: PasswordChangeProps) {
  const [newPwd, setNewPwd] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");

    if (newPwd.length < 6) {
      setMessage(labels.passwordTooShort);
      setIsError(true);
      return;
    }
    if (newPwd !== confirmPwd) {
      setMessage(labels.passwordMismatch);
      setIsError(true);
      return;
    }

    setLoading(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({ password: newPwd });

      if (error) throw error;

      setMessage(labels.passwordChanged);
      setIsError(false);
      setNewPwd("");
      setConfirmPwd("");
      setExpanded(false);
    } catch {
      setMessage(labels.passwordError);
      setIsError(true);
    } finally {
      setLoading(false);
    }
  };

  const formContent = (
    <form
      id="password-form"
      onSubmit={handleSubmit}
      className="space-y-3"
    >
      <div>
        <label className="block text-xs text-[var(--gray-500)] mb-2">
          {labels.newPassword}
        </label>
        <input
          type="password"
          value={newPwd}
          onChange={(e) => {
            setNewPwd(e.target.value);
            setMessage("");
          }}
          className="w-full h-10 px-3 text-sm rounded-md border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--foreground)]/20 focus:border-[var(--foreground)]/30 transition-shadow"
        />
      </div>
      <div>
        <label className="block text-xs text-[var(--gray-500)] mb-2">
          {labels.confirmPassword}
        </label>
        <input
          type="password"
          value={confirmPwd}
          onChange={(e) => {
            setConfirmPwd(e.target.value);
            setMessage("");
          }}
          className="w-full h-10 px-3 text-sm rounded-md border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--foreground)]/20 focus:border-[var(--foreground)]/30 transition-shadow"
        />
      </div>
      {message && (
        <p className={`text-xs ${isError ? "text-red-500" : "text-green-600"}`}>
          {message}
        </p>
      )}
      <div className="flex items-center gap-2 pt-1">
        <button
          type="submit"
          disabled={loading || !newPwd}
          className="px-3 py-1.5 text-sm rounded-md bg-[var(--foreground)] text-[var(--background)] font-medium hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-1.5"
        >
          {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
          {loading ? labels.changingPassword : labels.changePassword}
        </button>
        {inline && (
          <button
            type="button"
            onClick={() => {
              setExpanded(false);
              setNewPwd("");
              setConfirmPwd("");
              setMessage("");
            }}
            className="px-3 py-1.5 text-sm rounded-md text-[var(--gray-500)] hover:text-[var(--foreground)] transition-colors"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );

  // Inline mode: collapsible section inside Security card
  if (inline) {
    return (
      <div className="rounded-lg border border-[var(--border)] overflow-hidden">
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="w-full px-3 py-3 flex items-center justify-between text-left hover:bg-[var(--surface-muted)] transition-colors"
        >
          <div>
            <p className="text-sm font-medium text-[var(--foreground)]">
              {labels.password}
            </p>
            <p className="text-xs text-[var(--gray-500)]">
              {labels.passwordDesc}
            </p>
          </div>
          {expanded ? (
            <ChevronUp className="w-4 h-4 text-[var(--gray-500)] shrink-0" />
          ) : (
            <ChevronDown className="w-4 h-4 text-[var(--gray-500)] shrink-0" />
          )}
        </button>
        {expanded && (
          <div className="px-3 pb-3 border-t border-[var(--border)] pt-3">
            {formContent}
          </div>
        )}
      </div>
    );
  }

  // Standalone card mode
  return (
    <div className="rounded-lg border border-[var(--border)] overflow-hidden">
      <div className="p-6">
        <h2 className="text-sm font-medium text-[var(--foreground)]">
          {labels.password}
        </h2>
        <p className="text-sm text-[var(--gray-500)] mt-1">
          {labels.passwordDesc}
        </p>
        <div className="mt-4">{formContent}</div>
      </div>
      <div className="px-6 py-3 flex items-center justify-between border-t border-[var(--border)] bg-[var(--surface-muted)]">
        <p className="text-xs text-[var(--gray-500)]">
          {message ? (
            <span className={isError ? "text-red-500" : "text-green-600"}>
              {message}
            </span>
          ) : (
            labels.passwordDesc
          )}
        </p>
      </div>
    </div>
  );
}
