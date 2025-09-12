import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Camera, Upload } from "lucide-react";
import { FileInputZone } from "@/components/venda-o/FileInputZone";
import { useFileUpload } from "@/hooks/moveis/useFileUpload";
import { toast } from "@/hooks/use-toast";

interface CameraCaptureProps {
  onImageCaptured: (imageUrl: string) => void;
}

export function CameraCapture({ onImageCaptured }: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const { uploadFile, isUploading } = useFileUpload();

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' } // Use back camera on mobile
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsStreaming(true);
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      toast({
        title: "Erro",
        description: "Não foi possível acessar a câmera. Use o upload de arquivo.",
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

  const retakePhoto = () => {
    setCapturedImage(null);
    startCamera();
  };

  return (
    <div className="space-y-4">
      {!capturedImage && !isStreaming && (
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col gap-4">
              <Button onClick={startCamera} className="w-full">
                <Camera className="h-4 w-4 mr-2" />
                Usar Câmera
              </Button>
              
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