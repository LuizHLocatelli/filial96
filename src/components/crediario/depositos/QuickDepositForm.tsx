
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
        variant: "destructive",
        duration: 4000,
      });
      return false;
    }
    
    // Validar tamanho (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Arquivo muito grande",
        description: "O arquivo deve ter no máximo 5MB.",
        variant: "destructive",
        duration: 4000,
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
        variant: "destructive",
        duration: 4000,
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
          description: `Depósito de hoje foi ${ja_incluido ? 'registrado e incluído na Tesouraria/P2K' : 'registrado (pendente inclusão na Tesouraria/P2K)'}.`,
          duration: 4000,
        });
      }
    } catch (error) {
      toast({
        title: "Erro ao registrar",
        description: "Não foi possível registrar o depósito. Tente novamente.",
        variant: "destructive",
        duration: 4000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isWeekend) {
    return (
      <Card className="border-dashed border-2 deposit-card weekend">
        <CardContent className="flex flex-col items-center justify-center py-8 sm:py-8 px-4 sm:px-6">
          <Calendar className="h-12 w-12 sm:h-12 sm:w-12 text-muted-foreground mb-3" />
          <h3 className="text-lg sm:text-lg font-medium text-muted-foreground">Domingo</h3>
          <p className="text-sm sm:text-sm text-muted-foreground text-center mt-2">
            Não há necessidade de depósito aos domingos
          </p>
        </CardContent>
      </Card>
    );
  }

  if (hasDepositToday && hasReceiptToday && isIncludedToday) {
    return (
      <Card className="deposit-card complete">
        <CardContent className="flex flex-col items-center justify-center py-8 sm:py-8 px-4 sm:px-6">
          <Check className="h-12 w-12 sm:h-12 sm:w-12 text-green-600 dark:text-green-400 mb-3" />
          <h3 className="text-lg sm:text-lg font-medium text-green-800 dark:text-green-200">Depósito Completo!</h3>
          <p className="text-sm sm:text-sm text-green-700 dark:text-green-300 text-center mt-2">
            O depósito de hoje foi registrado e incluído na Tesouraria/P2K
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-2 deposit-card">
      <CardHeader className="pb-4 sm:pb-4 px-4 sm:px-6">
        <CardTitle className="text-base sm:text-lg flex items-center gap-2 sm:gap-3">
          <Upload className="h-5 w-5 sm:h-5 sm:w-5 flex-shrink-0" />
          <span>Registro Rápido - Hoje</span>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4 sm:space-y-4 px-4 sm:px-6">
        {/* Upload Area com Drag & Drop */}
        <div className="space-y-3 sm:space-y-3">
          <Label className="text-sm sm:text-sm font-medium">Comprovante do Depósito</Label>
          
          {!previewUrl && !hasReceiptToday ? (
            <div 
              className={`upload-zone p-6 sm:p-6 text-center cursor-pointer transition-all duration-300 border-2 border-dashed rounded-lg ${
                isDragOver ? 'dragover border-green-500 bg-green-50 dark:bg-green-950/50 dark:border-green-400' : 'border-muted-foreground/25 hover:border-muted-foreground/50'
              }`}
              onClick={() => fileInputRef.current?.click()}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <Upload className={`h-8 w-8 sm:h-8 sm:w-8 mx-auto mb-3 transition-colors ${
                isDragOver ? 'text-green-600 dark:text-green-400' : 'text-muted-foreground'
              }`} />
              <p className={`text-sm sm:text-sm mb-2 transition-colors ${
                isDragOver ? 'text-green-700 dark:text-green-300' : 'text-muted-foreground'
              }`}>
                {isDragOver ? 'Solte o arquivo aqui' : 'Toque para anexar ou arraste o comprovante'}
              </p>
              <p className="text-xs sm:text-xs text-muted-foreground">
                Formatos: JPG, PNG, WEBP (máx. 5MB)
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {(previewUrl || hasReceiptToday) && (
                <div className="relative group">
                  {previewUrl ? (
                    <div className="relative">
                      <img 
                        src={previewUrl} 
                        alt="Preview do comprovante" 
                        className="w-full h-28 sm:h-32 object-cover rounded-lg border transition-all duration-300 group-hover:brightness-90"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-300 rounded-lg"></div>
                    </div>
                  ) : (
                    <div className="w-full h-28 sm:h-32 bg-green-100 dark:bg-green-950/50 rounded-lg border flex items-center justify-center">
                      <div className="text-center">
                        <ImageIcon className="h-8 w-8 sm:h-8 sm:w-8 mx-auto text-green-600 dark:text-green-400 mb-2" />
                        <p className="text-sm sm:text-sm text-green-700 dark:text-green-300">Comprovante já anexado</p>
                      </div>
                    </div>
                  )}
                  
                  {previewUrl && (
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2 sm:top-2 sm:right-2 h-8 w-8 sm:h-8 sm:w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      onClick={handleRemoveFile}
                    >
                      <X className="h-4 w-4 sm:h-4 sm:w-4" />
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
                  className="w-full quick-action-btn text-sm sm:text-sm h-10 sm:h-9"
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
        <div className="space-y-3 sm:space-y-3">
          <Label className="text-sm sm:text-sm font-medium">Confirmações</Label>
          
          <div className="space-y-3 sm:space-y-3 p-3 sm:p-3 bg-muted/20 rounded-lg">
            <div className="flex items-center space-x-3 sm:space-x-3">
              <Checkbox 
                id="comprovante"
                checked={hasReceiptToday}
                disabled
                className="data-[state=checked]:bg-green-600 dark:data-[state=checked]:bg-green-500 data-[state=checked]:border-green-600 dark:data-[state=checked]:border-green-500 h-5 w-5 sm:h-5 sm:w-5"
              />
              <Label htmlFor="comprovante-check" className="text-sm sm:text-sm flex items-center gap-2 sm:gap-2 cursor-pointer">
                {hasReceiptToday ? '✓ Comprovante anexado' : 'Anexar comprovante'}
              </Label>
            </div>
            
            <div className="flex items-start space-x-3 sm:space-x-3">
              <Checkbox 
                id="ja-incluido"
                checked={ja_incluido || isIncludedToday}
                onCheckedChange={(checked) => setJa_incluido(checked as boolean)}
                disabled={isIncludedToday}
                className="data-[state=checked]:bg-green-600 dark:data-[state=checked]:bg-green-500 data-[state=checked]:border-green-600 dark:data-[state=checked]:border-green-500 h-5 w-5 sm:h-5 sm:w-5 mt-0.5"
              />
              <Label htmlFor="ja-incluido" className="text-sm sm:text-sm flex items-start gap-2 sm:gap-2 cursor-pointer leading-normal">
                <Check className="h-4 w-4 sm:h-4 sm:w-4 flex-shrink-0 mt-0.5" />
                <span className="leading-relaxed">Depósito incluído na Tesouraria/P2K</span>
              </Label>
            </div>
          </div>
        </div>

        {/* Submit Button com melhor contraste no modo claro */}
        <Button
          onClick={handleSubmit}
          disabled={isSubmitting || isUploading || (hasDepositToday && hasReceiptToday && isIncludedToday)}
          className="w-full text-sm sm:text-sm h-11 sm:h-10 bg-primary hover:bg-primary/90 text-primary-foreground font-medium shadow-md hover:shadow-lg transition-all duration-200"
          size="lg"
        >
          {isSubmitting || isUploading ? (
            <>
              <Loader2 className="h-4 w-4 sm:h-4 sm:w-4 mr-2 animate-spin" />
              <span>Registrando...</span>
            </>
          ) : (
            <>
              <Check className="h-4 w-4 sm:h-4 sm:w-4 mr-2" />
              <span>{hasDepositToday ? "Atualizar Depósito" : "Registrar Depósito"}</span>
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
