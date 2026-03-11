"use client";

import { motion, AnimatePresence } from "framer-motion";

const steps = [
  { label: "Lendo documento...", icon: "M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" },
  { label: "Extraindo transações...", icon: "M3.375 19.5h17.25m-17.25 0a1.125 1.125 0 01-1.125-1.125M3.375 19.5h7.5c.621 0 1.125-.504 1.125-1.125m-9.75 0V5.625m0 12.75v-1.5c0-.621.504-1.125 1.125-1.125m18.375 2.625V5.625m0 12.75c0 .621-.504 1.125-1.125 1.125m1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125m0 3.75h-7.5A1.125 1.125 0 0112 18.375m9.75-12.75c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125m19.5 0v1.5c0 .621-.504 1.125-1.125 1.125M2.25 5.625v1.5c0 .621.504 1.125 1.125 1.125m0 0h17.25m-17.25 0h7.5c.621 0 1.125.504 1.125 1.125M3.375 8.25c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125m17.25-3.75h-7.5c-.621 0-1.125.504-1.125 1.125m8.625-1.125c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125m-17.25 0h7.5m-7.5 0c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125M12 10.875v-1.5m0 1.5c0 .621-.504 1.125-1.125 1.125M12 10.875c0 .621.504 1.125 1.125 1.125m-2.25 0c.621 0 1.125.504 1.125 1.125M12 12h.008v.008H12V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" },
  { label: "Processando com IA...", icon: "M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" },
  { label: "Identificando retiradas...", icon: "M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" },
  { label: "Finalizando análise...", icon: "M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" },
];

function WaveformBars() {
  return (
    <div className="flex items-center gap-[3px] h-8">
      {Array.from({ length: 12 }, (_, i) => (
        <motion.div
          key={i}
          className="w-[3px] rounded-full bg-gradient-to-t from-brand-600 to-brand-300"
          animate={{
            height: [8, 20 + Math.random() * 12, 8],
          }}
          transition={{
            duration: 0.6 + Math.random() * 0.4,
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * 0.08,
          }}
        />
      ))}
    </div>
  );
}

function OrbitRings() {
  return (
    <>
      {[60, 76, 92].map((radius, i) => (
        <motion.div
          key={radius}
          className="absolute left-1/2 top-1/2 rounded-full border"
          style={{
            width: radius * 2,
            height: radius * 2,
            marginLeft: -radius,
            marginTop: -radius,
            borderColor: `rgba(129,140,248,${0.12 - i * 0.03})`,
          }}
          animate={{ rotate: i % 2 === 0 ? 360 : -360 }}
          transition={{
            duration: 8 + i * 4,
            repeat: Infinity,
            ease: "linear",
          }}
        >
          <motion.div
            className="absolute -top-1 left-1/2 h-2 w-2 -translate-x-1/2 rounded-full"
            style={{
              background: i === 0 ? "#818cf8" : i === 1 ? "#a855f7" : "#22d3ee",
              boxShadow: `0 0 8px ${i === 0 ? "#818cf8" : i === 1 ? "#a855f7" : "#22d3ee"}`,
            }}
          />
        </motion.div>
      ))}
    </>
  );
}

interface ProcessingAnimationProps {
  currentStep?: number;
}

export default function ProcessingAnimation({
  currentStep = 0,
}: ProcessingAnimationProps) {
  const safeStep = Math.min(currentStep, steps.length - 1);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, filter: "blur(10px)" }}
      animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
      exit={{ opacity: 0, scale: 0.9, filter: "blur(10px)" }}
      className="flex flex-col items-center gap-10 py-16"
    >
      {/* Central orb */}
      <div className="relative flex h-40 w-40 items-center justify-center">
        {/* Outer glow */}
        <div className="absolute inset-0 rounded-full bg-brand-500/15 blur-3xl animate-pulse-glow" />

        {/* Orbit rings */}
        <OrbitRings />

        {/* Inner pulsing ring */}
        <motion.div
          className="absolute inset-6 rounded-full"
          style={{ border: "1px solid rgba(129,140,248,0.2)" }}
          animate={{ scale: [1, 1.15, 1], opacity: [0.5, 0.2, 0.5] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Core icon */}
        <motion.div
          className="relative z-10 flex h-20 w-20 items-center justify-center rounded-2xl glass-glow"
          animate={{ rotate: [0, 5, -5, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        >
          <AnimatePresence mode="wait">
            <motion.svg
              key={safeStep}
              className="h-10 w-10 text-brand-400"
              viewBox="0 0 24 24"
              fill="none"
              strokeWidth={1.5}
              stroke="currentColor"
              initial={{ opacity: 0, scale: 0.5, rotate: -30 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              exit={{ opacity: 0, scale: 0.5, rotate: 30 }}
              transition={{ duration: 0.3, type: "spring" }}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d={steps[safeStep].icon}
              />
            </motion.svg>
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Waveform */}
      <WaveformBars />

      {/* Step info */}
      <div className="flex flex-col items-center gap-4">
        <AnimatePresence mode="wait">
          <motion.h3
            key={safeStep}
            className="text-lg font-bold text-white font-display"
            initial={{ opacity: 0, y: 15, filter: "blur(5px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -15, filter: "blur(5px)" }}
            transition={{ duration: 0.3 }}
          >
            {steps[safeStep].label}
          </motion.h3>
        </AnimatePresence>

        {/* Progress steps */}
        <div className="flex items-center gap-2">
          {steps.map((_, i) => (
            <motion.div
              key={i}
              className="relative h-2 overflow-hidden rounded-full"
              initial={{ width: 10 }}
              animate={{
                width: i === safeStep ? 32 : 10,
              }}
              transition={{ duration: 0.4, type: "spring" }}
            >
              <div
                className={`absolute inset-0 rounded-full ${
                  i < safeStep
                    ? "bg-brand-500"
                    : i === safeStep
                      ? "bg-gradient-to-r from-brand-500 to-purple-500"
                      : "bg-white/10"
                }`}
              />
              {i === safeStep && (
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                  animate={{ x: ["-100%", "100%"] }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                />
              )}
            </motion.div>
          ))}
        </div>

        {/* Percentage */}
        <motion.p
          className="text-xs font-mono text-slate-500"
          key={safeStep}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {Math.min(Math.round(((safeStep + 1) / steps.length) * 100), 100)}% concluído
        </motion.p>
      </div>
    </motion.div>
  );
}
