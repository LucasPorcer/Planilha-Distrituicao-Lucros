"use client";

import { useState, FormEvent, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";

function TypewriterText({ text, delay = 0 }: { text: string; delay?: number }) {
  const [displayed, setDisplayed] = useState("");
  useEffect(() => {
    let i = 0;
    const timeout = setTimeout(() => {
      const interval = setInterval(() => {
        if (i < text.length) {
          setDisplayed(text.slice(0, i + 1));
          i++;
        } else {
          clearInterval(interval);
        }
      }, 50);
      return () => clearInterval(interval);
    }, delay);
    return () => clearTimeout(timeout);
  }, [text, delay]);
  return (
    <span>
      {displayed}
      <motion.span
        animate={{ opacity: [1, 0] }}
        transition={{ duration: 0.7, repeat: Infinity }}
        className="text-brand-400"
      >
        |
      </motion.span>
    </span>
  );
}

function OrbitingDots() {
  return (
    <div className="absolute inset-0">
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <motion.div
          key={i}
          className="absolute left-1/2 top-1/2 h-1.5 w-1.5 rounded-full"
          style={{
            background: i % 2 === 0 ? "#818cf8" : "#a855f7",
            boxShadow:
              i % 2 === 0
                ? "0 0 8px #818cf8, 0 0 16px rgba(129,140,248,0.3)"
                : "0 0 8px #a855f7, 0 0 16px rgba(168,85,247,0.3)",
          }}
          animate={{
            rotate: 360,
            x: Math.cos((i * Math.PI * 2) / 6) * 52 - 3,
            y: Math.sin((i * Math.PI * 2) / 6) * 52 - 3,
          }}
          transition={{
            rotate: { duration: 6 + i * 0.5, repeat: Infinity, ease: "linear" },
            x: { duration: 0 },
            y: { duration: 0 },
          }}
        />
      ))}
    </div>
  );
}

