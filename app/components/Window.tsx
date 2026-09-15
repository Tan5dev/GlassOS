"use client";

import { Icon } from "@iconify/react";
import { WindowProps } from "../types";

export default function Window({
  label,
  icon: IconComponent,
  isOpen,
  isMinimized,
  isMaximized,
  x,
  y,
  w,
  h,
  zIndex,
  onClose,
  onMinimize,
  onMaximize,
  onDragStart,
  onResizeStart,
  onFocus,
  isDragging,
  isResizing,
  children,
  headerContent,
}: WindowProps) {
  if (!isOpen) return null;

  return (
    <div
      onMouseDown={onFocus}
      className={`absolute flex flex-col bg-zinc-950/75 backdrop-blur-2xl border border-white/8 rounded-xl overflow-hidden shadow-2xl ${
        isDragging || isResizing
          ? "transition-none"
          : "transition-all duration-200 ease-out"
      } ${
        isMinimized
          ? "opacity-0 scale-95 pointer-events-none translate-y-8"
          : "opacity-100 scale-100"
      }`}
      style={
        isMaximized
          ? {
              top: "2.75rem",
              left: 0,
              width: "100vw",
              height: "calc(100vh - 2.75rem)",
              borderRadius: 0,
              zIndex,
            }
          : {
              top: y,
              left: x,
              width: w,
              height: h,
              zIndex,
            }
      }
    >
      <div
        onMouseDown={onDragStart}
        className="flex justify-between items-center gap-2 bg-white/3 px-3.5 py-2.5 border-white/6 border-b cursor-default select-none shrink-0"
      >
        <div className="flex flex-1 items-center gap-2 min-w-0">
          <div className="flex items-center gap-1.5 pr-2 border-white/10 border-r nodrag shrink-0">
            <button
              onClick={onClose}
              className="group flex justify-center items-center bg-rose-500/80 hover:bg-rose-500 rounded-full w-3 h-3 transition-colors cursor-pointer"
              title="Close"
            >
              <Icon
                icon="mdi:close"
                className="opacity-0 group-hover:opacity-100 text-black/80"
                width={9}
              />
            </button>
            <button
              onClick={onMinimize}
              className="group flex justify-center items-center bg-amber-500/80 hover:bg-amber-500 rounded-full w-3 h-3 transition-colors cursor-pointer"
              title="Minimize"
            >
              <Icon
                icon="mdi:minus"
                className="opacity-0 group-hover:opacity-100 text-black/80"
                width={9}
              />
            </button>
            <button
              onClick={onMaximize}
              className="group flex justify-center items-center bg-emerald-500/80 hover:bg-emerald-500 rounded-full w-3 h-3 transition-colors cursor-pointer"
              title={isMaximized ? "Restore" : "Maximize"}
            >
              <Icon
                icon={isMaximized ? "mdi:window-restore" : "mdi:plus"}
                className="opacity-0 group-hover:opacity-100 text-black/80"
                width={9}
              />
            </button>
          </div>

          {headerContent ? (
            headerContent
          ) : (
            <div className="flex items-center gap-2 min-w-0">
              <IconComponent className="size-3.5 text-neutral-400 shrink-0" />
              <span className="font-medium text-neutral-300 text-xs truncate">
                {label}
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="relative flex flex-col flex-1 overflow-hidden">
        {children}
      </div>

      {!isMaximized && (
        <div
          onMouseDown={onResizeStart}
          className="right-0 bottom-0 z-50 absolute w-3.5 h-3.5 cursor-se-resize"
          style={{
            background:
              "linear-gradient(135deg, transparent 50%, rgba(255,255,255,0.15) 50%)",
          }}
        />
      )}
    </div>
  );
}
