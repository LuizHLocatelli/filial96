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
  previewUrl: string | null;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  removeImage: () => void;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  isSubmitting: boolean;
  onCancel: () => void;
  onSuccess?: () => void; // Added this optional prop
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
  previewUrl,
  handleFileChange,
  removeImage,
  handleSubmit,
  isSubmitting,
  onCancel,
  onSuccess
}: CardUploadFormProps) {
  const { folders } = useFolders(sector);
  const isMobile = useIsMobile();

  return (
    <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
      <div className="space-y-2">
        <Label htmlFor="card-title" className={cn("text-xs sm:text-sm")}>Título</Label>
        <Input
          id="card-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Digite o título do card promocional"
          disabled={isSubmitting}
          className={cn("text-xs sm:text-sm h-8 sm:h-10")}
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="card-code" className={cn("text-xs sm:text-sm")}>Código</Label>
        <Input
          id="card-code"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Digite o código da promoção"
          disabled={isSubmitting}
          className={cn("text-xs sm:text-sm h-8 sm:h-10")}
        />
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        <div className="space-y-2">
          <Label htmlFor="start-date" className={cn("text-xs sm:text-sm")}>Início da Vigência</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                id="start-date"
                variant={"outline"}
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !startDate && "text-muted-foreground",
                  "text-xs sm:text-sm h-8 sm:h-10"
                )}
                disabled={isSubmitting}
              >
                <CalendarIcon className="mr-2 h-3.5 w-3.5" />
                {startDate ? format(startDate, "dd/MM/yyyy") : "Selecione"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={startDate}
                onSelect={setStartDate}
                disabled={(date) => endDate ? date > endDate : false}
                className={cn("p-3 pointer-events-auto")}
              />
            </PopoverContent>
          </Popover>
        </div>
        <div className="space-y-2">
          <Label htmlFor="end-date" className={cn("text-xs sm:text-sm")}>Fim da Vigência</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                id="end-date"
                variant={"outline"}
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !endDate && "text-muted-foreground",
                  "text-xs sm:text-sm h-8 sm:h-10"
                )}
                disabled={isSubmitting}
              >
                <CalendarIcon className="mr-2 h-3.5 w-3.5" />
                {endDate ? format(endDate, "dd/MM/yyyy") : "Selecione"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={endDate}
                onSelect={setEndDate}
                disabled={(date) =>
                  date < (startDate || new Date(0)) || date < new Date()
                }
                className={cn("p-3 pointer-events-auto")}
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="card-folder" className={cn("text-xs sm:text-sm")}>Pasta (opcional)</Label>
        <Select 
          value={folderId || "none"} 
          onValueChange={(value) => setFolderId(value === "none" ? null : value)}
          disabled={isSubmitting}
        >
          <SelectTrigger className={cn("text-xs sm:text-sm h-8 sm:h-10")}>
            <SelectValue placeholder="Selecione uma pasta (opcional)" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none" className={cn(isMobile && "text-xs")}>Nenhuma pasta</SelectItem>
            {folders.map((folder) => (
              <SelectItem key={folder.id} value={folder.id} className={cn(isMobile && "text-xs")}>
                {folder.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <CardImageUploader
        previewUrl={previewUrl}
        handleFileChange={handleFileChange}
        removeImage={removeImage}
        isSubmitting={isSubmitting}
      />
      
      <div className="flex justify-end gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
          className={cn("text-xs sm:text-sm h-8 sm:h-10")}
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          variant="success"
          disabled={isSubmitting || !previewUrl}
          className={cn("!bg-brand-green-600 !text-white text-xs sm:text-sm h-8 sm:h-10 disabled:!opacity-75")}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
              Criando...
            </>
          ) : (
            'Criar Card'
          )}
        </Button>
      </div>
    </form>
  );
}
