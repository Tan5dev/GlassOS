"use client";

import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import dynamic from "next/dynamic";
import { Icon } from "@iconify/react";

const Editor = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
  loading: () => (
    <div className="flex flex-1 flex-col items-center justify-center bg-[#1e1e1e] text-white/50 text-xs gap-3 select-none">
      <Icon icon="vscode-icons:file-type-vscode" width={44} className="animate-pulse" />
      <span>Loading editor...</span>
    </div>
  ),
});

type VSCodeAppProps = {
  vscodeActiveFile?: string;
  setVscodeActiveFile?: (file: string) => void;
};

const DEFAULT_FILES: Record<string, string> = {
  "src/App.tsx": `// GlassOS VS Code
// Edit code below or type 'run' in the Terminal to execute.

function calculateStats(items: number[]) {
  const sum = items.reduce((acc, curr) => acc + curr, 0);
  const average = sum / items.length;
  return { sum, average };
}

const numbers = [12, 25, 42, 88, 99];
const result = calculateStats(numbers);

console.log("Stats calculated:", result);
`,
  "src/styles.css": `/* Stylesheet */

:root {
  --primary-color: #007acc;
  --bg-dark: #1e1e1e;
  --text-light: #cccccc;
}

body {
  margin: 0;
  background-color: var(--bg-dark);
  color: var(--text-light);
  font-family: system-ui, sans-serif;
}
`,
  "src/utils/math.js": `// Math utilities

export function add(a, b) {
  return a + b;
}

export function factorial(n) {
  if (n <= 1) return 1;
  return n * factorial(n - 1);
}

console.log("Factorial of 5:", factorial(5));
`,
  "package.json": `{
  "name": "glassos-workspace",
  "version": "1.0.0",
  "private": true,
  "main": "src/App.tsx",
  "scripts": {
    "start": "run src/App.tsx",
    "build": "echo \\"Built successfully\\""
  }
}
`,
  "README.md": `# GlassOS VS Code

A browser-based code editor running client-side.

## Features
- **Monaco Editor**: Full syntax highlighting and code editing.
- **Client Storage**: Files and tabs save automatically to local storage.
- **Terminal Runner**: Run JS and TS files directly in the terminal with \`run\` or \`node <file>\`.
- **File System**: Create, rename, delete, and organize files.

## Terminal Commands
- \`run\`, \`node <file>\` - Execute JavaScript
- \`ls\`, \`cat\`, \`pwd\`, \`cd\`, \`mkdir\`, \`rmdir\` - Navigation
- \`cp\`, \`mv\`, \`touch\`, \`rm\`, \`echo\` - File operations
- \`grep\`, \`wc\`, \`head\`, \`tail\`, \`find\` - Inspection
- \`date\`, \`env\`, \`history\`, \`clear\`, \`help\`, \`reset\` - Utilities
`,
};

function getLanguageFromPath(filename: string): string {
  const ext = filename.split(".").pop()?.toLowerCase();
  switch (ext) {
    case "js":
    case "jsx":
      return "javascript";
    case "ts":
    case "tsx":
      return "typescript";
    case "css":
    case "scss":
    case "less":
      return "css";
    case "html":
    case "htm":
      return "html";
    case "json":
      return "json";
    case "md":
    case "markdown":
      return "markdown";
    case "py":
      return "python";
    case "sql":
      return "sql";
    case "xml":
    case "svg":
      return "xml";
    case "yaml":
    case "yml":
      return "yaml";
    default:
      return "plaintext";
  }
}

function getFileIcon(filename: string): { icon: string; color: string } {
  const ext = filename.split(".").pop()?.toLowerCase();
  switch (ext) {
    case "ts":
    case "tsx":
      return { icon: "vscode-icons:file-type-typescript-official", color: "#3178c6" };
    case "js":
    case "jsx":
      return { icon: "vscode-icons:file-type-js-official", color: "#f7df1e" };
    case "css":
      return { icon: "vscode-icons:file-type-css", color: "#42a5f5" };
    case "html":
      return { icon: "vscode-icons:file-type-html", color: "#e44d26" };
    case "json":
      return { icon: "vscode-icons:file-type-json", color: "#cbcb41" };
    case "md":
      return { icon: "vscode-icons:file-type-markdown", color: "#42a5f5" };
    case "py":
      return { icon: "vscode-icons:file-type-python", color: "#3776ab" };
    default:
      return { icon: "vscode-icons:default-file", color: "#cccccc" };
  }
}

