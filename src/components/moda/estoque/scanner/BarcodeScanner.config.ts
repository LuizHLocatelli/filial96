import type { ScannerState, ScannerError } from './BarcodeScanner.types';

export { ScannerState, ScannerError };

export const SCANNER_CONFIG = {
  VALID_LENGTHS: [6, 9] as const,
  SCAN_DEBOUNCE: 800,
  BEEP_FREQUENCY: 1800,
  BEEP_DURATION: 150,
  HISTORY_MAX_ITEMS: 50,
  VIDEO_CONSTRAINTS: {
    facingMode: 'environment' as const,
    width: { ideal: 1280 },
    height: { ideal: 720 },
    aspectRatio: { ideal: 1.777778 }
  }
} as const;

export function createScannerError(type: ScannerError['type'], message: string, recoverable: boolean, action?: string, onAction?: () => void): ScannerError {
  return { type, message, recoverable, action, onAction };
}
