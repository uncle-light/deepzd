"use client";

import { useEffect, useRef, useState } from "react";

interface Particle {
  x: number;
  y: number;
  size: number;
  opacity: number;
  color: string;
  vx: number;
  vy: number;
}

export default function FloatingParticles() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const particlesRef = useRef<Particle[]>([]);
  const animationRef = useRef<number>(0);

  // Initialize particles
  useEffect(() => {
    const updateDimensions = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    updateDimensions();
    window.addEventListener("resize", updateDimensions);
    return () => window.removeEventListener("resize", updateDimensions);
  }, []);

  // Create particles when dimensions change
  useEffect(() => {
    if (dimensions.width === 0 || dimensions.height === 0) return;

    const colors = [
      "#3a3a3a", "#4a4a4a", "#5a5a5a", "#6a6a6a", // Gray tones
      "#2d4a3a", "#3a5a4a", "#10b981", "#059669", // Green/teal accents
    ];

    const particles: Particle[] = [];
    const particleCount = Math.floor((dimensions.width * dimensions.height) / 3000);

    for (let i = 0; i < particleCount; i++) {
      // Bias towards top of screen (exponential distribution)
      const yBias = Math.pow(Math.random(), 2.5);
      const y = yBias * dimensions.height * 0.8;

      // Create wave-like horizontal distribution
      const waveOffset = Math.sin(y / 100) * 100;
      const x = Math.random() * dimensions.width + waveOffset;

      // More green particles in certain areas
      const isGreen = Math.random() < 0.15;
      const colorIndex = isGreen
        ? 4 + Math.floor(Math.random() * 4)
        : Math.floor(Math.random() * 4);

      particles.push({
        x,
        y,
        size: 2 + Math.random() * 3,
        opacity: 0.3 + Math.random() * 0.5,
        color: colors[colorIndex],
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.2,
      });
    }

    particlesRef.current = particles;
  }, [dimensions]);

  // Animation loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || dimensions.width === 0) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const animate = () => {
      ctx.clearRect(0, 0, dimensions.width, dimensions.height);

      particlesRef.current.forEach((particle) => {
        // Update position
        particle.x += particle.vx;
        particle.y += particle.vy;

        // Wrap around edges
        if (particle.x < -10) particle.x = dimensions.width + 10;
        if (particle.x > dimensions.width + 10) particle.x = -10;
        if (particle.y < -10) particle.y = dimensions.height * 0.8;
        if (particle.y > dimensions.height * 0.8) particle.y = -10;

        // Draw particle
        ctx.fillStyle = particle.color;
        ctx.globalAlpha = particle.opacity;
        ctx.fillRect(
          particle.x - particle.size / 2,
          particle.y - particle.size / 2,
          particle.size,
          particle.size
        );
      });

      ctx.globalAlpha = 1;
      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [dimensions]);

  return (
    <canvas
      ref={canvasRef}
      width={dimensions.width}
      height={dimensions.height}
      className="fixed inset-0 z-0 pointer-events-none"
    />
  );
}
