"use client";

import { useRef, useState } from "react";

interface UploadZoneProps {
  onFile: (file: File) => void;
  maxMb: number;
}

const ACCEPT = "image/jpeg,image/png,image/webp";

export function UploadZone({ onFile, maxMb }: UploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const accept = (file: File | undefined) => {
    if (!file) return;
    onFile(file);
  };

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setIsDragging(false);
        accept(e.dataTransfer.files?.[0]);
      }}
      className={`rounded-xl border border-dashed p-8 text-center transition-all duration-200 md:p-10 ${
        isDragging
          ? "border-primary bg-primary/[0.07]"
          : "border-panel-border-strong bg-panel hover:border-primary/40"
      }`}
    >
      <div
        className="mx-auto grid h-11 w-11 place-items-center rounded-lg bg-primary/10 text-primary"
        aria-hidden="true"
      >
        <svg viewBox="0 0 20 20" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M10 14V4M10 4L6.5 7.5M10 4l3.5 3.5M3.5 13v2.5h13V13" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>

      <p className="mt-5 text-sm font-semibold">
        Drop an image here or{" "}
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="text-primary underline-offset-4 hover:underline"
        >
          browse
        </button>
      </p>
      <p className="mt-3 text-xs text-muted">JPG, PNG, or WEBP · up to {maxMb} MB</p>

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT}
        className="hidden"
        onChange={(e) => {
          accept(e.target.files?.[0]);
          // Reset so re-selecting the same file fires onChange again.
          e.target.value = "";
        }}
      />
    </div>
  );
}
