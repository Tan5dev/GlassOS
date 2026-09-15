"use client";

import { useState } from "react";

export default function WelcomePrompt() {
  const [show, setShow] = useState(true);

  async function openFullscreen() {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      }
      setShow(false);
    } catch (err) {
      console.error(err);
      setShow(false);
    }
  }

  function close() {
    setShow(false);
  }

  if (!show) return null;

  return (
    <div className="z-9998 fixed inset-0 flex justify-center items-center bg-black/40 backdrop-blur-sm p-4 animate-in duration-200 fade-in">
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative flex flex-col bg-zinc-950/80 shadow-2xl backdrop-blur-xl p-7 border border-white/10 rounded-2xl w-full max-w-md overflow-hidden"
      >
        <h2 className="mb-2 font-medium text-white text-xl tracking-tight">
          Fullscreen recommended
        </h2>

        <p className="mb-6 text-neutral-400 text-xs leading-relaxed">
          Open in fullscreen to use all desktop features.
        </p>

        <div className="flex items-center gap-2.5">
          <button
            onClick={openFullscreen}
            className="flex-1 bg-white hover:bg-neutral-200 px-3.5 py-2 rounded-lg font-medium text-zinc-950 text-xs active:scale-[0.98] transition-all duration-150 cursor-pointer"
          >
            Fullscreen
          </button>

          <button
            onClick={close}
            className="bg-white/4 hover:bg-white/8 px-3.5 py-2 border border-white/10 rounded-lg font-medium text-neutral-300 text-xs active:scale-[0.98] transition-all duration-150 cursor-pointer"
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}