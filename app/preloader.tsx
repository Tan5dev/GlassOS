"use client";

import { useEffect, useState, useRef } from "react";

export function Preloader() {
    const [loading, setLoading] = useState(true);
    const [memCount, setMemCount] = useState(0);
    const [biosStage, setBiosStage] = useState(0);
    const [dismissed, setDismissed] = useState(false);
    const logsEndRef = useRef<HTMLDivElement>(null);

    const handleFinish = () => {
        setLoading(false);
        setTimeout(() => {
            setDismissed(true);
        }, 500);
    };

    useEffect(() => {
        const handleKeyDown = () => {
            handleFinish();
        };
        window.addEventListener("keydown", handleKeyDown);

        const memInterval = setInterval(() => {
            setMemCount((prev) => {
                if (prev >= 32768) {
                    clearInterval(memInterval);
                    return 32768;
                }
                return Math.min(prev + 4096, 32768);
            });
        }, 50);

        const stageInterval = setInterval(() => {
            setBiosStage((prev) => {
                const next = prev + 1;
                if (next >= 11) {
                    clearInterval(stageInterval);
                    setTimeout(() => {
                        handleFinish();
                    }, 600);
                }
                return next;
            });
        }, 220);

        return () => {
            window.removeEventListener("keydown", handleKeyDown);
            clearInterval(memInterval);
            clearInterval(stageInterval);
        };
    }, []);

    useEffect(() => {
        logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [biosStage, memCount]);

    if (dismissed) return null;

    return (
        <div
            className={`fixed inset-0 z-999999 w-screen h-screen bg-black text-[#d0d0d0] font-mono text-sm sm:text-base select-none p-6 sm:p-12 overflow-hidden flex flex-col justify-between transition-opacity duration-500 ${loading ? "opacity-100" : "pointer-events-none opacity-0"
                }`}
        >
            <div className="space-y-4 max-w-5xl leading-relaxed">
                <div>
                    <div className="font-bold text-white text-base sm:text-lg tracking-wider">
                        GlassOS
                    </div>
                </div>

                <div className="space-y-1 text-white/90">
                    <div>CPU : Octa-Core Processor @ 4.20 GHz</div>
                    <div>Speed : 4200 MHz</div>
                    <div>RAM Frequency : 6400 MHz (LPDDR5X Quad-Channel)</div>
                    <div className="font-semibold text-emerald-400">
                        Memory Testing : {memCount.toLocaleString()} MB OK
                    </div>
                </div>

                <div className="space-y-1 pt-2 font-mono">
                    {biosStage >= 1 && (
                        <div>Primary Master   : NVMe Drive 2TB PCIe 5.0</div>
                    )}
                    {biosStage >= 2 && (
                        <div>Primary Slave    : None</div>
                    )}
                    {biosStage >= 3 && (
                        <div>Secondary Master : USB Flash Disk 3.0</div>
                    )}
                    {biosStage >= 4 && (
                        <div className="text-white/60">
                            USB Devices Total: 1 Keyboard, 1 Mouse, 0 Hubs, 1 Storage Device
                        </div>
                    )}
                    {biosStage >= 5 && (
                        <div>Initializing USB Controllers .. Done.</div>
                    )}
                    {biosStage >= 6 && (
                        <div>Checking NVMe SMART Status ... OK</div>
                    )}
                    {biosStage >= 7 && (
                        <div>Mounting Root Virtual File System ... Done</div>
                    )}
                    {biosStage >= 8 && (
                        <div>Initializing Graphics Compositor & Shaders ... OK</div>
                    )}
                    {biosStage >= 9 && (
                        <div>Loading Window Manager & System Services ... Ready</div>
                    )}
                    {biosStage >= 10 && (
                        <div className="pt-2 font-bold text-cyan-400">
                            Booting Operating System Kernel...
                        </div>
                    )}
                    {biosStage < 10 && (
                        <div className="inline-block bg-white w-2.5 h-4 animate-pulse" />
                    )}
                </div>
                <div ref={logsEndRef} />
            </div>
        </div>
    );
}


