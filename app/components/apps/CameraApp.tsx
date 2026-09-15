"use client";

import React, { RefObject } from "react";
import { FaCamera, FaDownload } from "react-icons/fa6";
import { FaRedo } from "react-icons/fa";

type CameraAppProps = {
  cameraId: string;
  setCameraId: (id: string) => void;
  devices: MediaDeviceInfo[];
  photo: string | null;
  videoRef: RefObject<HTMLVideoElement | null>;
  canvasRef: RefObject<HTMLCanvasElement | null>;
  capture: () => void;
  retake: () => void;
  download: () => void;
};

export default function CameraApp({
  cameraId,
  setCameraId,
  devices,
  photo,
  videoRef,
  canvasRef,
  capture,
  retake,
  download,
}: CameraAppProps) {
  return (
    <div className="flex flex-col flex-1 gap-4 bg-amber-50/5 backdrop-blur-md p-4 overflow-hidden text-stone-100">
      <select
        className="bg-black/40 p-2 rounded"
        value={cameraId}
        onChange={(e) => setCameraId(e.target.value)}
      >
        {devices.map((d, i) => (
          <option key={d.deviceId} value={d.deviceId}>
            {d.label || `Camera ${i + 1}`}
          </option>
        ))}
      </select>

      <div className="flex flex-1 justify-center items-center rounded-xl overflow-hidden">
        {photo ? (
          <img
            src={photo}
            alt="Captured"
            className="rounded-xl w-full h-full object-contain"
          />
        ) : (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="rounded-xl w-full h-full object-cover aspect-video"
          />
        )}
      </div>

      <canvas ref={canvasRef} className="hidden" />

      <div className="flex justify-center gap-3">
        {!photo ? (
          <button
            onClick={capture}
            className="bg-white p-4 rounded-full text-black"
          >
            <FaCamera />
          </button>
        ) : (
          <>
            <button
              onClick={retake}
              className="bg-yellow-500 p-4 rounded-full"
            >
              <FaRedo />
            </button>

            <button
              onClick={download}
              className="bg-green-600 p-4 rounded-full"
            >
              <FaDownload />
            </button>
          </>
        )}
      </div>
    </div>
  );
}
