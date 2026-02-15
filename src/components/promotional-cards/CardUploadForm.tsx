import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, CalendarIcon } from "lucide-react";
import { useFolders } from "@/hooks/useFolders";
import { CardImageUploader } from "./CardImageUploader";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

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

  // Formata o aspect ratio para exibição
  const getAspectRatioLabel = () => {
    if (!aspectRatio) return "";
    const labels: Record<string, string> = {
      "1:1": "Quadrado (1:1)",
      "3:4": "Retrato (3:4)",
      "4:5": "Retrato (4:5)"
    };
    return labels[aspectRatio] || "";
  };

  return (
    <form onSubmit={handleSubmit} className="stack-lg lg:grid-responsive-cards lg:gap-8 p-1">
      {/* Coluna da Esquerda: Upload de Imagem */}
      <div className="lg:col-span-1 flex flex-col items-center">
        <CardImageUploader
          previewUrl={previewUrl}
          handleFileChange={handleFileChange}
          removeImage={removeImage}
          isSubmitting={isSubmitting}
        />
        {aspectRatio && previewUrl && (
          <p className="text-xs text-muted-foreground mt-2 text-center">
            Formato detectado: <span className="font-medium text-foreground">{getAspectRatioLabel()}</span>
          </p>
        )}
      </div>

      {/* Coluna da Direita: Campos de Informação */}
      <div className="lg:col-span-2 flex flex-col gap-y-5">
                  <div className="grid-responsive-wide">
          <div className="space-y-1.5">
            <Label htmlFor="card-title" className="text-xs font-medium">Título</Label>
            <Input
              id="card-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Oferta Relâmpago"
              disabled={isSubmitting}
              className="h-9 text-sm"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="card-code" className="text-xs font-medium">Código</Label>
            <Input
              id="card-code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Ex: 123456"
              disabled={isSubmitting}
              className="h-9 text-sm"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs font-medium">Período de Validade</Label>
          <div className="grid-responsive-wide">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-full justify-start text-left font-normal h-9",
                    !startDate && "text-muted-foreground"
                  )}
                  disabled={isSubmitting}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {startDate ? format(startDate, "dd/MM/yyyy") : <span>Início</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar mode="single" selected={startDate} onSelect={setStartDate} initialFocus />
              </PopoverContent>
            </Popover>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-full justify-start text-left font-normal h-9",
                    !endDate && "text-muted-foreground"
                  )}
                  disabled={isSubmitting}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {endDate ? format(endDate, "dd/MM/yyyy") : <span>Fim</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar mode="single" selected={endDate} onSelect={setEndDate} disabled={(date) => startDate && date < startDate} initialFocus />
              </PopoverContent>
            </Popover>
          </div>
        </div>
        
        <div className="space-y-1.5">
          <Label htmlFor="card-folder" className="text-xs font-medium">Pasta de Destino</Label>
          <Select 
            value={folderId || "none"} 
            onValueChange={(value) => setFolderId(value === "none" ? null : value)}
            disabled={isSubmitting}
          >
            <SelectTrigger className="h-9 text-sm">
              <SelectValue placeholder="Selecione uma pasta (opcional)" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Nenhuma pasta</SelectItem>
              {folders.map((folder) => (
                <SelectItem key={folder.id} value={folder.id}>
                  {folder.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Botões de Ação */}
        {showActions && (
        <div className="flex justify-end gap-2 pt-4 border-t border-border mt-2">
          <Button
            type="button"
            variant="ghost"
            onClick={onCancel}
            disabled={isSubmitting}
            className="h-9"
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting || !previewUrl || !title}
            variant="success"
            className="h-9"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Salvando...
              </>
            ) : (
              'Salvar Card'
            )}
          </Button>
        </div>
        )}
      </div>
    </form>
  );
}
