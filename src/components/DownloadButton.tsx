"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import confetti from "canvas-confetti";
import type { Transaction } from "./ResultsTable";

interface DownloadButtonProps {
  transactions: Transaction[];
  banco?: string;
  periodo?: string;
  titular?: string;
}

export default function DownloadButton({
  transactions,
  banco,
  periodo,
  titular,
}: DownloadButtonProps) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handleDownload() {
    setLoading(true);
    setSuccess(false);

    try {
      const password = sessionStorage.getItem("anl-token") || "";
      const res = await fetch("/api/generate-xlsx", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-access-password": password,
        },
        body: JSON.stringify({ transactions, banco, periodo, titular }),
      });

      if (!res.ok) throw new Error("Erro ao gerar planilha");

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `retiradas-lucro-${new Date().toISOString().slice(0, 10)}.xlsx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setSuccess(true);

      const end = Date.now() + 2000;
      const frame = () => {
        confetti({
          particleCount: 3,
          angle: 60,
          spread: 55,
          origin: { x: 0, y: 0.7 },
          colors: ["#818cf8", "#a855f7", "#22d3ee", "#ec4899"],
        });
        confetti({
          particleCount: 3,
          angle: 120,
          spread: 55,
          origin: { x: 1, y: 0.7 },
          colors: ["#818cf8", "#a855f7", "#22d3ee", "#ec4899"],
        });
        if (Date.now() < end) requestAnimationFrame(frame);
      };
      frame();

      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2, type: "spring" }}
      className="relative"
    >
      {/* Animated glow behind button */}
      <motion.div
        className="absolute -inset-1 rounded-2xl opacity-60 blur-lg"
        animate={{
          background: success
            ? ["linear-gradient(0deg, #10b981, #22d3ee)", "linear-gradient(180deg, #22d3ee, #10b981)"]
            : [
                "linear-gradient(0deg, #6366f1, #a855f7)",
                "linear-gradient(90deg, #a855f7, #ec4899)",
                "linear-gradient(180deg, #ec4899, #6366f1)",
                "linear-gradient(270deg, #6366f1, #a855f7)",
              ],
        }}
        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
      />

      <motion.button
        onClick={handleDownload}
        disabled={loading}
        whileHover={{ scale: 1.02, y: -2 }}
        whileTap={{ scale: 0.97 }}
        className={`btn-glow relative w-full overflow-hidden rounded-2xl px-6 py-5 text-[15px] font-bold text-white transition-all duration-300 disabled:opacity-60 ${
          success
            ? "bg-gradient-to-r from-emerald-600 to-cyan-600 shadow-[0_10px_40px_rgba(16,185,129,0.3)]"
            : "bg-gradient-to-r from-brand-600 via-purple-600 to-pink-600 shadow-[0_10px_40px_rgba(99,102,241,0.3)] hover:shadow-[0_15px_50px_rgba(99,102,241,0.4)]"
        } animate-gradient bg-[length:200%_auto]`}
      >
        {/* Shimmer overlay */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
          animate={{ x: ["-100%", "100%"] }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear", repeatDelay: 1 }}
        />

        <span className="relative z-10">
          {loading ? (
            <motion.span
              className="flex items-center justify-center gap-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <div className="relative h-5 w-5">
                <motion.div
                  className="absolute inset-0 rounded-full border-2 border-white/20 border-t-white"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 0.7, repeat: Infinity, ease: "linear" }}
                />
              </div>
              Gerando planilha...
            </motion.span>
          ) : success ? (
            <motion.span
              className="flex items-center justify-center gap-2"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring" }}
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
              Download concluído!
            </motion.span>
          ) : (
            <span className="flex items-center justify-center gap-3">
              <motion.svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                animate={{ y: [0, 3, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
              </motion.svg>
              Baixar Planilha Excel
              <span className="rounded-md bg-white/10 px-2 py-0.5 text-[11px] font-medium">.xlsx</span>
            </span>
          )}
        </span>
      </motion.button>
    </motion.div>
  );
}
