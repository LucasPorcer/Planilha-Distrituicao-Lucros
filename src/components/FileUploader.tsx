"use client";

import { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface FileUploaderProps {
  onFileSelected: (file: File) => void;
  disabled?: boolean;
}

const ACCEPT = ".pdf,.png,.jpg,.jpeg,.webp";
const MAX_SIZE = 20 * 1024 * 1024;

export default function FileUploader({
  onFileSelected,
  disabled,
}: FileUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<{
    name: string;
    size: string;
    type: string;
  } | null>(null);
  const [error, setError] = useState("");

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  function handleFile(file: File) {
    setError("");

    if (file.size > MAX_SIZE) {
      setError("Arquivo muito grande (máx. 20MB)");
      return;
    }

    const validTypes = [
      "application/pdf",
      "image/png",
      "image/jpeg",
      "image/webp",
    ];
    if (!validTypes.includes(file.type)) {
      setError("Formato não suportado. Use PDF, PNG, JPG ou WebP.");
      return;
    }

    setPreview({
      name: file.name,
      size: formatSize(file.size),
      type: file.type,
    });
    onFileSelected(file);
  }

  function onInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
    e.target.value = "";
  }

  function clear() {
    setPreview(null);
    setError("");
  }

  const isPdf = preview?.type === "application/pdf";

  return (
    <div className="flex flex-col gap-3">
      {/* Hidden inputs */}
      <input
        ref={fileInputRef}
        type="file"
        accept={ACCEPT}
        onChange={onInputChange}
        className="hidden"
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={onInputChange}
        className="hidden"
      />

      <AnimatePresence mode="wait">
        {preview ? (
          /* === FILE PREVIEW === */
          <motion.div
            key="preview"
            initial={{ opacity: 0, y: 15, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -15, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 200 }}
            className="rounded-2xl glass-glow p-6"
          >
            <div className="flex items-center gap-4">
              <motion.div
                className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl"
                style={{
                  background: isPdf
                    ? "rgba(239,68,68,0.1)"
                    : "rgba(129,140,248,0.1)",
                  border: `1px solid ${isPdf ? "rgba(239,68,68,0.2)" : "rgba(129,140,248,0.2)"}`,
                }}
                animate={{ rotateY: [0, 10, -10, 0] }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                {isPdf ? (
                  <svg
                    className="h-7 w-7 text-red-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
                    />
                  </svg>
                ) : (
                  <svg
                    className="h-7 w-7 text-brand-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z"
                    />
                  </svg>
                )}
              </motion.div>

              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-white truncate">
                  {preview.name}
                </p>
                <p className="text-xs text-slate-500 mt-0.5 font-mono">
                  {preview.size}
                </p>
              </div>

              {!disabled && (
                <motion.button
                  onClick={clear}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="shrink-0 rounded-lg bg-red-500/10 border border-red-500/20 p-2 text-red-400 transition-colors hover:bg-red-500/20"
                >
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </motion.button>
              )}
            </div>
          </motion.div>
        ) : (
          /* === TWO BUTTONS: FILE + CAMERA === */
          <motion.div
            key="buttons"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="flex flex-col gap-3"
          >
            {/* Arquivo button */}
            <motion.button
              onClick={() => !disabled && fileInputRef.current?.click()}
              disabled={disabled}
              whileHover={disabled ? {} : { scale: 1.01, y: -2 }}
              whileTap={disabled ? {} : { scale: 0.99 }}
              className="relative overflow-hidden rounded-2xl glass-glow p-6 text-left transition-all duration-300 hover:bg-white/[0.06] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {/* Animated border */}
              <motion.div
                className="absolute -inset-[1px] rounded-2xl opacity-40 pointer-events-none"
                animate={{
                  background: [
                    "linear-gradient(0deg, rgba(129,140,248,0.3), transparent, rgba(168,85,247,0.3))",
                    "linear-gradient(120deg, transparent, rgba(129,140,248,0.3), transparent)",
                    "linear-gradient(240deg, rgba(168,85,247,0.3), transparent, rgba(129,140,248,0.3))",
                    "linear-gradient(360deg, rgba(129,140,248,0.3), transparent, rgba(168,85,247,0.3))",
                  ],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "linear",
                }}
                style={{
                  padding: 1,
                  mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
                  WebkitMaskComposite: "xor",
                  maskComposite: "exclude",
                }}
              />

              <div className="flex items-center gap-4">
                <motion.div
                  className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500/15 to-purple-500/15 border border-brand-500/20"
                  animate={{ y: [0, -4, 0] }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                >
                  <svg
                    className="h-6 w-6 text-brand-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m.75 12l3 3m0 0l3-3m-3 3v-6m-1.5-9H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
                    />
                  </svg>
                </motion.div>

                <div className="flex-1">
                  <p className="text-[15px] font-bold text-white font-display">
                    Enviar Arquivo
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    PDF, PNG, JPG ou WebP — max. 20MB
                  </p>
                </div>

                <svg
                  className="h-5 w-5 text-slate-600 shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M8.25 4.5l7.5 7.5-7.5 7.5"
                  />
                </svg>
              </div>

              <div className="flex gap-2 mt-3 pl-[72px]">
                {["PDF", "PNG", "JPG"].map((fmt, i) => (
                  <motion.span
                    key={fmt}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 + i * 0.08 }}
                    className="rounded-md bg-white/5 border border-white/8 px-2 py-0.5 text-[10px] font-mono font-medium text-slate-500"
                  >
                    .{fmt.toLowerCase()}
                  </motion.span>
                ))}
              </div>
            </motion.button>

            {/* Camera / Gallery button */}
            <motion.button
              onClick={() => !disabled && cameraInputRef.current?.click()}
              disabled={disabled}
              whileHover={disabled ? {} : { scale: 1.01, y: -2 }}
              whileTap={disabled ? {} : { scale: 0.99 }}
              className="relative overflow-hidden rounded-2xl glass p-6 text-left transition-all duration-300 hover:bg-white/[0.06] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="flex items-center gap-4">
                <motion.div
                  className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500/15 to-emerald-500/15 border border-cyan-500/20"
                  animate={{ rotate: [0, 3, -3, 0] }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                >
                  <svg
                    className="h-6 w-6 text-cyan-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z"
                    />
                  </svg>
                </motion.div>

                <div className="flex-1">
                  <p className="text-[15px] font-bold text-white font-display">
                    Tirar Foto
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Abre a câmera para fotografar o extrato
                  </p>
                </div>

                <svg
                  className="h-5 w-5 text-slate-600 shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M8.25 4.5l7.5 7.5-7.5 7.5"
                  />
                </svg>
              </div>
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error message */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <p className="flex items-center gap-2 rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-2.5 text-sm text-red-400">
              <svg
                className="h-4 w-4 shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
                />
              </svg>
              {error}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
