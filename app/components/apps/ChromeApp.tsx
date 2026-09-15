"use client";

import React, { FormEvent, DragEvent } from "react";
import { Icon } from "@iconify/react";
import { Tab } from "../../types";

type ChromeHeaderProps = {
  tabs: Tab[];
  activeTabId: string;
  switchTab: (tab: Tab) => void;
  closeTab: (e: React.MouseEvent, id: string) => void;
  addNewTab: () => void;
  handleTabDragStart: (e: DragEvent<HTMLDivElement>, index: number) => void;
  handleTabDrop: (e: DragEvent<HTMLDivElement>, targetIndex: number) => void;
  handleTabDragOver: (e: DragEvent<HTMLDivElement>) => void;
};

export function ChromeHeader({
  tabs,
  activeTabId,
  switchTab,
  closeTab,
  addNewTab,
  handleTabDragStart,
  handleTabDrop,
  handleTabDragOver,
}: ChromeHeaderProps) {
  return (
    <div className="flex flex-1 items-end gap-1 mt-1 overflow-x-auto no-scrollbar nodrag">
      {tabs.map((tab, index) => {
        const isActive = tab.id === activeTabId;
        return (
          <div
            key={tab.id}
            draggable
            onDragStart={(e) => handleTabDragStart(e, index)}
            onDrop={(e) => handleTabDrop(e, index)}
            onDragOver={handleTabDragOver}
            onClick={() => switchTab(tab)}
            className={`group flex items-center gap-2 max-w-50 min-w-30 px-4 py-2 rounded-t-xl text-sm cursor-pointer transition-colors ${
              isActive
                ? "bg-[#2b2c2f] text-gray-100"
                : "bg-transparent text-gray-400 hover:bg-white/5"
            }`}
          >
            <Icon icon="mdi:web" className="shrink-0" width={16} />
            <span className="flex-1 font-medium truncate">{tab.title}</span>
            <Icon
              icon="mdi:close"
              width={14}
              onClick={(e: React.MouseEvent) => closeTab(e, tab.id)}
              className={`shrink-0 rounded-full hover:bg-white/20 p-px transition-opacity ${
                isActive ? "opacity-100" : "opacity-0 group-hover:opacity-100"
              }`}
            />
          </div>
        );
      })}
      <button
        onClick={addNewTab}
        className="hover:bg-white/10 mb-1.5 ml-1 p-1 rounded-full text-gray-400 transition-colors cursor-pointer"
      >
        <Icon icon="mdi:plus" width={18} />
      </button>
    </div>
  );
}

type ChromeAppProps = {
  tabs: Tab[];
  activeTabId: string;
  activeTab: Tab;
  addressBarInput: string;
  setAddressBarInput: (val: string) => void;
  draggedWindow: string | null;
  resizedWindow: string | null;
  handleBack: () => void;
  handleForward: () => void;
  handleRefresh: () => void;
  handleNavigate: (e: FormEvent) => void;
};

export default function ChromeApp({
  tabs,
  activeTabId,
  activeTab,
  addressBarInput,
  setAddressBarInput,
  draggedWindow,
  resizedWindow,
  handleBack,
  handleForward,
  handleRefresh,
  handleNavigate,
}: ChromeAppProps) {
  return (
    <div className="flex flex-col flex-1 bg-[#2b2c2f]">
      <div className="flex items-center gap-2 bg-[#2b2c2f] px-3 border-zinc-700 border-b h-12">
        <button
          onClick={handleBack}
          disabled={activeTab.historyIndex === 0}
          className="hover:bg-white/10 disabled:opacity-30 p-2 rounded-full text-gray-300 cursor-pointer"
        >
          <Icon icon="mdi:arrow-left" width={18} />
        </button>
        <button
          onClick={handleForward}
          disabled={activeTab.historyIndex === activeTab.history.length - 1}
          className="hover:bg-white/10 disabled:opacity-30 p-2 rounded-full text-gray-300 cursor-pointer"
        >
          <Icon icon="mdi:arrow-right" width={18} />
        </button>
        <button
          onClick={handleRefresh}
          className="hover:bg-white/10 p-2 rounded-full text-gray-300 cursor-pointer"
        >
          <Icon icon="mdi:refresh" width={18} />
        </button>

        <form onSubmit={handleNavigate} className="flex flex-1 mx-2">
          <div className="flex flex-1 items-center bg-[#1e1e20] px-4 py-1.5 border border-zinc-600 rounded-full transition-all">
            <Icon
              icon="mdi:lock-outline"
              width={16}
              className="mr-2 text-emerald-400 shrink-0"
            />
            <input
              type="text"
              value={addressBarInput}
              onChange={(e) => setAddressBarInput(e.target.value)}
              className="bg-transparent outline-none w-full text-gray-200 text-sm"
              placeholder="Search or type a URL"
            />
            <Icon
              icon="mdi:star-outline"
              width={18}
              className="ml-2 text-gray-400 hover:text-gray-200 cursor-pointer shrink-0"
            />
          </div>
        </form>

        <button className="hover:bg-white/10 p-2 rounded-full text-gray-300 cursor-pointer">
          <Icon icon="mdi:dots-vertical" width={18} />
        </button>
      </div>

      <div className="relative flex-1 bg-white">
        {tabs.map((tab) => (
          <div
            key={tab.id}
            className={`absolute inset-0 ${tab.id === activeTabId ? "z-10 block" : "z-0 hidden"}`}
          >
            <iframe
              key={`${tab.id}-${tab.refreshKey}`}
              src={tab.url}
              className={`bg-white border-none w-full h-full ${draggedWindow || resizedWindow ? "pointer-events-none" : ""}`}
              title={tab.title}
              sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
