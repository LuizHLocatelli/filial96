
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
  sector: "furniture" | "fashion";
  title: string;
  setTitle: (title: string) => void;
  code: string;
  setCode: (code: string) => void;
  promotionDate: Date | undefined;
  setPromotionDate: (date: Date | undefined) => void;
  folderId: string | null;
  setFolderId: (folderId: string | null) => void;
  previewUrl: string | null;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  removeImage: () => void;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  isSubmitting: boolean;
  onCancel: () => void;
}

export function CardUploadForm({
  sector,
  title,
  setTitle,
  code,
  setCode,
  promotionDate,
  setPromotionDate,
  folderId,
  setFolderId,
  previewUrl,
  handleFileChange,
  removeImage,
  handleSubmit,
  isSubmitting,
  onCancel
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
      
      <div className="space-y-2">
        <Label htmlFor="promotion-date" className={cn("text-xs sm:text-sm")}>Validade da Promoção</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              id="promotion-date"
              variant={"outline"}
              className={cn(
                "w-full justify-start text-left font-normal",
                !promotionDate && "text-muted-foreground",
                "text-xs sm:text-sm h-8 sm:h-10"
              )}
              disabled={isSubmitting}
            >
              <CalendarIcon className="mr-2 h-3.5 w-3.5" />
              {promotionDate ? format(promotionDate, "dd/MM/yyyy") : "Selecione uma data"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={promotionDate}
              onSelect={setPromotionDate}
              className={cn("p-3 pointer-events-auto")}
            />
          </PopoverContent>
        </Popover>
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
          disabled={isSubmitting || !previewUrl}
          className={cn("text-xs sm:text-sm h-8 sm:h-10")}
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
