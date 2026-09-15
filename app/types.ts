import { ReactNode, MouseEvent } from "react";

export type Tab = {
  id: string;
  title: string;
  url: string;
  history: string[];
  historyIndex: number;
  refreshKey: number;
};

export type WindowProps = {
  label: string;
  icon: any;
  isOpen: boolean;
  isMinimized: boolean;
  isMaximized: boolean;
  x: number;
  y: number;
  w: number;
  h: number;
  zIndex: number;
  onClose: () => void;
  onMinimize: () => void;
  onMaximize: () => void;
  onDragStart: (e: MouseEvent) => void;
  onResizeStart: (e: MouseEvent) => void;
  onFocus: () => void;
  isDragging: boolean;
  isResizing: boolean;
  children: ReactNode;
  headerContent?: ReactNode;
};

export type WindowState = {
  isOpen: boolean;
  isMinimized: boolean;
  isMaximized: boolean;
  x: number;
  y: number;
  w: number;
  h: number;
  zIndex: number;
};

export type WindowsState = Record<string, WindowState>;

export type AppItem = {
  icon: any;
  label: string;
};

export type DeviceInfo = Record<string, string | number>;
