"use client";

import React from "react";
import Image from "next/image";
import { Icon } from "@iconify/react";
import { FaUserAstronaut } from "react-icons/fa6";
import { AppItem, DeviceInfo, WindowsState } from "../../types";

type SettingsAppProps = {
  settingsTab: string;
  setSettingsTab: (tab: string) => void;
  wallpaper: string;
  setWallpaper: (wp: string) => void;
  cpuUsage: number;
  memUsage: number;
  settingsWifi: boolean;
  setSettingsWifi: (wifi: boolean) => void;
  settingsBluetooth: boolean;
  setSettingsBluetooth: (bt: boolean) => void;
  deviceInfo: DeviceInfo;
  initialApps: AppItem[];
  windows: WindowsState;
  handleAppClick: (label: string) => void;
};

export default function SettingsApp({
  settingsTab,
  setSettingsTab,
  wallpaper,
  setWallpaper,
  cpuUsage,
  memUsage,
  settingsWifi,
  setSettingsWifi,
  settingsBluetooth,
  setSettingsBluetooth,
  deviceInfo,
  initialApps,
  windows,
  handleAppClick,
}: SettingsAppProps) {
  return (
    <div className="flex flex-row flex-1 bg-zinc-950/20 text-white select-none">
      <div className="flex flex-col gap-2 bg-zinc-950/40 p-4 border-white/5 border-r w-48 overflow-y-auto text-left shrink-0">
        <button
          onClick={() => setSettingsTab("personalization")}
          className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm transition-all text-left cursor-pointer ${settingsTab === "personalization" ? "bg-white/10 font-medium" : "opacity-75 hover:bg-white/5"}`}
        >
          <Icon icon="mdi:palette" width={16} />
          <span>Appearance</span>
        </button>
        <button
          onClick={() => setSettingsTab("system")}
          className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm transition-all text-left cursor-pointer ${settingsTab === "system" ? "bg-white/10 font-medium" : "opacity-75 hover:bg-white/5"}`}
        >
          <Icon icon="mdi:cog" width={16} />
          <span>System</span>
        </button>
        <button
          onClick={() => setSettingsTab("about")}
          className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm transition-all text-left cursor-pointer ${settingsTab === "about" ? "bg-white/10 font-medium" : "opacity-75 hover:bg-white/5"}`}
        >
          <Icon icon="mdi:information" width={16} />
          <span>About</span>
        </button>
      </div>

      <div className="flex-1 p-6 overflow-y-auto">
        {settingsTab === "personalization" && (
          <div className="space-y-6">
            <div>
              <h3 className="mb-1 font-medium text-white text-base">
                Wallpaper
              </h3>
              <p className="mb-4 text-neutral-400 text-xs">
                Select a background image for your workspace.
              </p>
              <div className="gap-4 grid grid-cols-2">
                {["/wallpaper-1.jpg", "/wallpaper-2.jpg", "/wallpaper-3.jpg", "/wallpaper-4.jpg", "/wallpaper-5.jpg", "/wallpaper-6.jpg"].map((wp, i) => (
                  <button
                    key={wp}
                    onClick={() => setWallpaper(wp)}
                    className={`relative aspect-video rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${wallpaper === wp ? "border-blue-500 scale-[1.02]" : "border-white/10 hover:border-white/30"}`}
                  >
                    <Image
                      src={wp}
                      alt={`Wallpaper ${i + 1}`}
                      fill
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {settingsTab === "system" && (
          <div className="space-y-6">
            <div>
              <h3 className="mb-3 font-medium text-white text-base">Performance</h3>
              <div className="gap-4 grid grid-cols-2">
                <div className="bg-white/5 p-4 border border-white/5 rounded-xl">
                  <div className="flex justify-between mb-2 text-neutral-400 text-xs">
                    <span>CPU Usage</span>
                    <span className="font-mono text-neutral-200">{cpuUsage}%</span>
                  </div>
                  <div className="bg-white/10 rounded-full w-full h-1.5 overflow-hidden">
                    <div
                      className="bg-white h-full transition-all duration-300"
                      style={{ width: `${cpuUsage}%` }}
                    ></div>
                  </div>
                </div>
                <div className="bg-white/5 p-4 border border-white/5 rounded-xl">
                  <div className="flex justify-between mb-2 text-neutral-400 text-xs">
                    <span>Memory Usage</span>
                    <span className="font-mono text-neutral-200">{memUsage}%</span>
                  </div>
                  <div className="bg-white/10 rounded-full w-full h-1.5 overflow-hidden">
                    <div
                      className="bg-white h-full transition-all duration-300"
                      style={{ width: `${memUsage}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="mb-3 font-medium text-white text-base">
                Network
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center bg-white/5 p-3 border border-white/5 rounded-xl">
                  <div className="flex items-center gap-3">
                    <Icon
                      icon="mdi:wifi"
                      className="text-neutral-300"
                      width={18}
                    />
                    <div>
                      <div className="font-medium text-white text-xs">
                        Wi-Fi
                      </div>
                      <div className="text-[11px] text-neutral-400">
                        {settingsWifi
                          ? "Connected to GlassNet"
                          : "Disconnected"}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setSettingsWifi(!settingsWifi)}
                    className={`w-10 h-5 rounded-full p-0.5 transition-colors duration-200 cursor-pointer ${settingsWifi ? "bg-white" : "bg-white/20"}`}
                  >
                    <div
                      className={`bg-zinc-950 w-4 h-4 rounded-full shadow transform transition-transform duration-200 ${settingsWifi ? "translate-x-5" : ""}`}
                    ></div>
                  </button>
                </div>

                <div className="flex justify-between items-center bg-white/5 p-3 border border-white/5 rounded-xl">
                  <div className="flex items-center gap-3">
                    <Icon
                      icon="mdi:bluetooth"
                      className="text-neutral-300"
                      width={18}
                    />
                    <div>
                      <div className="font-medium text-white text-xs">Bluetooth</div>
                      <div className="text-[11px] text-neutral-400">
                        {settingsBluetooth
                          ? "Searching for devices"
                          : "Off"}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setSettingsBluetooth(!settingsBluetooth)}
                    className={`w-10 h-5 rounded-full p-0.5 transition-colors duration-200 cursor-pointer ${settingsBluetooth ? "bg-white" : "bg-white/20"}`}
                  >
                    <div
                      className={`bg-zinc-950 w-4 h-4 rounded-full shadow transform transition-transform duration-200 ${settingsBluetooth ? "translate-x-5" : ""}`}
                    ></div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {settingsTab === "about" && (
          <div className="space-y-6">
            <div className="flex items-center gap-4 pb-4 border-white/5 border-b">
              <div className="bg-white/10 p-3 rounded-xl">
                <FaUserAstronaut className="size-10 text-white" />
              </div>
              <div>
                <h3 className="font-medium text-white text-lg">GlassOS</h3>
                <p className="font-mono text-neutral-400 text-xs">
                  Version 2.0
                </p>
              </div>
            </div>

            <div>
              <h4 className="mb-3 font-mono text-[10px] text-neutral-400 uppercase tracking-widest select-none">
                System Info
              </h4>
              <div className="gap-3 grid grid-cols-1 md:grid-cols-2 text-neutral-300 text-xs">
                {Object.entries(deviceInfo).map(([key, val]) => (
                  <div
                    key={key}
                    className="flex justify-between bg-white/5 p-2.5 border border-white/5 rounded-xl"
                  >
                    <span className="text-neutral-400">{key}</span>
                    <span
                      className="max-w-[60%] font-medium text-white text-right truncate"
                      title={String(val)}
                    >
                      {val}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="mb-3 font-mono text-[10px] text-neutral-400 uppercase tracking-widest select-none">
                Applications
              </h4>
              <div className="gap-3 grid grid-cols-2">
                {initialApps.map((app) => {
                  const win = windows[app.label];
                  const isOpen = win ? win.isOpen : false;
                  return (
                    <div
                      key={app.label}
                      className="flex justify-between items-center bg-white/5 p-2.5 border border-white/5 rounded-xl"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <app.icon className="size-4 text-neutral-400 shrink-0" />
                        <div className="min-w-0">
                          <div className="font-medium text-white text-xs truncate">
                            {app.label}
                          </div>
                          <div className="text-[10px] text-neutral-400">
                            {isOpen ? "Open" : "Closed"}
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => handleAppClick(app.label)}
                        className="bg-white/10 hover:bg-white/20 px-2.5 py-1 rounded-md font-medium text-white text-xs transition-all cursor-pointer shrink-0"
                      >
                        Open
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
