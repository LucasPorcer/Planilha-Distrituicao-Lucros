"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import AnimatedBackground from "@/components/AnimatedBackground";
import FileUploader from "@/components/FileUploader";
import ProcessingAnimation from "@/components/ProcessingAnimation";
import ResultsTable, { Transaction } from "@/components/ResultsTable";
import DownloadButton from "@/components/DownloadButton";

type AppState = "idle" | "processing" | "results" | "error";

interface AnalysisResult {
  transactions: Transaction[];
  banco?: string;
  periodo?: string;
  titular?: string;
}

const stagger = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.1 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 25, filter: "blur(8px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
  },
};

export default function Dashboard() {
  const router = useRouter();
  const [state, setState] = useState<AppState>("idle");
  const [step, setStep] = useState(0);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = sessionStorage.getItem("anl-token");
    if (!token) {
      router.replace("/");
    }
  }, [router]);

  const handleFile = useCallback(async (file: File) => {
    const password = sessionStorage.getItem("anl-token") || "";
    setState("processing");
    setStep(0);
    setError("");

    const stepTimer = setInterval(() => {
      setStep((s) => Math.min(s + 1, 4));
    }, 2500);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "x-access-password": password },
        body: formData,
      });

      clearInterval(stepTimer);

      const contentType = res.headers.get("content-type") || "";
      if (!contentType.includes("application/json")) {
        const text = await res.text();
        const preview = text.slice(0, 300);
        console.error("Non-JSON response:", res.status, preview);
        throw new Error(`Erro ${res.status}: ${preview}`);
      }

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Erro ao analisar extrato");
      }

      if (!data.transactions || data.transactions.length === 0) {
        throw new Error("Nenhuma retirada encontrada no extrato");
      }

      setResult(data);
      setState("results");
    } catch (err) {
      clearInterval(stepTimer);
      setState("error");
      setError(err instanceof Error ? err.message : "Erro desconhecido");
    }
  }, []);

  const reset = () => {
    setState("idle");
    setResult(null);
    setError("");
    setStep(0);
  };

  return (
    <>
      <AnimatedBackground />
      <div className="min-h-dvh px-5 pb-10 pt-6">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -20, filter: "blur(10px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.5 }}
          className="mb-8 flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <motion.div
              className="flex h-10 w-10 items-center justify-center rounded-xl glass-glow"
              whileHover={{ scale: 1.1, rotate: 5 }}
              whileTap={{ scale: 0.9 }}
            >
              <motion.svg
                className="h-5 w-5 text-brand-400"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />
              </motion.svg>
            </motion.div>
            <div>
              <h1 className="text-xl font-bold text-white font-display tracking-tight">
                ANL
              </h1>
              <p className="text-[10px] uppercase tracking-[0.15em] text-slate-600 font-medium">
                Extrato Analyzer
              </p>
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              sessionStorage.removeItem("anl-token");
              router.replace("/");
            }}
            className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs text-slate-500 glass transition-all hover:text-white hover:border-white/10"
          >
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
            </svg>
            Sair
          </motion.button>
        </motion.header>

        <AnimatePresence mode="wait">
          {/* ======= IDLE STATE ======= */}
          {state === "idle" && (
            <motion.div
              key="idle"
              variants={stagger}
              initial="hidden"
              animate="visible"
              exit={{ opacity: 0, y: -30, filter: "blur(10px)", transition: { duration: 0.3 } }}
              className="flex flex-col gap-5"
            >
              {/* Upload card */}
              <motion.div variants={fadeUp} className="rounded-2xl glass-glow p-6">
                <div className="mb-5 flex items-center gap-3">
                  <motion.div
                    className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500/20 to-purple-500/20 border border-brand-500/20"
                    animate={{ rotate: [0, 5, -5, 0] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  >
                    <svg className="h-5 w-5 text-brand-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m.75 12l3 3m0 0l3-3m-3 3v-6m-1.5-9H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                    </svg>
                  </motion.div>
                  <div>
                    <h2 className="text-[15px] font-bold text-white font-display">
                      Envie seu extrato
                    </h2>
                    <p className="text-xs text-slate-500">
                      PDF ou foto do extrato bancário
                    </p>
                  </div>
                </div>
                <FileUploader onFileSelected={handleFile} />
              </motion.div>

              {/* How it works */}
              <motion.div variants={fadeUp} className="rounded-2xl glass p-5">
                <h3 className="mb-4 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-600">
                  Como funciona
                </h3>
                <div className="space-y-4">
                  {[
                    {
                      step: "01",
                      icon: "M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5",
                      title: "Upload",
                      desc: "Envie o extrato em PDF ou tire uma foto",
                      color: "from-brand-500/20 to-cyan-500/20",
                      border: "border-brand-500/20",
                    },
                    {
                      step: "02",
                      icon: "M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z",
                      title: "Análise IA",
                      desc: "GPT-4o extrai todas as retiradas automaticamente",
                      color: "from-purple-500/20 to-pink-500/20",
                      border: "border-purple-500/20",
                    },
                    {
                      step: "03",
                      icon: "M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3",
                      title: "Download",
                      desc: "Planilha de distribuição de lucros pronta",
                      color: "from-emerald-500/20 to-cyan-500/20",
                      border: "border-emerald-500/20",
                    },
                  ].map((item, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -15 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 + i * 0.12, type: "spring", stiffness: 100 }}
                      className="flex items-start gap-3"
                    >
                      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${item.color} border ${item.border}`}>
                        <svg className="h-4.5 w-4.5 text-slate-300" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
                        </svg>
                      </div>
                      <div className="pt-0.5">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono font-bold text-brand-400">{item.step}</span>
                          <p className="text-sm font-semibold text-white">{item.title}</p>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">{item.desc}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              {/* Footer badge */}
              <motion.div
                variants={fadeUp}
                className="flex justify-center"
              >
                <div className="flex items-center gap-2 rounded-full bg-white/[0.03] border border-white/5 px-4 py-2">
                  <motion.div
                    className="h-1.5 w-1.5 rounded-full bg-emerald-400"
                    animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                  <span className="text-[10px] font-medium text-slate-600">
                    Powered by GPT-4o Vision
                  </span>
                </div>
              </motion.div>
            </motion.div>
          )}

          {/* ======= PROCESSING STATE ======= */}
          {state === "processing" && (
            <motion.div
              key="processing"
              initial={{ opacity: 0, y: 30, filter: "blur(10px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -30, filter: "blur(10px)" }}
              transition={{ duration: 0.5 }}
            >
              <ProcessingAnimation currentStep={step} />
            </motion.div>
          )}

          {/* ======= RESULTS STATE ======= */}
          {state === "results" && result && (
            <motion.div
              key="results"
              variants={stagger}
              initial="hidden"
              animate="visible"
              exit={{ opacity: 0, y: -30, filter: "blur(10px)", transition: { duration: 0.3 } }}
              className="flex flex-col gap-5"
            >
              {/* Success banner */}
              <motion.div
                variants={fadeUp}
                className="flex items-center gap-3 rounded-2xl bg-emerald-500/5 border border-emerald-500/15 px-4 py-3"
              >
                <motion.div
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-500/15"
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <svg className="h-4 w-4 text-emerald-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </motion.div>
                <div>
                  <p className="text-sm font-semibold text-emerald-400 font-display">Análise concluída</p>
                  <p className="text-[11px] text-slate-500">
                    {result.transactions.length} retirada{result.transactions.length !== 1 ? "s" : ""} identificada{result.transactions.length !== 1 ? "s" : ""}
                  </p>
                </div>
              </motion.div>

              {/* Bank info */}
              {(result.banco || result.titular) && (
                <motion.div variants={fadeUp} className="rounded-xl glass p-4">
                  <div className="flex flex-wrap gap-x-5 gap-y-2">
                    {result.titular && (
                      <div>
                        <p className="text-[10px] uppercase tracking-wider text-slate-600 font-medium">Titular</p>
                        <p className="text-sm text-white font-medium">{result.titular}</p>
                      </div>
                    )}
                    {result.banco && (
                      <div>
                        <p className="text-[10px] uppercase tracking-wider text-slate-600 font-medium">Banco</p>
                        <p className="text-sm text-white font-medium">{result.banco}</p>
                      </div>
                    )}
                    {result.periodo && (
                      <div>
                        <p className="text-[10px] uppercase tracking-wider text-slate-600 font-medium">Período</p>
                        <p className="text-sm text-white font-medium font-mono">{result.periodo}</p>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              <motion.div variants={fadeUp}>
                <ResultsTable transactions={result.transactions} />
              </motion.div>

              <motion.div variants={fadeUp}>
                <DownloadButton
                  transactions={result.transactions}
                  banco={result.banco}
                  periodo={result.periodo}
                  titular={result.titular}
                />
              </motion.div>

              {/* Reset button */}
              <motion.button
                variants={fadeUp}
                whileHover={{ scale: 1.02, y: -1 }}
                whileTap={{ scale: 0.98 }}
                onClick={reset}
                className="w-full rounded-2xl border border-white/8 px-4 py-4 text-sm font-medium text-slate-500 transition-all duration-300 hover:bg-white/[0.03] hover:text-white hover:border-white/15"
              >
                <span className="flex items-center justify-center gap-2">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182" />
                  </svg>
                  Analisar outro extrato
                </span>
              </motion.button>
            </motion.div>
          )}

          {/* ======= ERROR STATE ======= */}
          {state === "error" && (
            <motion.div
              key="error"
              initial={{ opacity: 0, y: 30, filter: "blur(10px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -30, filter: "blur(10px)" }}
              transition={{ duration: 0.5 }}
              className="flex flex-col items-center gap-8 py-16"
            >
              <div className="relative">
                <motion.div
                  className="absolute inset-0 rounded-3xl bg-red-500/20 blur-2xl"
                  animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.6, 0.3] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
                <motion.div
                  className="relative flex h-24 w-24 items-center justify-center rounded-3xl bg-red-500/10 border border-red-500/20"
                  initial={{ scale: 0.5, rotate: -10 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 200 }}
                >
                  <motion.svg
                    className="h-12 w-12 text-red-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    animate={{ rotate: [0, 5, -5, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                  </motion.svg>
                </motion.div>
              </div>

              <div className="text-center space-y-2">
                <p className="text-xl font-bold text-white font-display">
                  Ops, algo deu errado
                </p>
                <p className="text-sm text-slate-400 max-w-[280px] leading-relaxed">
                  {error}
                </p>
              </div>

              <motion.button
                whileHover={{ scale: 1.03, y: -2 }}
                whileTap={{ scale: 0.97 }}
                onClick={reset}
                className="btn-glow rounded-2xl bg-gradient-to-r from-brand-600 to-purple-600 px-8 py-4 font-bold text-white shadow-[0_10px_40px_rgba(99,102,241,0.3)] transition-all hover:shadow-[0_15px_50px_rgba(99,102,241,0.4)]"
              >
                <span className="flex items-center gap-2">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182" />
                  </svg>
                  Tentar novamente
                </span>
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
