import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Camera, Eye, Zap, CheckCircle, AlertTriangle, X, Wand2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface OcrResult {
  text: string;
  confidence: number;
  detectedFields: {
    valor?: string;
    data?: string;
    banco?: string;
    agencia?: string;
    conta?: string;
  };
}

interface AutomationFeaturesProps {
  selectedFile: File | null;
  onValidationResult: (result: ValidationResult) => void;
}

interface ValidationResult {
  isValid: boolean;
  confidence: number;
  detectedInfo: {
    valor?: number;
    dataDeposito?: Date;
    banco?: string;
    tipoComprovante?: 'deposito' | 'transferencia' | 'boleto' | 'outros';
  };
  issues: string[];
  suggestions: string[];
}

export function AutomationFeatures({ selectedFile, onValidationResult }: AutomationFeaturesProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [ocrResult, setOcrResult] = useState<OcrResult | null>(null);
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Simular OCR - em produção seria integrado com Tesseract.js ou similar
  const performOCR = async (file: File): Promise<OcrResult> => {
    // Simular delay do processamento
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Mock de resultado OCR baseado no nome do arquivo ou tipo
    const mockResults: OcrResult[] = [
      {
        text: "COMPROVANTE DE DEPÓSITO\nBANCO DO BRASIL\nAgência: 1234-5\nConta: 67890-1\nValor: R$ 1.250,00\nData: 15/12/2024\nAutenticação: 123456789",
        confidence: 0.89,
        detectedFields: {
          valor: "1.250,00",
          data: "15/12/2024",
          banco: "Banco do Brasil",
          agencia: "1234-5",
          conta: "67890-1"
        }
      },
      {
        text: "COMPROVANTE TRANSFERÊNCIA\nCaixa Econômica Federal\nValor transferido: R$ 850,00\nData operação: 15/12/2024",
        confidence: 0.75,
        detectedFields: {
          valor: "850,00",
          data: "15/12/2024",
          banco: "Caixa Econômica Federal"
        }
      }
    ];

    return mockResults[Math.floor(Math.random() * mockResults.length)];
  };

  // Validar comprovante automaticamente
  const validateReceipt = (ocrData: OcrResult): ValidationResult => {
    const issues: string[] = [];
    const suggestions: string[] = [];
    let confidence = ocrData.confidence;

    // Verificar se é um comprovante de depósito válido
    const hasValor = !!ocrData.detectedFields.valor;
    const hasData = !!ocrData.detectedFields.data;
    const hasBanco = !!ocrData.detectedFields.banco;

    if (!hasValor) {
      issues.push("Valor do depósito não identificado");
      confidence -= 0.2;
    }

    if (!hasData) {
      issues.push("Data do depósito não identificada");
      confidence -= 0.2;
    }

    if (!hasBanco) {
      issues.push("Banco não identificado");
      confidence -= 0.1;
    }

    // Verificar se a data é de hoje
    const today = new Date();
    if (hasData && ocrData.detectedFields.data) {
      const [dia, mes, ano] = ocrData.detectedFields.data.split('/');
      const dataDeposito = new Date(parseInt(ano), parseInt(mes) - 1, parseInt(dia));
      
      if (dataDeposito.toDateString() !== today.toDateString()) {
        issues.push("Data do depósito não corresponde ao dia atual");
        suggestions.push("Verifique se o comprovante é de hoje");
      }
    }

    // Verificar valor mínimo (exemplo)
    if (hasValor && ocrData.detectedFields.valor) {
      const valor = parseFloat(ocrData.detectedFields.valor.replace(',', '.'));
      if (valor < 100) {
        suggestions.push("Valor parece baixo para um depósito comercial");
      }
    }

    // Detectar tipo de comprovante
    let tipoComprovante: 'deposito' | 'transferencia' | 'boleto' | 'outros' = 'outros';
    const text = ocrData.text.toLowerCase();
    
    if (text.includes('depósito') || text.includes('deposito')) {
      tipoComprovante = 'deposito';
    } else if (text.includes('transferência') || text.includes('transferencia')) {
      tipoComprovante = 'transferencia';
    } else if (text.includes('boleto')) {
      tipoComprovante = 'boleto';
    }

    const result: ValidationResult = {
      isValid: issues.length === 0 && confidence > 0.7,
      confidence: Math.max(0, Math.min(1, confidence)),
      detectedInfo: {
        valor: hasValor ? parseFloat(ocrData.detectedFields.valor!.replace(',', '.')) : undefined,
        dataDeposito: hasData ? new Date(ocrData.detectedFields.data!) : undefined,
        banco: ocrData.detectedFields.banco,
        tipoComprovante
      },
      issues,
      suggestions
    };

    return result;
  };

  const handleAnalyzeImage = async () => {
    if (!selectedFile) {
      toast({
        title: "Nenhum arquivo selecionado",
        description: "Selecione um comprovante para análise automática.",
        variant: "destructive"
      });
      return;
    }

    setIsAnalyzing(true);
    
    try {
      // Realizar OCR
      const ocrData = await performOCR(selectedFile);
      setOcrResult(ocrData);

      // Validar comprovante
      const validation = validateReceipt(ocrData);
      setValidationResult(validation);
      onValidationResult(validation);

      toast({
        title: "Análise Concluída",
        description: `Comprovante analisado com ${Math.round(validation.confidence * 100)}% de confiança.`,
        variant: validation.isValid ? "default" : "destructive"
      });

    } catch (error) {
      toast({
        title: "Erro na Análise",
        description: "Não foi possível analisar o comprovante automaticamente.",
        variant: "destructive"
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return "bg-green-100 text-green-800 border-green-300";
    if (confidence >= 0.6) return "bg-yellow-100 text-yellow-800 border-yellow-300";
    return "bg-red-100 text-red-800 border-red-300";
  };

  const getTypeIcon = (tipo: string) => {
    switch (tipo) {
      case 'deposito': return '🏦';
      case 'transferencia': return '↔️';
      case 'boleto': return '📄';
      default: return '📋';
    }
  };

  return (
    <Card className="border border-blue-200 bg-blue-50/30">
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Wand2 className="h-5 w-5 text-blue-600" />
          Análise Automática Inteligente
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Botão de Análise */}
        <Button 
          onClick={handleAnalyzeImage}
          disabled={!selectedFile || isAnalyzing}
          className="w-full"
          variant="outline"
        >
          {isAnalyzing ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
              Analisando comprovante...
            </>
          ) : (
            <>
              <Eye className="h-4 w-4 mr-2" />
              Analisar Comprovante
            </>
          )}
        </Button>

        {/* Resultado da Análise */}
        {validationResult && (
          <div className="space-y-3">
            <Separator />
            
            {/* Status Geral */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {validationResult.isValid ? (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                ) : (
                  <AlertTriangle className="h-5 w-5 text-orange-600" />
                )}
                <span className="font-medium">
                  {validationResult.isValid ? "Comprovante Válido" : "Verificação Necessária"}
                </span>
              </div>
              
              <Badge className={getConfidenceColor(validationResult.confidence)}>
                {Math.round(validationResult.confidence * 100)}% confiança
              </Badge>
            </div>

            {/* Informações Detectadas */}
            {validationResult.detectedInfo && (
              <div className="bg-white/60 rounded-lg p-3 space-y-2">
                <h4 className="font-medium text-sm flex items-center gap-2">
                  <Zap className="h-4 w-4" />
                  Informações Detectadas
                </h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                  {validationResult.detectedInfo.tipoComprovante && (
                    <div className="flex items-center gap-2">
                      <span>{getTypeIcon(validationResult.detectedInfo.tipoComprovante)}</span>
                      <span className="text-gray-600">Tipo:</span>
                      <span className="font-medium capitalize">
                        {validationResult.detectedInfo.tipoComprovante}
                      </span>
                    </div>
                  )}
                  
                  {validationResult.detectedInfo.valor && (
                    <div className="flex items-center gap-2">
                      <span>💰</span>
                      <span className="text-gray-600">Valor:</span>
                      <span className="font-medium">
                        R$ {validationResult.detectedInfo.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  )}
                  
                  {validationResult.detectedInfo.banco && (
                    <div className="flex items-center gap-2">
                      <span>🏦</span>
                      <span className="text-gray-600">Banco:</span>
                      <span className="font-medium">{validationResult.detectedInfo.banco}</span>
                    </div>
                  )}
                  
                  {validationResult.detectedInfo.dataDeposito && (
                    <div className="flex items-center gap-2">
                      <span>📅</span>
                      <span className="text-gray-600">Data:</span>
                      <span className="font-medium">
                        {validationResult.detectedInfo.dataDeposito.toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Problemas Identificados */}
            {validationResult.issues.length > 0 && (
              <Alert variant="destructive">
                <X className="h-4 w-4" />
                <AlertDescription>
                  <div className="space-y-1">
                    <p className="font-medium">Problemas identificados:</p>
                    <ul className="list-disc list-inside text-sm space-y-1">
                      {validationResult.issues.map((issue, index) => (
                        <li key={index}>{issue}</li>
                      ))}
                    </ul>
                  </div>
                </AlertDescription>
              </Alert>
            )}

            {/* Sugestões */}
            {validationResult.suggestions.length > 0 && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <div className="space-y-1">
                    <p className="font-medium">Sugestões:</p>
                    <ul className="list-disc list-inside text-sm space-y-1">
                      {validationResult.suggestions.map((suggestion, index) => (
                        <li key={index}>{suggestion}</li>
                      ))}
                    </ul>
                  </div>
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}

        {/* Texto OCR (collapsible) */}
        {ocrResult && (
          <details className="bg-gray-50 rounded-lg p-3">
            <summary className="cursor-pointer font-medium text-sm">
              Ver texto extraído (OCR)
            </summary>
            <pre className="mt-2 text-xs text-gray-700 whitespace-pre-wrap">
              {ocrResult.text}
            </pre>
          </details>
        )}

        <canvas ref={canvasRef} className="hidden" />
      </CardContent>
    </Card>
  );
}

// Hook para capacidades de automação offline
export function useOfflineAutomation() {
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    // Verificar se o navegador suporta as APIs necessárias
    const hasCamera = 'getUserMedia' in navigator.mediaDevices;
    const hasCanvas = 'OffscreenCanvas' in window;
    const hasWorker = 'Worker' in window;
    
    setIsSupported(hasCamera && hasCanvas && hasWorker);
  }, []);

  return {
    isSupported,
    canUseCamera: 'getUserMedia' in navigator.mediaDevices,
    canProcessOffline: 'Worker' in window
  };
}

// Componente de captura por câmera
export function CameraCapture({ onCapture }: { onCapture: (file: File) => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } // Câmera traseira no mobile
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        setStream(mediaStream);
        setIsCapturing(true);
      }
    } catch (error) {
      toast({
        title: "Erro na Câmera",
        description: "Não foi possível acessar a câmera. Verifique as permissões.",
        variant: "destructive"
      });
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const video = videoRef.current;
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(video, 0, 0);
    
    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], `comprovante_${Date.now()}.jpg`, { type: 'image/jpeg' });
        onCapture(file);
        stopCamera();
      }
    }, 'image/jpeg', 0.8);
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
      setIsCapturing(false);
    }
  };

  if (!isCapturing) {
    return (
      <Button onClick={startCamera} variant="outline" className="w-full">
        <Camera className="h-4 w-4 mr-2" />
        Capturar com Câmera
      </Button>
    );
  }

  return (
    <div className="space-y-3">
      <div className="relative">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          className="w-full rounded-lg"
        />
        <canvas ref={canvasRef} className="hidden" />
      </div>
      
      <div className="flex gap-2">
        <Button onClick={capturePhoto} className="flex-1">
          <Camera className="h-4 w-4 mr-2" />
          Capturar
        </Button>
        <Button onClick={stopCamera} variant="outline">
          Cancelar
        </Button>
      </div>
    </div>
  );
} 