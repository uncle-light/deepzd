/**
 * Shared utilities for chat message rendering
 */

export interface GradeInfo {
  label: string;
  name: string;
  desc: string;
}

export function getGradeInfo(score: number, locale: string): GradeInfo {
  if (score >= 75)
    return {
      label: "A",
      name: locale === "zh" ? "优秀" : "Excellent",
      desc: locale === "zh" ? "内容 GEO 表现优秀" : "Excellent GEO performance",
    };
  if (score >= 50)
    return {
      label: "B",
      name: locale === "zh" ? "良好" : "Good",
      desc: locale === "zh" ? "内容 GEO 表现良好" : "Good GEO performance",
    };
  if (score >= 25)
    return {
      label: "C",
      name: locale === "zh" ? "一般" : "Fair",
      desc: locale === "zh" ? "内容 GEO 表现一般" : "Fair GEO performance",
    };
  return {
    label: "D",
    name: locale === "zh" ? "较差" : "Poor",
    desc: locale === "zh" ? "内容 GEO 表现较差" : "Poor GEO performance",
  };
}

/**
 * Extract tool properties from any AI SDK v6 tool part format.
 * Works with both static (`tool-${NAME}`) and dynamic (`dynamic-tool`) parts.
 */
export function extractToolProps(part: Record<string, unknown>) {
  const output = part.output ?? part.errorText;
  return {
    state: part.state as string,
    input: (part.input ?? {}) as Record<string, unknown>,
    output: output as unknown,
  };
}

export function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === "object" && !Array.isArray(value);
}

export function getToolErrorMessage(output: unknown, fallback: string): string {
  if (typeof output === "string" && output.trim()) return output;
  if (output && typeof output === "object") {
    const o = output as Record<string, unknown>;
    if (typeof o.error === "string" && o.error.trim()) return o.error;
    if (typeof o.message === "string" && o.message.trim()) return o.message;
  }
  return fallback;
}