export default function VSCodeApp({
  vscodeActiveFile: propActiveFile,
  setVscodeActiveFile: propSetActiveFile,
}: VSCodeAppProps) {
  const [files, setFiles] = useState<Record<string, string>>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("glassos_vscode_files_v4");
      if (saved) {
        try { return JSON.parse(saved); } catch {}
      }
    }
    return DEFAULT_FILES;
  });

  const [openTabs, setOpenTabs] = useState<string[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("glassos_vscode_open_tabs_v4");
      if (saved) {
        try { return JSON.parse(saved); } catch {}
      }
    }
    return ["src/App.tsx", "README.md"];
  });

  const [activeFile, setActiveFileState] = useState<string>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("glassos_vscode_active_file_v4");
      if (saved && files[saved] !== undefined) return saved;
    }
    return propActiveFile && files[propActiveFile] !== undefined
      ? propActiveFile
      : "src/App.tsx";
  });

  const setActiveFile = useCallback((file: string) => {
    setActiveFileState(file);
    if (propSetActiveFile) {
      propSetActiveFile(file);
    }
  }, [propSetActiveFile]);

  const [activeSidebarView, setActiveSidebarView] = useState<string>("explorer");
  const [currentDir, setCurrentDir] = useState<string>("/workspace");

  const [isTerminalOpen, setIsTerminalOpen] = useState(true);
  const [terminalTab, setTerminalTab] = useState<"terminal" | "output" | "problems">("terminal");
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);
  const [terminalLogs, setTerminalLogs] = useState<Array<{ type: "input" | "output" | "info" | "error"; text: string }>>([
    { type: "info", text: "GlassOS Terminal v1.0 (Client-side)" },
    { type: "info", text: "Type 'help' for available commands or 'run' to execute code." },
  ]);
  const [commandInput, setCommandInput] = useState("");
  const terminalEndRef = useRef<HTMLDivElement>(null);

  const [newFileInput, setNewFileInput] = useState("");
  const [isCreatingFile, setIsCreatingFile] = useState(false);
  const [renamingFile, setRenamingFile] = useState<string | null>(null);
  const [renameInput, setRenameInput] = useState("");

  const [searchQuery, setSearchQuery] = useState("");

  const [settings, setSettings] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("glassos_vscode_settings");
      if (saved) {
        try { return JSON.parse(saved); } catch {}
      }
    }
    return { fontSize: 13, minimap: true, wordWrap: true };
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("glassos_vscode_files_v4", JSON.stringify(files));
    }
  }, [files]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("glassos_vscode_open_tabs_v4", JSON.stringify(openTabs));
    }
  }, [openTabs]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("glassos_vscode_active_file_v4", activeFile);
    }
  }, [activeFile]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("glassos_vscode_settings", JSON.stringify(settings));
    }
  }, [settings]);

  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [terminalLogs]);

  const handleSelectFile = (filename: string) => {
    if (!openTabs.includes(filename)) {
      setOpenTabs([...openTabs, filename]);
    }
    setActiveFile(filename);
  };

  const handleCloseTab = (e: React.MouseEvent, filename: string) => {
    e.stopPropagation();
    const updatedTabs = openTabs.filter((t) => t !== filename);
    setOpenTabs(updatedTabs);
    if (activeFile === filename) {
      if (updatedTabs.length > 0) {
        setActiveFile(updatedTabs[updatedTabs.length - 1]);
      } else {
        setActiveFile("");
      }
    }
  };

  const handleCodeChange = (filename: string, content: string) => {
    setFiles((prev) => ({
      ...prev,
      [filename]: content,
    }));
  };

  const handleCreateFile = () => {
    const trimmed = newFileInput.trim();
    if (!trimmed) return;
    const path = trimmed.startsWith("src/") || trimmed.includes("/") ? trimmed : `src/${trimmed}`;
    if (files[path] !== undefined) {
      alert("File already exists.");
      return;
    }
    setFiles((prev) => ({
      ...prev,
      [path]: `// ${path}\n\nconsole.log("${path} initialized");\n`,
    }));
    setOpenTabs((prev) => (prev.includes(path) ? prev : [...prev, path]));
    setActiveFile(path);
    setNewFileInput("");
    setIsCreatingFile(false);
  };

  const handleDeleteFile = (e: React.MouseEvent, path: string) => {
    e.stopPropagation();
    if (Object.keys(files).length <= 1) {
      alert("Cannot delete the only file in the workspace.");
      return;
    }
    if (confirm(`Delete ${path}?`)) {
      const nextFiles = { ...files };
      delete nextFiles[path];
      setFiles(nextFiles);

      const nextTabs = openTabs.filter((t) => t !== path);
      setOpenTabs(nextTabs);
      if (activeFile === path) {
        setActiveFile(nextTabs[0] || Object.keys(nextFiles)[0]);
      }
    }
  };

  const handleStartRename = (e: React.MouseEvent, path: string) => {
    e.stopPropagation();
    setRenamingFile(path);
    setRenameInput(path);
  };

  const handleConfirmRename = () => {
    if (!renamingFile) return;
    const trimmed = renameInput.trim();
    if (!trimmed || trimmed === renamingFile) {
      setRenamingFile(null);
      return;
    }
    if (files[trimmed] !== undefined) {
      alert("A file with this name already exists.");
      return;
    }

    const content = files[renamingFile];
    const newFiles = { ...files };
    delete newFiles[renamingFile];
    newFiles[trimmed] = content;
    setFiles(newFiles);

    setOpenTabs((prev) => prev.map((t) => (t === renamingFile ? trimmed : t)));
    if (activeFile === renamingFile) {
      setActiveFile(trimmed);
    }
    setRenamingFile(null);
  };

  const handleResetWorkspace = () => {
    if (confirm("Reset workspace to initial template files?")) {
      setFiles(DEFAULT_FILES);
      setOpenTabs(["src/App.tsx", "README.md"]);
      setActiveFile("src/App.tsx");
      setTerminalLogs((prev) => [
        ...prev,
        { type: "info", text: "Workspace reset to defaults." },
      ]);
    }
  };

  const executeCode = (code: string) => {
    const logs: string[] = [];
    const customLog = (...args: any[]) => {
      logs.push(
        args
          .map((a) => (typeof a === "object" ? JSON.stringify(a, null, 2) : String(a)))
          .join(" ")
      );
    };

    try {
      let executableJs = code
        .replace(/^import\s+.*;/gm, "")
        .replace(/^export\s+/gm, "")
        .replace(/:\s*[A-Za-z0-9_<>[\]|&]+\b/g, "")
        .replace(/function\s+(\w+)\s*<.*?>/g, "function $1");

      const runner = new Function("console", executableJs);
      runner({
        log: customLog,
        warn: (...args: any[]) => customLog("[WARN]", ...args),
        error: (...args: any[]) => customLog("[ERROR]", ...args),
        info: customLog,
      });

      return { success: true, logs };
    } catch (err: any) {
      return { success: false, logs: [...logs, `Error: ${err?.message || String(err)}`] };
    }
  };

  // Comprehensive Terminal Commands Handler
  const handleTerminalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cmd = commandInput.trim();
    if (!cmd) return;

    setCommandHistory((prev) => [...prev, cmd]);
    setHistoryIndex(-1);

    const newLogs = [...terminalLogs, { type: "input" as const, text: `${currentDir} $ ${cmd}` }];
    
    // Parse arguments and redirection
    let commandStr = cmd;
    let redirectFile: string | null = null;
    let appendRedirect = false;

    if (commandStr.includes(">>")) {
      const parts = commandStr.split(">>");
      commandStr = parts[0].trim();
      redirectFile = parts[1].trim();
      appendRedirect = true;
    } else if (commandStr.includes(">")) {
      const parts = commandStr.split(">");
      commandStr = parts[0].trim();
      redirectFile = parts[1].trim();
    }

    const args = commandStr.split(/\s+/);
    const mainCmd = args[0].toLowerCase();

    const writeOrOutput = (text: string, type: "output" | "info" | "error" = "output") => {
      if (redirectFile) {
        const existing = files[redirectFile] || "";
        const updated = appendRedirect ? (existing ? existing + "\n" + text : text) : text;
        setFiles((prev) => ({ ...prev, [redirectFile!]: updated }));
        newLogs.push({ type: "info", text: `Wrote to ${redirectFile}` });
      } else {
        newLogs.push({ type, text });
      }
    };

    switch (mainCmd) {
      case "clear":
      case "cls":
        setTerminalLogs([]);
        setCommandInput("");
        return;

      case "pwd":
        writeOrOutput(currentDir);
        break;

      case "cd":
        {
          const target = args[1];
          if (!target || target === "~" || target === "/") {
            setCurrentDir("/workspace");
          } else if (target === "..") {
            if (currentDir !== "/workspace") {
              const parts = currentDir.split("/");
              parts.pop();
              setCurrentDir(parts.join("/") || "/workspace");
            }
          } else {
            const newPath = target.startsWith("/") ? target : `${currentDir}/${target}`;
            setCurrentDir(newPath);
          }
        }
        break;

      case "ls":
        {
          const fileKeys = Object.keys(files);
          if (fileKeys.length === 0) {
            writeOrOutput("(empty workspace)", "info");
          } else {
            fileKeys.forEach((f) => {
              writeOrOutput(`  ${f.padEnd(25)} ${files[f].length} bytes`);
            });
          }
        }
        break;

      case "cat":
        {
          const target = args[1];
          if (!target || files[target] === undefined) {
            newLogs.push({ type: "error", text: `cat: ${target || "filename"}: File not found` });
          } else {
            writeOrOutput(files[target]);
          }
        }
        break;

      case "mkdir":
        {
          const dirName = args[1];
          if (!dirName) {
            newLogs.push({ type: "error", text: "mkdir: missing directory name" });
          } else {
            writeOrOutput(`Directory '${dirName}' created`, "info");
          }
        }
        break;

      case "rmdir":
        {
          const dirName = args[1];
          if (!dirName) {
            newLogs.push({ type: "error", text: "rmdir: missing directory name" });
          } else {
            writeOrOutput(`Directory '${dirName}' removed`, "info");
          }
        }
        break;

      case "touch":
        {
          const target = args[1];
          if (!target) {
            newLogs.push({ type: "error", text: "touch: missing file parameter" });
          } else {
            setFiles((prev) => ({ ...prev, [target]: prev[target] ?? `// ${target}\n` }));
            newLogs.push({ type: "info", text: `Created ${target}` });
          }
        }
        break;

      case "rm":
        {
          const target = args[1];
          if (!target || files[target] === undefined) {
            newLogs.push({ type: "error", text: `rm: ${target || "filename"}: File not found` });
          } else {
            const nextFiles = { ...files };
            delete nextFiles[target];
            setFiles(nextFiles);
            setOpenTabs((prev) => prev.filter((t) => t !== target));
            newLogs.push({ type: "info", text: `Removed ${target}` });
          }
        }
        break;

      case "cp":
        {
          const src = args[1];
          const dest = args[2];
          if (!src || !dest || files[src] === undefined) {
            newLogs.push({ type: "error", text: "Usage: cp <source> <destination>" });
          } else {
            setFiles((prev) => ({ ...prev, [dest]: prev[src] }));
            newLogs.push({ type: "info", text: `Copied ${src} to ${dest}` });
          }
        }
        break;

      case "mv":
        {
          const src = args[1];
          const dest = args[2];
          if (!src || !dest || files[src] === undefined) {
            newLogs.push({ type: "error", text: "Usage: mv <source> <destination>" });
          } else {
            const content = files[src];
            const nextFiles = { ...files };
            delete nextFiles[src];
            nextFiles[dest] = content;
            setFiles(nextFiles);
            setOpenTabs((prev) => prev.map((t) => (t === src ? dest : t)));
            if (activeFile === src) setActiveFile(dest);
            newLogs.push({ type: "info", text: `Renamed ${src} to ${dest}` });
          }
        }
        break;

      case "echo":
        {
          const text = args.slice(1).join(" ").replace(/^["']|["']$/g, "");
          writeOrOutput(text);
        }
        break;

      case "grep":
        {
          const pattern = args[1];
          const target = args[2];
          if (!pattern) {
            newLogs.push({ type: "error", text: "Usage: grep <pattern> [file]" });
          } else {
            const targetFiles = target && files[target] ? [target] : Object.keys(files);
            let matchesCount = 0;
            targetFiles.forEach((filename) => {
              const lines = files[filename].split("\n");
              lines.forEach((line, index) => {
                if (line.includes(pattern)) {
                  matchesCount++;
                  writeOrOutput(`${filename}:${index + 1}: ${line.trim()}`);
                }
              });
            });
            if (matchesCount === 0) {
              newLogs.push({ type: "info", text: `No matches found for '${pattern}'` });
            }
          }
        }
        break;

      case "wc":
        {
          const target = args[1];
          if (!target || files[target] === undefined) {
            newLogs.push({ type: "error", text: `wc: ${target || "filename"}: File not found` });
          } else {
            const text = files[target];
            const lines = text.split("\n").length;
            const words = text.trim().split(/\s+/).filter(Boolean).length;
            const bytes = text.length;
            writeOrOutput(`  ${lines}  ${words}  ${bytes}  ${target}`);
          }
        }
        break;

      case "head":
        {
          const target = args[1];
          const numLines = args[2] === "-n" ? parseInt(args[3], 10) || 10 : 10;
          if (!target || files[target] === undefined) {
            newLogs.push({ type: "error", text: `head: ${target || "filename"}: File not found` });
          } else {
            const lines = files[target].split("\n").slice(0, numLines).join("\n");
            writeOrOutput(lines);
          }
        }
        break;

      case "tail":
        {
          const target = args[1];
          const numLines = args[2] === "-n" ? parseInt(args[3], 10) || 10 : 10;
          if (!target || files[target] === undefined) {
            newLogs.push({ type: "error", text: `tail: ${target || "filename"}: File not found` });
          } else {
            const allLines = files[target].split("\n");
            const lines = allLines.slice(Math.max(0, allLines.length - numLines)).join("\n");
            writeOrOutput(lines);
          }
        }
        break;

      case "find":
        {
          const query = args[1] || "";
          const matched = Object.keys(files).filter((f) => f.includes(query));
          if (matched.length === 0) {
            newLogs.push({ type: "info", text: "No files matched query." });
          } else {
            matched.forEach((f) => writeOrOutput(`  ${f}`));
          }
        }
        break;

      case "date":
        writeOrOutput(new Date().toString());
        break;

      case "env":
        writeOrOutput("NODE_ENV=production\nSHELL=/bin/bash\nPLATFORM=GlassOS\nTERM=xterm-256color");
        break;

      case "history":
        commandHistory.forEach((h, i) => writeOrOutput(`  ${i + 1}  ${h}`));
        break;

      case "reset":
        handleResetWorkspace();
        setCommandInput("");
        return;

      case "help":
        newLogs.push(
          { type: "info", text: "Terminal Commands:" },
          { type: "info", text: "  run [file]           Execute file JS/TS code" },
          { type: "info", text: "  node <file>          Execute specified JS file" },
          { type: "info", text: "  ls, pwd, cd [dir]    Navigate directory structure" },
          { type: "info", text: "  cat, touch, rm       File inspection and edits" },
          { type: "info", text: "  cp, mv               Copy or rename files" },
          { type: "info", text: "  echo <text> [> file] Print text or write to file" },
          { type: "info", text: "  grep, find, wc       Search and inspect content" },
          { type: "info", text: "  head, tail           View line subsets" },
          { type: "info", text: "  date, env, history   System tools" },
          { type: "info", text: "  clear, reset         Manage terminal state" }
        );
        break;

      case "run":
      case "node":
      case "npm":
        {
          const targetFile = args[1] || activeFile;
          if (!targetFile || files[targetFile] === undefined) {
            newLogs.push({ type: "error", text: `File '${targetFile || "none"}' not found.` });
          } else {
            newLogs.push({ type: "info", text: `[Executing] node ${targetFile}` });
            const res = executeCode(files[targetFile]);
            if (res.logs.length === 0) {
              newLogs.push({ type: "output", text: "(Executed with no output)" });
            } else {
              res.logs.forEach((logLine) => {
                newLogs.push({
                  type: logLine.startsWith("Error:") ? "error" : "output",
                  text: logLine,
                });
              });
            }
          }
        }
        break;

      default:
        newLogs.push({
          type: "error",
          text: `Command '${mainCmd}' not found. Type 'help' for commands.`,
        });
        break;
    }

    setTerminalLogs(newLogs);
    setCommandInput("");
  };

  const handleKeyDownTerminal = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowUp") {
      e.preventDefault();
      if (commandHistory.length > 0) {
        const nextIdx = historyIndex < commandHistory.length - 1 ? historyIndex + 1 : historyIndex;
        setHistoryIndex(nextIdx);
        setCommandInput(commandHistory[commandHistory.length - 1 - nextIdx] || "");
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (historyIndex > 0) {
        const nextIdx = historyIndex - 1;
        setHistoryIndex(nextIdx);
        setCommandInput(commandHistory[commandHistory.length - 1 - nextIdx] || "");
      } else if (historyIndex === 0) {
        setHistoryIndex(-1);
        setCommandInput("");
      }
    }
  };

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const results: Array<{ file: string; line: number; text: string }> = [];
    const q = searchQuery.toLowerCase();

    Object.entries(files).forEach(([filename, content]) => {
      const lines = content.split("\n");
      lines.forEach((line, index) => {
        if (line.toLowerCase().includes(q)) {
          results.push({ file: filename, line: index + 1, text: line.trim() });
        }
      });
    });
    return results;
  }, [files, searchQuery]);

  return (
    <div className="flex flex-col flex-1 h-full w-full bg-[#1e1e1e] text-white font-sans text-xs select-none overflow-hidden border border-white/10 rounded-b-lg shadow-2xl">
      {/* Top Menubar */}
      <div className="flex items-center justify-between bg-[#323233] px-3 py-1 border-b border-[#252526] text-white/80 h-8 shrink-0 text-xs">
        <div className="flex items-center gap-3">
          <Icon icon="vscode-icons:file-type-vscode" width={16} />
          <div className="flex items-center gap-2 font-normal text-white/70">
            <span className="hover:text-white cursor-pointer px-1 py-0.5 rounded hover:bg-white/10">File</span>
            <span className="hover:text-white cursor-pointer px-1 py-0.5 rounded hover:bg-white/10">Edit</span>
            <span className="hover:text-white cursor-pointer px-1 py-0.5 rounded hover:bg-white/10">Selection</span>
            <span className="hover:text-white cursor-pointer px-1 py-0.5 rounded hover:bg-white/10">View</span>
            <span className="hover:text-white cursor-pointer px-1 py-0.5 rounded hover:bg-white/10" onClick={() => setIsTerminalOpen(!isTerminalOpen)}>Terminal</span>
            <span className="hover:text-white cursor-pointer px-1 py-0.5 rounded hover:bg-white/10">Help</span>
          </div>
        </div>
        <div className="text-[#888888] font-mono text-[11px] truncate max-w-md">
          {activeFile ? `${activeFile} - GlassOS VS Code` : "GlassOS VS Code"}
        </div>
        <div className="flex items-center gap-2 text-white/60">
          <button
            onClick={() => setIsTerminalOpen(!isTerminalOpen)}
            className="hover:text-white p-1 rounded hover:bg-white/10 transition-colors"
            title="Toggle Terminal"
          >
            <Icon icon="mdi:terminal" width={14} />
          </button>
        </div>
      </div>

      {/* Main Workspace Area */}
      <div className="flex flex-1 min-h-0 relative">
        {/* Left Activity Bar */}
        <div className="flex flex-col items-center bg-[#333333] border-r border-[#252526] w-12 shrink-0 py-2 gap-4 text-white/50">
          <button
            onClick={() => setActiveSidebarView("explorer")}
            className={`p-2 rounded hover:text-white transition-colors relative ${
              activeSidebarView === "explorer" ? "text-white border-l-2 border-blue-500 bg-[#252526]" : ""
            }`}
            title="Explorer"
          >
            <Icon icon="mdi:folder-multiple-outline" width={22} />
          </button>
          <button
            onClick={() => setActiveSidebarView("search")}
            className={`p-2 rounded hover:text-white transition-colors ${
              activeSidebarView === "search" ? "text-white border-l-2 border-blue-500 bg-[#252526]" : ""
            }`}
            title="Search"
          >
            <Icon icon="mdi:magnify" width={22} />
          </button>
          <button
            onClick={() => setActiveSidebarView("git")}
            className={`p-2 rounded hover:text-white transition-colors ${
              activeSidebarView === "git" ? "text-white border-l-2 border-blue-500 bg-[#252526]" : ""
            }`}
            title="Source Control"
          >
            <Icon icon="mdi:source-branch" width={22} />
          </button>
          <button
            onClick={() => setActiveSidebarView("extensions")}
            className={`p-2 rounded hover:text-white transition-colors ${
              activeSidebarView === "extensions" ? "text-white border-l-2 border-blue-500 bg-[#252526]" : ""
            }`}
            title="Extensions"
          >
            <Icon icon="mdi:view-grid-plus-outline" width={22} />
          </button>
          <div className="flex-1" />
          <button
            onClick={() => setActiveSidebarView("settings")}
            className={`p-2 rounded hover:text-white transition-colors ${
              activeSidebarView === "settings" ? "text-white border-l-2 border-blue-500 bg-[#252526]" : ""
            }`}
            title="Settings"
          >
            <Icon icon="mdi:cog-outline" width={22} />
          </button>
        </div>

        {/* Sidebar Panel */}
        <div className="flex flex-col bg-[#252526] border-r border-[#1e1e1e] w-60 shrink-0 overflow-y-auto">
          {activeSidebarView === "explorer" && (
            <div className="flex flex-col flex-1">
              <div className="flex items-center justify-between px-3 py-2 text-[11px] font-bold text-white/50 uppercase tracking-wider">
                <span>Explorer</span>
                <div className="flex items-center gap-1.5 text-white/60">
                  <button
                    onClick={() => setIsCreatingFile(true)}
                    className="hover:text-white p-0.5 rounded hover:bg-white/10"
                    title="New file"
                  >
                    <Icon icon="mdi:file-plus-outline" width={16} />
                  </button>
                  <button
                    onClick={handleResetWorkspace}
                    className="hover:text-white p-0.5 rounded hover:bg-white/10"
                    title="Reset workspace"
                  >
                    <Icon icon="mdi:refresh" width={16} />
                  </button>
                </div>
              </div>

              {isCreatingFile && (
                <div className="px-3 py-2 bg-[#1e1e1e] border-b border-blue-500/50">
                  <input
                    type="text"
                    placeholder="Filename"
                    value={newFileInput}
                    onChange={(e) => setNewFileInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleCreateFile();
                      if (e.key === "Escape") setIsCreatingFile(false);
                    }}
                    autoFocus
                    className="w-full bg-[#2a2a2d] border border-blue-500 px-2 py-1 text-white text-xs outline-none rounded"
                  />
                </div>
              )}

              <div className="flex flex-col gap-0.5 p-1">
                {Object.keys(files).map((filename) => {
                  const iconInfo = getFileIcon(filename);
                  const isRenaming = renamingFile === filename;

                  if (isRenaming) {
                    return (
                      <div key={filename} className="px-2 py-1 bg-[#1e1e1e] border border-blue-500 rounded">
                        <input
                          type="text"
                          value={renameInput}
                          onChange={(e) => setRenameInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleConfirmRename();
                            if (e.key === "Escape") setRenamingFile(null);
                          }}
                          autoFocus
                          className="w-full bg-transparent text-white text-xs outline-none"
                        />
                      </div>
                    );
                  }

                  return (
                    <div
                      key={filename}
                      onClick={() => handleSelectFile(filename)}
                      className={`group flex items-center justify-between px-3 py-1.5 rounded cursor-pointer transition-all ${
                        activeFile === filename
                          ? "bg-[#37373d] text-white font-medium"
                          : "text-white/70 hover:bg-[#2a2a2b] hover:text-white"
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0 truncate">
                        <Icon icon={iconInfo.icon} width={16} className="shrink-0" />
                        <span className="truncate text-xs">{filename}</span>
                      </div>
                      <div className="hidden group-hover:flex items-center gap-1 text-white/50">
                        <button
                          onClick={(e) => handleStartRename(e, filename)}
                          className="hover:text-white p-0.5 hover:bg-white/10 rounded"
                          title="Rename"
                        >
                          <Icon icon="mdi:pencil-outline" width={13} />
                        </button>
                        <button
                          onClick={(e) => handleDeleteFile(e, filename)}
                          className="hover:text-red-400 p-0.5 hover:bg-white/10 rounded"
                          title="Delete"
                        >
                          <Icon icon="mdi:trash-can-outline" width={13} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeSidebarView === "search" && (
            <div className="flex flex-col p-3 gap-3">
              <div className="font-bold text-[11px] text-white/50 uppercase tracking-wider">Search</div>
              <input
                type="text"
                placeholder="Search files"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#1e1e1e] border border-white/10 rounded px-2 py-1.5 text-xs text-white outline-none"
              />
              <div className="flex flex-col gap-2 mt-1">
                {searchQuery.trim() && (
                  <div className="text-[11px] text-white/50">
                    {searchResults.length} results
                  </div>
                )}
                {searchResults.map((res, i) => (
                  <div
                    key={i}
                    onClick={() => handleSelectFile(res.file)}
                    className="p-2 bg-[#1e1e1e]/60 hover:bg-[#37373d] rounded cursor-pointer border border-white/5 flex flex-col gap-1"
                  >
                    <div className="flex items-center justify-between text-blue-400 font-mono text-[11px]">
                      <span>{res.file}</span>
                      <span className="text-white/40">L{res.line}</span>
                    </div>
                    <div className="text-white/80 font-mono text-[11px] truncate">{res.text}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeSidebarView === "git" && (
            <div className="flex flex-col p-3 gap-3">
              <div className="font-bold text-[11px] text-white/50 uppercase tracking-wider">Source Control</div>
              <div className="flex items-center justify-between p-2 bg-[#1e1e1e] rounded text-white/80">
                <div className="flex items-center gap-2">
                  <Icon icon="mdi:source-branch" width={16} className="text-blue-400" />
                  <span>main</span>
                </div>
                <span className="text-emerald-400 font-mono text-[10px] bg-emerald-950/50 px-2 py-0.5 rounded">Clean</span>
              </div>
            </div>
          )}

          {activeSidebarView === "extensions" && (
            <div className="flex flex-col p-3 gap-3">
              <div className="font-bold text-[11px] text-white/50 uppercase tracking-wider">Extensions</div>
              {[
                { name: "Monaco Language Client", status: "Enabled", icon: "vscode-icons:file-type-vscode" },
                { name: "Prettier Formatter", status: "Enabled", icon: "vscode-icons:file-type-prettier" },
                { name: "TypeScript Intellisense", status: "Enabled", icon: "vscode-icons:file-type-typescript-official" },
              ].map((ext, idx) => (
                <div key={idx} className="flex items-center gap-3 p-2 bg-[#1e1e1e] rounded border border-white/5">
                  <Icon icon={ext.icon} width={22} />
                  <div className="flex flex-col min-w-0 flex-1">
                    <span className="font-medium truncate">{ext.name}</span>
                    <span className="text-[10px] text-emerald-400">{ext.status}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeSidebarView === "settings" && (
            <div className="flex flex-col p-3 gap-4">
              <div className="font-bold text-[11px] text-white/50 uppercase tracking-wider">Settings</div>
              <div className="flex items-center justify-between">
                <span>Minimap</span>
                <input
                  type="checkbox"
                  checked={settings.minimap}
                  onChange={(e) => setSettings({ ...settings, minimap: e.target.checked })}
                  className="accent-blue-500 cursor-pointer"
                />
              </div>
              <div className="flex items-center justify-between">
                <span>Word Wrap</span>
                <input
                  type="checkbox"
                  checked={settings.wordWrap}
                  onChange={(e) => setSettings({ ...settings, wordWrap: e.target.checked })}
                  className="accent-blue-500 cursor-pointer"
                />
              </div>
              <div className="flex flex-col gap-1">
                <div className="flex justify-between">
                  <span>Font Size</span>
                  <span className="font-mono text-blue-400">{settings.fontSize}px</span>
                </div>
                <input
                  type="range"
                  min="11"
                  max="20"
                  value={settings.fontSize}
                  onChange={(e) => setSettings({ ...settings, fontSize: Number(e.target.value) })}
                  className="accent-blue-500 cursor-pointer"
                />
              </div>
            </div>
          )}
        </div>

        {/* Code Editor Container */}
        <div className="flex flex-col flex-1 min-w-0 bg-[#1e1e1e] h-full overflow-hidden">
          {/* Tab Bar */}
          <div className="flex items-center bg-[#252526] border-b border-[#1e1e1e] h-9 shrink-0 overflow-x-auto select-none">
            {openTabs.map((tab) => {
              const iconInfo = getFileIcon(tab);
              const isActive = activeFile === tab;

              return (
                <div
                  key={tab}
                  onClick={() => handleSelectFile(tab)}
                  className={`group flex items-center gap-2 px-3 h-full border-r border-[#1e1e1e] text-xs cursor-pointer min-w-30 max-w-50 transition-colors relative ${
                    isActive ? "bg-[#1e1e1e] text-white font-medium border-t-2 border-t-blue-500" : "bg-[#2d2d2d]/60 text-white/60 hover:bg-[#2a2a2b]"
                  }`}
                >
                  <Icon icon={iconInfo.icon} width={14} className="shrink-0" />
                  <span className="truncate flex-1">{tab.split("/").pop()}</span>
                  <button
                    onClick={(e) => handleCloseTab(e, tab)}
                    className="hover:text-white p-0.5 rounded hover:bg-white/20 opacity-60 group-hover:opacity-100 transition-opacity"
                  >
                    <Icon icon="mdi:close" width={12} />
                  </button>
                </div>
              );
            })}
          </div>

          {/* Monaco Editor */}
          <div className="flex-1 min-h-0 relative bg-[#1e1e1e]">
            {activeFile && files[activeFile] !== undefined ? (
              <Editor
                height="100%"
                language={getLanguageFromPath(activeFile)}
                theme="vs-dark"
                value={files[activeFile]}
                onChange={(value) => handleCodeChange(activeFile, value ?? "")}
                options={{
                  fontSize: settings.fontSize,
                  minimap: { enabled: settings.minimap },
                  wordWrap: settings.wordWrap ? "on" : "off",
                  automaticLayout: true,
                  scrollBeyondLastLine: false,
                  tabSize: 2,
                  fontFamily: "'Fira Code', Consolas, monospace",
                  cursorBlinking: "smooth",
                  renderLineHighlight: "all",
                  padding: { top: 12 },
                }}
              />
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-white/30 gap-2 select-none">
                <Icon icon="vscode-icons:file-type-vscode" width={56} className="opacity-40" />
                <span>Select a file to open</span>
              </div>
            )}
          </div>

          {/* Terminal Panel */}
          {isTerminalOpen && (
            <div className="flex flex-col bg-[#1e1e1e] border-t border-[#2d2d2d] h-48 shrink-0 font-mono text-xs">
              <div className="flex items-center justify-between bg-[#252526] px-3 py-1 text-white/60 border-b border-white/5 select-none">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setTerminalTab("terminal")}
                    className={`font-semibold uppercase tracking-wider hover:text-white transition-colors ${
                      terminalTab === "terminal" ? "text-white border-b-2 border-blue-500 pb-0.5" : ""
                    }`}
                  >
                    Terminal
                  </button>
                  <button
                    onClick={() => setTerminalTab("output")}
                    className={`font-semibold uppercase tracking-wider hover:text-white transition-colors ${
                      terminalTab === "output" ? "text-white border-b-2 border-blue-500 pb-0.5" : ""
                    }`}
                  >
                    Output
                  </button>
                  <button
                    onClick={() => setTerminalTab("problems")}
                    className={`font-semibold uppercase tracking-wider hover:text-white transition-colors ${
                      terminalTab === "problems" ? "text-white border-b-2 border-blue-500 pb-0.5" : ""
                    }`}
                  >
                    Problems (0)
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setTerminalLogs([])}
                    className="hover:text-white p-1 rounded hover:bg-white/10"
                    title="Clear terminal"
                  >
                    <Icon icon="mdi:cancel" width={14} />
                  </button>
                  <button
                    onClick={() => setIsTerminalOpen(false)}
                    className="hover:text-white p-1 rounded hover:bg-white/10"
                    title="Close terminal"
                  >
                    <Icon icon="mdi:close" width={14} />
                  </button>
                </div>
              </div>

              {terminalTab === "terminal" && (
                <div className="flex flex-col flex-1 p-3 overflow-y-auto gap-1 bg-[#1e1e1e]">
                  {terminalLogs.map((log, index) => (
                    <div
                      key={index}
                      className={`whitespace-pre-wrap leading-relaxed ${
                        log.type === "input"
                          ? "text-blue-400 font-bold"
                          : log.type === "info"
                          ? "text-gray-400"
                          : log.type === "error"
                          ? "text-red-400"
                          : "text-emerald-400"
                      }`}
                    >
                      {log.text}
                    </div>
                  ))}
                  <div ref={terminalEndRef} />
                  <form onSubmit={handleTerminalSubmit} className="flex items-center gap-2 mt-1">
                    <span className="text-blue-400 font-bold">$</span>
                    <input
                      type="text"
                      value={commandInput}
                      onChange={(e) => setCommandInput(e.target.value)}
                      onKeyDown={handleKeyDownTerminal}
                      placeholder="Type 'help' or 'run'..."
                      className="flex-1 bg-transparent text-white outline-none border-none font-mono"
                    />
                  </form>
                </div>
              )}

              {terminalTab === "output" && (
                <div className="p-3 text-white/60">
                  Ready. Console output is routed to Terminal.
                </div>
              )}

              {terminalTab === "problems" && (
                <div className="p-3 text-white/50 flex items-center gap-2">
                  <Icon icon="mdi:check-circle-outline" width={16} className="text-emerald-500" />
                  <span>No problems detected.</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Status Bar */}
      <div className="flex items-center justify-between bg-[#007acc] px-3 py-1 text-white text-[11px] font-mono h-6 shrink-0 select-none">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 bg-black/10 px-1.5 py-0.5 rounded cursor-pointer hover:bg-black/20">
            <Icon icon="mdi:source-branch" width={13} />
            <span>main*</span>
          </div>
          <div className="flex items-center gap-1">
            <Icon icon="mdi:close-circle-outline" width={13} />
            <span>0</span>
            <Icon icon="mdi:alert-outline" width={13} className="ml-1" />
            <span>0</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <span>Ln 1, Col 1</span>
          <span>Spaces: 2</span>
          <span>UTF-8</span>
          <span className="capitalize font-semibold">{getLanguageFromPath(activeFile)}</span>
          <div className="flex items-center gap-1">
            <Icon icon="mdi:check-all" width={13} />
            <span>Prettier</span>
          </div>
        </div>
      </div>
    </div>
  );
}
