"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export interface Transaction {
  data: string;
  descricao: string;
  valor: number;
  beneficiario: string;
  id_operacao?: string;
}

interface ResultsTableProps {
  transactions: Transaction[];
}

function AnimatedNumber({ value }: { value: number }) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const duration = 1200;
    const start = performance.now();
    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(value * eased);
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [value]);

  return (
    <span className="font-mono tabular-nums">
      R$ {display.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
    </span>
  );
}

export default function ResultsTable({ transactions }: ResultsTableProps) {
  const total = transactions.reduce((sum, t) => sum + Math.abs(t.valor), 0);

  let accumulated = 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 25, filter: "blur(10px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="w-full overflow-hidden rounded-2xl glass-glow"
    >
      {/* Header */}
      <div className="border-b border-white/5 px-5 py-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <motion.div
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-500/10 border border-brand-500/20"
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            >
              <svg className="h-5 w-5 text-brand-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
              </svg>
            </motion.div>
            <div>
              <h3 className="text-sm font-bold text-white font-display">
                Retiradas de Lucro
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {transactions.length} transferência{transactions.length === 1 ? "" : "s"} para PF
              </p>
            </div>
          </div>
          <motion.div
            className="text-right rounded-xl bg-brand-500/10 border border-brand-500/20 px-3 py-2"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3, type: "spring" }}
          >
            <p className="text-[10px] uppercase tracking-wider text-slate-500">Total</p>
            <p className="text-sm font-bold text-brand-400">
              <AnimatedNumber value={total} />
            </p>
          </motion.div>
        </div>
      </div>

      {/* Transactions list */}
      <div className="max-h-[45vh] overflow-y-auto">
        {transactions.map((t, i) => {
          accumulated += Math.abs(t.valor);
          const runningTotal = accumulated;

          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 + i * 0.05, duration: 0.4, type: "spring" }}
              className="group relative border-b border-white/[0.03] px-5 py-3.5 last:border-0 transition-colors hover:bg-white/[0.02]"
            >
              {/* Left accent */}
              <motion.div
                className="absolute left-0 top-1/2 -translate-y-1/2 h-8 w-[2px] rounded-full bg-gradient-to-b from-brand-400 to-purple-500"
                initial={{ scaleY: 0 }}
                animate={{ scaleY: 1 }}
                transition={{ delay: 0.2 + i * 0.05, duration: 0.3 }}
              />

              <div className="flex items-center justify-between pl-2">
                <div className="min-w-0 flex-1 pr-3">
                  <p className="text-sm font-medium text-white/90 truncate">{t.descricao}</p>
                  <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-1">
                    <span className="inline-flex items-center gap-1 text-[11px] text-slate-500 font-mono">
                      <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                      </svg>
                      {t.data}
                    </span>
                    {t.id_operacao && (
                      <span className="text-[10px] text-slate-600 font-mono">
                        #{t.id_operacao}
                      </span>
                    )}
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <motion.p
                    className="text-sm font-bold font-mono whitespace-nowrap text-red-400"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 + i * 0.05 }}
                  >
                    R$ {Math.abs(t.valor).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </motion.p>
                  <p className="text-[10px] text-slate-600 font-mono mt-0.5">
                    acum. {runningTotal.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
