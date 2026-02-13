"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface DangerZoneProps {
  labels: {
    dangerZone: string;
    deleteAccount: string;
    deleteWarning: string;
    deleteConfirm: string;
    deleteConfirmText: string;
    deleting: string;
    cancel: string;
  };
}

export default function DangerZone({ labels }: DangerZoneProps) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (confirmText !== "DELETE") return;
    setDeleting(true);

    try {
      const supabase = createClient();
      await fetch("/api/auth/delete-account", { method: "POST" });
      await supabase.auth.signOut();
      window.location.href = "/";
    } catch {
      setDeleting(false);
    }
  };

  return (
    <div className="rounded-lg border border-red-500/20 overflow-hidden">
      <div className="p-6">
        <h2 className="text-sm font-medium text-red-500">
          {labels.dangerZone}
        </h2>
        <p className="text-sm text-[var(--gray-500)] mt-1">
          {labels.deleteWarning}
        </p>

        {showConfirm && (
          <div className="mt-4 space-y-3">
            <p className="text-xs text-red-500 font-medium">
              {labels.deleteConfirmText}
            </p>
            <input
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="DELETE"
              className="w-full h-10 px-3 text-sm rounded-md border border-red-500/30 bg-[var(--background)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-shadow"
            />
          </div>
        )}
      </div>
      <div className="px-6 py-3 flex items-center justify-between border-t border-red-500/20 bg-red-500/5">
        <p className="text-xs text-[var(--gray-500)]">
          {labels.deleteWarning}
        </p>
        {!showConfirm ? (
          <button
            onClick={() => setShowConfirm(true)}
            className="px-3 py-1.5 text-sm rounded-md border border-red-500/30 text-red-500 hover:bg-red-500/10 transition-colors font-medium"
          >
            {labels.deleteAccount}
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={() => {
                setShowConfirm(false);
                setConfirmText("");
              }}
              className="px-3 py-1.5 text-sm rounded-md text-[var(--gray-500)] hover:text-[var(--foreground)] transition-colors"
            >
              {labels.cancel}
            </button>
            <button
              onClick={handleDelete}
              disabled={confirmText !== "DELETE" || deleting}
              className="px-3 py-1.5 text-sm rounded-md bg-red-500 text-white font-medium hover:bg-red-600 transition-colors disabled:opacity-50 flex items-center gap-1.5"
            >
              {deleting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              {deleting ? labels.deleting : labels.deleteConfirm}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
