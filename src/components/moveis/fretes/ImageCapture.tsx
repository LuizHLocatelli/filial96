import { useRef, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Camera, Upload, Smartphone, RotateCcw } from "lucide-react";
import { FileInputZone } from "@/components/venda-o/FileInputZone";
import { useFileUpload } from "@/hooks/moveis/useFileUpload";
import { toast } from "@/hooks/use-toast";

interface ImageCaptureProps {
  onImageCaptured: (imageUrl: string) => void;
  disabled?: boolean;
}

export function ImageCapture({ onImageCaptured, disabled = false }: ImageCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isStreaming, setIsStreaming] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [cameraSupported, setCameraSupported] = useState(true);

  const { uploadFile, isUploading } = useFileUpload();

  // Detectar dispositivo móvel e suporte à câmera
  useEffect(() => {
    const checkMobile = () => {
      const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
      const mobile = /android|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
      setIsMobile(mobile);
    };

    const checkCameraSupport = () => {
      const supported = !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
      setCameraSupported(supported);
    };

    checkMobile();
    checkCameraSupport();
  }, []);

  // Limpar stream quando componente é desmontado
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      toast({
        title: "Câmera não suportada",
        description: "Seu navegador não suporta acesso à câmera. Use o upload de arquivo.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Configurações otimizadas para captura de documentos
      const constraints = {
        video: {
          facingMode: 'environment', // Câmera traseira preferencialmente
          width: { ideal: 1920, max: 1920 },
          height: { ideal: 1080, max: 1080 },
          aspectRatio: { ideal: 1.777777778 }, // 16:9
        }
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);

      if (videoRef.current) {
        videoRef.current.srcObject = stream;

        videoRef.current.onloadedmetadata = () => {
          setIsStreaming(true);
        };

        // Garantir reprodução automática
        try {
          await videoRef.current.play();
        } catch (playError) {
          console.error('Erro ao reproduzir vídeo:', playError);
        }
      }
    } catch (error) {
      console.error('Erro ao acessar câmera:', error);

      let errorMessage = "Não foi possível acessar a câmera.";

      if (error instanceof DOMException) {
        switch (error.name) {
          case 'NotAllowedError':
            errorMessage = "Permissão para acessar a câmera foi negada. Verifique as configurações do navegador.";
            break;
          case 'NotFoundError':
            errorMessage = "Nenhuma câmera foi encontrada no dispositivo.";
            break;
          case 'NotReadableError':
            errorMessage = "A câmera está sendo usada por outro aplicativo.";
            break;
          case 'OverconstrainedError':
            errorMessage = "Câmera não atende aos requisitos solicitados.";
            break;
          default:
            errorMessage = `Erro ao acessar câmera: ${error.message}`;
        }
      }

      toast({
        title: "Erro da Câmera",
        description: errorMessage + " Use o upload de arquivo como alternativa.",
        variant: "destructive",
      });
    }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsStreaming(false);
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const video = videoRef.current;

    // Definir resolução do canvas para alta qualidade
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      // Desenhar frame do vídeo no canvas
      ctx.drawImage(video, 0, 0);

      // Converter para JPEG com alta qualidade
      const imageUrl = canvas.toDataURL('image/jpeg', 0.95);
      setCapturedImage(imageUrl);
      onImageCaptured(imageUrl);
      stopCamera();
    }
  };

  const handleFileUpload = async (file: File | null) => {
    if (!file) return;

    try {
      const result = await uploadFile(file, {
        bucketName: 'fretes',
        folder: `notas-fiscais/${new Date().getFullYear()}/${new Date().getMonth() + 1}`,
        generateUniqueName: true,
        maxSizeInMB: 10,
        allowedFileTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/heic']
      });

      if (result?.file_url) {
        setCapturedImage(result.file_url);
        onImageCaptured(result.file_url);

        toast({
          title: "Sucesso",
          description: "Imagem enviada com sucesso!",
        });
      }
    } catch (error) {
      console.error('Erro no upload:', error);
      toast({
        title: "Erro",
        description: "Erro ao enviar arquivo",
        variant: "destructive",
      });
    }
  };

  const openMobileCamera = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleMobileFileInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
    // Limpar input para permitir mesma imagem novamente
    if (event.target) {
      event.target.value = '';
    }
  };

  const retakePhoto = () => {
    setCapturedImage(null);
    if (cameraSupported && !isMobile) {
      startCamera();
    }
  };

  const resetCapture = () => {
    setCapturedImage(null);
    stopCamera();
  };

  if (disabled) {
    return (
      <Card className="opacity-50">
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">
            Captura de imagem desabilitada
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Input hidden para dispositivos móveis */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleMobileFileInput}
        className="hidden"
      />

      {!capturedImage && !isStreaming && (
        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex flex-col gap-3 sm:gap-4">
              <div className="text-center mb-2 sm:mb-4">
                <h3 className="text-sm sm:text-lg font-medium">Capturar Nota Fiscal</h3>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Tire uma foto ou faça upload da imagem da nota fiscal
                </p>
              </div>

              {/* Botões de câmera */}
              {cameraSupported && (
                <div className="space-y-2">
                  <Button
                    onClick={isMobile ? openMobileCamera : startCamera}
                    className="w-full h-10 sm:h-11"
                    size="default"
                  >
                    <Camera className="h-4 w-4 mr-2" />
                    <span className="text-xs sm:text-sm">
                      {isMobile ? "Abrir Câmera" : "Usar Câmera Web"}
                    </span>
                  </Button>

                  {isMobile && (
                    <Button
                      onClick={openMobileCamera}
                      variant="outline"
                      className="w-full h-10 sm:h-11"
                      size="default"
                    >
                      <Smartphone className="h-4 w-4 mr-2" />
                      <span className="text-xs sm:text-sm">Galeria do Dispositivo</span>
                    </Button>
                  )}
                </div>
              )}

              {!cameraSupported && (
                <div className="text-center text-muted-foreground text-sm mb-4">
                  <Camera className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  Câmera não disponível neste navegador
                </div>
              )}

              <div className="text-center text-muted-foreground text-sm">
                ou
              </div>

              <FileInputZone
                onFileSelect={handleFileUpload}
                allowedTypes={['image/jpeg', 'image/png', 'image/webp', 'image/heic']}
                maxSize={10 * 1024 * 1024}
                isUploading={isUploading}
                helpText="Arraste uma imagem aqui ou clique para selecionar"
              />
            </div>
          </CardContent>
        </Card>
      )}

      {isStreaming && (
        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="space-y-3 sm:space-y-4">
              <div className="text-center">
                <h3 className="text-sm sm:text-lg font-medium mb-2">Posicione a nota fiscal</h3>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Certifique-se de que toda a nota fiscal está visível e legível
                </p>
              </div>

              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full rounded-lg border"
                style={{ maxHeight: '400px' }}
              />

              <div className="flex gap-2">
                <Button
                  onClick={capturePhoto}
                  className="flex-1 h-10 sm:h-11"
                  size="default"
                >
                  <Camera className="h-4 w-4 mr-2" />
                  <span className="text-xs sm:text-sm">Capturar Foto</span>
                </Button>
                <Button
                  onClick={stopCamera}
                  variant="outline"
                  className="flex-1 h-10 sm:h-11"
                  size="default"
                >
                  <span className="text-xs sm:text-sm">Cancelar</span>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {capturedImage && (
        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="space-y-3 sm:space-y-4">
              <div className="text-center">
                <h3 className="text-sm sm:text-lg font-medium mb-2">Imagem Capturada</h3>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Verifique se a imagem está nítida e legível
                </p>
              </div>

              <img
                src={capturedImage}
                alt="Nota fiscal capturada"
                className="w-full rounded-lg border"
                style={{ maxHeight: '400px', objectFit: 'contain' }}
              />

              <div className="flex flex-col sm:flex-row gap-2">
                <Button
                  onClick={retakePhoto}
                  variant="outline"
                  className="flex-1 h-10 sm:h-11"
                  size="default"
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  <span className="text-xs sm:text-sm">Nova Foto</span>
                </Button>
                <Button
                  onClick={resetCapture}
                  variant="outline"
                  className="flex-1 h-10 sm:h-11"
                  size="default"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  <span className="text-xs sm:text-sm">Novo Upload</span>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}