export interface ScanResult {
  code: string;
  timestamp: Date;
  format: string;
  isValid: boolean;
}

export interface ScanHistory {
  items: ReadonlyArray<ScanResult>;
  add(result: ScanResult): void;
  clear(): void;
  remove(index: number): void;
  duplicate(code: string): string;
}

export interface BarcodeScannerProps {
  enabled: boolean;
  onScan: (code: string) => void;
  onError?: (error: ScannerError) => void;
  showHistory?: boolean;
  beepEnabled?: boolean;
  className?: string;
}

export interface ScannerError {
  type: 'permission' | 'camera' | 'decode' | 'not-supported' | 'validation';
  message: string;
  recoverable: boolean;
  action?: string;
  onAction?: () => void;
}

export interface ScannerState {
  isInitialized: boolean;
  isScanning: boolean;
  hasPermission: boolean | null;
  selectedDevice: string | null | undefined;
  availableDevices: Array<{ deviceId: string; label: string }>;
  lastScannedCode: string | null;
  error: ScannerError | null;
}
