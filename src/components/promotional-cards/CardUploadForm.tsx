
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

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="card-title">Título</Label>
        <Input
          id="card-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Digite o título do card promocional"
          disabled={isSubmitting}
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="card-code">Código</Label>
        <Input
          id="card-code"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Digite o código da promoção"
          disabled={isSubmitting}
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="promotion-date">Validade da Promoção</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              id="promotion-date"
              variant={"outline"}
              className={cn(
                "w-full justify-start text-left font-normal",
                !promotionDate && "text-muted-foreground"
              )}
              disabled={isSubmitting}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
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
        <Label htmlFor="card-folder">Pasta (opcional)</Label>
        <Select 
          value={folderId || "none"} 
          onValueChange={(value) => setFolderId(value === "none" ? null : value)}
          disabled={isSubmitting}
        >
          <SelectTrigger>
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
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting || !previewUrl}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
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
