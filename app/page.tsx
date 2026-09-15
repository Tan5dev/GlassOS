"use client";

import { useState, useEffect, FormEvent, DragEvent, useRef } from "react";
import Image from "next/image";
import StatusIcons from "./status-icons";
import DateTime from "./date-time";
import { FaCalculator, FaCalendar, FaCamera, FaChrome } from "react-icons/fa6";
import CalculatorApp from "./calculator-app";
import CalendarApp from "./calendar-app";
import { VscVscode } from "react-icons/vsc";
import { LuListTodo } from "react-icons/lu";
import { BiSolidNotepad } from "react-icons/bi";
import { IoSettings } from "react-icons/io5";
import { RiGamepadFill } from "react-icons/ri";
import { BsCloudSunFill } from "react-icons/bs";
import WeatherApp, { WeatherWidget } from "./weather-app";
import {
  DndContext,
  closestCenter,
  useSensor,
  useSensors,
  PointerSensor,
} from "@dnd-kit/core";
import {
  SortableContext,
  horizontalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import MainClock from "./main-clock";
import { Games } from "./gamesApp";
import { HackaTimeWidget } from "./hackatime-widget";
import { Tab, WindowsState, AppItem, DeviceInfo } from "./types";
import AppIcon from "./components/AppIcon";
import Window from "./components/Window";
import LoginScreen from "./components/LoginScreen";
import ChromeApp, { ChromeHeader } from "./components/apps/ChromeApp";
import SettingsApp from "./components/apps/SettingsApp";
import CameraApp from "./components/apps/CameraApp";
import VSCodeApp from "./components/apps/VSCodeApp";
import NotepadApp from "./components/apps/NotepadApp";
import TodoApp from "./components/apps/TodoApp";

const generateId = () => Math.random().toString(36).substring(2, 9);

export default function Home() {
  const [online, setOnline] = useState(false);
  const [battery, setBattery] = useState(100);
  const [charging, setCharging] = useState(false);
  const [wifiStrength, setWifiStrength] = useState<0 | 1 | 2 | 3 | 4>(4);
  const [currentScreen, setCurrentScreen] = useState("LOGIN");
  const [pin, setPin] = useState("");

  const [wallpaper, setWallpaper] = useState("/wallpaper-2.jpg");
  const [settingsTab, setSettingsTab] = useState("personalization");
  const [settingsWifi, setSettingsWifi] = useState(true);
  const [settingsBluetooth, setSettingsBluetooth] = useState(false);

  const [cpuUsage, setCpuUsage] = useState(24);
  const [memUsage, setMemUsage] = useState(48);

  const [vscodeActiveFile, setVscodeActiveFile] = useState("page.tsx");

  const [notepadText, setNotepadText] = useState(
    "Notes\n\nType here.",
  );

  const [todoInput, setTodoInput] = useState("");
  const [todos, setTodos] = useState([
    {
      id: "1",
      text: "Design clean layout",
      completed: true,
    },
    {
      id: "2",
      text: "Configure workspace apps",
      completed: true,
    },
    {
      id: "3",
      text: "Review project settings",
      completed: false,
    },
  ]);

  const [gameScores, setGameScores] = useState({ player: 0, ai: 0, ties: 0 });
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo>({});

  useEffect(() => {
    const handleCalcMode = (e: Event) => {
      const customEvent = e as CustomEvent;
      const mode = customEvent.detail.mode;
      setWindows((prev) => {
        const calc = prev["Calculator"];
        if (!calc) return prev;
        let targetWidth = 360;
        let targetHeight = 580;
        if (mode === "both") {
          targetWidth = 720;
          targetHeight = 550;
        } else if (mode === "scientific") {
          targetWidth = 380;
          targetHeight = 580;
        }
        return {
          ...prev,
          Calculator: {
            ...calc,
            w: targetWidth,
            h: targetHeight,
          },
        };
      });
    };
    window.addEventListener("calculatorModeChange", handleCalcMode);
    return () => window.removeEventListener("calculatorModeChange", handleCalcMode);
  }, []);

  const [windows, setWindows] = useState<WindowsState>({
    Settings: {
      isOpen: false,
      isMinimized: false,
      isMaximized: true,
      x: 120,
      y: 70,
      w: 650,
      h: 500,
      zIndex: 1,
    },
    "Visual Studio Code": {
      isOpen: false,
      isMinimized: false,
      isMaximized: false,
      x: 140,
      y: 90,
      w: 800,
      h: 550,
      zIndex: 1,
    },
    Notepad: {
      isOpen: false,
      isMinimized: false,
      isMaximized: false,
      x: 180,
      y: 130,
      w: 550,
      h: 400,
      zIndex: 1,
    },
    Camera: {
      isOpen: false,
      isMinimized: false,
      isMaximized: true,
      x: 240,
      y: 130,
      w: 550,
      h: 400,
      zIndex: 1,
    },
    Calculator: {
      isOpen: false,
      isMinimized: false,
      isMaximized: false,
      x: 180,
      y: 100,
      w: 360,
      h: 580,
      zIndex: 1,
    },
    Calendar: {
      isOpen: false,
      isMinimized: false,
      isMaximized: false,
      x: 240,
      y: 90,
      w: 800,
      h: 600,
      zIndex: 1,
    },
    "To-Do": {
      isOpen: false,
      isMinimized: false,
      isMaximized: false,
      x: 200,
      y: 150,
      w: 450,
      h: 450,
      zIndex: 1,
    },
    "Google Chrome": {
      isOpen: false,
      isMinimized: false,
      isMaximized: true,
      x: 100,
      y: 50,
      w: 900,
      h: 600,
      zIndex: 1,
    },
    Games: {
      isOpen: false,
      isMinimized: false,
      isMaximized: false,
      x: 220,
      y: 170,
      w: 500,
      h: 480,
      zIndex: 1,
    },
    Weather: {
      isOpen: false,
      isMinimized: false,
      isMaximized: false,
      x: 160,
      y: 100,
      w: 800,
      h: 580,
      zIndex: 1,
    },
  });

  const [maxZIndex, setMaxZIndex] = useState(10);
  const [draggedWindow, setDraggedWindow] = useState<string | null>(null);
  const [resizedWindow, setResizedWindow] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
  );

  const [tabs, setTabs] = useState<Tab[]>([
    {
      id: generateId(),
      title: "Portfolio",
      url: "https://www.thenicedev.xyz",
      history: ["https://www.thenicedev.xyz"],
      historyIndex: 0,
      refreshKey: 0,
    },
  ]);
  const [activeTabId, setActiveTabId] = useState(tabs[0].id);
  const [addressBarInput, setAddressBarInput] = useState(tabs[0].url);
  const [draggedTabIndex, setDraggedTabIndex] = useState<number | null>(null);

  const activeTab = tabs.find((t) => t.id === activeTabId) || tabs[0];

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [photo, setPhoto] = useState<string | null>(null);
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [cameraId, setCameraId] = useState("");

  useEffect(() => {
    (async () => {
      await navigator.mediaDevices.getUserMedia({ video: true });

      const all = await navigator.mediaDevices.enumerateDevices();
      const cams = all.filter((d) => d.kind === "videoinput");

      setDevices(cams);

      if (cams.length) {
        setCameraId(cams[0].deviceId);
      }
    })();

    return stopCamera;
  }, []);

  useEffect(() => {
    if (cameraId) startCamera(cameraId);
  }, [cameraId]);

  async function startCamera(deviceId?: string) {
    stopCamera();

    const media = await navigator.mediaDevices.getUserMedia({
      video: deviceId
        ? { deviceId: { exact: deviceId } }
        : { facingMode: "environment" },
      audio: false,
    });

    streamRef.current = media;

    if (videoRef.current) {
      videoRef.current.srcObject = media;
      await videoRef.current.play();
    }
  }

  function stopCamera() {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
  }

  function capture() {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.drawImage(video, 0, 0);

    setPhoto(canvas.toDataURL("image/png"));
  }

  function download() {
    if (!photo) return;

    const a = document.createElement("a");
    a.href = photo;
    a.download = `photo-${Date.now()}.png`;
    a.click();
  }

  async function retake() {
    setPhoto(null);

    if (cameraId) {
      await startCamera(cameraId);
    } else {
      await startCamera();
    }
  }

  const bringToFront = (label: string) => {
    const nextZ = maxZIndex + 1;
    setMaxZIndex(nextZ);
    setWindows((prev) => ({
      ...prev,
      [label]: {
        ...prev[label],
        zIndex: nextZ,
        isMinimized: false,
      },
    }));
  };

  const handleWindowDragStart = (e: React.MouseEvent, label: string) => {
    const win = windows[label];
    if (!win || win.isMaximized) return;
    if ((e.target as HTMLElement).closest(".nodrag")) return;

    bringToFront(label);
    setDraggedWindow(label);

    const startX = e.clientX - win.x;
    const startY = e.clientY - win.y;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      setWindows((prev) => {
        const w = prev[label];
        if (!w) return prev;

        const topBoundary = 52;
        const headerHeight = 40;

        let newX = moveEvent.clientX - startX;
        let newY = moveEvent.clientY - startY;

        const maxY = window.innerHeight - headerHeight;
        newY = Math.max(topBoundary, Math.min(maxY, newY));

        const minX = 100 - w.w;
        const maxX = window.innerWidth - 100;
        newX = Math.max(minX, Math.min(maxX, newX));

        return {
          ...prev,
          [label]: {
            ...w,
            x: newX,
            y: newY,
          },
        };
      });
    };

    const handleMouseUp = () => {
      setDraggedWindow(null);
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  const handleResizeStart = (e: React.MouseEvent, label: string) => {
    e.stopPropagation();
    const win = windows[label];
    if (!win) return;

    bringToFront(label);
    setResizedWindow(label);

    const startX = e.clientX;
    const startY = e.clientY;
    const startW = win.w;
    const startH = win.h;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      setWindows((prev) => {
        const w = prev[label];
        if (!w) return prev;
        return {
          ...prev,
          [label]: {
            ...w,
            w: Math.max(400, startW + (moveEvent.clientX - startX)),
            h: Math.max(300, startH + (moveEvent.clientY - startY)),
          },
        };
      });
    };

    const handleMouseUp = () => {
      setResizedWindow(null);
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  const handleAppClick = (label: string) => {
    const win = windows[label];
    if (!win) return;

    if (!win.isOpen) {
      const nextZ = maxZIndex + 1;
      setMaxZIndex(nextZ);
      setWindows((prev) => ({
        ...prev,
        [label]: {
          ...prev[label],
          isOpen: true,
          isMinimized: false,
          zIndex: nextZ,
        },
      }));
    } else if (win.isMinimized) {
      const nextZ = maxZIndex + 1;
      setMaxZIndex(nextZ);
      setWindows((prev) => ({
        ...prev,
        [label]: {
          ...prev[label],
          isMinimized: false,
          zIndex: nextZ,
        },
      }));
    } else {
      const isFrontmost = Object.keys(windows).every((key) => {
        return (
          !windows[key].isOpen ||
          windows[key].isMinimized ||
          windows[key].zIndex <= win.zIndex
        );
      });

      if (isFrontmost) {
        setWindows((prev) => ({
          ...prev,
          [label]: {
            ...prev[label],
            isMinimized: true,
          },
        }));
      } else {
        bringToFront(label);
      }
    }
  };

  const addNewTab = () => {
    const newTab: Tab = {
      id: generateId(),
      title: "New Tab",
      url: "https://glasstab.thenicedev.xyz",
      history: ["https://glasstab.thenicedev.xyz"],
      historyIndex: 0,
      refreshKey: 0,
    };
    setTabs([...tabs, newTab]);
    setActiveTabId(newTab.id);
    setAddressBarInput(newTab.url);
  };

  const closeTab = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (tabs.length === 1) {
      setWindows((prev) => ({
        ...prev,
        "Google Chrome": { ...prev["Google Chrome"], isOpen: false },
      }));
      return;
    }
    const newTabs = tabs.filter((t) => t.id !== id);
    setTabs(newTabs);
    if (activeTabId === id) {
      const closedIndex = tabs.findIndex((t) => t.id === id);
      const nextTab = newTabs[Math.max(0, closedIndex - 1)];
      setActiveTabId(nextTab.id);
      setAddressBarInput(nextTab.url);
    }
  };

  const switchTab = (tab: Tab) => {
    setActiveTabId(tab.id);
    setAddressBarInput(tab.url);
  };

  const handleTabDragStart = (e: DragEvent<HTMLDivElement>, index: number) => {
    setDraggedTabIndex(index);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleTabDrop = (e: DragEvent<HTMLDivElement>, targetIndex: number) => {
    e.preventDefault();
    if (draggedTabIndex === null || draggedTabIndex === targetIndex) return;
    const newTabs = [...tabs];
    const [draggedTab] = newTabs.splice(draggedTabIndex, 1);
    newTabs.splice(targetIndex, 0, draggedTab);
    setTabs(newTabs);
    setDraggedTabIndex(null);
  };

  const handleTabDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleNavigate = (e: FormEvent) => {
    e.preventDefault();
    let finalUrl = addressBarInput.trim();
    if (!finalUrl.startsWith("http://") && !finalUrl.startsWith("https://")) {
      finalUrl = `https://${finalUrl}`;
    }
    setTabs(
      tabs.map((tab) => {
        if (tab.id === activeTabId) {
          const newHistory = tab.history.slice(0, tab.historyIndex + 1);
          newHistory.push(finalUrl);
          return {
            ...tab,
            url: finalUrl,
            title: new URL(finalUrl).hostname,
            history: newHistory,
            historyIndex: newHistory.length - 1,
          };
        }
        return tab;
      }),
    );
    setAddressBarInput(finalUrl);
  };

  const handleBack = () => {
    if (activeTab.historyIndex > 0) {
      const newIndex = activeTab.historyIndex - 1;
      const newUrl = activeTab.history[newIndex];
      updateActiveTabHistory(newIndex, newUrl);
    }
  };

  const handleForward = () => {
    if (activeTab.historyIndex < activeTab.history.length - 1) {
      const newIndex = activeTab.historyIndex + 1;
      const newUrl = activeTab.history[newIndex];
      updateActiveTabHistory(newIndex, newUrl);
    }
  };

  const updateActiveTabHistory = (newIndex: number, newUrl: string) => {
    setTabs(
      tabs.map((tab) =>
        tab.id === activeTabId
          ? { ...tab, historyIndex: newIndex, url: newUrl }
          : tab,
      ),
    );
    setAddressBarInput(newUrl);
  };

  const handleRefresh = () => {
    setTabs(
      tabs.map((tab) =>
        tab.id === activeTabId
          ? { ...tab, refreshKey: tab.refreshKey + 1 }
          : tab,
      ),
    );
  };

  const handleLogin = (value: string) => {
    setCurrentScreen("HOME");
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 4);
    setPin(value);
    if (value.length === 4) handleLogin(value);
  };

  useEffect(() => {
    const update = () => {
      setOnline(navigator.onLine);
      const connection =
        (navigator as any).connection ||
        (navigator as any).mozConnection ||
        (navigator as any).webkitConnection;
      if (!connection) {
        setWifiStrength(navigator.onLine ? 4 : 0);
        return;
      }
      const downlink = connection.downlink ?? 0;
      if (!navigator.onLine) setWifiStrength(0);
      else if (downlink < 1) setWifiStrength(1);
      else if (downlink < 5) setWifiStrength(2);
      else if (downlink < 20) setWifiStrength(3);
      else setWifiStrength(4);
    };
    update();
    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    const connection =
      (navigator as any).connection ||
      (navigator as any).mozConnection ||
      (navigator as any).webkitConnection;
    connection?.addEventListener?.("change", update);
    return () => {
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
      connection?.removeEventListener?.("change", update);
    };
  }, []);

  useEffect(() => {
    if (!("getBattery" in navigator)) return;
    let batteryManager: any;
    const updateBattery = () => {
      setBattery(Math.round(batteryManager.level * 100));
      setCharging(batteryManager.charging);
    };
    (navigator as any).getBattery().then((battery: any) => {
      batteryManager = battery;
      updateBattery();
      battery.addEventListener("levelchange", updateBattery);
      battery.addEventListener("chargingchange", updateBattery);
    });
    return () => {
      if (!batteryManager) return;
      batteryManager.removeEventListener("levelchange", updateBattery);
      batteryManager.removeEventListener("chargingchange", updateBattery);
    };
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCpuUsage(Math.floor(Math.random() * 20) + 15);
      setMemUsage(Math.floor(Math.random() * 10) + 40);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const conn = (navigator as any).connection;
    const info = {
      "User Agent": navigator.userAgent,
      "System Language": navigator.language,
      "Logical CPU Cores": navigator.hardwareConcurrency || "Unknown",
      "Estimated Memory": (navigator as any).deviceMemory
        ? `${(navigator as any).deviceMemory} GB`
        : "Unknown",
      "Screen Resolution": `${window.screen.width} x ${window.screen.height}`,
      "Viewport Size": `${window.innerWidth} x ${window.innerHeight}`,
      "Device Pixel Ratio": window.devicePixelRatio,
      "Network Protocol":
        conn?.effectiveType || (navigator.onLine ? "Online" : "Offline"),
      "Network Downlink": conn?.downlink ? `${conn.downlink} Mbps` : "Unknown",
      "Local Time Zone": Intl.DateTimeFormat().resolvedOptions().timeZone,
    };
    setDeviceInfo(info);
  }, [battery, charging, online]);

  const initialApps: AppItem[] = [
    { icon: FaCalculator, label: "Calculator" },
    { icon: FaCalendar, label: "Calendar" },
    { icon: FaCamera, label: "Camera" },
    { icon: IoSettings, label: "Settings" },
    { icon: VscVscode, label: "Visual Studio Code" },
    { icon: BiSolidNotepad, label: "Notepad" },
    { icon: LuListTodo, label: "To-Do" },
    { icon: FaChrome, label: "Google Chrome" },
    { icon: RiGamepadFill, label: "Games" },
    { icon: BsCloudSunFill, label: "Weather" },
  ];
  const [items, setItems] = useState(initialApps);

  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      const savedWallpaper = localStorage.getItem("glassos_wallpaper");
      if (savedWallpaper) setWallpaper(savedWallpaper);

      const savedNotepad = localStorage.getItem("glassos_notepadText");
      if (savedNotepad) setNotepadText(savedNotepad);

      const savedTodos = localStorage.getItem("glassos_todos");
      if (savedTodos) setTodos(JSON.parse(savedTodos));

      const savedScores = localStorage.getItem("glassos_gameScores");
      if (savedScores) setGameScores(JSON.parse(savedScores));

      const savedWindows = localStorage.getItem("glassos_windows");
      if (savedWindows) {
        const parsed = JSON.parse(savedWindows);
        setWindows((prev) => {
          const merged = { ...prev };
          Object.keys(parsed).forEach((key) => {
            if (merged[key]) {
              merged[key] = { ...merged[key], ...parsed[key] };
            }
          });
          return merged;
        });
      }

      const savedTabs = localStorage.getItem("glassos_tabs");
      if (savedTabs) setTabs(JSON.parse(savedTabs));

      const savedActiveTabId = localStorage.getItem("glassos_activeTabId");
      if (savedActiveTabId) setActiveTabId(savedActiveTabId);

      const savedTaskbar = localStorage.getItem("glassos_taskbar_order");
      if (savedTaskbar) {
        const orderedLabels = JSON.parse(savedTaskbar);
        const orderedApps = orderedLabels
          .map((label: string) =>
            initialApps.find((app) => app.label === label),
          )
          .filter(Boolean) as any[];

        initialApps.forEach((app: any) => {
          if (!orderedLabels.includes(app.label)) {
            orderedApps.push(app);
          }
        });
        setItems(orderedApps);
      }

      const savedVscodeFile = localStorage.getItem("glassos_vscodeActiveFile");
      if (savedVscodeFile) setVscodeActiveFile(savedVscodeFile);

      const savedWifi = localStorage.getItem("glassos_settingsWifi");
      if (savedWifi) setSettingsWifi(savedWifi === "true");

      const savedBluetooth = localStorage.getItem("glassos_settingsBluetooth");
      if (savedBluetooth) setSettingsBluetooth(savedBluetooth === "true");

      const savedScreen = localStorage.getItem("glassos_currentScreen");
      if (savedScreen) setCurrentScreen(savedScreen);
    } catch (e) {
      console.error("Error loading states from localStorage", e);
    }
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("glassos_wallpaper", wallpaper);
    }
  }, [wallpaper]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("glassos_notepadText", notepadText);
    }
  }, [notepadText]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("glassos_todos", JSON.stringify(todos));
    }
  }, [todos]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("glassos_gameScores", JSON.stringify(gameScores));
    }
  }, [gameScores]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("glassos_windows", JSON.stringify(windows));
    }
  }, [windows]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("glassos_tabs", JSON.stringify(tabs));
    }
  }, [tabs]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("glassos_activeTabId", activeTabId);
    }
  }, [activeTabId]);

  useEffect(() => {
    if (typeof window !== "undefined" && items) {
      const labels = items.map((app) => app.label);
      localStorage.setItem("glassos_taskbar_order", JSON.stringify(labels));
    }
  }, [items]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("glassos_vscodeActiveFile", vscodeActiveFile);
    }
  }, [vscodeActiveFile]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("glassos_settingsWifi", String(settingsWifi));
    }
  }, [settingsWifi]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(
        "glassos_settingsBluetooth",
        String(settingsBluetooth),
      );
    }
  }, [settingsBluetooth]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("glassos_currentScreen", currentScreen);
    }
  }, [currentScreen]);

  const renderAppContent = (label: string) => {
    switch (label) {
      case "Google Chrome":
        return (
          <ChromeApp
            tabs={tabs}
            activeTabId={activeTabId}
            activeTab={activeTab}
            addressBarInput={addressBarInput}
            setAddressBarInput={setAddressBarInput}
            draggedWindow={draggedWindow}
            resizedWindow={resizedWindow}
            handleBack={handleBack}
            handleForward={handleForward}
            handleRefresh={handleRefresh}
            handleNavigate={handleNavigate}
          />
        );
      case "Settings":
        return (
          <SettingsApp
            settingsTab={settingsTab}
            setSettingsTab={setSettingsTab}
            wallpaper={wallpaper}
            setWallpaper={setWallpaper}
            cpuUsage={cpuUsage}
            memUsage={memUsage}
            settingsWifi={settingsWifi}
            setSettingsWifi={setSettingsWifi}
            settingsBluetooth={settingsBluetooth}
            setSettingsBluetooth={setSettingsBluetooth}
            deviceInfo={deviceInfo}
            initialApps={initialApps}
            windows={windows}
            handleAppClick={handleAppClick}
          />
        );
      case "Camera":
        return (
          <CameraApp
            cameraId={cameraId}
            setCameraId={setCameraId}
            devices={devices}
            photo={photo}
            videoRef={videoRef}
            canvasRef={canvasRef}
            capture={capture}
            retake={retake}
            download={download}
          />
        );
      case "Visual Studio Code":
        return (
          <VSCodeApp
            vscodeActiveFile={vscodeActiveFile}
            setVscodeActiveFile={setVscodeActiveFile}
          />
        );
      case "Notepad":
        return (
          <NotepadApp
            notepadText={notepadText}
            setNotepadText={setNotepadText}
          />
        );
      case "Calculator":
        return <CalculatorApp />;
      case "Calendar":
        return <CalendarApp />;
      case "To-Do":
        return (
          <TodoApp
            todos={todos}
            setTodos={setTodos}
            todoInput={todoInput}
            setTodoInput={setTodoInput}
            generateId={generateId}
          />
        );
      case "Games":
        return <Games />;
      case "Weather":
        return <WeatherApp />;
      default:
        return null;
    }
  };

  const chromeHeader = (
    <ChromeHeader
      tabs={tabs}
      activeTabId={activeTabId}
      switchTab={switchTab}
      closeTab={closeTab}
      addNewTab={addNewTab}
      handleTabDragStart={handleTabDragStart}
      handleTabDrop={handleTabDrop}
      handleTabDragOver={handleTabDragOver}
    />
  );

  return (
    <div className="relative w-dvw h-dvh overflow-hidden">
      <div
        className={`z-0 absolute inset-0 bg-black size-full ${currentScreen === "LOGIN" && "blur-lg"} transition-all`}
      >
        <Image
          src={wallpaper}
          alt="Background"
          fill
          className="opacity-80 object-cover"
        />
      </div>

      {currentScreen !== "LOGIN" ? (
        <>
          <div className="top-0 z-50 absolute flex flex-row justify-between items-center bg-zinc-950/80 backdrop-blur-xl px-4 border-white/8 border-b w-full h-11">
            <div className="flex flex-col justify-center items-start text-white text-start leading-none select-none">
              <DateTime />
            </div>

            <div className="flex flex-row items-center gap-2">
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={({ active, over }) => {
                  if (!over || active.id === over.id) return;
                  setItems((items) => {
                    const oldIndex = items.findIndex(
                      (i) => i.label === active.id,
                    );
                    const newIndex = items.findIndex(
                      (i) => i.label === over.id,
                    );
                    return arrayMove(items, oldIndex, newIndex);
                  });
                }}
              >
                <SortableContext
                  items={items.map((i) => i.label)}
                  strategy={horizontalListSortingStrategy}
                >
                  {items.map((app) => {
                    const win = windows[app.label];
                    const isOpen = win ? win.isOpen : false;
                    const onClick = () => handleAppClick(app.label);
                    return (
                      <AppIcon
                        key={app.label}
                        {...app}
                        open={isOpen}
                        onClick={onClick}
                      />
                    );
                  })}
                </SortableContext>
              </DndContext>
            </div>

            <div className="flex flex-row items-center gap-2 text-white">
              <StatusIcons
                battery={battery}
                charging={charging}
                wifiStrength={wifiStrength}
                online={online}
              />
            </div>
          </div>

          <div className="top-1/2 left-1/2 absolute flex flex-col items-center gap-2 -translate-1/2">
            <MainClock />
            <WeatherWidget onClick={() => handleAppClick("Weather")} />
          </div>

          <div className="right-5 bottom-10 absolute flex flex-col items-center gap-2">
            <HackaTimeWidget />
          </div>

          {Object.entries(windows).map(([label, win]) => {
            if (!win.isOpen) return null;
            const app =
              items.find((i) => i.label === label) ||
              initialApps.find((i) => i.label === label);
            if (!app) return null;

            return (
              <Window
                key={label}
                label={label}
                icon={app.icon}
                isOpen={win.isOpen}
                isMinimized={win.isMinimized}
                isMaximized={win.isMaximized}
                x={win.x}
                y={win.y}
                w={win.w}
                h={win.h}
                zIndex={win.zIndex}
                isDragging={draggedWindow === label}
                isResizing={resizedWindow === label}
                onClose={() => {
                  setWindows((prev) => ({
                    ...prev,
                    [label]: { ...prev[label], isOpen: false },
                  }));
                }}
                onMinimize={() => {
                  setWindows((prev) => ({
                    ...prev,
                    [label]: { ...prev[label], isMinimized: true },
                  }));
                }}
                onMaximize={() => {
                  setWindows((prev) => ({
                    ...prev,
                    [label]: {
                      ...prev[label],
                      isMaximized: !prev[label].isMaximized,
                    },
                  }));
                }}
                onDragStart={(e) => handleWindowDragStart(e, label)}
                onResizeStart={(e) => handleResizeStart(e, label)}
                onFocus={() => bringToFront(label)}
                headerContent={
                  label === "Google Chrome" ? chromeHeader : undefined
                }
              >
                {renderAppContent(label)}
              </Window>
            );
          })}
        </>
      ) : (
        <LoginScreen pin={pin} onChange={handleChange} />
      )}
    </div>
  );
}