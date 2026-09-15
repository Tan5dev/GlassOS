"use client";

import React from "react";
import { FaUserAstronaut } from "react-icons/fa6";

type LoginScreenProps = {
  pin: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
};

export default function LoginScreen({ pin, onChange }: LoginScreenProps) {
  return (
    <div className="z-10 relative flex flex-col justify-center items-center size-full select-none">
      <div className="flex flex-col items-center bg-zinc-950/60 shadow-2xl backdrop-blur-2xl p-8 border border-white/8 rounded-2xl w-80 text-center">
        <div className="flex justify-center items-center bg-white/6 mb-4 border border-white/10 rounded-full w-16 h-16 text-neutral-300">
          <FaUserAstronaut className="size-8 text-neutral-200" />
        </div>
        <h1 className="font-medium text-white text-base tracking-tight">GlassOS</h1>
        <p className="mt-0.5 text-neutral-400 text-xs">Enter PIN to unlock</p>

        <div className="space-y-2 mt-6 w-full">
          <input
            type="password"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={4}
            value={pin}
            onChange={onChange}
            placeholder="••••"
            name="password"
            className="bg-white/4 px-4 py-2.5 border border-white/10 rounded-lg outline-none w-full font-mono text-white text-lg text-center tracking-[0.5em] transition-all"
          />
          <p className="font-mono text-[10px] text-neutral-500">
            Default PIN: 1234
          </p>
        </div>
      </div>
    </div>
  );
}
