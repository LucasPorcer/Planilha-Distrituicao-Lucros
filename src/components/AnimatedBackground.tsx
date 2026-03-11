"use client";

import { motion } from "framer-motion";
import { useMemo } from "react";

function Particles() {
  const particles = useMemo(
    () =>
      Array.from({ length: 30 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        size: Math.random() * 3 + 1,
        duration: Math.random() * 15 + 10,
        delay: Math.random() * 10,
        opacity: Math.random() * 0.4 + 0.1,
      })),
    []
  );

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute rounded-full bg-brand-400"
          style={{
            left: `${p.x}%`,
            width: p.size,
            height: p.size,
            opacity: p.opacity,
            animation: `particle-float ${p.duration}s linear ${p.delay}s infinite`,
          }}
        />
      ))}
    </div>
  );
}

export default function AnimatedBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0 bg-[#030014]" />

      {/* Aurora effect */}
      <div className="absolute -top-[40%] -left-[20%] h-[140%] w-[140%] animate-aurora opacity-20">
        <div
          className="absolute inset-0"
          style={{
            background:
              "conic-gradient(from 0deg at 50% 50%, rgba(99,102,241,0.3) 0deg, rgba(168,85,247,0.2) 72deg, rgba(236,72,153,0.15) 144deg, rgba(34,211,238,0.2) 216deg, rgba(99,102,241,0.3) 288deg, rgba(168,85,247,0.2) 360deg)",
            filter: "blur(80px)",
          }}
        />
      </div>

      {/* Morphing orb 1 */}
      <motion.div
        className="absolute top-[5%] right-[5%] h-80 w-80 animate-morph opacity-20"
        style={{
          background:
            "radial-gradient(circle, rgba(99,102,241,0.5) 0%, rgba(168,85,247,0.3) 40%, transparent 70%)",
          filter: "blur(40px)",
        }}
        animate={{
          x: [0, 40, -20, 0],
          y: [0, -30, 20, 0],
        }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Morphing orb 2 */}
      <motion.div
        className="absolute bottom-[10%] left-[0%] h-96 w-96 animate-morph opacity-15"
        style={{
          background:
            "radial-gradient(circle, rgba(236,72,153,0.4) 0%, rgba(168,85,247,0.3) 40%, transparent 70%)",
          filter: "blur(50px)",
          animationDelay: "-4s",
        }}
        animate={{
          x: [0, -30, 20, 0],
          y: [0, 40, -20, 0],
        }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Morphing orb 3 - cyan */}
      <motion.div
        className="absolute top-[50%] left-[50%] h-72 w-72 animate-morph opacity-10"
        style={{
          background:
            "radial-gradient(circle, rgba(34,211,238,0.4) 0%, rgba(99,102,241,0.2) 50%, transparent 70%)",
          filter: "blur(60px)",
          animationDelay: "-8s",
        }}
        animate={{
          x: [0, 50, -30, 0],
          y: [0, -40, 30, 0],
        }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Grid dots */}
      <div
        className="absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage:
            "radial-gradient(rgba(255,255,255,0.8) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />

      {/* Subtle grid lines */}
      <div
        className="absolute inset-0 opacity-[0.015]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(99,102,241,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.3) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
        }}
      />

      {/* Floating particles */}
      <Particles />

      {/* Top gradient vignette */}
      <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-[#030014] to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#030014] to-transparent" />
    </div>
  );
}
