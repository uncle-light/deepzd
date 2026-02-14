"use client";

import { useRef, useState, KeyboardEvent } from "react";
import { X } from "lucide-react";

interface BrandSettingsSectionProps {
  name: string;
  setName: (v: string) => void;
  brandName: string;
  setBrandName: (v: string) => void;
  brandWebsite: string;
  setBrandWebsite: (v: string) => void;
  brandDescription: string;
  setBrandDescription: (v: string) => void;
  brandNames: string[];
  setBrandNames: (v: string[]) => void;
  locale: string;
  labels: {
    title: string;
    name: string;
    namePlaceholder: string;
    brandName: string;
    brandNamePlaceholder: string;
    website: string;
    websitePlaceholder: string;
    description: string;
    descriptionPlaceholder: string;
    brandNames: string;
    brandNamesHint: string;
    brandNamesCount: string;
    optional: string;
  };
}

const inputClass =
  "w-full px-3 h-10 text-sm rounded-md border border-[var(--border)] bg-transparent text-[var(--foreground)] placeholder:text-[var(--gray-400)] focus:outline-none focus:ring-2 focus:ring-[var(--foreground)] focus:border-transparent transition-shadow";

export default function BrandSettingsSection({
  name,
  setName,
  brandName,
  setBrandName,
  brandWebsite,
  setBrandWebsite,
  brandDescription,
  setBrandDescription,
  brandNames,
  setBrandNames,
  locale: _locale,
  labels,
}: BrandSettingsSectionProps) {
  const [brandInput, setBrandInput] = useState("");
  const brandRef = useRef<HTMLInputElement>(null);

  const addTag = (value: string) => {
    const trimmed = value.trim();
    if (trimmed && !brandNames.includes(trimmed)) {
      setBrandNames([...brandNames, trimmed]);
    }
    setBrandInput("");
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag(brandInput);
    }
  };

  return (
    <section className="py-8">
      <h2 className="text-base font-semibold text-[var(--foreground)] mb-6">
        {labels.title}
      </h2>

      <div className="space-y-5">
        {/* Monitor name + Brand name: two columns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
              {labels.name} <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={labels.namePlaceholder}
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
              {labels.brandName} <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={brandName}
              onChange={(e) => setBrandName(e.target.value)}
              placeholder={labels.brandNamePlaceholder}
              className={inputClass}
            />
          </div>
        </div>

        {/* Website + Description: stacked */}
        <div>
          <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
            {labels.website}
            <span className="ml-1.5 text-[var(--gray-400)] font-normal text-xs">({labels.optional})</span>
          </label>
          <input
            type="url"
            value={brandWebsite}
            onChange={(e) => setBrandWebsite(e.target.value)}
            placeholder={labels.websitePlaceholder}
            className={inputClass}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
            {labels.description}
            <span className="ml-1.5 text-[var(--gray-400)] font-normal text-xs">({labels.optional})</span>
          </label>
          <textarea
            value={brandDescription}
            onChange={(e) => setBrandDescription(e.target.value)}
            placeholder={labels.descriptionPlaceholder}
            rows={2}
            className="w-full px-3 py-2.5 text-sm rounded-md border border-[var(--border)] bg-transparent text-[var(--foreground)] placeholder:text-[var(--gray-400)] focus:outline-none focus:ring-2 focus:ring-[var(--foreground)] focus:border-transparent transition-shadow resize-none"
          />
        </div>

        {/* Brand names (tag input) */}
        <div>
          <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
            {labels.brandNames} <span className="text-red-500">*</span>
          </label>
          <div
            className="flex flex-wrap gap-2 p-2.5 rounded-md border border-[var(--border)] min-h-[42px] cursor-text focus-within:ring-2 focus-within:ring-[var(--foreground)] focus-within:border-transparent transition-shadow"
            onClick={() => brandRef.current?.focus()}
          >
            {brandNames.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded bg-[var(--surface-muted)] text-[var(--foreground)] border border-[var(--border)]"
              >
                {tag}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setBrandNames(brandNames.filter((t) => t !== tag));
                  }}
                  className="text-[var(--gray-400)] hover:text-[var(--foreground)] transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
            <input
              ref={brandRef}
              type="text"
              value={brandInput}
              onChange={(e) => setBrandInput(e.target.value)}
              onKeyDown={handleKeyDown}
              onBlur={() => addTag(brandInput)}
              placeholder={brandNames.length === 0 ? labels.brandNamesHint : ""}
              className="flex-1 min-w-[100px] text-sm bg-transparent text-[var(--foreground)] placeholder:text-[var(--gray-400)] focus:outline-none"
            />
          </div>
          <p className="text-xs text-[var(--gray-400)] mt-1.5">
            {labels.brandNamesCount.replace("%count%", String(brandNames.length))}
          </p>
        </div>
      </div>
    </section>
  );
}
