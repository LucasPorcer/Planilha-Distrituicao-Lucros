"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { motion, AnimatePresence } from "framer-motion";

interface FileUploaderProps {
  onFileSelected: (file: File) => void;
  disabled?: boolean;
}

export default function FileUploader({
  onFileSelected,
  disabled,
}: FileUploaderProps) {
  const [preview, setPreview] = useState<{
    name: string;
    size: string;
    type: string;
  } | null>(null);

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const onDrop = useCallback(
    (accepted: File[]) => {
      if (accepted.length > 0 && !disabled) {
        const file = accepted[0];
        setPreview({
          name: file.name,
          size: formatSize(file.size),
          type: file.type,
        });
        onFileSelected(file);
      }
    },
    [onFileSelected, disabled]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "image/png": [".png"],
      "image/jpeg": [".jpg", ".jpeg"],
      "image/webp": [".webp"],
    },
    maxSize: 20 * 1024 * 1024,
    multiple: false,
    disabled,
  });

  const clear = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPreview(null);
  };

  const isPdf = preview?.type === "application/pdf";
  const rootProps = getRootProps();

  return (
    <div className="relative">
      {/* Animated border */}
      {!disabled && !preview && (
        <motion.div
          className="absolute -inset-[1px] rounded-2xl opacity-60 pointer-events-none"
          animate={{
            background: isDragActive
              ? [
                  "linear-gradient(0deg, #818cf8, #a855f7, #22d3ee, #818cf8)",
                  "linear-gradient(120deg, #a855f7, #22d3ee, #818cf8, #a855f7)",
                  "linear-gradient(240deg, #22d3ee, #818cf8, #a855f7, #22d3ee)",
                  "linear-gradient(360deg, #818cf8, #a855f7, #22d3ee, #818cf8)",
                ]
              : [
                  "linear-gradient(0deg, rgba(129,140,248,0.3), transparent, rgba(168,85,247,0.3))",
                  "linear-gradient(120deg, transparent, rgba(129,140,248,0.3), transparent)",
                  "linear-gradient(240deg, rgba(168,85,247,0.3), transparent, rgba(129,140,248,0.3))",
                  "linear-gradient(360deg, rgba(129,140,248,0.3), transparent, rgba(168,85,247,0.3))",
                ],
          }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          style={{
            padding: 1,
            mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
            WebkitMaskComposite: "xor",
            maskComposite: "exclude",
          }}
        />
      )}

      <motion.div
        whileHover={disabled ? {} : { scale: 1.01, y: -2 }}
        whileTap={disabled ? {} : { scale: 0.99 }}
        onClick={rootProps.onClick}
        onKeyDown={rootProps.onKeyDown}
        onFocus={rootProps.onFocus}
        onBlur={rootProps.onBlur}
        onDragEnter={rootProps.onDragEnter}
        onDragOver={rootProps.onDragOver}
        onDragLeave={rootProps.onDragLeave}
        onDrop={rootProps.onDrop}
        ref={rootProps.ref}
        tabIndex={rootProps.tabIndex}
        role={rootProps.role}
        className={`relative cursor-pointer rounded-2xl p-10 text-center transition-all duration-300 ${
          isDragActive
            ? "bg-brand-500/10 shadow-[0_0_40px_rgba(99,102,241,0.15)]"
            : disabled
              ? "cursor-not-allowed border border-white/5 opacity-50"
              : preview
                ? "glass-glow"
                : "glass hover:bg-white/[0.04] hover:shadow-[0_0_30px_rgba(99,102,241,0.08)]"
        }`}
      >
        <input {...getInputProps()} capture="environment" />

        {/* Scan line effect while dragging */}
        {isDragActive && (
          <div
            className="absolute inset-0 overflow-hidden rounded-2xl pointer-events-none"
          >
            <motion.div
              className="absolute left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-brand-400 to-transparent"
              animate={{ top: ["-10%", "110%"] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
            />
          </div>
        )}

        <AnimatePresence mode="wait">
          {preview ? (
            <motion.div
              key="preview"
              initial={{ opacity: 0, y: 15, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -15, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 200 }}
              className="flex flex-col items-center gap-4"
            >
              <motion.div
                className="relative flex h-16 w-16 items-center justify-center rounded-2xl"
                style={{
                  background: isPdf ? "rgba(239,68,68,0.1)" : "rgba(129,140,248,0.1)",
                  border: `1px solid ${isPdf ? "rgba(239,68,68,0.2)" : "rgba(129,140,248,0.2)"}`,
                }}
                animate={{ rotateY: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              >
                {isPdf ? (
                  <svg className="h-8 w-8 text-red-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                  </svg>
                ) : (
                  <svg className="h-8 w-8 text-brand-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z" />
                  </svg>
                )}
              </motion.div>
              <div>
                <p className="text-sm font-semibold text-white truncate max-w-[250px]">
                  {preview.name}
                </p>
                <p className="text-xs text-slate-500 mt-1 font-mono">{preview.size}</p>
              </div>
              {!disabled && (
                <motion.button
                  onClick={clear}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="rounded-lg bg-red-500/10 border border-red-500/20 px-3 py-1 text-xs text-red-400 transition-colors hover:bg-red-500/20"
                >
                  Remover
                </motion.button>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="flex flex-col items-center gap-5"
            >
              <motion.div
                className="relative flex h-20 w-20 items-center justify-center rounded-2xl glass-glow"
                animate={
                  isDragActive
                    ? { scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }
                    : { y: [0, -8, 0] }
                }
                transition={
                  isDragActive
                    ? { duration: 0.5, repeat: Infinity }
                    : { duration: 3, repeat: Infinity, ease: "easeInOut" }
                }
              >
                <svg
                  className="h-9 w-9 text-brand-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
                  />
                </svg>
                <motion.div
                  className="absolute -inset-1 rounded-2xl bg-brand-500/10"
                  animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0, 0.3] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              </motion.div>

              <div>
                <p className="text-[15px] font-semibold text-white font-display">
                  {isDragActive ? (
                    <motion.span
                      animate={{ scale: [1, 1.05, 1] }}
                      transition={{ duration: 0.5, repeat: Infinity }}
                      className="text-brand-400"
                    >
                      Solte o arquivo aqui
                    </motion.span>
                  ) : (
                    "Toque para enviar seu extrato"
                  )}
                </p>
                <p className="mt-2 text-xs text-slate-500">
                  PDF ou imagem (PNG, JPG, WebP) — max. 20MB
                </p>
              </div>

              <div className="flex gap-2">
                {["PDF", "PNG", "JPG"].map((fmt, i) => (
                  <motion.span
                    key={fmt}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3 + i * 0.1 }}
                    className="rounded-md bg-white/5 border border-white/8 px-2.5 py-1 text-[10px] font-mono font-medium text-slate-500"
                  >
                    .{fmt.toLowerCase()}
                  </motion.span>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