export default function PasswordGate() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [unlocked, setUnlocked] = useState(false);
  const [focused, setFocused] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!password.trim()) return;

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (res.ok) {
        sessionStorage.setItem("anl-token", password);
        setUnlocked(true);
        setTimeout(() => router.push("/dashboard"), 1200);
      } else {
        setError("Senha incorreta");
        setPassword("");
      }
    } catch {
      setError("Erro de conexão");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center px-6">
      <AnimatePresence mode="wait">
        {!unlocked ? (
          <motion.div
            key="form"
            initial={{ opacity: 0, y: 40, scale: 0.9, filter: "blur(10px)" }}
            animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -60, scale: 1.1, filter: "blur(20px)" }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="w-full max-w-sm"
          >
            {/* Logo + Title */}
            <motion.div
              className="mb-10 flex flex-col items-center"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.6 }}
            >
              {/* Animated icon with orbiting dots */}
              <motion.div
                className="relative mb-8 flex h-28 w-28 items-center justify-center"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {/* Glow behind icon */}
                <div className="absolute inset-0 rounded-3xl bg-brand-500/20 blur-2xl animate-pulse-glow" />

                <div className="relative flex h-24 w-24 items-center justify-center rounded-3xl glass-glow">
                  <OrbitingDots />
                  <motion.svg
                    className="h-11 w-11 text-brand-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    animate={{ rotateY: [0, 360] }}
                    transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
                    />
                  </motion.svg>
                </div>
              </motion.div>

              <motion.h1
                className="text-4xl font-bold tracking-tighter font-display text-gradient animate-text-glow"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
              >
                ANL
              </motion.h1>

              <motion.p
                className="mt-2 text-sm text-slate-400 font-display"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                <TypewriterText
                  text="Analisador de Extratos Inteligente"
                  delay={600}
                />
              </motion.p>
            </motion.div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4, type: "spring", stiffness: 100 }}
                className="relative"
              >
                {/* Animated border glow on focus */}
                <motion.div
                  className="absolute -inset-[1px] rounded-2xl opacity-0"
                  animate={{
                    opacity: focused ? 1 : 0,
                    background: focused
                      ? [
                          "linear-gradient(0deg, #818cf8, #a855f7, #ec4899)",
                          "linear-gradient(120deg, #a855f7, #ec4899, #818cf8)",
                          "linear-gradient(240deg, #ec4899, #818cf8, #a855f7)",
                          "linear-gradient(360deg, #818cf8, #a855f7, #ec4899)",
                        ]
                      : "none",
                  }}
                  transition={{
                    opacity: { duration: 0.3 },
                    background: { duration: 3, repeat: Infinity, ease: "linear" },
                  }}
                  style={{
                    padding: 1,
                    mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
                    WebkitMaskComposite: "xor",
                    maskComposite: "exclude",
                  }}
                />

                <div className="relative">
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onFocus={() => setFocused(true)}
                    onBlur={() => setFocused(false)}
                    placeholder="Digite a senha de acesso"
                    autoFocus
                    className="w-full rounded-2xl border border-white/8 bg-white/[0.03] px-5 py-4 text-[15px] font-medium text-white placeholder-slate-600 outline-none transition-all duration-300 focus:border-brand-500/40 focus:bg-white/[0.05] focus:shadow-[0_0_30px_rgba(99,102,241,0.1)]"
                  />
                  <motion.div
                    className="absolute right-4 top-1/2 -translate-y-1/2"
                    animate={{ opacity: password ? 1 : 0.3 }}
                  >
                    <svg
                      className="h-5 w-5 text-brand-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z"
                      />
                    </svg>
                  </motion.div>
                </div>
              </motion.div>

              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, height: 0, y: -10 }}
                    animate={{ opacity: 1, height: "auto", y: 0 }}
                    exit={{ opacity: 0, height: 0, y: -10 }}
                    className="overflow-hidden"
                  >
                    <motion.p
                      className="flex items-center gap-2 rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-2.5 text-sm text-red-400"
                      animate={{ x: [0, -5, 5, -5, 5, 0] }}
                      transition={{ duration: 0.4 }}
                    >
                      <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                      </svg>
                      {error}
                    </motion.p>
                  </motion.div>
                )}
              </AnimatePresence>

              <motion.button
                type="submit"
                disabled={loading || !password.trim()}
                whileHover={{ scale: 1.03, y: -2 }}
                whileTap={{ scale: 0.97 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, type: "spring", stiffness: 100 }}
                className="btn-glow relative w-full overflow-hidden rounded-2xl bg-gradient-to-r from-brand-600 via-purple-600 to-brand-600 px-5 py-4 text-[15px] font-bold text-white shadow-[0_10px_40px_rgba(99,102,241,0.3)] transition-all duration-300 hover:shadow-[0_15px_50px_rgba(99,102,241,0.4)] disabled:opacity-40 disabled:shadow-none animate-gradient bg-[length:200%_auto]"
              >
                {loading ? (
                  <motion.div
                    className="flex items-center justify-center gap-3"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <div className="relative h-5 w-5">
                      <motion.div
                        className="absolute inset-0 rounded-full border-2 border-white/20 border-t-white"
                        animate={{ rotate: 360 }}
                        transition={{
                          duration: 0.7,
                          repeat: Infinity,
                          ease: "linear",
                        }}
                      />
                    </div>
                    Verificando...
                  </motion.div>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    Desbloquear
                    <motion.svg
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={2.5}
                      stroke="currentColor"
                      animate={{ x: [0, 4, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                    </motion.svg>
                  </span>
                )}
              </motion.button>
            </form>

            {/* Footer */}
            <motion.p
              className="mt-8 text-center text-[11px] text-slate-600"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
            >
              Powered by GPT-4o Vision
            </motion.p>
          </motion.div>
        ) : (
          <motion.div
            key="unlocked"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
            className="flex flex-col items-center"
          >
            {/* Success ring burst */}
            <div className="relative">
              <motion.div
                className="absolute inset-0 rounded-full"
                initial={{ scale: 1, opacity: 0.5 }}
                animate={{ scale: 3, opacity: 0 }}
                transition={{ duration: 1, ease: "easeOut" }}
                style={{ background: "radial-gradient(circle, rgba(16,185,129,0.4), transparent 70%)" }}
              />
              <motion.div
                className="absolute inset-0 rounded-full"
                initial={{ scale: 1, opacity: 0.3 }}
                animate={{ scale: 2.5, opacity: 0 }}
                transition={{ duration: 0.8, ease: "easeOut", delay: 0.1 }}
                style={{ border: "2px solid rgba(16,185,129,0.3)" }}
              />

              <motion.div
                className="relative flex h-24 w-24 items-center justify-center rounded-3xl"
                style={{
                  background: "linear-gradient(135deg, rgba(16,185,129,0.15), rgba(34,211,238,0.1))",
                  border: "1px solid rgba(16,185,129,0.3)",
                  boxShadow: "0 0 40px rgba(16,185,129,0.2)",
                }}
                animate={{ rotateY: [0, 360] }}
                transition={{ duration: 0.8, ease: "easeInOut" }}
              >
                <motion.svg
                  className="h-12 w-12 text-emerald-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                >
                  <motion.path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4.5 12.75l6 6 9-13.5"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                  />
                </motion.svg>
              </motion.div>
            </div>

            <motion.p
              className="mt-6 text-xl font-bold font-display text-gradient-cyan"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, type: "spring" }}
            >
              Acesso Liberado
            </motion.p>

            <motion.div
              className="mt-3 flex items-center gap-2 text-sm text-slate-400"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
            >
              <motion.div
                className="h-1.5 w-1.5 rounded-full bg-emerald-400"
                animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
              />
              Redirecionando...
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
