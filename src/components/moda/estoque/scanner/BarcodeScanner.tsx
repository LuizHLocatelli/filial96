import { useEffect, useRef, useState } from "react";
import { BrowserMultiFormatReader, IScannerControls } from "@zxing/browser";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Flashlight, Camera, Pause, Play } from "lucide-react";

interface BarcodeScannerProps {
  enabled: boolean;
  onEnabledChange?: (value: boolean) => void;
  onDetected: (code: string) => void;
  allowedLengths?: number[]; // e.g., [6, 9]
  className?: string;
}

export function BarcodeScanner({
  enabled,
  onEnabledChange,
  onDetected,
  allowedLengths = [6, 9],
  className,
}: BarcodeScannerProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const readerRef = useRef<BrowserMultiFormatReader | null>(null);
  const controlsRef = useRef<IScannerControls | null>(null);
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [deviceId, setDeviceId] = useState<string | undefined>(undefined);
  const [isTorchOn, setIsTorchOn] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const pauseTimerRef = useRef<number | null>(null);

  // Load devices
  useEffect(() => {
    (async () => {
      try {
        const medias = await navigator.mediaDevices.enumerateDevices();
        const videoInputs = medias.filter((d) => d.kind === "videoinput");
        setDevices(videoInputs);
        // try to pick back camera first
        const back = videoInputs.find((d) => /back|traseira|rear/i.test(d.label));
        setDeviceId(back?.deviceId || videoInputs[0]?.deviceId);
      } catch (e) {
        // ignore
      }
    })();
  }, []);

  // Start/stop scanner
  useEffect(() => {
    if (!enabled || !deviceId) {
      stopScanner();
      return;
    }
    startScanner(deviceId);
    return () => stopScanner();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, deviceId]);

  const startScanner = async (devId: string) => {
    if (!videoRef.current) return;
    if (!readerRef.current) readerRef.current = new BrowserMultiFormatReader();

    try {
      controlsRef.current = await readerRef.current.decodeFromVideoDevice(
        devId,
        videoRef.current,
        (result, err, controls) => {
          if (result) {
            const text = (result.getText?.() || result.text || "").trim();
            const numeric = text.replace(/\D/g, "");
            const isAllowed = allowedLengths.includes(numeric.length);
            if (numeric && isAllowed) {
              // Pause quickly to avoid duplicate rapid fires
              if (!isPaused) {
                setIsPaused(true);
                onDetected(numeric);
                // brief pause before resuming to prevent burst duplicates
                pauseTimerRef.current = window.setTimeout(() => {
                  setIsPaused(false);
                }, 900);
              }
            }
          }
        }
      );
    } catch (e) {
      // could not start
    }
  };

  const stopScanner = () => {
    try {
      controlsRef.current?.stop();
      controlsRef.current = null;
    } catch {}
    if (pauseTimerRef.current) {
      clearTimeout(pauseTimerRef.current);
      pauseTimerRef.current = null;
    }
  };

  // Torch toggle (best-effort)
  const toggleTorch = async () => {
    const stream = videoRef.current?.srcObject as MediaStream | null;
    const track = stream?.getVideoTracks?.()[0];
    if (!track) return;
    // @ts-ignore advanced constraints types vary by browser
    const supported = track.getCapabilities?.();
    if (supported && (supported as any).torch) {
      try {
        // @ts-ignore
        await track.applyConstraints({ advanced: [{ torch: !isTorchOn }] });
        setIsTorchOn((v) => !v);
      } catch (e) {
        // ignore
      }
    }
  };

  return (
    <div className={`space-y-3 ${className || ""}`}>
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Camera className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium">Leitor de Códigos (Câmera)</span>
          <Badge variant="secondary" className="ml-1 text-xs">6 ou 9 dígitos</Badge>
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onEnabledChange?.(!enabled)}
          >
            {enabled ? <Pause className="h-4 w-4 mr-1" /> : <Play className="h-4 w-4 mr-1" />}
            {enabled ? "Pausar" : "Iniciar"}
          </Button>
          <Button type="button" variant="outline" size="sm" onClick={toggleTorch}>
            <Flashlight className="h-4 w-4 mr-1" />
            Lanterna
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        <div className="sm:col-span-1">
          <Select value={deviceId} onValueChange={setDeviceId}>
            <SelectTrigger className="h-9">
              <SelectValue placeholder="Câmera" />
            </SelectTrigger>
            <SelectContent>
              {devices.map((d) => (
                <SelectItem key={d.deviceId} value={d.deviceId}>
                  {d.label || `Câmera ${d.deviceId.slice(0, 4)}`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="relative w-full aspect-[4/3] rounded-lg overflow-hidden glass-card border border-border/30">
        <video ref={videoRef} className="w-full h-full object-cover" playsInline muted />
        {/* overlay */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 border-2 border-primary/30 rounded-lg m-6" />
        </div>
      </div>
    </div>
  );
}
