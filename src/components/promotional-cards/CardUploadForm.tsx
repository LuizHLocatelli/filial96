import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, CalendarIcon, CheckCircle2, AlertCircle, ImageIcon } from "lucide-react";
import { useFolders } from "@/hooks/useFolders";
import { CardImageUploader } from "./CardImageUploader";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { Badge } from "@/components/ui/badge";

interface CardUploadFormProps {
  sector: "furniture" | "fashion" | "loan" | "service";
  title: string;
  setTitle: (title: string) => void;
  code: string;
  setCode: (code: string) => void;
  startDate: Date | undefined;
  setStartDate: (date: Date | undefined) => void;
  endDate: Date | undefined;
  setEndDate: (date: Date | undefined) => void;
  folderId: string | null;
  setFolderId: (folderId: string | null) => void;
  aspectRatio?: "1:1" | "3:4" | "4:5";
  previewUrl: string | null;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  removeImage: () => void;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  isSubmitting: boolean;
  onCancel: () => void;
  onSuccess?: () => void;
  showActions?: boolean;
}

export function CardUploadForm({
  sector,
  title,
  setTitle,
  code,
  setCode,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  folderId,
  setFolderId,
  aspectRatio,
  previewUrl,
  handleFileChange,
  removeImage,
  handleSubmit,
  isSubmitting,
  onCancel,
  showActions = true,
}: CardUploadFormProps) {
  const { folders } = useFolders(sector);
  const isMobile = useIsMobile();
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // Validações em tempo real
  const validations = useMemo(() => {
    const errors: Record<string, string> = {};
    const warnings: Record<string, string> = {};
    
    if (touched.title) {
      if (!title.trim()) {
        errors.title = "Título é obrigatório";
      } else if (title.length < 3) {
        errors.title = "Título deve ter pelo menos 3 caracteres";
      }
    }
    
    if (touched.code && code && code.length > 0) {
      if (!/^\d+$/.test(code)) {
        warnings.code = "Código deve conter apenas números";
      }
    }
    
    if (startDate && endDate) {
      if (endDate < startDate) {
        errors.dates = "Data final não pode ser anterior à data inicial";
      }
    }
    
    if (touched.image && !previewUrl) {
      errors.image = "Imagem é obrigatória";
    }
    
    return { errors, warnings, isValid: Object.keys(errors).length === 0 && title.trim().length >= 3 && previewUrl !== null };
  }, [title, code, startDate, endDate, previewUrl, touched]);

  const handleBlur = (field: string) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  };

  const getFieldStatus = (field: string) => {
    if (!touched[field]) return "neutral";
    if (validations.errors[field]) return "error";
    if (validations.warnings[field]) return "warning";
    return "success";
  };

  const formatDateDisplay = (date: Date | undefined) => {
    if (!date) return null;
    return format(date, "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Layout em grid para desktop */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Coluna Esquerda: Upload */}
        <div className="space-y-4">
          <CardImageUploader
            previewUrl={previewUrl}
            handleFileChange={(e) => {
              handleFileChange(e);
              setTouched(prev => ({ ...prev, image: true }));
            }}
            removeImage={() => {
              removeImage();
              setTouched(prev => ({ ...prev, image: true }));
            }}
            isSubmitting={isSubmitting}
            aspectRatio={aspectRatio}
          />
          
          {validations.errors.image && touched.image && (
            <p className="text-xs text-red-500 flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              {validations.errors.image}
            </p>
          )}
          
          {/* Indicador de formato */}
          {aspectRatio && previewUrl && (
            <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
              <Badge variant="secondary" className="font-mono">
                {aspectRatio}
              </Badge>
              <span>
                {aspectRatio === "1:1" && "Quadrado"}
                {aspectRatio === "3:4" && "Retrato (3:4)"}
                {aspectRatio === "4:5" && "Retrato (4:5)"}
              </span>
            </div>
          )}
        </div>

        {/* Coluna Direita: Informações */}
        <div className="space-y-5">
          {/* Seção: Informações Básicas */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs">1</div>
              Informações Básicas
            </div>
            
            {/* Título */}
            <div className="space-y-1.5">
              <Label htmlFor="card-title" className="text-sm flex items-center justify-between">
                <span>Título <span className="text-red-500">*</span></span>
                {getFieldStatus("title") === "success" && (
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                )}
              </Label>
              <Input
                id="card-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onBlur={() => handleBlur("title")}
                placeholder="Ex: Oferta Relâmpago - Sofá 3 Lugares"
                disabled={isSubmitting}
                className={cn(
                  "h-10",
                  getFieldStatus("title") === "error" && "border-red-500 focus-visible:ring-red-500",
                  getFieldStatus("title") === "success" && "border-green-500 focus-visible:ring-green-500"
                )}
              />
              {validations.errors.title && touched.title && (
                <p className="text-xs text-red-500 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {validations.errors.title}
                </p>
              )}
            </div>

            {/* Código */}
            <div className="space-y-1.5">
              <Label htmlFor="card-code" className="text-sm">
                Código do Produto
                <span className="text-xs text-muted-foreground ml-1">(opcional)</span>
              </Label>
              <Input
                id="card-code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                onBlur={() => handleBlur("code")}
                placeholder="Ex: 123456"
                disabled={isSubmitting}
                className={cn(
                  "h-10",
                  getFieldStatus("code") === "warning" && "border-yellow-500 focus-visible:ring-yellow-500"
                )}
              />
              {validations.warnings.code && touched.code && (
                <p className="text-xs text-yellow-600 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {validations.warnings.code}
                </p>
              )}
            </div>
          </div>

          {/* Divider */}
          <div className="h-px bg-border" />

          {/* Seção: Período de Validade */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs">2</div>
              Período de Validade
              <span className="text-xs text-muted-foreground font-normal">(opcional)</span>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Data de Início</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal h-10",
                        !startDate && "text-muted-foreground"
                      )}
                      disabled={isSubmitting}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                      {startDate ? (
                        <span className="text-sm">{format(startDate, "dd/MM/yy")}</span>
                      ) : (
                        <span>Selecionar</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar 
                      mode="single" 
                      selected={startDate} 
                      onSelect={setStartDate} 
                      initialFocus 
                    />
                  </PopoverContent>
                </Popover>
                {startDate && (
                  <p className="text-[10px] text-muted-foreground">
                    {formatDateDisplay(startDate)}
                  </p>
                )}
              </div>
              
              <div className="space-y-1.5">
                <Label className="text-xs">Data de Fim</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal h-10",
                        !endDate && "text-muted-foreground",
                        validations.errors.dates && "border-red-500 text-red-600"
                      )}
                      disabled={isSubmitting}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                      {endDate ? (
                        <span className="text-sm">{format(endDate, "dd/MM/yy")}</span>
                      ) : (
                        <span>Selecionar</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar 
                      mode="single" 
                      selected={endDate} 
                      onSelect={setEndDate} 
                      disabled={(date) => startDate ? date < startDate : false}
                      initialFocus 
                    />
                  </PopoverContent>
                </Popover>
                {endDate && (
                  <p className="text-[10px] text-muted-foreground">
                    {formatDateDisplay(endDate)}
                  </p>
                )}
              </div>
            </div>
            
            {validations.errors.dates && (
              <p className="text-xs text-red-500 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {validations.errors.dates}
              </p>
            )}
          </div>

          {/* Divider */}
          <div className="h-px bg-border" />

          {/* Seção: Pasta */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs">3</div>
              Organização
            </div>
            
            <div className="space-y-1.5">
              <Label htmlFor="card-folder" className="text-xs">Pasta de Destino</Label>
              <Select 
                value={folderId || "none"} 
                onValueChange={(value) => setFolderId(value === "none" ? null : value)}
                disabled={isSubmitting}
              >
                <SelectTrigger className="h-10">
                  <SelectValue placeholder="Selecione uma pasta (opcional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">
                    <div className="flex items-center gap-2">
                      <span>📁 Sem pasta</span>
                    </div>
                  </SelectItem>
                  {folders.map((folder) => (
                    <SelectItem key={folder.id} value={folder.id}>
                      <div className="flex items-center gap-2">
                        <span>📂</span>
                        {folder.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      {/* Botões de Ação */}
      {showActions && (
        <div className="flex flex-col sm:flex-row justify-end gap-3 pt-6 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
            className="h-10 w-full sm:w-auto"
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting || !validations.isValid}
            variant="success"
            className="h-10 w-full sm:w-auto"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <ImageIcon className="mr-2 h-4 w-4" />
                Salvar Card
              </>
            )}
          </Button>
        </div>
      )}
    </form>
  );
}
