"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  Loader2,
  Mail,
  Github,
  Chrome,
  Shield,
  Globe,
  CreditCard,
  ArrowUpRight,
  Copy,
  Check,
} from "lucide-react";
import AvatarUpload from "@/views/settings/AvatarUpload";
import PasswordChange from "@/views/settings/PasswordChange";
import DangerZone from "@/views/settings/DangerZone";

interface SettingsFormProps {
  locale: string;
  profileLocale: string;
  email: string;
  fullName: string;
  avatarUrl: string;
  isEmailUser: boolean;
  provider: string;
  createdAt: string;
  planId: string;
  planName: string;
  analysisLimit: number;
  analysisUsed: number;
  periodEnd: string;
}

/* ─── Vercel-style card ─── */
function SettingsCard({
  title,
  description,
  footer,
  danger,
  children,
}: {
  title: string;
  description?: string;
  footer?: React.ReactNode;
  danger?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div
      className={`rounded-lg border overflow-hidden ${
        danger ? "border-red-500/20" : "border-[var(--border)]"
      }`}
    >
      <div className="p-6">
        <h2
          className={`text-sm font-medium ${
            danger ? "text-red-500" : "text-[var(--foreground)]"
          }`}
        >
          {title}
        </h2>
        {description && (
          <p className="text-sm text-[var(--gray-500)] mt-1">{description}</p>
        )}
        <div className="mt-5">{children}</div>
      </div>
      {footer && (
        <div
          className={`px-6 py-3 flex items-center justify-between gap-4 border-t ${
            danger
              ? "border-red-500/20 bg-red-500/5"
              : "border-[var(--border)] bg-[var(--surface-muted)]"
          }`}
        >
          {footer}
        </div>
      )}
    </div>
  );
}

/* ─── Helpers ─── */
function i18n(locale: string, zh: string, en: string) {
  return locale === "zh" ? zh : en;
}

function formatDate(dateStr: string, locale: string) {
  if (!dateStr) return "—";
  try {
    return new Date(dateStr).toLocaleDateString(
      locale === "zh" ? "zh-CN" : "en-US",
      { year: "numeric", month: "long", day: "numeric" }
    );
  } catch {
    return "—";
  }
}

const PROVIDER_META: Record<string, { icon: React.ElementType; label: string }> = {
  email: { icon: Mail, label: "Email" },
  github: { icon: Github, label: "GitHub" },
  google: { icon: Chrome, label: "Google" },
};

