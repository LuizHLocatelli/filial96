import { useState, useRef, useEffect, useMemo } from "react";
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
    const hasCanvas = 'HTMLCanvasElement' in window;
    const hasWorker = 'Worker' in window;
    
    setIsSupported(hasCamera && hasCanvas && hasWorker);
  }, []);

  return {
    isSupported,
    canUseCamera: 'getUserMedia' in (navigator.mediaDevices || {}),
    canProcessOffline: 'Worker' in window
  };
}

// Componente de captura por câmera
export function CameraCapture({ onCapture }: { onCapture: (file: File) => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Verificar compatibilidade do navegador
  const isCompatible = useMemo(() => {
    return !!(navigator.mediaDevices && 
              navigator.mediaDevices.getUserMedia && 
              window.HTMLCanvasElement);
  }, []);

  if (!isCompatible) {
    return (
      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <div className="flex items-start space-x-3">
          <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
          <div>
            <h3 className="text-sm font-medium text-yellow-800">
              Funcionalidade Não Disponível
            </h3>
            <p className="text-sm text-yellow-700 mt-1">
              Seu navegador não suporta captura por câmera. Tente usar:
            </p>
            <ul className="text-sm text-yellow-700 mt-2 list-disc list-inside">
              <li>Chrome ou Firefox atualizado</li>
              <li>Conexão HTTPS (necessária para câmera)</li>
              <li>Permitir acesso à câmera quando solicitado</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  const startCamera = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Verificar se o navegador suporta getUserMedia
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Seu navegador não suporta captura de câmera');
      }

      const constraints = {
        video: { 
          facingMode: 'environment', // Câmera traseira no mobile
          width: { ideal: 1280, max: 1920 },
          height: { ideal: 720, max: 1080 }
        }
      };

      console.log('🎥 Solicitando acesso à câmera...');
      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      console.log('✅ Acesso à câmera concedido');
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        setStream(mediaStream);
        setIsCapturing(true);
        
        // Aguardar o vídeo carregar com timeout
        await new Promise((resolve, reject) => {
          const video = videoRef.current;
          if (!video) {
            reject(new Error('Elemento de vídeo não encontrado'));
            return;
          }

          const timeout = setTimeout(() => {
            reject(new Error('Timeout: Vídeo demorou muito para carregar'));
          }, 10000); // 10 segundos timeout

          video.onloadedmetadata = () => {
            clearTimeout(timeout);
            console.log('📹 Vídeo carregado, iniciando reprodução...');
            video.play().then(() => {
              console.log('▶️ Vídeo reproduzindo');
              resolve(true);
            }).catch((playError) => {
              console.error('❌ Erro ao reproduzir vídeo:', playError);
              reject(playError);
            });
          };

          video.onerror = (error) => {
            clearTimeout(timeout);
            console.error('❌ Erro no vídeo:', error);
            reject(new Error('Erro ao carregar stream de vídeo'));
          };
        });
      }
    } catch (error: any) {
      console.error('❌ Erro ao acessar câmera:', error);
      setError(error.message || 'Erro ao acessar a câmera');
      
      toast({
        title: "Erro na Câmera",
        description: `Não foi possível acessar a câmera: ${error.message || 'Verifique as permissões'}`,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) {
      toast({
        title: "Erro na Captura",
        description: "Câmera não está pronta para captura.",
        variant: "destructive"
      });
      return;
    }

    const canvas = canvasRef.current;
    const video = videoRef.current;
    
    // Verificar se o vídeo tem dimensões válidas
    if (video.videoWidth === 0 || video.videoHeight === 0) {
      toast({
        title: "Erro na Captura",
        description: "Aguarde o vídeo carregar completamente.",
        variant: "destructive"
      });
      return;
    }
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      toast({
        title: "Erro na Captura",
        description: "Não foi possível processar a imagem.",
        variant: "destructive"
      });
      return;
    }

    // Capturar frame do vídeo
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], `comprovante_${Date.now()}.jpg`, { 
          type: 'image/jpeg',
          lastModified: Date.now()
        });
        onCapture(file);
        stopCamera();
        
        toast({
          title: "Foto Capturada!",
          description: "Imagem capturada com sucesso.",
        });
      } else {
        toast({
          title: "Erro na Captura",
          description: "Não foi possível gerar a imagem.",
          variant: "destructive"
        });
      }
    }, 'image/jpeg', 0.9);
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setIsCapturing(false);
    setError(null);
  };

  // Cleanup quando componente desmonta
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  if (error) {
    return (
      <div className="space-y-3">
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-800 mb-2">❌ {error}</p>
          <Button onClick={startCamera} variant="outline" size="sm">
            Tentar Novamente
          </Button>
        </div>
      </div>
    );
  }

  if (!isCapturing) {
    return (
      <div className="space-y-3">
        <Button 
          onClick={startCamera} 
          variant="outline" 
          className="w-full"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
              Acessando câmera...
            </>
          ) : (
            <>
              <Camera className="h-4 w-4 mr-2" />
              📸 Capturar com Câmera
            </>
          )}
        </Button>
        
        <div className="text-xs text-muted-foreground text-center">
          🔒 Será solicitada permissão para acessar sua câmera
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="relative bg-black rounded-lg overflow-hidden">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-64 sm:h-80 object-cover"
          style={{ transform: 'scaleX(-1)' }} // Espelhar para parecer mais natural
        />
        
        {/* Overlay com guias visuais */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-4 border-2 border-white/50 rounded-lg">
            <div className="absolute top-2 left-2 text-white text-xs bg-black/50 px-2 py-1 rounded">
              📄 Posicione o comprovante dentro desta área
            </div>
          </div>
        </div>
        
        <canvas ref={canvasRef} className="hidden" />
      </div>
      
      <div className="flex gap-2">
        <Button onClick={capturePhoto} className="flex-1" size="lg">
          <Camera className="h-4 w-4 mr-2" />
          📸 Capturar Foto
        </Button>
        <Button onClick={stopCamera} variant="outline" size="lg">
          ❌ Cancelar
        </Button>
      </div>
      
      <div className="text-xs text-muted-foreground text-center">
        💡 Dica: Mantenha o comprovante bem iluminado e dentro da área destacada
      </div>
    </div>
  );
} 