"use client";

import React from "react";

type NotepadAppProps = {
  notepadText: string;
  setNotepadText: (text: string) => void;
};

export default function NotepadApp({
  notepadText,
  setNotepadText,
}: NotepadAppProps) {
  return (
    <div className="flex flex-col flex-1 bg-zinc-950/60 backdrop-blur-xl p-4 text-neutral-200">
      <div className="flex items-center gap-2 mb-2 pb-2 border-white/6 border-b select-none">
        <button
          onClick={() => {
            setNotepadText("");
          }}
          className="hover:bg-white/8 px-2.5 py-1 rounded-md font-medium text-neutral-300 hover:text-white text-xs transition-all cursor-pointer"
        >
          New
        </button>
        <button
          onClick={() => {
            if (typeof window !== "undefined") {
              localStorage.setItem("glassos_notepadText", notepadText);
            }
          }}
          className="hover:bg-white/8 px-2.5 py-1 rounded-md font-medium text-neutral-300 hover:text-white text-xs transition-all cursor-pointer"
        >
          Save
        </button>
      </div>
      <textarea
        value={notepadText}
        onChange={(e) => setNotepadText(e.target.value)}
        className="flex-1 bg-transparent p-2 border-none outline-none font-mono text-neutral-100 text-xs leading-relaxed resize-none"
        placeholder="Start typing..."
      />
    </div>
  );
}
