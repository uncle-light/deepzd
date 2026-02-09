"use client";

import dynamic from "next/dynamic";

const MouseGlow = dynamic(() => import("./MouseGlow"), { ssr: false });
const FloatingParticles = dynamic(() => import("./FloatingParticles"), { ssr: false });

/**
 * Client-side visual effects wrapper.
 * Wraps MouseGlow and FloatingParticles with `ssr: false`
 * since they depend on browser APIs (canvas, mouse events).
 */
export default function VisualEffects() {
  return (
    <>
      <MouseGlow />
      <FloatingParticles />
    </>
  );
}
