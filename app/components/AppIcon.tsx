"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

type AppIconProps = {
  icon: any;
  label: string;
  onClick: () => void;
  open: boolean;
};

export default function AppIcon({ icon: IconComponent, label, onClick, open }: AppIconProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: label,
  });

  return (
    <button
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      className={`group relative app ${open ? "open" : ""}`}
      style={{
        transform: CSS.Transform.toString(transform),
        transition: isDragging ? "none" : transition,
      }}
      onClick={onClick}
    >
      <IconComponent />

      <span className="top-full left-1/2 z-9999 absolute bg-zinc-950/90 opacity-0 group-hover:opacity-100 shadow-lg backdrop-blur-md mt-2.5 px-2.5 py-1 border border-white/10 rounded-md font-medium text-neutral-200 text-xs whitespace-nowrap transition-all -translate-x-1/2 translate-y-1 group-hover:translate-y-0 duration-150 pointer-events-none">
        {label}
      </span>
    </button>
  );
}
