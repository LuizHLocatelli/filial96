import { useRef, useState, useCallback, useEffect } from 'react';
import { BrowserMultiFormatReader, IScannerControls } from '@zxing/browser';
import { DecodeHintType, BarcodeFormat } from '@zxing/library';
import { ScannerState, ScannerError, SCANNER_CONFIG } from './BarcodeScanner.config';

interface UseBarcodeScannerProps {
  onScan: (code: string, format: string) => void;
  onError?: (error: ScannerError) => void;
}

export function useBarcodeScanner({ onScan, onError }: UseBarcodeScannerProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const readerRef = useRef<BrowserMultiFormatReader | null>(null);
  const controlsRef = useRef<IScannerControls | null>(null);
  const lastScanRef = useRef<{ code: string; time: number } | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const currentDeviceIdRef = useRef<string | null>(null);

  const [state, setState] = useState<ScannerState>({
    isInitialized: false,
    isScanning: false,
    hasPermission: null,
    selectedDevice: null,
    availableDevices: [],
    lastScannedCode: null,
    error: null
  });

  const createScannerError = (type: ScannerError['type'], message: string, recoverable: boolean, action?: string, onAction?: () => void): ScannerError => ({
    type,
    message,
    recoverable,
    action,
    onAction
  });

  const playBeep = useCallback(() => {
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioContextRef.current;
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.frequency.value = SCANNER_CONFIG.BEEP_FREQUENCY;
      oscillator.type = 'sine';
      gainNode.gain.setValueAtTime(0.15, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + SCANNER_CONFIG.BEEP_DURATION / 1000);

      oscillator.start();
      oscillator.stop(ctx.currentTime + SCANNER_CONFIG.BEEP_DURATION / 1000);
    } catch {
      console.warn('Failed to play beep');
    }
  }, []);

  const cleanupReader = useCallback(() => {
    if (controlsRef.current) {
      try {
        controlsRef.current.stop();
      } catch {}
      controlsRef.current = null;
    }
    if (videoRef.current?.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
  }, []);

  const initialize = useCallback(async () => {
    try {
      const hints = new Map();
      hints.set(DecodeHintType.POSSIBLE_FORMATS, [
        BarcodeFormat.EAN_13,
        BarcodeFormat.EAN_8,
        BarcodeFormat.UPC_A,
        BarcodeFormat.UPC_E,
        BarcodeFormat.CODE_128,
        BarcodeFormat.CODE_39
      ]);

      readerRef.current = new BrowserMultiFormatReader(hints);

      let devices: MediaDeviceInfo[] = [];
      try {
        const allDevices = await navigator.mediaDevices.enumerateDevices();
        devices = allDevices.filter(d => d.kind === 'videoinput' && d.deviceId && d.deviceId.trim() !== '');
      } catch {
        console.warn('enumerateDevices not available');
      }

      const backCamera = devices.find(d =>
        /back|rear|traseira|environment/i.test(d.label || '')
      );

      const devicesList = devices.map(d => ({
        deviceId: d.deviceId,
        label: d.label || `Câmera ${d.deviceId.slice(0, 8)}`
      }));

      setState(prev => ({
        ...prev,
        isInitialized: true,
        availableDevices: devicesList,
        selectedDevice: backCamera?.deviceId || devicesList[0]?.deviceId || null
      }));
    } catch {
      setState(prev => ({
        ...prev,
        isInitialized: true,
        availableDevices: [],
        selectedDevice: null
      }));
    }
  }, []);

  const getDefaultConstraints = (deviceId?: string) => {
    if (deviceId) {
      return { deviceId: { exact: deviceId }, ...SCANNER_CONFIG.VIDEO_CONSTRAINTS };
    }
    return {
      ...SCANNER_CONFIG.VIDEO_CONSTRAINTS,
      facingMode: 'environment'
    };
  };

  const startScanning = useCallback(async (deviceId?: string) => {
    if (!readerRef.current || !videoRef.current) return;
    const targetDeviceId = deviceId || state.selectedDevice || undefined;

    if (currentDeviceIdRef.current === targetDeviceId && state.isScanning) return;

    cleanupReader();
    currentDeviceIdRef.current = targetDeviceId;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: getDefaultConstraints(targetDeviceId)
      });

      videoRef.current.srcObject = stream;
      await videoRef.current.play();

      controlsRef.current = await readerRef.current.decodeFromVideoDevice(
        targetDeviceId || undefined,
        videoRef.current,
        (result, err) => {
          if (result) {
            const code = result.getText().trim();
            const numericCode = code.replace(/\D/g, '');
            const format = result.getBarcodeFormat().toString();

            if (SCANNER_CONFIG.VALID_LENGTHS.includes(numericCode.length as 6 | 9)) {
              const now = Date.now();

              if (
                !lastScanRef.current ||
                lastScanRef.current.code !== numericCode ||
                now - lastScanRef.current.time > SCANNER_CONFIG.SCAN_DEBOUNCE
              ) {
                lastScanRef.current = { code: numericCode, time: now };
                setState(prev => ({ ...prev, lastScannedCode: numericCode }));
                playBeep();
                onScan(numericCode, format);
              }
            }
          }
          if (err && !(err instanceof Error && err.name === 'NotFoundException')) {
          }
        }
      );

      setState(prev => ({
        ...prev,
        isScanning: true,
        hasPermission: true,
        error: null
      }));
    } catch (error: any) {
      if (error.name === 'NotAllowedError') {
        const err = createScannerError(
          'permission',
          'Acesso à câmera foi negado. Por favor, habilite nas configurações.',
          false,
          'Abrir Configurações',
          () => { alert('Para habilitar a câmera, acesse as configurações do seu dispositivo.'); }
        );
        setState(prev => ({ ...prev, hasPermission: false, error: err }));
        onError?.(err);
      } else if (error.name === 'NotReadableError') {
        const err = createScannerError(
          'camera',
          'Câmera está em uso por outro aplicativo.',
          true,
          'Tentar novamente',
          () => startScanning(targetDeviceId)
        );
        setState(prev => ({ ...prev, error: err }));
        onError?.(err);
      } else {
        const err = createScannerError(
          'camera',
          'Não foi possível acessar a câmera.',
          true,
          'Tentar novamente',
          () => startScanning(targetDeviceId)
        );
        setState(prev => ({ ...prev, error: err }));
        onError?.(err);
      }
    }
  }, [onScan, onError, playBeep, cleanupReader, state.isScanning, state.selectedDevice]);

  const stopScanning = useCallback(() => {
    cleanupReader();
    currentDeviceIdRef.current = null;
    setState(prev => ({ ...prev, isScanning: false }));
  }, [cleanupReader]);

  const switchDevice = useCallback((deviceId: string | undefined) => {
    stopScanning();
    setState(prev => ({ ...prev, selectedDevice: deviceId || null }));
    setTimeout(() => startScanning(deviceId), 100);
  }, [startScanning, stopScanning]);

  const clearLastScan = useCallback(() => {
    setState(prev => ({ ...prev, lastScannedCode: null }));
  }, []);

  useEffect(() => {
    initialize();

    return () => {
      cleanupReader();
      if (audioContextRef.current) {
        audioContextRef.current.close().catch(() => {});
      }
    };
  }, [initialize, cleanupReader]);

  return {
    videoRef,
    state,
    startScanning,
    stopScanning,
    switchDevice,
    clearLastScan,
    playBeep
  };
}
