import { useRef, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Camera, Upload, Smartphone } from "lucide-react";
import { FileInputZone } from "@/components/venda-o/FileInputZone";
import { useFileUpload } from "@/hooks/moveis/useFileUpload";
import { toast } from "@/hooks/use-toast";

interface CameraCaptureProps {
  onImageCaptured: (imageUrl: string) => void;
}

export function CameraCapture({ onImageCaptured }: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [cameraSupported, setCameraSupported] = useState(true);
  const { uploadFile, isUploading } = useFileUpload();

  // Detectar se é dispositivo móvel
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

  const startCamera = async () => {
    // Verificar se o navegador suporta getUserMedia
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      toast({
        title: "Erro",
        description: "Seu navegador não suporta acesso à câmera. Use o upload de arquivo.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Primeiro, solicitar permissão para acessar dispositivos de mídia
      await navigator.mediaDevices.getUserMedia({ video: true })
        .then(stream => {
          // Parar o stream temporário
          stream.getTracks().forEach(track => track.stop());
        });

      // Configurações otimizadas para dispositivos móveis
      const constraints = {
        video: {
          facingMode: 'environment', // Câmera traseira
          width: { ideal: 1920, max: 1920 },
          height: { ideal: 1080, max: 1080 },
        }
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        
        // Aguardar o vídeo carregar antes de definir como streaming
        videoRef.current.onloadedmetadata = () => {
          setIsStreaming(true);
        };
        
        // Forçar o play em dispositivos móveis
        videoRef.current.play().catch(error => {
          console.error('Error playing video:', error);
        });
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      
      // Mensagens de erro mais específicas
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
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0);
      const imageUrl = canvas.toDataURL('image/jpeg', 0.8);
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
        folder: `${new Date().getFullYear()}/${new Date().getMonth() + 1}`,
        generateUniqueName: true,
        maxSizeInMB: 10,
        allowedFileTypes: ['image/jpeg', 'image/png', 'image/webp']
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
      console.error('Error uploading file:', error);
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
    // Limpar o input para permitir selecionar o mesmo arquivo novamente
    if (event.target) {
      event.target.value = '';
    }
  };

  const retakePhoto = () => {
    setCapturedImage(null);
    startCamera();
  };

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
          <CardContent className="p-6">
            <div className="flex flex-col gap-4">
              {/* Botão da câmera web (desktop) ou câmera nativa (mobile) */}
              {cameraSupported && (
                <Button onClick={isMobile ? openMobileCamera : startCamera} className="w-full">
                  <Camera className="h-4 w-4 mr-2" />
                  {isMobile ? "Abrir Câmera" : "Usar Câmera Web"}
                </Button>
              )}

              {/* Botão adicional para câmera nativa em dispositivos móveis */}
              {isMobile && cameraSupported && (
                <Button onClick={openMobileCamera} variant="outline" className="w-full">
                  <Smartphone className="h-4 w-4 mr-2" />
                  Câmera do Dispositivo
                </Button>
              )}

              {/* Mostrar apenas upload se câmera não for suportada */}
              {!cameraSupported && (
                <div className="text-center text-muted-foreground text-sm mb-2">
                  Câmera não disponível neste navegador
                </div>
              )}
              
              <div className="text-center text-muted-foreground text-sm">
                ou
              </div>
              
              <FileInputZone
                onFileSelect={handleFileUpload}
                allowedTypes={['image/jpeg', 'image/png', 'image/webp']}
                maxSize={10 * 1024 * 1024}
                isUploading={isUploading}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {isStreaming && (
        <Card>
          <CardContent className="p-4">
            <div className="space-y-4">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full rounded-lg"
              />
              <div className="flex gap-2">
                <Button onClick={capturePhoto} className="flex-1">
                  <Camera className="h-4 w-4 mr-2" />
                  Capturar
                </Button>
                <Button onClick={stopCamera} variant="outline" className="flex-1">
                  Cancelar
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {capturedImage && (
        <Card>
          <CardContent className="p-4">
            <div className="space-y-4">
              <img
                src={capturedImage}
                alt="Nota fiscal capturada"
                className="w-full rounded-lg"
              />
              <Button onClick={retakePhoto} variant="outline" className="w-full">
                <Camera className="h-4 w-4 mr-2" />
                Capturar Nova Foto
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}