/* ─── Main ─── */
export default function SettingsForm({
  locale,
  profileLocale,
  email,
  fullName,
  avatarUrl,
  isEmailUser,
  provider,
  createdAt,
  planId,
  planName,
  analysisLimit,
  analysisUsed,
  periodEnd,
}: SettingsFormProps) {
  const t = useTranslations("dashboard.settings");
  const router = useRouter();
  const [name, setName] = useState(fullName);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [selectedLocale, setSelectedLocale] = useState(
    profileLocale === "en" ? "en" : "zh"
  );
  const [copied, setCopied] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;
    const { error } = await supabase
      .from("profiles")
      .update({ full_name: name })
      .eq("id", user.id);
    setMessage(error ? t("error") : t("saved"));
    if (!error) router.refresh();
    setLoading(false);
  };

  function stripLocalePrefix(pathname: string): string {
    const parts = pathname.split("/").filter(Boolean);
    if (parts[0] === "zh" || parts[0] === "en") {
      parts.shift();
    }
    return `/${parts.join("/")}`.replace(/\/+$/, "") || "/";
  }

  function buildLocalePath(pathname: string, targetLocale: string): string {
    const basePath = stripLocalePrefix(pathname);
    if (targetLocale === "zh") {
      return basePath;
    }
    return `/en${basePath === "/" ? "" : basePath}`;
  }

  const handleLocaleChange = async (newLocale: string) => {
    if (newLocale === selectedLocale) return;
    setSelectedLocale(newLocale);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;
    const { error } = await supabase
      .from("profiles")
      .update({ locale: newLocale })
      .eq("id", user.id);
    if (error) {
      setSelectedLocale(profileLocale === "en" ? "en" : "zh");
      setMessage(
        i18n(
          locale,
          "语言更新失败，请稍后重试",
          "Failed to update language, please try again"
        )
      );
      return;
    }
    const targetPath = buildLocalePath(window.location.pathname, newLocale);
    window.location.assign(`${targetPath}${window.location.search}${window.location.hash}`);
  };

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(email);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const usagePercent =
    analysisLimit === -1
      ? 0
      : Math.min(100, Math.round((analysisUsed / Math.max(analysisLimit, 1)) * 100));
  const isUnlimited = analysisLimit === -1;

  const providerMeta = PROVIDER_META[provider] ?? PROVIDER_META.email;
  const ProviderIcon = providerMeta.icon;

  return (
    <div className="space-y-6">
      {/* ─── Profile: Avatar + Name ─── */}
      <SettingsCard
        title={t("avatar")}
        description={i18n(locale, "上传头像，推荐使用正方形图片", "Upload your avatar. Square images work best.")}
        footer={
          <p className="text-xs text-[var(--gray-500)]">
            {i18n(locale, "支持 JPG、PNG 格式，最大 2MB", "JPG or PNG, max 2MB")}
          </p>
        }
      >
        <div className="flex items-center justify-between">
          <AvatarUpload
            currentUrl={avatarUrl}
            userName={fullName}
            labels={{
              avatar: t("avatar"),
              avatarHint: t("avatarHint"),
              avatarUploading: t("avatarUploading"),
              avatarSuccess: t("avatarSuccess"),
              avatarError: t("avatarError"),
              avatarTooLarge: t("avatarTooLarge"),
            }}
            onUploaded={() => router.refresh()}
          />
        </div>
      </SettingsCard>

      {/* ─── Display Name ─── */}
      <SettingsCard
        title={t("name")}
        description={t("nameDesc")}
        footer={
          <>
            <p className="text-xs text-[var(--gray-500)]">
              {message ? (
                <span
                  className={
                    message === t("saved") ? "text-green-600" : "text-red-500"
                  }
                >
                  {message}
                </span>
              ) : (
                t("nameHint")
              )}
            </p>
            <button
              type="submit"
              form="profile-form"
              disabled={loading || name === fullName}
              className="shrink-0 px-3 py-1.5 text-sm rounded-md bg-[var(--foreground)] text-[var(--background)] font-medium hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-1.5"
            >
              {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              {loading ? t("saving") : t("save")}
            </button>
          </>
        }
      >
        <form id="profile-form" onSubmit={handleSave}>
          <input
            id="settings-name"
            type="text"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setMessage("");
            }}
            placeholder={i18n(locale, "输入你的显示名称", "Enter your display name")}
            className="w-full max-w-md h-10 px-3 text-sm rounded-md border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--foreground)]/20 focus:border-[var(--foreground)]/30 transition-shadow"
          />
        </form>
      </SettingsCard>

      {/* ─── Email (read-only) ─── */}
      <SettingsCard
        title={t("email")}
        description={i18n(
          locale,
          "用于登录和接收通知的邮箱地址",
          "Email address used for login and notifications"
        )}
        footer={
          <p className="text-xs text-[var(--gray-500)]">
            {i18n(locale, "邮箱地址不可修改", "Email address cannot be changed")}
          </p>
        }
      >
        <div className="flex items-center gap-2 max-w-md">
          <div className="flex-1 h-10 px-3 flex items-center text-sm rounded-md border border-[var(--border)] bg-[var(--surface-muted)] text-[var(--gray-400)]">
            {email}
          </div>
          <button
            type="button"
            onClick={handleCopyEmail}
            className="shrink-0 h-10 w-10 flex items-center justify-center rounded-md border border-[var(--border)] text-[var(--gray-500)] hover:text-[var(--foreground)] hover:border-[var(--foreground)] transition-colors"
            title={i18n(locale, "复制", "Copy")}
          >
            {copied ? (
              <Check className="w-4 h-4 text-green-600" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
          </button>
        </div>
      </SettingsCard>

      {/* ─── Plan & Usage ─── */}
      <SettingsCard
        title={i18n(locale, "订阅计划", "Subscription Plan")}
        description={i18n(
          locale,
          "当前计划和本月使用情况",
          "Your current plan and this month's usage"
        )}
        footer={
          <>
            <p className="text-xs text-[var(--gray-500)]">
              {periodEnd
                ? `${i18n(locale, "当前周期截止", "Current period ends")} ${formatDate(periodEnd, locale)}`
                : i18n(locale, "免费计划无到期时间", "Free plan has no expiration")}
            </p>
            {planId === "free" && (
              <a
                href={`/${locale === "zh" ? "" : "en/"}pricing`}
                className="shrink-0 px-3 py-1.5 text-sm rounded-md bg-[var(--foreground)] text-[var(--background)] font-medium hover:opacity-90 transition-opacity flex items-center gap-1"
              >
                {i18n(locale, "升级计划", "Upgrade")}
                <ArrowUpRight className="w-3.5 h-3.5" />
              </a>
            )}
          </>
        }
      >
        <div className="space-y-4">
          {/* Plan badge */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-[var(--gray-500)]" />
              <span className="text-sm text-[var(--foreground)] font-medium">
                {planName}
              </span>
            </div>
            <span className="text-xs text-[var(--gray-500)] font-medium">
              {planId.toUpperCase()}
            </span>
          </div>

          {/* Usage bar */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-[var(--gray-500)]">
                {i18n(locale, "本月分析次数", "Analyses this month")}
              </span>
              <span className="text-xs font-mono text-[var(--foreground)]">
                {analysisUsed}
                {isUnlimited
                  ? ` / ∞`
                  : ` / ${analysisLimit}`}
              </span>
            </div>
            <div className="h-1 rounded-full bg-[var(--surface-muted)] overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  usagePercent >= 90
                    ? "bg-red-600"
                    : usagePercent >= 70
                      ? "bg-amber-500"
                      : "bg-[var(--foreground)]"
                }`}
                style={{
                  width: isUnlimited
                    ? "5%"
                    : `${Math.max(2, usagePercent)}%`,
                }}
              />
            </div>
            {!isUnlimited && usagePercent >= 80 && (
              <p className="text-xs text-yellow-600 mt-1.5">
                {i18n(
                  locale,
                  `已使用 ${usagePercent}% 的月度配额`,
                  `${usagePercent}% of monthly quota used`
                )}
              </p>
            )}
          </div>
        </div>
      </SettingsCard>

      {/* ─── Language ─── */}
      <SettingsCard
        title={t("language")}
        description={t("languageHint")}
        footer={
          <p className="text-xs text-[var(--gray-500)]">
            <Globe className="w-3 h-3 inline-block mr-1 -mt-0.5" />
            {t("languageHint")}
          </p>
        }
      >
        <div className="flex gap-3">
          {[
            { value: "zh", label: "中文", sub: "简体中文" },
            { value: "en", label: "English", sub: "United States" },
          ].map((lang) => (
            <button
              key={lang.value}
              onClick={() => handleLocaleChange(lang.value)}
              className={`flex-1 max-w-[200px] px-4 py-3 rounded-lg border text-left transition-all ${
                selectedLocale === lang.value
                  ? "border-[var(--foreground)] bg-[var(--foreground)]/5 ring-1 ring-[var(--foreground)]"
                  : "border-[var(--border)] hover:border-[var(--gray-400)]"
              }`}
            >
              <span
                className={`block text-sm font-medium ${
                  selectedLocale === lang.value
                    ? "text-[var(--foreground)]"
                    : "text-[var(--gray-500)]"
                }`}
              >
                {lang.label}
              </span>
              <span className="block text-xs text-[var(--gray-500)] mt-0.5">
                {lang.sub}
              </span>
            </button>
          ))}
        </div>
      </SettingsCard>

      {/* ─── Security / Auth ─── */}
      <SettingsCard
        title={i18n(locale, "安全", "Security")}
        description={i18n(
          locale,
          "登录方式和账户安全设置",
          "Login method and account security"
        )}
        footer={
          <p className="text-xs text-[var(--gray-500)]">
            <Shield className="w-3 h-3 inline-block mr-1 -mt-0.5" />
            {i18n(
              locale,
              `注册于 ${formatDate(createdAt, locale)}`,
              `Member since ${formatDate(createdAt, locale)}`
            )}
          </p>
        }
      >
        <div className="space-y-4">
          {/* Login method */}
          <div className="flex items-center gap-3 p-3 rounded-lg border border-[var(--border)]">
            <ProviderIcon className="w-4 h-4 text-[var(--gray-500)] shrink-0" />
            <div>
              <p className="text-sm font-medium text-[var(--foreground)]">
                {providerMeta.label}
              </p>
              <p className="text-xs text-[var(--gray-500)]">
                {i18n(locale, "当前登录方式", "Current login method")}
              </p>
            </div>
            <span className="ml-auto text-xs text-green-600 font-medium">
              {i18n(locale, "已连接", "Connected")}
            </span>
          </div>

          {/* Password change inline (email users only) */}
          {isEmailUser && (
            <PasswordChange
              labels={{
                password: t("password"),
                passwordDesc: t("passwordDesc"),
                currentPassword: t("currentPassword"),
                newPassword: t("newPassword"),
                confirmPassword: t("confirmPassword"),
                passwordMismatch: t("passwordMismatch"),
                passwordTooShort: t("passwordTooShort"),
                passwordChanged: t("passwordChanged"),
                passwordError: t("passwordError"),
                changePassword: t("changePassword"),
                changingPassword: t("changingPassword"),
              }}
              inline
            />
          )}
        </div>
      </SettingsCard>

      {/* ─── Danger Zone ─── */}
      <DangerZone
        labels={{
          dangerZone: t("dangerZone"),
          deleteAccount: t("deleteAccount"),
          deleteWarning: t("deleteWarning"),
          deleteConfirm: t("deleteConfirm"),
          deleteConfirmText: t("deleteConfirmText"),
          deleting: t("deleting"),
          cancel: t("cancel"),
        }}
      />
    </div>
  );
}
