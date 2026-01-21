import { useState, useEffect, useCallback } from 'react';
import { Camera, CameraOff, History, Volume2, VolumeX, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useBarcodeScanner } from './useBarcodeScanner';
import { useScanHistory } from './useScanHistory';
import { BarcodeScannerProps } from './BarcodeScanner.types';

export function BarcodeScanner({
  enabled,
  onScan,
  onError,
  showHistory = true,
  beepEnabled = true,
  className
}: BarcodeScannerProps) {
  const [isBeepEnabled, setIsBeepEnabled] = useState(beepEnabled);
  const [showHistoryPanel, setShowHistoryPanel] = useState(showHistory);
  const [manualBeep, setManualBeep] = useState(false);

  const { items: history, add, clear, remove, duplicate } = useScanHistory();

  const handleScan = useCallback((code: string, format: string) => {
    const result = {
      code,
      timestamp: new Date(),
      format,
      isValid: true
    };
    add(result);
    onScan(code);
    if (isBeepEnabled) {
      setManualBeep(true);
      setTimeout(() => setManualBeep(false), 200);
    }
  }, [onScan, add, isBeepEnabled]);

  const {
    videoRef,
    state,
    startScanning,
    stopScanning,
    switchDevice,
    playBeep
  } = useBarcodeScanner({
    onScan: handleScan,
    onError
  });

  useEffect(() => {
    if (enabled && !state.isScanning) {
      startScanning(state.selectedDevice || undefined);
    } else if (!enabled && state.isScanning) {
      stopScanning();
    }
  }, [enabled, state.isScanning, state.selectedDevice, startScanning, stopScanning]);

  useEffect(() => {
    if (manualBeep) {
      playBeep();
    }
  }, [manualBeep, playBeep]);

  const handleRetry = () => {
    startScanning(state.selectedDevice || undefined);
  };

  const handleOpenSettings = () => {
    alert('Para habilitar a câmera, acesse as configurações do seu dispositivo nas configurações do app.');
  };

  return (
    <div className={`space-y-3 ${className || ''}`}>
      {state.error && (
        <div className={`p-4 rounded-lg border ${
          state.error.type === 'permission' 
            ? 'bg-amber-50 border-amber-200 dark:bg-amber-950 dark:border-amber-800' 
            : 'bg-red-50 border-red-200 dark:bg-red-950 dark:border-red-800'
        }`}>
          <div className="flex items-start gap-3">
            <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
              state.error.type === 'permission' 
                ? 'bg-amber-100 dark:bg-amber-900' 
                : 'bg-red-100 dark:bg-red-900'
            }`}>
              {state.error.type === 'permission' ? (
                <CameraOff className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              ) : (
                <CameraOff className="w-4 h-4 text-red-600 dark:text-red-400" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-medium ${
                state.error.type === 'permission'
                  ? 'text-amber-800 dark:text-amber-200'
                  : 'text-red-800 dark:text-red-200'
              }`}>
                {state.error.type === 'permission' ? 'Câmera bloqueada' : 'Erro ao acessar câmera'}
              </p>
              <p className="text-sm text-muted-foreground mt-1">{state.error.message}</p>
              {state.error.action && (
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-3"
                  onClick={state.error.type === 'permission' ? handleOpenSettings : handleRetry}
                >
                  {state.error.type === 'permission' ? (
                    <>Abrir Configurações</>
                  ) : (
                    <>
                      <RefreshCw className="w-3 h-3 mr-1" />
                      {state.error.action}
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          {state.isScanning ? (
            <Camera className="h-4 w-4 text-green-500 animate-pulse" />
          ) : (
            <CameraOff className="h-4 w-4 text-muted-foreground" />
          )}
          <span className="text-sm font-medium">Leitor de Códigos</span>
          <Badge variant="secondary" className="ml-1 text-xs">6 ou 9 dígitos</Badge>
        </div>
        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant={isBeepEnabled ? 'default' : 'outline'}
            size="sm"
            onClick={() => setIsBeepEnabled(!isBeepEnabled)}
            className="h-8 px-2"
            aria-pressed={isBeepEnabled}
            aria-label={isBeepEnabled ? 'Desativar som' : 'Ativar som'}
          >
            {isBeepEnabled ? (
              <Volume2 className="w-4 h-4" />
            ) : (
              <VolumeX className="w-4 h-4" />
            )}
          </Button>
          <Button
            type="button"
            variant={showHistoryPanel ? 'default' : 'outline'}
            size="sm"
            onClick={() => setShowHistoryPanel(!showHistoryPanel)}
            className="h-8 px-2"
            aria-pressed={showHistoryPanel}
            aria-label="Alternar histórico"
          >
            <History className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-2">
        {state.availableDevices.length > 1 ? (
          <Select
            value={state.selectedDevice || undefined}
            onValueChange={switchDevice}
          >
            <SelectTrigger className="h-9">
              <SelectValue placeholder="Selecionar câmera" />
            </SelectTrigger>
            <SelectContent>
              {state.availableDevices
                .filter(device => device.deviceId && device.deviceId.trim() !== '')
                .map((device) => (
                  <SelectItem key={device.deviceId} value={device.deviceId}>
                    {device.label}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        ) : (
          <div className="text-xs text-muted-foreground text-center py-1">
            Usando câmera traseira automaticamente
          </div>
        )}
      </div>

      <div className="relative w-full aspect-[4/3] rounded-lg overflow-hidden glass-card border border-border/30 bg-black">
        {!state.isInitialized && !state.error && (
          <div className="absolute inset-0 flex items-center justify-center bg-muted/50">
            <div className="flex flex-col items-center gap-2">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
              <span className="text-sm text-muted-foreground">Solicitando acesso à câmera...</span>
            </div>
          </div>
        )}

        <video
          ref={videoRef}
          className="w-full h-full object-cover"
          playsInline
          muted
          aria-label="Visualização da câmera para escaneamento de código de barras"
        />

        {state.isScanning && (
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative w-64 h-40">
                <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-primary rounded-tl-lg" />
                <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-primary rounded-tr-lg" />
                <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-primary rounded-bl-lg" />
                <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-primary rounded-br-lg" />
                
                <div className="absolute top-1/2 left-2 right-2 h-0.5 bg-primary/20" />
              </div>
            </div>

            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 px-3 py-1.5 bg-black/60 rounded-full">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-xs text-white">Escaneando...</span>
            </div>
          </div>
        )}

        {state.lastScannedCode && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 px-4 py-2 bg-green-500 text-white rounded-full text-sm font-medium animate-in fade-in slide-in-from-top-2">
            ✓ {state.lastScannedCode}
          </div>
        )}
      </div>

      <div className="text-xs text-muted-foreground text-center">
        Posicione o código dentro do quadro • Modo contínuo ativo
      </div>

      {showHistoryPanel && history.length > 0 && (
        <div className="border rounded-lg overflow-hidden">
          <div className="flex items-center justify-between p-3 bg-muted/50 border-b">
            <div className="flex items-center gap-2">
              <History className="w-4 h-4" />
              <span className="text-sm font-medium">Histórico</span>
              <Badge variant="secondary" className="text-xs">{history.length}</Badge>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={clear}
              className="text-xs h-7"
            >
              Limpar
            </Button>
          </div>
          <ul className="max-h-48 overflow-y-auto">
            {history.map((item, index) => (
              <li
                key={index}
                className="flex items-center justify-between p-2 border-b last:border-b-0 hover:bg-muted/50"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className="font-mono text-sm truncate">{item.code}</span>
                  <span className="text-xs text-muted-foreground">
                    {item.timestamp.toLocaleTimeString()}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onScan(duplicate(item.code))}
                    className="h-7 w-7 p-0"
                    aria-label={`Adicionar ${item.code} novamente`}
                  >
                    <span className="text-xs">+</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => remove(index)}
                    className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
                    aria-label="Remover"
                  >
                    <span className="text-xs">×</span>
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
