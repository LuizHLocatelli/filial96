import { useState, useRef } from "react";
import { isSameDay } from "date-fns";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Upload, Camera, Check, X, ImageIcon, Loader2, Calendar } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import type { Deposito } from "@/hooks/crediario/useDepositos";

interface QuickDepositFormProps {
  depositos: Deposito[];
  isUploading: boolean;
  onSubmit: (data: {
    data: Date;
    comprovante?: string;
    ja_incluido: boolean;
  }, file?: File) => Promise<boolean>;
}

export function QuickDepositForm({ depositos, isUploading, onSubmit }: QuickDepositFormProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [ja_incluido, setJa_incluido] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const today = new Date();
  const isWeekend = today.getDay() === 0;
  
  // Verificar se já existe depósito hoje
  const todayDeposits = depositos.filter(deposito => 
    isSameDay(deposito.data, today)
  );
  
  const hasDepositToday = todayDeposits.length > 0;
  const hasReceiptToday = todayDeposits.some(d => d.comprovante);
  const isIncludedToday = todayDeposits.some(d => d.ja_incluido);

  const validateFile = (file: File) => {
    // Validar tipo de arquivo
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Tipo de arquivo inválido",
        description: "Por favor, selecione uma imagem.",
        variant: "destructive"
      });
      return false;
    }
    
    // Validar tamanho (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Arquivo muito grande",
        description: "O arquivo deve ter no máximo 5MB.",
        variant: "destructive"
      });
      return false;
    }

    return true;
  };

  const handleFileSelect = (file: File) => {
    if (!validateFile(file)) return;
    
    setSelectedFile(file);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  // Drag & Drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleRemoveFile = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setSelectedFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async () => {
    if (!selectedFile && !hasReceiptToday) {
      toast({
        title: "Comprovante obrigatório",
        description: "Por favor, anexe o comprovante do depósito.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      const success = await onSubmit({
        data: today,
        comprovante: previewUrl || undefined,
        ja_incluido
      }, selectedFile || undefined);
      
      if (success) {
        // Limpar formulário
        handleRemoveFile();
        setJa_incluido(false);
        
        toast({
          title: "Depósito registrado!",
          description: `Depósito de hoje foi ${ja_incluido ? 'registrado e incluído no sistema' : 'registrado (pendente inclusão no sistema)'}.`,
        });
      }
    } catch (error) {
      toast({
        title: "Erro ao registrar",
        description: "Não foi possível registrar o depósito. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isWeekend) {
    return (
      <Card className="border-dashed border-2 deposit-card weekend">
        <CardContent className="flex flex-col items-center justify-center py-8">
          <Calendar className="h-12 w-12 text-muted-foreground mb-2" />
          <h3 className="text-lg font-medium text-muted-foreground">Domingo</h3>
          <p className="text-sm text-muted-foreground text-center">
            Não há necessidade de depósito aos domingos
          </p>
        </CardContent>
      </Card>
    );
  }

  if (hasDepositToday && hasReceiptToday && isIncludedToday) {
    return (
      <Card className="deposit-card complete">
        <CardContent className="flex flex-col items-center justify-center py-8">
          <Check className="h-12 w-12 text-green-600 mb-2" />
          <h3 className="text-lg font-medium text-green-800">Depósito Completo!</h3>
          <p className="text-sm text-green-700 text-center">
            O depósito de hoje foi registrado e incluído no sistema
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-2 deposit-card">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Registro Rápido - Hoje
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Upload Area com Drag & Drop */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Comprovante do Depósito</Label>
          
          {!previewUrl && !hasReceiptToday ? (
            <div 
              className={`upload-zone p-6 text-center cursor-pointer transition-all duration-300 ${
                isDragOver ? 'dragover border-green-500 bg-green-50' : 'border-muted-foreground/25 hover:border-muted-foreground/50'
              }`}
              onClick={() => fileInputRef.current?.click()}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <Upload className={`h-8 w-8 mx-auto mb-2 transition-colors ${
                isDragOver ? 'text-green-600' : 'text-muted-foreground'
              }`} />
              <p className={`text-sm mb-1 transition-colors ${
                isDragOver ? 'text-green-700' : 'text-muted-foreground'
              }`}>
                {isDragOver ? 'Solte o arquivo aqui' : 'Clique para anexar ou arraste o comprovante'}
              </p>
              <p className="text-xs text-muted-foreground">
                Formatos: JPG, PNG, WEBP (máx. 5MB)
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {(previewUrl || hasReceiptToday) && (
                <div className="relative group">
                  {previewUrl ? (
                    <div className="relative">
                      <img 
                        src={previewUrl} 
                        alt="Preview do comprovante" 
                        className="w-full h-32 object-cover rounded-lg border transition-all duration-300 group-hover:brightness-90"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-300 rounded-lg"></div>
                    </div>
                  ) : (
                    <div className="w-full h-32 bg-green-100 rounded-lg border flex items-center justify-center">
                      <div className="text-center">
                        <ImageIcon className="h-8 w-8 mx-auto text-green-600 mb-1" />
                        <p className="text-sm text-green-700">Comprovante já anexado</p>
                      </div>
                    </div>
                  )}
                  
                  {previewUrl && (
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      onClick={handleRemoveFile}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              )}
              
              {!hasReceiptToday && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full quick-action-btn"
                >
                  {previewUrl ? "Trocar arquivo" : "Selecionar arquivo"}
                </Button>
              )}
            </div>
          )}
          
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileInputChange}
            className="hidden"
          />
        </div>

        {/* Checklist Aprimorada */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Confirmações</Label>
          
          <div className="space-y-3 p-3 bg-muted/20 rounded-lg">
            <div className="flex items-center space-x-3">
              <Checkbox 
                id="comprovante-check" 
                checked={hasReceiptToday || !!previewUrl}
                disabled
                className="data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600"
              />
              <Label htmlFor="comprovante-check" className="text-sm flex items-center gap-2">
                <ImageIcon className="h-4 w-4" />
                Comprovante anexado
              </Label>
            </div>
            
            <div className="flex items-center space-x-3">
              <Checkbox 
                id="sistema-check" 
                checked={ja_incluido || isIncludedToday}
                onCheckedChange={(checked) => setJa_incluido(checked as boolean)}
                disabled={isIncludedToday}
                className="data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600"
              />
              <Label htmlFor="sistema-check" className="text-sm flex items-center gap-2">
                <Check className="h-4 w-4" />
                Depósito incluído no sistema de tesouraria
              </Label>
            </div>
          </div>
        </div>

        {/* Submit Button Aprimorado */}
        <Button
          onClick={handleSubmit}
          disabled={isSubmitting || isUploading || (hasDepositToday && hasReceiptToday && isIncludedToday)}
          className="w-full quick-action-btn"
          size="lg"
        >
          {isSubmitting || isUploading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Registrando...
            </>
          ) : (
            <>
              <Check className="h-4 w-4 mr-2" />
              {hasDepositToday ? "Atualizar Depósito" : "Registrar Depósito"}
            </>
          )}
        </Button>

        {/* Progress Indicator */}
        {(isSubmitting || isUploading) && (
          <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
            <div className="bg-primary h-2 rounded-full animate-pulse"></div>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 