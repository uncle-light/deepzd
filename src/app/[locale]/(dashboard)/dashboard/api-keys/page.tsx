"use client";

import { useState, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import {
  Key,
  Plus,
  Trash2,
  Copy,
  Check,
  Loader2,
  AlertTriangle,
  X,
} from "lucide-react";

interface ApiKey {
  id: string;
  name: string;
  key_prefix: string;
  last_used_at: string | null;
  created_at: string;
}

export default function ApiKeysPage() {
  const t = useTranslations("apiKeys");
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newKeyName, setNewKeyName] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [newKeyRaw, setNewKeyRaw] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const fetchKeys = useCallback(async () => {
    try {
      const res = await fetch("/api/api-keys");
      const data = await res.json();
      setKeys(data.keys || []);
    } catch { /* ignore */ }
    setLoading(false);
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void fetchKeys();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [fetchKeys]);

  const handleCreate = async () => {
    if (!newKeyName.trim() || creating) return;
    setCreating(true);
    try {
      const res = await fetch("/api/api-keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newKeyName.trim() }),
      });
      const data = await res.json();
      if (data.key) {
        setNewKeyRaw(data.key);
        setNewKeyName("");
        setShowCreate(false);
        fetchKeys();
      }
    } catch { /* ignore */ }
    setCreating(false);
  };

  const handleDelete = async (id: string) => {
    await fetch(`/api/api-keys/${id}`, { method: "DELETE" });
    setDeleteId(null);
    fetchKeys();
  };

  const handleCopy = () => {
    if (newKeyRaw) {
      navigator.clipboard.writeText(newKeyRaw);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-[var(--foreground)] tracking-tight">
            {t("title")}
          </h1>
          <p className="text-sm text-[var(--gray-500)] mt-1">{t("desc")}</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="px-3 py-1.5 text-sm rounded-md bg-[var(--foreground)] text-[var(--background)] font-medium hover:opacity-90 transition-opacity flex items-center gap-1.5"
        >
          <Plus className="w-3.5 h-3.5" />
          {t("create")}
        </button>
      </div>

      {/* New key reveal banner */}
      {newKeyRaw && (
        <div className="mb-6 rounded-lg border border-[var(--border)] overflow-hidden">
          <div className="p-4">
            <div className="flex items-start gap-2.5 mb-3">
              <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
              <p className="text-xs text-[var(--foreground)] font-medium">{t("newKeyWarning")}</p>
            </div>
            <div className="flex items-center gap-2">
              <code className="flex-1 px-3 py-2.5 text-xs bg-[var(--surface-muted)] rounded-md border border-[var(--border)] text-[var(--foreground)] font-mono break-all">
                {newKeyRaw}
              </code>
              <button
                onClick={handleCopy}
                className="shrink-0 px-3 py-2.5 text-xs rounded-md border border-[var(--border)] hover:bg-[var(--surface-muted)] flex items-center gap-1.5 transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? t("copied") : t("copy")}
              </button>
            </div>
          </div>
          <div className="px-4 py-2.5 border-t border-[var(--border)] flex justify-end">
            <button
              onClick={() => setNewKeyRaw(null)}
              className="text-xs text-[var(--gray-500)] hover:text-[var(--foreground)] transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Create form */}
      {showCreate && (
        <div className="mb-6 rounded-lg border border-[var(--border)] overflow-hidden">
          <div className="p-4">
            <label className="block text-xs font-medium text-[var(--gray-500)] mb-2">{t("name")}</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={newKeyName}
                onChange={(e) => setNewKeyName(e.target.value)}
                placeholder={t("namePlaceholder")}
                className="flex-1 px-3 py-2 text-sm rounded-md border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--foreground)]/20 focus:border-[var(--foreground)]/30 transition-shadow"
                onKeyDown={(e) => e.key === "Enter" && handleCreate()}
                autoFocus
              />
              <button
                onClick={handleCreate}
                disabled={creating || !newKeyName.trim()}
                className="px-3 py-2 text-sm rounded-md bg-[var(--foreground)] text-[var(--background)] font-medium disabled:opacity-50 flex items-center gap-1.5 transition-opacity hover:opacity-90"
              >
                {creating && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                {creating ? t("creating") : t("create")}
              </button>
            </div>
          </div>
          <div className="px-4 py-2.5 border-t border-[var(--border)] flex justify-end">
            <button
              onClick={() => { setShowCreate(false); setNewKeyName(""); }}
              className="text-xs text-[var(--gray-500)] hover:text-[var(--foreground)] transition-colors"
            >
              {t("cancel") ?? "Cancel"}
            </button>
          </div>
        </div>
      )}

      {/* Keys list */}
      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="w-5 h-5 animate-spin text-[var(--gray-500)]" />
        </div>
      ) : keys.length === 0 ? (
        <div className="rounded-lg border border-dashed border-[var(--border)] py-16">
          <div className="flex flex-col items-center">
            <Key className="w-5 h-5 text-[var(--gray-400)] mb-4" />
            <p className="text-sm font-medium text-[var(--gray-400)]">{t("empty")}</p>
            <p className="text-xs text-[var(--gray-500)] mt-1 max-w-xs text-center">{t("emptyDesc")}</p>
          </div>
        </div>
      ) : (
        <div className="rounded-lg border border-[var(--border)] overflow-hidden">
          {keys.map((k, i) => (
            <div
              key={k.id}
              className={`flex items-center justify-between px-4 py-4 ${
                i < keys.length - 1 ? "border-b border-[var(--border)]" : ""
              }`}
            >
              <div className="min-w-0">
                <p className="text-sm font-medium text-[var(--foreground)] truncate">{k.name}</p>
                <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                  <code className="text-xs text-[var(--gray-500)] font-mono">{k.key_prefix}••••••</code>
                  <span className="text-xs text-[var(--gray-500)]">
                    {t("createdAt")} {new Date(k.created_at).toLocaleDateString()}
                  </span>
                  <span className="text-xs text-[var(--gray-500)]">
                    {t("lastUsed")} {k.last_used_at ? new Date(k.last_used_at).toLocaleDateString() : t("never")}
                  </span>
                </div>
              </div>

              <div className="shrink-0 ml-4">
                {deleteId === k.id ? (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleDelete(k.id)}
                      className="px-2.5 py-1.5 text-xs rounded-md bg-red-500 text-white font-medium hover:bg-red-600 transition-colors"
                    >
                      {t("confirmDelete")}
                    </button>
                    <button
                      onClick={() => setDeleteId(null)}
                      className="p-1.5 text-[var(--gray-500)] hover:text-[var(--foreground)] transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setDeleteId(k.id)}
                    className="p-1.5 rounded-md text-[var(--gray-500)] hover:text-red-600 transition-colors"
                    title={t("delete")}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
